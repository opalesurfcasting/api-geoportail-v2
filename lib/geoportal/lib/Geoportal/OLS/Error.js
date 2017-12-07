/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 */
/**
 * Class: Geoportal.OLS.Error
 * The Geoportal framework Open Location Service support error class.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.Error=
    OpenLayers.Class( Geoportal.OLS, {

    /**
     * APIProperty: errorCode
     * {String} XML qualified name identifying the error. The well-known error
     * codes within the "http://www.opengis.org/xls" namespace are enumerated
     * in the type ErrorCodeEnum.
     *      One of "RequestVersionMismatch", "ResponseVersionMismatch",
     *      "ValueNotRecognized", "NotSupported", "Inconsistent", "OtherXml",
     *      "DeliveryFailure", "SecurityFailure", "Unknown".
     *      New Added Error codes for OpenLS 1.2 : "NoResultsReturned", "TimedOut",
     *      "InternalServerError", "DataNotAvailable".
     */
    errorCode: null,

    /**
     * APIProperty: severity
     * {String} Indicates the severity of the error.
     *      Defaults to *"Warning"*
     *      One of "Warning", "Error", "Info/Status".
     */
    severity: null,

    /**
     * APIProperty: locationID
     * {String} The ID of the element associated with the error.
     */
    locationID: null,

    /**
     * APIProperty: locationPath
     * {String} If the XML is well formed, then this attribute contains the
     * path to the XML element or attribute associated with the error.
     */
    locationPath: null,

    /**
     * APIProperty: message
     * {String} Provides a human readable explanation of the error, which is
     * not intended for algorithmic processing.
     */
    message: null,

    /**
     * Constructor: Geoportal.OLS.Error
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.errorCode= null;
        this.severity= "Warning";
        this.locationID= null;
        this.locationPath= null;
        this.message= null;
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.errorCode= null;
        this.severity= null;
        this.locationID= null;
        this.locationPath= null;
        this.message= null;
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.Error"*
     */
    CLASS_NAME:"Geoportal.OLS.Error"
});
