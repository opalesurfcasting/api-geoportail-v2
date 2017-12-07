/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format.js
 */
/**
 * Class: Geoportal.Format.WMC
 * Read/write WMC parser. Create a new instance with the
 *     <Geoportal.Format.WMC> constructor.
 *     See <http://www.opengeospatial.org/standards/wmc>
 *
 * Inherits from:
 *  - <Geoportal.Format>
 *  - <OpenLayers.Format.Context at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/Context-js.html>
 *  - <OpenLayers.Format.WMC at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/WMC-js.html>
 */
Geoportal.Format.WMC = OpenLayers.Class(Geoportal.Format, OpenLayers.Format.WMC, {

   /**
     * APIProperty: defaultVersion
     * {String} Version number to assume if none found.  Default is "1.0.0".
     */
    defaultVersion: "1.0.0",

    /**
     * Constructor: Geoportal.Format.WMC
     * Create a new parser for Geoportal Web Map Context document.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     *
     */
    initialize: function(options) {
        options= options || {};
        OpenLayers.Format.WMC.prototype.initialize.apply(this, [options]);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.WMC"*
     */
    CLASS_NAME: "Geoportal.Format.WMC"
});
