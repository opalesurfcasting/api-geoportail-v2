/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format/XLS/v1_1.js
 */
/**
 * Class: Geoportal.Format.XLS.v1_2
 * The Geoportal framework XML for Location Service support class.
 *      Superclass for XLS version 1.2.0 parsers.
 *
 * Differences between 1.2.0 and 1.1.0:
 *     - Address ADT changes : language attribute
 *     - Address ADT changes : allow 3-letter country codes
 *     - Address ADT changes : StreetAddressType : add an attribute named "locator" (the use of the BuildingLocator 
 *     element would be discouraged but would not be removed from the spec)
 *     - Address ADT changes : StreeNameType : the "43" in the documentation (e.g. 43 West 83rd. Street) should be removed
 *     - Address ADT changes : Place : add a new acceptable place name, "choume-banchi-go" to accomodate Japanese hierarchies 
 *     of the form 7-2-22 
 *     - Geocode request Type : add "returnFreeForm" Boolean attibute (this does not affect the addressing system of OpenLS,
 *     but is closely related)
 *     - Error codes : Existing Error code changes : RequestVersionMismatch (include value of version sent in request),
 *     ResponseVersionMismatch (removed), ValueNotRecognized (include value not recognized), OtherXML (removed)
 *     - Error codes : New Added Error codes : NoResultsReturned (the inputs were correct but didn't produce a result),
 *     TimedOut (the operation timed out on the server side), InternalServerError (an error has occured inside the server),
 *     DataNotAvailable (the server does not have data coverage)
 *
 * Inherits from:
 *  - <Geoportal.Format.XLS.v1_1>
 */
Geoportal.Format.XLS.v1_2=
    OpenLayers.Class( Geoportal.Format.XLS.v1_1, {

    /**
     * Constant: VERSION
     * {String} *"1.2"*
     */
    VERSION: "1.2",

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocation: "http://schemas.opengis.net/ols/1.2.0/XLS.xsd",

    /**
     * Constructor: Geoportal.Format.XLS.v1_2
     * Instances of this class are not created directly.  Use the
     *      <Geoportal.Format.XLS> constructor instead.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *      this instance.
     */
    initialize: function(options) {
        Geoportal.Format.XLS.v1_1.prototype.initialize.apply(this, [options]);
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
        "xls": OpenLayers.Util.applyDefaults({
            "Address": function(node, obj) {
                var address= new Geoportal.OLS.Address();
                address.countryCode= node.getAttribute("countryCode");//mandatory
                address.addressee= node.getAttribute("addressee");//optional
                address.language= node.getAttribute("language");//optional
                this.readChildNodes(node, address);
                if (obj.addAddress) {
                    obj.addAddress(address);
                } else {
                    obj.address= address;
                }
            },
            "StreetAddress": function(node, address) {
                var sa= new Geoportal.OLS.StreetAddress();
                sa.locator = node.getAttribute("locator");//optional
                address.streetAddress= sa;
                this.readChildNodes(node, sa);
            }
        }, Geoportal.Format.XLS.v1_1.prototype.readers["xls"]),
        "gml": Geoportal.Format.XLS.v1_1.prototype.readers["gml"]
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "xls": OpenLayers.Util.applyDefaults({
            "Address": function(a) {
                var node= this.createElementNSPlus("xls:Address");
                node.setAttribute('countryCode', a.countryCode);
                if (a.addressee!=null) {
                    node.setAttribute('addressee', a.addressee);
                }
                if (a.language!=null) {
                    node.setAttribute('language', a.language);
                }
                if (a.name!=null) {
                    this.writeNode('xls:freeFormAddress', a, node);
                    for (var i= 0, len= a.getNbPlaces(); i<len; i++) {
                        this.writeNode('xls:Place', a.getPlaces()[i], node);
                    }
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
                if (a.restrictedExtent) {
                    var envelopNode = this.createElementNSPlus("gml:envelope");
                    this.writeNode('gml:pos', {x:a.restrictedExtent.left,y:a.restrictedExtent.bottom}, envelopNode);
                    this.writeNode('gml:pos', {x:a.restrictedExtent.right,y:a.restrictedExtent.top}, envelopNode);
                    node.appendChild(envelopNode);
                }
                return node;
            },
            "StreetAddress": function(sa) {
                var node= this.createElementNSPlus("xls:StreetAddress");
                if (sa.locator!=null){
                    node.setAttribute('locator', sa.locator);
                }
                if (sa._streetLocation) {
                    var obj= sa._streetLocation;
                    this.writeNode(this.getNodeName(obj), obj, node);
                }
                for (var i= 0, len= sa.getNbStreets(); i<len; i++) {
                    this.writeNode('xls:Street', sa.getStreets()[i], node);
                }
                return node;
            }}, Geoportal.Format.XLS.v1_1.prototype.writers["xls"]),
        "gml": OpenLayers.Util.applyDefaults({
            "pos": function(point) {
                var pos = (this.gmlParser.xy) ?
                    (point.x + " " + point.y) : (point.y + " " + point.x);
                return this.createElementNSPlus("gml:pos", {
                    value: pos
                });
            }
        },Geoportal.Format.XLS.v1_1.prototype.writers["gml"])
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.XLS.v1_2"*
     */
    CLASS_NAME:"Geoportal.Format.XLS.v1_2"
});
