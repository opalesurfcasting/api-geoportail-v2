/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/UOM/AbstractMeasure.js
 */
/**
 * Class: Geoportal.OLS.UOM.Speed
 * The Geoportal framework Open Location Service support Speed class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.UOM.AbstractMeasure>
 */
Geoportal.OLS.UOM.Speed=
    OpenLayers.Class(Geoportal.OLS.UOM.AbstractMeasure, {

    /**
     * APIProperty: uom
     * {String} One of "KPH", "MPH", "MPS", "FPS".
     *      Defaults to *"KPH"*
     */
    uom: "KPH",

    /**
     * Constructor: Geoportal.OLS.UOM.Speed
     *
     * Parameters:
     * value - {Number} the distance measurement.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(value,options) {
        this.value= value;
        this.uom= "KPH";
        Geoportal.OLS.UOM.AbstractMeasure.prototype.initialize.apply(this,[options]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.uom= null;
        Geoportal.OLS.UOM.AbstractMeasure.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.UOM.Speed"*
     */
    CLASS_NAME:"Geoportal.OLS.UOM.Speed"
});
