/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/GPX/v1.js
 */
/**
 * Class: Geoportal.Format.GPX.v1_1
 * Read/write GPX parser. Create a new instance with the
 *     <Geoportal.Format.GPX> constructor for the
 *     <http://www.topografix.com/GPX/1/1/gpx.xsd> schema.
 *
 * (code)
 * <gpx xmlns="http://www.topografix.com/GPX/1/1"
 *      xmlns:gpx="http://www.topografix.com/GPX/1/1"
 *      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 *      schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
 *      version="1.1"
 *      creator="CREATOR">
 *   <metadata>
 *     <name>GPX file name</name>
 *     <desc>GPX file description</desc>
 *     <author>
 *       <name>Name of person or organization</name>    <!-- author     in 1.0 -->
 *       <email id="ID" domain="DOMAIN"></email>        <!-- email      in 1.0 -->
 *       <link href="HREF">
 *         <text>TEXT</text>
 *         <type>MIME</type>
 *       </link>
 *     </author>
 *     <copyright author="AUTHOR">
 *       <year>YEAR</year>
 *       <license>URL</license>
 *     </copyright>
 *     <link href="URL">                                <!-- url        in 1.0 -->
 *       <text>TEXT</text>                              <!-- urlname    in 1.0 -->
 *       <type>MIME</type>
 *     </link>
 *     <time>GPX file creation time</time>
 *     <keywords>GPX file keywords (comma separated)</keywords>
 *     <bounds minlat="-90.0" minlon="-180.0" maxlat="90.0" maxlon="180.0"/>
 *   </metadata>
 *   <wpt lat="0.0" lon="0.0">
 *     <ele>0.0</ele>
 *     <time>TIME</time>
 *     <magvar>0</magvar>
 *     <geoidheight>0.0</geoidheight>
 *     <name>NAME</name>
 *     <cmt>CMT</cmt>
 *     <desc>DESC</desc>
 *     <src>the source of this data: "Garmin eTrex", "Map", etc</src>
 *     <link href="URL">                                <!-- url        in 1.0 -->
 *       <text>TEXT</text>                              <!-- urlname    in 1.0 -->
 *       <type>MIME</type>
 *     </link>
 *     <sym>URL</sym>
 *     <type>TYPE</type>
 *     <fix>none|2d|3d|dgps|pps</fix>
 *     <sat>0</sat>
 *     <hdop>0.0</hdop>
 *     <vdop>0.0</vdop>
 *     <pdop>0.0</pdop>
 *     <ageofdgpsdata>0.0</ageofdgpsdata>
 *     <dgpsid>[0..1023]</dgpsid>
 *     <extensions></extensions>
 *   </wpt>
 *   <rte>
 *     <name>NAME</name>
 *     <cmt>CMT</cmt>
 *     <desc>DESC</desc>
 *     <src>the source of this data: "Garmin eTrex", "Map", etc</src>
 *     <link href="URL">                                <!-- url        in 1.0 -->
 *       <text>TEXT</text>                              <!-- urlname    in 1.0 -->
 *       <type>MIME</type>
 *     </link>
 *     <number>GPS track number</number>
 *     <type>TYPE</type>
 *     <extensions></extensions>
 *     <rtept lat="0.0" lon="0.0">
 *       <ele>0.0</ele>
 *       <time>TIME</time>
 *       <magvar>0</magvar>
 *       <geoidheight>0.0</geoidheight>
 *       <name>NAME</name>
 *       <cmt>CMT</cmt>
 *       <desc>DESC</desc>
 *       <src>the source of this data: "Garmin eTrex", "Map", etc</src>
 *       <link href="URL">                              <!-- url        in 1.0 -->
 *         <text>TEXT</text>                            <!-- urlname    in 1.0 -->
 *         <type>MIME</type>
 *       </link>
 *       <sym>URL</sym>
 *       <type>TYPE</type>
 *       <fix>none|2d|3d|dgps|pps</fix>
 *       <sat>0</sat>
 *       <hdop>0.0</hdop>
 *       <vdop>0.0</vdop>
 *       <pdop>0.0</pdop>
 *       <ageofdgpsdata>0.0</ageofdgpsdata>
 *       <dgpsid>[0..1023]</dgpsid>
 *     </rtept>
 *   </rte>
 *   <trk>
 *     <name>NAME</name>
 *     <cmt>CMT</cmt>
 *     <desc>DESC</desc>
 *     <src>the source of this data: "Garmin eTrex", "Map", etc</src>
 *     <link href="URL">                                <!-- url        in 1.0 -->
 *       <text>TEXT</text>                              <!-- urlname    in 1.0 -->
 *       <type>MIME</type>
 *     </link>
 *     <number>GPS track number</number>
 *     <type>TYPE</type>
 *     <extensions></extensions>
 *     <trkseg>
 *       <trkpt lat="0.0" lon="0.0">
 *         <ele>0.0</ele>
 *         <time>TIME</time>
 *         <course>0</course>
 *         <speed>0.0</speed>
 *         <magvar>0</magvar>
 *         <geoidheight>0.0</geoidheight>
 *         <name>NAME</name>
 *         <cmt>CMT</cmt>
 *         <desc>DESC</desc>
 *         <src>the source of this data: "Garmin eTrex", "Map", etc</src>
 *         <link href="URL">                            <!-- url        in 1.0 -->
 *           <text>TEXT</text>                          <!-- urlname    in 1.0 -->
 *           <type>MIME</type>
 *         </link>
 *         <sym>URL</sym>
 *         <type>TYPE</type>
 *         <fix>none|2d|3d|dgps|pps</fix>
 *         <sat>0</sat>
 *         <hdop>0.0</hdop>
 *         <vdop>0.0</vdop>
 *         <pdop>0.0</pdop>
 *         <ageofdgpsdata>0.0</ageofdgpsdata>
 *         <dgpsid>[0..1023]</dgpsid>
 *       </trkpt>
 *       <extensions></extensions>
 *     </trkseg>
 *   </trk>
 *   <extensions></extensions>
 * </gpx>
 * (end)
 *
 *
 * Inherits from:
 *  - <Geoportal.Format.GPX.v1>
 */
