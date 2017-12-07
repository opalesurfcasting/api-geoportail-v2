/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/Strategy.js
 */

/**
 * Class: Geoportal.Strategy.Tiled
 * A strategy that reads new features from hierarchical KML file.
 * 
 * Inherits from:
 *  - <Geoportal.Strategy>
 */
Geoportal.Strategy.Tiled= OpenLayers.Class(Geoportal.Strategy, {

    /**
     * Property: responses
     * {Object} Hash of {<OpenLayers.Protocol.Response>}, keyed by url, holding
     *     the cached responses. Response object describes a KML tile and contains
     *     the following attributes :
     *     * data.xml - {String} the KML file from the server
     *     * features - {Array(<OpenLayers.Feature.Vector>)} the features of the KML tile
     *     * level - {Integer} level of the KML tile in the hierarchy (root tile has level 0,
     *     its children have level 1, ...)
     *     * styles - {Object} Hash of {Object}, keyed by style id, holding the styles of the KML file
     */
    responses : {},

    /**
     * Constructor: Geoportal.Strategy.Tiled
     * Create a new tiled strategy.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     */
    initialize: function(options) {
        Geoportal.Strategy.prototype.initialize.apply(this, [options]);
        this.responses = {};
    },

    /**
     * Method: activate
     * Set up strategy with regard to reading new batches of remote data.
     * 
     * Returns:
     * {Boolean} The strategy was successfully activated.
     */
    activate : function() {
        var activated= OpenLayers.Strategy.prototype.activate.call(this);
        if (activated) {
            this.layer.events.on({
                        "moveend" : this.update,
                        scope : this
                    });
            if (this.layer.visibility === true && this.layer.inRange === true) {
                this.update();
            } else {
                this.layer.events.on({
                            "visibilitychanged" : this.update,
                            scope : this
                        });
            }
        }
        return activated;
    },

    /**
     * Method: deactivate
     * Tear down strategy with regard to reading new batches of remote data.
     * 
     * Returns:
     * {Boolean} The strategy was successfully deactivated.
     */
    deactivate : function() {
        var deactivated= OpenLayers.Strategy.prototype.deactivate.call(this);
        if (deactivated) {
            this.layer.events.un({
                "moveend": this.update,
                "visibilitychanged": this.update,
                scope: this
            });
        }
        return deactivated;
    },

    /**
     * Method: update
     * Callback function called on "moveend" or "visibilitychanged" layer events.
     *
     * Parameters:
     * options - {Object} An object with a property named "force", this
     *      property references a boolean value indicating if new data
     *      must be inconditionally read.
     */
    update : function(options) {
        this.loadingTiles= 0;
        this.layer.events.triggerEvent("loadstart");
        this.triggerRead(options);
    },

    /**
     * Method: getMapBounds
     * Get the map bounds expressed in CRS84 projection.
     *
     * Returns:
     * {<OpenLayers.Bounds>} Map bounds in CRS84 projection.
     */
    getMapBounds : function() {
        if (this.layer.map === null) {
            return null;
        }
        var bounds= this.layer.map.getExtent();
        if (bounds && this.layer.map.getProjection()) {
            bounds= bounds.clone().transform(this.layer.map.getProjection(),
                    OpenLayers.Projection.CRS84);
        }
        return bounds;
    },

    /**
     * Method: triggerRead
     *
     * Parameters:
     * options - Additional options for the protocol's read method (optional)
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} The protocol response object
     *      returned by the layer protocol.
     */
    triggerRead : function(options) {
        if (!options || (options && !options.url)) { // root tile
            options= {
                url : this.layer.protocol.url,
                level : 0
            };
        }
        this.loadingTiles++;
        if (!this.responses[options.url]) {// send http request
            var response= this.layer.protocol.read(OpenLayers.Util
                    .applyDefaults({
                                callback : this.merge,
                                scope : this
                            }, options));
        } else {// use cached response
            this.merge(this.responses[options.url]);
        }
    },

    /**
     * Method: checkValidRegion
     * 
     * Determine whether the region is valid. This occurs
     * when the bounds intersect the map bounds and when the projected pixels
     * area of the region is greater than the minLodPixels value.
     * 
     * Parameters:
     * region - {<Object>} An object with properties named "latLonAltBox", "lod".
     * 
     * Returns:
     * {Boolean} true value if the region is valid, else false value
     */
    checkValidRegion : function(region) {
        var intersectsMap= this.getMapBounds()
                .intersectsBounds(region.latLonAltBox);
        var validLod= !region.lod;
        if (intersectsMap && !validLod) {
            var bbox= region.latLonAltBox;
            var mapProj= this.layer.map.getProjection();
            var projectedPixelRightTop= this.layer.map
                    .getPixelFromLonLat(new OpenLayers.LonLat(bbox.right,
                            bbox.top).transform(OpenLayers.Projection.CRS84,
                            mapProj));
            var projectedPixelLeftBottom= this.layer.map
                    .getPixelFromLonLat(new OpenLayers.LonLat(bbox.left,
                            bbox.bottom).transform(OpenLayers.Projection.CRS84,
                            mapProj));
            var projectedPixelWidth= projectedPixelRightTop.x
                    - projectedPixelLeftBottom.x;
            var projectedPixelHeight= projectedPixelRightTop.y
                    - projectedPixelLeftBottom.y;
            var projectedPixelArea= Math.sqrt(Math.abs(projectedPixelWidth
                    * projectedPixelHeight));
            validLod= projectedPixelArea >= region.lod.minLodPixels
                    && (region.lod.maxLodPixels == -1 || projectedPixelArea < region.lod.maxLodPixels);
        }
        return intersectsMap && validLod;
    },

    /**
     * Method: clearNetworkLink
     * 
     * Removes features in the region of the networkLink.
     * 
     * Parameters:
     * url - {<String>} the NetworkLink URL.
     * 
     */
    clearNetworkLink : function(url) {
        if(this.responses[url]){
            var features = this.responses[url].features;
            this.layer.removeFeatures(features);
        }
    },

    /**
     * Method: merge
     * 
     * Given a list of networkLinks, determine which ones to add
     * to the layer. If the region of a networkLink is displayable, get the
     * children tiles.
     * 
     * Parameters:
     * resp - {<OpenLayers.Protocol.Response>} The response object passed by the protocol.
     */
    merge : function(resp) {
        if (!this.responses[resp.url]) {
            var transform= true;
            this.responses[resp.url]= resp;
        }
        var parentUrl= resp.url.split('/');
        parentUrl.pop();
        parentUrl= parentUrl.join('/');
        var features= resp.features.slice();
        var featuresLength = features.length;
        if (features && featuresLength > 0) {
            var style= null;
            var rootTile= this.responses[this.layer.protocol.url];
            var remote= OpenLayers.Projection.CRS84;
            var local= this.layer.map.getProjection();
            for (var i= 0, len= featuresLength; i < len; ++i) {
                var feature = features[i];
                for (var s in rootTile.styles) {
                    if (OpenLayers.String.contains(feature.data.styleUrl, s)) {
                        style= rootTile.styles[s];
                        break;
                    }
                }
                var geom= feature.geometry;
                var extent = this.layer.map.getExtent().clone();
                if (!this.layer.getFeatureById(feature.id)) {
                    if (!local.equals(remote) && geom && transform) {
                        geom.transform(remote, local);
                    }
                    if (extent.intersectsBounds(geom.getBounds())) {
                        feature.style= style;
                        this.layer.addFeatures(feature);
                    }
                } else {
                    if (!extent.intersectsBounds(geom.getBounds())) {
                        this.layer.removeFeatures(feature);
                    }
                }
            }
        }
        for (var s in resp.styles) {
            var style = resp.styles[s];
            if(style.externalGraphic && !OpenLayers.String.startsWith(style.externalGraphic,'http')){
                style.externalGraphic = parentUrl+'/'+style.externalGraphic;
            }
        }
        var networkLinks = resp.networkLinks;
        if (networkLinks) {
            for (var i= 0, len= networkLinks.length; i < len; i++) {
                var networkLink= networkLinks[i];
                var region= networkLink.region;
                var url= parentUrl + '/' + networkLink.link.href;
                if (this.checkValidRegion(region)) {
                    this.triggerRead({
                                url : url,
                                level : resp.level + 1
                            });
                } else {
                    this.clearNetworkLink(url);
                }
            }
        }
        this.loadingTiles--;
        if (this.loadingTiles < 1) {
            this.loadingTiles = 0;
            this.layer.events.triggerEvent("loadend");
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Strategy.Tiled"*
     */
    CLASS_NAME : "Geoportal.Strategy.Tiled"
});

