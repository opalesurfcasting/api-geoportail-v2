/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/Error.js
 */
/**
 * Class: Geoportal.OLS.ErrorList
 * The Geoportal framework Open Location Service support error list class.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.ErrorList=
    OpenLayers.Class( Geoportal.OLS, {

    /**
     * APIProperty: highestSeverity
     * {String} Set to the highest severity of any of the Error elements.
     * Specifically, if any of the Error elements have a severity of Error
     * then highestSeverity must be set to Error, otherwise set highestSeverity
     * to Warning.
     *      Defaults to *"Warning"*
     */
    highestSeverity: "Warning",

    /**
     * APIProperty: errors
     * {Array(<Geoportal.OLS.Error>)} List of errors.
     */
    errors: null,

    /**
     * Constructor: Geoportal.OLS.ErrorList
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.highestSeverity= "Warning";
        this.errors= [];
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.highestSeverity= null;
        if (this.errors) {
            for (var i= 0, len= this.errors.length; i<len; i++) {
                this.errors[i].destroy();
                this.errors[i]= null;
            }
            this.errors= null;
        }
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: addError
     * Add an error.
     *
     * Parameters:
     * error - {<Geoportal.OLS.Error>} an error.
     */
    addError: function(error) {
        if (!this.errors) {
            this.errors= [];
        }
        if (error) {
            this.errors.push(error);
        }
    },

    /**
     * APIMethod: getNbErrors
     * Return the number of errors.
     *
     * Returns:
     * {Integer}
     */
    getNbErrors: function() {
        return this.errors? this.errors.length : 0;
    },

    /**
     * APIMethod: getErrors
     * Return all errors.
     *
     * Returns:
     * {Array({<Geoportal.OLS.Error>})} or null
     */
    getErrors: function() {
        return this.errors? this.errors : null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.ErrorList"*
     */
    CLASS_NAME:"Geoportal.OLS.ErrorList"
});
