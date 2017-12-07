/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/UOM/Distance.js
 * @requires Geoportal/OLS/LUS.js
 */
/**
 * Class: Geoportal.OLS.LUS.SearchCentreDistance
 * The Geoportal framework Open Location Service support Distance class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.LUS>
 *  - <Geoportal.OLS.UOM.Distance>
 */
Geoportal.OLS.LUS.SearchCentreDistance=
    OpenLayers.Class(Geoportal.OLS.LUS, Geoportal.OLS.UOM.Distance, {

    /**
     * Constructor: Geoportal.OLS.LUS.SearchCentreDistance
     *
     * Parameters:
     * value - {Number} the distance measurement.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(value,options) {
        Geoportal.OLS.UOM.Distance.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        Geoportal.OLS.UOM.Distance.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this address.
     *
     * Returns:
     * {<Geoportal.OLS.Address>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.LUS.SearchCentreDistance(
            {
                value: this.value,
                accuracy: this.accuracy,
                uom: this.uom
            }
        );
        return obj;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.SearchCentreDistance"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.SearchCentreDistance"
});
