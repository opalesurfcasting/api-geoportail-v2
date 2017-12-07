/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 */
/**
 * Class: Geoportal.OLS.Place
 * The Geoportal framework Open Location Service support Place class.
 *      Place represents a hierarchical set of geographic regions/placenames:
 *      country subdivision, country secondary subdivision, municipality, and
 *      municipality subdivision.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.Place=
    OpenLayers.Class(Geoportal.OLS, {

    /**
     * APIProperty: classification
     * {String} The classification for the hierarchy a level of which is
     * defined to be one of five different types: CountrySubDivision,
     * CountrySecondarySubdivision, Municipality, MunicipalitySubdivision 
     * or choume-banchi-go.
     */
    classification: null,

    /**
     * APIProperty: name
     * {String} Defines a named place.
     */
    name: null,

    /**
     * Constructor: Geoportal.OLS.Place
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.classification= null;
        this.name= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.classification= null;
        this.name= null;
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this place.
     *
     * Returns:
     * {<Geoportal.OLS.Place>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.Place();
        obj.classification= this.classification;
        obj.name= this.name;
        return obj;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.Place"*
     */
    CLASS_NAME:"Geoportal.OLS.Place"
});
