/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Layer/OpenLS.js
 */
/**
 * Class: Geoportal.Layer.OpenLS.Core
 * The Geoportal framework Open Location Core Service support base class.
 *
 * Inherits from:
 * - {<Geoportal.Layer.OpenLS>}
 */
Geoportal.Layer.OpenLS.Core=
    OpenLayers.Class( Geoportal.Layer.OpenLS, {

    /**
     * APIProperty: clientName
     * {String} The client name, used for authentication.
     */
    clientName: null,

    /**
     * APIProperty: clientPassword
     * {String} The client password, used for authentication.
     */
    clientPassword: null,

    /**
     * APIProperty: MSID
     * {String} A client-defined unique identifier.
     */
    MSID: null,

    /**
     * APIProperty: maximumResponses
     * {Integer} Maximum numbers of responses returned by OpenLS.
     *      Defaults to *10*
     */
    maximumResponses: 10,

    /**
     * Constructor: Geoportal.Layer.OpenLS.Core
     * Create a new Open Location Core Service Layer.
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
     *          are : version - {String}, coreService - {String},
     *          externalProjection - {String} Defaults to "EPSG:4326".
     *      * clientName - {String}
     *      * clientPassword - {String}
     *      * MSID - {String}
     *      * maximumResponses - {Integer} Defaults to "10".
     */
    initialize: function(name, options) {
        Geoportal.Layer.OpenLS.prototype.initialize.apply(this, [name, options]);
    },

    /**
     * APIMethod: destroy
     * Clean up the OpenLS layer.
     */
    destroy: function() {
        this.clientName= null;
        this.clientPassword= null;
        this.MSID= null;
        Geoportal.Layer.OpenLS.prototype.destroy.apply(this,arguments); 
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Layer.OpenLS.Core"*
     */
    CLASS_NAME:"Geoportal.Layer.OpenLS.Core"
});
