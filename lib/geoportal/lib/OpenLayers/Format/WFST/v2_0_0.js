/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires OpenLayers/Format/WFST/v2.js
 */
/**
 * Class: OpenLayers.Format.WFST.v2_0_0
 * A format for creating WFS v2.0.0 transactions.  Create a new instance with the
 *     <OpenLayers.Format.WFST.v2_0_0> constructor.
 *
 * Differences between 2.0.0 and 1.1.0:
 *     - 2.0.0 namespaces for Filter Encoding Standard 2.0 and GML 3.2.1
 *     - wfs:member node
 *     - fes:Filter instead ogc:Filter
 *
 * Inherits from:
 *  - <OpenLayers.Format.WFST.v2>
 */
OpenLayers.Format.WFST.v2_0_0 = OpenLayers.Class(
    OpenLayers.Format.WFST.v2, {
    
    /**
     * Property: version
     * {String} WFS version number.
     */
    version: "2.0.0",

    /**
     * Constructor: OpenLayers.Format.WFST.v2_0_0
     * A class for parsing and generating WFS v2.0.0 transactions.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options properties:
     * featureType - {String} Local (without prefix) feature typeName (required).
     * featureNS - {String} Feature namespace (optional).
     * featurePrefix - {String} Feature namespace alias (optional - only used
     *     if featureNS is provided).  Default is 'feature'.
     * geometryName - {String} Name of geometry attribute.  Default is 'the_geom'.
     */
    initialize: function(options) {
        OpenLayers.Format.WFST.v2.prototype.initialize.apply(this, [options]);
    },

    /**
     * Constant: OpenLayers.Format.WFST.v2_0_0
     * {String} *"OpenLayers.Format.WFST.v2_0_0"*
     */
    CLASS_NAME: "OpenLayers.Format.WFST.v2_0_0" 
});
