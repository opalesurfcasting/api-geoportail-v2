/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractLocation.js
 */
/**
 * Class: Geoportal.OLS.AbstractAddress
 * The Geoportal framework Open Location Service support abstract address class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractLocation>
 */
Geoportal.OLS.AbstractAddress=
    OpenLayers.Class(Geoportal.OLS.AbstractLocation, {

    /**
     * APIProperty: addressee
     * {String} The addressee.
     */
    addressee: null,

    /**
     * APIProperty: countryCode
     * {String} ISO 3166 Alpha-2 Country Codes.
     *      Defaults to *__*
     */
    countryCode: '__',

    /**
     * APIProperty: language
     * {String} The language of the address to be specified. For example, in Canada, 
     * this can be used to specify "FR" (French) as the language. By supporting both 
     * country code and language, we allow the "locale" of the address to be fully 
     * specified, which assists in parsing of freeform addresses. 
     * ISO 639 2-Letter code is expected here.
     */
    language: null,

    /**
     * Constructor: Geoportal.OLS.AbstractAddress
     *
     * Parameters:
     * countryCode - {String} ISO 3166 Alpha-2 Country Codes.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(countryCode,options) {
        this.addressee= null;
        this.language= null;
        Geoportal.OLS.AbstractLocation.prototype.initialize.apply(this,
            [OpenLayers.Util.extend(options,{'countryCode':countryCode})]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.addressee= null;
        this.countryCode= null;
        this.language= null;
        Geoportal.OLS.AbstractLocation.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this abstract address.
     *
     * Returns:
     * {<Geoportal.OLS.AbstractAddress>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.AbstractAddress(this.countryCode);
        obj.addressee= this.addressee;
        obj.language = this.language;
        return obj;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.AbstractAddress"*
     */
    CLASS_NAME:"Geoportal.OLS.AbstractAddress"
});
