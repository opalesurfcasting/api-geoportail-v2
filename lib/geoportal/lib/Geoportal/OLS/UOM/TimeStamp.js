/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/UOM.js
 */
/**
 * Class: Geoportal.OLS.UOM.TimeStamp
 * The Geoportal framework Open Location Service support TimeStamp class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.UOM>
 */
Geoportal.OLS.UOM.TimeStamp=
    OpenLayers.Class(Geoportal.OLS.UOM, {

    /**
     * APIProperty: begin
     * {String} DateTime
     */
    begin: null,

    /**
     * APIProperty: duration
     * {String} Duration
     */
    duration: null,

    /**
     * Constructor: Geoportal.OLS.UOM.TimeStamp
     *
     * Parameters:
     * begin - {String}
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(begin, options) {
        this.begin= begin;
        this.duration= null;
        Geoportal.OLS.UOM.prototype.initialize.apply(this,[options]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.begin= null;
        this.duration= null;
        Geoportal.OLS.UOM.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.UOM.TimeStamp"*
     */
    CLASS_NAME:"Geoportal.OLS.UOM.TimeStamp"
});
