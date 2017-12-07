/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/XLS/v1_2.js
 * @requires Geoportal/Format/XLS/v1_1/LocationUtilityService.js
 */
/**
 * Class: Geoportal.Format.XLS.v1_2.LocationUtilityService
 * The Geoportal LocationUtilityService request/response format class.
 *      Superclass for XLS version 1.2.0 parsers.
 * 
 * Differences between 1.2.0 and 1.1.0:
 *     - Geocode request Type : add "returnFreeForm" Boolean attibute (this does not affect the addressing system of OpenLS,
 *     but is closely related)
 *
 * Inherits from:
 *  - <Geoportal.Format.XLS.v1_1.LocationUtilityService>
 *  - <Geoportal.Format.XLS.v1_2>
 */
Geoportal.Format.XLS.v1_2.LocationUtilityService=
    OpenLayers.Class( Geoportal.Format.XLS.v1_1.LocationUtilityService, Geoportal.Format.XLS.v1_2,  {

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocation: "http://schemas.opengis.net/ols/1.2.0/LocationUtilityService.xsd",

    /**
     * Constructor: Geoportal.Format.XLS.v1_2.LocationUtilityService
     * Instances of this class are not created directly.  Use the
     *      <Geoportal.Format.XLS> constructor instead.
     *
     * (code start)
     * var f= new Geoportal.Format.XLS({version: "1.2", coreService: "LocationUtilityService"});
     * (end)
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance. The most relevant options for this class are :
     *     * version : should be set to "1.2";
     *     * coreService : should be set to "LocationUtilityService".
     */
    initialize: function(options) {
        Geoportal.Format.XLS.v1_2.prototype.initialize.apply(this, [options]);
        this._addReaders();
        this._addWriters();
    },

    /**
     * Method: _addReaders
     * Add xls and gml readers needed for Location utility parsing.
     */
    _addReaders: function() {
        Geoportal.Format.XLS.v1_1.LocationUtilityService.prototype._addReaders.apply(this);
        this.readers.xls= OpenLayers.Util.applyDefaults(
            {
                "GeocodeRequest": function(node, rqst) {
                    var gr= new Geoportal.OLS.LUS.GeocodeRequest();
                    gr.returnFreeForm= (node.getAttribute("returnFreeForm") == "true");
                    rqst.setRequestParameters(gr);
                    this.readChildNodes(node, gr);
                }
            },this.readers.xls);
    },

    /**
     * Method: _addWriters
     * Add xls and gml readers needed for Location utility parsing.
     */
    _addWriters: function() {
        Geoportal.Format.XLS.v1_1.LocationUtilityService.prototype._addWriters.apply(this);
        this.writers.xls= OpenLayers.Util.applyDefaults(
            {
                "GeocodeRequest": function(gr) {
                    var node= this.createElementNSPlus("xls:GeocodeRequest");
                    if (gr.returnFreeForm) {
                        node.setAttribute('returnFreeForm', ''+gr.returnFreeForm);
                    }
                    for (var i= 0, len= gr.getNbAddresses(); i<len; i++) {
                        this.writeNode('xls:Address', gr.getAddresses()[i], node);
                    }
                    return node;
                }
            },this.writers.xls);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.XLS.v1_2.LocationUtilityService"*
     */
    CLASS_NAME:"Geoportal.Format.XLS.v1_2.LocationUtilityService"
});
