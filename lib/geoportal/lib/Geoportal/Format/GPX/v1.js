/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/GPX.js
 */
/**
 * Class: Geoportal.Format.GPX.v1
 * Superclass for GPX version 1 parsers.
 *
 * Inherits from:
 *  - <Geoportal.Format>
 *  - <OpenLayers.Format.XML at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/XML-js.html>
 */
Geoportal.Format.GPX.v1= OpenLayers.Class(Geoportal.Format, OpenLayers.Format.XML, {

    /**
     * APIProperty: creator
     * {String} the GPX data originator.
     */
    creator: null,

    /**
     * APIProperty: extractWaypoints
     * {Boolean} Extract waypoints from GPX.
     *      Default *true*
     */
    extractWaypoints: true,

    /**
     * APIProperty: extractTracks
     * {Boolean} Extract tracks from GPX.
     *      Default *true*
     */
    extractTracks: true,

    /**
     * APIProperty: extractRoutes
     * {Boolean} Extract routes from GPX.
     *      Default *true*
     */
    extractRoutes: true,

    /**
     * APIProperty: extractAttributes
     * {Boolean} Extract attributes from GPX.
     *      Default *true*
     */
    extractAttributes: true,

    /**
     * APIProperty: precision
     * {Integer} The number of significant digits to retain.
     *      Defaults to *7*
     */
    precision: 7,

    /**
     * APIProperty: handleHeight
     * {Boolean} Extract/Write height (ele tag) from/to GPX to
     * <OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>. TODO
     *      Default *false*
     */
    handleHeight: false,

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "gpx",

    /**
     * Property: gpxns
     * {String} GPX Namespace to use.
     */
    gpxns: null,

    /**
     * Property: tags
     * {Object} the version supported tags.
     */
    tags: null,

    /**
     * Property: regExes
     * Compiled regular expressions for manipulating strings.
     */
    regExes: {
        trimSpace: (/^\s*|\s*$/g),
        removeSpace: (/\s*/g),
        splitSpace: (/\s+/),
        trimComma: (/\s*,\s*/g)
    },

    /**
     * Constructor: Geoportal.Format.GPX.v1
     * Create a new parser for GPX.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
        if (!this.externalProjection) {
            this.externalProjection= 'EPSG:4326';
        }
        if (typeof(this.externalProjection)=='string') {
            this.externalProjection= new OpenLayers.Projection(
                this.externalProjection,
                {
                    domainOfVaditity: new OpenLayers.Bounds(-180,-90,180,90)
                });
        }
        //FIXME: impact on writing gpx node ...
        this.gpxns= this.namespaces[this.defaultPrefix];
    },

    /**
     * APIMethod: read
     * Return a list of features from a GPX doc
     * Parameters:
     * data - {DOMElement | String} data to read/parse.
     *
     * Returns:
     * {Array({<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>})}
     * An Array of features.
     *      The parser holds creator, version and GPX metadata.
     *      Features created from RTE and TRK points hold metadata elements of
     *      these elements as a 'metadata' attribute of their attributes.
     */
    read: function(data) {
        if (typeof(data)=="string") {
            data= OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if (!data) { return []; }
        var root= (data.nodeType == 9 ? data.documentElement : data);
        var gpx= {
            metadata:{
                onlineResource:{},
                contactPerson:{},
                owner:{}
            },
            features:[]
        };
        this.readNode(root, gpx);

        this.creator= gpx.creator;
        this.version= this.version || gpx.version;
        this.metadata= gpx.metadata;
        // FIXME: postprocess features
        this.postProcessFeatures(gpx.features);

        return gpx.features;
    },

    /**
     * Method: postProcessFeatures
     * Post process the features (TODO).
     *
     * Parameters:
     * features - {Array({<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>})}
     * The featues returned by the parser.
     */
    postProcessFeatures: function(features) {
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
        "gpx": {
            "gpx"          : function(node, obj) {
                obj.version= node.getAttribute('version') || this.VERSION;
                obj.creator= node.getAttribute('creator') || this.CLASS_NAME;
                this.nbWPT= this.nbRTE= this.nbTRK= 0;
                this.mappingContext= 'gpx';
                this.readChildNodes(node, obj);
                this.mappingContext= null;
            },
            "name"         : function(node, obj) {
                var v= this.getChildValue(node);
                if (obj.attributes) {//feature level
                    this.assignAttribute('name', v, obj.attributes);
                } else {
                    switch(this.mappingContext) {
                    case 'contactPerson':
                        obj.metadata.contactPerson.name= v;
                        break;
                    default      :
                        obj.metadata.name= v;
                        break;
                    }
                }
            },
            "desc"         : function(node, obj) {
                var v= this.getChildValue(node);
                if (obj.attributes) {//feature level
                    this.assignAttribute('desc', v, obj.attributes);
                } else {
                    obj.metadata.desc= v;
                }
            },
            "type"         : function(node, obj) {
                var v= this.getChildValue(node);
                if (obj.attributes) {//feature level
                    if (this.mappingContext=='link') {
                        this.assignAttribute('type', v, obj.attributes.onlineResource);
                    } else {
                        this.assignAttribute('type', v, obj.attributes);
                    }
                } else {
                    switch(this.mappingContext) {
                    case 'contactPerson':
                        obj.metadata.contactPerson.onlineResource.type= v;
                        break;
                    default      :
                        obj.metadata.onlineResource.type= v;
                        break;
                    }
                }
            },
            "time"         : function(node, obj) {
                var v= this.getChildValue(node);
                if (obj.attributes) {//feature level
                    this.assignAttribute('time', v, obj.attributes);
                } else {
                    obj.metadata.time= v;
                }
            },
            "keywords"     : function(node, obj) {
                obj.metadata.keywords= this.getChildValue(node).split(',');
            },
            "bounds"       : function(node, obj) {
                var minlat= OpenLayers.Util.toFloat(node.getAttribute('minlat'),this.precision);
                var minlon= OpenLayers.Util.toFloat(node.getAttribute('minlon'),this.precision);
                var maxlat= OpenLayers.Util.toFloat(node.getAttribute('maxlat'),this.precision);
                var maxlon= OpenLayers.Util.toFloat(node.getAttribute('maxlon'),this.precision);
                obj.metadata.extent= new OpenLayers.Bounds(minlon, minlat, maxlon, maxlat);
                if (this.internalProjection && this.externalProjection) {
                    obj.metadata.extent.transform(this.externalProjection, this.internalProjection, true);
                }
            },
            "ele"          : function(node, obj) {
                this.assignAttribute('ele', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "magvar"       : function(node, obj) {
                this.assignAttribute('magvar', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "geoidheight"  : function(node, obj) {
                this.assignAttribute('geoidheight', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "cmt"          : function(node, obj) {
                this.assignAttribute('cmt', this.getChildValue(node), obj.attributes);
            },
            "src"          : function(node, obj) {
                this.assignAttribute('src', this.getChildValue(node), obj.attributes);
            },
            "sym"          : function(node, obj) {
                this.assignAttribute('sym', this.getChildValue(node), obj.attributes);
            },
            "fix"          : function(node, obj) {
                this.assignAttribute('fix', this.getChildValue(node), obj.attributes);
            },
            "sat"          : function(node, obj) {
                this.assignAttribute('sat', parseInt(this.getChildValue(node)), obj.attributes);
            },
            "hdop"         : function(node, obj) {
                this.assignAttribute('hdop', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "vdop"         : function(node, obj) {
                this.assignAttribute('vdop', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "pdop"         : function(node, obj) {
                this.assignAttribute('pdop', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "ageofdgpsdata": function(node, obj) {
                this.assignAttribute('ageofdgpsdata', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "dgpsid"       : function(node, obj) {
                this.assignAttribute('dgpsid', parseInt(this.getChildValue(node)), obj.attributes);
            },
            "course"       : function(node, obj) {
                this.assignAttribute('course', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "speed"        : function(node, obj) {
                this.assignAttribute('speed', parseFloat(this.getChildValue(node)), obj.attributes);
            },
            "number"       : function(node, obj) {
                this.assignAttribute('number', parseInt(this.getChildValue(node)), obj.attributes);
            },
            "wpt"          : function(node, obj) {
                if (this.nbRTE>0 || this.nbTRK>0) {
                    obj.metadata.error= true;//FIXME
                    return;
                }
                this.nbWPT++;
                var g= new OpenLayers.Geometry.Point(
                    OpenLayers.Util.toFloat(node.getAttribute('lon'),this.precision),
                    OpenLayers.Util.toFloat(node.getAttribute('lat'),this.precision));
                if (this.internalProjection && this.externalProjection) {
                    g.transform(this.externalProjection, this.internalProjection);
                }
                // construct feature (optionally with attributes)
                var wpt= {
                    geometry: g,
                    attributes: {
                        typeName: 'wpt'
                    }
                };
                if (this.extractAttributes) {
                    var mc= this.mappingContext;
                    this.mappingContext= 'wpt';
                    this.readChildNodes(node, wpt);
                    this.mappingContext= mc;
                }
                var feature= new OpenLayers.Feature.Vector(wpt.geometry, wpt.attributes, this.style);
                if (feature) {
                    obj.features.push(feature);
                } else {
                    ;//TODO
                }
            },
            "rte"         : function(node, obj) {
                if (this.nbTRK>0) {
                    obj.metadata.error= true;//FIXME
                    return;
                }
                this.nbRTE++;
                var rte= {
                    attributes:{},
                    geometry:new OpenLayers.Geometry.LineString()
                };
                var mc= this.mappingContext;
                this.mappingContext= 'rte';
                this.readChildNodes(node, rte);
                if (this.extractAttributes) {
                    rte.attributes.typeName= 'rte';
                    rte.attributes.metadata= rte.metadata || [];
                }
                this.mappingContext= mc;
                var feature= new OpenLayers.Feature.Vector(rte.geometry, rte.attributes, this.style);
                if (feature) {
                    obj.features.push(feature);
                } else {
                    ;//TODO
                }
            },
            "rtept"       : function(node, obj) {
                var mc= this.mappingContext;
                this.mappingContext= 'rtept';
                this.assignPoint(node, obj);
                this.mappingContext= mc;
            },
            "trk"         : function(node, obj) {
                this.nbTRK++;
                var trk= {
                    attributes:{},
                    geometry:new OpenLayers.Geometry.MultiLineString()
                };
                var mc= this.mappingContext;
                this.mappingContext= 'trk';
                this.readChildNodes(node, trk);
                if (this.extractAttributes) {
                    trk.attributes.typeName= 'trk';
                    trk.attributes.metadata= trk.metadata || [];
                }
                this.mappingContext= mc;
                var feature= new OpenLayers.Feature.Vector(trk.geometry, trk.attributes, this.style);
                if (feature) {
                    obj.features.push(feature);
                } else {
                    ;//TODO
                }
            },
            "trkseg"      : function(node, obj) {
                var nobj= {
                    attributes: {},
                    geometry:new OpenLayers.Geometry.LineString()
                } ;
                this.readChildNodes(node, nobj);
                if (!obj.metadata) { obj.metadata= []; }
                obj.metadata= obj.metadata.concat(nobj.metadata);
                obj.geometry.addComponent(nobj.geometry);
            },
            "trkpt"       : function(node, obj) {
                var mc= this.mappingContext;
                this.mappingContext= 'trkpt';
                this.assignPoint(node, obj);
                this.mappingContext= mc;
            }
        }
    },

    /**
     * APIMethod: write
     * Generate a GPX document string given a list of features.
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)}
     *     List of features to serialize into a string.
     * options - {Object} Optional configuration object.
     *
     * Returns:
     * {DOMElement} the GPX document.
     */
    write: function(features,options) {
        //FIXME: options ?
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        var gpx= this.writers.gpx['gpx'].apply(this,[features]);
        return gpx;
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "gpx": {
            "gpx"          : function(features) {
                this.mappingContext= 'gpx';
                var node= this.createElementNSPlus('gpx', {
                    uri: this.gpxns,
                    attributes: {
                        'version': this.version || this.VERSION,
                        'creator': this.creator || this.CLASS_NAME
                    }});
                this.writeMetadata(this.metadata, node);
                // wpt:
                // FIXME: default serialization for Point ?
                //        mapping options ?
                for (var i= 0, len= features.length; i<len; ++i) {
                    var tn= features[i].attributes['typeName'] ||
                            features[i].layer.options.typeName ;
                    if (tn==undefined &&
                        (features[i].geometry instanceof OpenLayers.Geometry.Point)) {
                        tn= 'wpt';
                    }
                    if (tn=='wpt') {
                        var feature= features[i].clone();
                        feature.attributes['typeName']= tn;
                        this.writeNode(tn, feature, node);
                    }
                }
                // rte:
                // FIXME: default serialization for LineString ?
                //        mapping options ?
                for (var i= 0, len= features.length; i<len; ++i) {
                    var tn= features[i].attributes['typeName'] ||
                            features[i].layer.options.typeName ;
                    if (tn==undefined &&
                        (features[i].geometry instanceof OpenLayers.Geometry.LineString)) {
                        tn= 'rte';
                    }
                    if (tn=='rte') {
                        var feature= features[i].clone();
                        feature.attributes['typeName']= tn;
                        this.writeNode(tn, feature, node);
                    }
                }
                // trk:
                // FIXME: default serialization for MultiLineString ?
                //        mapping options ?
                for (var i= 0, len= features.length; i<len; ++i) {
                    var tn= features[i].attributes['typeName'] ||
                            features[i].layer.options.typeName ;
                    if (tn==undefined &&
                        (features[i].geometry instanceof OpenLayers.Geometry.MultiLineString)) {
                        tn= 'trk';
                    }
                    if (tn=='trk') {
                        var feature= features[i].clone();
                        feature.attributes['typeName']= tn;
                        this.writeNode(tn, feature, node);
                    }
                }
                this.mappingContext= null;
                return node;
            },
            "name"         : function(obj) {
                return this.createTag('name', obj);
            },
            "desc"         : function(obj) {
                return this.createTag('desc', obj);
            },
            "type"         : function(obj) {
                return this.createTag('type', obj);
            },
            "time"         : function(obj) {
                return this.createTag('time', obj);
            },
            "keywords"     : function(obj) {
                var v= obj['keywords'].join(',');
                var node= this.createElementNSPlus('keywords', {
                    uri:this.gpxns,
                    value:v
                });
                return node;
            },
            "bounds"       : function(obj) {
                //FIXME: obj['extent']
                var bounds= obj['extent'].clone();
                if (this.internalProjection && this.externalProjection) {
                    bounds.transform(this.internalProjection, this.externalProjection, true);
                }
                var node= this.createElementNSPlus('bounds', {
                    uri:this.gpxns,
                    attributes:{
                        'minlat': OpenLayers.String.sprintf("%.*f", this.precision, bounds.bottom),
                        'minlon': OpenLayers.String.sprintf("%.*f", this.precision, bounds.left),
                        'maxlat': OpenLayers.String.sprintf("%.*f", this.precision, bounds.top),
                        'maxlon': OpenLayers.String.sprintf("%.*f", this.precision, bounds.right)
                    }
                });
                return node;
            },
            "ele"          : function(obj) {
                return this.createTag('ele', obj);
            },
            "magvar"       : function(obj) {
                return this.createTag('magvar', obj);
            },
            "geoidheight"  : function(obj) {
                return this.createTag('geoidheight', obj);
            },
            "cmt"          : function(obj) {
                return this.createTag('cmt', obj);
            },
            "src"          : function(obj) {
                return this.createTag('src', obj);
            },
            "sym"          : function(obj) {
                return this.createTag('sym', obj);
            },
            "fix"          : function(obj) {
                return this.createTag('fix', obj);
            },
            "sat"          : function(obj) {
                return this.createTag('sat', obj);
            },
            "hdop"         : function(obj) {
                return this.createTag('hdop', obj);
            },
            "vdop"         : function(obj) {
                return this.createTag('vdop', obj);
            },
            "pdop"         : function(obj) {
                return this.createTag('pdop', obj);
            },
            "ageofdgpsdata": function(obj) {
                return this.createTag('ageofdgpsdata', obj);
            },
            "dgpsid"       : function(obj) {
                return this.createTag('dgpsid', obj);
            },
            "course"       : function(obj) {
                return this.createTag('course', obj);
            },
            "speed"        : function(obj) {
                return this.createTag('speed', obj);
            },
            "number"       : function(obj) {
                return this.createTag('number', obj);
            },
            "wpt"          : function(obj) {
                this.mappingContext= 'wpt';
                var ll= {x:obj.geometry.x, y: obj.geometry.y};
                if (this.internalProjection && this.externalProjection) {
                    OpenLayers.Projection.transform(ll,this.internalProjection,this.externalProjection);
                }
                var node= this.createElementNSPlus('wpt', {
                    uri:this.gpxns,
                    attributes:{
                        'lat': OpenLayers.String.sprintf("%.*f", this.precision, ll.y),
                        'lon': OpenLayers.String.sprintf("%.*f", this.precision, ll.x)
                    }
                });
                for (var i= 0, l= this.tags['wpt'].length; i<l; i++) {
                    var tag= this.tags['wpt'][i];
                    this.writeNode(tag, obj, node);
                }
                this.mappingContext= null;
                return node;
            },
            "rte"          : function(obj) {
                this.mappingContext= 'rte';
                var node= this.createElementNS(this.gpxns, 'rte');
                for (var i= 0, l= this.tags['rte'].length; i<l; i++) {
                    var tag= this.tags['rte'][i];
                    this.writeNode(tag, obj, node);
                }
                for (var i= 0, l= obj.geometry.components.length; i<l; i++) {
                    this.writeNode('rtept', {
                        geometry: obj.geometry.components[i],
                        metadata: (obj.attributes.metadata? obj.attributes.metadata[i]: null)
                    }, node);
                }
                this.mappingContext= null;
                return node;
            },
            "rtept"        : function(obj) {
                var ll= {x:obj.geometry.x, y: obj.geometry.y};
                if (this.internalProjection && this.externalProjection) {
                    OpenLayers.Projection.transform(ll,this.internalProjection,this.externalProjection);
                }
                var node= this.createElementNSPlus('rtept', {
                    uri:this.gpxns,
                    attributes:{
                        'lat': OpenLayers.String.sprintf("%.*f", this.precision, ll.y),
                        'lon': OpenLayers.String.sprintf("%.*f", this.precision, ll.x)
                    }
                });
                if (obj.metadata) {
                    for (var i= 0, l= this.tags['rtept'].length; i<l; i++) {
                        var tag= this.tags['rtept'][i];
                        this.writeNode(tag, obj.metadata, node);
                    }
                }
                return node;
            },
            "trk"          : function(obj) {
                this.mappingContext= 'trk';
                var node= this.createElementNS(this.gpxns, 'trk');
                for (var i= 0, l= this.tags['trk'].length; i<l; i++) {
                    var tag= this.tags['trk'][i];
                    this.writeNode(tag, obj, node);
                }
                for (var i= 0, l= obj.geometry.components.length, f= 0, t= 0; i<l; i++) {
                    t= obj.geometry.components[i].components.length;
                    this.writeNode('trkseg', {
                        geometry: obj.geometry.components[i],
                        metadata: (obj.attributes.metadata? obj.attributes.metadata.slice(f,f+t):null)
                    }, node);
                    f+= t;
                }
                this.mappingContext= null;
                return node;
            },
            "trkseg"       : function(obj) {
                var node= this.createElementNS(this.gpxns, 'trkseg');
                for (var i= 0, l= obj.geometry.components.length; i<l; i++) {
                    this.writeNode('trkpt', {
                        geometry: obj.geometry.components[i],
                        metadata: (obj.metadata? obj.metadata[i]:null)
                    }, node);
                }
                return node;
            },
            "trkpt"        : function(obj) {
                var ll= {x:obj.geometry.x, y: obj.geometry.y};
                if (this.internalProjection && this.externalProjection) {
                    OpenLayers.Projection.transform(ll,this.internalProjection,this.externalProjection);
                }
                var node= this.createElementNSPlus('trkpt', {
                    uri:this.gpxns,
                    attributes:{
                        'lat': OpenLayers.String.sprintf("%.*f", this.precision, ll.y),
                        'lon': OpenLayers.String.sprintf("%.*f", this.precision, ll.x)
                    }
                });
                if (obj.metadata) {
                    for (var i= 0, l= this.tags['trkpt'].length; i<l; i++) {
                        var tag= this.tags['trkpt'][i];
                        this.writeNode(tag, obj.metadata, node);
                    }
                }
                return node;
            }
        }
    },

    /**
     * Method: assignAttribute
     * Assign the attribute's name and value based on a given mapping.
     *
     * Parameters:
     * gpxTag - {String} the GPX tag name to assign as an attribute.
     * v - {*} the GPX tag name value.
     * a - {Object} the attributes object to set.
     */
    assignAttribute: function(gpxTag, v, a) {
        var attn= (this.mapping[this.mappingContext||'gpx'] || this.mapping || {})[gpxTag];
        if (attn==undefined) attn= gpxTag;
        if (attn!=null) {
            a[attn]= v;
        }
    },

    /**
     * Method: readAttribute
     * Get the attribute's value based on a given mapping.
     *
     * Parameters:
     * gpxTag - {String} the GPX tag name to write.
     * obj - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html | Geoportal.Format.GPX>}
     * the attributes container to read.
     *
     * Returns:
     * {*} the attribute's value or null.
     */
    readAttribute: function(gpxTag, obj) {
        var v= null;
        if (!obj) { return null; }
        if (obj instanceof OpenLayers.Feature.Vector) {
            var attn= (this.mapping[this.mappingContext||'gpx'] || this.mapping || {})[gpxTag];
            if (attn==undefined) attn= gpxTag;
            if (attn!=null) {
                v= obj.attributes[attn];
            }
        } else {// metadata level
            v= obj[gpxTag];
        }
        return v;
    },

    /**
     * Method: assignPoint
     * Assign a point geometry stored by a node to a feature.
     *
     * Parameters:
     * node - {Node} the geometry holder.
     * obj - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     * the target feature.
     */
    assignPoint: function(node, obj) {
        var g= new OpenLayers.Geometry.Point(
            OpenLayers.Util.toFloat(node.getAttribute('lon'),this.precision),
            OpenLayers.Util.toFloat(node.getAttribute('lat'),this.precision));
        if (this.internalProjection && this.externalProjection) {
            g.transform(this.externalProjection, this.internalProjection);
        }
        if (this.extractAttributes) {
            var pt= {
                attributes: {}
            };
            this.readChildNodes(node, pt);
            if (!obj.metadata) { obj.metadata= []; }
            obj.metadata.push(pt.attributes);
        }
        obj.geometry.addComponent(g);
    },

    /**
     * Method: writeMetadata
     * Write GPX metadata tags for gpx tag.
     *      Does nothing. Must be overriden by sub-classes.
     *
     * Parameters:
     * meta - {Object} the metadata object.
     * parent - {Node}  the parent node of metadata elements.
     */
    writeMetadata: function(meta, parent) {
    },

    /**
     * Method: createTag
     * Write a GPX tag
     *
     * Parameters:
     * gpxTag - {String} GPX tag name.
     * obj - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html | Geoportal.Format.GPX>}
     * the object where to fetch the value to insert.
     * val - {*} a value to insert (optional, defaults to read the object).
     *
     * Returns:
     * {Node} the newly created XML node or null if none.
     */
    createTag: function(gpxTag, obj, val) {
        var node= null;
        var v= val || this.readAttribute(gpxTag, obj);
        if (v!=null) {
            node= this.createElementNSPlus(gpxTag, {
                uri:this.gpxns,
                value:v
            });
        }
        return node;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.GPX.v1"*
     */
    CLASS_NAME: "Geoportal.Format.GPX.v1"
});

/**
 * Constant: Geoportal.Format.GPX.v1.TAGS
 * {Object} Hash of GPX tags allowed on a gpx, wkt, rte, rtept, trk, trkpt
 * elements.
 */
Geoportal.Format.GPX.v1.TAGS= {};

