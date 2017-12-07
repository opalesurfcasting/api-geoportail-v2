/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/InterfaceViewer.js
 */
/**
 * Class: Geoportal.InterfaceViewer.Flash
 * The Geoportal Flash viewer interface class.
 *
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple1.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple2.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple3.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple4.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple5.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple6.html>
 *
 */
Geoportal.InterfaceViewer.Flash= OpenLayers.Class(Geoportal.InterfaceViewer, {

    /**
     * viewerOpts object passed for InterfaceViewer contruction
     */
    viewerOpts: null,

    /**
     * Constructor: Geoportal.InterfaceViewer.Flash
     * Create an interface between the web page and the {Flash} object.
     *
     * Parameters:
     * div - {String | DOMElement} Id of the DIV tag in which you want
     *       to insert your flash application.
     * options - {Object} Optional object with properties to tag onto the map.
     *           Options are :
     *      * keys - {Array({String}) | {String}} the API's keys' contracts
     *      for this viewer.
     *      * viewerLoadedCallback - {Function} the function to be called when the
     *      viewer has triggered the "viewerloaded" event. This event returns
     *      the viewer object.
     *      * viewerClass - {String} optional, the Flash component to communicate with.
     *      For instance, when using 'geoportalFx.swf', set this option to
     *      'geoportalFx'. Defaults to *'geoportalFxMin'*.
     *      * viewerOpts - {Object} Any options usefull for handling over to the
     *      Flash object.
     */
    initialize: function(div, options) {

        Geoportal.InterfaceViewer.prototype.initialize.apply(this, arguments);

        // keep viewerOpts
        this.viewerOpts= options || {};

        var flashvars= options.flashvars || {};

        this.viewerClass= options.viewerClass || "Geoportal.Viewer.Standard" ;

        if (this.viewerOpts) {

            // API keys
            if (options.keys) {
                flashvars.keys= options.keys;
            }
            
            // callback when "viewerloaded" is triggered
            if (options.viewerLoadedCallback) {
                this.viewerLoadedCallback= options.viewerLoadedCallback ;
            }

        } // if viewerOpts

        this._loadSwf(div,flashvars) ;
    },

    /**
     * Method: _loadSwf
     * This function loads the flash API into the HTML page.
     *         
     * Parameters:
     * div - {String} div's identifier that will contain the flash object.
     * flashvars - {Object} options to pass to flash object.
     */
    _loadSwf: function(div, flashvars){

        // var viewerId= this.viewerClass ;
        // var viewerId= div ;
        // obtention de la taille en pixel de la div
        var divElem= OpenLayers.Util.getElement(div);
        var dimensions= {
          width:divElem.offsetWidth,
          height:divElem.offsetHeight
        } ;
        var swfVersionStr= "10.0.0";
        var xiSwfUrlStr= "playerProductInstall.swf";
        var params= {};
        params.quality= "high";
        params.bgcolor= "#ffffff";
        params.allowscriptaccess= "always"; // FIXME : "sameDomain"
        params.allowfullscreen= "true";
        params.wmode= "transparent";
        var attributes= {};
        attributes.id= div; // FIXME : viewer ?
        //attributes.name= this.viewerClass; // FIXME : id.
        attributes.name= div; // FIXME : id.
        attributes.align= "left";
        swfobject.embedSWF(
            this.viewerClass + ".swf", div,
            dimensions.width+"px", dimensions.height+"px",
            swfVersionStr, xiSwfUrlStr,
            flashvars, params, attributes, OpenLayers.Function.bind(this.onSWFLoaded,this));
        swfobject.createCSS("#" + div, "display:block;text-align:left;");
    },

    /**
     * APIMethod: onSWFLoaded
     * Callback function called when swf loaded.
     *      Register viewer for events management.
     *      register for "viewerloaded" event.
     *
     * Parameters:
     * evt - {Event}
     */
    onSWFLoaded: function(evt)  {
        if (evt.success) {
            this.setViewer(evt.ref) ;
            this.id= evt.id ;
            // Geoportal.InterfaceViewer.registerViewer(this.id, this.getViewer()) ;
            Geoportal.InterfaceViewer.registerViewer(this.id, this) ;

            if (this.viewerLoadedCallback) {
                this.addEvent("viewerloaded",OpenLayers.Function.bind(this.viewerLoadedCallback,this)) ;
            }
        }
    },

    /**
     * APIMethod: mapEventType
     * Return the underlaying event's type mapped with the given type.
     *
     * (code)
     * Events mapping:
     * +--------------------+-----------------------+
     * | InterfaceViewer    | Geoportal, OpenScales |
     * +--------------------+-----------------------+
     * | centerchanged      | centerchanged         |
     * +--------------------+-----------------------+
     * | zoomchanged        | zoomchanged           |
     * +--------------------+-----------------------+
     * | orientationchanged |                       |
     * +--------------------+-----------------------+
     * | layerchanged       | layerchanged          |
     * +--------------------+-----------------------+
     * | layeradded         | layeradded            |
     * +--------------------+-----------------------+
     * | layerremoved       | layerremoved          |
     * +--------------------+-----------------------+
     * | componentchanged   | componentchanged      |
     * +--------------------+-----------------------+
     * | viewerloaded       | viewerloaded          |
     * +--------------------+-----------------------+
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
        case 'componentchanged'        :
        case 'centerchanged'           :
        case 'zoomchanged'             :
        case 'layerchanged'            :
        case 'layeradded'              :
        case 'layerremoved'            :
        case 'viewerloaded'            :
        default                        :                           break;
        }
        return type;
    },

    /**
     * APIMethod: zoomIn
     * Increase the map's zoom level by one.
     */
    zoomIn: function() {
        if (!this.getViewer()) { return; }
        if (this.getViewer().zoomIn) {
            this.getViewer().zoomIn() ;
        }
        return;
    },

    /**
     * APIMethod: zoomOut
     * Decrease the map's zoom level by one.
     */
    zoomOut: function() {
        if (!this.getViewer()) { return; }
        if (this.getViewer().zoomOut) {
            this.getViewer().zoomOut() ;
        }
        return;
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
        if (!this.getViewer()) { return; }
        if (this.getViewer().panMap){
            this.getViewer().panMap(p.x, p.y);
        }
        return;
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
        if (!this.getViewer()) { return; }

        if (this.getViewer().setZoomLevel && zoom.toString().indexOf(".") == -1) {
            this.getViewer().setZoomLevel(zoom);
        } else if (this.getViewer().setZoomToResolution) {
            this.getViewer().setZoomToResolution(zoom);
        } else {
            OpenLayers.Console.warn(OpenLayers.i18n("setZoom PB")) ;
        }
        return;
    },

    /**
     * APIMethod: setCameraOrientation
     * Assign the camera's heading and tilt.
     *
     * Parameters:
     * heading - {Number} the heading (values between 0 and 360 degrees).
     * tilt - {Number} the tilt (values between 0 and 90 degrees).
     */
    setCameraOrientation: function(heading, tilt) {
        if (!this.getViewer()) { return; }
        OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] setCameraOrientation() not yet implemented"));//TODO: i18n
        return;
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
      if (!this.getViewer()) { return; }
      if (typeof(lat)=="number" && typeof(lon)=="number" && this.getViewer().setCenterD) {
        this.getViewer().setCenterD(lat, lon);
      }    else if (typeof(lat)=="string" && typeof(lon)=="string" && this.getViewer().setCenterS) {
        this.getViewer().setCenterS(lat, lon);
      } else {
          OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] setCenter() PB"));//TODO: i18n
      }
      return;
    },

    /**
     * APIMethod: setProxy
     * Assign the proxy URL for the map.
     *
     * Parameters:
     * proxyUrl - {String} the proxy URL
     */
    setProxy: function(proxyUrl) {
        if (!this.getViewer() || !this.getViewer().setProxy) { return; }
        this.getViewer().setProxy(proxyUrl) ;
    },

    /**
     * APIMethod: setNoProxyDomains
     * Assign the domains for which no proxy will be used
     *
     * Parameters:
     * noProxyDomains - {Array} the list of domains
     */
    setNoProxyDomains: function(noProxyDomains) {
        if (!this.getViewer() || !this.getViewer().setNoProxyDomains) { return; }
        if (noProxyDomains && !OpenLayers.Util.isArray(noProxyDomains)) {
          noProxyDomains= [noProxyDomains];
        }
        this.getViewer().setNoProxyDomains(noProxyDomains) ;
    },

    /**
     * APIMethod: setCenterAtLocation
     * Center the map at the given location.
     *
     * Parameters:
     * location - {Object} various ways of dealing with map's center. Could
     * be:
     *      * center - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} coordinates in WGS84 longitude,
     *        latitude;
     *      * lon - {String | Number} longitude in WGS84;
     *      * lat - {String | Number} latitude in WGS84;
     *      * place - {String} place's name (needs proxyUrl set to work);
     *      * address - {String} location in term of "street,zip code,place"
     *        (needs proxyUrl set to work - FIXME: JSONP);
     *      * geolocate - {Boolean} if true use geolocation API ;
     *      * heading - {String | Number} camera's heading in WGS84;
     *      * tilt - {Number} camera's tilt in decimal degrees ;
     *      * onCentered - {Function} after centering, call this function in
     *      the context of the viewerInterface.
     */
    setCenterAtLocation: function(location) {
        if (!this.getViewer()) { return; }
        if (location.geolocate===true && navigator.geolocation) {
            // geolocation is not supported by Flash!

            location.options= location.options || {};
            var geoOptions= {
                'enableHighAccuracy': location.options.enableHighAccuracy || false,
                'timeout'           : location.options.timeout || 10000,
                'maximumAge'        : location.options.maximumAge || 0
            };
            navigator.geolocation.getCurrentPosition(
                OpenLayers.Function.bind(function(p) { // onLocationFound
                    this.setCenter(p.coords.longitude, p.coords.latitude);
                    if (location.onCentered) {
                        location.onCentered(this,[]);
                    }
                }, this),
                OpenLayers.Function.bind(function(r) { // onLocationNotFound
                    OpenLayers.Console.warn(r);
                }, this),
                geoOptions
            );
            return;
        }
        if ((location.place || location.address) && this.getViewer().centerAtLocation) {
            this.getViewer().centerAtLocation(location.place?location.place:location.address) ;
            return ;
        }
        OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] setCenterAtLocation() not fully implemented"));//TODO: i18n
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
        if (!this.getViewer()) { return; }
        if (this.getViewer().setLayerVisibility) {
            this.getViewer().setLayerVisibility(name,visibility) ;
        } else {
            OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] setLayerVisibility() PB"));//TODO: i18n
        }
        return;
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
        if (!this.getViewer()) { return; }
        if (this.getViewer().setLayerOpacity) {
            this.getViewer().setLayerOpacity(name,opacity) ;
        } else {
            OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] setLayerOpacity() PB"));//TODO: i18n
        }
        return;
    },

    /**
     * APIMethod: moveLayerUp
     * Move the layer's on top of the layer's above it in the layers' stack.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    moveLayerUp: function(name) {
        if (!this.getViewer()) { return; }
        if (this.getViewer().moveLayer){
            this.getViewer().moveLayer(name, "UP");
        }
        return;
    },

    /**
     * APIMethod: moveLayerDown
     * Move the layer's under the layer's below it in the layers' stack.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    moveLayerDown: function(name) {
        if (!this.getViewer()) { return; }
        if (this.getViewer().moveLayer){
            this.getViewer().moveLayer(name, "DOWN");
        }
        return;
    },

    /**
     * APIMethod: addLayer
     * Create a new layer in the current view.
     *
     * Parameters:
     * layerOpts - {Object} the layer's options : 
     *             identifier : the identifier of the layer to add
     *             name :       the displayed name of the layer
     *             protocol :   the name of the protocol (WMTS, WFS, WMS, KML, GPX or GeoRss)
     *             version :    the version of the protocol
     *             url :        the url of the data to add
     *             typename :   the identifier of the layer used with the protocol
     *             projection : the projection of the layer to use 
     *             format :     the layer image format (mime type)
     *             singleTile : shall the layer be queried in single tile or not (WMS)
     *             tileMatrixSet : the tileMatrixSet to use (WMTS)
     *             style :      the style to use (WMTS)
     *             displayInLayerSwitcher : shall the layer be displayed in the layer switcher
     */
    addLayer: function(layerOpts) {
        if (!this.getViewer()) { return; }
        if (this.getViewer().addLayer) {
            if (typeof(layerOpts.projection)=="undefined") layerOpts.projection = "";
            if (typeof(layerOpts.version)=="undefined") layerOpts.version = "";
            if (typeof(layerOpts.format)=="undefined") layerOpts.format = "";
            if (typeof(layerOpts.singleTile)=="undefined") layerOpts.singleTile = false;
            if (typeof(layerOpts.tileMatrixSet)=="undefined") layerOpts.tileMatrixSet = "";
            if (typeof(layerOpts.identifier)=="undefined") layerOpts.identifier= layerOpts.name ;
            if (typeof(layerOpts.displayInLayerSwitcher)=="undefined") layerOpts.displayInLayerSwitcher= true ;
            this.getViewer().addLayer(
                layerOpts.identifier, 
                layerOpts.name,       // displayName
                layerOpts.protocol, 
                layerOpts.version, 
                layerOpts.url, 
                layerOpts.typename, 
                layerOpts.projection, 
                layerOpts.format,
                layerOpts.singleTile,
                layerOpts.tileMatrixSet,
                layerOpts.style,
                layerOpts.displayInLayerSwitcher
            );
        } else {
            OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] addLayer() PB "));//TODO: i18n
        }
        return;
    },

    /**
     * APIMethod: removeLayer
     * Delete the layer from the current view.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    removeLayer: function(name) {
        if (!this.getViewer()) { return; }
        if (this.getViewer().removeLayer){
            this.getViewer().removeLayer(name);
        }
        return;
    },

    /**
     * APIMethod: addGeoportalLayer
     * Create a new layer in the current view.
     *
     * Parameters:
     * layerId - {Object} the layer's identifier. The content of this parameter
     * depends on the viewer. See {<Geoportal.InterfaceViewer.JS>},
     * {<Geoportal.InterfaceViewer.Flash>} for more informations.
     */
    addGeoportalLayer: function(layerId) {
        if (!this.getViewer()) { return; }
        if (this.getViewer().addGeoportalLayer) {
            this.getViewer().addGeoportalLayer(layerId) ;
        } else {
            OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] addGeoportalLayer() PB"));//TODO: i18n
        }
        return;
    },

    /**
     * APIMethod: removeGeoportalLayer
     * Delete the layer from the current view.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    removeGeoportalLayer: function(name) {
      if (!this.getViewer()) { return; }
      if (this.getViewer().removeLayer){
          this.getViewer().removeLayer(name);
      }
      return;
    },

    /**
     * APIMethod: setKeys
     * Assign the Geoportal's keys to the viewer.
     *
     * Parameters:
     * key - {Array({String}) | {String}} the API's keys' contracts for this viewer.
     */
    setKeys: function(key) {

        if (!this.getViewer()) { return; }
        if (!key) {
            key= this.keys;
        }
        if (key && !OpenLayers.Util.isArray(key)) {
            key= [key];
        }
        this.keys= key;
        // do something now !
        if (this.getViewer().setKeys) {
          this.getViewer().setKeys(key) ;
        } else {
          OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] setKeys() PB"));//TODO: i18n
        }
        return;
    },

    /**
     * APIMethod: setLanguage
     * Change the viewer's current language.
     *
     * Parameters:
     * lang - {String} the language to set.
     */
    setLanguage: function(lang) {
        if (!this.getViewer() || !this.getViewer().setLanguage) { return; }
        this.getViewer().setLanguage(lang);
        return;
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
        if (!this.getViewer() || !this.getViewer().setSize) { return; }
        if (this.getViewer().width != w || this.getViewer().height != h) {
            this.getViewer().width = w;
            this.getViewer().height = h;
        }
        return;
    },

    /**
     * APIMethod: setTheme
     * Set the viewer's theme.
     *
     * Parameters:
     * th - {Object} informations usefull for loading a theme. Depends upon
     * the underlaying API.
     */
    setTheme: function(th) {
        if (!this.getViewer() || !this.getViewer().setTheme) { return; }
        this.getViewer().setTheme(th) ;
        // OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] setTheme() not yet implemented"));//TODO: i18n
        return;
    },

    /**
     * APIMethod: addComponent
     * Add a component to the viewer.
     *
     * Parameters:
     * className - {String} the name of the component.
     * options - {Object} various options when initializing the component.
     *
     * Returns:
     * {String} the component's identifier or null on error.
     */
    addComponent: function(className, options) {
        if (!this.getViewer()) { return null; }
        var id= null;
        if (this.getViewer().addControl) {
          id= this.getViewer().addControl(this.mapComponentType(className), options) ;
        } else {
          OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] addComponent() PB"));//TODO: i18n
        }
        return id;
    },

    /**
     * APIMethod: removeComponent
     * Remove a component from the viewer.
     *
     * Parameters:
     * id - {String} the component's identifier.
     */
    removeComponent: function(id) {
        if (!this.getViewer()) { return; }
        if (this.getViewer().deleteControl) {
          this.getViewer().deleteControl(this.mapComponentType(id)) ;
        } else {
          OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] removeComponent() PB"));//TODO: i18n
        }
        return;
    },

    /**
     * APIMethod: toggleComponent
     * Show or hide a viewer's component.
     *
     * Parameters:
     * id - {String} the component's identifier.
     * minimize - {Boolean} true to minimize, false otherwise.
     */
    toggleComponent: function(id, minimize) {
        if (!this.getViewer()) { return; }
        if (this.getViewer().toggleControl) {
            this.getViewer().toggleControl(this.mapComponentType(id),minimize) ;
        } else {
            OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] toggleComponent() PB"));//TODO: i18n
        }
        return;
    },

    /**
     * APIMethod: iconifyComponent
     * Minimize or maximize a viewer's component.
     *
     * Parameters:
     * id - {String} the component's identifier.
     * iconify - {Boolean} true to iconify, false otherwise.
     */
    iconifyComponent: function(id, iconify) {
        if (!this.getViewer()) { return; }
        if (this.getViewer().iconifyControl) {
            if (iconify) {
                this.getViewer().iconifyControl(this.mapComponentType(id)) ;
            } else {
                this.getViewer().toggleControl(this.mapComponentType(id)) ;
            }
        } else {
          OpenLayers.Console.warn(OpenLayers.i18n("[GPP3] iconifyComponent() PB"));
        }
        return;
    },


    /**
     * APIMethod: mapComponentType
     * Return the OpenLayers component's class name mapped with the given type.
     *
     * (code)
     * Component mapping :
     * +----------------------------------------------------+--------------------------------------------+
     * | InterfaceViewer                                    | Geoportal, OpenScales                      |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.MouseNavigation     | mousenavigation                            |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.KeyboardNavigation  | keyboardnavigation                         |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.PanPanel            | panpanel                                   |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.ZoomBar             | zoombar                                    |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.Compass             | compass                                    |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.GraphicScale        | graphicscale                               |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.OverviewMap         | overviewmap                                |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.Graticule           | graticule                                  |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.ZoomBox             | zoombox                                    |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.MousePosition       | mouseposition                              |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.FullScreen          | Geoportal.InterfaceViewer.UNKNOWNCOMPONENT |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.2D3DSwitcher        | Geoportal.InterfaceViewer.UNKNOWNCOMPONENT |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Information.FeatureInfoDisplay | featureinfodisplay                         |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LayerSwitcher                  | layerswitcher                              |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LayerCatalog                   | layercatalog                               |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.NavToolbar          | Geoportal.InterfaceViewer.UNKNOWNCOMPONENT |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.Navigation.Information         | information                                |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LegalNotice.Copyright          | copyright                                  |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LegalNotice.Logo               | logo                                       |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LegalNotice.PermanentLogo      | permanentlogo                              |
     * +----------------------------------------------------+--------------------------------------------+
     * | Geoportal.Component.LegalNotice.TermsOfService     | termsofservice                             |
     * +----------------------------------------------------+--------------------------------------------+
     * | other type                                         | kept as is                                 |
     * +----------------------------------------------------+--------------------------------------------+
     * (end)
     *
     * Parameters:
     * type - {String} the component's type for which one gets its mapping.
     *
     * Returns:
     * {String} the mapped component's type. If none,
     * Geoportal.InterfaceViewer.UNKNOWNCOMPONENT.
     */
    mapComponentType: function(type) {
        var type2= Geoportal.InterfaceViewer.prototype.mapComponentType.apply(this, arguments);
        switch(type2) {
        case 'Geoportal.Component.Navigation.MouseNavigation'    : type= 'mousenavigation'; break;
        case 'Geoportal.Component.Navigation.KeyboardNavigation' : type= 'keyboardnavigation'; break;
        case 'Geoportal.Component.Navigation.PanPanel'           : type= 'panpanel'; break;
        case 'Geoportal.Component.Navigation.ZoomBar'            : type= 'zoombar'; break;
        case 'Geoportal.Component.Navigation.Compass'            : type= 'compass' ; break ;
        case 'Geoportal.Component.LayerCatalog'                  : type= 'layercatalog' ; break;
        case 'Geoportal.Component.Navigation.GraphicScale'       : type= 'graphicscale'; break;
        case 'Geoportal.Component.Navigation.Graticule'          : type= 'graticule'; break;
        case 'Geoportal.Component.Navigation.ZoomBox'            : type= 'zoombox'; break;
        case 'Geoportal.Component.Navigation.MousePosition'      : type= 'mouseposition'; break ;
        case 'Geoportal.Component.Information.FeatureInfoDisplay': type= 'featureinfodisplay'; break;
        case 'Geoportal.Component.LayerSwitcher'                 : type= 'layerswitcher'; break;
        case 'Geoportal.Component.Navigation.Information'        : type= 'information'; break;
        case 'Geoportal.Component.LegalNotice.Copyright'         : type= 'copyright'; break;
        case 'Geoportal.Component.LegalNotice.Logo'              : type= 'logo'; break;
        case 'Geoportal.Component.LegalNotice.PermanentLogo'     : type= 'permanentlogo'; break;
        case 'Geoportal.Component.LegalNotice.TermsOfService'    : type= 'termsofservice'; break;
        case 'Geoportal.Component.Navigation.OverviewMap'        : type= 'overviewmap'; break;
        case 'Geoportal.Component.Navigation.FullScreen'         :
        case 'Geoportal.Component.Navigation.NavToolbar'         : 
        case 'Geoportal.Component.Navigation.2D3DSwitcher'       : type= Geoportal.InterfaceViewer.UNKNOWNCOMPONENT; break;
        default                                                  : type= type || type2; break;
        }
        return type;

    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.InterfaceViewer.Flash"*
     */
    CLASS_NAME: "Geoportal.InterfaceViewer.Flash"
});
