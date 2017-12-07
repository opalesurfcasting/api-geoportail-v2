/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/GPX/v1.js
 */
/**
 * Class: Geoportal.Format.GPX.v1_0
 * Read/write GPX parser. Create a new instance with the
 *     <Geoportal.Format.GPX> constructor for the
 *     <http://www.topografix.com/GPX/1/0/gpx.xsd> schema.
 *
 * (code)
 * <gpx xmlns="http://www.topografix.com/GPX/1/0"
 *      xmlns:gpx="http://www.topografix.com/GPX/1/0"
 *      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 *      schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd"
 *      version="1.0"
 *      creator="CREATOR">
 *   <name>GPX file name</name>
 *   <desc>GPX file description</desc>
 *   <author>GPX file author</author>
 *   <email>GPX file author email</email>
 *   <url>GPX file URL</url>
 *   <urlname>URLNAME</urlname>
 *   <time>GPX file creation time</time>
 *   <keywords>GPX file keywords (comma separated)</keywords>
 *   <bounds minlat="-90.0" minlon="-180.0" maxlat="90.0" maxlon="180.0"/>
 *   <wpt lat="0.0" lon="0.0">
 *     <ele>0.0</ele>
 *     <time>TIME</time>
 *     <magvar>0</magvar>
 *     <geoidheight>0.0</geoidheight>
 *     <name>NAME</name>
 *     <cmt>CMT</cmt>
 *     <desc>DESC</desc>
 *     <src>the source of this data: "Garmin eTrex", "Map", etc</src>
 *     <url>URL</url>
 *     <urlname>URLNAME</urlname>
 *     <sym>URL</sym>
 *     <type>TYPE</type>
 *     <fix>none|2d|3d|dgps|pps</fix>
 *     <sat>0</sat>
 *     <hdop>0.0</hdop>
 *     <vdop>0.0</vdop>
 *     <pdop>0.0</pdop>
 *     <ageofdgpsdata>0.0</ageofdgpsdata>
 *     <dgpsid>[0..1023]</dgpsid>
 *   </wpt>
 *   <rte>
 *     <name>NAME</name>
 *     <cmt>CMT</cmt>
 *     <desc>DESC</desc>
 *     <src>the source of this data: "Garmin eTrex", "Map", etc</src>
 *     <url>URL</url>
 *     <urlname>URLNAME</urlname>
 *     <number>GPS track number</number>
 *     <rtept lat="0.0" lon="0.0">
 *       <ele>0.0</ele>
 *       <time>TIME</time>
 *       <magvar>0</magvar>
 *       <geoidheight>0.0</geoidheight>
 *       <name>NAME</name>
 *       <cmt>CMT</cmt>
 *       <desc>DESC</desc>
 *       <src>the source of this data: "Garmin eTrex", "Map", etc</src>
 *       <url>URL</url>
 *       <urlname>URLNAME</urlname>
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
 *     <url>URL</url>
 *     <urlname>URLNAME</urlname>
 *     <number>GPS track number</number>
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
 *         <url>URL</url>
 *         <urlname>URLNAME</urlname>
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
 *     </trkseg>
 *   </trk>
 * </gpx>
 * (end)
 *
 * Inherits from:
 *  - <Geoportal.Format.GPX.v1>
 */
Geoportal.Format.GPX.v1_0= OpenLayers.Class( Geoportal.Format.GPX.v1, {

    /**
     * Constant: VERSION
     * {String} 1.0
     */
    VERSION: "1.0",

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        gpx: "http://www.topografix.com/GPX/1/0",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocation: "http://www.topografix.com/GPX/1/0/gpx.xsd",

    /**
     * Constructor: Geoportal.Format.GPX.v1_0
     * Create a new parser for GPX v1.0.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        Geoportal.Format.GPX.v1.prototype.initialize.apply(this, [options]);
        this.tags= Geoportal.Format.GPX.v1_0.TAGS;
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
            "author"       : function(node, obj) {
                obj.metadata.contactPerson.name= this.getChildValue(node);
            },
            "email"        : function(node, obj) {
                obj.metadata.contactPerson.email= this.getChildValue(node);
            },
            "url"          : function(node, obj) {
                var v= this.getChildValue(node);
                if (obj.attributes) {//feature level
                    if (!obj.attributes.onlineResource) {
                        obj.attributes.onlineResource= {};
                    }
                    obj.attributes.onlineResource.href= v;
                    //this.assignAttribute('url', v, obj.attributes);
                } else {
                    obj.metadata.onlineResource.href= v;
                }
            },
            "urlname"      : function(node, obj) {
                var v= this.getChildValue(node);
                if (obj.attributes) {//feature level
                    obj.attributes.onlineResource.text= v;
                    //this.assignAttribute('urlname', v, obj.attributes);
                } else {
                    obj.metadata.onlineResource.text= v;
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
            "author"       : function(obj) {
                return this.createTag('author', null, obj.contactPerson.name);
            },
            "email"        : function(obj) {
                return this.createTag('email', null, obj.contactPerson.email);
            },
            "url"          : function(obj) {
                if (obj.onlineResource) {
                    return this.createTag('url', null, obj.onlineResource.href);
                } else if (obj.attributes && obj.attributes.onlineResource) {
                    return this.createTag('url', null, obj.attributes.onlineResource.href);
                }
            },
            "urlname"      : function(obj) {
                if (obj.onlineResource) {
                    return this.createTag('urlname', null, obj.onlineResource.text);
                } else if (obj.attributes && obj.attributes.onlineResource) {
                    return this.createTag('urlname', null, obj.attributes.onlineResource.text);
                }
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
            for (var i= 0, l= this.tags['gpx'].length; i<l; i++) {
                var tag= this.tags['gpx'][i];
                this.writeNode(tag, meta, parent);
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.GPX.v1_0"*
     */
    CLASS_NAME: "Geoportal.Format.GPX.v1_0"
});

/**
 * Constant: Geoportal.Format.GPX.v1_0.TAGS
 * {Object} Hash of GPX tags allowed on a gpx, wkt, rte, rtept, trk, trkpt
 * elements.
 */
Geoportal.Format.GPX.v1_0.TAGS= OpenLayers.Util.applyDefaults({
    'gpx':[
        'name', 'desc', 'author', 'email', 'url',
        'urlname', 'time', 'keywords', 'bounds'
    ],
    'wpt':[
        'ele', 'time', 'magvar', 'geoidheight',
        'name', 'cmt', 'desc', 'src', 'url', 'urlname',
        'sym', 'type', 'fix', 'sat', 'hdop', 'vdop', 'pdop',
        'ageofdgpsdata', 'dgpsid'
    ],
    'rte':[
        'name', 'cmt', 'desc', 'src', 'url', 'urlname', 'number'
    ],
    'rtept':[
        'ele', 'time', 'magvar', 'geoidheight',
        'name', 'cmt', 'desc', 'src', 'url', 'urlname',
        'sym', 'type', 'fix', 'sat', 'hdop', 'vdop', 'pdop',
        'ageofdgpsdata', 'dgpsid'
    ],
    'trk':[
        'name', 'cmt', 'desc', 'src', 'url', 'urlname', 'number'
    ],
    'trkpt':[
        'ele', 'time', 'course', 'speed', 'magvar', 'geoidheight',
        'name', 'cmt', 'desc', 'src', 'url', 'urlname',
        'sym', 'type', 'fix', 'sat', 'hdop', 'vdop', 'pdop',
        'ageofdgpsdata', 'dgpsid'
    ]
}, Geoportal.Format.GPX.v1.TAGS);