Geoportal.Format.GPX.v1_1= OpenLayers.Class( Geoportal.Format.GPX.v1, {

    /**
     * Constant: VERSION
     * {String} 1.1
     */
    VERSION: "1.1",

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        gpx: "http://www.topografix.com/GPX/1/1",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocation: "http://www.topografix.com/GPX/1/1/gpx.xsd",

    /**
     * Constructor: Geoportal.Format.GPX.v1_1
     * Create a new parser for GPX v1.1.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        Geoportal.Format.GPX.v1.prototype.initialize.apply(this, [options]);
        this.tags= Geoportal.Format.GPX.v1_1.TAGS;
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
        "gpx": OpenLayers.Util.applyDefaults({
            "metadata"     : function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "author"       : function(node, obj) {
                var mc= this.mappingContext;
                this.mappingContext= "contactPerson";
                this.readChildNodes(node, obj);
                this.mappingContext= mc;
            },
            "email"        : function(node, obj) {
                obj.metadata.contactPerson.email= node.getAttribute('id')+'@'+node.getAttribute('domain');
            },
            "copyright"    : function(node, obj) {
                obj.metadata.owner.author= node.getAttribute('author');
                this.readChildNodes(node, obj);
            },
            "year"         : function(node, obj) {
                obj.metadata.owner.year= this.getChildValue(node);
            },
            "license"      : function(node, obj) {
                obj.metadata.owner.license= this.getChildValue(node);
            },
            "link"         : function(node, obj) {
                var v= node.getAttribute('href');
                if (obj.attributes) {
                    if (!obj.attributes.onlineResource) { obj.attributes.onlineResource= {}; }
                    obj.attributes.onlineResource.href= v;
                } else {
                    switch(this.mappingContext) {
                    case 'contactPerson':
                        obj.metadata.contactPerson.onlineResource= {
                            href:v
                        };
                        break;
                    default             :
                        obj.metadata.onlineResource.href= v;
                        break;
                    }
                }
                var mc= this.mappingContext;
                switch(mc) {
                case "wpt"   :
                case "rte"   :
                case "rtept" :
                case "trk"   :
                case "trkpt" :
                    this.mappingContext= "link";
                    break;
                default:
                    break;
                }
                this.readChildNodes(node, obj);
                this.mappingContext= mc;
            },
            "text"         : function(node, obj) {
                var v= this.getChildValue(node);
                if (obj.attributes) {
                    obj.attributes.onlineResource.text= v;
                } else {
                    switch(this.mappingContext) {
                    case 'contactPerson':
                        obj.metadata.contactPerson.onlineResource.text= v;
                        break;
                    default             :
                        obj.metadata.onlineResource.text= v;
                        break;
                    }
                }
            }
        }, Geoportal.Format.GPX.v1.prototype.readers["gpx"])
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "gpx": OpenLayers.Util.applyDefaults({
            "metadata"     : function(obj) {
                var node= null;
                if (obj) {
                    node= this.createElementNS(this.gpxns, 'metadata');
                    for (var i= 0, l= this.tags['gpx'].length; i<l; i++) {
                        var tag= this.tags['gpx'][i];
                        this.writeNode(tag, obj, node);
                    }
                }
                return node;
            },
            "author"       : function(obj) {
                var node= this.createElementNS(this.gpxns, 'author');
                this.writeNode('name', obj.contactPerson, node);
                this.writeNode('email', obj.contactPerson, node);
                this.writeNode('link', obj.contactPerson, node);
                return node;
            },
            "email"        : function(obj) {
                var parts= obj.email.split('@');
                var node= this.createElementNSPlus('email', {
                    uri:this.gpxns,
                    attributes:{
                        'id': parts[0] || 'nobody',
                        'domain': parts[1] || 'localhost'
                    }
                });
                return node;
            },
            "copyright"    : function(obj) {
                var node= this.createElementNSPlus('copyright', {
                    uri:this.gpxns,
                    attributes:{
                        author:obj.owner.author
                    }
                });
                this.writeNode('year', obj.owner, node);
                this.writeNode('license', obj.owner, node);
                return node;
            },
            "year"         : function(obj) {
                var node= this.createElementNSPlus('year', {
                    uri:this.gpxns,
                    value:obj.year
                });
                return node;
            },
            "license"      : function(obj) {
                var node= this.createElementNSPlus('license', {
                    uri:this.gpxns,
                    value:obj.license
                });
                return node;
            },
            "link"         : function(obj) {
                var onlineResource= (obj.attributes || obj.metadata || obj).onlineResource;
                if (onlineResource) {
                    var node= this.createElementNSPlus('link', {
                        uri:this.gpxns,
                        attributes:{
                            href:onlineResource.href
                        }
                    });
                    this.writeNode('text', onlineResource, node);
                    var mc= this.mappingContext;
                    this.mappingContext= "link";
                    this.writeNode('type', onlineResource, node);
                    this.mappingContext= mc;
                    return node;
                }
                return null;
            },
            "text"         : function(obj) {
                var node= this.createElementNSPlus('text', {
                    uri:this.gpxns,
                    value:obj.text
                });
                return node;
            }
        }, Geoportal.Format.GPX.v1.prototype.writers["gpx"])
    },

    /**
     * Method: writeMetadata
     * Write GPX metadata tags for gpx tag.
     *
     * Parameters:
     * meta - {Object} the metadata object.
     * parent - {Node}  the parent node of metadata elements.
     */
    writeMetadata: function(meta, parent) {
        if (meta) {
            var child= this.writers['gpx']['metadata'].apply(this,[meta]);
            if (parent) {
                parent.appendChild(child);
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.GPX.v1_1"*
     */
    CLASS_NAME: "Geoportal.Format.GPX.v1_1"
});

/**
 * Constant: Geoportal.Format.GPX.v1_1.TAGS
 * {Object} Hash of GPX tags allowed on a gpx, wkt, rte, rtept, trk, trkpt
 * elements.
 */
Geoportal.Format.GPX.v1_1.TAGS= {
    'gpx':[
        'name', 'desc', 'author', 'copyright', 'link',
        'time', 'keywords', 'bounds'
    ],
    'wpt':[
        'ele', 'time', 'magvar', 'geoidheight',
        'name', 'cmt', 'desc', 'src', 'link',
        'sym', 'type', 'fix', 'sat', 'hdop', 'vdop', 'pdop',
        'ageofdgpsdata', 'dgpsid'
    ],
    'rte':[
        'name', 'cmt', 'desc', 'src', 'link', 'number', 'type'
    ],
    'rtept':[
        'ele', 'time', 'magvar', 'geoidheight',
        'name', 'cmt', 'desc', 'src', 'link',
        'sym', 'type', 'fix', 'sat', 'hdop', 'vdop', 'pdop',
        'ageofdgpsdata', 'dgpsid'
    ],
    'trk':[
        'name', 'cmt', 'desc', 'src', 'link', 'number', 'type'
    ],
    'trkpt':[
        'ele', 'time', 'course', 'speed', 'magvar', 'geoidheight',
        'name', 'cmt', 'desc', 'src', 'link',
        'sym', 'type', 'fix', 'sat', 'hdop', 'vdop', 'pdop',
        'ageofdgpsdata', 'dgpsid'
    ]
};
