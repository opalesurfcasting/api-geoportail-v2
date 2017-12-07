/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/InterfaceViewer/Flash.js
 * @requires Geoportal/Loader.js
 */
/**
 * Namespace: Geoportal.Loader.Flash
 * The Geoportal Flash loader.
 *
 */
/**
 * Function: Geoportal.loadFlash
 * Utility function for loading a Flash viewer in a web page.
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
 *      * tilt - {Number} camera's tilt in decimal degrees.
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
 * {<Geoportal.InterfaceViewer.Flash>} or null on error.
 */
Geoportal.loadFlash = function(div, key, pos, zoom, options) {

    if (typeof(key)=='string') {
        key= [key];
    }

    if (window.__Geoportal$timer===undefined) {
        window.__Geoportal$timer= null;
    }
    if (__Geoportal$timer!=null) {
        window.clearTimeout(__Geoportal$timer);
    }
    if (typeof(OpenLayers)=='undefined'    ||
        typeof(Geoportal)=='undefined'     ||
        typeof(Geoportal.Util)=='undefined') {
        __Geoportal$timer= window.setTimeout(
            OpenLayers.Function.bind(function(d,k,p,z,o) {
                Geoportal.loadFlash(d,k,p,z,o);
            },this,div,key,pos,zoom,options),
            300);
        return;
    }

    var ivOpts= {'keys':key} ;

    if (options.onBeforeView && typeof(options.onBeforeView)=='function') {
        // applies onBeforeView callback now, with options as arguments
        options.onBeforeView(options) ; 
    }

    if (options.onViewerLoaded && typeof(options.onViewerLoaded)=='function') {
        ivOpts.viewerLoadedCallback= options.onViewerLoaded ;
    } else {
        ivOpts.viewerLoadedCallback= Geoportal.load.defaultOnViewerLoaded ; 
    }

    var vOpts= OpenLayers.Util.extend({}, options);
    if (!isNaN(zoom)) {
        vOpts.zoom= zoom;
    }
    if (pos) OpenLayers.Util.extend(vOpts, pos) ;

    ivOpts= OpenLayers.Util.extend(ivOpts, vOpts) ;

    var ivf= new Geoportal.InterfaceViewer.Flash(div,ivOpts) ;

    return ivf;
};


