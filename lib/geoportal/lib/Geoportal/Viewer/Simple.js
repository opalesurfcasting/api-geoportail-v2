/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Viewer.js
 * @requires Geoportal/Util.js
 * @requires Geoportal/Control/Logo.js
 */
/**
 * Class: Geoportal.Viewer.Simple
 * A Geoportal simple viewer.
 * Class which must be instanciated to create a map viewer. This is a
 * helper class of the API for embedding a <Geoportal.Map>.
 *
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_simple1.html>
 *
 * Inherits from:
 *  - <Geoportal.Viewer>
 */
Geoportal.Viewer.Simple= OpenLayers.Class( Geoportal.Viewer, {

    /**
     * Property: defaultControls
     * {Object} Control's that are added to the viewer.
     *      Currently supported controls are:
     *      * <OpenLayers.Control.KeyboardDefaults at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/KeyboardDefaults-js.html> ;
     *      * <Geoportal.Control.Logo> ;
     *      * <OpenLayers.Control.Navigation at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Navigation-js.html>.
     */
    defaultControls: {
        'OpenLayers.Control.KeyboardDefaults':{
            activeOverMapOnly: true
        },
        'Geoportal.Control.Logo':{
            logoSize: 0,
            destroy: function() {
                if (this.map.getApplication()) {
                    this.map.getApplication().logoCntrl= null;
                }
                Geoportal.Control.Logo.prototype.destroy.apply(this,arguments);
            },
            viewerProperty: 'logoCntrl'
        },
        'OpenLayers.Control.Navigation':{
            mouseWheelOptions:{
                cumulative:false
            }
        }
    },

    /**
     * Constructor: Geoportal.Viewer.Simple
     * Generates a simple Geoportal viewer. Could build a big viewer with all the controls
     * or a small viewer without controls (See mode parameter).
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
     *       * territory defaults to *FXX*
     *       * nameInstance defaults to *geoportalMap*
     *       Other options like resolutions, center, minExtent, maxExtent,
     *       zoom, minZoomLevel, maxZoomLevel, scales, minResolution, maxResolution,
     *       minScale, maxScale, numZoomLevels, events, restrictedExtent,
     *       fallThrough, eventListeners are handed over to the underlaying
     *       <Geoportal.Map>.
     */
    initialize: function(div, options) {
        options= options || {};
        options.defaultControls= options.defaultControls || {};
        var defaultControls= this.defaultControls;
        this.defaultControls= OpenLayers.Util.extend(defaultControls, options.defaultControls);
        delete options.defaultControls;
        if (this.defaultControls['Geoportal.Control.Logo'].logoSize==0) {
            this.defaultControls['Geoportal.Control.Logo'].logoSize=
                Geoportal.Control.Logo.WHSizes.normal;
        }
        Geoportal.Viewer.prototype.initialize.apply(this,arguments);
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
        if (this.getMap()) {
            this.getMap().render(div);
        }
    },

    /**
     * APIMethod: destroy
     * Destroy this viewer.
     */
    destroy: function() {
        // if unloadDestroy is null, we've already been destroyed
        if (!this.unloadDestroy) {
            return;
        }
        OpenLayers.Event.stopObserving(window, 'unload', this.unloadDestroy);
        this.unloadDestroy= null;
        this.logoCntrl= null;
        if (this.map) {
            // already destroyed as OpenLayers.Event has FIFO events list.
            this.map= null;
        }
        Geoportal.Viewer.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: loadLayout
     * Add the div which contains the map and also a hack for ie.
     *
     * (start code)
     * <div id="{#Id}">
     *   <div id="{#Id}_OlMap" class="gpMainMap gpMainMapCell olMap gpMap"></div> // OpenLayers Map
     * </div>
     * (end)
     *
     * Parameters:
     * options - {Object}
     *
     * Returns:
     * {DOMElement} the OpenLayers map's div.
     */
    loadLayout: function(options) {
        this.div.style.overflow= "hidden";

        OpenLayers.Element.addClass(this.div, 'gpMainMap');
        OpenLayers.Element.addClass(this.div, 'gpMainMapCellSimple');
        OpenLayers.Element.addClass(this.div, 'olMap');
        OpenLayers.Element.addClass(this.div, 'gpMap');

        return this.div;
    },

    /**
     * APIMethod: loadControls
     * {Function} Called after creating the {<Geoportal.Map>} map.
     *      It expects an object parameter taken from options.controlsOptions
     *      of the constructor and defaultControls property.
     *      It adds controls to the map.
     *
     * Parameters:
     * options - {Object}
     *      * activeOverMapOnly : defaults to *true* (deprecated)
     *      * logoSize (deprecated)
     *      * 'OpenLayers.Control.KeyboardDefaults' - {Object} options for control
     *      <OpenLayers.Control.KeyboardDefaults at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/KeyboardDefaults-js.html>.
     *      activeOverMapOnly can be put here;
     *      * 'Geoportal.Control.Logo' - {Object} options for control <Geoportal.Control.Logo>.
     *      logoSize can be put here.
     *      If the *disabled* option is part of the control's options, then
     *      the control will not be loaded.
     */
    loadControls: function(options) {
        options= options || {};
        // deprecated options :
        if (options.activeOverMapOnly===false) {
            options['OpenLayers.Control.KeyboardDefaults']= 
                options['OpenLayers.Control.KeyboardDefaults'] || {}; 
            options['OpenLayers.Control.KeyboardDefaults'].activeOverMapOnly= false;
            delete options.activeOverMapOnly;
        }
        if (options.logoSize) {
            options['Geoportal.Control.Logo']=
                options['Geoportal.Control.Logo'] || {};
            options['Geoportal.Control.Logo'].logoSize= options.logoSize || Geoportal.Control.Logo.WHSizes.normal;
        }

        Geoportal.Viewer.prototype.loadControls.apply(this,[options]);
    },

    /**
     * APIMethod: setSize
     * Defines the view viewer size.
     *
     * Parameters:
     * width - {String} The new width of the viewer.
     * height - {String} The new height of the viewer.
     * rendered size.
     */
    setSize: function(width, height) {
        width= typeof(width)=='number'? width+'px':width;//ensure compatibility with width in pixels
        var w= Geoportal.Util.convertToPixels(width,true);
        height= typeof(height)=='number'? height+'px':height;//ensure compatibility with height in pixels
        var h= Geoportal.Util.convertToPixels(height,false);

        var wg= this.div.offsetWidth - w;
        this.div.style.width= width;
        this.mapDiv.style.width= width;
        var hg= this.div.offsetHeight - h;
        this.div.style.height= height;
        this.mapDiv.style.height= height;
        this.getMap().updateSize();
        if (wg!=0 || hg!=0) {//width or height has changed ...
            // force computation :
            this.render(this.div);
        }
    },

    /**
     * APIMethod: isMapReady
     * Checks whether the map's div is rendered or not.
     *
     * Returns:
     * {Boolean} true if ready, false otherwise.
     */
    isMapReady: function() {
        var b= arguments[0];
        var ready= (
            this.div!=null &&
            !(this.div.clientHeight<=1)
        );
        return ready;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Viewer.Simple"*
     */
    CLASS_NAME: "Geoportal.Viewer.Simple"
});
