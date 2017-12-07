/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format.js
 */
/**
 * Class: Geoportal.Format.GASR
 * Read Geoportal Altimetric Services XML responses parser : 
 *
 * (start code)
 * <elevations>
 *   <elevation>
 *     <lon>0.717</lon>
 *     <lat>47.8388</lat>
 *     <z>133.19</z>
 *     <acc>2.5</acc>
 *   </elevation>
 *   <elevation>
 *     <lon>3.09</lon>
 *     <lat>49.1205</lat>
 *     <z>90.48</z>
 *     <acc>2.5</acc>
 *   </elevation>
 *   ...
 * </elevations>
 * (end)
 * 
 *
 * Inherits from:
 *  - <Geoportal.Format>
 *  - <OpenLayers.Format.XML at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/XML-js.html>
 */
Geoportal.Format.GASR= OpenLayers.Class(Geoportal.Format, OpenLayers.Format.XML, {

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "alti",

    /**
     * Property: regExes
     * Compiled regular expressions for manipulating strings.
     * FIXME : needed ?
     */
    regExes: {
        trimSpace: (/^\s*|\s*$/g),
        removeSpace: (/\s*/g),
        splitSpace: (/\s+/),
        trimComma: (/\s*,\s*/g)
    },

    /**
     * Constructor: Geoportal.Format.GASR
     * Create a new parser for Geoportal Altimetric Services Response
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
    },

    /**
     * APIMethod: read
     * Returns an array of "elevation" objects with their properties filled :
     *
     * [
     *   {
     *     lon : 0.717,
     *     lat : 47.8388,
     *     z : 133.19,
     *     acc : 2.5
     *   },
     *   {
     *     lon : 1.0071,
     *     lat : 48.0017,
     *     z : 191.21,
     *     acc : 2.5
     *   },
     *   ...
     * ]
     *
     * Parameters:
     * data - {DOMElement | String} data to read/parse.
     *
     * Returns:
     * An Array of "elevation" objects.
     */
    read: function(data) {
        if (typeof(data)=="string") {
            data= OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if (!data) { return []; }
        var root= (data.nodeType == 9 ? data.documentElement : data);
        var result= {
            elevations:[]
        };
        this.readNode(root, result);

        return result.elevations;
    },
    
    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     *
     *     Does not parse these nodes :
     *
     * (code)
     * <xsd:any namespace="##other" minOccurs="0" maxOccurs="unbounded"/>
     * (end)
     */
    readers: {
        "alti": {
            "elevations"   : function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "elevation"    : function(node, obj) {
                var elevation= {} ;
                this.readChildNodes(node, elevation);
                obj.elevations.push(elevation) ;
            },
            "lon"          : function(node, obj) {
                var v= this.getChildValue(node);
                obj.lon= v ;
            },
            "lat"          : function(node, obj) {
                var v= this.getChildValue(node);
                obj.lat= v ;
            },
            "z"          : function(node, obj) {
                var v= this.getChildValue(node);
                obj.z= v ;
            },
            "acc"          : function(node, obj) {
                var v= this.getChildValue(node);
                obj.acc= v ;
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.GASR"*
     */
    CLASS_NAME: "Geoportal.Format.GASR"
});

