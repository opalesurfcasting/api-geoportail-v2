/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/InterfaceViewer.js
 */
/**
 * Class: Geoportal.InterfaceViewer.VG
 * The Geoportal 3D viewer interface class.
 *
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple1.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple2.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple3.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple4.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple5.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple6.html>
 *
 */
Geoportal.InterfaceViewer.VG= OpenLayers.Class(Geoportal.InterfaceViewer, {

    /**
     * viewerOpts object passed for InterfaceViewer contruction
     */
    viewerOpts: null,

    id: null,

    /**
     * Variable: map
     * This property contains the internal map object to communicate with the application.
     */
    map: null,

    setMap: function(map){
        this.map = map;
    },

    getMap: function(){
        return this.map;
    },

    /**
     * Property: _viewerloaded
     * {Boolean} toggles to true when "viewerloaded" event is received
     */
    _viewerLoaded: false,

    /**
     * Property: _autoconfComplete
     * {Boolean} toggles to true when "autoconfcomplete" event is received
     */
    _autoconfComplete: false,


    /**
     * Constructor: Geoportal.InterfaceViewer.VG
     * Create an interface between the web page and the {3D} plugin.
     *
     * Parameters:
     * div - {String | DOMElement} Id of the DIV tag in which you want
     *       to insert your 3D application.
     * options - {Object} Optional object with properties to tag onto the map.
     *           Options are :
     *      * keys - {Array({String}) | {String}} the API's keys' contracts
     *      for this viewer.
     *      * viewerLoadedCallback - {Function} the function to be called when the
     *      viewer has triggered the "viewerloaded" event. This event returns
     *      the viewer object.
     *      * viewerClass - {String} optional, the 3D component to communicate with.
     *      * viewerOpts - {Object} Any options usefull for handling over to the
     *      3D object.
     */
    initialize: function(div, options)
    {
        Geoportal.InterfaceViewer.prototype.initialize.apply(this, arguments);
        
        // keep viewerOpts
        this.viewerOpts = options || {};
        
        this.id = div;
        
        this.viewerClass = options.viewerClass || "Geoportal.Viewer.Default";
        
        if (this.viewerOpts) {
            // callback when "viewerloaded" is triggered
            if (options.viewerLoadedCallback) {
                this.viewerLoadedCallback = options.viewerLoadedCallback;
            }
        } // if viewerOpts
        
        this._loadViewer(div) ;
    },

    /**
     * Function: _loadViewer
     * This function loads the 3D plugin into the HTML page.
     *
     * Parameters:
     * div - 
     */
    _loadViewer: function(div)
    {
        var UNDEF = "undefined";
        var OBJECT = "object";
        var FUNCTION = "function";
        var STRING = "string";
        var VIRTUALGEOGP = "VirtualGeoGP";
        var VIRTUALGEOGP_MIME_TYPE = "application/x-virtualgeogp"
        
        var pluginNPAPI = false;
        var pluginActiveX = false;
        
        var loadedEvent = new Object();
        
        var divElem= OpenLayers.Util.getElement(div);
        var dimensions= {
            width:divElem.offsetWidth,
            height:divElem.offsetHeight
        }
        var width = dimensions && dimensions.width || 800;
        var height = dimensions && dimensions.height || 600;
        this.initWidth = width;
        this.initHeight = height;
        
        divObj = document.getElementById(div);
        
        if (typeof navigator.plugins != UNDEF && typeof navigator.plugins[VIRTUALGEOGP] == OBJECT && typeof navigator.mimeTypes[VIRTUALGEOGP_MIME_TYPE] == OBJECT)
        {
            d = navigator.plugins[VIRTUALGEOGP].description;
            if (d && !(typeof navigator.mimeTypes != UNDEF && navigator.mimeTypes[VIRTUALGEOGP_MIME_TYPE] && !navigator.mimeTypes[VIRTUALGEOGP_MIME_TYPE].enabledPlugin))
            {
                // navigator.mimeTypes[VIRTUALGEOGP_MIME_TYPE].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
                pluginNPAPI = true;
                pluginActiveX = false; // cascaded feature detection for Internet Explorer
            }
        }
        else if (typeof window.ActiveXObject != UNDEF)
        {
            d = "VirtualGeoGP ActiveX";
            pluginActiveX = true;
        }
        
        if (pluginActiveX || pluginNPAPI)
        {
            var args = this.viewerOpts && this.viewerOpts.arguments || '';
            var keys = this.viewerOpts && this.viewerOpts.keys || '';
            var language = this.viewerOpts && this.viewerOpts.language || 'fr';
            
            args += " -languageCode=" + language;
            if (this.viewerOpts && this.viewerOpts.layers)
            {
                args += " -noDefaultLayers";
            }
            
            divObj.innerHTML = "Loading " + d;
            divObj.innerHTML = '<table id="GpAPI3DPluginProgress" width="' + width + '" height="' + height + '"><caption>' + d + '</caption><TR><TH><img id="GpAPI3DPluginImage" src="' + Geoportal.Util.getImagesLocation() + 'VGeoLoading.gif"/></TH></TR><TR><TH id="GpAPI3DPluginStatus">Default message</TH></TR></table><object align="center" id="GpAPI3DPlugin" type=' + VIRTUALGEOGP_MIME_TYPE + ' width="1" height="1"><param name="arguments" value="' + args + '"/><param name="gpkeys" value="' + keys + '"/></object>';
            viewerObj = document.getElementById('GpAPI3DPlugin');
            progressInfo = document.getElementById('GpAPI3DPluginStatus');
            progressInfo.innerHTML = "Loading Plugin...";
            
            if (pluginNPAPI)
            {
                if (viewerObj && (viewerObj.getMap || (typeof viewerObj.getMap == FUNCTION && typeof viewerObj.getMap() == OBJECT)) )
                {
                    this.setViewer(viewerObj);
                    this.message = "Success";
                    this.activeX = false;
                }
                else if (viewerObj && viewerObj.object && typeof viewerObj.object == OBJECT) // Special case for IE11
                {
                    try
                    {
                        if (typeof viewerObj.getMap() == OBJECT)
                        {
                            this.setViewer(viewerObj);
                            this.message = "Success";
                            this.activeX = true;
                        }
                        else
                        {
                            this.setViewer(null);
                            this.message = "VirtualGeoGP initialization failed " + viewerObj;
                        }
                    }
                    catch(err)
                    {
                        this.setViewer(null);
                        this.message = "VirtualGeoGP initialization failed " + viewerObj;
                    }
                }
                else
                {
                    this.setViewer(null);
                    this.message = "VirtualGeoGP initialization failed " + viewerObj;
                }
            }
            else if (pluginActiveX)
            {
                try
                {
                    if (viewerObj && typeof viewerObj.getMap() == OBJECT )
                    {
                        this.setViewer(viewerObj);
                        this.message = "Success";
                        this.activeX = true;
                    }
                    else
                    {
                        // Plugin is not installed
                        this.setViewer(null);
                        this.setMap(null);
                        this.message = "VirtualGeoGP is not installed...";
                    }
                }
                catch(err)
                {
                    // Plugin is registered in the windows registry but the DLL can not be loaded(corrupted installation).
                    this.setViewer(null);
                    this.setMap(null);
                    this.message = "Your installation seems to be corrupted. Please try to reinstall VirtualGeoGP plugin.";
                    this.description = err.message;
                    this.type = err.name;
                }
            }
            
            if (! this.getViewer())
            {
                divObj.innerHTML = "Fail to load " + d;
            }
        }
        else
        {
            this.setViewer(null);
            this.message = "VirtualGeoGP is not installed...";
        }
        
        if (this.getViewer())
        {
            progressInfo.innerHTML = "Starting VirtualGeo for Geoportail 3D...";
            // Add shortcuts to map functions.
            var map = this.getViewer().getMap();
            var fwdFunc = function(func) {
                if (typeof this.getViewer()[func] !== 'undefined') return;
                this.getViewer()[func] = function(params) {
                    var result = null;
                    if (typeof params === 'undefined') result = map[func]();
                    else {
                        params = Geoportal.InterfaceViewer.JSON.write(params);
                        result = map[func](params);
                    }
                    if (typeof result === 'undefined') return;
                    result = Geoportal.InterfaceViewer.JSON.read(result);
                    if (result === null || typeof result !== 'object' || typeof result.length === 'number') return result;
                    var firstkey = undefined;
                    for (var key in result) if (typeof firstkey === 'undefined') firstkey = key; else return result;
                    if (typeof result[firstkey] === 'object') return result;
                    return result[firstkey];
                }
            }
            if (typeof map.getMetaMethods === 'undefined') {
                // While binary is not up-to-date, use a specific list of functions to map
                var functions = [
                    'getLayersInfo',
                    'getResolution',
                    'getBounds',
                    'getCenter',
                    'getZoomLevel'
                ];
                for (var i in functions) fwdFunc.call(this,functions[i]);
                
                // Hack for inserting 'layers' as subobject of getLayersInfo()
                this.getViewer()['__getLayersInfo'] = this.getViewer()['getLayersInfo'];
                var iv = this;
                this.getViewer()['getLayersInfo'] = function(params) {
                    var layers = ((iv.getViewer()['__getLayersInfo'])(params));
                    if (typeof layers === 'object' && layers !== null && typeof layers.length === 'number')
                    {
                        for (var i = 0 ; i < layers.length ; ++i)
                            if (typeof layers[i].gppid !== 'undefined') layers[i].gppId = layers[i].gppid;
                        return {layers:layers};
                    }
                    else return layers;
                }
            } else {
                fwdFunc.call(this,'getMetaMethods');
                var signatures = this.getViewer().getMetaMethods().slots;
                for (var i in signatures) {
                    var signature = signatures[i];
                    var sigparsed = /^\S+\s+(\S+)\(.*$/.exec(signature);
                    if (sigparsed) fwdFunc.call(this,sigparsed[1]);
                }
            }
            
            // Wait for ready signal.
            Geoportal.InterfaceViewer.registerViewer(div /*this.id*/, this);
            {
                // Internal connect to the triggerevent which is needed for every other event to work with addEvent() and removeEvent()
                var _forceIEFormat = this.activeX;
                var _formatEvent = function(pObjectName, pEventName, pParams, pBody) {
                    if (_forceIEFormat || (typeof navigator !== 'undefined' && typeof navigator.appName === 'string' && navigator.appName === "Microsoft Internet Explorer")) {
                        return "function " + pObjectName + "::" + pEventName + "(" + pParams + ") " + pBody;
                    }
                    else {
                        return pObjectName + "." + pEventName + " = function(" + pParams + ") " + pBody;
                    }
                };
                var _addEvent = function(pHighLevelObject, pEventName, pCallback) {
                    var viewer = pHighLevelObject.getViewer();
                    var funCall = _formatEvent("viewer", pEventName, "_obj", "{ var __obj=_obj&&Geoportal.InterfaceViewer.JSON.read(_obj); pCallback.call(pHighLevelObject,__obj); }");
                    var ret = eval(funCall);
                };
                _addEvent(this, "triggerevent", this.handleEvent);
            }
            this.addEvent("viewerloaded", OpenLayers.Function.bind(function(evt){this._onViewerLoaded(evt);}, this));
            this.addEvent("autoconfcomplete", OpenLayers.Function.bind(function(evt){this._onAutoconfComplete(evt);}, this));
            _addEvent(this, "viewerloading", this._onViewerLoading);
            _addEvent(this, "geolocation", OpenLayers.Function.bind(function(evt){this._onGeolocation(evt);}, this));
            this.setMap(this.getViewer().getMap());
            
            if (this.getViewer().getVersion().split('.')[3] >= 1711)
            {
                // Notify plugin that API can receive events (mandatory for MacOS)
                this.getViewer().readyToReceiveEvents();
            }
        }
        else
        {
            // emit user event with failure information
            myEvent = new Object();
            myEvent.message=this.message;
            myEvent.viewer=null;
            this.viewerLoadedCallback.call(this,myEvent);
        }
    },


    /**
     * Function: _onAutoconfComplete
     * This function is called when the autoconf response has been received and computed. 
     * If meanwhile, the 3D viewer has been loaded, it executes the callback 
     * stored in the viewerLoadedCallback property.
     */
    _onAutoconfComplete: function(evt) {
       this._autoconfComplete= true ;
       if (this._viewerLoaded) {
            // warning, the high level object is passed into 'this'
            myEvent = new Object();
            myEvent.message=this.message;
            myEvent.viewer=this;
            this.viewerLoadedCallback.call(this,myEvent);
       }
    },



    /**
     * Function: _onViewerLoaded
     * This function is called when the 3D API is loaded. 
     * If meanwhile, the autoconf response has been received and computed,
     * it executes the callback stored in the viewerLoadedCallback property.
     */
    _onViewerLoaded: function(evt)
    {
        this._viewerLoaded= true ;
        progressInfo = document.getElementById('GpAPI3DPluginStatus');
        progressInfo.innerHTML = "Initializing map...";
        // warning, the high level object is passed into 'this'
        myEvent = new Object();
        myEvent.message=this.message;
        myEvent.viewer=this;
        
        var width = this.initWidth;
        var height = this.initHeight;
        this.getViewer().width = width;
        this.getViewer().height = height;
        this.initWidth = undefined;
        this.initHeight = undefined;
        
        image = document.getElementById('GpAPI3DPluginProgress');
        parentDiv = document.getElementById(this.id);
        parentDiv.removeChild(image);
        
        if (this.viewerClass === 'Geoportal.Viewer.Default' || this.viewerClass === 'Geoportal.Viewer.Simple') {
            this.removeComponent('Geoportal.Component.Navigation.OverviewMap');
            this.removeComponent('Geoportal.Component.Navigation.FullScreen');
            this.removeComponent('Geoportal.Component.Navigation.2D3DSwitcher');
            this.removeComponent('Geoportal.Component.Navigation.Time.Internal');
            this.removeComponent('Geoportal.Component.Search.SearchToolBar');
            this.removeComponent('Geoportal.Component.LayerCatalog');
//            this.removeComponent('Geoportal.Component.RightPanel.Internal');
            if (this.viewerClass === 'Geoportal.Viewer.Simple') {
                this.removeComponent('Geoportal.Component.Navigation.Information');
                this.removeComponent('Geoportal.Component.LayerSwitcher');
                this.removeComponent('Geoportal.Component.Navigation.NavToolbar');
            }
            else {
                this.addComponent('Geoportal.Component.LayerSwitcher');
            }
        }
        
        if (this._autoconfComplete) {
            this.viewerLoadedCallback.call(this,myEvent);
        }
        
        // Delay the right panel removal because an icon has the wrong position if this removal is performed earlier
        if (this.viewerClass === 'Geoportal.Viewer.Default' || this.viewerClass === 'Geoportal.Viewer.Simple') {
            this.removeComponent('Geoportal.Component.RightPanel.Internal');
        }
    },

    /**
     * Function: _onViewerLoading
     * This function is called during 3D API initialization (internal use). This call back is called several times.
     */
    _onViewerLoading: function(evt)
    {
        progressInfo = document.getElementById('GpAPI3DPluginStatus');
        progressInfo.innerHTML = evt.message;
        if  (evt.error)
        {
            myEvent = new Object();
            myEvent.message=(evt.message);
            myEvent.viewer=null;
            image = document.getElementById('GpAPI3DPluginImage');
            image.src="";
            
            this.viewerLoadedCallback.call(this,myEvent);
        }
    },

    /**
     * Function: _onGeolocation
     * This function is called when the user clicks on the geolocation button.
     */
    _onGeolocation: function(evt)
    {
        if ("geolocation" in navigator)
        {
            if (/Gecko/.test(navigator.userAgent) && !/AppleWebKit/.test(navigator.userAgent)) {
                // Focus issue for Firefox, we have to give focus to window so that the geolocation dialog is shown if needed
                window.focus();
                /* Note that this will not work if dom.disable_window_flip is set to true (default is true, unfortunately).
                This flag could be checked using the following code but needs special privileges (not granted by default) :
                Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefBranch)
                .getBoolPref("dom.disable_window_flip");
                */
            }
            navigator.geolocation.getCurrentPosition(OpenLayers.Function.bind(function(geoposition) {
                    //this.getMap().setCenterAdvanced('{"lon":'+geoposition.coords.longitude+', "lat":'+geoposition.coords.latitude+', "scale":5000, "tilt":70}');
                    this.getMap().setCenter('{"lon":'+geoposition.coords.longitude+', "lat":'+geoposition.coords.latitude+'}');
                }, this),
                OpenLayers.Function.bind(function handleError(error) {
                    if ("language" in this && this.language == 'fr')
                        alert("Impossible de récupérer la géolocalisation : " + error.message);
                    else
                        alert("Unable to get geolocation: " + error.message);
                }, this),
                {timeout:10000});
        }
        else
        {
            if ("language" in this && this.language == 'fr')
                alert("La géolocalisation n'est pas disponible pour votre navigateur Internet.");
            else
                alert("Geolocation is not available for your Internet browser.");
        }
    },

/*
    Function: initFromFile
    This function is called by the HighLevelInterface to initialize the application from a specific configuration file.
    
    Note:
    This function is not implemented yet.
    
    Parameters:
*/
    initFromFile: function(){
    
        if (this.viewer.initFromFile)
        {
            return this.viewer.initFromFile("noFile");
        }
    },

/*
    Function: zoomIn
    This function is called by the HighLevelInterface to increase the zoom level of the map.
    
    It increases the zoom level of the map by one.
    
    Parameters:
    None.
    
    Example:
    myHighLevelInterface.zoomIn();
*/
    zoomIn: function(){
    
        if (this.map)
        {
            var maxLevel, currLevel;
            currLevel = Geoportal.InterfaceViewer.JSON.read(this.map.getZoomLevel());
            if (!currLevel || !isFinite(parseInt(currLevel.level))) { return; }
            currLevel = parseInt(currLevel.level)
            maxLevel = Geoportal.InterfaceViewer.JSON.read(this.map.getMaxZoomLevel());
            if (!maxLevel || !isFinite(parseInt(maxLevel.level))) { return; }
            maxLevel = parseInt(maxLevel.level)
            if (currLevel >= maxLevel)
            {
                // Already at the maximum level
                return;
            }
            currLevel = currLevel+1;
            this.map.setZoomLevel('{"level":'+currLevel+'}');
        }
    },

/*
    Function: zoomOut
    This function is called by the HighLevelInterface to decrease the zoom level of the map.
    
    It decreases the zoom level of the map by one.
    
    Parameters:
    None.
    
    Example:
    myHighLevelInterface.zoomOut();
*/
    zoomOut: function(){
    
        if (this.map)
        {
            var minLevel, currLevel;
            currLevel = Geoportal.InterfaceViewer.JSON.read(this.map.getZoomLevel());
            if (!currLevel || !isFinite(parseInt(currLevel.level))) { return; }
            currLevel = parseInt(currLevel.level)
            minLevel = Geoportal.InterfaceViewer.JSON.read(this.map.getMinZoomLevel());
            if (!minLevel || !isFinite(parseInt(minLevel.level))) { return; }
            minLevel = parseInt(minLevel.level)
            if (currLevel <= minLevel)
            {
                // Already at the minimum level
                return;
            }
            currLevel = currLevel-1;
            this.map.setZoomLevel('{"level":'+currLevel+'}');
        }
    },

/*
    Function: pan
    This function is called by the HighLevelInterface to move the center of the map.
    
    It moves the center of map from {x, y} to {x + dx, y + dy}.
    
    Parameters:
    dx - The horizontal pixel offset.
    dy - The vertical pixel offset.
    
    Example:
    myHighLevelInterface.pan(30, 50);
*/
    pan: function(dx, dy){
    
        if (this.map)
        {
            this.map.pan('{"x":'+dx+',"y":'+dy+'}');
        }
    },
/*
    Function: setZoom
    This function is called by the HighLevelInterface to set a new resolution or a new zoom level to the map.
    
    It sets the zoom of the map to the closest resolution or to the zoom passed by parameter.
    
    Parameters:
    value - The resolution to approach or the zoom level.
    
    Example:
    myHighLevelInterface.setZoom(10000.0);
*/
    setZoom: function(value){
        
        if (this.map)
        {
            if ((value.toString().indexOf('.') == -1) && (value.toString().indexOf('e') == -1))
            {
                this.map.setZoomLevel('{"level":'+parseInt(value)+'}');
            }
            else
            {
                this.map.setZoomResolution('{"resolution":'+parseFloat(value)+'}');
            }
        }
    },

/*
    Function: setCameraOrientation
    This function is called by the HighLevelInterface to change the camera orientation of the map.
    
    Parameters:
    heading - The new heading.
    tilt - The new tilt.
*/
    setCameraOrientation: function(heading, tilt){
        
        if (this.map)
        {
            this.map.setCameraOrientation('{"heading":'+heading+',"tilt":'+tilt+'}');
        }
    },

/*
    Function: setCenter
    This function is called by the HighLevelInterface to change the center of the map.
    
    It centers the map to the coordinates passed by parameter.
    
    Parameters:
    lat - The latitude of the new center (in decimal or sexagesimal).
    lon - The longitude of the new center (in decimal or sexagesimal).
    
    Examples:
    myHighLevelInterface.setCenter(50.55, 2.8667);
    
    myHighLevelInterface.setCenter("50?33'2", "2?52'7");
*/
    setCenter: function(lon, lat, alt)
    {
        lat = typeof(lat)=="string" && isFinite(Number(lat)) && Number(lat) || lat;
        lon = typeof(lon)=="string" && isFinite(Number(lon)) && Number(lon) || lon;
        var altitude = typeof(alt)=='undefined' ? '' : (',"alt":'+alt);
        if (this.map && typeof(lat)=="number" && typeof(lon)=="number")
        {
            this.map.setCenter('{"lon":'+lon+',"lat":'+lat+altitude+'}');
        }
        else if (this.map && typeof(lat)=="string" && typeof(lon)=="string")
        {
            if (Geoportal && Geoportal.Util && Geoportal.Util.dmsToDeg)
            {
                lat = Geoportal.Util.dmsToDeg(lat);
                lon = Geoportal.Util.dmsToDeg(lon);
                this.map.setCenter('{"lon":'+lon+',"lat":'+lat+altitude+'}');
            }
            else
            {
                alert("Not available in 3D API");//this.map.setCenter(lat, lon);
            }
        }
    },

/*
    Function: setLayerVisibility
    This function is called by the HighLevelInterface to change the layers' visibility.
    
    It changes the visibility of the layer passed by parameter.
    
    Parameters:
    id - GppId of the layer.
    bool - The new visibility of this layer (true = visible, false = unvisible).
    
    Example:
    myHighLevelInterface.setLayerVisibility("myLayer", false);
*/
    setLayerVisibility: function(id, bool){
        if (this.map)
        {
            if (typeof this.getViewer().getBuildVersion === 'undefined' || this.getViewer().getBuildVersion() <= 1246)
            {
                var name = this.getNameByGppId(id);
                if (typeof name !== 'undefined') this.map.setLayerVisible('{"id":"'+name+'","visible":'+bool+'}');
                return;
            }
            this.map.setLayerVisible('{"gppid":"'+id+'","visible":'+bool+'}');
        }
    },

/*
    Function: setLayerOpacity
    This function is called by the HighLevelInterface to change the layers' opacity.
    
    It changes the opacity of the layer passed by parameter.
    
    Parameters:
    id - GppId of the layer.
    value - The new opacity of this layer (between 0 and 1).
    
    Example:
    myHighLevelInterface.setLayerOpacity("myLayer", 0.35);
*/
    setLayerOpacity: function(id, value){
    
        if (this.map)
        {
            if (typeof this.getViewer().getBuildVersion === 'undefined' || this.getViewer().getBuildVersion() <= 1246)
            {
                var name = this.getNameByGppId(id);
                if (typeof name !== 'undefined') this.map.setLayerOpacity('{"id":"'+name+'","opacity":'+value+'}');
                return;
            }
            this.map.setLayerOpacity('{"gppid":"'+id+'","opacity":'+value+'}');
        }
    },

/*
    Function: moveLayerUp
    This function is called by the HighLevelInterface to move up the layers' order.
    
    It increases by one the order of the layer passed by parameter.
    
    Parameters:
    id - GppId of the layer.
    
    Example:
    myHighLevelInterface.moveLayerUp("myLayer");
*/
    moveLayerUp: function(id){
    
        if (this.map)
        {
            if (typeof this.getViewer().getBuildVersion === 'undefined' || this.getViewer().getBuildVersion() <= 1246)
            {
                var name = this.getNameByGppId(id);
                if (typeof name !== 'undefined') this.map.moveLayerUp('{"id":"'+name+'"}');
                return;
            }
            this.map.moveLayerUp('{"gppid":"'+id+'"}');
        }
    },

/*
    Function: moveLayerDown
    This function is called by the HighLevelInterface to move down the layers' order.
    
    It decreases by one the order of the layer passed by parameter.
    
    Parameters:
    id - GppId of the layer.
    
    Example:
    myHighLevelInterface.moveLayerDown("myLayer");
*/
    moveLayerDown: function(id){
    
        if (this.map)
        {
            if (typeof this.getViewer().getBuildVersion === 'undefined' || this.getViewer().getBuildVersion() <= 1246)
            {
                var name = this.getNameByGppId(id);
                if (typeof name !== 'undefined') this.map.moveLayerDown('{"id":"'+name+'"}');
                return;
            }
            this.map.moveLayerDown('{"gppid":"'+id+'"}');
        }
    },

/*
    Function: removeLayer
    This function is called by the HighLevelInterface to remove layers.
    
    It removes the layer passed by parameter from the map.
    
    Parameters:
    id - GppId of the layer to remove.
    
    Example:
    myHighLevelInterface.removeLayer("myLayer");
*/
    removeLayer: function(id){
    
        if (this.map)
        {
            if (typeof this.getViewer().getBuildVersion === 'undefined' || this.getViewer().getBuildVersion() <= 1245)
            {
                var name = this.getNameByGppId(id);
                if (typeof name !== 'undefined') this.map.removeLayer('{"id":"'+name+'"}');
                return;
            }
            this.map.removeLayer('{"gppid":"'+id+'"}');
        }
    },

/*
    Function: addLayer
    This function is called by the HighLevelInterface to add a layer.
    
    It adds the layer passed by parameter to the map.
    
    Parameters:
    layer - An object with the following attributes :
        name - The name of the layer to add.
        protocol - The name of the protocol to use : "wms", "wmts", "wfs", "georss", "kml" or "gpx".
        version - The version of the protocol (optional).
        url - The URL of the geoserver.
        typename - The identifier of the layer on the geoserver.
        timeout - Timeout of the server query, in seconds (optional).
        format - MIME Type of data to download (WMS & WMTS), "3D" if we want to load 3D 
                         models (KML).
        tilesize - Size of the tiles, in pixels (WMS only) (optional).
        nblevels - Maximum depth of levels to download (WMS only) (optional).
        gridstep - Grid step of level 0, in degrees (WMS only) (optional).
        style - Layer style (WMTS only) (optional).
    
    Example:
    var theLayer = new Object();
    
    theLayer.protocol = "wms";
    theLayer.name = "Regions de France";
    theLayer.url = "http://www.geosignal.org/cgi-bin/wmsmap";
    theLayer.typename = "Regions";
    theLayer.version = "1.1.1";
    theLayer.timeout = 15;
    theLayer.format = "image/png";
    theLayer.tilesize = 512;
    theLayer.nblevels = 10;
    theLayer.gridstep = 45;
    
    myHighLevelInterface.addLayer(theLayer);
*/
    addLayer: function(layer){
        if (this.map && typeof layer === "object" && typeof layer.protocol === "string" && /*typeof layer.identifier !== "undefined" &&*/ (typeof layer.name !== "undefined" || typeof layer.displayedName !== "undefined") && typeof layer.url !== "undefined")
        {
            var apiLayer = new Object();
            // Common parameters
            apiLayer.id = layer.name || layer.displayedName;
            apiLayer.gppid = layer.identifier || apiLayer.id;
            apiLayer.url = layer.url;
            apiLayer.inlayerswitcher = typeof layer.displayInLayerSwitcher === "undefined" ? true : layer.displayInLayerSwitcher;
            // Specific parameters
            if (layer.protocol.toLowerCase() == "wms")
            {
                apiLayer.protocol = "wms";
                apiLayer.mimetype = layer.format;
                if (typeof layer.projection !== "undefined") apiLayer.projection = layer.projection;
                if (typeof layer.name !== "undefined") apiLayer.name = layer.typename;
                if (typeof layer.version !== "undefined") apiLayer.version = layer.version;
                if (typeof layer.tilesize !== "undefined") apiLayer.tilesize = layer.tilesize;
                if (typeof layer.gridstep !== "undefined") apiLayer.gridstep = layer.gridstep;
                if (typeof layer.nblevels !== "undefined") apiLayer.nblevels = layer.nblevels;
                if (typeof layer.timeout !== "undefined") apiLayer.timeout = layer.timeout;
            }
            else if (layer.protocol.toLowerCase() == "wmts")
            {
                apiLayer.protocol = "wmts";
                apiLayer.mimetype = layer.format;
                if (typeof layer.name !== "undefined") apiLayer.name = layer.typename;
                if (typeof layer.style !== "undefined") apiLayer.style = layer.style;
                if (typeof layer.version !== "undefined") apiLayer.version = layer.version;
                if (typeof layer.timeout !== "undefined") apiLayer.timeout = layer.timeout;
            }
            else if (layer.protocol.toLowerCase() == "wfs")
            {
                apiLayer.protocol = "wfs";
                if (typeof layer.projection !== "undefined") apiLayer.projection = layer.projection;
                if (typeof layer.name !== "undefined") apiLayer.name = layer.typename;
                if (typeof layer.title !== "undefined") apiLayer.title = layer.title;
                if (typeof layer.style !== "undefined") apiLayer.style = layer.style;
                if (typeof layer.version !== "undefined") apiLayer.version = layer.version;
                if (typeof layer.timeout !== "undefined") apiLayer.timeout = layer.timeout;
            }
            else if (layer.protocol.toLowerCase() == "georss")
            {
                apiLayer.protocol = "georss";
                if (typeof layer.style !== "undefined") apiLayer.style = layer.style;
                if (typeof layer.timeout !== "undefined") apiLayer.timeout = layer.timeout;
            }
            else if (layer.protocol.toLowerCase() == "kml")
            {
                if (layer.format=="3D") {
                    apiLayer.protocol = "kml3D";
                } else if (layer.format=="Tiled2D") {
                    apiLayer.protocol = "kml2D";
                } else {
                    apiLayer.protocol = "kml";
                }
            }
            else if (layer.protocol.toLowerCase() == "gpx")
            {
                apiLayer.protocol = "gpx";
            }
            if (typeof apiLayer.protocol !== "undefined") 
            {
                this.map.addLayer(Geoportal.InterfaceViewer.JSON.write(apiLayer));
            }
        }
    },

/*
    Function: setLanguage
    This function is called by the HighLevelInterface to change the language.
    
    Parameters:
    language - The new language to use for the 3D API's components.
    
    Warning:
    Changing the language reloads the User Interface, thus this function should be
    called prior to functions which affect the UI such as activating components.
*/
    setLanguage: function(language){
    
        if (this.map && typeof language === 'string' && !/"/.test(language))
        {
            // Quick convert from IETF 4646 to ISO 3166, should be enough for most languages where GPP3 will be translated in
            language = language.replace(/^(\w+)-(\w+)$/, '$1_$2');
            this.map.setLanguage('{"language":"'+language+'"}');
        }
    },

/*
    Function: setTheme
    This function is called by the HighLevelInterface to change the theme folder.
    By default the application has a 'default' folder in the user home directory.
    The most basic theming consists in duplicating this folder, edit files within
    it and call setTheme with the name of the duplicated folder.
    In any case the new folder must be at the same level as 'default' because any
    theme is discovered thanks to the same parent directory.
    
    Parameters:
    theme - The new theme folder to load components from.
    
    Warning:
    Changing the theme reloads the User Interface, thus this function should be
    called prior to functions which affect the UI such as activating components.
*/
    setTheme: function(theme){
    
        if (this.map && typeof theme === 'string')
        {
            this.map.setTheme('{"options":{"theme":"'+theme.replace(/"/g,'\\"')+'"}}');
        }
    },

/*
    Function: setMode
    This function is called by the HighLevelInterface to change the mode of the map.
    
    Note:
    This function is not implemented yet.
    
    Parameters:
    mode - The new mode (normal, mini).
*/
    setMode: function(mode){
    },

/*
    Function: toggleComponent
*/
    toggleComponent: function(id){
    
        if (this.map)
        {
            this.map.toggleControl('{"id":"'+id+'"}');
        }
    },

/*
    Function: iconifyComponent
*/
    iconifyComponent: function(id){
    
        if (this.map)
        {
            this.map.iconifyControl('{"id":"'+id+'"}');
        }
    },

/*
    Function: addComponent
*/
    addComponent: function(id, options){
    
        if (this.map)
        {
            this.map.addControl('{"id":"'+id+'"}');
            if (options)
            {
                var params = new Object();
                params.id = id;
                params.options = options;
                this.map.setControl(Geoportal.InterfaceViewer.JSON.write(params));
            }
        }
        return id;
    },

/*
    Function: removeComponent
*/
    removeComponent: function(id){
    
        if (this.map)
        {
            this.map.removeControl('{"id":"'+id+'"}');
        }
    },

/*
    Function: modifyComponent
*/
    modifyComponent: function(id, options){
    
        if (this.map)
        {
            var params = new Object();
            params.id = id;
            params.options = options;
            this.map.setControl(Geoportal.InterfaceViewer.JSON.write(params));
        }
    },

/*
    Function: setCenterAtLocation
*/
    setCenterAtLocation: function(place){
    
        if (this.map)
        {
            if (typeof place === 'object' && place && typeof place.geolocate === 'boolean' && place.geolocate)
            {
                this._onGeolocation();
                return;
            }

            if (typeof place ==='string' || typeof place === 'object' && place && typeof place.address === 'string')
            {
                var type = 'StreetAddress';
                var text = typeof place ==='string' ? place : place.address;
            }
            else if (typeof place === 'object' && place && typeof place.place === 'string')
            {
                var type = 'PositionOfInterest';
                var text = typeof place ==='string' ? place : place.place;
            }
            else return;

            var obj = Geoportal.InterfaceViewer.JSON.read(this.map.getGeocoderBaseURL('{"service":"Geocode", "type":"'+type+'"}'));
            if (typeof obj === 'object' && obj && typeof obj.url === 'string')
            {
                var url = obj.url;
            }
            else return;

            var search = '"text":"'+text+'"';
            var request = '{"url":"'+url+'","countrycode":"'+type+'",'+search+',"maxcount":1,"timeout":5}';
            var result = Geoportal.InterfaceViewer.JSON.read(this.map.getGeocoderFreeFormAddress(request));
            if ((!result) || (!result.length)) return;

            var location = result[0];
            this.map.setCenterAdvanced('{"lat":'+location.lat+',"lon":'+location.lon+'}');
        }
    },

/*
    Function: addGeoportalLayer
*/
    addGeoportalLayer: function(id){
        // Hack pour avoir les noms corrects de resources 3D :
        // BATI3D : nom en base CDA (connu de l'utilisateur)
        // BDTOPO3D$:OGC:KML : nom de ressource autoconf
        if (id=="BATI3D") {
            id= "BDTOPO3D$:OGC:KML" ;
        } else if (id=="ADMINISTRATIVEUNITS") {
            id= "ADMINISTRATIVEUNITS.CITYCOUNCILS.3D$GEOPORTAIL:KML3D" ;
        }
        if (this.map)
        {
            if (typeof this.getViewer().getBuildVersion === 'undefined' || this.getViewer().getBuildVersion() <= 1245)
            {
                var name = this.getNameByGppId(id);
                if (typeof name !== 'undefined') this.map.addGeoportalLayer('{"id":"'+name+'"}');
                return;
            }
            this.map.addGeoportalLayer('{"gppid":"'+id+'"}');
        }
    },

/*
    Function: removeGeoportalLayer
    
    Note:
    This function is not implemented yet and may never be implemented because all layers can
    be removed with removeLayer.
*/
    removeGeoportalLayer: function(id){
        // There is no such thing as "remove a layer which comes from geoportal only",
        // all layers can (and will) be removed by removeLayer
        this.removeLayer(id);
    },

/*
    Function: getGppIdByName
    This function gets the GppId of a layer identified by its name.
    
    Returns:
    The GppId if found, or undefined.
    
    Example:
    myHighLevelInterface.getGppIdByName("MNT BDAlti V1");
*/
    getGppIdByName: function(name){
        var info = this.map && Geoportal.InterfaceViewer.JSON.read(this.map.getLayersInfo());
        info = typeof info === 'object' && info && typeof info.layers !== 'undefined' && info.layers;
        if (typeof info === 'object' && info && typeof info.length === 'number')
            for (var i = 0 ; i < info.length ; ++i)
                if (info[i].name == name)
                    return info[i].gppId;
    },

/*
    Function: getNameByGppId
    This function gets the name of a layer identified by its GppId.
    
    Returns:
    The name if found, or undefined.
    
    Example:
    myHighLevelInterface.getNameByGppId("ELEVATION.ELEVATIONGRIDCOVERAGE$GEOPORTAIL:OGC:WMS");
*/
    getNameByGppId: function(gppid){
        var info = this.map && Geoportal.InterfaceViewer.JSON.read(this.map.getLayersInfo());
        info = typeof info === 'object' && info && typeof info.layers !== 'undefined' && info.layers;
        if (typeof info === 'object' && info && typeof info.length === 'number') {
            for (var i = 0 ; i < info.length ; ++i) {
                if (info[i].gppId == gppid) {
                    return info[i].name;
                }
            }
        }
    },

/*
    Function: setKeys
    
    Note:
    This function is not implemented yet.
*/
    setKeys: function(array_key){
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
     * | componentchanged   | controlchanged        |
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
        case 'controlchanged'          : type= 'componentchanged'; break;
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
     * | Geoportal.Component.Navigation.OverviewMap         | Geoportal.InterfaceViewer.UNKNOWNCOMPONENT |
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
        case 'Geoportal.Component.Navigation.FullScreen'         :
        case 'Geoportal.Component.Navigation.NavToolbar'         : 
        case 'Geoportal.Component.Navigation.OverviewMap'        : 
        case 'Geoportal.Component.Navigation.2D3DSwitcher'       : type= Geoportal.InterfaceViewer.UNKNOWNCOMPONENT; break;
        default                                                : type= type || type2; break;
        }
        return type;

    },


        /*
                Function: handleEvent
                This function is called by the HighLevelInterface to fire custom events.
                This will trigger the corresponding functions registered by addEvent().
                
                Parameters:
                event - Event data, in JSON format, including the event type.
                
                Example:
                myHighLevelInterface.handleEvent({ type:"switchto2d" });
        */
        handleEvent: function(event)
        {
            var eventType = event.type;
            event.type = undefined;
            Geoportal.InterfaceViewer.triggerEvent(this.id, eventType, Geoportal.InterfaceViewer.JSON.write(event));
        },






    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.InterfaceViewer.VG"*
     */
    CLASS_NAME: "Geoportal.InterfaceViewer.VG"
});
