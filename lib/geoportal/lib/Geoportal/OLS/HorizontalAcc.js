/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 * @requires Geoportal/OLS/UOM/Distance.js
 * @requires Geoportal/OLS/UOM/Angle.js
 */
/**
 * Class: Geoportal.OLS.HorizontalAcc
 * The Geoportal framework Open Location Service support horizontal accuracy class.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.HorizontalAcc= OpenLayers.Class({

    /**
     * APIProperty: _doa
     * {<Geoportal.OLS.UOM.Distance> | <Geoportal.OLS.UOM.Angle>}
     */
    _doa: null,

    /**
     * Constructor: Geoportal.OLS.HorizontalAcc
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this._doa= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        if (this._doa) {
            this._doa.destroy();
            this._doa= null;
        }
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: setAccuracy
     * Set the distance or angle.
     *
     * Parameters:
     * doa - {<Geoportal.OLS.UOM.Distance>|<Geoportal.OLS.UOM.Angle>}
     */
    setAccuracy: function(doa) {
        if (this._doa) {
            this._doa.destroy();
            this._doa= null;
        }
        this._doa= doa;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.HorizontalAcc"*
     */
    CLASS_NAME:"Geoportal.OLS.HorizontalAcc"
});
