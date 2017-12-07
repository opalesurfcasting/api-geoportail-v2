/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 */
/**
 * Class: Geoportal.OLS.Street
 * The Geoportal framework Open Location Service support Street class.
 *      The data elements that make up the name of a street. There are two
 *      valid methods for encoding this information:
 *          1). Use the structured elements and attributes.
 *          2). The element value may contain a simplified string (e.g. 43 West 83rd. Street).
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.Street=
    OpenLayers.Class(Geoportal.OLS, {

    /**
     * APIProperty: directionalPrefix
     * {String} The direction for a street (e.g., North), placed before the
     * official name.
     */
    directionalPrefix: null,

    /**
     * APIProperty: typePrefix
     * {String} The street type (e.g., Rd or Ave) specified before the
     * official name.
     */
    typePrefix: null,

    /**
     * APIProperty: officialName
     * {String} The name for a street (e.g., Main).
     */
    officialName: null,

    /**
     * APIProperty: typeSuffix
     * {String} The street type (e.g., Rd or Ave) specified after the official
     * name.
     */
    typeSuffix: null,

    /**
     * APIProperty: directionalSuffix
     * {String} The direction for a street (e.g., North), placed after the
     * official name.
     */
    directionalSuffix: null,

    /**
     * APIProperty: muniOctant
     * {String} One of "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S",
     * "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW".
     */
    muniOctant: null,

    /**
     * APIProperty: name
     * {String}
     */
    name: null,

    /**
     * Constructor: Geoportal.OLS.Street
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.directionalPrefix= null;
        this.typePrefix= null;
        this.officialName= null;
        this.typeSuffix= null;
        this.directionalSuffix= null;
        this.muniOctant= null;
        this.name= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.directionalPrefix= null;
        this.typePrefix= null;
        this.officialName= null;
        this.typeSuffix= null;
        this.directionalSuffix= null;
        this.muniOctant= null;
        this.name= null;
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this street address.
     *
     * Returns:
     * {<Geoportal.OLS.Street>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.Street();
        obj.directionalPrefix= this.directionalPrefix;
        obj.typePrefix= this.typePrefix;
        obj.officialName= this.officialName;
        obj.typeSuffix= this.typeSuffix;
        obj.directionalSuffix= this.directionalSuffix;
        obj.muniOctant= this.muniOctant;
        obj.name= this.name;
        return obj;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.Street"*
     */
    CLASS_NAME:"Geoportal.OLS.Street"
});
