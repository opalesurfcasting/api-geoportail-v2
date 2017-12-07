/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/UOM/AbstractMeasure.js
 */
/**
 * Class: Geoportal.OLS.UOM.Angle
 * The Geoportal framework Open Location Service support Angle class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.UOM.AbstractMeasure>
 */
Geoportal.OLS.UOM.Angle=
    OpenLayers.Class(Geoportal.OLS.UOM.AbstractMeasure, {

    /**
     * APIProperty: uom
     * {String}
     *      Defaults to *"DecimalDegrees"*
     */
    uom: "DecimalDegrees",

    /**
     * Constructor: Geoportal.OLS.UOM.Angle
     *
     * Parameters:
     * value - {Number} the angle measurement.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(value,options) {
        this.value= value;
        Geoportal.OLS.UOM.AbstractMeasure.prototype.initialize.apply(this,[options]);
        this.uom= "DecimalDegrees";//constant
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.uom= "DecimalDegrees";
        Geoportal.OLS.UOM.AbstractMeasure.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.UOM.Angle"*
     */
    CLASS_NAME:"Geoportal.OLS.UOM.Angle"
});
