/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Catalogue.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Map
 * The Geoportal framework.
 * Class which must be instanciated to create a map. This is the
 * central class of the API. Use its methods to add layers and to
 * configure your map.
 *
 * Inherits from:
 * - <OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>
 */
Geoportal.Map= OpenLayers.Class( OpenLayers.Map, {

    /**
     * Property: catalogue
     * {<Geoportal.Catalogue>} The layers' catalogue.
     */
    catalogue: null,

    /**
     * APIProperty: beforeOnBeforeMove
     * {Function} Called before the callback attached to "beforemove" event is
     * processed. This function expects an {Event} object.
     *      The event holds the following properties :
     *      * lonlat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>}
     *        the new center to target. May be modified.
     *      * zoom - {Number} the new zoom to target. May be modified.
     *      * options - {Object} holds dragging, forceZoomChange, noEvent, caller
     */
    beforeOnBeforeMove: function(e) {},

    /**
     * APIProperty: afterOnBeforeMove
     * {Function} Called before the callback attached to "beforemove" event is
     * terminated. This function expects an {Event} object.
     *      The event holds the following properties :
     *      * lonlat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>}
     *        the new center to target. May be modified.
     *      * zoom - {Number} the new zoom to target. May be modified.
     *      * options - {Object} holds dragging, forceZoomChange, noEvent, caller
     */
    afterOnBeforeMove: function(e) {},

    /**
     * Constructor: Geoportal.Map
     * Generates an empty map with the Geoportal Logo.
     *
     * Parameters:
     * div - {String} Id of the DIV tag in which you want
     *       to insert your map.
     *       Default is "GeoportalMapDiv".
     * options - {Object} Optional object with properties to
     *       tag onto the map.
     *       Supported options are :
     *       * controls - {Array({<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>})},
     *       * projection - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} | {String},
     *       * displayProjection - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} | {String},
     *       * proxy - {String},
     *       * catalogue - {Object},
     *       * apiKey  - {Array({String})}
     */
    initialize: function(div, options) {
        OpenLayers.Map.prototype.initialize.apply(this,arguments);

        //cursor:
        if (this.cursor) {
            this.setCursor(this.cursor);
        }

        //default proxy :
        if (this.proxy) {
            this.setProxyUrl(this.proxy);
        }

        this.events.register("beforemove", this, this.onBeforeMove);
        this.events.register("changebaselayer", this, this.changeBaseLayer);
        this.events.register("changedisplayprojection", this, this.changeDisplayProjection);
        this.events.register("addlayer", this, this.sortLayers);
        this.events.register("changelayer", this, this.updateZoomLevels);

        if (this.catalogue) {
            this.catalogue.map= this;
        }
        //get contract capabilities:
        this.setKeys();

        var cntrls= this.getControlsByClass('Geoportal.Control.PermanentLogo');
        if (cntrls==null || cntrls.length==0) {
            this.addControl(new Geoportal.Control.PermanentLogo());
        }
        cntrls= this.getControlsByClass('Geoportal.Control.TermsOfService');
        if (cntrls==null || cntrls.length==0) {
            this.addControl(new Geoportal.Control.TermsOfService());
        }
    },

    /**
     * APIMethod: sortLayers
     * Sorts layers array by z-index
     *
     */
    sortLayers: function() {
        // on trie les layers par z-index
        this.layers.sort(function(l1,l2) {
          var z1= l1.div.style.zIndex ;
          var z2= l2.div.style.zIndex ;
          if (!z1 && !z2) return 0 ;
          if (!z1) return -1 ;
          if (!z2) return 1 ;
          if (z1 < z2) return -1 ;
          if (z1==z2) return 0 ;
          return 1 ;
        }) ;
    },


    /**
     * APIMethod: moveLayerUp
     * Moves layer whose name is lname up into the layer stack 
     * (from a user point of view).
     * Parameters:
     * lname - {String} the name of the layer to move up.
     * Returns:
     * {Boolean} true if layer could be moved, false otherwise.
     *
     */
    moveLayerUp: function (lname) {
        var i, n;
        var lastlayer= null;
        var orderCanBeChanged= false;
        var layersTemp= this.layers;
        n= layersTemp.length;
        var layer= this.getLayersByName(lname)[0] ;
        if (!layer) return ;
        var layerRank= layersTemp.indexOf(layer) ;
        var skipdILStest = false;
        for (var i= layerRank+1; i<n; i++) {
            if (layersTemp[i].isBaseLayer || (!layersTemp[i].displayInLayerSwitcher && !skipdILStest)) {
                continue;
            }

            //is the next the same (same name, different territory)
            if (i+1!=n && layersTemp[i].name==layersTemp[i+1].name){
                skipdILStest = true;
                continue;
            }

            orderCanBeChanged= true;
            lastlayer= layersTemp[i];//layer to switch with
            var zIndexTemp= lastlayer.getZIndex();
            lastlayer.setZIndex(layer.getZIndex());
            layer.setZIndex(zIndexTemp);
            break;
        }
        if (orderCanBeChanged) {
            layersTemp[layerRank]= lastlayer;
            layersTemp[i]= layer;
            // we inform that order has changed (cf. RootContainer) 
            this.events.triggerEvent("changelayer", {
                layer: lastlayer,
                property: 'order'
            });
            this.events.triggerEvent("changelayer", {
                layer: layer,
                property: 'order'
            });
        }
        return orderCanBeChanged ;
    },



    /**
     * APIMethod: moveLayerDown
     * Moves layer whose name is lname down into the layer stack 
     * (from a user point of view).
     * Parameters:
     * lname - {String} the name of the layer to move down
     * Returns:
     * {Boolean} true if layer could be moved, false otherwise.
     *
     */
    moveLayerDown: function (lname) {
        var i, n;
        var lastlayer= null;
        var orderCanBeChanged= false;
        var layersTemp= this.layers;
        n= layersTemp.length;
        var layer= this.getLayersByName(lname)[0] ;
        if (!layer) return ;
        var layerRank= layersTemp.indexOf(layer) ;
        var skipdILStest = false;
        for (i= layerRank-1; i>=1; i--) {
            if (layersTemp[i].isBaseLayer || (!layersTemp[i].displayInLayerSwitcher && !skipdILStest)) {
                continue;
            }
            //is the next the same (same name, different territory)
            if (i!=1 && layersTemp[i].name==layersTemp[i-1].name){
                skipdILStest = true;
                continue;
            }
            orderCanBeChanged= true;
            lastlayer= layersTemp[i];//layer to switch with
            var zIndexTemp= lastlayer.getZIndex();
            lastlayer.setZIndex(layer.getZIndex());
            layer.setZIndex(zIndexTemp);
            break;
        }
        if (orderCanBeChanged) {
            layersTemp[layerRank]= lastlayer;
            layersTemp[i]= layer;
            // we inform that order has changed (cf. RootContainer) 
            this.events.triggerEvent("changelayer", {
                layer: lastlayer,
                property: 'order'
            });
            this.events.triggerEvent("changelayer", {
                layer: layer,
                property: 'order'
            });
        }
        return orderCanBeChanged ;
    },


    /**
     * APIMethod: setKeys
     * Assigns API keys to the map.
     *
     * Parameters:
     * options - {Object} supports the following options:
     *      * apiKey - {Array({String}) | {String}} the API's keys;
     *      * "key" - {Object} API's key description :
     *          * tokenServer - {String} the GeoDRM service;
     *          * tokenTimeOut - {Integer} the GeoDRM service's time out in
     *          milliseconds;
     *          * transport - {String} optional, defaults to 'json';
     *          * bounds - {Array({Number})} optional, key's extent in
     *          longitude,
     *          latitude;
     *          * resources - {Object} allowed resources for this key :
     *              * name - {String} resource name;
     *              * url - {String} resource service url;
     *              * type - {String} resource type (WMSC, WMS, ...).
     *          The resource identifier are the concatenation of resource's
     *          name, ':' and resource's type.
     *          * allowedGeoportalLayers - {Array({String})} array of
     *          resources' identifier for this key.
     *      * services - {Object} optional, capabilities of services needed by
     *      resource.
     */
    setKeys: function(options) {
        if (options) {
            if (options.apiKey) {
                this.apiKey= options.apiKey.slice(0);
            }
            if (this.catalogue) {
                this.catalogue.setKeys(options);
            }
        }
        //get contract capabilities:
        if (this.catalogue && this.apiKey) {
            var k;
            this.allowedGeoportalLayers= [];
            for (var i= 0, l= this.apiKey.length; i<l; i++) {
                k= this.apiKey[i];
                if (this.catalogue[k] && this.catalogue[k].allowedGeoportalLayers) {
                    for (var ic= 0, lc= this.catalogue[k].allowedGeoportalLayers.length; ic<lc; ic++) {
                        this.allowedGeoportalLayers.push(this.catalogue[k].allowedGeoportalLayers[ic]);
                    }
                }
            }
        }
    },

    /**
     * APIMethod: render
     * Render the map to a specified container.
     *
     * Parameters:
     * div - {String|DOMElement} The container that the map should be rendered
     *     to. If different than the current container, the map viewport
     *     will be moved from the current to the new container.
     */
    render: function(div) {
        if (this.application) {
            this.application.render(div);
        } else {
            OpenLayers.Map.prototype.render.apply(this,[div]);
        }
    },

    /**
     * APIMethod: destroy
     * Destroy this map
     */
    destroy: function() {
        this.displayProjection= null;
        if (this.catalogue) {
            if (this.apiKey) {
                var k;
                for (var i= 0, l= this.apiKey.length; i<l; i++) {
                    k= this.apiKey[i];
                    if (this.catalogue[k]) {
                        this.catalogue[k].bounds= null;
                        for (var ly in this.catalogue[k].layers) {
                            if (this.catalogue[k].layers.hasOwnProperty(ly)) {
                                this.catalogue[k].layers[ly]= null;
                            }
                        }
                        this.catalogue[k].layers= null;
                        this.catalogue[k]= null;
                    }
                }
            }
            this.catalogue.destroy();
            this.catalogue= null;
            this.allowedGeoportalLayers= null;
        }
        this.events.unregister("changelayer",this,this.updateZoomLevels);
        this.events.unregister("changedisplayprojection",this,this.changeDisplayProjection);
        this.events.unregister("changebaselayer",this,this.changeBaseLayer);
        this.events.unregister("beforemove", this, this.onBeforeMove);

        OpenLayers.Map.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: onBeforeMove
     * Checks if we need to change baseLayer when changing zoom or center.
     *      Listener to "beforemove" map's event.
     *
     * Parameters:
     * evt - {Event} "beforemove" event.
     *
     * Context:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>} the current map.
     * lonlat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} the new center to target. May be modified.
     * zoom - {Number} the new zoom to target. May be modified.
     * options - {Object} holds dragging, forceZoomChange, noEvent, caller
     *
     * Returns:
     * {Boolean} true to keep on propagating event, false to stop.
     */
    onBeforeMove: function(evt) {
        this.beforeOnBeforeMove(evt);
        var zoomChanged= evt.options.forceZoomChange ||
                        ((this.isValidZoomLevel(evt.zoom)) && (evt.zoom != this.getZoom()));
        var resol= (this.getProjection()
                    ? this.getProjection().getProjName()=='longlat'? 0.000028:1.0
                    : undefined);
        //isValidLonLat() returns false when point is out of maxExtent or point is null ...
        var centerChanged= !(evt.lonlat==null || (this.isValidLonLat(evt.lonlat) && evt.lonlat.equals(this.center,resol)));
        if ((zoomChanged || centerChanged) && this.baseLayer) {
            var deltaZ= evt.zoom -
                       (this.center==null? // not yet initialized, zoom==0 at map creation ...
                            this.baseLayer.minZoomLevel
                        :   this.getZoom());
            var crsCenter=
                evt.lonlat?
                    evt.lonlat.clone()
                :
                    this.center;
            if (!crsCenter && this.size) {
                var centerPx= new OpenLayers.Pixel(this.size.w/2, this.size.h/2);
                crsCenter= this.getLonLatFromViewPortPx(centerPx);
            }
            if (!crsCenter) {
                crsCenter= this.getMaxExtent().getCenterLonLat();
            }
            var zoomToBaselayer=
                ((deltaZ<0 && typeof(this.baseLayer.minZoomLevel)=='number' && evt.zoom<this.baseLayer.minZoomLevel)
                 ||
                 (deltaZ>0 && typeof(this.baseLayer.maxZoomLevel)=='number' && evt.zoom>this.baseLayer.maxZoomLevel));
            var centerToBaselayer=
                (crsCenter && !this.baseLayer.maxExtent.containsLonLat(crsCenter,false));
            if (zoomToBaselayer || centerToBaselayer) {
                // take first base layer that complies with criteria ...
                for (var i= 0, len= this.getNumLayers(); i<len; i++) {
                    var bLayer= this.layers[i];
                    if (!bLayer.isBaseLayer || bLayer==this.baseLayer) {
                        continue;
                    }
                    if ((zoomToBaselayer &&
                         ((
                           (deltaZ<0 && typeof(bLayer.minZoomLevel)=='number' && bLayer.minZoomLevel<=evt.zoom)
                          ||
                           (deltaZ>0 && typeof(bLayer.maxZoomLevel)=='number' && evt.zoom<=bLayer.maxZoomLevel)
                          )))
                        ||
                        centerToBaselayer) {
                        // does this baselayer contain the center of the map ?
                        // WARNING: use the projection property and not the nativeProjection!
                        var lproj= bLayer.projection;
                        var lprojCenter= crsCenter.clone();
                        var dov= bLayer.maxExtent;
                        if (!dov) {
                            if (lproj.domainOfValidity) {
                                dov= lproj.domainOfValidity.clone();
                                dov.transform(OpenLayers.Projection.CRS84, lproj);
                            }
                        }
                        if (dov) {
                            lprojCenter.transform(this.getProjection(), lproj);
                            if (dov.containsLonLat(lprojCenter,false)) {
                                if ((centerToBaselayer || evt.lonlat) && !zoomToBaselayer) {
                                    if (typeof(bLayer.maxZoomLevel)=='number' && evt.zoom>bLayer.maxZoomLevel) {
                                        evt.zoom= bLayer.maxZoomLevel;
                                    } else if (typeof(bLayer.minZoomLevel)=='number' && evt.zoom<bLayer.minZoomLevel) {
                                        evt.zoom= bLayer.minZoomLevel;
                                    }
                                }
                                this.setBaseLayer(bLayer,crsCenter,evt.zoom);
                                return false;
                            }
                        }
                        lprojCenter= null;
                    }
                }
            }
            // no candidate ...
            // check zoom level with current base layer :
            if (zoomChanged) {
                if (evt.zoom<this.baseLayer.minZoomLevel) {
                    evt.zoom= this.baseLayer.minZoomLevel;
                }
                if (evt.zoom>this.baseLayer.maxZoomLevel) {
                    evt.zoom= this.baseLayer.maxZoomLevel;
                }
            }
            // check center with current base layer :
            if (centerChanged) {
                if (centerToBaselayer) {
                    evt.lonlat= this.center? this.center.clone():null;
                }
            }
        }
        this.afterOnBeforeMove(evt);
        return true;
    },

    /**
     * APIMethod: changeBaseLayer
     * Puts the config from baseLayer to map.
     *
     * Parameters:
     * evt - {Event} "changebaselayer" event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     */
    changeBaseLayer: function(evt) {
        if (!evt) { return; }
        if (!evt.layer) { return; }
        //OpenLayers.Console.log((evt.baseLayer? evt.baseLayer.name : '(none)')+' -> '+evt.layer.name);
        evt.layer.visibility= !(evt.layer instanceof Geoportal.Layer);//Geoportal BaseLayer to false
        this.resolutions= evt.layer.resolutions;
        this.projection= evt.layer.getNativeProjection().getCode();
        this.units= evt.layer.getNativeProjection().getUnits();
        if (!this.displayProjection) {
            this.displayProjection=
                evt.layer.displayProjection?
                    evt.layer.displayProjection.clone()
                :   evt.layer.getNativeProjection().clone();
        }
    },

    /**
     * APIMethod: changeDisplayProjection
     * Assigns the display projection to <Geoportal.Viewer.displayProjection>
     * when the "changedisplayprojection" event is fired.
     *
     * Parameters:
     * evt - {Event} event fired
     *     evt.displayProjection holds the new projection
     */
    changeDisplayProjection: function(evt) {
        if (evt) {
            this.displayProjection= evt.displayProjection;
        }
    },

    /**
     * APIMethod: setLocale
     * Assigns the current language and fires "changelang" event.
     *
     * Parameters:
     * lang - {String} the language to set
     */
    setLocale: function(lang) {
        OpenLayers.Lang.setCode(lang);
        this.events.triggerEvent("changelang",{'lang':lang});
    },

    /**
     * APIMethod: isMapReady
     * Checks whether the map's div is rendered or not.
     *
     * Returns:
     * {Boolean} true if ready, false otherwise.
     */
    isMapReady: function() {
        return true;
    },

    /**
     * APIMethod: zoomToLonLatExtent
     * Zoom to the passed in geographical bounds, recenter.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} the bounding box expressed in
     *     geographical coordinates.
     * closest - {Boolean} Find the zoom level that most closely fits the
     *     specified bounds. Note that this may result in a zoom that does
     *     not exactly contain the entire extent.
     *     Default is false.
     */
    zoomToLonLatExtent: function(bounds, closest) {
        var center= bounds.getCenterLonLat();
        center= center.transform(OpenLayers.Projection.CRS84, this.getProjection());
        var bbox= bounds.clone().transform(OpenLayers.Projection.CRS84, this.getProjection(), true);
        if (this.baseLayer.wrapDateLine) {
            var maxExtent= this.getMaxExtent();

            //fix straddling bounds (in the case of a bbox that straddles the
            // dateline, it's left and right boundaries will appear backwards.
            // we fix this by allowing a right value that is greater than the
            // max value at the dateline -- this allows us to pass a valid
            // bounds to calculate zoom)
            //
            bbox= bbox.clone();
            while (bbox.right < bbox.left) {
                bbox.right+= maxExtent.getWidth();
            }
            //if the bounds was straddling (see above), then the center point
            // we got from it was wrong. So we take our new bounds and ask it
            // for the center. Because our new bounds is at least partially
            // outside the bounds of maxExtent, the new calculated center
            // might also be. We don't want to pass a bad center value to
            // setCenter, so we have it wrap itself across the date line.
            //
            center= bbox.getCenterLonLat().wrapDateLine(maxExtent);
        }
        var zoom= this.getZoomForExtent(bbox, closest) || 0;
        this.setCenter(center, zoom);
    },

    /**
     * APIMethod: setCenter
     * Defines the center position of the map and the zoom level.
     * Uses OpenLayers.LonLat objects. Coordinates are expressed in map's
     * projection coordinates system.
     *
     * Parameters:
     * position - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} the new longitude and latitude.
     * zoom - {Integer} the new zoom level (between 0 and 21).
     * dragging - {Boolean} Specifies whether or not to trigger
     *                      movestart/end events
     * forceZoomChange - {Boolean} Specifies whether or not to trigger zoom
     *                             change events (needed on baseLayer change)
     *
     * TBD: reconsider forceZoomChange in 3.0
     */
    setCenter: function(position, zoom, dragging, forceZoomChange) {
        if (typeof(zoom)=='number') {
            if (typeof(this.minZoomLevel)=='number' && zoom<this.minZoomLevel) {zoom= this.minZoomLevel;}
            if (typeof(this.maxZoomLevel)=='number' && zoom>this.maxZoomLevel) {zoom= this.maxZoomLevel;}
        } else {
            zoom= this.getZoom();
        }
        OpenLayers.Map.prototype.setCenter.apply(this,[position, zoom, dragging, forceZoomChange]);
    },

    /**
     * Method: setLonLatCenter
     * Defines the center position of the map and the zoom level.
     * Coordinates are expressed in map's projection coordinates system.
     *
     * Parameters:
     * lon - {Integer} the new longitude (in meters).
     * lat - {Integer} the new latitude (in meters).
     * zoom - {Integer} the new zoom level (between 0 and 20).
     * dragging - {Boolean} Specifies whether or not to trigger
     *                      movestart/end events
     * forceZoomChange - {Boolean} Specifies whether or not to trigger zoom
     *                             change events (needed on baseLayer change)
     *
     * TBD: reconsider forceZoomChange in 3.0
     */
    setLonLatCenter: function(lon, lat, zoom, dragging, forceZoomChange) {
        var lonlat= new OpenLayers.LonLat(lon, lat);
        if (lonlat) {
            this.setCenter(lonlat, zoom, dragging, forceZoomChange);
        }
    },

    /**
     * APIMethod: setCenterAtLonLat
     * Defines the center position in longitude, latitude
     * of the map and the zoom level. It is assumed that
     * any geographic coordinates system compatible with
     * WGS84 can be used for longitudes and latitudes.
     *
     * Parameters:
     * lon - {Number|String} the longitude in decimal degrees.
     *      If lon is a {String}, it is a sexagecimal value
     *      (See <Geoportal.Util.dmsToDeg>).
     * lat - {Number|String} the new latitude in decimal degrees
     *      If lat is a {String}, it is a sexagecimal value
     *      (See <Geoportal.Util.dmsToDeg>).
     * zoom - {Integer} the new zoom level.
     */
    setCenterAtLonLat: function(lon, lat, zoom, dragging, forceZoomChange) {
        if (typeof(lon)=='string') {
            lon= Geoportal.Util.dmsToDeg(lon);
        }
        if (typeof(lat)=='string') {
            lat= Geoportal.Util.dmsToDeg(lat);
        }
        var lonlat= new OpenLayers.LonLat(lon, lat);
        if (lonlat) {
            lonlat.transform(OpenLayers.Projection.CRS84, this.getProjection());
            this.setCenter(lonlat, zoom, dragging, forceZoomChange);
        }
    },

    /**
     * APIMethod: setCenterAtLocation
     * Center the map at the given placename or address.
     *
     * Parameters:
     * options - {Object} Available options are :
     *      * place - {String} place's name;
     *      * address - {String} location in term of "street,zip code,place";
     *      * defaultCenter - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} the center to go if
     *      something fails;
     *      * onSuccess - {Function} callback to call upon receiving response.
     *      Default callback is provided by this method : it takes the first
     *      object of the response. Expects one argument
     *      {<OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html>};
     *      * onFailure - {Function} callback to call when an error happened.
     *      Default callback is provided by this method : it just calls
     *      onComplete function. Expects one argument {<OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html>};
     *      * onComplete - {Function} callback to call after onSuccess or on
     *      onFailure callbacks have been called. Intend to call afterCentered
     *      function. Default callback is provided by this method : it centers
     *      the map, then converts the response to string, adds label and
     *      description options to the viewer and then calls afterCentered
     *      function;
     *      * afterCentered - {Function} after centering, call this function in
     *      the context of the map;
     *      * zoom - {Number} the zoom to get (optional).
     */
    setCenterAtLocation: function(options) {
        options= options || {};
        var gnLayer= null;
        var newZoom= options.zoom || undefined;
        var lyrId= null;
        var Ls= null;
        var self= this;
        var center= null;
        var olsOpts= {
            isGeonames: true,
            maximumResponses: 10,
            formatOptions: {
                version:'1.0'
            },
            requestOptions: {
                method:'GET'
            }
        };
        // utility functions :
        // clean geonames/address if needed and center :
        var _fcln= options.onComplete || function() {
            if (gnLayer) { gnLayer.destroy(); }
            if (!center) { center= options.defaultCenter };
            if (center) {
                self.setCenter(center, newZoom);
                if (options.afterCentered) {
                    if (arguments.length>0) {
                        var f= arguments[0];
                        var viewer= self.getApplication();
                        viewer.options= viewer.options || {};
                        var ga= f.attributes.address;
                        //var lbl= olsOpts.isGeonames? options.place : options.address;
                        var lbl= OpenLayers.i18n((olsOpts.isGeonames?
                                'gpControlLocationUtilityServiceGeoNames'
                            :   'gpControlLocationUtilityServiceGeocode')+
                            '.name');
                        var dsc= ga.toHTMLString();
                        OpenLayers.Util.applyDefaults(viewer.options, {
                            label:lbl,
                            description:dsc
                        });
                    }
                    options.afterCentered.apply(self,[]);
                }
            }
            return;
        };
        // clean center :
        var _fonf= options.onFailure || function(r) {
            center= null;
            _fcln();
            return;
        };
        // process responses :
        var _fons= options.onSuccess || function(r) {
            if (!this.queriedAddresses) {
                _fonf(r);
                return;
            }
            var fs= this.queriedAddresses[0].features;
            if (!fs) {
                _fonf(r);
                return;
            }
            // sort by geoname's type and response accuracy :
            if (this.isGeonames) {
                fs.sort(Geoportal.Control.LocationUtilityService.GeoNames.orderBDNyme);
            }
            center= new OpenLayers.LonLat(fs[0].geometry.x,fs[0].geometry.y);
            if (!newZoom) {
                if (this.isGeonames) {
                    newZoom= Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme(fs[0]);
                } else {
                    newZoom= Geoportal.Control.LocationUtilityService.Geocode.prototype.setZoom.apply(this,[fs[0]]);
                }
            }
            _fcln(fs[0]);
            return;
        };
        lyrId= 'PositionOfInterest:OPENLS;Geocode';
        if (options.place && this.catalogue.getLayerGeoRMKey(null,lyrId)) {// placename
            var a= null;
            var v= OpenLayers.String.trim(options.place);
            if (v!='') {
                a= new Geoportal.OLS.Address('PositionOfInterest');
                a.name= v;
                Ls= this.getLayersByName(lyrId);
                if (Ls && Ls.length>0) {
                    Ls[0].destroy();
                }
                Ls= null;
                gnLayer= new Geoportal.Layer.OpenLS.Core.LocationUtilityService(lyrId, olsOpts);
                this.addLayer(gnLayer);
                gnLayer.GEOCODE(
                    [a],
                    {
                        onSuccess: _fons,
                        onFailure: _fonf,
                        scopeOn:gnLayer
                    });
                a.destroy();
                a= null;
                return;//callbacks will take place ...
            }
        }
        lyrId= 'StreetAddress:OPENLS;Geocode';
        olsOpts.isGeonames= false;
        if (options.address && this.catalogue.getLayerGeoRMKey(null,lyrId)) {// geocoding
            var a= null;
            // Retrieve street, city and postal code :
            var scp= options.address.split(',');
            // last one is city
            // before-last is postal code if more than 2 fields
            // all other fields are joined for street
            if (scp.length>1) {
                var city= OpenLayers.String.trim(scp.pop());
                if (city.length>0) {
                    var pc= '';
                    if (scp[scp.length-1].match(/[0-9]{5}/)) {
                        pc= OpenLayers.String.trim(scp.pop());
                    }
                    var s= new Geoportal.OLS.Street();
                    s.name= OpenLayers.String.trim(scp.join(','));
                    var sa= new Geoportal.OLS.StreetAddress();
                    sa.addStreet(s);
                    a= new Geoportal.OLS.Address('StreetAddress');
                    a.streetAddress= sa;
                    var p= new Geoportal.OLS.Place({
                        'classification':'Municipality',
                        'name':city
                    });
                    a.addPlace(p);
                    a.postalCode= new Geoportal.OLS.PostalCode({'name':pc});
                    Ls= this.getLayersByName(lyrId);
                    if (Ls && Ls.length>0) {
                        Ls[0].destroy();
                    }
                    Ls= null;
                    gnLayer= new Geoportal.Layer.OpenLS.Core.LocationUtilityService(lyrId, olsOpts);
                    this.addLayer(gnLayer);
                    gnLayer.GEOCODE(
                        [a],
                        {
                            onSuccess: _fons,
                            onFailure: _fonf,
                            scopeOn:gnLayer
                        });
                    a.destroy();
                    a= null;
                    return;//callbacks will take place ...
                }
            }
        }
    },

    /**
     * APIMethod: setCenterAtGeolocation
     * Center the map based on the geolocation feature of the browser.
     *
     * Parameters:
     * options - {Object} Available options are :
     *      * enableHighAccuracy - {Boolean} provides a hint that the
     *      application would like to receive the best possible results. This
     *      may result in slower response times or increased power
     *      consumption. The user might also deny this capability, or the
     *      device might not be able to provide more accurate results than if
     *      the flag wasn't specified. The intended purpose of this attribute
     *      is to allow applications to inform the implementation that they do
     *      not require high accuracy geolocation fixes and, therefore, the
     *      implementation can avoid using geolocation providers that consume
     *      a significant amount of power (e.g. GPS). This is especially
     *      useful for applications running on battery-powered devices, such
     *      as mobile phones ;
     *      * timeout - {Integer} denotes the maximum length of time (expressed
     *      in milliseconds) that is allowed to pass from the call to getting
     *      the position until the corresponding position is acquired.
     *      * maximumAge - {Integer} indicates that the application is willing
     *      to accept a cached position whose age is no greater than the
     *      specified time in milliseconds. If maximumAge is set to 0, the
     *      implementation must immediately attempt to acquire a new position
     *      object ;
     *      * defaultCenter - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} the center to go if
     *      something fails ;
     *      * onSuccess - {Function} callback to call upon receiving response.
     *      Default callback is provided by this method : it takes the first
     *      object of the response. Expects one argument {<position>};
     *      * onFailure - {Function} callback to call when an error happened.
     *      Default callback is provided by this method : it just calls
     *      onComplete function. Expects one argument {String};
     *      * onComplete - {Function} callback to call after onSuccess or on
     *      onFailure callbacks have been called. Intend to call afterCentered
     *      function. Default callback is provided by this method : it centers
     *      the map, then converts the response to string, adds label and
     *      description options to the viewer and then calls afterCentered
     *      function;
     *      * afterCentered - {Function} after centering, call this function in
     *      the context of the map.
     */
    setCenterAtGeolocation: function(options) {
        options= options || {};
        var newZoom= undefined;
        var center= null;
        // utility functions :
        // clean geolocation if needed and center :
        var _fcln= options.onComplete || function() {
            if (!center) { center= options.defaultCenter };
            if (center) {
                this.setCenter(center, newZoom);
                if (options.afterCentered) {
                    options.afterCentered.apply(this,[]);
                }
            }
            return;
        };
        // clean center :
        var _fonf= options.onFailure || function(e) {
            center= null;
            _fcln.apply(this,[]);
            return;
        };
        // process responses :
        var _fons= options.onSuccess || function(p) {
            center= (new OpenLayers.LonLat(p.coords.longitude, p.coords.latitude))
                    .transform(OpenLayers.Projection.CRS84, this.getProjection());
            newZoom= options.zoom || 10;
            _fcln.apply(this,[]);
            return;
        };
        if (navigator.geolocation) {// geolocation
            var geoOptions= {
                'enableHighAccuracy': options.enableHighAccuracy || false,
                'timeout'           : options.timeout || 10000,
                'maximumAge'        : options.maximumAge || 0
            };
            navigator.geolocation.getCurrentPosition(
                OpenLayers.Function.bind(_fons,this),
                OpenLayers.Function.bind(_fonf,this),
                geoOptions
            );
            return;//callbacks will take place ...
        }
        // FF3.5-, Opera 10.6-, Safari 5-, IE9- no support for geolocation :
        _fonf.apply(this,[]);
    },

    /**
     * APIMethod: setCursor
     * Set the cursor CSS rule on the map.
     *
     * Parameters:
     * r - {String} the CSS rule. Can be 'auto', 'nw-resize', 'crosshair',
     *              'n-resize', 'default', 'se-resize', 'pointer',
     *              'sw-resize', 'move', 's-resize', 'e-resize', 'w-resize',
     *              'ne-resize', 'text', 'help', 'wait', 'inherit',
     *              'url(myncursor.cur)', 'url(myncursor.csr)' or a
     *              comma-separated list of these values.
     */
    setCursor: function(r) {
        this.div.style.cursor= r;
    },

    /**
     * APIMethod: setProxyUrl
     * Defines the URL of the proxy to use for the AJAX requests
     * (needed for WFS, KML, GPX, ... resources).
     *
     * Parameters:
     * url - {String} the proxy URL.
     */
    setProxyUrl: function(url) {
        OpenLayers.Request.setProxyUrl(url);
    },

    /**
     * APIMethod: setApplication
     * Assign the map's context (Geoportal.Viewer).
     *
     * Parameters:
     * appl - {<Geoportal.Viewer>} the application hosting the map.
     */
    setApplication: function(appl) {
        this.application= appl;
    },

    /**
     * APIMethod: getApplication
     * Return the map's context (Geoportal.Viewer).
     *
     * Retuns:
     * {<Geoportal.Viewer>} the application hosting the map.
     */
    getApplication: function() {
        return this.application;
    },

    /**
     * APIMethod: getPopupDefaults
     * Builds popup feature default behaviours for select, unselect and hover
     * callbacks.
     *      The API values are :
     *      * onSelect : <Geoportal.Control.selectFeature> for KML, GPX, OSM
     *                   <Geoportal.Control.hoverFeature> for WFS
     *      * onUnselect : <Geoportal.Control.unselectFeature>
     *      * hover : false for KML, GPX, OSM
     *                true for WFS
     *      * toggle : true for KML, GPX, OSM
     *                 false for WFS
     *      * other values are default values of
     *      <OpenLayers.Control.SelectFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/SelectFeature-js.html> :
     *          * mutipleKey : null
     *          * toggleKey : null
     *          * mutiple : false
     *          * clickout : true
     *          * highlightOnly : false
     *          * box : false
     *          * onBeforeSelect : function() {}
     *          * scope : null
     *          * geometryTypes : null
     *          * callbacks : null
     *          * handlersOptions : null
     *          * renderIntent : "select"
     *      * from <OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html> :
     *          * autoActivate : false
     *
     * Parameters:
     * t - {String} Type of layer supporting the popups (KML, GPX, WFS).
     *
     * Returns:
     * {Object}
     */
    getPopupDefaults: function(t) {
        var h= false;
        if (t=='WFS') {
           h= true;
        }
        var options= {
            multipleKey: null,
            toggleKey: null,
            multiple: false,
            clickout: true,
            toggle: !h,
            hover: h,
            highlightOnly: false,
            box: false,
            onBeforeSelect: function() {},
            onSelect: (h? Geoportal.Control.hoverFeature : Geoportal.Control.selectFeature),
            onUnselect: Geoportal.Control.unselectFeature,
            scope: null,
            geometryTypes: null,
            callbacks: null,
            handlersOptions: null,
            selectStyle: null,
            renderIntent: "select",
            autoActivate: false
        };
        return options;
    },

    /**
     * APIMethod: addLayer
     * Allows to add any kind of map (mainly a wrapper to OpenLayers).
     *      For KML, GPX, OSM and GeoRSS layers, a default behaviour is set when selecting
     *      features (See <Geoportal.Map.getPopupDefaults>).
     *      For Vector based layer, an <OpenLayers.Control.Select at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Select-js.html> is created,
     *      with a "changelayer" ("visibility" property) event registered
     *      through <Geoportal.Map.onVisibilityChange>() method.
     *
     * Parameters:
     * type    - {String | <OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} Kind of layer you want to add.
     *      In case of {String}, allowed values are "WMS", "MapServer",
     *      "WMTS", "WMS-C", "WFS", "KML", "GPX" and "OSM".
     *      In case of <OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>, the method is
     *         equivalent to calling the <OpenLayers.Map.addLayer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html#OpenLayers.Map.addLayer>() method.
     * name    - {String} name of the layer which is displayed in the LayerSwitcher.
     * url     - {String | Array({String})} URL(s) of the server(s) or the file.
     * params  - {Object} parameters specific to the request.
     * options - {Object} options specific to the layer. A special option
     *      *preventDefaultBehavior* when true deactivate the create of
     *      <OpenLayers.Control.Select at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Select-js.html> control for each created vector based
     *      layer. It is then left to the developper to, if needed, define
     *      such a control. This option can hold values (if neither undefined,
     *      false or true) :
     *          * onFeatureInsert : when true deactivates default callback;
     *          * preFeatureInsert: when true deactivates default callback;
     *          * format          : when true deactivates default options on format;
     *          * loadend         : when true deactivates default loadend callback.
     *
     * Examples of some params keys:
     * >    layers, typename, srs, transparent, styleMap, styles, maxFeatures,
     * >    strategies, protocol, eventListeners, skipAttributes ...
     *      when base layer class is an {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} :
     * >    projection:"EPSG:4326" => projection of layer , by default "EPSG:4326".
     * >    opacity: 0.5 => percentage of transparency
     * >    visibility: false => Boolean which determines if the layer is visible at starting.
     *
     * Examples of some options:
     * >    projection:"EPSG:4326" => projection of layer , by default "EPSG:4326".
     * >    visibility: false => Boolean which determines if the layer is visible at starting.
     * >    isBaseLayer: false => Boolean which determines if the layer is a baselayer.
     * >    buffer: 1 => number of layer's tiles which are loaded outside the viewport.
     * >    opacity: 0.5 => percentage of transparency
     * >    singleTile: true/false for WMS/MapServer.
     * >    tileOrigin: new OpenLayers.LonLat(0.0, 0.0) => is the origine to calculate the tiles for WMS-C.
     * >    attribution:"fourni par l'IGN" => is the text for owners of the layer, which is displayed on the map.
     * >    formatOptions:{} => for KML/GPX/OSM/GeoRSS.
     * >    onSelect:function(f){...}.
     * >    onUnselect:function(f}{...}.
     *
     * Returns:
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the newly built layer, null when error.
     *      undefined is returned when the contract configuration has not been
     *      yet received. The API will attempt to add the layer later upon
     *      receival of the configuration.
     */
    addLayer: function(type, name, url, params, options) {
        var layer= null;
        // check for i18n :
        var layerName= null;
        if (name && !(typeof(name)=='string')) {
            // { 'key': { 'code'=>'i18n', ... } }
            for (var k in name) {
                if (name.hasOwnProperty(k)) {
                    // get the first then exit
                    var tr= {};
                    tr[k]= name[k];
                    Geoportal.Lang.add(tr);
                    layerName= k;
                    break;
                }
            }
        } else {
            layerName= name;
        }
        if (!layerName) {
            layerName= '#'+(this.getNumLayers()+1);
        }

        options= options || {};
        var pdb= {
            all             : false,
            preFeatureInsert: false,
            onFeatureInsert : false,
            format          : false,
            loadend         : false
        };
        if (options.preventDefaultBehavior===true) {
            pdb= {
                all             : true,
                preFeatureInsert: true,
                onFeatureInsert : true,
                format          : true,
                loadend         : true
            };
        } else if (options.preventDefaultBehavior!=undefined) {//or !=false
            pdb= {
                preFeatureInsert: options.preventDefaultBehavior['preFeatureInsert'] || false,
                onFeatureInsert : options.preventDefaultBehavior['onFeatureInsert']  || false,
                format          : options.preventDefaultBehavior['format']           || false,
                loadend         : options.preventDefaultBehavior['loadend']          || false
            };
            pdb['all']= pdb['preFeatureInsert'] && pdb['onFeatureInsert'] && pdb['format'] && pdb['loadend'];
        }
        if (options.preventDefaultBehavior!==undefined) {
            delete options.preventDefaultBehavior;
        }
        params= params || {};
        var lopts= {
            isBaseLayer:false,
            visibility: false,
            view:{
                drop:true,
                zoomToExtent:true
            }
        };
        var needsPopup= false;
        switch (type) {
            case "WMS":
                lopts= OpenLayers.Util.extend(
                    lopts,
                    {
                        opacity:0.5,
                        buffer:1,
                        singleTile:false
                    });
                layer= new OpenLayers.Layer.WMS(layerName,
                                                url,
                                                params,
                                                OpenLayers.Util.extend(lopts,options));
                break;
            case "MapServer":
                if (!OpenLayers.Layer.MapServer) {//might be null if not extended API!
                    return null;
                }
                lopts= OpenLayers.Util.extend(
                    lopts,
                    {
                        opacity:0.5,
                        singleTile:false
                    });
                layer= new OpenLayers.Layer.MapServer(layerName,
                                                      url,
                                                      params,
                                                      OpenLayers.Util.extend(lopts,options));
                break;
            case "WMTS" :
                lopts= OpenLayers.Util.extend(
                    lopts,
                    {
                        name:layerName,
                        url:url,
                        opacity:0.5,
                        transitionEffect:'resize'
                    });
                lopts= OpenLayers.Util.extend(lopts, params);
                layer= new Geoportal.Layer.WMTS(OpenLayers.Util.extend(lopts,options));
                break;
            case "WMS-C":
                lopts= OpenLayers.Util.extend(
                    lopts,
                    {
                        opacity:0.5,
                        buffer:1,
                        singleTile:false,
                        tileOrigin:new OpenLayers.LonLat(0.0,0.0),
                        nativeTileSize:new OpenLayers.Size(256,256)
                    });
                layer= new Geoportal.Layer.WMSC(layerName,
                                                url,
                                                params,
                                                OpenLayers.Util.extend(lopts,options));
                break;
            case "WFS":
                if (!options.format && !OpenLayers.Format.WFST) {
                    OpenLayers.Console.userError('wfs.caps.unsupported.version',{version:''});
                    return null;
                }

                var self= this;

                /*
                 * Method that sends a describefeaturetype request so that to
                 * retrieve the attributes : featurePrefix,featureNS and
                 * geometryName, then reruns the method addLayer()
                 */
                var describeFeatureTypeRequest= function(){
                    OpenLayers.Request.issue({
                        method :options.describeFeatureTypeUrl.get? "GET":"POST",
                        async  :true,
                        url    :url,
                        params :{
                            'SERVICE' :'WFS',
                            'VERSION' :params.version,
                            'REQUEST' :'DescribeFeatureType',
                            'TYPENAME':params.typename
                        },
                        success:function (request){
                            var doc= request.responseXML;
                            if (!doc && request.responseText) {
                                doc= OpenLayers.Format.XML.prototype.read.call({},[request.responseText]);
                                var pet= OpenLayers.Request.XMLHttpRequest.getParseErrorText(doc);
                                if (pet != OpenLayers.Request.XMLHttpRequest.PARSED_OK) {
                                    OpenLayers.Console.userError(OpenLayers.i18n(pet));
                                    return;
                                }
                            }
                            var descFmt= new OpenLayers.Format.WFSDescribeFeatureType();
                            var desc= null;
                            try {
                                desc= descFmt.read(doc);
                            } catch (er) {
                                OpenLayers.Console.userError(er);
                                return;
                            }
                            options.protocolOptions.featurePrefix= desc.targetPrefix;
                            options.protocolOptions.featureNS= desc.targetNamespace;
                            // Loop to find the geometryName
                            for (var i=0, l=desc.featureTypes[0].properties.length; i<l; i++) {
                                var prop= desc.featureTypes[0].properties[i];
                                if (prop.type.match(/^gml:.*PropertyType/) && prop.name!="boundedBy") {
                                    options.protocolOptions.geometryName= prop.name;
                                    break;
                                }
                            }
                            //call the addLayer method
                            return self.addLayer(type, name, url, params, options);
                        },
                        failure:function (request) {
                            OpenLayers.Console.userError(request.statusText);
                            return null;
                        },
                        scope  :self
                    });
                }

                /*
                 * Method that sends a GetCapabilities request so that to
                 * retrieve the describeFeatureType request's url.
                 * calls the method describeFeatureTypeRequest which retrieves
                 * featurePrefix,featureNS and geometryName through a
                 * describeFeatureType request.
                 */
                var fillProtocolOptions= function() {
                    if (options.describeFeatureTypeUrl) {
                        return describeFeatureTypeRequest();
                    } else {
                        OpenLayers.Request.GET({
                            async  :true,
                            url    :url,
                            params :{
                                'SERVICE': 'WFS',
                                'REQUEST': 'GetCapabilities'
                            },
                            success:function(request) {
                                var doc= request.responseXML;
                                if (!doc && request.responseText) {
                                    doc= OpenLayers.Format.XML.prototype.read.call({},[request.responseText]);
                                    var pet= OpenLayers.Request.XMLHttpRequest.getParseErrorText(doc);
                                    if (pet != OpenLayers.Request.XMLHttpRequest.PARSED_OK) {
                                        OpenLayers.Console.userError(OpenLayers.i18n(pet));
                                        return;
                                    }
                                }
                                var capsFmt= new OpenLayers.Format.WFSCapabilities();
                                try {
                                    var caps= capsFmt.read(doc);
                                    var href= caps.capability.operations.DescribeFeatureType &&
                                              caps.capability.operations.DescribeFeatureType.href ?
                                                caps.capability.operations.DescribeFeatureType.href
                                              : null;
                                    if (href) {
                                        options.describeFeatureTypeUrl= href;
                                        if (!params.version) {
                                            params.version= caps.version ;
                                        }
                                        return describeFeatureTypeRequest();
                                    }
                                    //FIXME: no DescribeFeatureType ... i18n
                                    OpenLayers.Console.userError("no.describefeaturetype@"+url);
                                    return null;
                                } catch (er) {
                                    OpenLayers.Console.userError(er);
                                    return null;
                                }
                            },
                            failure:function(request) {
                                OpenLayers.Console.userError(request.statusText);
                                return null;
                            },
                            scope  :self
                        })
                    }
                    return null;
                };

                options.protocolOptions= options.protocolOptions || {};
                if (!(options.protocolOptions.featureNS && options.protocolOptions.featurePrefix && options.protocolOptions.geometryName)) {
                    //Fills the attributes of the object protocolOptions: featurePrefix,featureNS and geometryName
                    return fillProtocolOptions();
                }
                lopts= OpenLayers.Util.extend(
                    lopts,
                    {
                        strategies:[new OpenLayers.Strategy.BBOX()],
                        extractAttributes: true,            // default
                        styleMap: new OpenLayers.StyleMap({ // INSPIRE Default !)
                            pointRadius: 4,
                            strokeColor: "black",
                            strokeWidth: 2,
                            strokeOpacity: 0.5,
                            fillOpacity: 0.2,
                            fillColor: "black"
                        })
                    });
                var popts= {
                    'url': url,
                    featureType: params.typename || 'NONE',
                    featurePrefix: options.protocolOptions.featurePrefix,
                    featureNS: options.protocolOptions.featureNS,
                    geometryName: options.protocolOptions.geometryName,
                    srsName: options.projection || this.getProjection().getCode(),
                    version: params.version,
                    format: options.format
                };
                if (options.projection && !(options.projection instanceof OpenLayers.Projection)) {
                    options.projection= new OpenLayers.Projection(options.projection);
                }
                if (!options.format) {
                    delete popts.format;
                    OpenLayers.Util.extend(popts, {
                        formatOptions:{
                            internalProjection: this.getProjection().clone(),
                            externalProjection: options.projection || this.getProjection().clone()
                        }
                    });
                    OpenLayers.Util.extend(popts.formatOptions,options.formatOptions);
                }
                if (pdb['preFeatureInsert']===false &&
                    typeof(Geoportal.Popup)!='undefined') {
                    lopts.preFeatureInsert= Geoportal.Popup.setPointerCursorForFeature;
                    needsPopup= true;
                }
                if (pdb['format']===false) {
                    params= OpenLayers.Util.applyDefaults(params,{maxFeatures:50});
                }
                lopts.protocol= new OpenLayers.Protocol.WFS(popts);
                if (options.projection) {
                    if (options.maxExtent) {
                        options.maxExtent.transform(options.projection, this.getProjection());
                    }
                    options.projection= this.getProjection();
                    if (options.units) {
                        options.units= options.projection.getUnits();
                    }
                }
                layer= new OpenLayers.Layer.Vector(layerName,OpenLayers.Util.extend(lopts,options));
                break;
            case "KML"   :
            case "GPX"   :
            case "OSM"   :
            case "GeoRSS":
            case "GML"   :
            //case "Vector":
                var classLayer= OpenLayers.Layer.Vector;
                var popts= {
                    format: OpenLayers.Format.GML,
                    formatOptions:{
                        internalProjection: this.getProjection()
                    }
                };
                lopts= OpenLayers.Util.extend(
                    lopts,
                    {
                        projection: this.getProjection(),
                        panMapIfOutOfView: true,
                        strategies: [new OpenLayers.Strategy.Fixed()]
                    });
                if (options.attachDefaultPopup!==false) {
                    if (pdb['preFeatureInsert']===false &&
                        typeof(Geoportal.Popup)!='undefined') {
                        lopts.preFeatureInsert= Geoportal.Popup.setPointerCursorForFeature;
                        needsPopup= true;
                    }
                    if (pdb['onFeatureInsert']===false &&
                        typeof(Geoportal.Popup)!='undefined') {
                        lopts.onFeatureInsert= Geoportal.Popup.Anchored.createPopUpForGMLFeature;
                        needsPopup= true;
                    }
                }
                switch (type) {
                case "KML"    :
                    popts.format= OpenLayers.Format.KML;
                    if (pdb['onFeatureInsert']===false &&
                        typeof(Geoportal.Popup)!='undefined' &&
                        typeof(Geoportal.Popup.Anchored)!='undefined') {
                        lopts.onFeatureInsert= Geoportal.Popup.Anchored.createPopUpForKMLFeature;
                    }
                    if (pdb['format']===false) {
                        popts.formatOptions.extractStyles= true;        // default : false
                        //popts.formatOptions.extractAttributes= true;  // default
                        //popts.formatOptions.extractFolders= false;    // default
                    }
                    break;
                case "GPX"    :
                    popts.format= Geoportal.Format.GPX;
                    if (pdb['onFeatureInsert']===false &&
                        typeof(Geoportal.Popup)!='undefined' &&
                        typeof(Geoportal.Popup.Anchored)!='undefined') {
                        lopts.onFeatureInsert= Geoportal.Popup.Anchored.createPopUpForGPXFeature;
                    }
                    /*if (pdb['format']===false) {
                        //popts.formatOptions.extractAttributes= true;  // default
                        //popts.formatOptions.extractWaypoints= true;   // default
                        //popts.formatOptions.extractTracks= true;      // default
                        //popts.formatOptions.extractRoutes= true;      // default
                    }*/
                    break;
                case "OSM"    :
                    popts.format= OpenLayers.Format.OSM;
                    lopts.originators= [{
                        logo:'osm',
                        pictureUrl:'http://wiki.openstreetmap.org/w/images/thumb/b/b0/Openstreetmap_logo.svg/100px-Openstreetmap_logo.svg.png',
                        url:'http://wiki.openstreetmap.org/wiki/Main_Page'
                    }];
                    if (pdb['onFeatureInsert']===false &&
                        typeof(Geoportal.Popup)!='undefined' &&
                        typeof(Geoportal.Popup.Anchored)!='undefined') {
                        lopts.onFeatureInsert= Geoportal.Popup.Anchored.createPopUpForGMLFeature;
                    }
                    break;
                case "GeoRSS" :
                    popts.format= OpenLayers.Format.GeoRSS;//might be null if not extended API!
                    if (pdb['onFeatureInsert']===false &&
                        typeof(Geoportal.Popup)!='undefined' &&
                        typeof(Geoportal.Popup.Anchored)!='undefined') {
                        lopts.onFeatureInsert= Geoportal.Popup.Anchored.createPopUpForGeoRSSFeature;
                    }
                    if (pdb['format']===false) {
                        //popts.formatOptions.featureTitle= "Untitled";             // default
                        //popts.formatOptions.featureDescription= "No Description"; // default
                        //popts.formatOptions.xy= false;                            // default
                        //popts.formatOptions.createFeatureFromItem= OpenLayers.Format.GeoRSS.prototype.createFeatureFromItem; // default
                        popts.formatOptions.size= new OpenLayers.Size(250, 150);
                        popts.formatOptions.autoSize= false;
                        popts.formatOptions.overflow= 'auto';
                        lopts.styleMap= new OpenLayers.StyleMap(
                            new OpenLayers.Style(
                                OpenLayers.Util.applyDefaults({
                                    'graphic': true,
                                    'externalGraphic': OpenLayers.Util.getImagesLocation()+"marker-blue.png",
                                    'graphicOpacity': 0.80,
                                    'graphicWidth': 21,
                                    'graphicHeight': 25,
                                    'graphicXOffset': -10.5,
                                    'graphicYOffset': -25
                                },OpenLayers.Feature.Vector.style["default"])));
                    }
                    break;
                default   :
                    break;
                }
                if (!popts.format) {
                    return null;
                }
                // See Geoportal.Control.AddVectorLayer for eventListeners["loadend"]
                if (pdb['loadend']===false) {
                    params.eventListeners= params.eventListeners || {};
                    var leClbk= params.eventListeners["loadend"] || undefined;
                    params.eventListeners["loadend"]= function() {
                        var bounds= this.getDataExtent();
                        if (bounds) {
                            this.maxExtent= bounds;// FIXME: check CRS
                            // removed cause it blocks visibility when zooming
                            // in/out when visibility is set to true :
                            //if (leClbk===undefined) {
                            //    this.setVisibility(this.visibility && this.calculateInRange());
                            //}
                            //FIXME: setVisibility, raises "changelayer" event,
                            //       property "visibility" which change the
                            //       baselayer to WLD ...
                        }
                        if (leClbk && typeof(leClbk)=='function') {
                            leClbk.apply(this,arguments);
                        }
                    };
                }
                OpenLayers.Util.extend(popts.formatOptions,options.formatOptions);
                if (url) {
                    lopts.protocol= new OpenLayers.Protocol.HTTP({
                        'url'   :url,
                        'format':new popts.format(popts.formatOptions)
                    });
                } else if (options.data) {
                    lopts.protocol= new OpenLayers.Protocol.String({
                        'data'  :options.data,
                        'format':new popts.format(popts.formatOptions)
                    });
                }/* else {
                    //one could use addFeatures() ...
                    return null;
                }*/
                layer= new classLayer(layerName,OpenLayers.Util.extend(lopts,params));
            break;
        default      :
            if (typeof(type)=='object' && type instanceof OpenLayers.Layer) {
                layer= type;
                if (name && !(typeof(name)=='string')) {//i18n
                    layer.name= layerName;
                }
                if (options.visibility!==undefined) {
                    layer.visibility= options.visibility;
                }
                if (pdb['all']===false) {
                    needsPopup= (
                                    typeof(OpenLayers.Layer.Vector)!='undefined' &&
                                    (layer instanceof OpenLayers.Layer.Vector)   &&
                                    (
                                        options.hasOwnProperty('onSelect')       ||
                                        options.hasOwnProperty('onUnselect')     ||
                                        options.hasOwnProperty('onBeforeSelect') ||
                                        options.attachDefaultPopup===true
                                    )
                                ) ||
                                (
                                    typeof(OpenLayers.Layer.Markers)!='undefined' &&
                                    (layer instanceof OpenLayers.Layer.Markers)
                                );
                }
                break;
            }
            return null;
        }

        // Only modify baselayer's zoom when adding a layer with zooms :
        var modifiesZooms= !(layer instanceof OpenLayers.Layer.Vector) && // prevent vector layers to modify zooms !
                           (typeof(layer.minZoomLevel)=='number' && typeof(layer.maxZoomLevel)=='number');
        // Retrieve baseLayer of layer :
        var blOfLayer= null;
        for (var i= 0, len= this.layers.length; i<len; i++) {
            var L= this.layers[i];
            if (!L.isBaseLayer) {
                continue;
            }
            if (layer.territory) {
                if (L.territory==layer.territory) {
                    blOfLayer= L;
                    break;
                }
            }
            if (layer.getCompatibleProjection(L)) {
                if (layer.maxExtent!=null) {
                    var e= layer.maxExtent.clone();
                    // layer.maxExtent is expressed in layer's native projection ...
                    e.transform(layer.getNativeProjection(), L.getNativeProjection());
                    if (!(e.containsBounds(L.maxExtent,true,true) ||
                        L.maxExtent.containsBounds(e,true,true))) {
                        continue;
                    }
                }
                //FIXME: find best ?
                blOfLayer= L;
                continue;
            }
        }
        // Modify zoom levels if needed :
        if (!layer.isBaseLayer && modifiesZooms && blOfLayer) {
            this.adjustZoomLevels(blOfLayer,layer);
        }
        // layer's maxExtent is in layer's native projection ...
        OpenLayers.Map.prototype.addLayer.apply(this,[layer]);
        // layer's maxExtent is in this.baseLayer's projection ...
        // Hide if needed :
        if (!layer.isBaseLayer && layer.getCompatibleProjection(this.baseLayer)===null) {
            // reproject or hide layer :
            layer.changeBaseLayer({layer:this.baseLayer, baseLayer:/*blOfLayer || */this.baseLayer});
        }

        if (needsPopup) {
            if (layer instanceof OpenLayers.Layer.Vector) {
                // popup activation :
                var xmlDefaults= this.getPopupDefaults(type);
                for (var o in xmlDefaults) {
                    if (options.hasOwnProperty(o)) {
                        xmlDefaults[o]= options[o];
                    }
                }
                // adds select control when necessary :
                var select= new OpenLayers.Control.SelectFeature(layer, xmlDefaults);
                this.addControl(select);
                if (layer.visibility && !xmlDefaults.autoActivate) {
                    select.activate();
                }
                this.events.on({"changelayer": Geoportal.Map.onVisibilityChange, scope:select});
            }/* else if (OpenLayers.Layer.Markers && (layer instanceof OpenLayers.Layer.Markers)) {
                ;
            }*/
        }

        if (layer.isBaseLayer) {
            this.events.register('preaddlayer', layer, Geoportal.Layer.onPreAddLayer);
        } else {
            if (typeof(OpenLayers.Layer.Vector.RootContainer)=='undefined' ||
                !(layer instanceof(OpenLayers.Layer.Vector.RootContainer))) {
                this.events.register('changebaselayer', layer, layer.changeBaseLayer, 1);
            }
        }

        return layer;
    },

    /**
     * APIMethod: removeLayer
     * Removes a layer from the map by removing its visual element (the
     *   layer.div property), then removing it from the map's internal list
     *   of layers, setting the layer's map property to null.
     *
     *   a "removelayer" event is triggered.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>}
     * setNewBaseLayer - {Boolean} Default is true
     */
    removeLayer: function(layer, setNewBaseLayer) {
        // remove registrered events :
        if (layer.isBaseLayer) {
            this.events.unregister('preaddlayer', layer, Geoportal.Layer.onPreAddLayer);
        } else {
            if (typeof(OpenLayers.Layer.Vector.RootContainer)=='undefined' ||
                !(layer instanceof(OpenLayers.Layer.Vector.RootContainer))) {
                this.events.unregister('changebaselayer', layer, layer.changeBaseLayer);
            }
        }
        OpenLayers.Map.prototype.removeLayer.apply(this,arguments);
    },

    /**
     * Method: adjustZoomLevels
     * Modify base layer's zoom levels with new layer's zoom levels.
     *      Correct minimum/maximum resolutions, as well as minimum/maximum
     *      scales.
     *
     * Parameters:
     * bLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the base layer to update.
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the layer used for updating zooms.
     */
    adjustZoomLevels: function(bLayer, layer) {
        if (!bLayer) { return; }
        var mnzl= layer.minZoomLevel, mxzl= layer.maxZoomLevel;
        if (mnzl!=undefined &&
            (
             bLayer.minZoomLevel==undefined ||
             mnzl<bLayer.minZoomLevel
            )) {
            bLayer.minZoomLevel= mnzl;
            if (bLayer.resolutions) {
                bLayer.maxResolution= bLayer.resolutions[mnzl];
            }
            if (bLayer.scales) {
                bLayer.minScale= bLayer.scales[mnzl];
            }
        }
        if (mxzl!=undefined &&
            (
             bLayer.maxZoomLevel==undefined ||
             mxzl>bLayer.maxZoomLevel
            )) {
            bLayer.maxZoomLevel= mxzl;
            if (bLayer.resolutions) {
                bLayer.minResolution= bLayer.resolutions[mxzl];
            }
            if (bLayer.scales) {
                bLayer.maxScale= bLayer.scales[mxzl];
            }
        }
    },

    /**
     * Method: updateZoomLevels
     * Modify base layer's zoom levels with current visible layers' zoom levels.
     *      Correct minimum/maximum resolutions, as well as minimum/maximum
     *      scales.
     *      Redraw the map if necessary.
     *
     * Parameters:
     * e - {Event} the browser event
     */
    updateZoomLevels: function(e) {
        if (e.property!='visibility') { return; }
        if (e.layer.isBaseLayer) { return; }
        //FIXME: don't touch Web Mercator base's layer zooms -- at least maxZoomLevel could be changed ?
        //TC 2013-02-08 desactivate webmercator condition => ricci says "A creuser"
        //if (this.baseLayer.getNativeProjection().isWebMercator()) { return; }
        if (e.layer.getCompatibleProjection(this.baseLayer)==null) { return; }
        if (e.layer instanceof OpenLayers.Layer.Vector) { return; }
        if (typeof(e.layer.minZoomLevel)!='number') { return; }
        var lmz= e.layer.minZoomLevel;
        if (typeof(e.layer.maxZoomLevel)!='number') { return; }
        var lxz= e.layer.maxZoomLevel;
        if (typeof(this.baseLayer.minZoomLevel)!='number') { return; }
        var bmz= this.baseLayer.minZoomLevel;
        if (typeof(this.baseLayer.maxZoomLevel)!='number') { return; }
        var bxz= this.baseLayer.maxZoomLevel;
        if (e.layer.getVisibility()) {  //now visible, check min/max only
            if (lmz>=bmz && lxz<=bxz) { return; }
            //WARNING: wrong min-max zoom lead to unexpected behavior when
            //changing base layer ...
            if (lmz<bmz) { bmz= lmz; }
            if (lxz>bxz) { bxz= lxz; }
        } else {                        //was visible, check for new min/max if necessary
            if (lmz!=bmz && lxz!=bxz) { return; }
            // loop over layers to find min/max
            bmz= Number.MAX_VALUE ; 
            bxz= Number.MIN_VALUE ;
            for (var i= 0, len= this.layers.length; i<len; i++) {
                var layer= this.layers[i];
                if (layer.isBaseLayer) { continue; }
                // skip vector layers has their zooms is "irrelevant"
                // FIXME: OL misses this information ?!
                if (layer instanceof OpenLayers.Layer.Vector) { continue; }
                if (layer.getCompatibleProjection(this.baseLayer)==null) { continue; }
                if (!layer.getVisibility()) { continue; }
                if (typeof(layer.minZoomLevel)!='number') { continue; }
                if (layer.minZoomLevel<bmz) {
                    bmz= layer.minZoomLevel;
                }
                if (typeof(layer.maxZoomLevel)!='number') { continue; }
                if (layer.maxZoomLevel>bxz && layer.maxZoomLevel<this.baseLayer.numZoomLevels) {
                    bxz= layer.maxZoomLevel;
                }
            }
            if (bmz==Number.MAX_VALUE) { bmz= this.baseLayer.minZoomLevel; }
            if (bxz==Number.MIN_VALUE) { bxz= this.baseLayer.maxZoomLevel; }
        }
        var changeZoom= -1;
        // FIXME: GPP3 ?
        if (this.baseLayer.name=='_WLD_world_') {
            if (!(0<=bmz && bmz<=5)) { bmz= this.baseLayer.minZoomLevel; }
            if (!(0<=bxz && bxz<=5)) { bxz= this.baseLayer.maxZoomLevel; }
        } else if (this.baseLayer.name.match(/_..._territory_/)) {
            if (!(6<=bmz && bmz<=21)) { bmz= this.baseLayer.minZoomLevel; }
            if (!(6<=bxz && bxz<=21)) { bxz= this.baseLayer.maxZoomLevel; }
        }
        if (bmz>this.baseLayer.minZoomLevel && this.getZoom()<bmz) {
            changeZoom= bmz;
        }
        if (bxz<this.baseLayer.maxZoomLevel && this.getZoom()>bxz) {
            changeZoom= bxz;
        }
        if (this.baseLayer.minZoomLevel!=bmz) {
            this.baseLayer.minZoomLevel= bmz;
            this.baseLayer.minResolution= this.baseLayer.resolutions[bmz];
            this.baseLayer.minScale= this.baseLayer.scales?
                this.baseLayer.scales[bmz]
            :   OpenLayers.Util.getScaleFromResolution(
                    this.baseLayer.minResolution,
                    this.baseLayer.getNativeProjection().getUnits()
                );
        }
        if (this.baseLayer.maxZoomLevel!=bxz) {
            this.baseLayer.maxZoomLevel= bxz;
            this.baseLayer.maxResolution= this.baseLayer.resolutions[bxz];
            this.baseLayer.maxScale= this.baseLayer.scales?
                this.baseLayer.scales[bxz]
            :   OpenLayers.Util.getScaleFromResolution(
                    this.baseLayer.maxResolution,
                    this.baseLayer.getNativeProjection().getUnits()
                );
        }
        if (changeZoom!=-1) {
            this.moveTo(null,changeZoom);
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Map"*
     */
    CLASS_NAME: "Geoportal.Map"
});

/**
 * APIFunction: onVisibilityChange
 * Activate or Deactivate the select control of a layer or layers.
 *      When all layers are not visible and in range, the control is
 *      deactivated, otherwise it is activated.
 *
 * Parameters:
 * e - {Event} the browser event
 */
Geoportal.Map.onVisibilityChange= function(e) {
    if (e.property && e.property=="visibility") {
        var c= false, vo= false;
        if (this.layers) {
            for (var i= 0, l= this.layers.length; i<l; i++) {
                vo= vo || (this.layers[i].visibility && this.layers[i].inRange);//false in the end if all layers are not visible
                if (this.layers[i]==e.layer) {
                    c= true;
                }
            }
        } else {
            c= this.layer==e.layer;
            vo= this.layer.visibility && this.layer.inRange;
        }
        if (c) {
            // always force changing activation status to ensure the last
            // control gets the hand !
            if (vo) {
                // control to be activated :
                this.deactivate();
                this.activate();
            } else {
                // control to be deactivated :
                this.activate();
                this.deactivate();
            }
        }
    }
};

