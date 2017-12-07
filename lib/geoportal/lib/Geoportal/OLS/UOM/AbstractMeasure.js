/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/UOM.js
 */
/**
 * Class: Geoportal.OLS.UOM.AbstractMeasure
 * The Geoportal framework Open Location Service support abstract measure class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.UOM>
 */
Geoportal.OLS.UOM.AbstractMeasure=
    OpenLayers.Class(Geoportal.OLS.UOM, {

    /**
     * APIProperty: value
     * {Number}
     */
    value: null,

    /**
     * APIProperty: accuracy
     * {Number}
     */
    accuracy: null,

    /**
     * Constructor: Geoportal.OLS.UOM.AbstractMeasure
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        Geoportal.OLS.UOM.prototype.initialize.apply(this,arguments);
        this.value= null;
        this.accuracy= null;
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.value= null;
        this.accuracy= null;
        Geoportal.OLS.UOM.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     *
     * creates a copy of the current instance of this object
     */
    clone: function() {
        var copy= new Geoportal.OLS.UOM.AbstractMeasure() ;
        copy.value= this.value;
        copy.accuracy= this.accuracy;
        return copy ;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.UOM.AbstractMeasure"*
     */
    CLASS_NAME:"Geoportal.OLS.UOM.AbstractMeasure"
});
