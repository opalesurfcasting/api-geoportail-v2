/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @ requires OpenLayers.Format.GML.v3
 */
/**
 * Class: OpenLayers.Format.GML.v3_2_1
 * Parses GML version 3.2.1.
 *
 * Inherits from:
 *  - <OpenLayers.Format.GML.v3 at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/GML/v3-js.html>
 */
OpenLayers.Format.GML.v3_2_1 = OpenLayers.Class(OpenLayers.Format.GML.v3, {

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        gml: "http://www.opengis.net/gml/3.2",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        wfs: "http://www.opengis.net/wfs/2.0" // this is a convenience for reading wfs:FeatureCollection
    },
    
    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.  The writers
     *     conform with the Simple Features Profile for GML.
     */
    schemaLocation: "http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd",

    /**
     * Constructor: OpenLayers.Format.GML.v3_2_1
     * Create a parser for GML v3_2_1.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     *
     * Valid options properties:
     * featureType - {String} Local (without prefix) feature typeName (required).
     * featureNS - {String} Feature namespace (required).
     * geometryName - {String} Geometry element name.
     */
    initialize: function(options) {
        OpenLayers.Format.GML.Base.prototype.initialize.apply(this, [options]);
    },

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "gml": OpenLayers.Util.applyDefaults({
            "FeatureCollection": function(node, obj) { 
                obj.features = []; 
                this.readChildNodes(node, obj); 
            }
        }, OpenLayers.Format.GML.v3.prototype.readers["gml"]),            
        "feature": OpenLayers.Format.GML.v3.prototype.readers["feature"],
        "wfs": OpenLayers.Format.GML.v3.prototype.readers["wfs"]
    },

    /**
     * Constant: OpenLayers.Format.GML.v3_2_1
     * {String} *"OpenLayers.Format.GML.v3_2_1"*
     */
    CLASS_NAME: "OpenLayers.Format.GML.v3_2_1" 
});
