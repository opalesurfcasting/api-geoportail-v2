/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/GeoRMHandler.js
 * @requires Geoportal/InterfaceViewer/JS.js
 * @requires Geoportal/Loader.js
 * @requires Geoportal/Viewer/Simple.js
 */
/**
 * Namespace: Geoportal.Loader.JS
 * The Geoportal Javascript loader.
 *
 */
/**
 * Function: Geoportal.loadJs
 * Utility function for loading a Javascript viewer in a web page.
 *      This method is called by <Geoportal.load>. Don't call it directly!
 *
 * Parameters:
 * div - {String | DOMElement} Id of the DIV tag in which you want
 *       to insert your viewer.
 * key - {Array({String}) | {String}} the API's keys' contracts for this viewer.
 * pos - {Object} various ways of dealing with map's center. Could be :
 *      * center - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} coordinates in WGS84 longitude,
 *        latitude ;
 *      * lon - {String | Number} longitude in WGS84 ;
 *      * lat - {String | Number} latitude in WGS84 ;
 *      * place - {String} place's name ;
 *      * address - {String} location in term of "street,zip code,place" ;
 *      * geolocate - {Boolean} if true use geolocation API ;
 *      * heading - {String | Number} camera's heading in WGS84 ;
 *      * tilt - {Number} camera's tilt in decimal degrees ;
 *      * afterCentered - {Function} after centering, call this function in
 *      the context of the map. By default, loads the overlays if any (if
 *      none, set a marker at the map's center).
 * zoom - {Integer} zoom level.
 * options - {Object} additionnal parameters to configure the viewer. See
 * {<Geoportal.load>}.
 *
 * The newly built viewer or null on error is stored into the
 * gGEOPORTALRIGHTSMANAGEMENT global variable under the application property.
 *
 * Returns:
 * {<Geoportal.InterfaceViewer.JS>} or null on error.
 */
Geoportal.loadJs = function(div, key, pos, zoom, options) {
    if (key!=null && typeof(key)=='string') {
        key= [key];
    }

    if (window.__Geoportal$timer===undefined) {
        window.__Geoportal$timer= null;
    }
    if (__Geoportal$timer!=null) {
        window.clearTimeout(__Geoportal$timer);
    }
    if (typeof(OpenLayers)=='undefined'              ||
        typeof(Geoportal)=='undefined'               ||
        typeof(Geoportal.Viewer)=='undefined'        ||
        typeof(Geoportal.Viewer.Standard)=='undefined') {
        __Geoportal$timer= window.setTimeout(
            OpenLayers.Function.bind(function(d,k,p,z,o) {
                Geoportal.loadJs(d,k,p,z,o);
            },this,div,key,pos,zoom,options),
            300);
        return;
    }

    OpenLayers.Util.applyDefaults(options,{
        displayProjection:['CRS:84']
    });

    // main :
    // start :
    if (options.language) {
        OpenLayers.Lang.setCode(options.language);
    }
    if (typeof(options.onBeforeView)=='function') {
        options.onBeforeView(options);
        // onBeforeView may have redefined location and/or zoom :
        if (typeof(options.center)=='object') {
            pos= OpenLayers.Util.extend(pos, options.center);
            delete options.center;
        }
        if (typeof(options.zoom)=='number') {
            zoom= options.zoom;
            delete options.zoom;
        }
    }
    var vc= options.viewerClass || Geoportal.Viewer.Simple;
    if (vc===Geoportal.Viewer.Default && options.mode==='mini') {
        vc= OpenLayers.Class(Geoportal.Viewer.Default, {
            mode:'mini'
        });
    }
    if (options.mode!==undefined) { delete options.mode; }
    var vOpts= OpenLayers.Util.extend({}, options);
    if (typeof(zoom)=='number') {
        vOpts.zoom= zoom;
    }
    vOpts.geolocation= OpenLayers.Util.extend({}, pos);
    if (options.proxyUrl) {
        vOpts.proxy= options.proxyUrl;
        delete options.proxyUrl;
    }
    // create interface :
    var ivlCbck= typeof(options.onViewerLoaded)!='function'?
        Geoportal.loadJs.defaultOnViewerLoaded
    :   options.onViewerLoaded;
    var iViewer= new Geoportal.InterfaceViewer.JS(div,{
        'keys':key,
        'viewerLoadedCallback':ivlCbck,
        'viewerClass':vc,
        'viewerOpts':vOpts
    });
    return iViewer;
};

