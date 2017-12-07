/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/InterfaceViewer.js
 */
/**
 * Namespace: Geoportal.Loader
 * The Geoportal's API framework loader.
 *
 */
Geoportal= Geoportal || {};

/**
 * Function: Geoportal.load
 * Utility function for loading a viewer in a web page.
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
 * options - {Object} additionnal parameters to configure the viewer. This
 * object holds the following properties :
 *      * componentsOptions - {Object} the geoportal's viewer components options;
 *      * description - {String} the description of the marker's popup locating the
 *        map's center (when there is neither onView, nor overlays options);
 *      * displayProjection - {Array({String}) | {String}}. Defaults to *CRS:84*;
 *      * geormUrl - {String} the GeoRM service. Defaults to
 *        *<Geoportal.GeoRMHandler.getGeormServerUrl>*;
 *      * callback - {Function | String} callback to call when receiving the
 *        contract's information. Defaults to *Geoportal.GeoRMHandler.getContract*;
 *      * label - {String} the label to show (if necessary) of the marker's popup
 *        locating the map's center;
 *      * language - {String} IETF 4646 2 characters. Defaults to browser's
 *        language;
 *      * layers - Array({String}) the geoportal's layers to use. Defaults to
 *        all layers of the contract's keys;
 *      * layersOptions - {Object} the geoportal's layers options. Each entry
 *        is the Geoportal's layer name as key and an {Object} containing the
 *        options like opacity, visibility, etc ...
 *        A special key is 'global' containing global options;
 *      * marker - {Object} use this image as marker's image instead of
 *      default marker-ign.png. This object the properties expected for
 *      styling external graphics in OpenLayers like externalGraphic,
 *      graphicWidth, graphicHeight, graphicXOffset, graphicYOffset, etc;
 *      * mode - {String} 'normal', 'mini' (only for
 *        <Geoportal.Viewer.Default>). Defaults to *normal*;
 *      * onBeforeView - {Function} callback to use before creating the
 *        viewer;
 *      * onView - {Function} callback to use after having creating the
 *        viewer. The call context is the <Interface.Viewer>. Disable the
 *        marker located at the map's center;
 *      * onViewerLoaded - {Function} callback for the *'viewerLoaded'* event.
 *      * overlays - {Object} additional layers urls. The
 *        overlays is as follows :
 *        (code)
 *        overlays:{
 *          'kml':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...],
 *          'gpx':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...],
 *          'gml':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...],
 *          'osm':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...],
 *          'georss':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...],
 *          'wms':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...],
 *          'wmsc':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...],
 *          'wmts':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...],
 *          'wfs':[{'name':'nameOfOverlay', 'url':'urlOfOverlay', options:{...}}, ...]
 *        }
 *        (end)
 *        If the overlay is located at the same site than the web page calling
 *        it there is no need to use proxyUrl. The overlay must be accessible in
 *        all cases through the web (either absolute or relative URL);
 *        The *options* object hold everything needed to create a layer (url,
 *        params, options).
 *        This option prevents the loader to create the marker located at the
 *        map's center;
 *      * proxyUrl - {String} url to use for the AJAX requests (ends with
 *        'url=');
 *      * noProxyDomains - {Array} list of domains for which no proxy is used
 *      * (if 'proxyUrl' option is set) 
 *      * territory - {String} ISO 3166 alpha-3 code of territory. Defaults to
 *        *FXX*;
 *      * theme - {Array({Object}} holds css properties (css, id, anchor);
 *      * type - {String} 'js', 'flex'. Defaults to *js';
 *      * viewerClass - {Function} the Geoportal.Viewer sub-class to use.
 *        Defaults to *<Geoportal.Viewer.Simple>*;
 *      By default, all the Geoportal's layers contracted in the keys are
 *      loaded, then the zoom is set, then the center is set. Finally, the
 *      *'onView'* function is called.
 *
 * The newly built viewer or null on error is stored into the
 * gGEOPORTALRIGHTSMANAGEMENT global variable under the application property.
 *
 * Returns:
 * {<Geoportal.InterfaceViewer>} or null on error.
 */
Geoportal.load = function(div, key, pos, zoom, options) {
    if (!div) {
        return;
    }

    pos= pos || {};
    options= options || {};

    switch (options.type) {
    case 'flex':
        return Geoportal.loadFlash(div, key, pos, zoom, options);
    case '3d':
        return Geoportal.load3D(div, key, pos, zoom, options);
    case 'js'  :
    default    :
        return Geoportal.loadJs(div, key, pos, zoom, options);
    }
};


/**
  * defaultOnViewerLoaded : default callback for viewerloaded event
  * called in the context of InterfaceViewer (this == iv).
  * does setting stuff from options passed
  *
  * Parameters:
  * - evt : onViewerLoaded event caught.
  */ 
