/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires OpenLayers/Format/Filter/v2.js
 */
/**
 * Class: OpenLayers.Format.Filter.v2_0_0
 * Write fes:Filter version 2.0.0.
 *
 * Differences from the v1.0.0 parser:
 *  - uses GML v3 instead of GML v2
 *  - reads matchCase attribute on ogc:PropertyIsEqual and
 *        ogc:PropertyIsNotEqual elements.
 *  - writes matchCase attribute from comparison filters of type EQUAL_TO,
 *        NOT_EQUAL_TO and LIKE.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.Filter.v2>
 */
OpenLayers.Format.Filter.v2_0_0 = OpenLayers.Class( OpenLayers.Format.Filter.v2, {

    /**
     * Constant: VERSION
     * {String} 2.0.0
     */
    VERSION: "2.0.0",

    /**
     * Constant: OpenLayers.Format.Filter.v2_0_0
     * {String} *"OpenLayers.Format.Filter.v2_0_0"*
     */
    CLASS_NAME: "OpenLayers.Format.Filter.v2_0_0" 

});
