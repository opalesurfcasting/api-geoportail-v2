/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/XLS/v1_1.js
 * @requires Geoportal/OLS/LUS/GeocodeRequest.js
 * @requires Geoportal/OLS/LUS/GeocodeResponse.js
 * @requires Geoportal/OLS/LUS/GeocodedAddress.js
 * @requires Geoportal/OLS/LUS/GeocodeResponseList.js
 * @requires Geoportal/OLS/LUS/ReverseGeocodeRequest.js
 * @requires Geoportal/OLS/LUS/ReverseGeocodeResponse.js
 * @requires Geoportal/OLS/LUS/ReverseGeocodedLocation.js
 * @requires Geoportal/OLS/LUS/ReverseGeocodePreference.js
 * @requires Geoportal/OLS/LUS/SearchCentreDistance.js
 */
/**
 * Class: Geoportal.Format.XLS.v1_1.LocationUtilityService
 * The Geoportal LocationUtilityService request/response format class.
 *      Superclass for XLS version 1.1.0 parsers.
 *
 * Inherits from:
 *  - <Geoportal.Format.XLS.v1_1>
 */
Geoportal.Format.XLS.v1_1.LocationUtilityService=
    OpenLayers.Class( Geoportal.Format.XLS.v1_1, {

    /**
     * Constant: CORESERVICE
     * {String} *"LocationUtilityService"*
     */
    CORESERVICE: "LocationUtilityService",

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocation: "http://schemas.opengis.net/ols/1.1.0/LocationUtilityService.xsd",

    /**
     * Constructor: Geoportal.Format.XLS.v1_1.LocationUtilityService
     * Instances of this class are not created directly.  Use the
     *      <Geoportal.Format.XLS> constructor instead.
     *
     * (code start)
     * var f= new Geoportal.Format.XLS({version: "1.1", coreService: "LocationUtilityService"});
     * (end)
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance. The most relevant options for this class are :
     *     * version : should be set to "1.1";
     *     * coreService : should be set to "LocationUtilityService".
     */
    initialize: function(options) {
        Geoportal.Format.XLS.v1_1.prototype.initialize.apply(this, [options]);
        this._addReaders();
        this._addWriters();
    },

    /**
     * Method: _addReaders
     * Add xls and gml readers needed for Location utility parsing.
     */
    _addReaders: function() {
        this.readers.xls= OpenLayers.Util.applyDefaults(
            this.readers.xls,
            {
                "GeocodeResponse": function(node, resp) {
                    var gr= new Geoportal.OLS.LUS.GeocodeResponse();
                    resp.setResponseParameters(gr);
                    this.readChildNodes(node, gr);
                },
                "ReverseGeocodeResponse": function(node, resp) {
                    var rgr= new Geoportal.OLS.LUS.ReverseGeocodeResponse();
                    resp.setResponseParameters(rgr);
                    this.readChildNodes(node, rgr);
                },
                "GeocodeResponseList": function(node, gr) {
                    var gresp= new Geoportal.OLS.LUS.GeocodeResponseList();
                    gresp.numberOfGeocodedAddresses=
                        parseInt(node.getAttribute("numberOfGeocodedAddresses"));//mandatory
                    if (isNaN(gresp.numberOfGeocodedAddresses)) {
                        gresp.numberOfGeocodedAddresses= 0;
                    }
                    if (isNaN(gresp.numberOfGeocodedAddresses)) {
                        gresp.numberOfGeocodedAddresses= 1;
                    }
                    gr.addGeocodeResponseList(gresp);
                    this.readChildNodes(node, gresp);
                },
                "ReverseGeocodedLocation": function(node, rgr) {
                    var reversegeocodedlocation= new Geoportal.OLS.LUS.ReverseGeocodedLocation();
                    rgr.addReverseGeocodedLocations(reversegeocodedlocation);
                    this.readChildNodes(node, reversegeocodedlocation);
                },
                "GeocodedAddress": function(node, obj) {
                    var geocodedaddress= new Geoportal.OLS.LUS.GeocodedAddress();
                    obj.addGeocodedAddress(geocodedaddress);
                    this.readChildNodes(node, geocodedaddress);
                },
                "SearchCentreDistance": function(node, reversegeocodedlocation) {
                    var v= parseFloat(node.getAttribute("value"));//mandatory
                    if (isNaN(v)) {
                        v= 0.0;
                    }
                    var dist= new Geoportal.OLS.LUS.SearchCentreDistance(v);
                    dist.accuracy= parseFloat(node.getAttribute("accuracy"));//optional
                    if (isNaN(dist.accuracy)) {
                        dist.accuracy= null;
                    }
                    dist.uom= node.getAttribute("uom");//mandatory, default:"M"
                    reversegeocodedlocation.measure= dist;
                },
                "GeocodeRequest": function(node, rqst) {
                    var gr= new Geoportal.OLS.LUS.GeocodeRequest();
                    rqst.setRequestParameters(gr);
                    this.readChildNodes(node, gr);
                },
                "ReverseGeocodeRequest": function(node, rqst) {
                    var rgr= new Geoportal.OLS.LUS.ReverseGeocodeRequest();
                    rqst.setRequestParameters(rgr);
                    this.readChildNodes(node, rgr);
                },
                "ReverseGeocodePreference": function(node, rgr) {
                    var rgp= new Geoportal.OLS.LUS.ReverseGeocodePreference();
                    rgp.value= node.childNodes.length>0?
                        node.childNodes[0].nodeValue || "StreetAddress"
                    :   "StreetAddress";
                    rgr.addPreference(rgp);
                }
            }
        );
    },

    /**
     * Method: _addWriters
     * Add xls and gml readers needed for Location utility parsing.
     */
    _addWriters: function() {
        this.writers.xls= OpenLayers.Util.applyDefaults(
            this.writers.xls,
            {
                "GeocodeResponse": function(gr) {
                    var node= this.createElementNSPlus("xls:GeocodeResponse");
                    for (var i= 0, len= gr.getNbGeocodeResponseList(); i<len; i++) {
                        this.writeNode('xls:GeocodeResponseList', gr.getGeocodeResponseList()[i], node);
                    }
                    return node;
                },
                "ReverseGeocodeResponse": function(rgr) {
                    var node= this.createElementNSPlus("xls:ReverseGeocodeResponse");
                    for (var i= 0, len= rgr.getNbReverseGeocodedLocations(); i<len; i++) {
                        this.writeNode('xls:ReverseGeocodedLocation', rgr.getReverseGeocodedLocations()[i], node);
                    }
                    return node;
                },
                "GeocodeResponseList": function(grl) {
                    var node= this.createElementNSPlus("xls:GeocodeResponseList",
                                {
                                    attributes:{
                                        'numberOfGeocodedAddresses': grl.getNbGeocodedAddresses()
                                    }
                                });
                    for (var i= 0, len= grl.getNbGeocodedAddresses(); i<len; i++) {
                        this.writeNode('xls:GeocodedAddress', grl.getGeocodedAddresses()[i], node);
                    }
                    return node;
                },
                "ReverseGeocodedLocation": function(rgl) {
                    var node= this.createElementNSPlus("xls:ReverseGeocodedLocation");
                    this.writeNode('gml:Point', rgl.lonlat, node);
                    if (rgl.address) {
                        this.writeNode('xls:Address', rgl.address, node);
                    }
                    if (rgl.searchCentreDistance) {
                        this.writeNode('xls:SearchCentreDistance', rgl.searchCentreDistance, node);
                    }
                    return node;
                },
                "GeocodedAddress": function(ga) {
                    var node= this.createElementNSPlus("xls:GeocodedAddress");
                    this.writeNode('gml:Point', ga.lonlat, node);
                    if (ga.address) {
                        this.writeNode('xls:Address', ga.address, node);
                    }
                    if (ga.geocodeMatchCode) {
                        this.writeNode('xls:GeocodeMatchCode', ga.geocodeMatchCode, node);
                    }
                    return node;
                },
                "SearchCentreDistance": function(scd) {
                    var atts= {
                        attributes: {
                            'value': scd.value
                        }
                    };
                    if (typeof(scd.accuracy)=='number' && !isNan(scd.accuracy)) {
                        OpenLayers.Util.extend(atts.attributes, {'accuracy': scd.accuracy});
                    }
                    if (scd.uom!=null) {
                        OpenLayers.Util.extend(atts.attributes, {'uom': scd.uom});
                    }
                    var node= this.createElementNSPlus("xls:SearchCentreDistance");
                    return node;
                },
                "GeocodeRequest": function(gr) {
                    var node= this.createElementNSPlus("xls:GeocodeRequest");
                    for (var i= 0, len= gr.getNbAddresses(); i<len; i++) {
                        this.writeNode('xls:Address', gr.getAddresses()[i], node);
                    }
                    return node;
                },
                "ReverseGeocodeRequest": function(rgr) {
                    var node= this.createElementNSPlus("xls:ReverseGeocodeRequest");
                    if (rgr.position) {
                        this.writeNode('xls:Position', rgr.position, node);
                    }
                    var len= rgr.getNbPreferences();
                    if (len>0) {
                        for (var i= 0; i<len; i++) {
                            this.writeNode('xls:ReverseGeocodePreference', rgr.getPreferences()[i], node);
                        }
                    }
                    return node;
                },
                "ReverseGeocodePreference": function(rgp) {
                    var node= this.createElementNSPlus("xls:ReverseGeocodePreference", {value: rgp.value});
                    return node;
                }
            }
        );
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.XLS.v1_1.LocationUtilityService"*
     */
    CLASS_NAME:"Geoportal.Format.XLS.v1_1.LocationUtilityService"
});
