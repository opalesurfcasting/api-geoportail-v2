/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/XLS/v1_1.js
 */
/**
 * Class: Geoportal.Format.XLS.v1_0
 * The Geoportal framework XML for Location Service support class.
 *      Superclass for XLS version 1.0 parsers.
 *
 * Inherits from:
 *  - <Geoportal.Format.XLS.v1_1>
 */
Geoportal.Format.XLS.v1_0=
    OpenLayers.Class( Geoportal.Format.XLS.v1_1, {

    /**
     * Constant: VERSION
     * {String} *"1.0"*
     */
    VERSION: "1.0",

    /**
     * Constructor: Geoportal.Format.XLS.v1_0
     * Instances of this class are not created directly.  Use the
     *      <Geoportal.Format.XLS> constructor instead.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *      this instance.
     */
    initialize: function(options) {
        Geoportal.Format.XLS.v1_1.prototype.initialize.apply(this, [options]);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.XLS.v1_0"*
     */
    CLASS_NAME:"Geoportal.Format.XLS.v1_0"
});
