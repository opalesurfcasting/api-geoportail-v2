/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractBody.js
 * @requires Geoportal/OLS/ErrorList.js
 * @requires Geoportal/OLS/AbstractRequestParameters.js
 */
/**
 * Class: Geoportal.OLS.Request
 * The Geoportal framework Open Location Service support request base class.
 *      Defines the response information returned from a service response.
 *
 * Inherits from:
 *   - <Geoportal.OLS.AbstractBody>
 */
Geoportal.OLS.Request=
    OpenLayers.Class(Geoportal.OLS.AbstractBody, {

    /**
     * APIProperty: methodName
     * {String} The name of the method to be invoked by the service.
     */
    methodName: null,

    /**
     * APIProperty: version
     * {String} The version level of the request parameters supported by the
     * client.
     */
    version: null,

    /**
     * APIProperty: requestID
     * {String} A client-defined request identifier, unique within the scope
     * of the session.  The request identifier must be returned in the service
     * response.
     */
    requestID: null,

    /**
     * APIProperty: maximumResponses
     * {Integer} Allow the request to control the number of responses
     * generated. For example the POI request will use this as a contraint to
     * generate a certain number of POIs. In the special cases where one of
     * the responses can contain multiple values this will be controlled
     * within the request itself, in those cases this parameter will not be
     * applicable.
     */
    maximumResponses: null,

    /**
     * APIProperty: _requestParameters
     * {<Geoportal.OLS.AbstractRequestParameters>} Base element representing
     * the response information returned from a service request.
     */
    _requestParameters: null,

    /**
     * Constructor: Geoportal.OLS.Request
     *
     * Parameters:
     * methodName - {String} name of the method.
     * version - {String} version of the parameters.
     * requestID - {String} client-defined request identifier.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(methodName, version, requestID, options) {
        this.methodName= methodName;
        this.version= version;
        this.requestID= requestID;
        this.maximumResponses= null;
        this._requestParameters= null;
        Geoportal.OLS.prototype.initialize.apply(this,[options]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.methodName= null;
        this.version= null;
        this.requestID= null;
        this.maximumResponses= null;
        if (this._requestParameters) {
            this._requestParameters.destroy();
            this._requestParameters= null;
        }
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: getRequestParameters
     * Return the request content.
     *
     * Returns:
     * {<Geoportal.OLS.AbstractRequestParameters>} or null.
     */
    getRequestParameters: function() {
        return this._requestParameters? this._requestParameters : null;
    },

    /**
     * APIMethod: setRequestParameters
     * Assign the request content.
     *
     * Parameters:
     * rp - {<Geoportal.OLS.AbstractRequestParameters>}
     */
    setRequestParameters: function(rp) {
        this._requestParameters= rp;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.Request"*
     */
    CLASS_NAME:"Geoportal.OLS.Request"
});
