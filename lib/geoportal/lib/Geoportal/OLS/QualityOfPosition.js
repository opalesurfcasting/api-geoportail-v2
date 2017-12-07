/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 * @requires Geoportal/OLS/HorizontalAcc.js
 * @requires Geoportal/OLS/VerticalAcc.js
 */
/**
 * Class: Geoportal.OLS.QualityOfPosition
 * The Geoportal framework Open Location Service support quality position class.
 */
Geoportal.OLS.QualityOfPosition= OpenLayers.Class({

    /**
     * APIProperty: responseReq
     * {String} One of "No_Delay", "Low_Delay" and "Delay_Tol".
     *      Defaults to *"Delay_Tol"*
     */
    responseReq: null,

    /**
     * APIProperty: responseTimer
     * {String}
     */
    responseTimer: null,

    /**
     * APIProperty: hAccuracy
     * {<Geoportal.OLS.HorizontalAcc>}
     */
    hAccuracy: null,

    /**
     * APIProperty: vAccuracy
     * {<Geoportal.OLS.VerticalAcc>}
     */
    vAccuracy: null,

    /**
     * Constructor: Geoportal.OLS.QualityOfPosition
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.responseReq= null;
        this.responseTimer= null;
        this.hAccuracy= null;
        this.vAccuracy= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.responseReq= null;
        this.responseTimer= null;
        if (this.hAccuracy) {
            this.hAccuracy.destroy();
            this.hAccuracy= null;
        }
        if (this.vAccuracy) {
            this.vAccuracy.destroy();
            this.vAccuracy= null;
        }
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.QualityOfPosition"*
     */
    CLASS_NAME:"Geoportal.OLS.QualityOfPosition"
});
