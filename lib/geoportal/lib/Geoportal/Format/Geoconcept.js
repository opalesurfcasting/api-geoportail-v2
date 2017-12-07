/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format.js
 */
/**
 * Class: Geoportal.Format.Geoconcept
 * Write support for Geoconcept export text files.
 *      Enhanced on contributions from Jean-Marc Viglino (IGNF, <http://ripart.ign.fr>)
 *
 * Inherits from:
 * - <Geoportal.Format>
 */
Geoportal.Format.Geoconcept = OpenLayers.Class(Geoportal.Format, {

    /**
     * Constant: SUPPORTED_CRSS
     * {Object} List of Geoconcept supported CRSs.
     */
    SUPPORTED_CRSS: [
        { Type:   1, TimeZone:null, projCode:['EPSG:27572', 'EPSG:27582', 'IGNF:LAMBE'] },
        { Type:   2, TimeZone:null, projCode:['EPSG:27561', 'IGNF:LAMB1'] },
        { Type:   3, TimeZone:null, projCode:['EPSG:27562', 'IGNF:LAMB2'] },
        { Type:   4, TimeZone:null, projCode:['EPSG:27563', 'IGNF:LAMB3'] },
        { Type:   5, TimeZone:null, projCode:['EPSG:27564', 'IGNF:LAMB4'] },
        { Type:  13, TimeZone:null, projCode:['EPSG:3857', 'EPSG:900913'] }, //FIXME
        { Type:  15, TimeZone:   1, projCode:['EPSG:2988', 'IGNF:WALL78UTM1S']},
        { Type:  15, TimeZone:   5, projCode:['EPSG:2977', 'IGNF:TAHAAUTM05S']},
        { Type:  15, TimeZone:   6, projCode:['EPSG:3305', 'IGNF:MOOREA87U6S']},
        { Type:  15, TimeZone:   6, projCode:['EPSG:3304', 'IGNF:TAHI79UTM6S']},
        { Type:  15, TimeZone:   7, projCode:['EPSG:2978', 'EPSG:3302', 'IGNF:NUKU72U7S', 'IGNF:IGN63UTM7S']},
        { Type:  15, TimeZone:  38, projCode:['EPSG:2980', 'IGNF:MAYO50UTM38S']},
        { Type:  15, TimeZone:  39, projCode:['EPSG:32739', 'IGNF:UTM39SW84']},
        { Type:  15, TimeZone:  42, projCode:['EPSG:32742', 'IGNF:UTM42SW84']},
        { Type:  15, TimeZone:  43, projCode:['EPSG:32743', 'IGNF:UTM43SW84']},
        { Type:  15, TimeZone:  58, projCode:['EPSG:32758', 'IGNF:IGN72UTM58S']},
        { Type:  17, TimeZone:  20, projCode:['EPSG:2973', 'EPSG:2970', 'EPSG:2969', 'IGNF:MART38UTM20', 'IGNF:GUAD48UTM20', 'IGNF:GUADFM49U20']},
        { Type:  17, TimeZone:  21, projCode:['EPSG:2987', 'IGNF:STPM50UTM21']},
        { Type:  17, TimeZone:  22, projCode:['EPSG:2971', 'IGNF:CSG67UTM22']},
        { Type: 101, TimeZone:null, projCode:['EPSG:4326', 'CRS:84', 'IGNF:WGS84G'] },
        { Type: 102, TimeZone:null, projCode:['IGNF:ED50G']},
        { Type: 105, TimeZone:null, projCode:['IGNF:NTFP']},
        { Type: 107, TimeZone:null, projCode:['IGNF:WGS72G']},
        { Type: 222, TimeZone:null, projCode:['IGNF:MILLER']},
        { Type: 501, TimeZone:null, projCode:['EPSG:32620', 'IGNF:RRAFGUADU20']},
        { Type: 502, TimeZone:null, projCode:['EPSG:32620', 'IGNF:RRAFMARTU20']},
        { Type: 503, TimeZone:null, projCode:['EPSG:32740', 'IGNF:RGM04UTM38S']},
        { Type: 504, TimeZone:null, projCode:['EPSG:2975', 'IGNF:RGR92UTM40S']},
        { Type: 505, TimeZone:null, projCode:['EPSG:2972', 'IGNF:UTM22RGFG95']},
        { Type: 506, TimeZone:null, projCode:['EPSG:32701', 'IGNF:UTM01SWG84']},
        { Type: 507, TimeZone:null, projCode:['EPSG:32621', 'IGNF:RGSPM06U21']},
        { Type: 508, TimeZone:null, projCode:['EPSG:3296', 'IGNF:RGPFUTM5S']},
        { Type: 509, TimeZone:null, projCode:['EPSG:3297', 'IGNF:RGPFUTM6S']},
        { Type: 510, TimeZone:null, projCode:['EPSG:3298', 'IGNF:RGPFUTM7S']},
        { Type: 511, TimeZone:null, projCode:['IGNF:CROZ63UTM39S']},
        { Type: 513, TimeZone:null, projCode:['IGNF:RGNCUTM57S']},
        { Type: 514, TimeZone:null, projCode:['IGNF:RGNCUTM58S']},
        { Type: 515, TimeZone:null, projCode:['IGNF:RGNCUTM59S']},
        { Type: 516, TimeZone:null, projCode:['IGNF:KERG62UTM42S']},
        { Type: 520, TimeZone:null, projCode:['IGNF:REUN47GAUSSL']},
        { Type:1002, TimeZone:null, projCode:['EPSG:27571', 'IGNF:LAMB1C']},
        { Type:1003, TimeZone:null, projCode:['EPSG:27572', 'IGNF:LAMB2C']},
        { Type:1004, TimeZone:null, projCode:['EPSG:27573', 'IGNF:LAMB3C']},
        { Type:1005, TimeZone:null, projCode:['EPSG:27574', 'IGNF:LAMB4C']},
        { Type:1006, TimeZone:null, projCode:['EPSG:2154', 'IGNF:LAMB93']},
        { Type:1007, TimeZone:null, projCode:['IGNF:RGNCLAM']},
        { Type:2501, TimeZone:null, projCode:['IGNF:RGF93CC42']},
        { Type:2502, TimeZone:null, projCode:['IGNF:RGF93CC43']},
        { Type:2503, TimeZone:null, projCode:['IGNF:RGF93CC44']},
        { Type:2504, TimeZone:null, projCode:['IGNF:RGF93CC45']},
        { Type:2505, TimeZone:null, projCode:['IGNF:RGF93CC46']},
        { Type:2506, TimeZone:null, projCode:['IGNF:RGF93CC47']},
        { Type:2507, TimeZone:null, projCode:['IGNF:RGF93CC48']},
        { Type:2508, TimeZone:null, projCode:['IGNF:RGF93CC49']},
        { Type:2509, TimeZone:null, projCode:['IGNF:RGF93CC50']},
        { Type:2012, TimeZone:null, projCode:['IGNF:GEOPORTALFXX']},
        { Type:2016, TimeZone:null, projCode:['IGNF:GEOPORTALANF']},
        { Type:2017, TimeZone:null, projCode:['IGNF:GEOPORTALGUF']},
        { Type:2018, TimeZone:null, projCode:['IGNF:GEOPORTALREU']},
        { Type:2019, TimeZone:null, projCode:['IGNF:GEOPORTALMYT']},
        { Type:2020, TimeZone:null, projCode:['IGNF:GEOPORTALSPM']},
        { Type:2021, TimeZone:null, projCode:['IGNF:GEOPORTALNCL']},
        { Type:2022, TimeZone:null, projCode:['IGNF:GEOPORTALWLF']},
        { Type:2023, TimeZone:null, projCode:['IGNF:GEOPORTALPYF']},
        { Type:2040, TimeZone:null, projCode:['IGNF:GEOPORTALCRZ']},
        { Type:2042, TimeZone:null, projCode:['IGNF:GEOPORTALKER']},
        { Type:5030, TimeZone:null, projCode:['IGNF:RGM04GEO']},
        { Type:5031, TimeZone:null, projCode:['IGNF:RGFG95GEO']}
    ],

    /**
     * APIProperty: separator
     * {String} field delimiter. Geoconcept currently only support TAB.
     *      Default is *\t*
     */
    separator: '\t',

    /**
     * APIProperty: typename
     * {String} Name of data type.
     *      Default is *null*
     */
    typename: null,

    /**
     * APIProperty: subTypename
     * {String} Name of feature's layer
     *      Default is *null*
     */
    subTypename: null,

    /**
     * APIProperty: format
     * {Integer} 1 for relative coordinates, 2 for absolutes coordinates.
     *      Default is *2*
     */
    format: 2,

    /**
     * APIProperty: unit
     * {String} linear unit of measure.
     *      Default is *m*
     */
    unit: 'm',

    /**
     * APIProperty: charset
     * {String} Character set (ANSI, DOS, MAC)
     *      Default is *ANSI*
     */
    charset: 'ANSI',

    /**
     * APIProperty: dimensions
     * {Integer} Coordinates' dimensions (2 or 3).
     *      Default is *2*
     */
    dimensions: 2,

    /**
     * APIProperty: extractAttributes
     * {Boolean} Extract attributes from GPX.
     *      Default is *true*
     */
    extractAttributes: true,

    /**
     * APIProperty: maxFeatures
     * {Integer} Maximum number of features to read when strictly positive.
     *      Default is *0*
     */
    maxFeatures: 0,

    /**
     * APIMethod: read
     * Read data from a string, and return a list of features.
     *
     * Parameters:
     * data - {String} data to read/parse.
     *
     * Returns:
     * {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)} An array of features.
     */
    read: function(data) {
        var features= [];
        var lines= data.split("\n");
        // Headers :
        var i, l, code, sep, str;
        for (i= 0, l= lines.length; i<l; i++) {
            var line= lines[i];
            if (line.charAt(0)=="/") {
                sep= lines[i].indexOf(" ");
                if (sep<0) {
                    code= line.substring(sep).replace("\r","");
                } else {
                    code= line.substring(0,sep);
                    str= line.substring(sep).replace("\r","");
                }
                switch (code) {
                case "//$DELIMITER"   :
                    /* //$DELIMITER "char*" */
                    break;
                case "//$SYSCOORD"    :
                    /* //$SYSCOORD {Type: int} [ ; { TimeZone: TimeZoneValue } ] */
                    var syscoord= parseInt(str.substring(str.indexOf(":")+1,str.indexOf("}")));
                    syscoord= this.findCRS(syscoord,'Type');
                    if (syscoord!=-1) {
                        this.externalProjection= new OpenLayers.Projection(this.SUPPORTED_CRSS[syscoord].projCode[0]);
                    }
                    break;
                case "//$FORMAT"      :
                    /* //$FORMAT 1|2 */
                    if (parseInt(str.substring(str.indexOf(":")+1).replace(/ /g,""))==1) {
                        this.format= 1;
                    }
                    break;
                case "//$UNIT"        :
                    /* //$UNIT Distance|Angle:char* */
                    this.unit= str.substring(str.indexOf(":")+1).replace(/ /g,"");
                    switch (str) {
                    case "Distance":
                        this.unit= this.unit || "m";
                        break;
                    case "Angle"   :
                        this.unit= this.unit || "d";
                        break;
                    default        :
                        this.unit= "m";
                        break;
                    }
                    break;
                case "//$QUOTED-TEXT" :
                    /* //$QUOTED-TEXT "char*" */
                    this.quoted= !(str.replace(/"/g,"")=="no");
                    break;
                case "//$CHARSET"     :
                    /* //$CHARSET char* */
                    this.charset= str.replace(/ /g,"");
                    break;
                case "//$3DOBJECT"    :
                    this.dimensions= 3;
                    break;
                case "//$FIELD"       :
                    /* //$FIELDS Class=char*;Subclass=char*;Kind=1..4;Fields=(Private#)?char*\s((Private#)?char*)* */
                    //TODO: schema processing ?
                    break;
                default               :
                    break;
                }
                continue;
            }

            // read features ...
            var feature= this.readFeature(line);
            if (feature) {
                // add new features to existing feature list
                features.push(feature);
                if (this.maxFeatures>0 && this.maxFeatures==features.length) { break; }
            } else {
                // TODO
            }
        }

        return features;
    },


    /**
     * APIMethod: readFeature
     * Build a feature from a Geoconcept's export line.
     *      Only points, lines and simple polygons are read.
     *
     * Parameters:
     * data - {String} data to read/parse.
     *
     * Returns:
     * {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     */
    readFeature: function(data) {
        var fs= data.split(this.separator);
        if (fs.length<7) { return null; }
        var attributes= this.parseAttributes(fs);
        var pos= parseInt(fs[4])+5;
        // Geometry
        var geometry;
        var x, y, z=null;
        x= parseFloat(fs[pos++]);
        y= parseFloat(fs[pos++]);
        if (this.dimensions==3) { z= parseFloat(data[pos++]); }
        // Point :
        if (fs.length < pos+1) {
            geometry= new OpenLayers.Geometry.Point(x, y);
            if (this.dimensions==3) { geometry.z= z; }
            geometry.transform(this.externalProjection, this.internalProjection);
            return new OpenLayers.Feature.Vector(geometry, attributes);
        }
        var isline= true;
        var nb= parseInt(fs[pos+2]);
        // Linear : skip last point ...
        if (nb*this.dimensions==fs.length-pos-3) {
            pos += 3;
        } else {
            nb= parseInt(data[pos++]);
            isline= false;
        }
        // reading ...
        var points= [];
        var p= new OpenLayers.Geometry.Point(x, y);
        if (this.dimensions==3) { p.z= z ; }
        points.push(p);
        points= this.readComponent(fs, points, pos, nb);
        if (isline) {
            geometry= new OpenLayers.Geometry.LineString(points);
        } else {
            var components= [];
            var ring= new OpenLayers.Geometry.LinearRing(points);
            components.push(ring);
            // TODO : multi-polygons ...
            geometry= new OpenLayers.Geometry.Polygon(components);
        }
        // transform
        geometry.transform(this.externalProjection, this.internalProjection);
        // Feature
        return new OpenLayers.Feature.Vector(geometry, attributes);
    },

    /**
     * Method: readComponent
     * Reads remaining geometry components if any ...
     *
     * Parameters:
     * cs - {Array({String})} geometry components to parse.
     * pts - {Array(<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>)}.
     * pos - {Integer} starting position.
     * nb - {Integer} total number of points.
     *
     * Returns:
     * {Array(<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>)}
     */
    readComponent: function(cs, pts, pos, nb) {
        var il= pos+this.dimensions*nb;
        if (il>data.length) { return pts; }
        for (var i= pos; i<il; i+=dim) {
            var p= new OpenLayers.Geometry.Point(parseFloat(data[i]), parseFloat(data[i+1]));
            if (this.dimensions==3) { p.z= parseFloat(data[i+2]); }
            pts.push(p);
        }
        return pts;
    },

    /**
     * Method: parseAttributes
     * Read the first 4 fields as 'id', 'type', 'stype' and 'name'.
     * Extracts user's fields if extractAttributes is true.
     *      The current implementation labels these attributes by prefixing
     *      the field's rank with 'att'.
     *      TODO: processing schema (See <read>).
     *
     * Parameters:
     * as - {Array({String})} data to read/parse.
     *
     * Returns:
     * {Object} An attributes object.
     */
    parseAttributes: function(as) {
        var attributes= {'id':as[0], 'type':as[1], 'stype':as[2], 'name':as[3] };
        var nb= parseInt(as[4]);
        var il= Math.min(as.length, nb);
        // users attributes :
        if (this.extractAttributes) {
            for (var i= 0; i<il; i++) {
                if (attributs.length<i) {
                    attributes[attributs[i]]= as[5+i];
                } else {
                    attributes['att'+i]= as[5+i];
                }
            }
        }
        return attributes;
    },

    /**
     * Method: write
     * Accept a features collection, and return a string.
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)}
     *
     * Returns:
     * {String}
     */
    write: function(features) {
        if(!(OpenLayers.Util.isArray(features))) {
            features= [features];
        }
        var gxt= '//$DELIMITER "tab"\n//$QUOTED-TEXT "no"\n//$CHARSET ANSI\n//$FORMAT 2\n//$UNIT ';
        // units :
        var projection= this.externalProjection;
        if (projection && projection instanceof OpenLayers.Projection) {
            if (projection.getProjName()=='longlat') {
                gxt += 'Angle:deg\n';
            } else {
                gxt += 'Distance:m\n';
            }
            // crs : only well-known crs are covered (See
            // GDAL/ogrsf_frmts/geoconcept/geoconcept_syscoord.c for a more
            // complete implementation) :
            gxt += this.writeCRS(projection);
        }
        // TODO : $FIELDS => sorting by features by uniq typename ...
        // features :
        for (var i= 0, l= features.length; i<l; i++) {
            gxt += this.writeFeature(features[i]);
        }
        return gxt;
    },

    /**
     * Method: writeCRS
     * Create the SysCoord string.
     *
     * Parameters:
     * projection - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     *
     * Returns:
     * {String}
     */
    writeCRS: function(projection) {
        var found= this.findCRS(projection.projCode);
        var gxt= '//$SYSCOORD {Type: ';
        if (found==-1) { // not found !
            gxt += '-1';
        } else {
            gxt += this.SUPPORTED_CRSS[found].Type;
            if (this.SUPPORTED_CRSS[found].TimeZone) {
                gxt += ', TimeZone: ' + this.SUPPORTED_CRSS[found].TimeZone;
            }
        }
        gxt += '}\n';
        return gxt;
    },

    /**
     * Method: writeFeature
     * Create a Geoconcept export string representing the given feature.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     *
     * Returns:
     * {String}
     */
    writeFeature: function(feature) {
        var gxt= '';
        // identifiant
        gxt += '-1'+this.separator;
        // type
        gxt += this.typename?
                this.typename
            :   feature.layer?
                feature.layer.name || feature.layer.CLASS_NAME
            :
                feature.CLASS_NAME;
        gxt += this.separator;
        // sstype
        gxt += this.subTypename ||
               feature.geometry.CLASS_NAME.substring(feature.geometry.CLASS_NAME.lastIndexOf(".")+1) + this.separator;
        // nom (name attribute)
        gxt += feature.attributes && feature.attributes.name?
                feature.attributes.name
            :   feature.layer && feature.layer.name?
                feature.layer.name
            :
                feature.CLASS_NAME;
        gxt += this.separator;
        // attributes
        gxt += this.writeAttributes(feature.fid||feature.id||'',feature.attributes);
        // la geometrie
        gxt += this.writeGeometry(feature.geometry);
        // fin
        return gxt + '\n';
    },

    /**
     * APIMethod: writeAttributes
     * Create a Geoconcept attributes string with the given attributes objet.
     *
     * Parameters:
     * id - {String} feature id, treated as the first attribute.
     * attributes - {Object}
     *
     * Returns:
     * {String}
     */
    writeAttributes: function(id,attributes) {
        var gxt= '';
        // attributes
        var nbatts= 1;
        if (attributes) {
            for(var fld in attributes) {
                nbatts++;
            }
        }
        gxt += nbatts + this.separator;
        // id as first attribute :
        gxt += id + this.separator;
        if (attributes) {
            for(var fld in attributes) {
                if (attributes.hasOwnProperty(fld)) {
                    gxt += attributes[fld]? attributes[fld].replace(/[\r\n]/g,"\\n") : '';
                    gxt += this.separator;
                }
            }
        }
        return gxt;
    },

    /**
     * APIMethod: writeGeometry
     * Create a Geoconcept geometry string with the given geometry.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     *
     * Returns:
     * {String}
     */
    writeGeometry: function(geometry) {
        geometry= geometry.clone();
        geometry.transform(this.internalProjection, this.externalProjection);
        var className= geometry.CLASS_NAME;
        var type= className.substring(className.lastIndexOf(".") + 1);
        var builder= this.buildGeometry[type.toLowerCase()];
        return builder.apply(this, [geometry]);
    },

    /**
     * Property: buildGeometry
     * Object containing methods to do the actual geometry building
     *     based on geometry type.
     */
    buildGeometry: {
        /**
         * Method: buildGeometry.point
         * Given an OpenLayers point geometry, create a Geoconcept point.
         *
         * Parameters:
         * geometry - {<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>} A point geometry.
         *
         * Returns:
         * {String}
         */
        point: function(geometry) {
            return this.buildCoordinates(geometry);
        },

        /**
         * Method: buildGeometry.multipoint
         * Given an OpenLayers multipoint geometry, create a Geoconcept multipoint.
         * Not supported.
         *
         * Parameters:
         * geometry - {<OpenLayers.Geometry.MultiPoint at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/MultiPoint-js.html>}
         * A multipoint geometry.
         *
         * Returns:
         * {String}
         */
        multipoint: function(geometry) {
            return null;
        },

        /**
         * Method: buildGeometry.linestring
         * Given an OpenLayers linestring geometry, create a Geoconcept linestring.
         *
         * Parameters:
         * geometry - {<OpenLayers.Geometry.LineString at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/LineString-js.html>}
         * A linestring geometry.
         *
         * Returns:
         * {String}
         */
        linestring: function(geometry) {
            return this.buildCoordinates(geometry);
        },

        /**
         * Method: buildGeometry.linearring
         * Given an OpenLayers linearring geometry, create a Geoconcept linearring.
         *      Not supported.
         *
         * Parameters:
         * geometry - {<OpenLayers.Geometry.LinearRing at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/LinearRing-js.html>}
         * A linearring geometry.
         *
         * Returns:
         * {String}
         */
        linearring: function(geometry) {
            return this.buildCoordinates(geometry, true);
        },

        /**
         * Method: buildGeometry.multilinestring
         * Given an OpenLayers multilinestring geometry, create a Geoconcept
         *     multilinestring.
         *     Not supported.
         *
         * Parameters:
         * geometry - {<OpenLayers.Geometry.MultiLineString at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/MultiLineString-js.html>}
         * A multilinestring geometry.
         *
         * Returns:
         * {String}
         */
        multilinestring: function(geometry) {
            return null;
        },

        /**
         * Method: buildGeometry.polygon
         * Given an OpenLayers polygon geometry, create a Geoconcept polygon.
         *      Not supported.
         *
         * Parameters:
         * geometry - {<OpenLayers.Geometry.Polygon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Polygon-js.html>} A polygon geometry.
         *
         * Returns:
         * {String}
         */
        polygon: function(geometry) {
            var gxt='';
            var rings= geometry.components;
            for(var i= 0, il= rings.length; i<il; ++i) {
                if (i>0) {
                    gxt += this.separator;
                }
                gxt= this.buildCoordinates(rings[i], true);
                // inner rings
                if (i==0) {
                    gxt += this.separator + (il-1) + this.separator;
                }
            }
            return gxt;
        },

        /**
         * Method: buildGeometry.multipolygon
         * Given an OpenLayers multipolygon geometry, create a Geoconcept multipolygon.
         *      Not supported.
         *
         * Parameters:
         * geometry - {<OpenLayers.Geometry.MultiPolygon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/MultiPolygon-js.html>}
         * A multipolygon geometry.
         *
         * Returns:
         * {String}
         */
        multipolygon: function(geometry) {
            var gxt = '';
            for (var i= 0, il= geometry.components.length; i<il; i++) {
                if (i>0) {
                    gxt += this.separator;
                }
                var className = geometry.componentTypes[i];
                var type = className.substring(className.lastIndexOf(".") + 1);
                var builder = this.buildGeometry[type.toLowerCase()];
                gxt += builder.apply(this, [geometry.components[i]]);
                if (i==0) {
                    gxt += this.separator + (il-1) + this.separator;
                }
            }
            return gxt;
        }
    },

    /**
     * Method: buildCoordinates
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     * isPolygon - {Boolean}
     *
     * Returns:
     * {String}
     */
    buildCoordinates: function(geometry, isPolygon) {
        var gxt;
        var points= geometry.components;
        if (points) {// LineString or LinearRing
            var nb= points.length;
            if (isPolygon) { nb--; }
            // 1st point
            gxt= points[0].x + this.separator + points[0].y + this.separator;
            // last point
            if (!isPolygon) { gxt += points[nb-1].x + this.separator + points[nb-1].y + this.separator; }
            // number of remaining points
            gxt += (nb-1);
            // other points
            for (var i= 1; i<nb; i++) {
                gxt += this.separator + points[i].x + this.separator + points[i].y;
            }
        } else {
            gxt= geometry.x + this.separator + geometry.y;
        }
        return gxt;
    },

    /**
     * Method: findCRS
     * Return the SysCoord index in the SUPPORTED_CRSS.
     *
     * Parameters:
     * val - {String | Integer} identification of the projection (code or
     *      numerical identifier).
     * key - {String} field to search (projCode or Type).
     *      Default *projCode*
     *
     * Returns:
     * {Index} the entry in SUPPORTED_CRSS or -1 if not found.
     */
    findCRS: function(val, key) {
        var found= -1;
        for (var i= 0, il= this.SUPPORTED_CRSS.length; i<il && found==-1; i++) {
            var sc= this.SUPPORTED_CRSS[i];
            switch (key) {
            case 'Type'    :
                if (sc.Type==val) {
                    found= i;
                }
                break;
            case 'projCode':
            default        :
                for (var j= 0, jl= sc.projCode.length; j<jl; j++) {
                    if (val==sc.projCode[j]) {
                        found= i;
                        break;
                    }
                }
                break;
            }
        }
        return found;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.Geoconcept"*
     */
    CLASS_NAME: "Geoportal.Format.Geoconcept"
});
