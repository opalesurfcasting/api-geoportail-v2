/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 * @requires Geoportal/OLS/AbstractStreetLocator.js
 * @requires Geoportal/OLS/Street.js
 */
/**
 * Class: Geoportal.OLS.StreetAddress
 * The Geoportal framework Open Location Service support StreetAddress class.
 *      A set of precise and complete data elements that cannot be subdivided
 *      and that describe the physical location of a place.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.StreetAddress=
    OpenLayers.Class(Geoportal.OLS, {

    /**
     * APIProperty: _streetLocation
     * {<Geoportal.OLS.AbstractStreetLocator>} The location on a street.
     */
    _streetLocation: null,

    /**
     * APIProperty: streets
     * {Array(<Geoportal.OLS.Street>)} Structured Street Name.
     */
    streets: null,

    /**
     * APIProperty: locator
     * {String} typically used for the street number (e.g. 23) .
     * accommodate a number, or any other building locator. 
     * "windmill house", "24E" and "323" are acceptable uses of the locator.
     * will adopt the following conventions for representing address ranges 
     * in the locator attribute:
     * range example: "1-9" means 1,3,5,7,9.
     * discontinous ranges: "1-9,2-10" implies 1,3,5,7,9 on one side of block and 2,4,6,8,10 on other side of block.
     * range: "1...10" means 1,2,3,4,5,6,7,8,9,10
     */
    locator: null,

    /**
     * Constructor: Geoportal.OLS.StreetAddress
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this._streetLocation= null;
        this.streets= [];
        this.locator= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        if (this._streetLocation) {
            this._streetLocation.destroy();
            this._streetLocation= null;
        }
        if (this.streets) {
            for (var i= 0, len= this.streets.length; i<len; i++) {
                this.streets[i].destroy();
                this.streets[i]= null;
            }
            this.streets= null;
        }
        this.locator= null;
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this address.
     *
     * Returns:
     * {<Geoportal.OLS.StreetAddress>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.StreetAddress();
        if (this._streetLocation) {
            obj._streetLocation= this._streetLocation.clone();
        }
        if (this.streets) {
            for (var i= 0, len= this.streets.length; i<len; i++) {
                obj.streets.push(this.streets[i].clone());
            }
        }
        obj.locator = this.locator;
        return obj;
    },

    /**
     * APIMethod: setStreetLocation
     * Assigns a street location.
     *
     * Parameters:
     * street - {<Geoportal.OLS.AbstractStreetLocator>} a location.
     */
    setStreetLocation: function(street) {
        if (this._streetLocation) {
            this._streetLocation.destroy();
            this._streetLocation= null;
        }
        this._streetLocation= street;
    },

    /**
     * APIMethod: addStreet
     * Add a street.
     *
     * Parameters:
     * street - {<Geoportal.OLS.Street>} a street.
     */
    addStreet: function(street) {
        if (!this.streets) {
            this.streets= [];
        }
        if (street) {
            this.streets.push(street);
        }
    },

    /**
     * APIMethod: getNbStreets
     * Return the number of streets.
     *
     * Returns:
     * {Integer}
     */
    getNbStreets: function() {
        return this.streets? this.streets.length : 0;
    },

    /**
     * APIMethod: getStreets
     * Return all streets.
     *
     * Returns:
     * {Array({<Geoportal.OLS.Street>})} or null
     */
    getStreets: function() {
        return this.streets? this.streets : null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.StreetAddress"*
     */
    CLASS_NAME:"Geoportal.OLS.StreetAddress"
});