/**
 * Function: Geoportal.loadJs.defaultAfterCentered
 * Complete the viewer when no function is provided.
 *  If there are no overlays to add, then a marker is positionned at the
 *  map's centered.
 *  Called in the context of the {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}.
 *
 * Parameters:
 * options - {Object} additionnal parameters to configure the viewer. See
 * <Geoportal.loadJs>.
 */
Geoportal.loadJs.defaultAfterCentered= function(options) {
    var viewer= this.getApplication();
    if (window.gGEOPORTALRIGHTSMANAGEMENT) {
        gGEOPORTALRIGHTSMANAGEMENT.application= viewer;
    }
    var opts= options || viewer.options;
    // terminate:
    if (!opts.overlays) {
        // put a marker at map's center
        var imgOpts= {};
        if (!opts.marker) {
            imgOpts= {
                externalGraphic: Geoportal.Util.getImagesLocation()+"marker-ign.png",
                graphicWidth:34,
                graphicHeight:34,
                graphicXOffset:-10,
                graphicYOffset:-33
            } ;
        } else {
            imgOpts= OpenLayers.Util.extend({}, opts.marker);
        }
        var mrks= new OpenLayers.Layer.Vector(
            "-x-",
            {
                // Set the external graphic and background graphic images.
                styleMap: new OpenLayers.StyleMap(imgOpts),
                isBaseLayer: false,
                displayInLayerSwitcher: false,
                opacity:1.0,
                visibility:true,
                //FIXME: options ?
                preFeatureInsert: Geoportal.Popup.setPointerCursorForFeature,
                onFeatureInsert: Geoportal.Popup.Anchored.createPopUpForKMLFeature,
                formatOptions: {
                    popupClass:OpenLayers.Popup.FramedCloud,
                    closeBox:false,
                    autoSize:true
                }
            }
        );
        this.addLayer(mrks,null,null,null,{
            attachDefaultPopup: true
        });
        var center= this.getCenter();
        var ll= (center.clone()).transform(mrks.getNativeProjection(), OpenLayers.Projection.CRS84);
        var mrkr= new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(center.lon, center.lat),
            {
                name:       '<span class="gpPopupLabelCenter">' +
                                (opts.label || OpenLayers.i18n('approx.center')) +
                            '</span>',
                description:'<span class="gpPopupDescriptionCenter">' +
                                (opts.description || OpenLayers.String.sprintf("%.6f %.6f", ll.lon, ll.lat)) +
                            '</span>'
            }
        );
        mrks.addFeatures([mrkr]);
    } else {
        // load additional overlays:
        for (var tov in opts.overlays) {
            if (!opts.overlays.hasOwnProperty(tov)) { continue; }
            var ovrls= opts.overlays[tov] || [];
            if (!OpenLayers.Util.isArray(ovrls) || ovrls.length==0) { continue; }
            var t= '';
            switch (tov.toLowerCase()) {
            case 'kml'    :
            case 'gml'    :
            case 'gpx'    :
            case 'osm'    :
            case 'wms'    :
            case 'wmsc'   :
            case 'wmts'   :
            case 'wfs'    :
                t= tov.toUpperCase();
                break;
            case 'georss' :
                t= 'GeoRSS';
                break;
            default :
                break;
            }
            if (t!='') {
                for (var i= 0, l= ovrls.length; i<l; i++) {
                    var ovrl= ovrls[i];
                    if (!ovrl || !ovrl.name || !ovrl.url) { continue; }
                    ovrl.options= ovrl.options || {};
                    switch(t) {
                    case 'KML'   :
                    case 'GML'   :
                    case 'GPX'   :
                    case 'GeoRSS':
                    case 'OSM'   :
                        ovrl.options.params= OpenLayers.Util.applyDefaults(ovrl.options.params, {
                            visibility: true
                        });
                        ovrl.options.options= OpenLayers.Util.applyDefaults(ovrl.options.options, {
                            handlersOptions:{
                                feature:{
                                    stopDown:false//allow pan map when drag in feature
                                }
                            }
                        });
                        break;
                    case 'WMS'   :
                    case 'WMSC'  :
                    case 'WMTS'  :
                    case 'WFS'   :
                    default      :
                        ovrl.options.params= ovrl.options.params || {};
                        ovrl.options.options= OpenLayers.Util.applyDefaults(ovrl.options.options,{
                            visibility: true
                        });
                        break;
                    }
                    this.addLayer(t, ovrl.name, ovrl.url, ovrl.options.params, ovrl.options.options);
                }
            }
        }
    }
    // close layers' switcher:
    if (viewer.openLayersPanel) {
        viewer.openLayersPanel(false);
    }
    // minimize information panel:
    var ip= viewer.getMap().getControlsByClass('Geoportal.Control.Information');
    if (ip && ip.length>0) {
        ip[0].toggleControls(true);
    }
};

