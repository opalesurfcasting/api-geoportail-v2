/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/XLS/v1_0.js
 * @requires Geoportal/Format/XLS/v1_1/LocationUtilityService.js
 */
/**
 * Class: Geoportal.Format.XLS.v1_0.LocationUtilityService
 * The Geoportal LocationUtilityService request/response format class.
 *      Superclass for XLS version 1.0.0 parsers.
 *
 * Inherits from:
 *  - <Geoportal.Format.XLS.v1_1.LocationUtilityService>
 */
Geoportal.Format.XLS.v1_0.LocationUtilityService=
    OpenLayers.Class( Geoportal.Format.XLS.v1_1.LocationUtilityService, {

    /**
     * Constructor: Geoportal.Format.XLS.v1_0.LocationUtilityService
     * Instances of this class are not created directly.  Use the
     *      <Geoportal.Format.XLS> constructor instead.
     *
     * (code start)
     * var f= new Geoportal.Format.XLS({version: "1.0", coreService: "LocationUtilityService"});
     * (end)
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance. The most relevant options for this class are :
     *     * version : should be set to "1.0";
     *     * coreService : should be set to "LocationUtilityService".
     */
    initialize: function(options) {
        Geoportal.Format.XLS.v1_0.prototype.initialize.apply(this, [options]);
        this._addReaders();
        this._addWriters();
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.XLS.v1_0.LocationUtilityService"*
     */
    CLASS_NAME:"Geoportal.Format.XLS.v1_0.LocationUtilityService"
});
