/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractHeader.js
 * @requires Geoportal/OLS/ErrorList.js
 */
/**
 * Class: Geoportal.OLS.RequestHeader
 * The Geoportal framework Open Location Service support request header class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractHeader>
 */
Geoportal.OLS.RequestHeader=
    OpenLayers.Class( Geoportal.OLS.AbstractHeader, {

    /**
     * APIProperty: clientName
     * {String} The client name, used for authentication.
     */
    clientName: null,

    /**
     * APIProperty: clientPassword
     * {String} The client password, used for authentication.
     */
    clientPassword: null,

    /**
     * APIProperty: sessionID
     * {String} The session identifier, specified by the client in the request
     * header.
     */
    sessionID: null,

    /**
     * APIProperty: srsName
     * {String} In general this reference points to a CRS instance of
     * gml:CoordinateReferenceSystemType (see coordinateReferenceSystems.xsd).
     * For well known references it is not required that the CRS description
     * exists at the location the URI points to (Note: These "WKCRS"-ids still
     * have to be specified).  If no srsName attribute is given, the CRS must
     * be specified as part of the larger context this geometry element is
     * part of, e.g. a geometric aggregate. Default value is WGS84.
     */
    srsName: null,

    /**
     * APIProperty: MSID
     * {String} A client-defined unique identifier. Can be used for different
     * purposes, for example billing.
     */
    MSID: null,

    /**
     * Constructor: Geoportal.OLS.RequestHeader
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.clientName= null;
        this.clientPassword= null;
        this.sessionID= null;
        this.srsName= null;
        this.MSID= null;
        Geoportal.OLS.AbstractHeader.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.clientName= null;
        this.clientPassword= null;
        this.sessionID= null;
        this.srsName= null;
        this.MSID= null;
        Geoportal.OLS.AbstractHeader.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.RequestHeader"*
     */
    CLASS_NAME:"Geoportal.OLS.RequestHeader"
});
