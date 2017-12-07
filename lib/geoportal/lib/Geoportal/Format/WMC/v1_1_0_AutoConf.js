/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/Format/WMC.js
 */
/**
 * Class: Geoportal.Format.WMC.v1_1_0_AutoConf
 * Read and write WMC version 1.1.0.
 *
 * Inherits from:
 *  - <Geoportal.Format.WMC>
 *  - <OpenLayers.Format.WMC.v1_1_0>
 */
Geoportal.Format.WMC.v1_1_0_AutoConf= OpenLayers.Class(Geoportal.Format.WMC, OpenLayers.Format.WMC.v1_1_0, {

    /**
     * APIProperty: profile
     * {String} If provided, use a custom profile.
     */
    profile: "AutoConf",

    /**
     * Property: schemaLocation
     * {String} http://www.opengis.net/context
     *     http://schemas.opengis.net/context/1.1.0/context.xsd
     */
    schemaLocation: "http://www.opengis.net/context http://schemas.opengis.net/context/1.1.0/context.xsd",

    /**
     * Constructor: Geoportal.Format.WMC.v1_1_0_AutoConf
     * Create a new parser for Geoportal Context document.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.WMC.v1_1_0.prototype.initialize.apply(
            this, [options]
        );
    },

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        ol: "http://openlayers.org/context",
        wmc: "http://www.opengis.net/context",
        sld: "http://www.opengis.net/sld",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        wmts:"http://www.opengis.net/wmts/1.0",
        gpp: "http://api.ign.fr/geoportail"
    },

    /**
     * Property: servicesMap
     * {Object} Mapping of service values (OGC:WMS, etc ...) to classes
     *      (<OpenLayers.Layer.WMS>, etc ...).
     */
    servicesMap: {
        "OGC:WMTS" : OpenLayers.Layer.WMTS,
        "OGC:WFS"  : OpenLayers.Layer.WFS
    },

    /**
     * Method: read_gpp_General
     * Extension for context:Extension
     *
     * Parameters:
     * context - {Object} An object representing a context.
     * node - {Element} An element node.
     */
    read_gpp_General: function(context, node) {
        context.generalOptions= {};
        this.runChildNodes(context.generalOptions, node);
    },

    /**
     * Method: read_gpp_Theme
     * Theme for the viewer
     *
     * Parameters:
     * generalOptions - {Object} An object representing a context.
     * node - {Element} An element node.
     */
    read_gpp_Theme: function(generalOptions, node) {
        generalOptions.theme= OpenLayers.String.trim(this.getChildValue(node));
    },

    /**
     * Method: read_gpp_Territory
     * Territory definition
     *
     * Parameters:
     * territories - {Array({Object})} the array of territories.
     * node - {Element} An element node.
     */
    read_gpp_Territory: function(territories, node) {
        var territory= {};
        territory.name= node.getAttribute("name");
        territory.id= node.getAttribute("id");
        var isDefault= node.getAttribute("default");
        territory.isDefault= (isDefault=="1" || isDefault=="true")? true:false;
        this.runChildNodes(territory, node);
        territories.push(territory);
    },

    /**
     * Method: read_gpp_Territories
     * Load territories of the viewer
     *
     * Parameters:
     * generalOptions - {Object} An object representing a context.
     * node - {Element} An element node.
     */
    read_gpp_Territories: function(generalOptions, node) {
        generalOptions.territories= [];
        this.runChildNodes(generalOptions.territories, node);
    },

    /**
     * Method: read_gpp_TileMatrixSets
     * Default pyramid of the viewer
     *
     * Parameters:
     * generalOptions - {Object} An object representing a context.
     * node - {Element} An element node.
     */
    read_gpp_TileMatrixSets: function(generalOptions, node) {
        var wmts= new OpenLayers.Format.WMTSCapabilities.v1_0_0({
            namespaces: {
                ows  : "http://www.opengis.net/ows/1.1",
                wmts : "http://www.opengis.net/wmts/1.0",
                xlink: "http://www.w3.org/1999/xlink"
            }
        });
        var obj= {
            layers: {},
            tileMatrixSets: {}
        };
        var tmp= wmts.readChildNodes(node,obj);
        generalOptions.tileMatrixSets= tmp.tileMatrixSets;
    },

    /**
     * Method: read_gpp_Resolutions
     * Array of geographical resolutions of the viewer
     *
     * Parameters:
     * generalOptions - {Object} An object representing a context.
     * node - {Element} An element node.
     */
    read_gpp_Resolutions: function(generalOptions, node) {
        generalOptions.resolutions= [];
        var tab= OpenLayers.String.trim(this.getChildValue(node)).split(",");
        for (var x in tab) {
            if (tab.hasOwnProperty(x)) {
                generalOptions.resolutions.push(parseFloat(OpenLayers.String.trim(tab[x])));
            }
        }
    },

    /**
     * Method : read_gpp_Services
     * Read a list of services
     *
     * Parameters:
     * context - {Object} An object representing a context.
     * node - {Element} An element node.
     */
    read_gpp_Services: function(context, node) {
        context.services= {};
        this.runChildNodes(context.services, node);
    },

    /**
     * Method: read_wmc_Server
     * IGNF: _addition of service attribute_
     *
     * Parameters:
     * obj - {Object} An object.
     * node - {Element} An element node.
     */
    read_wmc_Server: function(obj, node) {
        var serv= node.getAttribute("service");
        var metadata= {
            type:serv || "OGC:WMS",
            servertitle:node.getAttribute("title")
        };
        var server= {
            version:node.getAttribute("version"),
            url:this.getOnlineResource_href(node)
        };
        if (obj.metadata) {
            obj.metadata= metadata;
            OpenLayers.Util.extend(obj, server);
        } else {
            OpenLayers.Util.extend(server, {
                id: serv,
                name: metadata.servertitle
            });
            obj[serv]= server;
        }
    },

    /**
     * Method: read_gpp_defaultCRS
     * Default territory's CRS
     *
     * Parameters:
     * territory - {Object} An object representing a territory.
     * node - {Element} An element node.
     */
    read_gpp_defaultCRS: function(territory, node) {
        territory.defaultCRS= OpenLayers.String.trim(this.getChildValue(node)).replace(/epsg/,"EPSG");
    },

    /**
     * Method: read_gpp_AdditionalCRS
     * CRS for displaying coordinates or supported by the layer.
     *
     * Parameters:
     * obj - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_AdditionalCRS: function(obj, node) {
        obj.additionalCRS= obj.additionalCRS || [];
        obj.additionalCRS.push(OpenLayers.String.trim(this.getChildValue(node)).replace(/epsg/,"EPSG"));
    },

    /**
     * Method: read_gpp_BoundingBox
     * Geographical and temporal extent.
     *
     * Parameters:
     * obj - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_BoundingBox: function(obj, node) {
        var box= this.getChildValue(node).split(',');
        obj.boundingBox= [parseFloat(box[0]),parseFloat(box[1]),parseFloat(box[2]),parseFloat(box[3])];
        obj.temporalExtent= [node.getAttribute("minT") || "", node.getAttribute("maxT") || ""];
    },

    /**
     * Method: read_gpp_Resolution
     * Default resolution for the territory.
     *
     * Parameters:
     * territory - {Object} An object representing a territory.
     * node - {Element} An element node.
     */
    read_gpp_Resolution: function(territory, node) {
        territory.resolution= parseFloat(this.getChildValue(node));
    },

    /**
     * Method: read_gpp_Center
     * Default center for the territory.
     *
     * Parameters:
     * territory - {Object} An object representing a territory.
     * node - {Element} An element node.
     */
    read_gpp_Center: function(territory, node) {
        var center= {};
        this.runChildNodes(center, node);
        territory.center= center;
    },

    /**
     * Method: read_gpp_x
     * longitude of the center
     *
     * Parameters:
     * center - {Object} An object representing a location.
     * node - {Element} An element node.
     */
    read_gpp_x: function(center, node) {
        center.lon= parseFloat(this.getChildValue(node));
    },

    /**
     * Method: read_gpp_y
     * latitude of the center
     *
     * Parameters:
     * center - {Object} An object representing a location.
     * node - {Element} An element node.
     */
    read_gpp_y: function(center, node) {
        center.lat= parseFloat(this.getChildValue(node));
    },

    /**
     * Method: read_gpp_DefaultLayers
     * Default layers for the territoty
     *
     * Parameters:
     * territory - {Object} An object representing a territory.
     * node - {Element} An element node.
     */
    read_gpp_DefaultLayers: function(territory, node) {
        territory.defaultLayers= {};
        this.runChildNodes(territory.defaultLayers, node);
    },

    /**
     * Method: read_gpp_Tilt
     * Tilt for 3D
     *
     * Parameters:
     * territory - {Object} An object representing a territory.
     * node - {Element} An element node.
     */
    read_gpp_Tilt: function(territory, node) {
    },

    /**
     * Method: read_gpp_Heading
     * Heading for 3D
     *
     * Parameters:
     * territory - {Object} An object representing a territory.
     * node - {Element} An element node.
     */
    read_gpp_Heading: function(territory, node) {
    },

    /**
     * Method: read_gpp_DefaultLayer
     * Default layer reference
     *
     * Parameters:
     * layers - {Object} An object representing default layers.
     * node - {Element} An element node.
     */
    read_gpp_DefaultLayer: function(layers, node) {
        var id= node.getAttribute("layerId");
        if (id) {
            layers[id]= {};
        }
    },

    /**
     * Method: read_gpp_Layer
     * Extension of context:Layer
     *
     * Parameters:
     * layer - {Object} An object representing a layer.
     * node - {Element} An element node.
     */
    read_gpp_Layer: function(layer, node) {
        layer.id= node.getAttribute("id");
        layer.options= layer.options||{};
        layer.options.order= parseFloat(node.getAttribute("order") || 0.0);
        layer.options.opacity= parseFloat(node.getAttribute("opacity") || 1.0);
        var isVisibleInCatalog= node.getAttribute("visibleInCatalog") || "0";
        layer.options.displayInLayerSwitcher= (isVisibleInCatalog=="1" || isVisibleInCatalog=="true")? true:false;
        if (node.getAttribute("aggregate")=="aggregate") {
            layer.aggregate= true;
        }
        if (node.getAttribute("more")=="more") {
            layer.hasMoreInformations= true;
        }
        this.runChildNodes(layer.options, node);
    },

    /**
     * Method : read_gpp_Thematics
     * Read a thematics property of a layer
     * 
     * Parameters:
     * layer - {Object} An object representing a layer.
     * node - {Element} An element node.
     */
    read_gpp_Thematics: function(layer, node) {
        layer.thematics= [];
        this.runChildNodes(layer.thematics, node);
    },

    /**
     * Method : read_gpp_InspireThematics
     * Read the inspireThematics property of a layer.
     * 
     * Parameters:
     * layer - {Object} An object representing a layer.
     * node - {Element} An element node.
     */
    read_gpp_InspireThematics: function(layer, node) {
        layer.inspireThematics= [];
        this.runChildNodes(layer.inspireThematics, node);
    },

    /**
     * Method: read_gpp_Originators
     * Load the layer's owner
     *
     * Parameters:
     * options - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_Originators: function(options, node) {
        options.originators= [];
        this.runChildNodes(options.originators, node);
    },

    /**
     * Method : read_gpp_Legends
     * Read a list of legends 
     *
     * Parameters:
     * options - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_Legends: function(options, node) {
        options.legends= [];
        this.runChildNodes(options.legends, node);
    },

    /**
     * Method: read_gpp_QuickLook
     * Read thumbnail
     *
     * Parameters:
     * obj - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_QuickLook: function(obj, node) {
        obj.quickLook= {};
        this.runChildNodes(obj.quickLook, node);
    },

    /**
     * Method: read_wmts_TileMatrixSetLink
     * Read identifier of pyramid
     *
     * Parameters:
     * options - {Object} An object.
     * node - {Element} An element node.
     */
    read_wmts_TileMatrixSetLink: function(options, node) {
        var tileMatrixSets= [];
        var wmts= new OpenLayers.Format.WMTSCapabilities.v1_0_0({
            namespaces: {
                ows  : "http://www.opengis.net/ows/1.1",
                wmts : "http://www.opengis.net/wmts/1.0",
                xlink: "http://www.w3.org/1999/xlink"
            }
        });
        var obj= {};
        options.tileMatrixSetLink= wmts.readChildNodes(node,obj);
    },

    /**
     * Method: read_gpp_MetadataURL
     * Read metadata information
     *
     * Parameters:
     * options - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_MetadataURL: function(options, node) {
        options.metadataURL= options.metadataURL||[];
        var metadataURL= {};
        metadataURL.format= node.getAttribute("format") || '';
        this.runChildNodes(metadataURL, node);
        options.metadataURL.push(metadataURL);
    },

    /**
     * Method : read_gpp_Keys
     * Read a list of keys 
     */
    read_gpp_Keys: function(options, node) {
        options.keys= {};
        this.runChildNodes(options.keys, node);
    },

    /**
     * Method : read_gpp_Thematic
     * Read a thematic property and add it to the thematics.
     * 
     * Parameters:
     * thematics - {Object} An object representing the thematics.
     * node - {Element} An element node.
     */
    read_gpp_Thematic: function(thematics, node) {
        thematics.push(OpenLayers.String.trim(this.getChildValue(node)));
    },

    /**
     * Method : read_gpp_InspireThematic
     * Read a inspireThematic property  and add it to the inspireThematics.
     * 
     * Parameters:
     * layer - {Object} An object representing the inspireThematics.
     * node - {Element} An element node.
     */
    read_gpp_InspireThematic: function(inspireThematics, node) {
        inspireThematics.push(OpenLayers.String.trim(this.getChildValue(node)));
    },

    /**
     * Method: read_gpp_Originator
     * Get information about data ownership
     *
     * Parameters:
     * originators - Array({Object}) An array of objects.
     * node - {Element} An element node.
     */
    read_gpp_Originator: function(originators, node) {
        var originator= {};
        originator.name= node.getAttribute("name");
        this.runChildNodes(originator, node);
        originators.push(originator);
    },

    /**
     * Method : read_gpp_Attribution
     * Read the attribution property of an originator
     * 
     * Parameters:
     * originator - {Object} An object representing an originator.
     * node - {Element} An element node.
     */
    read_gpp_Attribution: function(originator, node) {
        originator.attribution= OpenLayers.String.trim(this.getChildValue(node));
    },

    /**
     * Method: read_gpp_Logo
     * Read owner's logo
     *
     * Parameters:
     * originator - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_Logo: function(originator, node) {
        originator.pictureUrl= OpenLayers.String.trim(this.getChildValue(node));
    },

    /**
     * Method: read_gpp_URL
     * Read a URL
     *
     * Parameters:
     * originator - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_URL: function(originator, node) {
        originator.url= OpenLayers.String.trim(this.getChildValue(node));
    },

    /**
     * Method: read_gpp_Constraints
     * Read data constraints
     *
     * Parameters:
     * originator - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_Constraints: function(originator, node) {
        var constraints= [];
        this.runChildNodes(constraints, node);
        originator.constraints= constraints;
    },

    /**
     * Method: read_gpp_Constraint
     * Read data constraint
     *
     * Parameters:
     * constraints - Array({Object}) An array of objects.
     * node - {Element} An element node.
     */
    read_gpp_Constraint: function(constraints, node) {
        var constraint= {};
        this.runChildNodes(constraint, node);
        constraints.push(constraint);
    },

    /**
     * Method : read_gpp_Legend
     * Read options of legend 
     */
    read_gpp_Legend: function(legends, node) {
        var legend= {};
        this.runChildNodes(legend, node);
        legends.push(legend);
    },

    /**
     * Method: read_gpp_LegendURL
     * Read legend URl informations
     *
     * Parameters:
     * legend - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_LegendURL: function(legend, node) {
        legend.width= node.getAttribute("width") || -1;
        legend.height= node.getAttribute("height") || -1;
        legend.format= node.getAttribute("format") || '';
        this.runChildNodes(legend, node);
    },

    /**
     * Method : read_gpp_Key
     * Read one key of gpp:Keys node 
     *
     * Parameters:
     * keys - {Object} An object.
     * node - {Element} An element node.
     */
    read_gpp_Key: function(keys, node) {
        keys[node.getAttribute("id")]= OpenLayers.String.trim(this.getChildValue(node));
    },

    /**
     * Constant: CLASS_NAME
     * Default value *"Geoportal.Format.WMC.v1_1_0_AutoConf"*
     */
    CLASS_NAME: "Geoportal.Format.WMC.v1_1_0_AutoConf"
});
