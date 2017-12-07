/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 */
/**
 * Class: Geoportal.OLS.PostalCode
 * The Geoportal framework Open Location Service support postal code class.
 *      A zipcode or international postal code as defined by the governing
 *      postal authority.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.PostalCode=
    OpenLayers.Class(Geoportal.OLS, {

    /**
     * APIProperty: name
     * {String} A postal code vary greatly throughout the world.
     */
    name: null,

    /**
     * Constructor: Geoportal.OLS.PostalCode
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.name= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.name= null;
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this postal code.
     *
     * Returns:
     * {<Geoportal.OLS.PostalCode>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.PostalCode();
        obj.name= this.name;
        return obj;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.PostalCode"*
     */
    CLASS_NAME:"Geoportal.OLS.PostalCode"
});
