/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires OpenLayers/Format/GML/v3_2_1.js
 */
/**
 * Class: OpenLayers.Format.Filter.v2
 * Write fes:Filter version 2.0
 *
 * Differences from the v1.0.0 parser:
 *  - uses GML v3 instead of GML v2
 *  - reads matchCase attribute on ogc:PropertyIsEqual and
 *        ogc:PropertyIsNotEqual elements.
 *  - writes matchCase attribute from comparison filters of type EQUAL_TO,
 *        NOT_EQUAL_TO and LIKE.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.GML.v3_2_1>
 *  - <OpenLayers.Format.Filter.v1 at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/Filter/v1-js.html>
 */
OpenLayers.Format.Filter.v2 = OpenLayers.Class(
    OpenLayers.Format.GML.v3_2_1, OpenLayers.Format.Filter.v1, {

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "fes",

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        gml: "http://www.opengis.net/gml/3.2",
        ogc: "http://www.opengis.net/ogc",
        fes: "http://www.opengis.net/fes/2.0"
    },
    
    /**
     * Property: schemaLocation
     * {String} http://schemas.opengis.net/filter/2.0/filter.xsd
     */
    schemaLocation: "http://schemas.opengis.net/filter/2.0/filter.xsd",

    /**
     * Constructor: OpenLayers.Format.Filter.v2_0_0
     * Instances of this class are not created directly.  Use the
     *     <OpenLayers.Format.Filter at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/Filter-js.html> constructor instead.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.GML.v3_2_1.prototype.initialize.apply(
            this, [options]
        );
    },
    
    /**
     * Method: read
     *
     * Parameters:
     * data - {DOMElement} A Filter document element.
     *
     * Returns:
     * {<OpenLayers.Filter at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Filter-js.html>} A filter object.
     */
    read: function(data) {
        var obj = {};
        this.readers.fes["Filter"].apply(this, [data, obj]);
        return obj.filter;
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
        "fes": OpenLayers.Util.applyDefaults({
            "PropertyIsEqualTo": function(node, obj) {
                var matchCase = node.getAttribute("matchCase");
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    matchCase: !(matchCase === "false" || matchCase === "0")
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "PropertyIsNotEqualTo": function(node, obj) {
                var matchCase = node.getAttribute("matchCase");
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                    matchCase: !(matchCase === "false" || matchCase === "0")
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "PropertyIsLike": function(node, obj) {
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.LIKE
                });
                this.readChildNodes(node, filter);
                var wildCard = node.getAttribute("wildCard");
                var singleChar = node.getAttribute("singleChar");
                var esc = node.getAttribute("escapeChar");
                filter.value2regex(wildCard, singleChar, esc);
                obj.filters.push(filter);
            },
            "ValueReference": function(node, filter) {
                filter.property = this.getChildValue(node);
            }
        }, OpenLayers.Format.Filter.v1.prototype.readers["ogc"]),
        "gml": OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"],
        "feature": OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]        
    },
    
    /**
     * Method: write
     *
     * Parameters:
     * filter - {<OpenLayers.Filter at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Filter-js.html>} A filter object.
     *
     * Returns:
     * {DOMElement} An fes:Filter element.
     */
    write: function(filter) {
        return this.writers.fes["Filter"].apply(this, [filter]);
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "fes": OpenLayers.Util.applyDefaults({
            "Filter": function(filter) {
                var node = this.createElementNSPlus("fes:Filter");
                var sub = filter.CLASS_NAME.split(".").pop();
                if(sub == "FeatureId") {
                    for(var i=0; i<filter.fids.length; ++i) {
                        this.writeNode("FeatureId", filter.fids[i], node);
                    }
                } else {
                    this.writeNode(this.getFilterType(filter), filter, node);
                }
                return node;
            },
            "FeatureId": function(fid) {
                return this.createElementNSPlus("fes:ResourceId", {
                    attributes: {rid: fid}
                });
            },
            "And": function(filter) {
                var node = this.createElementNSPlus("fes:And");
                var childFilter;
                for(var i=0; i<filter.filters.length; ++i) {
                    childFilter = filter.filters[i];
                    this.writeNode(
                        this.getFilterType(childFilter), childFilter, node
                    );
                }
                return node;
            },
            "Or": function(filter) {
                var node = this.createElementNSPlus("fes:Or");
                var childFilter;
                for(var i=0; i<filter.filters.length; ++i) {
                    childFilter = filter.filters[i];
                    this.writeNode(
                        this.getFilterType(childFilter), childFilter, node
                    );
                }
                return node;
            },
            "Not": function(filter) {
                var node = this.createElementNSPlus("fes:Not");
                var childFilter = filter.filters[0];
                this.writeNode(
                    this.getFilterType(childFilter), childFilter, node
                );
                return node;
            },
            "PropertyIsLessThan": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsLessThan");
                this.writeNode("ValueReference", filter, node);
                this.writeNode("Literal", filter.value, node);
                return node;
            },
            "PropertyIsGreaterThan": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsGreaterThan");
                this.writeNode("ValueReference", filter, node);
                this.writeNode("Literal", filter.value, node);
                return node;
            },
            "PropertyIsLessThanOrEqualTo": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsLessThanOrEqualTo");
                this.writeNode("ValueReference", filter, node);
                this.writeNode("Literal", filter.value, node);
                return node;
            },
            "PropertyIsGreaterThanOrEqualTo": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsGreaterThanOrEqualTo");
                this.writeNode("ValueReference", filter, node);
                this.writeNode("Literal", filter.value, node);
                return node;
            },
            "PropertyIsBetween": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsBetween");
                this.writeNode("ValueReference", filter, node);
                this.writeNode("LowerBoundary", filter, node);
                this.writeNode("UpperBoundary", filter, node);
                return node;
            },
            "PropertyIsEqualTo": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsEqualTo", {
                    attributes: {matchCase: filter.matchCase}
                });
                this.writeNode("ValueReference", filter, node);
                this.writeNode("Literal", filter.value, node);
                return node;
            },
            "PropertyIsNotEqualTo": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsNotEqualTo", {
                    attributes: {matchCase: filter.matchCase}
                });
                this.writeNode("ValueReference", filter, node);
                this.writeNode("Literal", filter.value, node);
                return node;
            },
            "PropertyIsLike": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsLike", {
                    attributes: {
                        wildCard: "*", singleChar: ".", escapeChar: "!"
                    }
                });
                this.writeNode("ValueReference", filter, node);
                // convert regex string to ogc string
                this.writeNode("Literal", filter.regex2value(), node);
                return node;
            },
            "BBOX": function(filter) {
                var node = this.createElementNSPlus("fes:BBOX");
                filter.property && this.writeNode("ValueReference", filter, node);
                var box = this.writeNode("gml:Envelope", filter.value);
                if (filter.projection) {
                    box.setAttribute("srsName", filter.projection);
                }
                node.appendChild(box); 
                return node;
            },
            "Literal": function(value) {
                // no ogc:expression handling for now
                return this.createElementNSPlus("fes:Literal", {
                    value: value
                });
            },
            "ValueReference": function(filter) {
                // no ogc:expression handling for now
                return this.createElementNSPlus("fes:ValueReference", {
                    value: filter.property
                });
            },
            "LowerBoundary": function(filter) {
                var node = this.createElementNSPlus("fes:LowerBoundary");
                this.writeNode("Literal", filter.lowerBoundary, node);
                return node;
            },
            "UpperBoundary": function(filter) {
                var node = this.createElementNSPlus("fes:UpperBoundary");
                this.writeNode("Literal", filter.upperBoundary, node);
                return node;
            },
            "WITHIN": function(filter) {
                return this.writeSpatial(filter, "Within");
            },
            "INTERSECTS": function(filter) {
                return this.writeSpatial(filter, "Intersects");
            },
            "CONTAINS": function(filter) {
                return this.writeSpatial(filter, "Contains");
            }
        }, OpenLayers.Format.Filter.v1.prototype.writers["ogc"]),
        "gml": OpenLayers.Format.GML.v3_2_1.prototype.writers["gml"],
        "feature": OpenLayers.Format.GML.v3_2_1.prototype.writers["feature"]
    },

    /**
     * Method: writeSpatial
     *
     * Read a {<OpenLayers.Filter.Spatial at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/Filter/Spatial-js.html>}
     * filter and converts it into XML.
     *
     * Parameters:
     * filter - {<OpenLayers.Filter.Spatial at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/Filter/Spatial-js.html>} The filter.
     * name - {String} Name of the generated XML element.
     *
     * Returns:
     * {DOMElement} The created XML element.
     */
    writeSpatial: function(filter, name) {
        var node = this.createElementNSPlus("fes:"+name);
        this.writeNode("ValueReference", filter, node);
        var child;
        if(filter.value instanceof OpenLayers.Geometry) {
            child = this.writeNode("feature:_geometry", filter.value).firstChild;
        } else {
            child = this.writeNode("gml:Envelope", filter.value);
        }
        if(filter.projection) {
            child.setAttribute("srsName", filter.projection);
        }
        node.appendChild(child);
        return node;
    },

    /**
     * Constant: OpenLayers.Format.Filter.v2
     * {String} *"OpenLayers.Format.Filter.v2"*
     */
    CLASS_NAME: "OpenLayers.Format.Filter.v2" 
});
