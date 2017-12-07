/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Layer/Vector.js
 */
/**
 * Class: Geoportal.Layer.Vector.Tiled
 * Instances of Geoportal.Layer.Vector.Tiled are used to display tiled vector data.
 * Tiled data are assumed to be ordered according a quad-tree of KML files. 
 * Create a new vector layer with the <Geoportal.Layer.Vector.Tiled> constructor.
 *
 * Inherits from:
 *  - {<Geoportal.Layer.Vector>}
 */
Geoportal.Layer.Vector.Tiled = OpenLayers.Class( Geoportal.Layer.Vector, {

    /**
     * Constructor: Geoportal.Layer.Vector.Tiled
     * Create a new tiled vector layer object.
     *
     * Parameters:
     * name - {String} A name for the layer.
     * options - {Object} Hashtable of extra options to tag onto the layer
     * 
     * Valid options properties:
     * url - {String} Base url for the tiled vector layer (required).
     * layer - {String} Name of the root tile (required).
     */
    initialize: function(name, options) {
        var newArguments = [];
        OpenLayers.Util.applyDefaults(options,{
            strategies: [new Geoportal.Strategy.Tiled({
                baseUrl: options.url
            })],
            protocol: new OpenLayers.Protocol.Script({
                url : options.url + '/' + options.layer + '.kml',
                srsInBBOX: true,
                format : new OpenLayers.Format.KML({
                    extractStyles: true,
                    extractNetworkLinks:true
                }),
                params: {
                    output: "json"
                },
                handleResponse: function(response, options) {
                    if (options.callback) {
                        if (response.data) {
                            var format = new OpenLayers.Format.KML({
                                extractStyles: true,
                                extractNetworkLinks:true
                            });
                            response.features = format.read(response.data.xml);
                            response.styles = format.styles;
                            response.networkLinks = format.networkLinks;
                            response.url = options.url;
                            response.level = options.level;
                            response.code = OpenLayers.Protocol.Response.SUCCESS;
                        } else {
                            response.code = OpenLayers.Protocol.Response.FAILURE;
                        }
                        this.destroyRequest(response.priv);
                        options.callback.call(options.scope, response);
                    }
                }
            })
        });
        newArguments.push(name, options);
        Geoportal.Layer.Vector.prototype.initialize.apply(this,newArguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Layer.Vector.Tiled"*
     */
    CLASS_NAME: "Geoportal.Layer.Vector.Tiled"
});
