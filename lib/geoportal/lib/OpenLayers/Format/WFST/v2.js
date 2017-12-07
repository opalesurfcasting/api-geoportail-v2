/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires OpenLayers/Format/Filter/v2_0_0.js
 * @ requires OpenLayers/Format/WFST/v1_1_0.js
 */
/**
 * Class: OpenLayers.Format.WFST.v2
 * A format for creating WFS v2.0.0 transactions.  Create a new instance with the
 *     <OpenLayers.Format.WFST.v2_0_0> constructor.
 *
 * Differences between 2.0.0 and 1.1.0:
 *     - 2.0.0 namespaces for Filter Encoding Standard 2.0 and GML 3.2.1
 *     - wfs:member node
 *     - fes:Filter instead ogc:Filter
 *
 * Inherits from:
 *  - <OpenLayers.Format.WFST.v1_1_0 at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/WFST/v1_1_0.js.html>
 */
OpenLayers.Format.WFST.v2 = OpenLayers.Class(
    OpenLayers.Format.WFST.v1_1_0, {
    
    /**
     * Property: version
     * {String} WFS version number.
     */
    version: "2.0.0",
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        wfs: "http://www.opengis.net/wfs/2.0",
        gml: "http://www.opengis.net/gml/3.2",
        ogc: "http://www.opengis.net/ogc",
        ows: "http://www.opengis.net/ows",
        fes: "http://www.opengis.net/fes/2.0"
    },
    
    /**
     * Property: schemaLocations
     * {Object} Properties are namespace aliases, values are schema locations.
     */
    schemaLocations: {
        "wfs": "http://schemas.opengis.net/wfs/2.0.0/wfs.xsd"
    },

    /**
     * Property: filter
     * {Object} Format filter that will be used (v2.0.0)
     */
    filter: null,
    
    /**
     * Constructor: OpenLayers.Format.WFST.v2
     * Instances of this class are not created directly.  Use the
     *     <OpenLayers.Format.WFST.v2_0_0> constructor instead.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     */
    initialize: function(options) {
        OpenLayers.Format.WFST.v1_1_0.prototype.initialize.apply(this, [options]);
        this.filter = new OpenLayers.Format.Filter.v2_0_0(options);
    },
    
    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     * first - {Boolean} Should be set to true for the first node read. This
     *     is usually the readNode call in the read method. Without this being
     *     set, auto-configured properties will stick on subsequent reads.
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was provided).
     */
    readNode: function(node, obj, first) {
        // featureType auto-configuration
        if (!this.featureNS && (!(node.prefix in this.namespaces) &&
                node.parentNode.namespaceURI == this.namespaces["wfs"] &&
                (/^(.*:)?member?$/).test(node.parentNode.nodeName))) {
            this.featureType = node.nodeName.split(":").pop();
            this.setNamespace("feature", node.namespaceURI);
            this.featureNS = node.namespaceURI;
            this.autoConfig = true;
        }
        // Not the superclass, only the mixin classes inherit from
        // Format.GML.v3. We need this because we don't want to get readNode
        // from the superclass's superclass, which is OpenLayers.Format.XML.
        return OpenLayers.Format.GML.v3_2_1.prototype.readNode.apply(this, [node, obj]);
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
        "wfs": OpenLayers.Util.applyDefaults({
            "member": function(node, obj) {
                this.readChildNodes(node, obj);
            }
        }, OpenLayers.Format.WFST.v1_1_0.prototype.readers["wfs"]),
        "gml": OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"],
        "feature": OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"],
        "ogc": OpenLayers.Format.Filter.v2_0_0.prototype.readers["ogc"],
        "ows": OpenLayers.Format.OWSCommon.v1_0_0.prototype.readers["ows"]
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "wfs": OpenLayers.Util.applyDefaults({
            "Query": function(options) {
                options = OpenLayers.Util.extend({
                    featureNS: this.featureNS,
                    featurePrefix: this.featurePrefix,
                    featureType: this.featureType,
                    srsName: this.srsName
                }, options);
                var prefix = options.featurePrefix;
                var node = this.createElementNSPlus("wfs:Query", {
                    attributes: {
                        typeNames: (prefix ? prefix + ":" : "") +
                            options.featureType,
                        srsName: options.srsName
                    }
                });
                if(options.featureNS) {
                    node.setAttribute("xmlns:" + prefix, options.featureNS);
                }
                if(options.propertyNames) {
                    for(var i=0,len = options.propertyNames.length; i<len; i++) {
                        this.writeNode(
                            "wfs:PropertyName", 
                            {property: options.propertyNames[i]},
                            node
                        );
                    }
                }
                if(options.filter) {
                    this.setFilterProperty(options.filter);
                    this.filter.writeNode("fes:Filter", options.filter, node);
                }
                return node;
            }
        }, OpenLayers.Format.WFST.v1_1_0.prototype.writers["wfs"]),
        "gml": OpenLayers.Format.GML.v3_2_1.prototype.writers["gml"],
        "feature": OpenLayers.Format.GML.v3_2_1.prototype.writers["feature"],
        "ogc": OpenLayers.Format.Filter.v2_0_0.prototype.writers["ogc"],
        "fes": OpenLayers.Format.Filter.v2_0_0.prototype.writers["fes"]
    },

    /**
     * Constant: OpenLayers.Format.WFST.v2
     * {String} *"OpenLayers.Format.WFST.v2"*
     */
    CLASS_NAME: "OpenLayers.Format.WFST.v2" 
});
