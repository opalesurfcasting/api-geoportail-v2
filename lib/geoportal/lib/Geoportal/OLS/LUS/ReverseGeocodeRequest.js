/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractRequestParameters.js
 * @requires Geoportal/OLS/Position.js
 * @requires Geoportal/OLS/LUS.js
 * @requires Geoportal/OLS/LUS/ReverseGeocodePreference.js
 */
/**
 * Class: Geoportal.OLS.LUS.ReverseGeocodeRequest
 * The Geoportal framework Open Location Service support Geocode Request class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractRequestParameters>
 *  - <Geoportal.OLS.LUS>
 */
Geoportal.OLS.LUS.ReverseGeocodeRequest=
    OpenLayers.Class( Geoportal.OLS.LUS, Geoportal.OLS.AbstractRequestParameters, {

    /**
     * APIProperty: position
     * {<Geoportal.OLS.Position>} Represent an observation/calculated
     * position.
     */
    position: null,

    /**
     * APIProperty: preferences
     * {Array(<Geoportal.OLS.LUS.ReverseGeocodePreference>)} Preference for Reverse
     * Geocode response.
     */
    preferences: null,

    /**
     * Constructor: Geoportal.OLS.LUS.ReverseGeocodeRequest
     *
     * Parameters:
     * position - {<Geoportal.OLS.Position>} Represent a search location.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(position,options) {
        this.position= position;
        this.preferences= [];
        Geoportal.OLS.AbstractRequestParameters.prototype.initialize.apply(this,[options]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        if (this.position) {
            this.position.destroy();
            this.position= null;
        }
        if (this.preferences) {
            for (var i= 0, len= this.preferences.length; i<len; i++) {
                this.preferences[i].destroy();
                this.preferences[i]= null;
            }
            this.preferences= null;
        }
        Geoportal.OLS.AbstractRequestParameters.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: addPreference
     * Add a preference.
     *
     * Parameters:
     * preferences - {<Geoportal.OLS.LUS.ReverseGeocodePreference>} a preference.
     */
    addPreference: function(preference) {
        if (!this.preferences) {
            this.preferences= [];
        }
        if (preference) {
            this.preferences.push(preference);
        }
    },

    /**
     * APIMethod: getNbPreferences
     * Return the number of preferences.
     *
     * Returns:
     * {Integer}
     */
    getNbPreferences: function() {
        return this.preferences? this.preferences.length : 0;
    },

    /**
     * APIMethod: getPreferences
     * Return all preferences.
     *
     * Returns:
     * {Array({<Geoportal.OLS.LUS.ReverseGeocodePreference>})} or null
     */
    getPreferences: function() {
        return this.preferences? this.preferences : null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.ReverseGeocodeRequest"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.ReverseGeocodeRequest"
});
