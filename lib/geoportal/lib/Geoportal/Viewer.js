/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Util.js
 * @requires Geoportal/Map.js
 * @requires Geoportal/Catalogue.js
 * @requires Geoportal/Layer.js
 * @requires Geoportal/GeoRMHandler.js
 */
/**
 * Class: Geoportal.Viewer
 * The Geoportal viewer framework base class.
 *
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_basicViewer.html>
 *
 */
Geoportal.Viewer= OpenLayers.Class({

    /**
     * Constant: EVENT_TYPES
     * {Array(String)} Supported application event types.  Register a listener
     *     for a particular event with the following syntax:
     * (code)
     * viewer.events.register(type, obj, listener);
     * (end)
     *
     * Listeners will be called with a reference to an event object.  The
     *     properties of this event depends on exactly what happened.
     *
     * All event objects have at least the following properties:
     *  - *object* {Object} A reference to map.events.object.
     *  - *element* {DOMElement} A reference to map.events.element.
     *
     * Browser events have the following additional properties:
     *  - *xy* {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The pixel location of the event (relative
     *      to the the map viewport).
     *  - other properties that come with browser events
     *
     * Supported map event types:
     * - *viewerloaded* triggered after the viewer is ready
     */
    EVENT_TYPES: [
        "viewerloaded"
    ],

    /**
     * APIProperty: events
     * {<OpenLayers.Events at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html>} An events object that handles all 
     *                       events on the map
     */
    events: null,

    /**
     * APIProperty: eventListeners
     * {Object} If set as an option at construction, the eventListeners object will be registered with
     *     <OpenLayers.Events.on at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html#OpenLayers.Events.on>.
     *     Object structure must be a listeners object as shown in the example for
     *     the events.on method.
     */
    eventListeners: null,


    /**
     * APIProperty: fallThrough
     * {Boolean} Should OpenLayers allow events on the map to fall through to
     *           other elements on the page, or should it swallow them? (#457)
     *           Default is to fall through.
     */
    fallThrough: true,

    /**
     * APIProperty: territory
     * {String} The view's territory.
     *     ISO 3166 alpha-3 code of territory. Values are :
     * >   ATF : French Southern Territories (not yet online),
     * >   FXX : France mainland (default value),
     * >   GLP : Guadeloupe,
     * >   GUF : French Guiana,
     * >   MTQ : Martinique,
     * >   MYT : Mayotte,
     * >   NCL : New Caledonia,
     * >   PYF : French Polynesia,
     * >   REU : Reunion,
     * >   SPM : Saint Pierre and Miquelon,
     * >   WLF : Wallis and Futuna.
     *
     *     The following values are extensions for the Geoportal :
     * >   ANF : French Antilla (GLP, MTQ, SMA, SBA),
     * >   ASP : Amsterdam and Saint Paul Islands
     * >   CRZ : Crozet,
     * >   EUE : Europe,
     * >   KER : Kerguelen,
     * >   SBA : Saint-Barthelemy,
     * >   SMA : Saint-Martin,
     * >   WLD : Home.
     *
     *     Default is "FXX".
     */
    territory: 'FXX',

    /**
     * Property: territories
     * {Array({String})} All covered territories for this viewer.
     *      Contains at least the territory option value.
     */
    territories: null,

    /**
     * Property: map
     * {<Geoportal.Map>} The Geoportal map.
     */
    map: null,

    /**
     * APIProperty: projection
     * {OpenLayers.Projection} or {String} Set in the layer options to
     *     override the default projection string this layer - also set
     *     maxExtent, maxResolution, and units if appropriate. Can be either a string or
     *     an {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} object when created -- will be converted
     *     to an object when setMap is called if a string is passed.
     */
    projection: null,

    /**
     * Property: allowedDisplayProjections
     * {Array({String} or {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>})}
     *      Available display projections.
     */
    allowedDisplayProjections: null,

    /**
     * APIProperty: displayProjection
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     *     Display projection for controls (such as <Geoportal.Control.MousePosition>)
     *     Default is the underlaying geographic system of the territory.
     */
    displayProjection: null,

    /**
     * APIProperty: nameInstance
     * {String} Name of the current viewer instance.
     *      Default to "geoportalViewer".
     */
    nameInstance: 'geoportalViewer',

    /**
     * APIProperty: div
     * {DOMElement} The Geoportal viewer div.
     */
    div: null,

    /**
     * APIProperty: viewerSpecifics
     * {Array({String})} Array of options' name specific to the viewer.
     */
    viewerSpecifics: ['territory', 'projection', 'displayProjection', 'nameInstance', 'loadTheme'],

    /**
     * Property: defaultControls
     * {Object} Control's that are added to the viewer.
     *  This object holds the controls class name and options related to.
     *
     *  (begin)
     *  {
     *      'Geoportal.Control.CntrlName':{
     *          option1:value1,
     *          option2:value2,
     *          ...
     *      },
     *      ...
     *  }
     *  (end)
     *
     *  Controls options may include specific options like :
     *  * disabled - {<Boolean>} do not use this control when explicitely true;
     *  * className - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     *    the class of the control. If not defined, use key (option name) as
     *    control's class name;
     *  * viewerProperty - {<String>} {<Geoportal.Viewer>} property where to
     *  store the control. May be undefined;
     *  * check - {<Function>} returns whether or not this control is to be
     *    created. Called before testing the disabled flag. May be undefined.
     *    Context is the viewer;
     *  * parentCntrl - {<Function>} returns the control's div or null if the
     *    control's container (for instance a panel) has not yet been created.
     *    May be undefined. Context is the viewer;
     *  * finalize - {<Function>} called when the control has been created.
     *    May be undefined. Context is the viewer;
     */
    defaultControls: null,

    /**
     * Property: variables
     * {Object} A convience holder for storing objects.
     */
    variables: {},

    /**
     * Property: viewerOptions
     * {Object} Hashtable of options needed for building map through
     * {<Geoportal.Map>} constructor.
     *      Such options are :
     *      * catalogue - {<Geoportal.Catalogue>} ;
     *      * controls - {Array({<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>})} ;
     *      * tileSize - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} ;
     *      * displayProjection - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} ;
     *      * maxExtent - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} ;
     *      * zoom - {Integer}.
     */
    viewerOptions: {},

    /**
     * APIMethod: loadTheme
     * {Function} Called after loading OpenLayers' default theme.
     *      The default theme is attached to the style.css in the geoportal
     *      folder. The CSS id is '__GeoportalCss__'.
     */
    loadTheme: function() {
        Geoportal.Util.loadCSS(Geoportal._getScriptLocation()+'theme/geoportal/style.css','__GeoportalCss__','');
        if (OpenLayers.Util.alphaHack()) {
            Geoportal.Util.loadCSS(OpenLayers._getScriptLocation()+'theme/geoportal/ie6-style.css','__IE6GeoportalCss__','');
        }
    },

    /**
     * APIMethod: loadLayout
     * {Function} Called before creating the {<Geoportal.Map>} map.
     *      It expects an object parameter taken from options.layoutOptions of
     *      the constructor.
     *      It returns the id of the <OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html> div.
     *
     * Parameters:
     * options - {Object}
     *
     * Returns:
     * {DOMElement} the OpenLayers map's div.
     */
    loadLayout: function(options) {return null;},

    /**
     * APIMethod: loadControls
     * {Function} Called after creating the {<Geoportal.Map>} map.
     *      It expects an object parameter taken from options.controlsOptions
     *      of the constructor and defaultControls property.
     *      It adds controls to the map.
     *
     * Parameters:
     * options - {Object} controls configuration.
     */
    loadControls: function(options) {
        options= options || {};
        var self= this;
        var _createCntrl= function(cn) {
            var cntrl= null;
            var cl= options[cn].disabled===true?
                null
            :   (options[cn].className || OpenLayers.Class.getClass(cn));
            if (cl) {
                cntrl= new cl(options[cn]);
                if (cntrl) {
                    self.getMap().addControl(cntrl,options[cn].position || null);
                    if (options[cn].viewerProperty) {
                        self[options[cn].viewerProperty]= cntrl;
                    }
                    if (typeof(options[cn].finalize)==='function') {
                        options[cn].finalize.call(self);
                    }
                } else {
                    OpenLayers.Console.warn("loadControls('"+cn+"') failed.");
                }
            }
        };
        if (this.defaultControls) {
            // first: add/modify options with default controls options :
            for (var cn in this.defaultControls) {
                options[cn]= OpenLayers.Util.applyDefaults(options[cn], this.defaultControls[cn]);
            }
            // second: loop over default controls that do not depend on parentCntrl function :
            for (var cn in options) {
                if (this.defaultControls.hasOwnProperty(cn)) {
                    if (options[cn].div || typeof(options[cn].parentCntrl)!=='function') {
                        if (typeof(options[cn].check)!=='function' || options[cn].check.call(this)===true) {
                            _createCntrl(cn);
                        }
                    }
                }
            }
        }
        // third: loop over controls not being default and not depending on parentCntrl function :
        for (var cn in options) {
            if (!this.defaultControls || !this.defaultControls.hasOwnProperty(cn)) {
                if (options[cn].div || typeof(options[cn].parentCntrl)!=='function') {
                    if (typeof(options[cn].check)!=='function' || options[cn].check.call(this)===true) {
                        _createCntrl(cn);
                    }
                }
            }
        }
        // forth: loop over default controls that do depend on parentCntrl function :
        if (this.defaultControls) {
            for (var cn in options) {
                if (this.defaultControls.hasOwnProperty(cn)) {
                    if (!options[cn].div && typeof(options[cn].parentCntrl)==='function') {
                        if (typeof(options[cn].check)!=='function' || options[cn].check.call(this)===true) {
                            options[cn].div= options[cn].parentCntrl.call(this);
                            //if (!options[cn].div) {//parentCntrl not created
                            //    continue;
                            //}
                            _createCntrl(cn);
                        }
                    }
                }
            }
        }
        // fifth: loop over controls not being default and depending on parentCntrl function :
        for (var cn in options) {
            if (!this.defaultControls || !this.defaultControls.hasOwnProperty(cn)) {
                if (!options[cn].div && typeof(options[cn].parentCntrl)==='function') {
                    if (typeof(options[cn].check)!=='function' || options[cn].check.call(this)===true) {
                        options[cn].div= options[cn].parentCntrl.call(this);
                        //if (!options[cn].div) {//parentCntrl not created
                        //    continue;
                        //}
                        _createCntrl(cn);
                    }
                }
            }
        }
    },

    /**
     * APIMethod: completeLayout
     * {Function} Called before leaving the {<Geoportal.Viewer>} constructor.
     *      It expects an object parameter taken from options.layoutOptions of
     *      the constructor.
     *
     * Parameters:
     * options - {Object}
     */
    completeLayout: function(options) {},

    /**
     * APIProperty: browser
     * {Object} Browser's information :
     *  * version;
     *  * safari : true/false;
     *  * opera : true/false;
     *  * msie : true/false;
     *  * mozilla : true/false;
     *  * chrome : true/false;
     */
    browser: null,

    /**
     * APIMethod: unloadDestroy
     * Function that is called to destroy the viewer on page unload.  Stored here
     *     so that if the viewer is manually destroyed, we can unregister this.
     */
    unloadDestroy: null,

    /**
     * Constructor: Geoportal.Viewer
     * Generates a Geoportal viewer.
     *
     * Parameters:
     * div - {String} Id of the DIV tag in which you want
     *       to insert your viewer.
     *       Default is "geoportalViewerDiv".
     * options - {Object} Optional object with properties to
     *       tag onto the viewer.
     *       Supported options are : mode, territory,
     *       projection, displayProjection, proxy,
     *       nameInstance, [apiKey], {apiKey{}}, tokenServerUrl, tokenTtl.
     *       * mode defaults to *normal*
     *       * territory defaults to *FXX*
     *       * nameInstance defaults to *geoportalMap*
     *       * theme object or array of objects having the theme name
     *       property and the styles property as an array of css, id,
     *       anchor and alpha properties. Defaults to *null*
     *       Other options like resolutions, center, minExtent, maxExtent,
     *       zoom, minZoomLevel, maxZoomLevel, scales, minResolution, maxResolution,
     *       minScale, maxScale, numZoomLevels, events, restrictedExtent,
     *       fallThrough, eventListeners are handed over to the underlaying
     *       <Geoportal.Map>.
     */
    initialize: function(div, options) {
        // create container for viewer
        if (!div) {
            div= 'geoportalViewerDiv';
        }
        this.div= OpenLayers.Util.getElement(div);
        if(!this.div) {
            this.div= OpenLayers.getDoc().createElement("div");
            this.div.style.height= "1px";
            this.div.style.width= "1px";
            //OpenLayers.Console.error(OpenLayers.i18n('div.not.found',{id:div}));
            //return;
        }
        // jQuery :
        var ua= navigator.userAgent.toLowerCase();
        this.browser= {
            version: (ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0,'0'])[1],
            safari: /webkit/.test(ua) && !/chrome/.test(ua),
            opera: /opera/.test(ua),
            msie: /(msie|trident)/.test(ua) && !/opera/.test(ua),
            mozilla: /firefox/.test(ua) && !/(compatible|webkit)/.test(ua),
            chrome: /chrome/.test(ua)
        };

        options= options || {};
        var vlListener= null;
        if ((options.eventListeners instanceof Object) && (options.eventListeners["viewerloaded"] instanceof Function)) {
            vlListener= options.eventListeners["viewerloaded"];
            delete options.eventListeners["viewerloaded"];
        }
        // set the default options
        this._setOptions(options);

        // Layout :
        var mapDiv= this.loadLayout(options.layoutOptions);
        if (!mapDiv) {
            OpenLayers.Console.error(OpenLayers.i18n('div.not.found',{id:this.div.id||''}));
        }
        // Create map
        // under Mozilla inserting CSS somewhere else than at the end of the
        // head breaks the page ...
        // works well under IE8/Safari4beta ...
        // first insert OpenLayers CSS at the right place (prevents OL to append it to head) :
        var cssAnchor0= '__OpenLayersCss__';
        //OpenLayers.Console.log("OpenLayers="+OpenLayers._getScriptLocation());
        //OpenLayers.Console.log("Geoportal ="+Geoportal._getScriptLocation());
        var oef= Geoportal.Util.loadCSS(OpenLayers._getScriptLocation()+'theme/default/style.css',cssAnchor0,'');
        var cssAnchor1= '';
        if (oef[1]) { // __OpenLayersCss__ created :
            if (OpenLayers.Util.alphaHack()) {
                cssAnchor1= '__IE6OpenLayersCss__';
                Geoportal.Util.loadCSS(OpenLayers._getScriptLocation()+'theme/default/ie6-style.css',cssAnchor1,'');
            }
            cssAnchor1= '__GoogleOpenLayersCss__';
            Geoportal.Util.loadCSS(OpenLayers._getScriptLocation()+'theme/default/google.css',cssAnchor1,'');
        }
        this.map= new Geoportal.Map(mapDiv, this.viewerOptions);
        this.map.setApplication(this);

        // default OL style loaded, let's load Geoportal style :
        if (!options.theme) {
            this.loadTheme();
        } else {
            // load user's theme :
            this.setTheme(options.theme);
        }
//        if (this.browser.msie===true) {
//            // load cur relatively to the API :
//            OpenLayers.Element.addCss('.gpControlSliderBaseHandle{cursor:url('+Geoportal._getScriptLocation()+'theme/geoportal/img/roam.cur),pointer;}');
//            OpenLayers.Element.addCss('.gpControlSliderBaseHandleDown{cursor:url('+Geoportal._getScriptLocation()+'theme/geoportal/img/roaming.cur),pointer;}');
//        }

        if (options.useDefaultBaseLayers!==false) {
            this._addTerritoriesBaselayers();
        }
        if (!this.allowedDisplayProjections) {
            this.allowedDisplayProjections= this.viewerOptions.catalogue.getDisplayProjections(this.territory,null,true);
        }
        if (!this.displayProjection) {
            this.displayProjection= this.allowedDisplayProjections[0].clone();
            this.getMap().displayProjection= this.displayProjection;
        }
        if (options.controls==null || options.controls.length==0) {
            this.loadControls(options.controlsOptions);
        }
        this.completeLayout(options.layoutOptions);

        this.events= new OpenLayers.Events(this,null,this.EVENT_TYPES,this.fallThrough,{includeXY:false});
        if (vlListener) {
            this.events.on({"viewerloaded":vlListener});
        }

        this.unloadDestroy= OpenLayers.Function.bind(this.destroy, this);
        OpenLayers.Event.observe(window, 'unload', this.unloadDestroy, false);

        // this handler was the first to be executed ... under FF it disables
        // all other listening to window.onunload. We remove it and append it
        // again at the end of the events queue ...
        OpenLayers.Event.stopObserving(window, 'unload', OpenLayers.Event.unloadCache, false);
        OpenLayers.Event.observe(window, 'unload', OpenLayers.Event.unloadCache, false);

        this.onMapReadyFunc= OpenLayers.Function.bind(function() {
                if (this.isMapReady()===true) {
                    if (this.mapReadyInterval) {
                        window.clearInterval(this.mapReadyInterval);
                        this.mapReadyInterval= null;
                    }
                    this.events.triggerEvent("viewerloaded", {
                        'id'    :this.id,
                        'viewer':this
                    });
                }
            },this);
        this.mapReadyInterval= window.setInterval(this.onMapReadyFunc, 200);

        if (!vlListener) {
            this.getMap().setCenter(this.viewerOptions.defaultCenter, this.viewerOptions.defaultZoom);
        }
    },

    /**
     * APIMethod: destroy
     * Destroy this viewer.
     */
    destroy: function() {
        this.unloadDestroy= null;
        this.allowedDisplayProjections= null;
        this.projection= null;
        this.displayProjection= null;
        this.browser= null;
        if (this.div) {
            this.div.innerHTML= '';//remove children
            this.div= null;
        }
        this.variables= null;
        this.viewerOptions= null;
        this.timeout= null;
        if (this.eventListeners) {
            this.events.un(this.eventListeners);
            this.eventListeners = null;
        }
        this.events.destroy();
        this.events = null;
    },

    /**
     * APIMethod: render
     * Render the map to a specified container.
     *
     * Parameters:
     * div - {String|DOMElement} The container that the map should be rendered
     *     to. If different than the current container, the map viewport
     *     will be moved from the current to the new container.
     *     Must be overridden by sub-class.
     */
    render: function(div) {
    },

    /**
     * Method: _setOptions
     * Load the map options. Update viewerOptions object.
     *
     * Parameters:
     * options - {Object} Hashtable of options to tag to the viewer.
     */
    _setOptions: function(options) {
        // get current locale :
        var code= OpenLayers.Lang.getCode();

        //default proxy :
        if (options.proxy) {
            Proj4js.setProxyUrl(options.proxy);
        }

        // now clone options :
        this.options= OpenLayers.Util.extend({}, options);

        this.id= OpenLayers.Util.createUniqueID("Geoportal.Viewer_");

        if (options.territory!=undefined) {
            if (OpenLayers.Util.isArray(options.territory)) {
                if (options.territory.length>0) {
                    this.territories= options.territory.slice();
                    options.territory= this.territories[0];
                } else {
                    this.territories= [];
                    options.territory= undefined;
                }
            } else {
                this.territories= [];
                this.territories.push(options.territory);
            }
        } else {
            this.territories= [];
        }
        for (var i= 0, len= this.viewerSpecifics.length; i<len; i++) {
            var o= this.viewerSpecifics[i];
            if (options[o]!=undefined) {
                this[o]= options[o];
            }
        }
        //initialisation variable to configure map
        var catalogue= this._initMap(options);
        if (this.territories.length==0) {
            this.territories.push(this.territory);
        }

        //resolutions
        var res;
        if (options.useDefaultBaseLayers!==false) {
            res= catalogue.getResolutions(this.territory,this.projection);
        }

        //center: {lon:,lat:}
        if (options.center!=null && typeof(options.center)=='object') {
            if (!(options.center instanceof OpenLayers.LonLat)) {
                options.center= new OpenLayers.LonLat(center.lon || 0.0, center.lat || 0.0);
            }
        } else {
            options.center= catalogue.getCenter(this.territory,this.projection);
        }

        //maxextent of viewer
        var bbox= options.maxExtent;
        if (!bbox) {
            bbox= catalogue.getExtent(null,this.projection);//contract's extent or world
        }
        // minZoomLevel
        var mnzl= options.minZoomLevel;
        // maxZoomLevel
        var mxzl= options.maxZoomLevel;
        // zoom : force zoom initialisation
        var zm= options.zoom;
        if (zm==undefined) {
            if (options.resolutions) {
                if (mnzl && mxzl) {
                    zm= mnzl + mxzl;
                } else {
                    zm= 10;
                }
                zm= (zm - (zm % 2))/2;
                zm= zm>=0? Math.floor(zm):Math.ceil(zm);
            } else if (res) {
                zm= catalogue.getDefaultZoom(this.territory,this.projection);
            } else {
                zm= 0;
            }
        }

        // Options :
        this.viewerOptions= {
            catalogue: catalogue,
            defaultCenter: options.center,//FIXME: center?
            defaultZoom: zm,
            controls: (options.controls===null? null : (options.controls || [])),
            theme: null,
            cursor:options.cursor || null,
            mapmouseEventsEnable: (options.mapmouseEventsEnable===false? false : true),
            tileSize: new OpenLayers.Size(256, 256),
            projection: this.projection.getCode(),//See OpenLayers.Format.WMC.mapToContext
            units: options.units || this.projection.getUnits(),
            displayProjection: this.displayProjection,
            maxExtent: bbox
        };
        if (typeof(mnzl)!='undefined') {
            this.viewerOptions.restrictedMinZoomLevel= mnzl;
        }
        if (typeof(mxzl)!='undefined') {
            this.viewerOptions.restrictedMaxZoomLevel= mxzl;
        }
        // User added options : if and only if not catalogue based
        var userDefinedOpts= null;
        if (!res) {
            userDefinedOpts= [
                'scales', 'resolutions',
                'maxResolution', 'minResolution',
                'maxScale', 'minScale',
                'minExtent', 'maxExtent',
                'numZoomLevels', 'maxZoomLevel'
            ];
        } else {
            userDefinedOpts= [];
        }
        userDefinedOpts.push('events');
        userDefinedOpts.push('restrictedExtent');
        userDefinedOpts.push('fallThrough');
        userDefinedOpts.push('eventListeners');
        userDefinedOpts.push('proxy');
        userDefinedOpts.push('apiKey');
        for (var o= 0; o<userDefinedOpts.length; o++) {
            var on= userDefinedOpts[o];
            if (options[on]!==undefined) {
                this.viewerOptions[on]= options[on];
            }
        }
        this.viewerOptions.isMapReady= this.isMapReady;
        this.timeout= {};
    },

    /**
     * Method: _initMap
     * Initialize properties.
     *
     * Parameters:
     * options - {Object} Hashtable of options to tag the viewer.
     *
     * Returns:
     * {<Geoportal.Catalogue>} the viewer's capabilities.
     */
    _initMap: function(options) {
        var catalogue= new Geoportal.Catalogue(null,options);
        this.territory= catalogue.getTerritory(this.territory);
        this.projection= catalogue.getNativeProjection(this.territory,this.projection);
        if (this.displayProjection) {
            if (!(OpenLayers.Util.isArray(this.displayProjection))) {
                this.displayProjection= [this.displayProjection];
            }
            this.allowedDisplayProjections= this.displayProjection;
            for (var i= 0, len= this.allowedDisplayProjections.length; i<len; i++) {
                var dp= this.allowedDisplayProjections[i];
                if (typeof(dp) == 'string') {
                    this.allowedDisplayProjections[i]= new OpenLayers.Projection(
                        dp,
                        {
                            domainOfValidity: OpenLayers.Bounds.fromArray(
                                Geoportal.Catalogue.TERRITORIES[this.territory].geobbox)
                        });
                }
            }
            this.displayProjection= this.allowedDisplayProjections[0].clone();
        }

        return catalogue;
    },

    /**
     * Method: _addTerritoriesBaselayers
     * Add base layers covering the contract's extent for all covered territories.
     */
    _addTerritoriesBaselayers: function() {
        var catalogue= this.viewerOptions.catalogue;
        var geoRMbbox= catalogue.getExtent();// contract's extent or world in geographic coordinates
        var defaultCRS= this.projection.equals(catalogue.getNativeProjection(this.territory));
        var defaultGeoCRS= this.projection.equals(Geoportal.Catalogue.TERRITORIES[this.territory].geoCRS[0]);
        var isMapGeoCRS= this.projection.getProjName()=='longlat';
        // put territory base layer first in order to make it the active one !
        var baseLayers= [];
        var restrictedMinZoom= typeof(this.viewerOptions.restrictedMinZoomLevel)!='undefined';
        var restrictedMaxZoom= typeof(this.viewerOptions.restrictedMaxZoomLevel)!='undefined';
        var t;
        var wldT= false ;
        for (var it= 0, lt= this.territories.length; it<lt; it++) {
            t= this.territories[it];
            if (t=="WLD") {
                this.territories[it]= "!"+t;
                wldT= true ;
                continue;// handled by _addWorldBaseLayer
            }
            if (!Geoportal.Catalogue.TERRITORIES.hasOwnProperty(t) ||
                Geoportal.Catalogue.TERRITORIES[t].geobbox==undefined) {
                continue;
            }
            if (t!=catalogue.getTerritory(t)) {
                continue;
            }
            var bbox= OpenLayers.Bounds.fromArray(Geoportal.Catalogue.TERRITORIES[t].geobbox);
            if (geoRMbbox.containsBounds(bbox,true,true) ||
                bbox.containsBounds(geoRMbbox,true,true)) {
                var mapproj= (t==this.territory?
                                this.projection
                             :
                                (defaultCRS && !isMapGeoCRS?
                                    Geoportal.Catalogue.TERRITORIES[t].defaultCRS[0]
                                :
                                    (defaultGeoCRS && isMapGeoCRS?
                                        Geoportal.Catalogue.TERRITORIES[t].geoCRS[0]
                                    :
                                        null
                )));
                // if projection is default's territory projection or its
                // geographic counterpart apply this rule to all
                // territory, otherwise only the current territory will be
                // added :
                if (!mapproj) {
                    bbox= null;
                    continue;//unable to retrieve territory's projection
                             // resolutions can not be computed
                }
                var terproj= catalogue.getNativeProjection(t,
                    ((defaultCRS  && !isMapGeoCRS) || (defaultGeoCRS && isMapGeoCRS)? null : this.projection));
                bbox.transform(Geoportal.Catalogue.TERRITORIES[t].geoCRS[0],mapproj,true);
                var mnzl= catalogue.getDefaultMinZoom(t,terproj);
                var mxzl= catalogue.getDefaultMaxZoom(t,terproj);
                if (restrictedMinZoom===true) {
                    if (this.viewerOptions.restrictedMinZoomLevel>mxzl) { continue; }
                    if (this.viewerOptions.restrictedMinZoomLevel>=mnzl) {
                        mnzl= this.viewerOptions.restrictedMinZoomLevel;
                    }
                }
                if (restrictedMaxZoom===true) {
                    if (this.viewerOptions.restrictedMaxZoomLevel<mnzl) { continue; }
                    if (this.viewerOptions.restrictedMaxZoomLevel<=mxzl) {
                        mxzl= this.viewerOptions.restrictedMaxZoomLevel;
                    }
                }
                var o= {
                    isBaseLayer: true,
                    displayInLayerSwitcher: false,
                    projection: mapproj,
                    units: mapproj.getUnits(),
                    nativeProjection: terproj,
                    resolutions: catalogue.getResolutions(t,mapproj),
                    minZoomLevel: mnzl,
                    maxZoomLevel: mxzl,
                    maxExtent: bbox,
                    territory: t
                };
                if (!terproj.equals(mapproj)) {
                    o.nativeResolutions= catalogue.getResolutions(t,terproj);
                }
                var baselayer= new Geoportal.Layer("_"+t+"_territory_", o);
                if (t==this.territory) {
                    baseLayers.unshift(baselayer);
                } else {
                    baseLayers.push(baselayer);
                }
                terproj= null;
                mapproj= null;
            } else {
                // mark it unavailable :
                this.territories[it]= '!'+this.territories[it];
            }
            bbox= null;
        }
        geoRMbbox= null;
        var len= baseLayers.length;
        if (len>0) {
            for (var i= 0; i<len; i++) {
                var baselayer= baseLayers.shift();
                // the first added baseLayer IS the map's current baseLayer
                this.getMap().addLayer(baselayer);
                // FIXME: don't reset zoom levels to allow changeBaseLayer ?
                // reset zoom levels :
                if (restrictedMinZoom!==true) {
                    baselayer.minZoomLevel= undefined;
                }
                if (restrictedMaxZoom!==true) {
                    baselayer.maxZoomLevel= undefined;
                }
            }
        }
        baseLayers= null;
        if (wldT) {
            this._addWorldBaseLayer(catalogue);
        }
        // the first layer added is the baseLayer of this map ... except if
        // world base layer has been added first ...
    },

    /**
     * Method: _addWorldBaseLayer
     * Adds baselayer for world display.
     *
     * Parameters:
     * catalogue - {Geoportal.Catalogue} the map's capabilities.
     */
    _addWorldBaseLayer: function(catalogue) {
        var wld= catalogue.getTerritory("WLD");
        var wldproj= catalogue.getNativeProjection(wld);
        var res= catalogue.getResolutions(wld,wldproj);
        var mnzl= catalogue.getDefaultMinZoom(wld,wldproj);
        var mxzl= catalogue.getDefaultMaxZoom(wld,wldproj);
        var restrictedMinZoom= typeof(this.viewerOptions.restrictedMinZoomLevel)!='undefined';
        var restrictedMaxZoom= typeof(this.viewerOptions.restrictedMaxZoomLevel)!='undefined';
        if (restrictedMinZoom===true) {
            if (this.viewerOptions.restrictedMinZoomLevel>mxzl) { return; }
            if (this.viewerOptions.restrictedMinZoomLevel>=mnzl) {
                mnzl= this.viewerOptions.restrictedMinZoomLevel;
            }
        }
        if (restrictedMaxZoom===true) {
            if (this.viewerOptions.restrictedMaxZoomLevel<mnzl) { return; }
            if (this.viewerOptions.restrictedMaxZoomLevel<=mxzl) {
                mxzl= this.viewerOptions.restrictedMaxZoomLevel;
            }
        }
        var o= {
            isBaseLayer: true,
            displayInLayerSwitcher: false,
            projection: wldproj,
            units: wldproj.getUnits(),
            nativeProjection: wldproj,
            resolutions: res,
            minZoomLevel: mnzl,
            maxZoomLevel: mxzl,
            maxExtent: catalogue.getExtent(wld, wldproj),
            wrapDateLine: true,//default is false
            territory: wld
        };
        var baselayer= new Geoportal.Layer("_WLD_world_", o);
        this.getMap().addLayer(baselayer);
        // FIXME: don't reset zoom levels to allow changeBaseLayer ?
        // reset zoom levels :
        if (restrictedMinZoom!==true) {
            baselayer.minZoomLevel= undefined;
        }
        if (restrictedMaxZoom!==true) {
            baselayer.maxZoomLevel= undefined;
        }
        this.territories.push("WLD");
    },

    /**
     * Method: addSphericalMercatorBaseLayer
     * Adds baselayer for "world" display based on 'EPSG:3857'.
     *
     * Parameters:
     * options - {Object} Hashtable of options to tag the layer.
     *
     * Returns:
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the newly created base layer.
     */
    addSphericalMercatorBaseLayer: function(options) {
        options= options || {};
        // Spherical Mercator base layer :
        var smp= new OpenLayers.Projection('EPSG:3857');
        var smo= {
            isBaseLayer: true,
            displayInLayerSwitcher: false,
            projection: smp,
            units: smp.getUnits(),
            nativeProjection: smp,
            maxResolution: 156543.0339,
            numZoomLevels: 18,
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037509.92, 20037508.34, 20037509.92),
            wrapDateLine: true,//default is false
            territory: 'WSM'    //World Spherical Mercator ...
        };
        OpenLayers.Util.extend(smo, options);
        var smBaseLayer= new OpenLayers.Layer("_WSM_world_", smo);
        this.getMap().addLayer(smBaseLayer);
        // reset zoom levels :
        //smBaseLayer.minZoomLevel= undefined;
        //smBaseLayer.maxZoomLevel= undefined;

        return smBaseLayer;
    },

    /**
     * APIMethod: addPlateCarreBaseLayer
     * Adds baselayer for "world" display based on 'EPSG:4326'.
     *
     * Parameters:
     * options - {Object} Hashtable of options to tag the layer.
     *
     * Returns:
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the newly created base layer.
     */
    addPlateCarreBaseLayer: function(options) {
        options= options || {};
        // Plate-carre base layer :
        var pcp= new OpenLayers.Projection('EPSG:4326');
        var pco= {
            isBaseLayer: true,
            displayInLayerSwitcher: false,
            projection: pcp,
            units: pcp.getUnits(),
            nativeProjection: pcp,
            maxResolution: 1.40625,
            numZoomLevels: 21,
            maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
            wrapDateLine: true,//default is false
            territory: 'WPC'    // World Plate-Carre
        };
        OpenLayers.Util.extend(pco, options);
        var ppBaseLayer= new OpenLayers.Layer("_WPC_world_", pco);
        viewer.getMap().addLayer(ppBaseLayer);
        // reset zoom levels :
        //ppBaseLayer.minZoomLevel= undefined;
        //ppBaseLayer.maxZoomLevel= undefined;

        return ppBaseLayer;
    },

    /**
     * Method: _addAggregateLayer
     * Adds an aggregate layer.
     *
     * Parameters:
     * options - {Options} Hashtable of options to tag the layer.
     *
     */
    _addAggregateLayer: function(options) {
        var layer= new Geoportal.Layer(); // dummy layer to display 'loading...' during autoconf call for the aggregate
        delete options.options.territory;
        var aggregate= new Geoportal.Layer.Aggregate(
                        options.options.name,
                        [layer],
                        options.options);
        if (aggregate) {
            var map= this.getMap();
            if (!map.addLayer(aggregate)) { return; }
            aggregate.layers[0].events.triggerEvent("loadstart"); // display 'loading...'
            var p= new OpenLayers.Protocol.Script({
                url: options.url,
                params: { output:'json' },
                format: new Geoportal.Format.WMC.v1_1_0_AutoConf(),
                handleResponse:function(resp,opts) {
                    var map= this.viewer.getMap();
                    var conf= this.format.read(resp.data.xml);
                    this.destroyRequest(resp.priv);
                    Geoportal.Catalogue.completeConfiguration(conf,true);
                    this.layer.layers[0].events.triggerEvent("loadend");
                    map.removeLayer(this.layer.layers[0]);
                    this.layer.layers= [];
                    for (var l= 0, len= conf.layersContext.length; l<len; l++) {
                        var layer= conf.layersContext[l];
                        var nbl= map.getLayersByName(layer.name).length;
                        this.viewer.addGeoportalLayer(layer.name+':'+(layer.metadata.type.split(':').pop() || 'WMTS'),{
                            displayInLayerSwitcher:false,
                            visibility:this.layer.visibility,
                            opacity:this.layer.opacity
                        });
                        var layers= map.getLayersByName(layer.name).slice(nbl);
                        this.layer.addLayers(layers);
                    }
                },
                layer: aggregate,
                viewer: this
            });
            p.read();
        }
    },

    /**
     * APIMethod: setKeys
     * Assigns API keys to the viewer.
     *
     * Parameters:
     * options - {Object} supports the following options:
     *      * apiKey - {Array({String}) | {String}} the API's keys;
     *      * "key" - {Object} API's key description :
     *          * tokenServer - {String} the GeoDRM service;
     *          * tokenTimeOut - {Integer} the GeoDRM service's time out in
     *          milliseconds;
     *          * transport - {String} optional, defaults to 'json';
     *          * bounds - {Array({Number})} optional, key's extent in longitude,
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
        if (!options.apiKey) { return; }
        this.getMap().setKeys(options);
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
     *          * css - {String} hyper-link to the css resource;
     *          * id - {String} the link identifier. If none, use url value;
     *          * anchor - {String} id of the node where to insert the link node.
     *          If none, insertion occurs before the first link/style node found.
     *          '' force appending to the head;
     *          * alpha - {Boolean} when true only insert the CSS for IE6.
     */
    setTheme: function(th) {
        var styles, style;
        // back-port:
        if (th.css) {
            th.styles= [];
            style= {
                'css'    : th.css,
                'id'     : th.id     || null,
                'anchor' : th.anchor || ''
            } ;
            th.styles.push(style);
        }
        if (OpenLayers.Util.isArray(th)) {
            styles= th;
            th= {};
            th.styles= styles;
        }
        if (th.name) {
            Geoportal.Util.setTheme(th.name);
        }
        if (!(OpenLayers.Util.isArray(th.styles))) {
            th.styles= [th.styles];
        }
        styles= th.styles;
        for (var i= 0, l= styles.length; i<l; i++) {
            style= styles[i];
            if (style.alpha!==true || OpenLayers.Util.alphaHack()) {
                Geoportal.Util.loadCSS(style.css, style.id||null, style.anchor||'');
            }
        }
    },

    /**
     * APIMethod: setSize
     * Defines the view viewer size.
     *      Must be overridden by sub-classes.
     *
     * Parameters:
     * width - {String} The new width of the viewer.
     * height - {String} The new height of the viewer.
     */
    setSize: function(width, height) {
    },

    /**
     * APIMethod: setToolsPanelVisibility
     * Allows to show or not the tools panel if any.
     *      Does nothing.
     *
     * Parameters:
     * b - {Boolean} If true, show the panel, if not, do not show it.
     */
    setToolsPanelVisibility: function(b) {
    },

    /**
     * APIMethod: setLayersPanelVisibility
     * Allows to show or not the layers panel if any.
     *      Does nothing.
     *
     * Parameters:
     * b - {Boolean} If true, show the panel, if not, do not show it.
     */
    setLayersPanelVisibility: function(b) {
    },

    /**
     * APIMethod: openToolsPanel
     * Allows to open or not the tools panel if any.
     *      Does nothing.
     *
     * Parameters:
     * b - {Boolean} If true, open the panel, if not, do not open it.
     */
    openToolsPanel: function(b) {
    },

    /**
     * APIMethod: openLayersPanel
     * Allows to open or not the layers switcher panel if any.
     *      Does nothing.
     *
     * Parameters:
     * b - {Boolean} If true, open the panel, if not, do not open it.
     */
    openLayersPanel: function(b) {
    },

    /**
     * APIMethod: setInformationPanelVisibility
     * Allows to show or not the information panel (the blue bar just under the
     * map), if any.
     *      Does nothing.
     *
     * Parameters:
     * b - {Boolean} If true, show the panel, if not, do not show it.
     */
    setInformationPanelVisibility: function(b) {
    },

    /**
     * APIMethod: isMapReady
     * Checks whether the map's div is rendered or not.
     *
     * Returns:
     * {Boolean} true if ready, false otherwise.
     */
    isMapReady: function() {
        //var b= arguments[0];
        var ready= (
            this.div!=null
        );
        return ready;
    },

    /**
     * APIMethod: getTerritory
     * Returns the viewer's territory (aka <Geoportal.Viewer.Default.territory>).
     *
     * Returns:
     * {String} The current territory.
     */
    getTerritory: function() {
        return this.territory;
    },

    /**
     * APIMethod: getMap
     * Returns the <Geoportal.Map> object associated with this
     * <Geoportal.Viewer>.
     *
     * Returns:
     * {<Geoportal.Map>} The OpenLayers map object.
     */
    getMap: function() {
        return this.map;
    },

    /**
     * APIMethod: addGeoportalLayer
     * Allows to add a predefined Geoportal layer to all territories.
     *
     * Parameters:
     * layerId - {String} The identifier of the layer you want to add.
     *      Used as the layer's name.
     * options - {Object} options specific to the layer.
     */
    addGeoportalLayer: function(layerId,options) {
        var map= this.getMap();
        options= options || {};
        var t;
        for (var it= 0, lt= this.territories.length; it<lt; it++) {
            t= this.territories[it];
            if (!Geoportal.Catalogue.TERRITORIES.hasOwnProperty(t)) {
                continue;
            }
            // look for baseLayers (not only, but) that covers this territory ...
            if (map.getLayersBy('territory', t).length==0) {
                continue;
            }
            var parameters= map.catalogue.getLayerParameters(t,layerId);
            if (!parameters || !parameters.classLayer) {
                continue;
            }
            //FIXME: WMS => crs not compatible with WMSC ...

            var layer= null;
            // overloaded min/maxZoomLevel must be compatible with service capacities :
            if (typeof(options.minZoomLevel)!=='undefined') {
                if (options.minZoomLevel<parameters.options.minZoomLevel ||
                    options.minZoomLevel>parameters.options.maxZoomLevel) {
                    options.minZoomLevel= parameters.options.minZoomLevel;
                }
            }
            if (typeof(options.maxZoomLevel)!=='undefined') {
                if (options.maxZoomLevel<parameters.options.minZoomLevel ||
                    options.maxZoomLevel>parameters.options.maxZoomLevel) {
                    options.maxZoomLevel= parameters.options.maxZoomLevel;
                }
            }
            parameters.options= OpenLayers.Util.extend(parameters.options,options);
            if (typeof(this.viewerOptions.restrictedMinZoomLevel)!='undefined') {
                if (parameters.options.minZoomLevel<this.viewerOptions.restrictedMinZoomLevel) {
                    parameters.options.minZoomLevel= this.viewerOptions.restrictedMinZoomLevel;
                }
            }
            if (typeof(this.viewerOptions.restrictedMaxZoomLevel)!='undefined') {
                if (parameters.options.maxZoomLevel>this.viewerOptions.restrictedMaxZoomLevel) {
                    parameters.options.maxZoomLevel= this.viewerOptions.restrictedMaxZoomLevel;
                }
            }
            parameters.options.territory= t;
            // Adding GeoRM to the layer :
            var k= map.catalogue.getLayerGeoRMKey(t,parameters.resourceId);
            if (k!=null) {
                var gopt= {};
                if (map.catalogue[k].transport) {
                    gopt.transport= map.catalogue[k].transport;
                    if (map.catalogue[k][gopt.transport]) {
                        gopt[gopt.transport]= map.catalogue[k][gopt.transport];
                    }
                }
                parameters.options["GeoRM"]=
                    Geoportal.GeoRMHandler.addKey(
                        k,
                        map.catalogue[k].tokenServer.url,
                        map.catalogue[k].tokenServer.ttl,
                        map,
                        gopt);
            }
            if (!parameters.options["GeoRM"]) {
                OpenLayers.Console.warn(OpenLayers.i18n('geoRM.forbidden',{layer:parameters.options.name}));
                return;
            }
            if (parameters.classLayer == Geoportal.Layer.Aggregate) {
                this._addAggregateLayer(parameters);
                return;
            }
            layer= new parameters.classLayer(
                        parameters.options.name,
                        parameters.url,
                        parameters.params,
                        parameters.options);
            if (layer) {
                if (!map.addLayer(layer)) { continue; }
                // listen to changelayer, visibility change to synchronize local/world layers :
                map.events.register('changelayer',layer,function(e) {
                    if (!e) { return; }
                    if (!(e.property=='visibility' || e.property=='opacity')) { return; }
                    if (e.layer===this) { return; }
                    if (e.layer.getCompatibleProjection()==null) { return; }//must be displayable on current map
                    if (e.layer.name!=this.name) { return; }
                    var v= e.layer[e.property];
                      if (this.getCompatibleProjection()==null && v!=this[e.property]) {
                        if (e.property=='visibility') {
                            this.visibility= v;
                            this.display(v);
                            this.redraw();
                        } else {
                            this.setOpacity(v);
                        }
                        // FIXME: when _FXX_territory_->_WSM_world_ all Geoportal are turned to false
                        // FIXME: when _FXX_territory_->_WLD_world_ all Geoportal are turned to false
                        var bls= this.map.getLayersBy("isBaseLayer",true);
                        for (var i= 0, l= bls.length; i<l; i++) {
                            var lyr= bls[i];
                            if (lyr===this.map.baseLayer) { continue; }
                            if (this.getCompatibleProjection(lyr)!=null) {
                                if (!this.savedStates[lyr.id]) {
                                    this.savedStates[lyr.id]= {};
                                }
                                this.savedStates[lyr.id][e.property]= v;
                            }
                        }
                        bls= null;
                    }
                });

                //Trigger event to update min/maxZoomLevel of base layer
                map.events.triggerEvent("changelayer", {
                    layer: layer, property:"visibility"
                });

                // listen to removelayer to synchronize local/world layers :
                map.events.register('removelayer',layer,function(e) {
                    if (!e) { return; }
                    if (!e.layer) { return; }
                    if (e.layer===this) { return; }
                    if (e.layer.name!=this.name) { return; }
                    if (this.map) {
                        this.map.removeLayer(this);
                    }
                });

            }
        }
    },

    /**
     * APIMethod: addGeoportalLayers
     * Allows to add several predefined Geoportal layers.
     *
     * Parameters:
     * layerIds - {Array({String})} The identifiers table of the layers you want to add.
     *      These identifiers are used as layer's name. This parameter can be
     *      omitted in which case, all allowed layers are loaded.
     * options - {Object} optional options specific to the layers.
     *      Either options are generic for all passed in layers, or
     *      they are attached to each layer. In the later case, the options
     *      keys are the layers identifiers :
     *
     * (start code)
     * addGeoportalLayers(['ORTHOIMAGERY.ORTHOPHOTOS', 'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
     *                    {'GEOGRAPHICALGRIDSYSTEMS.MAPS':{visibility:false}});
     * (end)
     *
     *      When global options are needed in the second case, the special key
     *      'global' is to be used :
     *
     * (start code)
     * addGeoportalLayers(['ORTHOIMAGERY.ORTHOPHOTOS', 'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
     *                    {'GEOGRAPHICALGRIDSYSTEMS.MAPS':{visibility:false},
     *                     global:{opacity:0.75}});
     * (end)
     *
     *      Specific options overrule global options.
     */
    addGeoportalLayers: function() {
        var layerIds= arguments.length>=1? arguments[0]:null;
        var options= arguments.length==2? arguments[1]:{};
        if (!layerIds || layerIds.length==0) {
            layerIds= this.getMap().allowedGeoportalLayers;
            if (!layerIds) {
                //TODO: message
                return;
            }
        }
        var olayerIds= Geoportal.Catalogue._orderLayersStack(layerIds);
        var go= {};
        if (options.global!==undefined) {
            OpenLayers.Util.extend(go,options.global);
        }
        for (var i= 0, len= olayerIds.length; i < len; i++) {
            // options may not have the serviceType ...
            var lid= olayerIds[i], ci= lid.lastIndexOf(':'), rlid= ci!=-1? lid.substring(0,ci) : lid;
            if (ci==-1) { lid= lid+':'+Geoportal.Catalogue.DEFAULT_SERVICE_TYPE; }
            var opts= OpenLayers.Util.applyDefaults({}, options[lid] || options[rlid] || {}) ;
            opts= OpenLayers.Util.applyDefaults(opts, go);
            this.addGeoportalLayer(olayerIds[i], opts);
        }
    },

    /**
     * APIMethod: setVariable
     * Store an object.
     *
     * Parameters:
     * key - {String} the key under which the object can be retrieved
     * obj - {Object} the object to store.
     */
    setVariable: function(key, obj) {
        if (!key) return;
        this.variables[key]= obj;
    },

    /**
     * APIMethod: addVariable
     * Store an object.
     *  *Deprecated in API 2.0.0* Use <Geoportal.Viewer.setVariable>().
     *
     * Parameters:
     * key - {String} the key under which the object can be retrieved
     * obj - {Object} the object to store.
     */
    addVariable: function(key, obj) {
        OpenLayers.Console.warn(
            OpenLayers.i18n("methodDeprecated", {'newMethod':'Geoportal.Viewer.setVariable'})
        );
        this.setVariable(key, obj);
    },

    /**
     * APIMethod: removeVariable
     * Remove an object stored within the viewer.
     *
     * Parameters:
     * key - {String} the key under which the object can be retrieved
     *
     * Returns:
     * {Object} it is up to the client application to dispose the returned
     *      object.
     */
    removeVariable: function(key) {
        if (!key) return null;
        var o= this.variables[key];
        this.variables[key]= null;
        return o;
    },

    /**
     * APIMethod: getVariable
     * Retrieve a stored object.
     *
     * Parameters:
     * key - {String} the key under which the object can be retrieved
     *
     * Returns:
     * {Object}
     */
    getVariable: function(key) {
        if (!key) return null;
        return this.variables[key];
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Viewer"*
     */
    CLASS_NAME: "Geoportal.Viewer"
});
