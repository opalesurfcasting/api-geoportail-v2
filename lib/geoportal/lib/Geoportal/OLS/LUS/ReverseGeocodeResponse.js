/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractResponseParameters.js
 * @requires Geoportal/OLS/LUS.js
 * @requires Geoportal/OLS/LUS/ReverseGeocodedLocation.js
 */
/**
 * Class: Geoportal.OLS.LUS.ReverseGeocodeResponse
 * The Geoportal framework Open Location Service support reverse geocode response class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractResponseParameters>
 *  - <Geoportal.OLS.LUS>
 */
Geoportal.OLS.LUS.ReverseGeocodeResponse=
    OpenLayers.Class( Geoportal.OLS.LUS, Geoportal.OLS.AbstractResponseParameters, {

    /**
     * APIProperty: reverseGeocodedLocations
     * {Array(<Geoportal.OLS.LUS.ReverseGeocodedLocation>)} Reverse Geocoder
     * may find 0 to n Point-Address combinations that match.
     */
    reverseGeocodedLocations: null,

    /**
     * Constructor: Geoportal.OLS.LUS.ReverseGeocodeResponse
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.reverseGeocodedLocations= [];
        Geoportal.OLS.AbstractResponseParameters.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        if (this.reverseGeocodedLocations) {
            for (var i= 0, len= this.reverseGeocodedLocations.length; i<len; i++) {
                this.reverseGeocodedLocations[i].destroy();
                this.reverseGeocodedLocations[i]= null;
            }
            this.reverseGeocodedLocations= null;
        }
        Geoportal.OLS.AbstractResponseParameters.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: addReverseGeocodedLocations
     * Add a <Geoportal.OLS.LUS.ReverseGeocodedLocation>.
     *
     * Parameters:
     * rgl - {<Geoportal.OLS.LUS.ReverseGeocodedLocation>} a list of reverse geocode responses.
     */
    addReverseGeocodedLocations: function(rgl) {
        if (!this.reverseGeocodedLocations) {
            this.reverseGeocodedLocations= [];
        }
        if (rgl) {
            this.reverseGeocodedLocations.push(rgl);
        }
    },

    /**
     * APIMethod: getNbReverseGeocodedLocations
     * Return the number of <Geoportal.OLS.LUS.ReverseGeocodedLocation>.
     *
     * Returns:
     * {Integer}
     */
    getNbReverseGeocodedLocations: function() {
        return this.reverseGeocodedLocations? this.reverseGeocodedLocations.length : 0;
    },

    /**
     * APIMethod: getReverseGeocodedLocations
     * Return all <Geoportal.OLS.LUS.ReverseGeocodedLocation>.
     *
     * Returns:
     * {Array({<Geoportal.OLS.LUS.ReverseGeocodedLocation>})} or null
     */
    getReverseGeocodedLocations: function() {
        return this.reverseGeocodedLocations? this.reverseGeocodedLocations : null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.ReverseGeocodeResponse"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.ReverseGeocodeResponse"
});
