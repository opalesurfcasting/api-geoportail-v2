/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/UOM/TimeStamp.js
 */
/**
 * Class: Geoportal.OLS.UOM.Time
 * The Geoportal framework Open Location Service support Time class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.UOM.TimeStamp>
 */
Geoportal.OLS.UOM.Time=
    OpenLayers.Class(Geoportal.OLS.UOM.TimeStamp, {

    /**
     * APIProperty: utcOffset
     * {Integer}
     */
    utcOffset: null,

    /**
     * Constructor: Geoportal.OLS.UOM.Time
     *
     * Parameters:
     * begin - {String}
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(begin, options) {
        this.begin= begin;
        this.utcOffset= null;
        Geoportal.OLS.UOM.TimeStamp.prototype.initialize.apply(this,[options]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.utcOffset= null;
        Geoportal.OLS.UOM.TimeStamp.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.UOM.Time"*
     */
    CLASS_NAME:"Geoportal.OLS.UOM.Time"
});
