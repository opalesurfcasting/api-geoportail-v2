/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Catalogue/Config.js
 */
/**
 * Class: Geoportal.Catalogue
 * The Geoportal framework catalogue of layers.
 * This object references all the Geoportal layers which the webmaster
 * has access to. It is dynamically generated depending on the
 * license key.
 */
/**
 * Constructor: Geoportal.Catalogue
 * Builds the whole catalogue for the Geoportal.
 *
 * Parameters:
 * map - {<Geoportal.Map>} the Geoportal map
 * options - {Object} supports the following options:
 *      * apiKey - {Array({String}) | {String}} the API's keys;
 *      * "key" - {Object} API's key description :
 *          * tokenServer - {String} the GeoDRM service;
 *          * tokenTimeOut - {Integer} the GeoDRM service's time out in
 *          milliseconds;
 *          * transport - {String} optional, defaults to 'json';
 *          * bounds - {Array({Number})} optional, key's extent in longitude, latitude;
 *          * resources - {Object} allowed resources for this key :
 *              * name - {String} resource name;
 *              * url - {String} resource service url;
 *              * type - {String} resource type (WMSC, WMS, ...).
 *          The resource identifier are the concatenation of resource's
 *          name, ':' and resource's type.
 *          * allowedGeoportalLayers - {Array({String})} array of
 *          resources' identifier for this key.
 *      * services - {Object} optional, capabilities of services needed by
 *      resource.
 */
Geoportal.Catalogue= function(map, options) {
    if (map) {
        this.map= map;
    }
    //get contract capabilities:
    this.setKeys(options);
};

