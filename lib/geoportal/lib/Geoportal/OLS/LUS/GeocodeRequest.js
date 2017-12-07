/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractRequestParameters.js
 * @requires Geoportal/OLS/LUS.js
 * @requires Geoportal/OLS/Address.js
 */
/**
 * Class: Geoportal.OLS.LUS.GeocodeRequest
 * The Geoportal framework Open Location Service Location Utility support Geocode Request class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractRequestParameters>
 *  - <Geoportal.OLS.LUS>
 */
Geoportal.OLS.LUS.GeocodeRequest=
    OpenLayers.Class( Geoportal.OLS.LUS, Geoportal.OLS.AbstractRequestParameters, {

    /**
     * APIProperty: addresses
     * {Array(<Geoportal.OLS.Address>)} the addresses to find.
     */
    addresses: null,

    /**
     * APIProperty: returnFreeForm
     * {Boolean} Used to request freeform addresses in the response, as opposed to
     * structured addresses. Defaults to false.
     */
    returnFreeForm: false,

    /**
     * Constructor: Geoportal.OLS.LUS.GeocodeRequest
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.addresses= [];
        Geoportal.OLS.AbstractRequestParameters.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        if (this.addresses) {
            for (var i= 0, len= this.addresses.length; i<len; i++) {
                this.addresses[i].destroy();
                this.addresses[i]= null;
            }
            this.addresses= null;
        }
        Geoportal.OLS.AbstractRequestParameters.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: addAddress
     * Add an address.
     *
     * Parameters:
     * street - {<Geoportal.OLS.Address>} an address.
     */
    addAddress: function(address) {
        if (!this.addresses) {
            this.addresses= [];
        }
        if (address) {
            this.addresses.push(address);
        }
    },

    /**
     * APIMethod: getNbAddresses
     * Return the number of addresses.
     *
     * Returns:
     * {Integer}
     */
    getNbAddresses: function() {
        return this.addresses? this.addresses.length : 0;
    },

    /**
     * APIMethod: getAddresses
     * Return all addresses.
     *
     * Returns:
     * {Array({<Geoportal.OLS.Address>})} or null
     */
    getAddresses: function() {
        return this.addresses? this.addresses : null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.LUS.GeocodeRequest"*
     */
    CLASS_NAME:"Geoportal.OLS.LUS.GeocodeRequest"
});
