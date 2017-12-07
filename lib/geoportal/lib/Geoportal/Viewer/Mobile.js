/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Viewer/Simple.js
 * @requires Geoportal/Util.js
 * @requires Geoportal/Control/Logo.js
 */
/**
 * Class: Geoportal.Viewer.Mobile
 * The Geoportal mobile viewer.
 * Class which must be instanciated to create a map viewer. This is a
 * helper class of the API for embedding a <Geoportal.Map>.
 *
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_mobile1.html>
 *
 * Inherits from:
 *  - <Geoportal.Viewer.Simple>
 */
Geoportal.Viewer.Mobile= OpenLayers.Class( Geoportal.Viewer.Simple, {

    /**
     * Property: defaultControls
     * {Object} Control's that are added to the viewer.
     *      Currently supported controls are:
     *      * <OpenLayers.Control.KeyboardDefaults at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/KeyboardDefaults-js.html> ;
     *      * <Geoportal.Control.Logo> ;
     *      * <OpenLayers.Control.TouchNavigation at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/TouchNavigation-js.html> ;
     *      * <OpenLayers.Control.ZoomPanel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/ZoomPanel-js.html> ;
     *      * <OpenLayers.Control.Geolocate at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Geolocate-js.html>.
     */
    defaultControls: {
        'OpenLayers.Control.TouchNavigation':{
            dragPanOptions:{
                enableKinetic:true
            }
        },
        'OpenLayers.Control.ZoomPanel':{
        },
        'OpenLayers.Control.Geolocate':{
            geolocationOptions:{
                enableHighAccuracy:false,
                maximumAge:0,
                timeout:7000
            }
        }
    },

    /**
     * Constructor: Geoportal.Viewer.Mobile
     * Generates the Geoportal mobile viewer. Could build a big viewer with all the controls
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
     *       * fixContentHeight - {Function}
     */
    initialize: function(div, options) {
        options= options || {};
        options.defaultControls= options.defaultControls || {};
        var superControls= OpenLayers.Util.extend({}, Geoportal.Viewer.Simple.prototype.defaultControls);
        delete superControls['OpenLayers.Control.Navigation'];
        superControls= OpenLayers.Util.extend(superControls, options.defaultControls);
        delete options.defaultControls;
        var defaultControls= this.defaultControls;
        this.defaultControls= OpenLayers.Util.extend(superControls, defaultControls);
        if (this.defaultControls['Geoportal.Control.Logo'].logoSize==0) {
            this.defaultControls['Geoportal.Control.Logo'].logoSize=
                Geoportal.Control.Logo.WHSizes.mini;
        }
        Geoportal.Viewer.Simple.prototype.initialize.apply(this,arguments);

        if (this.fixContentHeight) {
            setTimeout(this.fixContentHeight, 700);
            setTimeout(this.fixContentHeight, 1500);
        }
    },

    /**
     * Method: fixContentHeight
     * Get rid of address bar on iphone/ipod.
     */
    fixContentHeight: function() {
        window.scrollTo(0,0);
        document.body.style.height = '100%';
        if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
            if (document.body.parentNode) { 
                document.body.parentNode.style.height = '100%';
            }
        }       
    },

    /**
     * APIMethod: loadTheme
     * {Function} Called after loading OpenLayers' default theme.
     *      The default theme is attached to the style.css in the geoportal
     *      folder. The CSS id is '__GeoportalMobileCss__'.
     */
    loadTheme: function() {
        Geoportal.Viewer.Simple.prototype.loadTheme.apply(this,arguments);//FIXME
        Geoportal.Util.loadCSS(Geoportal._getScriptLocation()+'theme/mobile/style.css','__GeoportalMobileCss__','');
    },

    /**
     * APIMethod: loadControls
     * Adds controls to map.
     *
     * Parameters:
     * options - {Object}
     *      * activeOverMapOnly : defaults to *true* (deprecated)
     *      * logoSize (deprecated)
     *      * 'OpenLayers.Control.KeyboardDefaults' - {Object} options for control
     *      <OpenLayers.Control.KeyboardDefaults at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/KeyboardDefaults-js.html>.
     *      activeOverMapOnly can be put here;
     *      * 'Geoportal.Control.Logo' - {Object} options for control <Geoportal.Control.Logo>.
     *      logoSize can be put here;
     */
    loadControls: function(options) {
        options= options || {};
        // deprecated options :
        if (options.logoSize) {
            options['Geoportal.Control.Logo']=
                options['Geoportal.Control.Logo'] || {};
            options['Geoportal.Control.Logo'].logoSize= options.logoSize || Geoportal.Control.Logo.WHSizes.mini;
        }

        Geoportal.Viewer.Simple.prototype.loadControls.apply(this,[options]);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Viewer.Mobile"*
     */
    CLASS_NAME: "Geoportal.Viewer.Mobile"
});
