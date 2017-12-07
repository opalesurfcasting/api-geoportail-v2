/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Layer.js
 */
/**
 * Class: Geoportal.Layer.WMSC
 * The Geoportal framework WMSC class.
 * Instances of Geoportal.Layer.WMSC are used to display data from
 * <http://www.tilecache.org/#wmsc>.
 *      Create a new WMS-C layer with the <Geoportal.Layer.WMSC> constructor.
 *
 * Inherits from:
 *  - {<Geoportal.Layer.Grid>}
 */
Geoportal.Layer.WMSC = OpenLayers.Class( Geoportal.Layer.Grid, {

    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs
     */
    DEFAULT_PARAMS: {
        service: "WMS",
        version: "1.1.1",
        request: "GetMap",
        styles: "",
        exceptions: "application/vnd.ogc.se_inimage",
        format: "image/jpeg"
    },

    /**
     * APIProperty: isBaseLayer
     * {Boolean} Default is false for WMS-C layer
     */
    isBaseLayer: false,

    /**
     * Constructor: Geoportal.Layer.WMSC
     * Create a new WMS-C layer object.
     *
     * Parameters:
     * name - {String} A name for the layer.
     * url - {String} Base url for the WMS-C.
     * params - {Object} An object with key/value pairs representing the
     *                   GetMap query string parameters and parameter values.
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, params, options) {
        var newArguments = [];
        //uppercase params
        params = OpenLayers.Util.upperCaseObject(params);
        newArguments.push(name, url, params, options);
        Geoportal.Layer.Grid.prototype.initialize.apply(this, newArguments);

        OpenLayers.Util.applyDefaults(
            this.params,
            OpenLayers.Util.upperCaseObject(this.DEFAULT_PARAMS)
        );

        //layer is transparent
        if (this.params.TRANSPARENT &&
            this.params.TRANSPARENT.toString().toLowerCase() == "true") {

            // unless explicitly set in options, make layer an overlay
            if ( (options == null) || (!options.isBaseLayer) ) {
                this.isBaseLayer = false;
            }

            // jpegs can never be transparent, so intelligently switch the
            //  format, depending on teh browser's capabilities
            if (this.params.FORMAT == "image/jpeg") {
                this.params.FORMAT = OpenLayers.Util.alphaHack() ? "image/gif" :
                                                                   "image/png";
            }
        }
    },

    /**
     * APIMethod: destroy
     * Destroy this layer
     */
    destroy: function() {
        // for now, nothing special to do here.
        Geoportal.Layer.Grid.prototype.destroy.apply(this, arguments);
    },


    /**
     * APIMethod: clone
     * Create a clone of this layer
     *
     * Returns:
     * {<Geoportal.Layer.WMSC>} An exact clone of this layer
     */
    clone: function (obj) {
        if (obj == null) {
            obj = new Geoportal.Layer.WMSC(this.name,
                                           this.url,
                                           this.params,
                                           this.options);
        }

        //get all additions from superclasses
        obj = Geoportal.Layer.Grid.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },

    /**
     * Method: initResolutions
     * This method's responsibility is to set up the 'resolutions' array
     *     for the layer -- this array is what the layer will use to interface
     *     between the zoom levels of the map and the resolution display
     *     of the layer.
     *
     * The user has several options that determine how the array is set up.
     *
     * For a detailed explanation, see the following wiki from the
     *     openlayers.org homepage:
     *     http://trac.openlayers.org/wiki/SettingZoomLevels
     */
    initResolutions: function() {
        Geoportal.Layer.Grid.prototype.initResolutions.apply(this,arguments);
        // check resolutions consistency :
        if (this.nativeResolutions) {
            var mnzl= Math.max(0,this.minZoomLevel), mxzl= Math.min(this.nativeResolutions.length,this.maxZoomLevel+1) ;
            if (mnzl>mxzl) {
                OpenLayers.Console.error('resolutions inconsistency - check '+this.name+' (deactived)');//i18n
                this.minZoomLevel= (this.map.baseLayer? this.map.baseLayer:this.map).maxZoomLevel+1;
                this.maxZoomLevel= this.minZoomLevel;
                this.visibility= false;
            }
        }
    },

    /**
     * APIMethod: getURL
     * Build the WMS-C url
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     *
     * Returns:
     * {String} A string with the layer's url and parameters and also the
     *           passed-in bounds and appropriate tile size specified as
     *           parameters
     */
    getURL: function (bounds) {
        if (this.gutter) {
            bounds = this.adjustBoundsByGutter(bounds);
        }

        var newParams = {
            BBOX:bounds.toBBOX(),
            WIDTH:this.nativeTileSize.w,
            HEIGHT:this.nativeTileSize.h,
            TILED:true
        };

        return decodeURIComponent(this.getFullRequestString(newParams));
    },

    /**
     * APIMethod: mergeNewParams
     * Catch changeParams and uppercase the new params to be merged in
     *     before calling changeParams on the super class.
     *
     *     Once params have been changed, we will need to re-init our tiles.
     *
     * Parameters:
     * newParams - {Object} Hashtable of new params to use
     */
    mergeNewParams:function(newParams) {
        var upperParams = OpenLayers.Util.upperCaseObject(newParams);
        var newArguments = [upperParams];
        Geoportal.Layer.Grid.prototype.mergeNewParams.apply(this, newArguments);
    },

    /**
     * APIMethod: getFullRequestString
     * Combine the layer's url with its params and these newParams.
     *
     *     Add the SRS parameter from projection -- this is probably
     *     more eloquently done via a setProjection() method, but this
     *     works for now and always.
     *
     * Parameters:
     * newParams - {Object}
     *
     * Returns:
     * {String}
     */
    getFullRequestString:function(newParams) {
        var projection = this.getNativeProjection() || this.map.getProjection();
        this.params.SRS = (projection == "none") ? null : projection;
        return Geoportal.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Layer.WMSC"*
     */
    CLASS_NAME: "Geoportal.Layer.WMSC"
});
