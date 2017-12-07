/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractResponseParameters.js
 * @requires Geoportal/OLS/LUS.js
 * @requires Geoportal/OLS/LUS/GeocodeResponseList.js
 */
/**
 * Class: Geoportal.OLS.LUS.GeocodeResponse
 * The Geoportal framework Open Location Service support geocode response class.
 *      The addresses returned will be normalized Address ADTs as a result of
 *      any parsing by the geocoder, etc.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractResponseParameters>
 *  - <Geoportal.OLS.LUS>
 */
Geoportal.OLS.LUS.GeocodeResponse=
    OpenLayers.Class( Geoportal.OLS.LUS, Geoportal.OLS.AbstractResponseParameters, {

    /**
     * APIProperty: geocodeResponses
     * {Array(<Geoportal.OLS.LUS.GeocodeResponseList>)} The list of  responses for
     * each of the requested Address ADTs. Each requested address may have 1-n
     * responses (numberOfAddresses).
     */
    geocodeResponses: null,

    /**
     * Constructor: Geoportal.OLS.LUS.GeocodeResponse
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.geocodeResponses= [];
        Geoportal.OLS.AbstractResponseParameters.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        if (this.geocodeResponses) {
            for (var i= 0, len= this.geocodeResponses.length; i<len; i++) {
                this.geocodeResponses[i].destroy();
                this.geocodeResponses[i]= null;
            }
            this.geocodeResponses= null;
        }
        Geoportal.OLS.AbstractResponseParameters.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: addGeocodeResponseList
     * Add a <Geoportal.OLS.LUS.GeocodeResponseList>.
     *
     * Parameters:
     * grl - {<Geoportal.OLS.LUS.GeocodeResponseList>} a list of geocode responses.
     */
    addGeocodeResponseList: function(grl) {
        if (!this.geocodeResponses) {
            this.geocodeResponses= [];
        }
        if (grl) {
            this.geocodeResponses.push(grl);
        }
    },

    /**
     * APIMethod: getNbGeocodeResponseList
     * Return the number of <Geoportal.OLS.LUS.GeocodeResponseList>.
     *
     * Returns:
     * {Integer}
     */
    getNbGeocodeResponseList: function() {
        return this.geocodeResponses? this.geocodeResponses.length : 0;
    },

    /**
     * APIMethod: getGeocodeResponseList
     * Return all <Geoportal.OLS.LUS.GeocodeResponseList>.
     *
     * Returns:
     * {Array({<Geoportal.OLS.LUS.GeocodeResponseList>})} or null
     */
    getGeocodeResponseList: function() {
        return this.geocodeResponses? this.geocodeResponses : null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.GeocodeResponse"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.GeocodeResponse"
});
