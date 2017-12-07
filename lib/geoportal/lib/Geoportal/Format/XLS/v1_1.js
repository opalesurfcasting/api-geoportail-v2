/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/XLS.js
 * @requires Geoportal/OLS/XLS.js
 * @requires Geoportal/OLS/ResponseHeader.js
 * @requires Geoportal/OLS/ErrorList.js
 * @requires Geoportal/OLS/Error.js
 * @requires Geoportal/OLS/Response.js
 */
/**
 * Class: Geoportal.Format.XLS.v1_1
 * The Geoportal framework XML for Location Service support class.
 *      Superclass for XLS version 1.1.0 parsers.
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/XML-js.html>
 */
Geoportal.Format.XLS.v1_1=
    OpenLayers.Class( OpenLayers.Format.XML, {

    /**
     * Constant: VERSION
     * {String} *"1.1"*
     */
    VERSION: "1.1",

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        xls: "http://www.opengis.net/xls",
        sch: "http://www.ascc.net/xml/schematron",
        gml: "http://www.opengis.net/gml",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "xls",

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocation: "http://schemas.opengis.net/ols/1.1.0/XLS.xsd",

    /**
     * APIProperty: lang
     * {String} Specify the prefered language for representing messages.
     */
    lang: null,

    /**
     * Property: gmlParser
     * {Object} Instance of <OpenLayers.Format.GML at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/GML-js.html> parser.
     *      Cached for multiple write/read calls.
     */
    gmlParser: null,

    /**
     * Constructor: Geoportal.Format.XLS.v1_1
     * Instances of this class are not created directly.  Use the
     *      <Geoportal.Format.XLS> constructor instead.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *      this instance.
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
        this.gmlParser= new OpenLayers.Format.GML(
            {
                externalProjection: this.externalProjection.clone(),
                extractAttributes: false,
                xy: false
            }
        );
        //override point builder as OpenLS ask for gml:pos only :
        this.gmlParser.buildGeometry.point= function(geometry) {
            var gml= this.createElementNS(this.gmlns, "gml:Point");
            var posNode= this.createElementNS(this.gmlns, "gml:pos");
            var txt;
            if (this.xy) {
                txt= geometry.x + " " + geometry.y;
            } else {
                txt= geometry.y + " " + geometry.x;
            }
            var txtNode= this.createTextNode(txt);
            posNode.appendChild(txtNode);
            gml.appendChild(posNode);
            return gml;
        };
    },

    /**
     * Method: read
     *
     * Parameters:
     * data - {DOMElement} A XML Location Service element.
     *
     * Returns:
     * {<Geoportal.OLS.XLS>} An open location service object or null if errors occur.
     */
    read: function(data) {
        var ols= new Geoportal.OLS.XLS({version:this.version||this.VERSION});
        var xls= this.readers.xls["XLS"].apply(this, [data, ols]);
        if (!xls) {
            ols.destroy();
            ols= null;
        }
        return ols;
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
        "xls": {
            "XLS": function(node, obj) {
                //FIXME: check version attribute ?
                obj.version= node.getAttribute("version") || this.VERSION;//mandatory
                obj.lang= node.getAttribute("lang"); //optional
                this.readChildNodes(node,obj);
                if (!obj._header) {
                    OpenLayers.Console.error(OpenLayers.i18n('Not.conformal.XLS',{part:'Header'}));
                    return null;
                }
                if (obj._header.errorList && obj._header.errorList.getNbErrors() > 0) {
                    this.reportError(obj._header.errorList);
                    return null;
                }
                if (!obj._body) {
                    OpenLayers.Console.error(OpenLayers.i18n('Not.conformal.XLS',{part:'Body'}));
                    return null;
                }
                var len= obj.getNbBodies();
                if (len>0) {
                    var bds= obj.getBodies();
                    for (var i= 0; i<len; i++) {
                        if (bds[i].errorList && bds[i].errorList.getNbErrors() > 0) {
                            this.reportError(bds[i].errorList);
                        }
                    }
                }
                return obj;
            },
            "ResponseHeader": function(node, obj) {
                var rh= new Geoportal.OLS.ResponseHeader();
                rh.sessionID= node.getAttribute("sessionID");//optional
                obj._header= rh;
                this.readChildNodes(node, rh);
            },
            "ErrorList": function(node, obj) {
                var el= new Geoportal.OLS.ErrorList();
                el.highestSeverity= node.getAttribute("highestSeverity");//default: "Warning"
                obj.errorList= el;
                this.readChildNodes(node, el);
            },
            "Error": function(node, el) {
                var error= new Geoportal.OLS.Error();
                error.errorCode= node.getAttribute("errorCode");//mandatory
                error.severity= node.getAttribute("severity");//default: "Warning"
                error.locationID= node.getAttribute("locationID");//optional
                error.locationPath= node.getAttribute("locationPath");//optional
                error.message= node.getAttribute("message");//optional
                el.addError(error);
            },
            "Response": function(node, obj) {
                var resp= new Geoportal.OLS.Response();
                resp.version= node.getAttribute("version") || this.VERSION;//mandatory FIXME
                resp.requestID= node.getAttribute("requestID");//mandatory
                resp.numberOfResponses= parseInt(node.getAttribute("numberOfResponses"));//optional
                if (isNaN(resp.numberOfResponses)) {
                    resp.numberOfResponses= null;
                }
                obj.addBody(resp);
                // next step of parsing depends upon the first node
                // encountered :
                this.readChildNodes(node, resp);
            },
            "Address": function(node, obj) {
                var address= new Geoportal.OLS.Address();
                address.countryCode= node.getAttribute("countryCode");//mandatory
                address.addressee= node.getAttribute("addressee");//optional
                this.readChildNodes(node, address);
                if (obj.addAddress) {
                    obj.addAddress(address);
                } else {
                    obj.address= address;
                }
            },
            "GeocodeMatchCode": function(node, geocodedaddress) {
                var gmc= new Geoportal.OLS.GeocodeMatchCode();
                gmc.accuracy= parseFloat(node.getAttribute("accuracy"));//optional
                if (isNaN(gmc.accuracy)) {
                    gmc.accuracy= null;
                }
                gmc.matchType= node.getAttribute("matchType");//optional
                geocodedaddress.geocodeMatchCode= gmc;
            },
            "SearchCentreDistance": function(node, revgeocoderesp) {
                var scd= new Geoportal.OLS.UOM.Distance();
                scd.value= parseFloat(node.getAttribute("value"));//required
                if (isNaN(scd.value)) {
                    scd.value= 0.0;
                }
                scd.accuracy= parseFloat(node.getAttribute("accuracy"));//optional
                if (isNaN(scd.accuracy)) {
                    scd.accuracy= null;
                }
                var uom = node.getAttribute("uom");//optional
                if (uom) {
                    scd.uom= uom;
                }
                revgeocoderesp.measure= scd;
            },
            "freeFormAddress": function(node, address) {
                address.name= node.childNodes.length>0?
                    node.childNodes[0].nodeValue
                :   "";
            },
            "StreetAddress": function(node, address) {
                var sa= new Geoportal.OLS.StreetAddress();
                address.streetAddress= sa;
                this.readChildNodes(node, sa);
            },
            "Place": function(node, address) {
                var place= new Geoportal.OLS.Place();
                place.classification= node.getAttribute("type");//mandatory
                place.name= node.childNodes.length>0?
                    node.childNodes[0].nodeValue
                :   "";
                address.addPlace(place);
            },
            "PostalCode": function(node, address) {
                var npc= node.childNodes.length>0?
                    node.childNodes[0].nodeValue
                :   "";
                var pc= new Geoportal.OLS.PostalCode({name: npc});
                address.postalCode= pc;
            },
            "Building": function(node, address) {
                var building= new Geoportal.OLS.Building();
                building.num= node.getAttribute("number");//optional
                building.subdivision= node.getAttribute("subdivision");//optional
                building.name= node.getAttribute("buildingName");//optional
                address.setStreetLocation(building);
            },
            "Street": function(node, address) {
                var street= new Geoportal.OLS.Street();
                street.directionalPrefix= node.getAttribute("directionalPrefix");//optional
                street.typePrefix= node.getAttribute("typePrefix");//optional
                street.officialName= node.getAttribute("officialName");//optional
                street.typeSuffix= node.getAttribute("typeSuffix");//optional
                street.directionalSuffix= node.getAttribute("directionalSuffix");//optional
                street.muniOctant= node.getAttribute("muniOctant");//optional
                street.name= node.childNodes.length>0?
                    node.childNodes[0].nodeValue
                :   "";
                address.addStreet(street);
            },
            "RequestHeader": function(node, obj) {
                var rh= new Geoportal.OLS.RequestHeader();
                rh.clientName= node.getAttribute("clientName");//optional
                rh.clientPassword= node.getAttribute("clientPassword");//optional
                rh.sessionID= node.getAttribute("sessionID");//optional
                rh.srsName= node.getAttribute("srsName");//optional
                rh.MSID= node.getAttribute("MSID");//optional
                obj._header= rh;
            },
            "Request": function(node, obj) {
                var rqst= new Geoportal.OLS.Request();
                rqst.methodName= node.getAttribute("methodName");//mandatory
                rqst.version= node.getAttribute("version") || this.VERSION;//mandatory FIXME
                rqst.requestID= node.getAttribute("requestID");//mandatory
                rqst.maximumResponses= parseInt(node.getAttribute("maximumResponses"));//optional
                if (isNaN(rqst.maximumResponses)) {
                    rqst.maximumResponses= null;
                }
                obj.addBody(rqst);
                this.readChildNodes(node, rqst);
            },
            "Position": function(node, rgr) {
                var pos= new Geoportal.OLS.Position();
                rgr.position= pos;
                this.readChildNodes(node, pos);
            },
            "Ellipse": function(node, pos) {
            },
            "CircularArc": function(node, pos) {
            },
            "QoP": function(node, pos) {
                var qop= new Geoportal.OLS.QualityOfPosition();
                qop.responseReq= node.getAttribute("responseReq");//optional
                qop.responseTimer= node.getAttribute("responseTimer");//optional
                pos.qop= qop;
                this.readChildNodes(node, qop);
            },
            "Time": function(node, pos) {
                var tm= new Geoportal.OLS.UOM.Time();
                tm.begin= node.getAttribute("begin");//required
                tm.duration= node.getAttribute("duration");//optional
                tm.utcOffset= parseInt(node.getAttribute("utcOffset"));//optional
                if (isNaN(tm.utcOffset)) {
                    tm.utcOffset= null;
                }
                pos.time= tm;
            },
            "Speed": function(node, pos) {
                var sp= new Geoportal.OLS.UOM.Speed();
                sp.value= parseFloat(node.getAttribute("value"));//required
                if (isNaN(sp.value)) {
                    sp.value= 0.0;
                }
                sp.accuracy= parseFloat(node.getAttribute("accuracy"));//optional
                if (isNaN(sp.accuracy)) {
                    sp.accuracy= null;
                }
                sp.uom= node.getAttribute("uom");//optional
                pos.speed= sp;
            },
            "Direction": function(node, pos) {
                var dr= new Geoportal.OLS.UOM.Angle();
                dr.value= parseFloat(node.getAttribute("value"));//required
                if (isNaN(dr.value)) {
                    dr.value= 0.0;
                }
                dr.accuracy= parseFloat(node.getAttribute("accuracy"));//optional
                if (isNaN(dr.accuracy)) {
                    dr.accuracy= null;
                }
                dr.uom= node.getAttribute("uom");//optional
                pos.direction= dr;
            },
            "HorizontalAcc": function(node, qop) {
                var ha= new Geoportal.OLS.HorizontalAcc();
                qop.hAccuracy= ha;
                this.readChildNodes(node, ha);
            },
            "VerticalAcc": function(node, qop) {
                var va= new Geoportal.OLS.VerticalAcc();
                qop.vAccuracy= va;
                this.readChildNodes(node, va);
            },
            "Distance": function(node, obj) {
                var d= new Geoportal.OLS.UOM.Distance();
                d.value= parseFloat(node.getAttribute("value"));//required
                if (isNaN(d.value)) {
                    d.value= 0.0;
                }
                d.accuracy= parseFloat(node.getAttribute("accuracy"));//optional
                if (isNaN(d.accuracy)) {
                    d.accuracy= null;
                }
                d.uom= node.getAttribute("uom");//optional
                if (obj.setAccuracy) {
                    obj.setAccuracy(d);
                } else {
                    obj.distance= d;
                }
            },
            "Angle": function(node, obj) {
                var a= new Geoportal.OLS.UOM.Angle();
                a.value= parseFloat(node.getAttribute("value"));//required
                if (isNaN(a.value)) {
                    a.value= 0.0;
                }
                a.accuracy= parseFloat(node.getAttribute("accuracy"));//optional
                if (isNaN(a.accuracy)) {
                    a.accuracy= null;
                }
                a.uom= node.getAttribute("uom");//optional
                if (obj.setAccuracy) {
                    obj.setAccuracy(a);
                } else {
                    obj.angle= a;
                }
            }
        },
        "gml": {
            "Point": function(node, obj) {
                var point= this.gmlParser.parseGeometry.point.apply(this.gmlParser,[node]);
                if (point) {
                    point.transform(this.externalProjection, this.internalProjection);
                    obj.lonlat= point;
                }
            },
            "CircleByCenterPoint": function(node, obj) {
            },
            "Polygon": function(node, obj) {
            },
            "MultiPolygon": function(node, obj) {
            }
        }
    },

    /**
     * Method: write
     *
     * Parameters:
     * xls - {<Geoportal.XLS>} A XLS object.
     *
     * Returns:
     * {DOMElement} An xls:XLS element.
     */
    write: function(xls) {
        var obj= xls.CLASS_NAME.split('.').pop();
        return this.writers.xls[obj].apply(this, [xls]);
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "xls": {
            "XLS": function(xls) {
                var atts= { attributes: {}};
                if (xls.version) {
                    OpenLayers.Util.extend(atts.attributes,{'version': xls.version});
                }
                if (xls.lang) {
                    OpenLayers.Util.extend(atts.attributes,{'lang': xls.lang});
                }
                var node= this.createElementNSPlus("xls:XLS", atts);
                var obj= xls._header;
                this.writeNode(this.getNodeName(obj), obj, node);
                for (var i= 0, len= xls.getNbBodies(); i<len; i++) {
                    obj= xls.getBodies()[i];
                    this.writeNode(this.getNodeName(obj), obj, node);
                }
                return node;
            },
            "ResponseHeader": function(rh) {
                var node= this.createElementNSPlus("xls:ResponseHeader");
                if (rh.sessionID) {
                    node.setAttribute('sessionID', rh.sessionID);
                }
                if (rh.errorList) {
                    this.writeNode('ErrorList', rh.errorList, node);
                }
                return node;
            },
            "ErrorList": function(el) {
                var node= this.createElementNSPlus("xls:ErrorList");
                if (el.highestSeverity!=null) {
                    node.setAttribute('highestSeverity', el.highestSeverity);
                }
                for (var i= 0, len= el.getNbErrors(); i<len; i++) {
                    var obj= el.getErrors()[i];
                    this.writeNode(this.getNodeName(obj), obj, node);
                }
                return node;
            },
            "Error": function(e) {
                var atts= {attributes:{}};
                if (e.errorCode!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'errorCode': e.errorCode});
                }
                if (e.severity!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'severity': e.severity});
                }
                if (e.locationID!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'locationID': e.locationID});
                }
                if (e.locationPath!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'locationPath': e.locationPath});
                }
                if (e.message!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'message': e.message});
                }
                var node= this.createElementNSPlus("xls:Error", atts);
                return node;
            },
            "Response": function(r) {
                var node= this.createElementNSPlus("xls:Response",
                            {
                                attributes:{
                                    'version': r.version,
                                    'requestID': r.requestID
                                }
                            });
                if (typeof(r.numberOfResponses)=='number' && !isNaN(r.numberOfResponses)) {
                    node.setAttribute('numberOfResponses', r.numberOfResponses);
                }
                if (r.errorList) {
                    this.writeNode('ErrorList', r.errorList, node);
                }
                if (r.getResponseParameters()) {
                    var obj= r.getResponseParameters();
                    this.writeNode(this.getNodeName(obj), obj, node);
                }
                return node;
            },
            "Address": function(a) {
                var node= this.createElementNSPlus("xls:Address");
                node.setAttribute('countryCode', a.countryCode);
                if (a.addressee!=null) {
                    node.setAttribute('addressee', a.addressee);
                }
                if (a.name!=null) {
                    this.writeNode('xls:freeFormAddress', a, node);
                } else {
                    if (a.streetAddress) {
                        this.writeNode('xls:StreetAddress', a.streetAddress, node);
                    }
                    for (var i= 0, len= a.getNbPlaces(); i<len; i++) {
                        this.writeNode('xls:Place', a.getPlaces()[i], node);
                    }
                    if (a.postalCode) {
                        this.writeNode('xls:PostalCode', a.postalCode, node);
                    }
                }
                return node;
            },
            "GeocodeMatchCode": function(gmc) {
                var node= this.createElementNSPlus("xls:GeocodeMatchCode");
                if (typeof(gmc.accuracy)=='number' && !isNaN(gmc.accuracy)) {
                    node.setAttribute('accuracy', gmc.accuracy);
                }
                if (gmc.matchType!=null) {
                    node.setAttribute('matchCode', gmc.matchType);
                }
                return node;
            },
            "freeFormAddress": function(a) {
                var node= this.createElementNSPlus("xls:freeFormAddress",{value: a.name});
                return node;
            },
            "StreetAddress": function(sa) {
                var node= this.createElementNSPlus("xls:StreetAddress");
                if (sa._streetLocation) {
                    var obj= sa._streetLocation;
                    this.writeNode(this.getNodeName(obj), obj, node);
                }
                for (var i= 0, len= sa.getNbStreets(); i<len; i++) {
                    this.writeNode('xls:Street', sa.getStreets()[i], node);
                }
                return node;
            },
            "Place": function(p) {
                var node= this.createElementNSPlus("xls:Place",
                        {
                            attributes:{
                                'type': p.classification
                            },
                            value: p.name
                        });
                return node;
            },
            "PostalCode": function(pc) {
                var node= this.createElementNSPlus("xls:PostalCode",
                        {
                            value: pc.name
                        });
                return node;
            },
            "Building": function(b) {
                var atts= {attributes:{}};
                if (b.num!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'number': b.num});
                }
                if (b.subdivision!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'subdivision': b.subdivision});
                }
                if (b.name!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'buildingName': b.name});
                }
                var node= this.createElementNSPlus("xls:Building", atts);
                return node;
            },
            "Street": function(s) {
                var atts= {attributes:{}};
                if (s.directionalPrefix!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'directionalPrefix': s.directionalPrefix});
                }
                if (s.typePrefix!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'typePrefix': s.typePrefix});
                }
                if (s.officialName!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'officialName': s.officialName});
                }
                if (s.typeSuffix!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'typeSuffix': s.typeSuffix});
                }
                if (s.directionalSuffix!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'directionalSuffix': s.directionalSuffix});
                }
                if (s.muniOctant!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'muniOctant': s.muniOctant});
                }
                if (s.name!=null) {
                    atts.value= s.name;
                }
                var node= this.createElementNSPlus("xls:Street", atts);
                return node;
            },
            "RequestHeader": function(rh) {
                var atts= {attributes:{}};
                if (rh.clientName!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'clientName': rh.clientName});
                }
                if (rh.clientPassword!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'clientPassword': rh.clientPassword});
                }
                if (rh.sessionID!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'sessionID': rh.sessionID});
                }
                if (rh.srsName!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'srsName': rh.srsName});
                }
                if (rh.MSID!=null) {
                    OpenLayers.Util.extend(atts.attributes,{'MSID': rh.MSID});
                }
                var node= this.createElementNSPlus("xls:RequestHeader", atts);
                return node;
            },
            "Request": function(rqst) {
                var node= this.createElementNSPlus("xls:Request",
                            {
                                attributes: {
                                    'methodName': rqst.methodName,
                                    'version': rqst.version,
                                    'requestID': rqst.requestID
                                }
                            });
                if (typeof(rqst.maximumResponses)=='number' && !isNaN(rqst.maximumResponses)) {
                    node.setAttribute('maximumResponses', rqst.maximumResponses);
                }
                if (rqst.getRequestParameters()) {
                    var obj= rqst.getRequestParameters();
                    this.writeNode(this.getNodeName(obj), obj, node);
                }
                return node;
            },
            "Position": function(pos) {
                var node= this.createElementNSPlus("xls:Position");
                if (pos.levelOfConf!=null) {
                    node.setAttribute('levelOfConf', pos.levelOfConf);
                }
                this.writeNode('gml:Point', pos.lonlat, node);
                if (pos.qop) {
                    this.writeNode('xls:QoP', pos.qop, node);
                }
                if (pos.time) {
                    this.writeNode('xls:Time', pos.time, node);
                }
                if (pos.speed) {
                    this.writeNode('xls:Speed', pos.speed, node);
                }
                if (pos.direction) {
                    this.writeNode('xls:Direction', pos.direction, node);
                }
                if (pos._aoi) {
                    var gml= pos._aoi.radius? 'gml:CircleByCenterPoint' : 'gml:Polygon';
                    this.writeNode(gml, pos._aoi, node);
                }
                return node;
            },
            "Ellipse": function(e) {
                return this.createCommentNode('xls:Ellipse : not yet supported');
            },
            "CircularArc": function(ca) {
                return this.createCommentNode('xls:CircularArc : not yet supported');
            },
            "QoP": function(qop) {
                var node= this.createElementNSPlus("xls:QoP");
                if (qop.responseReq!=null) {
                    node.setAttribute('responseReq', qop.responseReq);
                }
                if (qop.responseTimer!=null) {
                    node.setAttribute('responseTimer', qop.responseTimer);
                }
                this.writeNode('xls:HorizontalAcc', qop.hAccuracy, node);
                this.writeNode('xls:VerticalAcc', qop.vAccuracy, node);
                return node;
            },
            "Time": function(tm) {
                var node= this.createElementNSPlus("xls:Time",{attributes:{'begin': tm.begin}});
                if (tm.duration!=null) {
                    node.setAttribute('duration', tm.duration);
                }
                if (typeof(tm.utcOffset)=='number' && !isNaN(tm.utcOffset)) {
                    node.setAttribute('utcOffset', tm.utcOffset);
                }
                return node;
            },
            "Speed": function(sp) {
                var node= this.createElementNSPlus("xls:Speed",{attributes:{'value': sp.value}});
                if (sp.accuracy) {
                    node.setAttribute('accuracy', sp.accuracy);
                }
                if (sp.uom) {
                    node.setAttribute('uom', sp.uom);
                }
                return node;
            },
            "Direction": function(dr) {
                var node= this.createElementNSPlus("xls:Direction",{attributes:{'value': dr.value}});
                if (dr.accuracy) {
                    node.setAttribute('accuracy', dr.accuracy);
                }
                if (dr.uom) {
                    node.setAttribute('uom', dr.uom);
                }
                return node;
            },
            "HorizontalAcc": function(ha) {
                var node= this.createElementNSPlus("xls:HorizontalAcc");
                var obj= ha._doa;
                this.writeNode(this.getNodeName(obj), obj, node);
                return node;
            },
            "VerticalAcc": function(va) {
                var node= this.createElementNSPlus("xls:VerticalAcc");
                this.writeNode('xls:Distance', va.distance, node);
                return node;
            },
            "Distance": function(d) {
                var node= this.createElementNSPlus("xls:Distance",{attributes:{'value': d.value}});
                if (d.accuracy) {
                    node.setAttribute('accuracy', d.accuracy);
                }
                if (d.uom) {
                    node.setAttribute('uom', d.uom);
                }
                return node;
            },
            "Angle": function(a) {
                var node= this.createElementNSPlus("xls:Angle",{attributes:{'value': a.value}});
                if (a.accuracy) {
                    node.setAttribute('accuracy', a.accuracy);
                }
                if (a.uom) {
                    node.setAttribute('uom', a.uom);
                }
                return node;
            }
        },
        "gml": {
            "Point": function(p) {
                var node= this.gmlParser.buildGeometryNode.apply(this.gmlParser,[p]);
                return node;
            },
            "CircleByCenterPoint": function(c) {
                var node= this.createElementNSPlus("gml:CircleByCenterPoint");
                this.writeNode('gml:pos', {x:c.center.lon,y:c.center.lat}, node);
                var radiusNode = this.createElementNSPlus("gml:radius",{value: c.radius});
                node.appendChild(radiusNode);
                return node;
            },
            "Polygon": function(p) {
                var f= new OpenLayers.Format.GML.v3({xy: false, defaultPrefix: null});
                f.writers.gml.LinearRing= function(ring) {
                    var node= this.createElementNSPlus("gml:LinearRing");
                    var points= ring.components;
                    for(var i= 0, len= points.length; i<len; ++i) {
                        var point= points[i];
                        this.writeNode('gml:pos', point, node);
                    }
                    return node;
                };
                var node= f.writers.gml.Polygon.apply(f,[p]);
                return node;
            },
            "MultiPolygon": function(mp) {
                return this.createCommentNode('gml:MultiPolygon : not yet supported');
            }
        }
    },

    /**
     * Method: reportError
     * Display Open Location service error messages.
     *
     * Parameters:
     * errorList - {<Geoportal.OLS.ErrorList>})} list of {<Geoportal.OLS.Error>}.
     */
    reportError: function(errorList) {
        var errors= errorList.getErrors();
        for (var i= 0, len= errors.length; i<len; i++) {
            var e= errors[i];
            var msg=
                'XLS ('+(errorList.highestSeverity!=null? errorList.highestSeverity:"Warning")+') : ['+
                e.errorCode+
                (e.locationID? ','+e.locationID:'')+
                (e.locationPath? ','+e.locationPath:'')+
                (e.message? ','+e.message:'')+
                ']';
            if (e.severity && e.severity!="Warning") {
                OpenLayers.Console.error(msg);
            } else {
                OpenLayers.Console.warn(msg);
            }
        }
    },

    /**
     * Method: getNodeName
     * Return the node name associated with the CLASS_NAME string.
     *
     * Parameters:
     * obj - {Geoportal.OLS}
     *
     * Returns:
     * {String} the XLS node name.
     */
    getNodeName: function(obj) {
        return obj.CLASS_NAME.split('.').pop();
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.XLS.v1_1"*
     */
    CLASS_NAME:"Geoportal.Format.XLS.v1_1"
});
