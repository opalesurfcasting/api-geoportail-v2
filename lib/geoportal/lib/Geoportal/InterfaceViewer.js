/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Class: Geoportal.InterfaceViewer
 * The Geoportal viewer interface abstract base class.
 *
 * See <this geoportalMap_simple1 example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple1.html>
 * See <this geoportalMap_simple2 example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple2.html>
 * See <this geoportalMap_simple3 example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple3.html>
 * See <this geoportalMap_simple4 example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple4.html>
 * See <this geoportalMap_simple5 example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple5.html>
 * See <this geoportalMap_simple6 example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple6.html>
 *
 */
Geoportal.InterfaceViewer= OpenLayers.Class({

    /**
     * Constant: EVENT_TYPES
     * {Array(String)} Supported application event types.  Register a listener
     *     for a particular event with the following syntax:
     * (code)
     * iviewer.events.register(type, obj, listener);
     * (end)
     *
     * Supported viewer event types:
     *  - *viewerloaded* triggered when the view creation completes ;
     *  - *centerchanged* triggered after a drag, pan, or zoom completes ;
     *  - *zoomchanged* triggered after a zoom completes ;
     *  - *orientationchanged* triggered after camera's orientation completes ;
     *  - *layerchanged* triggered after a layer property change ;
     *  - *layeradded* triggered after a layer has been added ;
     *  - *layerremoved* triggered after a layer has been removed ;
     *  - *componentchanged* triggered after a component property change ;
     */
    EVENT_TYPES:[
        "viewerloaded",
        "centerchanged",
        "zoomchanged",
        "orientationchanged",
        "layerchanged",
        "layeradded",
        "layerremoved",
        "componentchanged"
    ],

    /**
     * Property: _vobject
     * {Object} The object viewer this object communicates with.
     */
    _vobject: null,

    /**
     * Property: id
     * {String} Unique identifier for the viewer.
     */
    id: null,

    /**
     * APIProperty: div
     * {DOMElement} The Geoportal viewer div.
     */
    div: null,

    /**
     * APIProperty: keys
     * {Array({String})} the API's keys' contracts for this viewer.
     */
    keys: null,

    /**
     * Property: viewerLoadedCallback
     * {Function} Callback associated with "viewerloaded" event.
     */
    viewerLoadedCallback: null,

    /**
     * APIProperty: viewerClass
     * viewerClass - {Function|String} the viewer class to use.
     */
    viewerClass: null,

    /**
     * APIProperty: events
     * {<OpenLayers.Events at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html>}
     * An events object that handles all events on the map
     */
    events: null,

    /**
     * APIProperty: fallThrough
     * {Boolean} Should OpenLayers allow events on the viewer to fall through to
     *           other elements on the page, or should it swallow them? (#457)
     *           Default is to fall through.
     */
    fallThrough: true,

    /**
     * APIProperty: eventListeners
     * {Object} If set as an option at construction, the eventListeners
     *     object will be registered with <OpenLayers.Events.on at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html#OpenLayers.Events.on>.
     *     Object structure must be a listeners object as shown in the example for
     *     the events.on method.
     */
    eventListeners: null,

    /**
     * Constructor: Geoportal.InterfaceViewer
     * Create an interface between the web page and the viewer object.
     *      This interface listens to viewer's events like "centerchanged",
     *      "zoomchanged", "orientationchanged" (only with 3D API),
     *      "layerchanged", "layeradded", "layerremoved" and "componentchanged".
     *      These events may be triggered by the viewer's embeded map.
     *
     *      Event's structure :
     *
     *      For "componentChanged", "mapzoomchanged", "mapcenterchanged" :
     *      * eventName - {String} the name of the event occured on the map ;
     *      * componentName - {String} the name of the component who has changed ;
     *      * componentIconified - {Boolean} the state of the component (true
     *      if iconified or false if toggled) ;
     *      * zoomLevel - {Number} current map's zoom level ;
     *      * resolution - {Number} current map's resolution ;
     *      * dx - {Number} longitude in decimal degrees ;
     *      * dy - {Number} latitude in decimal degrees ;
     *      * sx - {Number} longitude in sexagecimal degrees ;
     *      * sy - {Number} latitude in sexagecimal degrees ;
     *
     *      For "addlayer", "removelayer", "layerOpacityChanged",
     *      "visibilitychanged", "layerMovedUp", "layerMovedDown" :
     *      * eventName - {String} the name of the event occured on the map ;
     *      * layerName - {String} the name of the layer ;
     *      * layerOpacity - {Number} the opacity value of the layer ;
     *      * layerVisibility - {Boolean} rue if the layer is visible, false
     *      otherwise ;
     *
     *      FIXME: zoomLevel, resolution, dx, dy, sx, sy for "mapzoomchanged"
     *      and "mapcenterchanged" only ?
     *      FIXME: there are more events in the flex code than in the
     *      specifications (componentChanged, mapzoomchanged,
     *      mapcenterchanged, removelayer, layerOpacityChanged,
     *      visibilitychanged, layerMovedUp, layerMovedDown are triggered in
     *      geoportal.ahn.JsBinder flex class) ?
     *
     *      From Flash/3D to JavaScript :
     *      Communication between the Flash application and the web page is
     *      handled through the use of events triggered by the Flash side (on
     *      the way back, use the methods from {<Geoportal.InferfaceViewer>}).
     *      In order to trigger a JavaScript event, the Flash application has
     *      to :
     *      * build a serialized JSON object with all the relevant
     *      informations (see above) put in a *jsonData* property;
     *      * call {<Geoportal.InterfaceViewer.triggerEvent>}() via the
     *      ExternalInterface with the serialized JSON object. This function
     *      will then create an {Event} from the serialized JSON parameter,
     *      and trigger the Javascript event using the viewer's container as
     *      DOM element. Whenever the {<Geoportal.InterfaceViewer>} listens to
     *      this event's type, this event may be used in a registered
     *      callback.
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
     *      * viewerClass - {Object} mandatory, the viewer to communicate with. See
     *      {<Geoportal.InterfaceViewer.JS>},
     *      {<Geoportal.InterfaceViewer.Flash>} for more information.
     */
    initialize: function(div, options) {
        OpenLayers.Util.extend(this, options);

        this.div= OpenLayers.Util.getElement(div);
        this.id= null;
        this._vobject= null;

        if (this.keys) {
            if (!OpenLayers.Util.isArray(this.keys)) {
                this.keys= [this.keys];
            }
        } else {
            this.keys= [];
        }

        this.events= new OpenLayers.Events(this, this.div, this.EVENT_TYPES, this.fallThrough, {
            includeXY: false
        });
        if (this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
    },

    /**
     * APIMethod: destroy
     * Clean things up !
     */
    destroy: function () {
        if (this.eventListeners) {
            this.events.un(this.eventListeners);
            this.eventListeners= null;
        }
        this.events.destroy();
        this.events= null;
        this._vobject= null;
        this.viewerClass= null;
        this.viewerLoadedCallback= null;
        this.keys= null;
        if (this.id) {
            Geoportal.InterfaceViewer.unregisterViewer(this.id);
        }
        this.id= null;
        this.div= null;
    },

    /**
     * APIMethod: onViewerLoaded
     * Assign the id and viewer properties as well as call the user's defined
     * callback for "viewerloaded" event's type.
     *      The function must assign the viewer's id and value through
     *      {<Geoportal.InterfaceViewer.registerViewer>}() function.
     */
    onViewerLoaded: function(evt) {
        this.id= evt.jsonData.id;
        this._vobject= evt.jsonData.viewer;
        Geoportal.InterfaceViewer.registerViewer(this.id, this._vobject);
        if (this.viewerLoadedCallback) {
            this.viewerLoadedCallback.apply(this,[evt]);
        }
    },

    /**
     * APIMethod: setViewer
     * Assign the interfaced viewer.
     *      FIXME: not in <SFD at https://geoportail.forge.ign.fr/documentation/api/sfd/description-fonctionnelle/api-haut-niveau.html>
     *
     * Parameters:
     * v - {Object} the viewer
     */
    setViewer: function(v) {
        this._vobject= v;
    },

    /**
     * APIMethod: getViewer
     * Return the interfaced viewer.
     *      FIXME: not in <SFD at https://geoportail.forge.ign.fr/documentation/api/sfd/description-fonctionnelle/api-haut-niveau.html>
     */
    getViewer: function() {
        return this._vobject;
    },

    /**
     * APIMethod: zoomIn
     * Increase the map's zoom level by one.
     *      FIXME: not in <SFD at https://geoportail.forge.ign.fr/documentation/api/sfd/description-fonctionnelle/api-haut-niveau.html>
     */
    zoomIn: function() {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: zoomOut
     * Decrease the map's zoom level by one.
     *      FIXME: not in <SFD at https://geoportail.forge.ign.fr/documentation/api/sfd/description-fonctionnelle/api-haut-niveau.html>
     */
    zoomOut: function() {
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: setProxy
     * Assign the proxy URL for the map.
     *
     * Parameters:
     * proxyUrl - {String} the proxy URL
     */
    setProxy: function(proxyUrl) {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: setNoProxyDomains
     * Assign the domains for which no proxy will be used
     *
     * Parameters:
     * noProxyDomains - {Array} the list of domains
     */
    setNoProxyDomains: function(noProxyDomains) {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: setCenterAtLocation
     * Center the map at the given location.
     *
     * Parameters:
     * location - {Object} various ways of dealing with map's center. Could
     * be:
     *      * center - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>}
     *        coordinates in WGS84 longitude, latitude;
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
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: moveLayerUp
     * Move the layer's on top of the layer's above it in the layers' stack.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    moveLayerUp: function(name) {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: moveLayerDown
     * Move the layer's under the layer's below it in the layers' stack.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    moveLayerDown: function(name) {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: addLayer
     * Create a new layer in the current view.
     *
     * Parameters:
     * layerOpts - {Object} the layer's options. The content of this parameter
     * depends on the viewer. See {<Geoportal.InterfaceViewer.JS>},
     * {<Geoportal.InterfaceViewer.Flash>} for more informations.
     */
    addLayer: function(layerOpts) {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: addLayers
     * Create new layers in the current view.
     *
     * Parameters:
     * layers - {Object|Array({Object})} the layers' options. The content of this parameter
     * depends on the viewer. See {<Geoportal.InterfaceViewer.JS>},
     * {<Geoportal.InterfaceViewer.Flash>} for more informations.
     */
    addLayers: function(layers) {
        for (var i= 0, l= layers.length; i<l; i++) {
            this.addLayer(layers[i]);
        }
    },

    /**
     * APIMethod: removeLayer
     * Delete the layer from the current view.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    removeLayer: function(name) {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: addGeoportalLayer
     * Create a new layer in the current view.
     *
     * Parameters:
     * layerOpts - {Object} the layer's options. The content of this parameter
     * depends on the viewer. See {<Geoportal.InterfaceViewer.JS>},
     * {<Geoportal.InterfaceViewer.Flash>} for more informations.
     */
    addGeoportalLayer: function(layerOpts) {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: addGeoportalLayers
     * Create new layers in the current view.
     *
     * Parameters:
     * layers - {Object|Array({Object})} the layers' options. The content of this parameter
     * depends on the viewer. See {<Geoportal.InterfaceViewer.JS>},
     * {<Geoportal.InterfaceViewer.Flash>} for more informations.
     */
    addGeoportalLayers: function(layers) {
        for (var i= 0, l= layers.length; i<l; i++) {
            this.addGeoportalLayer(layers[i]);
        }
    },

    /**
     * APIMethod: removeGeoportalLayer
     * Delete the layer from the current view.
     *
     * Parameters:
     * name - {String} the layer's name
     */
    removeGeoportalLayer: function(name) {
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: setKeys
     * Assign the Geoportal's keys to the viewer.
     *
     * Parameters:
     * key - {Array({String}) | {String}} the API's keys' contracts for this viewer.
     */
    setKeys: function(key) {
        if (!key) {
            key= this.keys;
        }
        if (key && !OpenLayers.Util.isArray(key)) {
            key= [key];
        }
        this.keys= key;
        // do something now !
    },

    /**
     * APIMethod: setLanguage
     * Change the viewer's current language.
     *
     * Parameters:
     * lang - {String} the language to set.
     */
    setLanguage: function(lang) {
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: addComponent
     * Add a component to the viewer.
     *
     * Parameters:
     * className - {String} the name of the Class supporting the component.
     * options - {Object} various options when initializing the component.
     *
     * Returns:
     * {String} the component's identifier or null on error.
     */
    addComponent: function(className, options) {
        if (!this._vobject) { return null; }
        return null;
    },

    /**
     * APIMethod: removeComponent
     * Remove a component from the viewer.
     *
     * Parameters:
     * id - {String} the component's identifier.
     */
    removeComponent: function(id) {
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
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
        if (!this._vobject) { return; }
    },

    /**
     * APIMethod: mapComponentType
     * Return the underlaying component's class name mapped with the given type.
     *
     * The component's types known by all interface viewer are :
     *      * Geoportal.Component.Navigation.MouseNavigation
     *      * Geoportal.Component.Navigation.KeyboardNavigation
     *      * Geoportal.Component.Navigation.PanPanel
     *      * Geoportal.Component.Navigation.ZoomBar
     *      * Geoportal.Component.Navigation.Compass
     *      * Geoportal.Component.Navigation.GraphicScale
     *      * Geoportal.Component.Navigation.OverviewMap
     *      * Geoportal.Component.Navigation.Graticule
     *      * Geoportal.Component.Navigation.ZoomBox
     *      * Geoportal.Component.Navigation.MousePosition
     *      * Geoportal.Component.Navigation.FullScreen
     *      * Geoportal.Component.Navigation.2D3DSwitcher
     *      * Geoportal.Component.Information.FeatureInfoDisplay
     *      * Geoportal.Component.LayerSwitcher
     *      * Geoportal.Component.LayerCatalog
     *      * Geoportal.Component.Navigation.NavToolbar
     *      * Geoportal.Component.Navigation.Information
     *      * Geoportal.Component.LegalNotice.Copyright
     *      * Geoportal.Component.LegalNotice.Logo
     *      * Geoportal.Component.LegalNotice.PermanentLogo
     *      * Geoportal.Component.LegalNotice.TermsOfService
     *
     * Parameters:
     * type - {String} the component's type for which one gets its mapping.
     *
     * Returns:
     * {Object} the mapped component's type. If none,
     * Geoportal.InterfaceViewer.UNKNOWNCOMPONENT.
     */
    mapComponentType: function(type) {
        return type?
            type
        :   Geoportal.InterfaceViewer.UNKNOWNCOMPONENT;
    },

    /**
     * APIMethod: addEvent
     * Register an event related with the viewer.
     *
     * Parameters:
     * type - {String} the event's type to register.
     * listener - {Function} the function to call when this event's type is
     *                       triggered.
     */
    addEvent: function(type, listener) {
        if (!this._vobject) { return; }
        this.events.register(this.mapEventType(type),this._vobject,listener);
    },

    /**
     * APIMethod: removeEvent
     * Unregister an event related with the viewer.
     * TODO: removeEvent method is not in https://geoportail.forge.ign.fr/documentation/api/sfd/description-fonctionnelle/api-haut-niveau.html
     *
     * Parameters:
     * type - {String} the event's type to register.
     * listener - {Function} the function to call when this event's type is
     *                       triggered.
     */
    removeEvent: function(type, listener) {
        if (!this._vobject) { return; }
        this.events.unregister(this.mapEventType(type),this._vobject,listener);
    },

    /**
     * APIMethod: mapEventType
     * Return the underlaying event's type mapped with the given type.
     *
     * Parameters:
     * type - {String} the event's type for which one gets its mapping.
     *
     * Returns:
     * {String} the mapped event's type in lower case. If none,
     * Geoportal.InterfaceViewer.UNKNOWNEVENT.
     */
    mapEventType: function(type) {
        return type?
            type.toLowerCase()
        :   Geoportal.InterfaceViewer.UNKNOWNEVENT;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.InterfaceViewer"*
     */
    CLASS_NAME: "Geoportal.InterfaceViewer"
});

/**
 * Property: Geoportal.InterfaceViewer.REGISTRY
 * {Object} Set of all viewers currently created.
 */
Geoportal.InterfaceViewer.REGISTRY= [];

/**
 * APIFunction: Geoportal.InterfaceViewer.registerViewer
 * Add the viewer to the set of viewers.
 *
 * Parameters:
 * key - {String} the viewer's identifier used as the key to retrieve the
 * underlying viewer.
 * viewer - {Object} the viewer to register.
 */
Geoportal.InterfaceViewer.registerViewer= function(key, viewer) {
    if (!key || !viewer) { return; }
    Geoportal.InterfaceViewer.unregisterViewer(key);
    Geoportal.InterfaceViewer.REGISTRY[key]= viewer;
};

/**
 * APIFunction: Geoportal.InterfaceViewer.unregisterViewer
 * Remove the viewer from the set of viewers.
 *
 * Parameters:
 * key - {String} the viewer's identifier used as the key to retrieve the
 * underlying viewer.
 */
Geoportal.InterfaceViewer.unregisterViewer= function(key) {
    if (!key) { return; }
    if (Geoportal.InterfaceViewer.REGISTRY[key]) {
        delete Geoportal.InterfaceViewer.REGISTRY[key];
    }
};

/**
 * APIFunction: Geoportal.InterfaceViewer.initFromFile
 *  Allow load a viewer by the means of a configuration.
 *  FIXME: API detection, file versus stream versus String.
 *
 *  Not yet implemented.
 *
 * Returns:
 * {<Geoportal.InterfaceViewer>} a viewer interface object, null on error.
 */
Geoportal.InterfaceViewer.initFromFile= function() {
    OpenLayers.Console.error(OpenLayers.i18n("notYetImplemented"));//TODO: i18n
    return null;
};

/**
 * Property: Geoportal.InterfaceViewer.JSON
 * {<OpenLayers.Format.JSON at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/JSON-js.html>}
 */
Geoportal.InterfaceViewer.JSON= new OpenLayers.Format.JSON();

/**
 * APIFunction: Geoportal.InterfaceViewer.triggerEvent
 * Trigger the given event.
 * This function is called by viewers to bubble theirs events to the web
 * page.
 *
 * Parameters:
 * viewerId - {String} viewer identifier ;
 * eventType - {String} event's name ;
 * eventData - {String} JSON serialization of the event.
 */
Geoportal.InterfaceViewer.triggerEvent= function(viewerId, eventType, eventData) {
    if (typeof(viewerId)=='string') {
        var jsonData= Geoportal.InterfaceViewer.JSON.read(eventData);
        var iv= Geoportal.InterfaceViewer.REGISTRY[viewerId];
        if (iv) {
            iv.events.triggerEvent(iv.mapEventType(eventType), jsonData);
        }
    }
};

/**
 * Constant: Geoportal.InterfaceViewer.UNKNOWNEVENT
 * {String} the type for unknwon event type.
 */
Geoportal.InterfaceViewer.UNKNOWNEVENT= "unknownevent";

/**
 * Constant: Geoportal.InterfaceViewer.UNKNOWNCOMPONENT
 * {String} the type for unknown component.
 */
Geoportal.InterfaceViewer.UNKNOWNCOMPONENT= "unknownComponent";

