/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/LUS.js
 * @requires Geoportal/OLS/Address.js
 * @requires Geoportal/OLS/GeocodeMatchCode.js
 */
/**
 * Class: Geoportal.OLS.LUS.GeocodedAddress
 * The Geoportal framework Open Location Service Location Utility support Geocoded Address class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.LUS>
 */
Geoportal.OLS.LUS.GeocodedAddress=
    OpenLayers.Class(Geoportal.OLS.LUS, {

    /**
     * APIProperty: address
     * {<Geoportal.OLS.Address>} the geocoded address.
     */
    address: null,

    /**
     * APIProperty: lonlat
     * {<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>} the ponctual localisation of an address.
     */
    lonlat: null,

    /**
     * APIProperty: geocodeMatchCode
     * {<Geoportal.OLS.GeocodeMatchCode>} Information on the quality of the
     * match operation.
     */
    geocodeMatchCode: null,

    /**
     * Constructor: Geoportal.OLS.LUS.GeocodedAddress
     *
     * Parameters:
     * address - {<Geoportal.OLS.Address>} the address.
     * point - {<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>} the localisation of the address.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(address, point, options) {
        this.address= address;
        this.lonlat= point;
        this.geocodeMatchCode= null;
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
        if (this.geocodeMatchCode) {
            this.geocodeMatchCode.destroy();
            this.geocodeMatchCode= null;
        }
        this.lonlat= null;
        Geoportal.OLS.LUS.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.GeocodedAddress"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.GeocodedAddress"
});
