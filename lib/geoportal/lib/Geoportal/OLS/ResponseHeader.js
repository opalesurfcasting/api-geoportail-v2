/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractHeader.js
 * @requires Geoportal/OLS/ErrorList.js
 */
/**
 * Class: Geoportal.OLS.ResponseHeader
 * The Geoportal framework Open Location Service support response header class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractHeader>
 */
Geoportal.OLS.ResponseHeader=
    OpenLayers.Class( Geoportal.OLS.AbstractHeader, {

    /**
     * APIProperty: sessionID
     * {String} The session identifier, specified by the client in the request
     * header.
     */
    sessionID: null,

    /**
     * APIProperty: errorList
     * {<Geoportal.OLS.ErrorList>}
     */
    errorList: null,

    /**
     * Constructor: Geoportal.OLS.ResponseHeader
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.sessionID= null;
        this.errorList= null;
        Geoportal.OLS.AbstractHeader.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.sessionID= null;
        if (this.errorList) {
            this.errorList.destroy();
            this.errorList= null;
        }
        Geoportal.OLS.AbstractHeader.prototype.destroy.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.ResponseHeader"*
     */
    CLASS_NAME:"Geoportal.OLS.ResponseHeader"
});