Geoportal.Catalogue.prototype= {

    /**
     * APIProperty: map
     * {<Geoportal.Map>} the Geoportal map.
     */
    map:null,

    /**
     * Property: urlServices
     * {Object} the services URL to be contacted.
     * *DEPRECATED* will disappear after 1.0beta4 is online.
     */
    urlServices: {},

    /**
     * APIMethod: destroy
     * Releases a catalogue
     */
    destroy: function() {
        if (this.map) {
            this.map= null;
        }
        if (this.apiKey) {
            var k;
            for (var i= 0, l= this.apiKey.length; i<l; i++) {
                k= this.apiKey[i];
                if (this[k]) {
                    this[k]= null;
                }
            }
            this.apiKey= null;
        }
        if (this.services) {
            this.services= null;
        }
    },

    /**
     * APIMethod: getTerritory
     * Returns a valid territory.
     *
     * Parameters:
     * territory - {String} the territory.
     *
     * Returns:
     * {String} Either the territory or 'FXX' when the territory is wrong.
     */
    getTerritory: function(territory) {
        if(territory==undefined) {
            if (this.map) {
                territory= this.map.territory || 'FXX';
            } else {
                territory= 'FXX';
            }
        }
        if(Geoportal.Catalogue.TERRITORIES[territory]==undefined) {
            if (this.map) {
                territory= this.map.territory || 'FXX';
            } else {
                territory= 'FXX';
            }
        }
        for (var i= 0, len= Geoportal.Catalogue.TERRITORIES[territory].defaultCRS.length; i<len; i++) {
            var proj= Geoportal.Catalogue.TERRITORIES[territory].defaultCRS[i];
            if (typeof(proj)=='string') {
                Geoportal.Catalogue.TERRITORIES[territory].defaultCRS[i]= new OpenLayers.Projection(
                    proj,
                    {
                        domainOfValidity: OpenLayers.Bounds.fromArray(Geoportal.Catalogue.TERRITORIES[territory].geobbox)
                    });
            }
        }
        if (typeof(Geoportal.Catalogue.TERRITORIES[territory].geoCRS[0])=='string') {
            Geoportal.Catalogue.TERRITORIES[territory].geoCRS[0]= new OpenLayers.Projection(
                Geoportal.Catalogue.TERRITORIES[territory].geoCRS[0],
                {
                    domainOfValidity: OpenLayers.Bounds.fromArray(Geoportal.Catalogue.TERRITORIES[territory].geobbox)
                });
        }
        return territory;
    },

    /**
     * APIMethod: findTerritory
     * Returns the territory for the given longitude, latitude.
     *
     * Parameters:
     * ll - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} longitude, latitude in decimal degrees.
     *
     * Returns:
     * {String} the territory, 'WLD' (world) if none found.
     */
    findTerritory: function(ll) {
        for (var ter in Geoportal.Catalogue.TERRITORIES) if (Geoportal.Catalogue.TERRITORIES.hasOwnProperty(ter)) {
            var t= Geoportal.Catalogue.TERRITORIES[ter];
            if (ter=='WLD') { continue; }
            if (!t.geobbox) { continue; }
            var bbox= OpenLayers.Bounds.fromArray(t.geobbox);
            var inbbox= bbox.containsLonLat(ll);
            bbox= null;
            if (inbbox) { return ter; }
        }
        return 'WLD';
    },

    /**
     * APIMethod: getNativeProjection
     * Returns the map's projection.
     *
     * Parameters:
     * territory - {String} ISO 3166 alpha-3 code.
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the target projection.
     *      When not defined, default CRS applied.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}  the layers's default projection which is
     *      either the given projection or the territory default's projection
     *      (e.g. IGNF:GEOPORTALFXX for FXX). Returns null in case of not
     *      allowed projection.
     */
    getNativeProjection: function(territory, crs) {
        if (!crs) {
            crs= Geoportal.Catalogue.TERRITORIES[territory].defaultCRS[0];
        }
        if (crs && typeof(crs)=='string') {
            crs= new OpenLayers.Projection(
                crs,
                {
                    domainOfValidity: OpenLayers.Bounds.fromArray(Geoportal.Catalogue.TERRITORIES[territory].geobbox)
                });
        }
        return crs;
    },

    /**
     * APIMethod: getDisplayProjections
     * Returns the default display projection from map's controls.
     *
     * Parameters:
     * territory - {String} ISO 3166 alpha-3 code.
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the target projection.
     *      When not defined, default geographic CRS applied.
     * needsAll - {Boolean} indicates the result will contain all available
     * projections for that territory.
     *
     * Returns:
     * {Array(<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>)}
     * the map's control display projections which is
     *      either the given projection or the territory default's geographic
     *      CRS (e.g. IGNF:RGF93G for FXX) or both or more.
     */
    getDisplayProjections: function(territory, crs, needsAll) {
        if(territory==undefined) {
            if (this.map) {
                territory= this.map.territory || 'FXX';
            } else {
                territory= 'FXX';
            }
        }
        var crss= [];
        if (!crs) {
            if (!needsAll) {
                crss.push(Geoportal.Catalogue.TERRITORIES[territory].displayCRS[0]);
            } else {
                crss= Geoportal.Catalogue.TERRITORIES[territory].displayCRS.slice(0);
            }
        } else {
            crss.push(crs);
        }
        var dcrss= [];
        for (var i= 0, len= crss.length; i<len; i++) {
            var c= crss[i];
            if (c && typeof(c)=='string') {
                try {
                    c= new OpenLayers.Projection(
                        c,
                        {
                            domainOfValidity: OpenLayers.Bounds.fromArray(Geoportal.Catalogue.TERRITORIES[territory].geobbox)
                        });
                    dcrss.push(c);
                } catch (e) {
                    ;
                }
            } else {
                if (c) {
                    dcrss.push(c.clone());
                }
            }
        }
        return dcrss;
    },

    /**
     * APIMethod: getResolutions
     * Computes the resolutions from the min and max zooms.
     *
     * Parameters:
     * territory - {String} the territory where resolutions must be computed.
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the target projection for resolutions.
     *
     * Returns:
     * {Array} for the map's default projection, it is the native resolutions.
     *      for the map's default geographic projection or equivalent, it is
     *      the reprojected native resolutions. Otherwise, null.
     */
    getResolutions: function(territory, crs) {
        var resolutions= null;
        var i, len;
       if (crs.getProjName()=='lcc') { // Lambert Conique Conforme
            // FIXME : limiter pour la valeur territory=='FXX'
            if (Geoportal.Catalogue.CRSRESOLUTIONS['EPSG:2154']) {
                return Geoportal.Catalogue.CRSRESOLUTIONS['EPSG:2154'].slice();
            } else {
                resolutions= [];
                for (i= 0, len= Geoportal.Catalogue.RESOLUTIONS.length; i<len; i++) {
                    resolutions[i]= Geoportal.Catalogue.RESOLUTIONS[i];
                }
                return resolutions;
            }
        } else if (crs.getProjName()!='longlat') { // Web Mercator
            if (Geoportal.Catalogue.CRSRESOLUTIONS['EPSG:3857']) {
                return Geoportal.Catalogue.CRSRESOLUTIONS['EPSG:3857'].slice();
            } else {
                resolutions= [];
                for (i= 0, len= Geoportal.Catalogue.RESOLUTIONS.length; i<len; i++) {
                    resolutions[i]= Geoportal.Catalogue.RESOLUTIONS[i];
                }
                return resolutions;
            }
        } else {  // Géographique
            if (Geoportal.Catalogue.CRSRESOLUTIONS['EPSG:4326']) {
                return Geoportal.Catalogue.CRSRESOLUTIONS['EPSG:4326'].slice();
            } else {
                resolutions= [];
                for (i= 0, len= Geoportal.Catalogue.RESOLUTIONS.length; i<len; i++) {
                    var pt= new OpenLayers.LonLat(Geoportal.Catalogue.RESOLUTIONS[i], 0);
                    //pt.transform(Geoportal.Catalogue.TERRITORIES[territory].defaultCRS[0], crs);
                    pt.transform(new OpenLayers.Projection("EPSG:3857"), crs);
                    resolutions[i]= pt.lon;
                }
                return resolutions;
            }
        }
        return resolutions;//null
    },

    /**
     * APIMethod: getCenter
     * Returns the default center for a given territory.
     *
     * Parameters:
     * territory - {String} ISO 3166 alpha-3 code.
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the target projection.
     *
     * Returns:
     * {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} the center
     */
    getCenter: function(territory, crs) {
        var center= new OpenLayers.LonLat(
                                Geoportal.Catalogue.TERRITORIES[territory].geocenter[0],
                                Geoportal.Catalogue.TERRITORIES[territory].geocenter[1]
        );
        if (crs && typeof(crs)!='string') {
            center.transform(Geoportal.Catalogue.TERRITORIES[territory].geoCRS[0], crs);
        }
        return center;
    },

    /**
     * APIMethod: getExtent
     * Returns the projected extent for a given territory.
     *
     * Parameters:
     * territory - {String} ISO 3166 alpha-3 code.
     *      When defined, extent is taken from
     *      <Geoportal.Catalogue.TERRITORIES>, otherwise from API's contracts,
     *      otherwise world's extent.
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the target projection.
     *      When defined, extent is projected (not kept in geographic
     *      longitudes, latitudes).
     *
     * Returns:
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} the projected extent.
     */
    getExtent: function(territory, crs) {
        var bbox= null;
        if (!territory) {
            if (this.apiKey) {
                var k;
                for (var i= 0, l= this.apiKey.length; i<l; i++) {
                    k= this.apiKey[i];
                    if (this[k] && this[k].bounds) {
                        if (!bbox) {
                            bbox= this[k].bounds.clone() ;
                        } else {
                            bbox.extend(this[k].bounds.clone());
                        }
                    }
                }
            }
            if (bbox==null) {
                bbox= new OpenLayers.Bounds(-180,-90,180,90);
            }
        } else {
            bbox= OpenLayers.Bounds.fromArray(Geoportal.Catalogue.TERRITORIES[territory].geobbox);
        }
        if (crs && typeof(crs)!='string') {
            bbox.transform(
                territory?
                    Geoportal.Catalogue.TERRITORIES[territory].geoCRS[0]
                :
                    OpenLayers.Projection.CRS84,
                crs, true);
        }
        return bbox;
    },

    /**
     * APIMethod: getDefaultMinZoom
     * Returns the minimum default zoom.
     *
     * Parameters:
     * territory - {String} ISO 3166 alpha-3 code.
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the target projection.
     *
     * Returns:
     * {Integer} the mininum default zoom for the given territory, 0
     *      otherwise.
     */
    getDefaultMinZoom: function(territory, crs) {
        if (!crs) {
            crs= this.getNativeProjection(territory);
        }
        var minZoomLevel= Geoportal.Catalogue.RESOLUTIONS.length-1;
        for (var proj in Geoportal.Catalogue.TERRITORIES[territory].baseLayers) {
            if (Geoportal.Catalogue.TERRITORIES[territory].baseLayers.hasOwnProperty(proj)) {
                if (crs.isCompatibleWith(proj)) {
                    if (Geoportal.Catalogue.TERRITORIES[territory].baseLayers[proj].minZoomLevel<minZoomLevel) {
                        minZoomLevel= Geoportal.Catalogue.TERRITORIES[territory].baseLayers[proj].minZoomLevel;
                    }
                    break;
                }
            }
        }
        return minZoomLevel==Geoportal.Catalogue.RESOLUTIONS.length-1? 0:minZoomLevel;
    },

    /**
     * APIMethod: getDefaultMaxZoom
     * Returns the maximum default zoom.
     *
     * territory - {String} ISO 3166 alpha-3 code.
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the target projection.
     *
     * Returns:
     * {Integer} the maximum default zoom for the given territory, the
     *      catalogue's resolutions length otherwise.
     */
    getDefaultMaxZoom: function(territory, crs) {
        if (!crs) {
            crs= this.getNativeProjection(territory);
        }
        var maxZoomLevel= 0;
        for (var proj in Geoportal.Catalogue.TERRITORIES[territory].baseLayers) {
            if (Geoportal.Catalogue.TERRITORIES[territory].baseLayers.hasOwnProperty(proj)) {
                if (crs.isCompatibleWith(proj)) {
                    if (Geoportal.Catalogue.TERRITORIES[territory].baseLayers[proj].maxZoomLevel>maxZoomLevel) {
                        maxZoomLevel= Geoportal.Catalogue.TERRITORIES[territory].baseLayers[proj].maxZoomLevel;
                    }
                    break;
                }
            }
        }
        return maxZoomLevel==0? Geoportal.Catalogue.RESOLUTIONS.length-1:maxZoomLevel;
    },

    /**
     * APIMethod: getDefaultZoom
     * Returns the default zoom.
     *
     * Parameters:
     * territory - {String} ISO 3166 alpha-3 code.
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the target projection.
     *
     * Returns:
     * {Integer} the default zoom for the given projection, 5 otherwise.
     */
    getDefaultZoom: function(territory, crs) {
        if (!crs) {
            crs= this.getNativeProjection(territory);
        }
        for (var proj in Geoportal.Catalogue.TERRITORIES[territory].baseLayers) {
            if (Geoportal.Catalogue.TERRITORIES[territory].baseLayers.hasOwnProperty(proj)) {
                if (crs.isCompatibleWith(proj)) {
                    return Geoportal.Catalogue.TERRITORIES[territory].baseLayers[proj].defaultZoomLevel;
                }
            }
        }
        return 5;
    },

    /**
     * APIMethod: setKeys
     * Assigns API keys to the catalogue.
     *
     * Parameters:
     * options - {Object} supports the following options:
     *      * apiKey - {Array({String}) | {String}} the API's keys;
     *      * "key" - {Object} API's key description :
     *          * tokenServer - {String} the GeoDRM service;
     *          * tokenTimeOut - {Integer} the GeoDRM service's time out in
     *          milliseconds;
     *          * transport - {String} optional, defaults to 'json';
     *          * bounds - {Array({Number})} optional, key's extent in longitude,
     *          latitude;
     *          * resources - {Object} allowed resources for this key :
     *              * name - {String} resource name;
     *              * url - {String} resource service url;
     *              * type - {String} resource type (WMSC, WMS, ...).
     *          The resource identifier are the concatenation of resource's
     *          name, ':' and resource's type.
     *          * allowedGeoportalLayers - {Array({String})} array of
     *          resources' identifier for this key.
     *      * services - {Object} optional, capabilities of services needed by
     *      resource.
     */
    setKeys: function(options) {
        if (!options.apiKey) { return; }
        var oldEntries= {};
        for (var oe in Geoportal.Catalogue.LAYERNAMES) {
            if (Geoportal.Catalogue.LAYERNAMES[oe] && Geoportal.Catalogue.LAYERNAMES[oe].deprecated) {
                oldEntries[oe+':'+Geoportal.Catalogue.DEFAULT_SERVICE_TYPE]=
                    Geoportal.Catalogue.LAYERNAMES[oe].deprecated+':'+Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
            }
        }
        if (!(OpenLayers.Util.isArray(options.apiKey))) {
            options.apiKey= [options.apiKey];
        }
        var k;
        for (var i= 0, l= options.apiKey.length; i<l; i++) {
            k= options.apiKey[i];
            if (!k) { continue; }
            if (options[k]!=null) {
                this[k]= {
                    tokenServer:options[k].tokenServer,
                    geoRMKey:k,
                    tokenTimeOut:options[k].tokenTimeOut,
                    transport:options[k].transport || options.transport || 'json',
                    bounds:
                        options[k].bounds?
                            OpenLayers.Bounds.fromArray(options[k].bounds)
                        :
                            new OpenLayers.Bounds(-180,-90,180,90),//world contract
                    layers:options[k].resources,
                    allowedGeoportalLayers:options[k].allowedGeoportalLayers,
                    defaultGeoportalLayers:options[k].defaultGeoportalLayers,
                    services:options[k].services
                };
                if (this[k].transport=='referrer') {
                    this[k].referrer= options[k].referrer || options.referrer || 'http://localhost/';
                }
                for ( var oe in oldEntries) {
                    var ol= this[k].layers[oe];
                    if (ol) {
                        var nl= OpenLayers.Util.extend(ol, {name:(oldEntries[oe].split(':'))[0]});
                        this[k].layers[oldEntries[oe]]= nl;
                        delete this[k].layers[oe];
                        for (var j= 0, lj= this[k].allowedGeoportalLayers.length; j<lj; j++) {
                            if (this[k].allowedGeoportalLayers[j]===oe) {
                                this[k].allowedGeoportalLayers[j]= oldEntries[oe];
                                break;
                            }
                        }
                    }
                }
            } else {
                this[k]= {
                    tokenServer:'http://localhost/',
                    geoRMKey:k,
                    tokenTimeOut:60000,
                    layers:{},
                    allowedGeoportalLayers:[]
                };
            }
        }
        this.apiKey= options.apiKey.slice(0);
        if (options.services) {
            this.services= {};
            for (var i= 0, l= this.apiKey.length; i<l; i++) {
                var k= this.apiKey[i];
                if (!k) { continue; }
                var resources= this[k].resources || this[k].layers;
                for (var li in resources) {
                    var s= resources[li].url;
                    if (options.services[s] && !this.services[s]) {
                        this.services[s]= options.services[s];
                    }
                }
            }
        }
    },

    /**
     * APIMethod: getAllowedGeoportalLayers
     * Retrieve all the Geoportal's layers that can be served for given keys.
     *
     * Parameters:
     * key - {Array({String}) | {String}} the API's keys;
     *
     * Returns:
     * Array({String}) list of layers, empty if none.
     */
    getAllowedGeoportalLayers: function(key) {
        var all= [];
        if (!key) { return all; }
        if (typeof(key)=='string') { key= [key]; }
        var i= 0, l= key.length;
        for (; i<l; i++) {
            if (this[key[i]] && this[key[i]].allowedGeoportalLayers) {
                all= all.concat(this[key[i]].allowedGeoportalLayers);
            }
        }
        if (l==1) { return all; }
        //all.sort();
        var allEntries= {};
        // get entry as key => uniqueness is acheived !
        for (i= 0, l= all.length; i<l; i++) {
            allEntries[all[i]]= 0;
        }
        all= [];
        // push keys back !
        for (i in allEntries) {
            all.push(i);
        } 
        return all;
    },

    /**
     * APIMethod: getDefaultGeoportalLayers
     * Retrieve all the default Geoportal's layers that can be served for given keys.
     *
     * Parameters:
     * key - {Array({String}) | {String}} the API's keys;
     *
     * Returns:
     * Array({String}) list of default layers, empty if none.
     */
    getDefaultGeoportalLayers: function(key) {
        var all= [];
        if (!key) { return all; }
        if (typeof(key)=='string') { key= [key]; }
        var i= 0, l= key.length;
        for (; i<l; i++) {
            if (this[key[i]] && this[key[i]].defaultGeoportalLayers) {
                all= all.concat(this[key[i]].defaultGeoportalLayers);
            }
        }
        if (l==1) { return all; }
        //all.sort();
        var allEntries= {};
        // get entry as key => uniqueness is achieved !
        for (i= 0, l= all.length; i<l; i++) {
            allEntries[all[i]]= 0;
        }
        all= [];
        // push keys back !
        for (i in allEntries) {
            all.push(i);
        }
        return all;
    },

    /**
     * APIMethod: getLayerGeoRMKey
     * Returns the GeoRM key that monitor the layer which has the id layerId.
     *
     * Parameters:
     * territory - {String} the territory where extent must be computed.
     * layerId - {String} Id of the layer you want to get the parameters.
     * Returns:
     * {String} the key or null on error.
     */
    getLayerGeoRMKey: function(territory, layerId) {
        if (this.apiKey) {
            var k;
            for (var i= 0, l= this.apiKey.length; i<l; i++) {
                k= this.apiKey[i];
                if (this[k] &&
                    (!territory ||
                     (this[k].bounds && this[k].bounds.intersectsBounds(this.getExtent(territory),true)))) {
                    for (var lid in this[k].layers) {
                        if (lid==layerId || lid.match('^'+layerId+':')) {
                            return k;
                        }
                    }
                }
            }
        }
        return null;
    },

    /**
     * APIMethod: getLayerParameters
     * Returns all the parameters needed to add the layer which has the id layerId,
     * that is to say its classLayer, its name, its url, its params and its options.
     *      All these parameters are included in the object parameters.
     *
     * Parameters:
     * territory - {String} the territory where extent must be computed.
     * layerId - {String} Id of the layer you want to get the parameters.
     *
     * Returns:
     * {Object} An object containing all the parameters.
     */
    getLayerParameters: function(territory,layerId) {
        if (!Geoportal.Catalogue.TERRITORIES[territory]) {
            return null;
        }
        if (!layerId) {
            return null;
        }

        var parts= layerId.split(':');
        // if layerId ~ /^$/ or layerId ~ /^:.+$/
        if (parts.length==0 || parts[0].length==0) {
            return null;
        }
        var explicitServiceType= parts.length!=1;
        if (!explicitServiceType) {
            // if layerId ~ /[^:]+/
            parts.push(Geoportal.Catalogue.DEFAULT_SERVICE_TYPE);
        }
        var theType= parts.pop(), theLid= parts.join(':');
        if (Geoportal.Catalogue.LAYERNAMES[theLid] && Geoportal.Catalogue.LAYERNAMES[theLid].deprecated) {
            theLid= Geoportal.Catalogue.LAYERNAMES[theLid].deprecated;
        }
        var layerCnfs=[];
        if (this.apiKey) {
             var k;
             for (var i= 0, l= this.apiKey.length; i<l; i++) {
                k= this.apiKey[i];
                if (this[k]) {
                    for (var lid in this[k].layers) {
                        if (lid==theLid+':'+theType) {
                            //a contract may have several layerId for different services
                            layerCnfs.push(OpenLayers.Util.extend({}, this[k].layers[lid]));
                        }
                    }
                }
            }
        }
        if (layerCnfs.length==0) {
            return null;
        }
        var layerCnf= null;
        for (var i= 0, l= layerCnfs.length; i<l; i++) {
            if (theType==layerCnfs[i].type) {
                layerCnf= layerCnfs[i];
                break;
            }
        }
        //FIXME: WMTS demandé, seul WMS existe ...
        if (layerCnf==null) { return null; }
        var lDef= Geoportal.Catalogue.LAYERNAMES[layerCnf.name];
        if (!lDef) { return null; }
        var lKey= lDef.key;
        var layerConfig= Geoportal.Catalogue.CONFIG[lKey];
        if (!layerConfig) { return null; }
        var lTer= layerConfig[territory];
        if (!lTer) { return null; }
        var description= layerConfig.layerOptions.description || layerCnf.name+'.description';
        var parameters= {
            resourceId:layerCnf.name+':'+layerCnf.type,
            url:layerCnf.url,
            params:{
                layers:null,
                exceptions:"text/xml"
            },
            options:{
                isBaseLayer:false,
                description:description,
                visibility:false,
                opacity:1.0,
                view:{
                    drop:false,
                    zoomToExtent:false
                }
            }
        };
        if (layerCnf.version) {
                parameters.params= OpenLayers.Util.extend(parameters.params,{
                    version:layerCnf.version
                });
        }
        var nativeProjections= Geoportal.Catalogue.TERRITORIES[territory].defaultCRS.slice(0);
        if (layerConfig.layerOptions.projection) {
            nativeProjections = [layerConfig.layerOptions.projection];
        }
        if (layerConfig.aggregate) {
            parameters.classLayer= Geoportal.Layer.Aggregate;
        } else {
            switch (layerCnf.type) {
            case 'WMS'   :
                parameters.classLayer= Geoportal.Layer.WMS;
                parameters.params= OpenLayers.Util.extend(parameters.params,{
                    format:'image/png',
                    transparent:true
                });
                parameters.options= OpenLayers.Util.extend(parameters.options,{
                    //FIXME: see OpenLayers.Layer.Grid: the more high is buffer,
                    //the more extra-tiles are requested - defaults to 2
                    buffer:1,
                    singleTile:true
                });
                // disable Geoportal's projection :
                if(nativeProjections.length>1){
                    nativeProjections= nativeProjections.slice(1);
                }
                break;
            case 'WFS'   :
                parameters.classLayer= Geoportal.Layer.WFS;
                parameters.options= OpenLayers.Util.extend(parameters.options,{
                });
                parameters.params= OpenLayers.Util.extend(parameters.params,{
                    typename: layerCnf.name
                });
                // disable Geoportal's projection :
                if(nativeProjections.length>1){
                    nativeProjections= nativeProjections.slice(1);
                }
                break;
            case 'OPENLS':
                return null;
            case 'WMTS'  :
                parameters.classLayer= Geoportal.Layer.WMTS;
                var wmtsOptions = layerConfig.layerOptions;
                parameters.options= OpenLayers.Util.extend(parameters.options,{
                    //FIXME: see OpenLayers.Layer.Grid: the more high is buffer,
                    //the more extra-tiles are requested - defaults to 2
                    buffer:0,
                    nativeTileSize:new OpenLayers.Size(256,256),
                    //FIXME: flash effects when in use for zoom in ...
                    transitionEffect:'resize',
                    layer: layerCnf.name, // required
                    style: wmtsOptions.style, // required
                    matrixSet: wmtsOptions.matrixSet, // required
                    matrixIds: wmtsOptions.matrixIds,
                    gridOrigin: wmtsOptions.matrixIds[0].topLeftCorner.clone(),
                    nativeResolutions: wmtsOptions.nativeResolutions
                });
                break;
            default      :
                parameters.classLayer= Geoportal.Layer.WMSC;
                parameters.options= OpenLayers.Util.extend(parameters.options,{
                    //FIXME: see OpenLayers.Layer.Grid: the more high is buffer,
                    //the more extra-tiles are requested - defaults to 2
                    buffer:1,
                    tileOrigin:new OpenLayers.LonLat(0.0,0.0),
                    nativeTileSize:new OpenLayers.Size(256,256),
                    singleTile:false
                });
                break;
            }
        }
        if (nativeProjections.length==0) {
            return null;
        }
        // default visibility :
        parameters.options.visibility= layerConfig.serviceParams.options.visibility || false;
        if (layerCnf.name=="CADASTRALPARCELS.PARCELS" && layerCnf.type=="WMTS") {
            parameters.options.visibility= false;
        }
        // default format :
        if (layerConfig.serviceParams[layerCnf.type]) {
            if (layerConfig.serviceParams[layerCnf.type].format) {
                parameters.params.format= layerConfig.serviceParams[layerCnf.type].format;
            }
            // FIXME: never found un autoconf ...
            if (layerConfig.serviceParams[layerCnf.type].transparent) {
                parameters.params.transparent= true;
            }
            parameters.params.version= layerConfig.serviceParams[layerCnf.type].version;
        }
        var layerOptions= {};
        // default opacity :
        if (layerCnf.name=="GEOGRAPHICALGRIDSYSTEMS.MAPS" && layerCnf.type=="WMTS" && territory!='ASP' && territory!='ATF') {
            layerOptions.opacity= 0.3;
        } else {
            layerOptions.opacity= lTer.opacity || layerConfig.layerOptions.opacity;
        }
        // originators :
        layerOptions.originators= [];
        for (var i= 0, l= lTer.originators.length; i<l; i++) {
            var originator= lTer.originators[i];
            layerOptions.originators.push(
                Geoportal.Catalogue.getOriginator(originator.id, originator.mnzl, originator.mxzl));
        }
        layerOptions.minZoomLevel= lTer.minZoomLevel;
        layerOptions.maxZoomLevel= lTer.maxZoomLevel;
        if (lTer.bounds) {
            layerOptions.maxExtent= OpenLayers.Bounds.fromArray(lTer.bounds);
        }
        if (layerConfig.legends && layerConfig.legends.length>0) {
            layerOptions.legends= layerConfig.legends.slice(0);
        }
        if (layerConfig.layerOptions.title) {
            layerOptions.title= layerConfig.layerOptions.title;
        }
        if (layerConfig.constraints) {
            layerOptions.constraints= [];
            for (var i= 0, l= layerConfig.constraints.length; i<l; i++) {
                layerOptions.constraints[i]= {};
                layerOptions.constraints[i].maxExtent= layerConfig.constraints[i].maxExtent.clone();
                layerOptions.constraints[i].minResolution= layerConfig.constraints[i].minResolution;
                layerOptions.constraints[i].maxResolution= layerConfig.constraints[i].maxResolution;
            }
        }
        if (lTer.fileIdentifiers && lTer.fileIdentifiers.length>0) {
            layerOptions.metadataURL= [];
            for (var i= 0, l= lTer.fileIdentifiers.length; i<l; i++) {
                var mtd= lTer.fileIdentifiers[i];
                if (!mtd.match(/^http:/)) {
                    mtd= Geoportal.Catalogue.CATBASEURL+mtd;
                }
                layerOptions.metadataURL.push(mtd);
            }
        }
        if (lTer.dataURL && lTer.dataURL.length>0) {
            layerOptions.dataURL= [];
            for (var i= 0, l= lTer.dataURL.length; i<l; i++) {
                var url= lTer.dataURL[i];
                layerOptions.dataURL.push(url);
            }
        }

        if (parameters) {
            layerOptions.name= layerCnf.name;
            layerOptions.projection= null;
            for (var i= 0, len= nativeProjections.length; i<len; i++) {
                if (typeof(nativeProjections[i])=='string') {
                    nativeProjections[i]= new OpenLayers.Projection(
                        nativeProjections[i],
                        {
                            domainOfValidity: OpenLayers.Bounds.fromArray(
                                Geoportal.Catalogue.TERRITORIES[territory].geobbox)
                        });
                } else {
                    nativeProjections[i]= new OpenLayers.Projection(
                        nativeProjections[i].getCode(),
                        {
                            domainOfValidity: OpenLayers.Bounds.fromArray(
                                Geoportal.Catalogue.TERRITORIES[territory].geobbox)
                        });
                }
                if (this.map && nativeProjections[i].equals(this.map.getProjection())) {
                    layerOptions.projection= new OpenLayers.Projection(
                        nativeProjections[i].getCode(),
                        {
                            domainOfValidity: OpenLayers.Bounds.fromArray(
                                Geoportal.Catalogue.TERRITORIES[territory].geobbox)
                        });
                }
            }
            if (layerCnf.type=='WMS') {
                layerOptions.srs= {};
                for (var i= 0, len= nativeProjections.length; i<len; i++) {
                    var crs= nativeProjections[i].clone();
                    layerOptions.srs[crs]= true;
                }
            }
            if (!layerOptions.projection) {
                layerOptions.projection= new OpenLayers.Projection(
                    nativeProjections[0].getCode(),
                    {
                        domainOfValidity: OpenLayers.Bounds.fromArray(
                                Geoportal.Catalogue.TERRITORIES[territory].geobbox)
                    });
            }
            if (layerCnf.type!='WMTS') {
                parameters.params.layers= layerCnf.name;
            }
            // DO NOT USE instanceof here as parameters.classLayer is not yet an object
            // web mercator~geoportal~plate-carre new paradigm :
            if (layerCnf.type===Geoportal.Catalogue.DEFAULT_SERVICE_TYPE) {
                // See Geoportal.Layer.Grid : clone native resolutions to
                // manage changebaselayer event !
                // on ne met les resolutions WMercator QUE si on n'en a pas trouve
                // de natives dans la config
                if (!parameters.options.nativeResolutions) {
                    layerOptions.nativeResolutions= Geoportal.Catalogue.RESOLUTIONS.slice(0);
                }
            }
            // maxExtent must be in layer's native projection :
            if (layerOptions.maxExtent==undefined) {
                layerOptions.maxExtent= this.getExtent(territory);
            }
            layerOptions.maxExtent.transform(
                Geoportal.Catalogue.TERRITORIES[territory].geoCRS[0], layerOptions.projection, true);
            // originators logo's extent:
            if (layerOptions.originators) {
                for (var i= 0, l= layerOptions.originators.length; i<l; i++) {
                    var logo= layerOptions.originators[i];
                    if (logo.extent) {
                        if (!(OpenLayers.Util.isArray(logo.extent))) {
                            logo.extent= [logo.extent];
                        }
                        for (var j= 0, jl= logo.extent.length; j<jl; j++) {
                            logo.extent[j].transform(Geoportal.Catalogue.TERRITORIES[territory].geoCRS[0], layerOptions.projection, true);
                        }
                    }
                }
            }
            // constraints extent:
            if (layerOptions.constraints) {
                for (var i= 0, l= layerOptions.constraints.length; i<l; i++) {
                    layerOptions.constraints[i].maxExtent.transform(Geoportal.Catalogue.TERRITORIES[territory].geoCRS[0], layerOptions.projection, true);
                }
            }
            // finally extend options :
            OpenLayers.Util.extend(parameters.options,layerOptions);
        }

        return parameters;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Catalogue"*
     */
    CLASS_NAME:"Geoportal.Catalogue"
};

/**
 * Function: _orderLayersStack
 * Tries to order the layers's stack.
 *
 * Parameters:
 * layersId - {Array} List of layer identifiers.
 *
 * Returns:
 * {Array} List of ordered layer identifiers (photo first, the map, ...)
 */
Geoportal.Catalogue._orderLayersStack= function( layersId ) {
    var orderedLayers= [];
    var candidateLayer;
    var i, n= layersId.length;
    var re= new RegExp(/^([^:]+)(:(.+))?$/);
    for (i= 0; i < n; i++) {
        var parts= layersId[i].match(re);
        if (parts==null) { continue; }
        var layerName= parts[1];
        if (layerName==null) { continue; }
        var layerType= parts[3] || Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
        var weight= 0;
        var lDef= Geoportal.Catalogue.LAYERNAMES[layerName];
        if (lDef) {
            weight= lDef.weight || 0;
        }
        candidateLayer= {
            'layerId': layerName+':'+layerType,
            'weight' : weight
        };
        orderedLayers.unshift(candidateLayer);
    }
    orderedLayers.sort(function(a,b){return b.weight - a.weight;});
    n= orderedLayers.length;
    var orderedlayersId= [];
    for (i= 0; i < n; i++) {
        candidateLayer= orderedLayers.shift();
        orderedlayersId[i]= candidateLayer.layerId;
    }
    return orderedlayersId;
};

/**
 * Constant: Geoportal.Catalogue.DEFAULT_SERVICE_TYPE
 * {String} Service type to used when none defined.
 *      Defaults to *WMTS*
 */
Geoportal.Catalogue.DEFAULT_SERVICE_TYPE= "WMTS";
