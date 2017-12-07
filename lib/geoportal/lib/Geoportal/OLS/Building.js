/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractStreetLocator.js
 */
/**
 * Class: Geoportal.OLS.Building
 * The Geoportal framework Open Location Service support Building class.
 *      An addressable place; normally a location on a street: number,
 *      subdivision name and/or building name.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractStreetLocator>
 */
Geoportal.OLS.Building=
    OpenLayers.Class(Geoportal.OLS.AbstractStreetLocator, {

    /**
     * APIProperty: num
     * {String}
     */
    num: null,

    /**
     * APIProperty: subdivision
     * {String}
     */
    subdivision: null,

    /**
     * APIProperty: name
     * {String}
     */
    name: null,

    /**
     * Constructor: Geoportal.OLS.Building
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.num= null;
        this.subdivision= null;
        this.name= null;
        Geoportal.OLS.AbstractStreetLocator.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.num= null;
        this.subdivision= null;
        this.name= null;
        Geoportal.OLS.AbstractStreetLocator.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this building address.
     *
     * Returns:
     * {<Geoportal.OLS.Building>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.Building();
        obj.num= this.num;
        obj.subdivision= this.subdivision;
        obj.name= this.name;
        return obj;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.Building"*
     */
    CLASS_NAME:"Geoportal.OLS.Building"
});