/**
 * Function: Geoportal.loadJs.defaultOnViewerLoaded
 * Callback related with "viewerloaded" event.
 *  Called in the context of the {<Geoportal.InterfaceViewer>}.
 *
 * Parameters:
 * evt - {Event}
 */
Geoportal.loadJs.defaultOnViewerLoaded= function(evt) {
    var viewer= evt.viewer;
    var options= viewer.options;
    // layers:
    // checks layers with regard to contracts :
    // this.keys contient les clefs
    // viewer.getMap().catalogue[xxx].allowedGeoportalLayers contient les
    // couches de la clef xxx => les fusionner
    var lyrs= [];
    if (!options.layers || options.layers.length==0) {
        lyrs= viewer.getMap().catalogue.getDefaultGeoportalLayers(this.keys);
        if (lyrs.length==0) {
            lyrs= viewer.getMap().catalogue.getAllowedGeoportalLayers(this.keys);
        }
    } else {
        lyrs= options.layers.slice(0);
    }
    var okLyrs= [], okLyrsOpts= {};
    for (var il= 0, ll= lyrs.length; il<ll; il++) {
        var lyr= lyrs[il];
        //FIXME 
        if (viewer.getMap().catalogue.getLayerGeoRMKey(null,lyr)) {
            okLyrs.push(lyr);
        }
    }
    // in case we have got only one layer ...
    if (okLyrs.length==1 && !(options.layersOptions && options.layersOptions[okLyrs[0]])) {
        okLyrsOpts[okLyrs[0]]= {
            opacity: 1.0,
            visibility: true
        };
    } else if (options.layersOptions) {
        for (var i= 0, l= okLyrs.length; i<l; i++) {
            var lid= okLyrs[i], ci= lid.lastIndexOf(':'), rlid= ci!=-1? lid.substring(0,ci) : lid;
            if (ci==-1) {
                lid= lid+':'+Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
            }
            okLyrsOpts[lid]= OpenLayers.Util.extend(
                {}, options.layersOptions[lid] || options.layersOptions[rlid] || {});
        }
        if (options.layersOptions.global) {
            okLyrsOpts.global= OpenLayers.Util.extend({},options.layersOptions.global);
        }
    }
    viewer.addGeoportalLayers(okLyrs, okLyrsOpts);
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter, viewer.viewerOptions.defaultZoom);

    // centering :
    var opts= OpenLayers.Util.extend({},options.geolocation);
    // zooming :
    if (typeof(options.zoom)=='number') {
        opts.zoom= options.zoom;
//    let setCenterAtLocation decides !
//    } else {
//        opts.zoom= viewer.viewerOptions.defaultZoom;
    }
    var afCbck= typeof(opts.afterCentered)!='function'?
        Geoportal.loadJs.defaultAfterCentered
    :   opts.afterCentered;
    var self= this;
    opts.afterCentered= function() {
        afCbck.apply(self.getViewer().getMap(),[]);
        if (typeof(options.onView)=='function') {
            options.onView.apply(self,[options]);
        }
    };
    this.setCenterAtLocation(opts);
};

