/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Viewer/Simple.js
 * @requires Geoportal/InterfaceViewer.js
 */
/**
 * Class: Geoportal.InterfaceViewer.JS
 * The Geoportal Javascript viewer interface class.
 *
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple1.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple2.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple3.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple4.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple5.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple6.html>
 *
 */
Geoportal.InterfaceViewer.JS= OpenLayers.Class(Geoportal.InterfaceViewer, {

    /**
     * Constructor: Geoportal.InterfaceViewer.JS
     * Create an interface between the web page and the {<Geoportal.Viewer>} object.
     *
     * Parameters:
     * div - {String | DOMElement} Id of the DIV tag in which you want
     *       to insert your viewer.
     * options - {Object} Optional object with properties to tag onto the map.
     *           Options are :
     *      * keys - {Array({String}) | {String}} the API's keys' contracts
     *      for this viewer.
     *      * viewerLoadedCallback - {Function} the function to be called when the
     *      viewer has triggered the "viewerloaded" event. This event returns
     *      the viewer object.
     *      * viewerClass - {Function | String} mandatory, the viewer to communicate with.
     *      May be of {<Geoportal.Viewer>} sub-class.
     *      * viewerOpts - {Object} Any options usefull for creating the
     *      viewer. See {<Geoportal.Viewer>}.
     */
    initialize: function(div, options) {
        Geoportal.InterfaceViewer.prototype.initialize.apply(this, arguments);
        if (this.keys) {
            this.createViewerIf();
        }
    },

    /**
     * APIMethod: destroy
     * Clean things up !
     */
    destroy: function () {
        Geoportal.InterfaceViewer.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: createViewerIf
     * Download configuration and create the viewer accordingly.
     *
     * Parameters:
     * keys - Array({String}) keys to configure. If none, use internal keys.
     */
    createViewerIf: function(keys) {
        // Geoportal.GeoRMHandler.getConfig sets global variable
        // gGEOPORTALRIGHTSMANAGEMENT (see onViewerLoaded() calling setKeys())
        Geoportal.GeoRMHandler.getConfig( keys || this.keys, this.viewerOpts.callback || null, this.viewerOpts.geormUrl || null, {
            'onContractsComplete': OpenLayers.Function.bind(this.viewerOpts.onContractsComplete || this.onContractsComplete, this)
        });
    },

    /**
     * APIMethod: onContractsComplete
     * Default callback when the contract's key is returned.
     */
    onContractsComplete: function() {
        var opts= OpenLayers.Util.extend({}, this.viewerOpts);
        // controls:
        if (opts.componentsOptions) {
            opts.controlsOptions= {};
            for (var cpnt in opts.componentsOptions ) {
                var cn= this.mapComponentType(cpnt);
                if (cn && cn!=Geoportal.InterfaceViewer.UNKNOWNCOMPONENT) {
                    opts.controlsOptions[cn]= OpenLayers.Util.extend({}, opts.componentsOptions[cpnt]);
                }
            }
            delete opts.componentsOptions;
        }
        var viewer= this.getViewer();
        if (!viewer) {
            opts= OpenLayers.Util.extend(opts, {
                eventListeners:{
                    'viewerloaded': OpenLayers.Function.bind(function(evt) {
                        this.onViewerLoaded(evt);
                    }, this)
                }
            });
            if (typeof(this.viewerClass)=='string') {
                try {
                    this.viewerClass= eval(this.viewerClass);
                } catch(ex) {
                    this.viewerClass= null;
                }
            }
            viewer= new (this.viewerClass || Geoportal.Viewer.Simple)(this.div, opts);
        } else {
            this.setKeys();
        }
    },

    /**
     * APIMethod: onViewerLoaded
     * Assign the id and viewer properties as well as call the user's defined
     * callback for "viewerloaded" event's type.
     *      The function must assign the viewer's id and value through
     *      {<Geoportal.InterfaceViewer.registerViewer>}() function.
     */
    onViewerLoaded: function(evt) {
        this.id= evt.id;
        this.setViewer(evt.viewer);
        Geoportal.InterfaceViewer.registerViewer(this.id, this.getViewer());
        // listens to map's events :
        var map= this.getViewer().getMap();
        map.events.on({
            'moveend'                 :this.handleEvent,
            'zoomend'                 :this.handleEvent,
            'changelayer'             :this.handleEvent,
            'addlayer'                :this.handleEvent,
            'removelayer'             :this.handleEvent,
            'controlactivated'        :this.handleEvent,
            'controlvisibilitychanged':this.handleEvent,
            'controldeleted'          :this.handleEvent,
            'scope'                   :this
        });
        if (this.keys) {
            this.setKeys();
        }
        if (this.viewerLoadedCallback) {
            this.viewerLoadedCallback.apply(this,[evt]);
        }
    },

    /**
     * Method: handleEvent
     * Bubble the map's event to the interface viewer.
     *
     * Parameters:
     * evt - {Event}
     */
    handleEvent: function (evt) {
        var type= this.mapEventType(evt.type);
        var obj= null;
        switch (type) {
        case 'centerchanged'      :
        case 'zoomchanged'        ://zoomLevel, resolution, dx, dy, sx, sy
            var c= this.getViewer().getMap().getCenter().transform(
                this.getViewer().getMap().getProjection(),
                OpenLayers.Projection.CRS84);
            var f= "%dd%02d'%02d.";//FIXME: PROJ4 format= (-)ndnn'nn.nn - differs from JSBinder.as
            obj= {
                'zoomLevel' : this.getViewer().getMap().getZoom(),
                'resolution': this.getViewer().getMap().getResolution(),
                'dx'        : c.lon,
                'dy'        : c.lat,
                'sx'        : Geoportal.Util.degToDMS(c.lon,[],2,f),
                'sy'        : Geoportal.Util.degToDMS(c.lat,[],2,f)
            };
            break;
        case 'componentchanged'   ://componentName, componentIconified
            obj= {
                'componentName'     : evt.control.id,
                'componentIconified': evt.visibility!==undefined? evt.visibility : false
            };
            break;
        case 'layeradded'         ://layerName, layerOpacity, layerVisibility
        case 'layerchanged'       :
        case 'layerremoved'       :
            obj= {
                'layerName'      : evt.layer.name,//FIXME: layer.id (name is not unique)?
                'layerOpacity'   : evt.layer.opacity,
                'layerVisibility': evt.layer.getVisibility()
            };
            break;
        case 'viewerloaded'       :
        case 'orientationchanged' :
            break;
        }
        if (obj) {
            this.events.triggerEvent(type, obj);
        }
    },
    
    /**
     * APIMethod: mapEventType
     * Return the underlaying event's type mapped with the given type.
     *
     * (code)
     * Events mapping:
     * +--------------------+------------------------------------------------------------+
     * | InterfaceViewer    | Geoportal, OpenLayers                                      |
     * +--------------------+------------------------------------------------------------+
     * | centerchanged      | moveend                                                    |
     * +--------------------+------------------------------------------------------------+
     * | zoomchanged        | zoomend                                                    |
     * +--------------------+------------------------------------------------------------+
     * | orientationchanged |                                                            |
     * +--------------------+------------------------------------------------------------+
     * | layerchanged       | changelayer                                                |
     * +--------------------+------------------------------------------------------------+
     * | layeradded         | addlayer                                                   |
     * +--------------------+------------------------------------------------------------+
     * | layerremoved       | removelayer                                                |
     * +--------------------+------------------------------------------------------------+
     * | componentchanged   | controlactivated, controlvisibilitychanged, controldeleted |
     * +--------------------+------------------------------------------------------------+
     * | viewerloaded       | viewerloaded                                               |
     * +--------------------+------------------------------------------------------------+
     * (end)
     *
     * Parameters:
     * type - {String} the event's type for which one gets its mapping.
     *
     * Returns:
     * {String} the mapped event's type. If none, "unknownevent".
     */
    mapEventType: function(type) {
        type= Geoportal.InterfaceViewer.prototype.mapEventType.apply(this, arguments);
        switch(type) {
        case 'moveend'                 : type= 'centerchanged';    break;
        case 'zoomend'                 : type= 'zoomchanged';      break;
        case 'changelayer'             : type= 'layerchanged';     break;
        case 'addlayer'                : type= 'layeradded';       break;
        case 'removelayer'             : type= 'layerremoved';     break;
        case 'controlactivated'        :
        case 'controlvisibilitychanged':
        case 'controldeleted'          : type= 'componentchanged'; break;
        case 'viewerloaded'            :
        default                        :                           break;
        }
        return type;
    },

    /**
     * APIMethod: zoomIn
     * Increase the map's zoom level by one.
     *      FIXME: not in <SFD at https://geoportail.forge.ign.fr/documentation/api/sfd/description-fonctionnelle/api-haut-niveau.html>
     */
    zoomIn: function() {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var zoom= viewer.getMap().getZoom();
        zoom++;
        this.setZoom(zoom);
    },

    /**
     * APIMethod: zoomOut
     * Decrease the map's zoom level by one.
     *      FIXME: not in <SFD at https://geoportail.forge.ign.fr/documentation/api/sfd/description-fonctionnelle/api-haut-niveau.html>
     */
    zoomOut: function() {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var zoom= viewer.getMap().getZoom();
        zoom--;
        this.setZoom(zoom);
    },

    /**
     * APIMethod: pan
     * Move the map's center by the given quantity of pixels.
     *      FIXME: not in <SFD at https://geoportail.forge.ign.fr/documentation/api/sfd/description-fonctionnelle/api-haut-niveau.html>
     *
     * Parameters:
     * p - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the quantity of pixels.
     */
    pan: function(p) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        this.viewer.getMap().pan(p.x,p.y);
    },

    /**
     * APIMethod: setZoom
     * Assign the map's zoom level.
     *
     * Parameters:
     * zoom - {Number} the zoom level. Could be an integer for fixed zooms, or
     * a number for fractional or free zooms.
     */
    setZoom: function(zoom) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        viewer.getMap().setCenter(null,zoom);
    },

    /**
     * APIMethod: setCenter
     * Set the map's center with the given geographical coordinates.
     * This method is just a wrapper for
     * {<Geoportal.Vierwer.setCenterAtLocation>}().
     *
     * Parameters:
     * lon - {String|Number} the sexagecimal or decimal degree value of the
     * longitude of the center.
     * lat - {String|Number} the sexagecimal or decimal degree value of the
     * latitude of the center.
     */
    setCenter: function(lon, lat) {
        this.setCenterAtLocation({
            'lon':lon,
            'lat':lat
        });
    },

    /**
     * APIMethod: setCenterAtLocation
     * Center the map at the given location.
     *
     * Parameters:
     * location - {Object} various ways of dealing with map's center. Could
     * be :
     *      * center - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} coordinates in WGS84 longitude,
     *        latitude;
     *      * lon - {String | Number} longitude in WGS84;
     *      * lat - {String | Number} latitude in WGS84;
     *      * place - {String} place's name (needs proxyUrl set to work);
     *      * address - {String} location in term of "street,zip code,place"
     *      * geolocate - {Boolean} if true use geolocation API ;
     *      * heading - {String | Number} camera's heading in WGS84;
     *      * tilt - {Number} camera's tilt in decimal degrees ;
     *      * afterCentered - {Function} after centering, call this function in
     *      the context of the map;
     *      * zoom - {Number} the zoom to get (optional).
     */
     setCenterAtLocation: function(location) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }

        //FIXME: ugly, but getCenter() always return a center ...
        var center= viewer.getMap().center?
            viewer.getMap().getCenter()
        :   viewer.viewerOptions.defaultCenter.clone();
        var zoom= typeof(location.zoom)=='number'?
            location.zoom
        :   location.place || location.address?
            null
        :   viewer.getMap().center?
            viewer.getMap().getZoom()
        :   viewer.viewerOptions.defaultZoom;
        var opts= {
            'defaultCenter': center,
            'afterCentered': location.afterCentered,
            'zoom'         : zoom
        };
        if (location.place) {// placename
            viewer.getMap().setCenterAtLocation(OpenLayers.Util.extend({
                'place': location.place
            },opts));
            return;
        }
        if (location.address) {// geocoding
            viewer.getMap().setCenterAtLocation(OpenLayers.Util.extend({
                'address': location.address
            },opts));
            return;
        }
        if (location.geolocate===true) {// geolocation
            if (typeof(location.zoom)!='number') {//if no zoom, let setCenterAtGeolocation decides !
                delete opts.zoom;
            }
            viewer.getMap().setCenterAtGeolocation(opts);
            return;
        }
        if (!(location.center instanceof OpenLayers.LonLat)) {
            if (typeof(location.lon)=='string') {//dms
                location.lon= Geoportal.Util.dmsToDeg(location.lon);
            }
            if (typeof(location.lat)=='string') {//dms
                location.lat= Geoportal.Util.dmsToDeg(location.lat);
            }
            if (!isNaN(Number(location.lon)) && !isNaN(Number(location.lat))) {
                location.center= new OpenLayers.LonLat(location.lon, location.lat);
            }
            if (!location.center) { location.center= center; }
        }
        location.center.transform(OpenLayers.Projection.CRS84, viewer.getMap().getProjection());
        viewer.getMap().setCenter(location.center,zoom);
        if (location.afterCentered) {
            location.afterCentered.apply(viewer.getMap(),[]);
        }
        return;
    },

    /**
     * APIMethod: setLayerVisibility
     * Display or hide the layer.
     *
     * Parameters:
     * name - {String} the layer's name
     * visibility - {Boolean} true to display the layer, false otherwise.
     */
    setLayerVisibility: function(name, visibility) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var lyr= this.getLayer(name);
        if (lyr) {
            lyr.setVisibility(visibility);
        }
    },

    /**
     * APIMethod: setLayerOpacity
     * Change the layer's transparency to the given level.
     *
     * Parameters:
     * name - {String} the layer's name
     * opacity - {Number} value between 0.0 (transparent) and 1.0 (opaque) to set.
     */
    setLayerOpacity: function(name, opacity) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var lyr= this.getLayer(name);
        if (lyr) {
            lyr.setOpacity(opacity);
        }
    },

    /**
     * APIMethod: moveLayerUp
     * Move the layer's on top of the layer's above it in the layers' stack.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    moveLayerUp: function(name) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        
        for (var i= 0, l= viewer.getMap().layers.length; i<l; i++) {
            var lyr= viewer.getMap().layers[i];
            if (lyr.name==name) {//found layer
                if (i==l-1) { break; } // no layer to move
                var lyrTgt= viewer.getMap().layers[i+1];
                viewer.getMap().layers[i+1]= lyr;
                viewer.getMap().layers[i]= lyrTgt;
                var zI= lyrTgt.getZIndex();
                lyrTgt.setZIndex(lyr.getZIndex());
                lyr.setZIndex(zI);
                break;
            }
        }
        
        //Check if Layer switcher and redraw
        var lslist = viewer.getMap().getControlsByClass("Geoportal.Control.LayerSwitcher") ;
        if (lslist.length>0){
            for (var i=0;i<lslist.length;i++){
               lslist[i].redraw();
            }
        }
        
        
    },

    /**
     * APIMethod: moveLayerDown
     * Move the layer's under the layer's below it in the layers' stack.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    moveLayerDown: function(name) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }        
        for (var i= 0, l= viewer.getMap().layers.length; i<l; i++) {
            var lyr= viewer.getMap().layers[i];
            if (lyr.name==name) {//found layer
                if (i==0) { break; } // no layer to move
                var lyrTgt= viewer.getMap().layers[i-1];
                viewer.getMap().layers[i-1]= lyr;
                viewer.getMap().layers[i]= lyrTgt;
                var zI= lyrTgt.getZIndex();
                lyrTgt.setZIndex(lyr.getZIndex());
                lyr.setZIndex(zI);
                break;
            }
        }
        
        //Check if Layer switcher and redraw
        var lslist = viewer.getMap().getControlsByClass("Geoportal.Control.LayerSwitcher") ;
        if (lslist.length>0){
            for (var i=0;i<lslist.length;i++){
               lslist[i].redraw();
            }
        }
    },

    /**
     * APIMethod: addLayer
     * Create a new layer in the current view.
     *
     * Parameters:
     * layerOpts - {Object} the layer's options. The options are :
     *      * type - {String} 'KML', 'WMS', etc ... See
     *      {<Geoportal.Map.addLayer>}() method;
     *      * name - {String} layer's name;
     *      * url - {String} layer's location;
     *      * params - {Object}
     *      * options - {Object}
     */
    addLayer: function(layerOpts) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var lOpts= OpenLayers.Util.extend({
                type:'',
                name:'',
                url:'',
                params:{},
                options:{}
            }, layerOpts);
        switch (lOpts.type) {
        case 'KML'   :
        case 'GPX'   :
        case 'OSM'   :
        case 'GeoRSS':
        case 'GML'   :
        case 'WFS'   :
            OpenLayers.Util.extend(lOpts.options, {
                handlersOptions:{
                    feature:{
                        stopDown:false//allow pan map when drag in feature
                    }
                }
            });
        default      :
            break;
        }
        viewer.getMap().addLayer(lOpts.type, lOpts.name, lOpts.url, lOpts.params, lOpts.options);
    },

    /**
     * APIMethod: removeLayer
     * Delete the layer from the current view.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    removeLayer: function(name) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var lyr= this.getLayer(name);
        if (lyr) {
            lyr.destroy();
        }
    },

    /**
     * APIMethod: addGeoportalLayer
     * Create a new layer in the current view.
     *
     * Parameters:
     * layerOpts - {Object} the layer's options. The options are :
     *      * name - {String} the standard Geoportal Layer name (i.e.
     *      'ORTHOIMAGERY.ORTHOPHOTOS:WMSC')
     *      * options - {String}
     */
    addGeoportalLayer: function(layerOpts) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var lOpts= OpenLayers.Util.extend({
                name:'',
                options:{}
            }, layerOpts);
        viewer.addGeoportalLayer(lOpts.name, lOpts.options);
    },

    /**
     * APIMethod: removeGeoportalLayer
     * Delete the layer from the current view.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    removeGeoportalLayer: function(name) {
        this.removeLayer(name);
    },

    /**
     * APIMethod: setKeys
     * Assign the Geoportal's keys to the viewer.
     *
     * Parameters:
     * key - {Array({String}) | {String}} the API's keys' contracts for this viewer.
     */
    setKeys: function(key) {
        Geoportal.InterfaceViewer.prototype.setKeys.apply(this,arguments);
        // now this.keys= key
        var viewer= this.getViewer();
        var pendingRights= [];
        if (viewer && gGEOPORTALRIGHTSMANAGEMENT) {//auto-conf GPP2
            var map= viewer.getMap();
            var rights= {
                apiKey:[],
                services:OpenLayers.Util.extend({}, gGEOPORTALRIGHTSMANAGEMENT.services)
            };
            for (var i= this.keys.length-1; i>=0; i--) {
                var key= this.keys[i];
                if (map.catalogue[key] && map.catalogue[key].allowedGeoportalLayers.length>0) {
                    // already set key
                    continue;
                }
                var j= OpenLayers.Util.indexOf(gGEOPORTALRIGHTSMANAGEMENT.apiKey, key);
                if (j==-1) {
                    // not yet configured key ...
                    pendingRights.push(key);
                } else {
                    // key not set and configured :
                    rights.apiKey.push(key);
                    rights[key]= OpenLayers.Util.extend({}, gGEOPORTALRIGHTSMANAGEMENT[key]);
                }
            }
            if (this.keys.length>0) {
                if (rights.apiKey.length>0) {
                    this.getViewer().setKeys(rights);
                }
                return;
            }
        } else {
            pendingRights= this.keys.slice(0);
        }
        if (pendingRights.length>0) {
            this.createIf(pendingRights);
        }
    },

    /**
     * APIMethod: setLanguage
     * Change the viewer's current language.
     *
     * Parameters:
     * lang - {String} the language to set.
     */
    setLanguage: function(lang) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        viewer.getMap().setLocale(lang);
    },

    /**
     * APIMethod: setSize
     * Change the viewer's current size.
     *
     * Parameters:
     * w - {String} the viewer's width.
     * h - {String} the viewer's height.
     */
    setSize: function(w, h) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        viewer.setSize(w,h);
    },

    /**
     * APIMethod: setTheme
     * Set the viewer's theme by just loading the given CSS.
     *
     * Parameters:
     * th - {Object} informations usefull for loading a theme. Depends upon
     * the underlaying API. Options are :
     *      * name - {String} the theme's name used to set the path to images;
     *      * styles - {Array({Object})} the css to load, each object contains
     *      the properties :
     *          * css - {String} hyper-reference to the css resource;
     *          * id - {String} the link identifier. If none, use url value;
     *          * anchor - {String} id of the node where to insert the link node.
     *          If none, insertion occurs before the first link/style node found.
     *          '' force appending to the head;
     *          * alpha - {Boolean} when true only insert the CSS for IE6.
     */
    setTheme: function(th) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        viewer.setTheme(th);
    },

    /**
     * APIMethod: addComponent
     * Add a component to the viewer.
     *
     * Parameters:
     * className - {String|Function} the name of the Class supporting the component.
     * options - {Array({Object})} various parameters when initializing the component.
     *
     * Returns:
     * {String} the component's identifier or null on error.
     */
    addComponent: function(className, options) {
        var viewer= this.getViewer();
        if (!viewer) {
            return null;
        }
        if (!OpenLayers.Util.isArray(options)) {
            options= [options];
        }
        var cl= this.mapComponentType(className) || undefined;
        if (typeof(cl)!='function') {
            try {
                if (cl!=Geoportal.InterfaceViewer.UNKNOWNCOMPONENT) {
                    cl= eval(cl);
                }
            } catch (ex) {
                return null;
            }
        }
        if (!cl || typeof(cl)!='function') {
            return null;
        }
        // http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
        // As we receive an array, arguments is an array of the array ...
        var componentCreator= (function() {
            function F() { return cl.prototype.initialize.apply(this,arguments[0]); }
            F.prototype= cl.prototype;
            return function() {
                return new F(arguments[0]);
            } ;
        })();
        var cntrl= componentCreator(options);
        if (!(cntrl instanceof OpenLayers.Control)) {
            cntrl= null;
            return null;
        }
        viewer.getMap().addControls([cntrl]);
        return cntrl.id;
    },

    /**
     * APIMethod: removeComponent
     * Remove a component from the viewer.
     *
     * Parameters:
     * id - {String} the component's identifier.
     */
    removeComponent: function(id) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var cntrl= this.getComponent(id);
        if (cntrl) {
            cntrl.destroy();
        }
    },

    /**
     * APIMethod: modifyComponent
     * Modify a component from the viewer.
     *
     * Parameters:
     * id - {String} the component's identifier.
     * options - {Object} various options to be modified for the component.
     */
    modifyComponent: function(id, options) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var cntrl= this.getComponent(id);
        if (cntrl) {
            OpenLayers.Util.extend(cntrl, options);
        }
    },

    /**
     * APIMethod: toggleComponent
     * Show or hide a viewer's component. A component is an
     * {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} when using {<Geoportal/InterfaceViewer/JS>}.
     *
     * Parameters:
     * id - {String} the component's identifier.
     * minimize - {Boolean} true to minimize, false otherwise.
     */
    toggleComponent: function(id, minimize) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var cntrl= this.getComponent(id);
        if (typeof(cntrl.toggleControls)=='function') {
            cntrl.toggleControls(minimize);
        }
    },

    /**
     * APIMethod: iconifyComponent
     * Minimize or maximize a viewer's component. A component is an
     * {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} when using {<Geoportal/InterfaceViewer/JS>}.
     *
     * Parameters:
     * id - {String} the component's identifier.
     * iconify - {Boolean} true to iconify, false otherwise.
     */
    iconifyComponent: function(id, iconify) {
        var viewer= this.getViewer();
        if (!viewer) {
            return;
        }
        var cntrl= this.getComponent(id);
        if (typeof(cntrl.showControls)=='function') {
            cntrl.showControls(iconify);
        }
    },

    /**
     * APIMethod: mapComponentType
     * Return the OpenLayers component's class name mapped with the given type.
     *
     * (code)
     * Component mapping :
     * +----------------------------------------------------+--------------------------------------------+
     * | InterfaceViewer                                    | Geoportal, OpenLayers                      |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.MouseNavigation     | OpenLayers.Control.Navigation              |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.KeyboardNavigation  | OpenLayers.Control.KeyboardDefaults        |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.PanPanel            | OpenLayers.Control.PanPanel                |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.ZoomBar             | OpenLayers.Control.ZoomPanel               |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.Compass             | Geoportal.InterfaceViewer.UNKNOWNCOMPONENT |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.GraphicScale        | Geoportal.Control.GraphicScale             |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.OverviewMap         | Geoportal.Control.OverviewMap              |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.Graticule           | OpenLayers.Control.Graticule               |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.ZoomBox             | OpenLayers.Control.ZoomBox                 |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.MousePosition       | Geoportal.Control.MousePosition            |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.FullScreen          | Geoportal.InterfaceViewer.UNKNOWNCOMPONENT |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.2D3DSwitcher        | Geoportal.InterfaceViewer.UNKNOWNCOMPONENT |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Information.FeatureInfoDisplay | OpenLayers.Control.WMSGetFeatureInfo       |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LayerSwitcher                  | Geoportal.Control.LayerSwitcher            |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LayerCatalog                   | Geoportal.InterfaceViewer.UNKNOWNCOMPONENT |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.NavToolbar          | Geoportal.Control.NavToolbar               |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.Information         | Geoportal.Control.Information              |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LegalNotice.Copyright          | Geoportal.Control.Copyright                |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LegalNotice.Logo               | Geoportal.Control.Logo                     |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LegalNotice.PermanentLogo      | Geoportal.Control.PermanentLogo            |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LegalNotice.TermsOfService     | Geoportal.Control.TermsOfService           |
     * +----------------------------------------------------+--------------------------------------------+
     * | other type                                         | kept as is                                 |
     * +----------------------------------------------------+--------------------------------------------+
     * (end)
     *
     * Parameters:
     * type - {String} the component's type for which one gets its mapping.
     *
     * Returns:
     * {String | Function} the mapped component's type. If none,
     * Geoportal.InterfaceViewer.UNKNOWNCOMPONENT.
     */
    mapComponentType: function(type) {
        var type2= Geoportal.InterfaceViewer.prototype.mapComponentType.apply(this, arguments);
        switch (type2) {
        case 'Geoportal.Component.Navigation.MouseNavigation'    : type= 'OpenLayers.Control.Navigation'; break;
        case 'Geoportal.Component.Navigation.KeyboardNavigation' : type= 'OpenLayers.Control.KeyboardDefaults'; break;
        case 'Geoportal.Component.Navigation.PanPanel'           : type= 'OpenLayers.Control.PanPanel'; break;
        case 'Geoportal.Component.Navigation.ZoomBar'            : type= 'OpenLayers.Control.ZoomPanel'; break;
        case 'Geoportal.Component.Navigation.Compass'            :
        case 'Geoportal.Component.Navigation.FullScreen'         :
        case 'Geoportal.Component.Navigation.2D3DSwitcher'       : type= Geoportal.InterfaceViewer.UNKNOWNCOMPONENT; break;
        case 'Geoportal.Component.LayerCatalog'                  : type= 'Geoportal.Control.LayerCatalog'; break;
        case 'Geoportal.Component.Navigation.GraphicScale'       : type= 'Geoportal.Control.GraphicScale'; break;
        case 'Geoportal.Component.Navigation.OverviewMap'        : type= 'Geoportal.Control.OverviewMap'; break;
        case 'Geoportal.Component.Navigation.Graticule'          : type= 'OpenLayers.Control.Graticule'; break;
        case 'Geoportal.Component.Navigation.ZoomBox'            : type= 'OpenLayers.Control.ZoomBox'; break;
        case 'Geoportal.Component.Navigation.MousePosition'      : type= 'Geoportal.Control.MousePosition'; break ;
        case 'Geoportal.Component.Information.FeatureInfoDisplay': type= 'OpenLayers.Control.WMSGetFeatureInfo'; break;
        case 'Geoportal.Component.LayerSwitcher'                 : type= 'Geoportal.Control.LayerSwitcher'; break;
        case 'Geoportal.Component.Navigation.NavToolbar'         : type= 'Geoportal.Control.NavToolbar'; break;
        case 'Geoportal.Component.Navigation.Information'        : type= 'Geoportal.Control.Information'; break;
        case 'Geoportal.Component.LegalNotice.Copyright'         : type= 'Geoportal.Control.Copyright'; break;
        case 'Geoportal.Component.LegalNotice.Logo'              : type= 'Geoportal.Control.Logo'; break;
        case 'Geoportal.Component.LegalNotice.PermanentLogo'     : type= 'Geoportal.Control.PermanentLogo'; break;
        case 'Geoportal.Component.LegalNotice.TermsOfService'    : type= 'Geoportal.Control.TermsOfService'; break;
        default                                                  : type= type || type2; break;
        }
        return type;
    },

    /**
     * Method: getLayer
     * Retrieve a layer by its name
     *
     * Parameters:
     * name - {String} the layer's name
     *
     * Returns:
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} or null
     */
    getLayer: function(name) {
        var Ls= this.getViewer().getMap().getLayersByName(name);
        if (!Ls || Ls.length==0) { return null; }
        for (var i= 0, l= Ls.length; i<l; i++) {
            var lyr= Ls[i];
            if (lyr.isBaseLayer) { continue; }
            return lyr;
        }
        return null;
    },

    /**
     * Method: getComponent
     * Retrieve a component by its id
     *
     * Parameters:
     * id - {String} the component's id
     *
     * Returns:
     * {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} or null
     */
    getComponent: function(id) {
        var Ls= this.getViewer().getMap().getControlsBy("id",id);
        if (!Ls || Ls.length==0) { return null; }
        return Ls[0];
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.InterfaceViewer.JS"*
     */
    CLASS_NAME: "Geoportal.InterfaceViewer.JS"
});
