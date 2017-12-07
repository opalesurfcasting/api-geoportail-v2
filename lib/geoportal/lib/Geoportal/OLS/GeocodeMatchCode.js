/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 */
/**
 * Class: Geoportal.OLS.GeocodeMatchCode
 * The Geoportal framework Open Location Service support quantity match
 * operation class.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.GeocodeMatchCode= OpenLayers.Class(
    Geoportal.OLS, {

    /**
     * APIProperty: accuracy
     * {Number} This is the score (probability) associated with the match
     * function.
     */
    accuracy: null,

    /**
     * APIProperty: matchType
     * {String} Describes the type of match made by the function, example
     * zip+4.
     */
    matchType: null,
 
    /**
     * Constructor: Geoportal.OLS.GeocodeMatchCode
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.accuracy= null;
        this.matchType= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.accuracy= null;
        this.matchType= null;
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this address.
     *
     * Returns:
     * {<Geoportal.OLS.Address>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.GeocodeMatchCode(
            {
                accuracy: this.accuracy,
                matchType: this.matchType
            }
        );
        return obj;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.GeocodeMatchCode"*
     */
    CLASS_NAME:"Geoportal.OLS.GeocodeMatchCode"
});
