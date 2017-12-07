/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Layer.js
 * @requires Geoportal/Format/XLS/v1_1/LocationUtilityService.js
 * @requires Geoportal/Format/XLS/v1_0/LocationUtilityService.js
 */
/**
 * Class: Geoportal.Layer.OpenLS
 * The Geoportal framework Open Location Service support base class.
 *
 * Inherits from:
 * - {<Geoportal.Layer>}
 * - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>}
 */
Geoportal.Layer.OpenLS=
    OpenLayers.Class( OpenLayers.Layer.Vector, {

    /**
     * APIProperty: displayInLayerSwitcher
     * {Boolean} Display the layer's name in the layer switcher.  Default is
     *     false.
     */
    displayInLayerSwitcher: false,

    /**
     * APIProperty: requestOptions
     * {Object} Various properties used when issuying requests.
     *  this option was renamed (previously postOptions).
     */
    requestOptions: null,

    /**
     * APIProperty: version
     * {String} Version of the OpenLS.
     *      Defaults to *1.2*
     */
    version: '1.2',

    /**
     * APIProperty: format
     * {<OpenLayers.Format at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format-js.html>} the format driver for reading/writing OpenLS
     * requests/responses.
     */
    format: null,

    /**
     * APIProperty: formatOptions
     * {Object} Various properties used for instantiating the format driver.
     */
    formatOptions: null,

    /**
     * APIProperty: ols
     * {<Geoportal.OLS>} The OpenLS object.
     */
    ols: null,

    /**
     * Constructor: Geoportal.Layer.OpenLS
     * Create a new Open Location Service Layer.
     *
     * Parameters:
     * name - {String} The layer name.
     * options - {Object} Hashtable of extra options to tag onto the layer.
     *      Valid options are :
     *      * requestOptions - {Object} hash of request options. See
     *          <OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html> for more information. Most relevant options
     *          are :
     *          * method - {String} GET (default value) or POST,
     *          * url - {String},
     *          * headers - {Object}.
     *      * formatOptions - {Object} hash of format options. See
     *          <Geoportal.Format.XLS> for more information. Most relevant options
     *          are : version - {String}.
     */
    initialize: function(name, options) {
        switch (name) {
        case 'TOPONYMS.ALL:OPENLS'       :
            name= 'PositionOfInterest:OPENLS;Geocode';
            break;
        case 'ADDRESSES.CROSSINGS:OPENLS':
            name= 'StreetAddress:OPENLS;Geocode';
            break;
        default                          :
            break;
        }
        OpenLayers.Layer.Vector.prototype.initialize.apply(this, [name, options]);
        this.requestOptions= OpenLayers.Util.applyDefaults(
            this.requestOptions,
            {
                url:'http://localhost/',
                method:'GET',
                callback:function(){},
                success:this.success,
                failure:this.failure,
                scope:this
            });
        this.formatOptions= OpenLayers.Util.applyDefaults(
            this.formatOptions,
            {
                version:this.version,
                externalProjection:new OpenLayers.Projection(
                    'EPSG:4326',
                    {
                        domainOfValidity: new OpenLayers.Bounds(-180,-90,180,90)
                    })
            });
        this.version= this.formatOptions.version;
    },

    /**
     * APIMethod: destroy
     * Clean up the OpenLS layer.
     */
    destroy: function() {
        if (this.format) {
            if (typeof(this.format)=='object') {
                this.format.destroy();
            }
            this.format= null;
        }
        this.formatOptions= null;
        this.requestOptions= null;
        if (this.ols) {
            this.ols.destroy();
            this.ols= null;
        }
        OpenLayers.Layer.Vector.prototype.destroy.apply(this,arguments); 
    },

    /**
     * APIMethod: setMap
     * The layer has been added to the map.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        OpenLayers.Layer.Vector.prototype.setMap.apply(this, arguments);
        if (map && map.getProjection()) {
            if (!this.formatOptions.internalProjection) {
                this.formatOptions.internalProjection= map.getProjection().clone();
            }
        }
        if (!this.format) {
            this.format= Geoportal.Format.XLS;
        }
        if (typeof(this.format)=='function') {
            this.format= new this.format(this.formatOptions);
        }
    },

    /**
     * Method: success
     * Called when the Ajax request returns a response.
     *
     * Parameters:
     * request - {XmlNode} request to server
     */
    success: function(request) {
        if (this.ols) {
            this.ols.destroy();
            this.ols= null;
        }
        if (!request) {return;}
        var doc= request.responseXML;
        if (!doc || !doc.documentElement) {
            doc= request.responseText;
        }
        this.ols= this.format.read(doc);
        if (!this.ols) {return;}
        // ErrorList
        var errs= this.ols? this.ols.getErrors():null;
        if (errs) {
            //TODO
            this.ols.destroy();
            this.ols= null;
            return;
        }
        if (this.ols.getNbBodies()<=0) {
            this.ols.destroy();
            this.ols= null;
            return;
        }
    },

    /**
     * Method: failure
     * Called when the Ajax request fails.
     *
     * Parameters:
     * request - {XmlNode} request to server
     */
    failure: function(request) {
        if (this.ols) {
            this.ols.destroy();
            this.ols= null;
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Layer.OpenLS"*
     */
    CLASS_NAME:"Geoportal.Layer.OpenLS"
});
