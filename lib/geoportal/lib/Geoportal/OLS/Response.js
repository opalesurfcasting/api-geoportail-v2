/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractBody.js
 * @requires Geoportal/OLS/ErrorList.js
 * @requires Geoportal/OLS/AbstractResponseParameters.js
 */
/**
 * Class: Geoportal.OLS.Response
 * The Geoportal framework Open Location Service support response base class.
 *      Defines the response information returned from a service response.
 *
 * Inherits from:
 *   - <Geoportal.OLS.AbstractBody>
 */
Geoportal.OLS.Response=
    OpenLayers.Class(Geoportal.OLS.AbstractBody, {

    /**
     * APIProperty: version
     * {String} The version level of the response parameters supported by the
     * service.
     */
    version: null,

    /**
     * APIProperty: requestID
     * {String} The request identifier, unique within the scope of the
     * session, specified by the client in the service request.
     */
    requestID: null,

    /**
     * APIProperty: numberOfResponses
     * {Integer} This is the number of responses that are generated by the
     * request. For example a map request can contain multiple requests for
     * multiple maps, the responses will contain mulitple responses to that.
     * In the case of Geocode, multiple responses will be equal to the number
     * of requests, each response may contain one or more candidate addresses.
     * For the scope of this specification, most of the time the number of
     * responses will be equal to 1.
     */
    numberOfResponses: null,

    /**
     * APIProperty: errorList
     * {<Geoportal.OLS.ErrorList>}
     */
    errorList: null,

    /**
     * APIProperty: _responseParameters
     * {<Geoportal.OLS.AbstractResponseParameters>} Base element representing
     * the response information returned from a service request.
     */
    _responseParameters: null,

    /**
     * Constructor: Geoportal.OLS.AbstractBody.Response
     *
     * Parameters:
     * version - {String} version of the parameters.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(version, options) {
        this.version= version;
        this.requestID= null;
        this.numberOfResponses= null;
        this.errorList= null;
        this._responseParameters= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.version= null;
        this.requestID= null;
        this.numberOfResponses= 1;
        if (this.errorList) {
            this.errorList.destroy();
            this.errorList= null;
        }
        if (this._responseParameters) {
            this._responseParameters.destroy();
            this._responseParameters= null;
        }
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: getResponseParameters
     * Return the response content.
     *
     * Returns:
     * {<Geoportal.OLS.AbstractRequestParameters>} or null.
     */
    getResponseParameters: function() {
        return this._responseParameters? this._responseParameters : null;
    },

    /**
     * APIMethod: setResponseParameters
     * Assign the response content.
     *
     * Parameters:
     * rp - {<Geoportal.OLS.AbstractRequestParameters>}
     */
    setResponseParameters: function(rp) {
        this._responseParameters= rp;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.Response"*
     */
    CLASS_NAME:"Geoportal.OLS.Response"
});