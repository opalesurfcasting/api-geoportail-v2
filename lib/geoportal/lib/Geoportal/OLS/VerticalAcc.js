/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 * @requires Geoportal/OLS/UOM/Distance.js
 */
/**
 * Class: Geoportal.OLS.VerticalAcc
 * The Geoportal framework Open Location Service support vertical accuracy class.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.VerticalAcc= OpenLayers.Class({

    /**
     * APIProperty: distance
     * {<Geoportal.OLS.UOM.Distance>}
     */
    distance: null,

    /**
     * Constructor: Geoportal.OLS.VerticalAcc
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.distance= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        if (this.distance) {
            this.distance.destroy();
            this.distance= null;
        }
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.VerticalAcc"*
     */
    CLASS_NAME:"Geoportal.OLS.VerticalAcc"
});
