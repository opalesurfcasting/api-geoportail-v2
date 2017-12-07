/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/Address.js
 * @requires Geoportal/OLS/LUS.js
 * @requires Geoportal/OLS/LUS/SearchCentreDistance.js
 */
/**
 * Class: Geoportal.OLS.LUS.ReverseGeocodedLocation
 * The Geoportal framework Open Location Service support Reverse Geocoded Address class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.LUS>
 */
Geoportal.OLS.LUS.ReverseGeocodedLocation=
    OpenLayers.Class(Geoportal.OLS.LUS, {

    /**
     * APIProperty: address
     * {<Geoportal.OLS.Address>} the geocoded address.
     */
    address: null,

    /**
     * APIProperty: measure
     * {<Geoportal.OLS.LUS.SearchCentreDistance>} Distance of reverse geocoded location from starting position.
     */
    measure: null,

    /**
     * APIProperty: lonlat
     * {<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>} the ponctual localisation of an address.
     */
    lonlat: null,

    /**
     * Constructor: Geoportal.OLS.LUS.ReverseGeocodedLocation
     *
     * Parameters:
     * address - {<Geoportal.OLS.Address>} the address.
     * point - {<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>} the localisation of the address.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(address, point, options) {
        this.address= address;
        this.measure= null;
        this.lonlat= point;
        Geoportal.OLS.LUS.prototype.initialize.apply(this,[options]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        if (this.address) {
            this.address.destroy();
            this.address= null;
        }
        if (this.measure) {
            this.measure.destroy();
            this.measure= null;
        }
        this.lonlat= null;
        Geoportal.OLS.LUS.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.ReverseGeocodedLocation"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.ReverseGeocodedLocation"
});
