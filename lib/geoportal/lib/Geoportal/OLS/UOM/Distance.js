/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/UOM/AbstractMeasure.js
 */
/**
 * Class: Geoportal.OLS.UOM.Distance
 * The Geoportal framework Open Location Service support Distance class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.UOM.AbstractMeasure>
 */
Geoportal.OLS.UOM.Distance=
    OpenLayers.Class(Geoportal.OLS.UOM.AbstractMeasure, {

    /**
     * APIProperty: uom
     * {String} One of "KM", "M", "DM", "MI", "YD", "FT".
     *      Defaults to *"M"*
     */
    uom: "M",

    /**
     * Constructor: Geoportal.OLS.UOM.Distance
     *
     * Parameters:
     * value - {Number} the distance measurement.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(value,options) {
        Geoportal.OLS.UOM.AbstractMeasure.prototype.initialize.apply(this,[options]);
        this.value= value;
        this.uom= "M";
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
     * APIMethod: clone
     *
     * creates a copy of the current instance of this object
     */
    clone: function() {
        var copy= Geoportal.OLS.UOM.AbstractMeasure.prototype.clone.apply(this) ;
        copy.uom= this.uom;
        return copy ;
    },  
        

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.UOM.Distance"*
     */
    CLASS_NAME:"Geoportal.OLS.UOM.Distance"
});
