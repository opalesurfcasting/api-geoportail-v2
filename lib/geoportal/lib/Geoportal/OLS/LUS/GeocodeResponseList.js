/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/LUS.js
 * @requires Geoportal/OLS/LUS/GeocodedAddress.js
 */
/**
 * Class: Geoportal.OLS.LUS.GeocodeResponseList
 * The Geoportal framework Open Location Service support geocode response list class.
 *      The list of  responses for each of the requested Address ADTs. Each
 *      requested address may have 1-n responses (numberOfAddresses).
 *
 * Inherits from:
 *  - <Geoportal.OLS.LUS>
 */
Geoportal.OLS.LUS.GeocodeResponseList=
    OpenLayers.Class( Geoportal.OLS.LUS, {

    /**
     * APIProperty: numberOfGeocodedAddresses
     * {Integer} This is the number of responses generated per the different
     * requests. Within each geocoded address tit's possible to have multiple
     * candidates.
     */
    numberOfGeocodedAddresses: null,

    /**
     * APIProperty: geocodedAddresses
     * {Array(<Geoportal.OLS.LUS.GeocodedAddress>)} The list of 1-n addresses that are
     * returned for each Address request, sorted by Accuracy.
     */
    geocodedAddresses: null,

    /**
     * Constructor: Geoportal.OLS.LUS.GeocodeResponseList
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.numberOfGeocodedAddresses= 0;
        this.geocodedAddresses= [];
        Geoportal.OLS.LUS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.numberOfGeocodedAddresses= null;
        if (this.geocodedAddresses) {
            for (var i= 0, len= this.geocodedAddresses.length; i<len; i++) {
                this.geocodedAddresses[i].destroy();
                this.geocodedAddresses[i]= null;
            }
            this.geocodedAddresses= null;
        }
        Geoportal.OLS.LUS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: addGeocodedAddress
     * Add a <Geoportal.OLS.LUS.GeocodedAddress>.
     *
     * Parameters:
     * ga - {<Geoportal.OLS.LUS.GeocodedAddress>} a geocoded address.
     */
    addGeocodedAddress: function(ga) {
        if (!this.geocodedAddresses) {
            this.geocodedAddresses= [];
        }
        if (ga) {
            this.geocodedAddresses.push(ga);
        }
    },

    /**
     * APIMethod: getNbGeocodedAddresses
     * Return the number of <Geoportal.OLS.LUS.GeocodedAddress>.
     *
     * Returns:
     * {Integer}
     */
    getNbGeocodedAddresses: function() {
        return this.geocodedAddresses? this.geocodedAddresses.length : 0;
    },

    /**
     * APIMethod: getGeocodedAddresses
     * Return all <Geoportal.OLS.LUS.GeocodedAddress>.
     *
     * Returns:
     * {Array({<Geoportal.OLS.LUS.GeocodedAddress>})} or null
     */
    getGeocodedAddresses: function() {
        return this.geocodedAddresses? this.geocodedAddresses : null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.GeocodeResponseList"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.GeocodeResponseList"
});