Geoportal.load.defaultOnViewerLoaded= function(evt) {
    // get viewerOptions
    // this == interfaceViewer
    var options= this.viewerOpts ;

    // does  as if we were in GPP3..
    // sets Keys
    if (this.setKeys) {
      this.setKeys(options.keys) ;
    }


    // sets ProxyURL (Flash specific)
    if (options.proxyUrl) {
      this.setProxy(options.proxyUrl) ; 
    }

    if (options.noProxyDomains) {
      this.setNoProxyDomains(options.noProxyDomains) ;
    }

    // sets Geoportal Layers
    if (options.layers) {
    	// We add the elevation grid coverage default if it is a 3d case
    	if (options.type == '3d') {
    		this.addGeoportalLayer('ELEVATION.ELEVATIONGRIDCOVERAGE');
    		this.setLayerVisibility('ELEVATION.ELEVATIONGRIDCOVERAGE',true);    		
    	}
        for (var i=0 ; i<options.layers.length ; i++) { // gl == 'layer id'
            var glId= options.layers[i] ;
            // if the EGC has been added by the user, it ignores it (already added just before)
            if (glId != 'ELEVATION.ELEVATIONGRIDCOVERAGE') {
                this.addGeoportalLayer(glId) ; // checking 
                // setting default layers options : opacity:1.0 and visibility:false
                this.setLayerVisibility(glId,false) ;
                this.setLayerOpacity(glId,1.0) ;
            }
        }
    }

    // syntaxe attendue pour layersOptions :
   /*
     layersOptions:{
        'ORTHOIMAGERY.ORTHOPHOTOS': {
            opacity:1.0, 
            visibility:true
        }
     },
    */
    if (options.layersOptions) {
        for (var glId in options.layersOptions) {
          if (options.layersOptions[glId])
            for (var option in options.layersOptions[glId]) {
              if ( options.layersOptions[glId][option]) {
                if (option=="opacity" && typeof(options.layersOptions[glId][option])=='number') {
                  this.setLayerOpacity(glId, options.layersOptions[glId][option]) ;
                }
                if (option=="visibility" && typeof(options.layersOptions[glId][option])=='boolean') {
                  this.setLayerVisibility(glId,
                                          options.layersOptions[glId][option]) ;
                }
              }
            } // glId
        } // i
    }

    // sets overlays
    // options.overlays = { protocol1: [{'name':layerName, 'url': layerUrl, 'options': {} },
    //                                  {...} ], 
    //                      protocol2: [ {...}, {...} ] }
    if (options.overlays) {
        for (var protocol in options.overlays) {
            for (var i=0 ; i< options.overlays[protocol].length; i++) {
                var lopt= options.overlays[protocol][i] ;
                // gets options for the layer
                var ovrl= OpenLayers.Util.extend({}, lopt.options); 
                // gets options from API JS style
                if (lopt.options) {
                  OpenLayers.Util.extend(ovrl, lopt.options.params);
                  OpenLayers.Util.extend(ovrl, lopt.options.options);
                }
                switch (protocol.toLowerCase()) {
                  case 'wms'    :
                    if (ovrl.layers && !ovrl.typename) ovrl.typename= ovrl.layers ;
                    if (ovrl.srs && !ovrl.projection) ovrl.projection= ovrl.srs ; 
                    break ;
                  case 'wmts'   :
                    if (ovrl.layer && !ovrl.typename) ovrl.typename= ovrl.layer ;
                    if (ovrl.srs && !ovrl.projection) ovrl.projection= ovrl.srs ; 
                    break ;
                  case 'wfs'    :
                    if (ovrl.srs && !ovrl.projection) ovrl.projection= ovrl.srs ; 
                    break ;
                  case 'kml'    :
                  case 'gpx'    :
                  case 'georss' :
                    break ;
                }
                ovrl.protocol= protocol ;
                ovrl.url= lopt.url ;
                ovrl.name= lopt.name ;
                this.addLayer(ovrl) ;
                this.setLayerVisibility(ovrl.name,typeof(ovrl.visibility)=='boolean'?ovrl.visibility:true) ;
                this.setLayerOpacity(ovrl.name, typeof(ovrl.opacity)=='number'? ovrl.opacity:1.0);
            }
        }
    }

    // sets components
    // options.componentsOptions = { componentName, { propName1 : val1, propName2 : val2} }
    if (options.componentsOptions) {
        for (var cpnt in options.componentsOptions ) {
            this.addComponent(cpnt,options.componentsOptions[cpnt]) ; 
        }
    }

    // sets Zoom
    if (options.zoom) {
        this.setZoom(options.zoom) ;
    }

    // set Center
    // 
    // callback for async centering (setCenterAtLocation)
    var onCenterChangedCbk= typeof(options.afterCentered)=='function'?options.afterCentered:Geoportal.load.defaultOnCenterChanged ;

    this.addEvent("centerchanged", OpenLayers.Function.bind(onCenterChangedCbk,this)) ;

    if (options.lon && options.lat) { 
        this.setCenter(options.lon, options.lat) ;
    } else if (options.center) {
        this.setCenterAtLocation({
            'center': options.center
        });
    } else if (options.place) {// placename
        this.setCenterAtLocation({
            'place': options.place
        });
    } else if (options.address) {// geocoding
        this.setCenterAtLocation({
            'address': options.address
        });
    } else if (options.geolocate) {// geolocation
        this.setCenterAtLocation({
            'geolocate':true
        });
    }

    if (this.setCameraOrientation) {
      this.setCameraOrientation((options.heading?options.heading:0),
                                (options.tilt?options.tilt:0)) ;
    }

    // call onView callback
    if (options.onView && typeof(options.onView)=='function') {
        options.onView.apply(this,[evt]) ;
    }
};

/**
  * defaultOnCenterChanged : default callback for centerchanged event
  * called in the context of InterfaceViewer (this == iv).
  *
  * Parameters:
  * - evt : centerchanged event caught.
  */ 
Geoportal.load.defaultOnCenterChanged= function(evt) {
    this.removeEvent("centerchanged",Geoportal.load.defaultOnCenterChanged) ;
};

