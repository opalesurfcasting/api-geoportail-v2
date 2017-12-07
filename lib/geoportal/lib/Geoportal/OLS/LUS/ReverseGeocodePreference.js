/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/LUS.js
 */
/**
 * Class: Geoportal.OLS.LUS.ReverseGeocodePreference
 * The Geoportal framework Open Location Service support preference class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.LUS>
 */
Geoportal.OLS.LUS.ReverseGeocodePreference=
    OpenLayers.Class( Geoportal.OLS.LUS, {

    /**
     * APIProperty: value
     * {String} One of "StreetAddress", "IntersectionAddress" or
     * "PositionOfInterest".
     */
    value: null,

    /**
     * Constructor: Geoportal.OLS.LUS.ReverseGeocodePreference
     *
     * Parameters:
     * value - {String} One of StreetAddress", "IntersectionAddress" or
     * "PositionOfInterest".
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(value,options) {
        this.value= value;
        Geoportal.OLS.LUS.prototype.initialize.apply(this,[options]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.value= null;
        Geoportal.OLS.LUS.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.ReverseGeocodePreference"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.ReverseGeocodePreference"
});
