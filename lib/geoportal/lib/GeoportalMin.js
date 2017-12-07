/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Header: Geoportal Web 2D API
 */

(function() {
    /**
     * Before creating the Geoportal namespace, check to see if
     * Geoportal.singleFile is true.  This occurs if the
     * Geoportal/SingleFile.js script is included before this one - as is the
     * case with single file builds.
     *
     */
    var singleFile= (typeof(Geoportal)=="object" && Geoportal.singleFile);

    /**
     * Property: scriptName
     * {String} Relative path of this script.
     */
    var scriptName= (!singleFile) ? "lib/GeoportalMin.js" : "Geoportal.js";

    /*
     * If window.Geoportal isn't set when this script (Geoportal.js) is
     * evaluated (and if singleFile is false) then this script will load
     * *all* Geoportal scripts. If window.Geoportal is set to an array
     * then this script will attempt to load scripts for each string of
     * the array, using the string as the src of the script.
     *
     * Example:
     * (code)
     *     <script type="text/javascript">
     *         window.Geoportal = [
     *             "Geoportal/Util.js"
     *         ];
     *     </script>
     *     <script type="text/javascript" src="../lib/Geoportal.js"></script>
     * (end)
     * In this example Geoportal.js will load Util.js only.
     */
    var jsFiles= window.Geoportal;

    /**
     * Namespace: Geoportal
     * The Geoportal minimum API based on OpenLayers 2.12.
     *      Aims at providing necessary hooks for accessing Geoportail's
     *      services.
     * The Geoportal object provides a namespace for all things Geoportal.
     * The Geoportal minimum API provides :
     *
     *      PROJ4JS with the following algorithms :
     *          * eqc
     *          * laea
     *          * lcc
     *          * longlat
     *          * merc
     *          * mill
     *          * stere
     *          * tmerc
     *          * utm
     *
     *      PROJ4JS with the following projections :
     *          * CRS:84
     *          * EPSG:2154
     *          * EPSG:2969
     *          * EPSG:2972
     *          * EPSG:2973
     *          * EPSG:2975
     *          * EPSG:2986
     *          * EPSG:25828
     *          * EPSG:25829
     *          * EPSG:25830
     *          * EPSG:25831
     *          * EPSG:25832
     *          * EPSG:25833
     *          * EPSG:25834
     *          * EPSG:25835
     *          * EPSG:25836
     *          * EPSG:25837
     *          * EPSG:25838
     *          * EPSG:27572
     *          * EPSG:27582
     *          * EPSG:3034
     *          * EPSG:3035
     *          * EPSG:3038
     *          * EPSG:3039
     *          * EPSG:3040
     *          * EPSG:3041
     *          * EPSG:3042
     *          * EPSG:3043
     *          * EPSG:3044
     *          * EPSG:3045
     *          * EPSG:3046
     *          * EPSG:3047
     *          * EPSG:3048
     *          * EPSG:3049
     *          * EPSG:3050
     *          * EPSG:3051
     *          * EPSG:310024802
     *          * EPSG:310032811
     *          * EPSG:310486805
     *          * EPSG:310547809
     *          * EPSG:310642801
     *          * EPSG:310642810
     *          * EPSG:310642812
     *          * EPSG:310642813
     *          * EPSG:310642901
     *          * EPSG:310642813
     *          * EPSG:310700806
     *          * EPSG:310702807
     *          * EPSG:310706808
     *          * EPSG:310915814
     *          * EPSG:3296
     *          * EPSG:3297
     *          * EPSG:3298
     *          * EPSG:32606
     *          * EPSG:32662
     *          * EPSG:32706
     *          * EPSG:32707
     *          * EPSG:32738
     *          * EPSG:32739
     *          * EPSG:32740
     *          * EPSG:32742
     *          * EPSG:32743
     *          * EPSG:32757
     *          * EPSG:32758
     *          * EPSG:32759
     *          * EPSG:3857
     *          * EPSG:4171
     *          * EPSG:4258
     *          * EPSG:4326
     *          * EPSG:4470
     *          * EPSG:4471
     *          * EPSG:4467
     *          * EPSG:4558
     *          * EPSG:4559
     *          * EPSG:4624
     *          * EPSG:4627
     *          * EPSG:5489
     *          * EPSG:5490
     *          * IGNF:CROZ63UTM39S
     *          * IGNF:CSG67UTM22
     *          * IGNF:ETRS89GEO
     *          * IGNF:ETRS89LAEA
     *          * IGNF:ETRS89LCC
     *          * IGNF:IGN63UTM7S
     *          * IGNF:MART38UTM20
     *          * IGNF:MAYO50UTM38S
     *          * IGNF:GEOPORTALANF
     *          * IGNF:GEOPORTALASP
     *          * IGNF:GEOPORTALCRZ
     *          * IGNF:GEOPORTALFXX
     *          * IGNF:GEOPORTALGUF
     *          * IGNF:GEOPORTALKER
     *          * IGNF:GEOPORTALMYT
     *          * IGNF:GEOPORTALNCL
     *          * IGNF:GEOPORTALPYF
     *          * IGNF:GEOPORTALREU
     *          * IGNF:GEOPORTALSPM
     *          * IGNF:GEOPORTALWLF
     *          * IGNF:GUAD48UTM20
     *          * IGNF:LAMB93
     *          * IGNF:LAMBE
     *          * IGNF:MILLER
     *          * IGNF:MOOREA87U6S
     *          * IGNF:NUKU72U7S
     *          * IGNF:REUN47GAUSSL
     *          * IGNF:RGF93G
     *          * IGNF:RGFG95GEO
     *          * IGNF:RGM04GEO
     *          * IGNF:RGM04UTM38S
     *          * IGNF:RGNCGEO
     *          * IGNF:RGNCUTM57S
     *          * IGNF:RGNCUTM58S
     *          * IGNF:RGNCUTM59S
     *          * IGNF:RGPFGEO
     *          * IGNF:RGPFUTM5S
     *          * IGNF:RGPFUTM6S
     *          * IGNF:RGPFUTM7S
     *          * IGNF:RGR92GEO
     *          * IGNF:RGR92UTM40S
     *          * IGNF:RGSPM06GEO
     *          * IGNF:RGSPM06U21
     *          * IGNF:TAHAAUTM05S
     *          * IGNF:TAHI79UTM6S
     *          * IGNF:TERA50STEREO
     *          * IGNF:STPM50UTM21
     *          * IGNF:UTM01SW84
     *          * IGNF:UTM20W84GUAD
     *          * IGNF:UTM20W84MART
     *          * IGNF:UTM22RGFG95
     *          * IGNF:UTM39SW84
     *          * IGNF:UTM42SW84
     *          * IGNF:UTM43SW84
     *          * IGNF:WALL78UTM1S
     *          * IGNF:WGS84G
     *          * IGNF:WGS84RRAFGEO
     *          * IGNF:WGS84WMSV
     *
     *      the following Geoportal classes :
     *          * <Geoportal.Catalogue>
     *          * <Geoportal.Catalogue.Configuration>
     *          * <Geoportal.Control>
     *          * <Geoportal.Control.Logo>
     *          * <Geoportal.Control.PermanentLogo>
     *          * <Geoportal.Control.TermsOfService>
     *          * <Geoportal.Format>
     *          * <Geoportal.Format.WMC>
     *          * <Geoportal.Format.WMC.v1_1_0_AutoConf>
     *          * <Geoportal.GeoRMHandler>
     *          * <Geoportal.Lang>
     *          * <Geoportal.Layer>
     *          * <Geoportal.Layer.Grid>
     *          * <Geoportal.Layer.WMS>
     *          * <Geoportal.Layer.WMSC>
     *          * <Geoportal.Layer.WMTS>
     *          * <Geoportal.Tile>
     *          * <Geoportal.Tile.Image>
     *          * <Geoportal.UI>
     *          * <Geoportal.Util>
     */
    window.Geoportal= {

        /**
         * Function: _getScriptLocation
         * Return the path to this script.
         *
         * Returns:
         * {String} Path to this script
         */
        _getScriptLocation: (function () {
            var scriptLocation= "";
            var isGP= new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)");

            // From GeoExt :
            // If we load other scripts right before Geoportal using the same
            // mechanism to add script resources dynamically (e.g. OpenLayers),
            // document.getElementsByTagName will not find the GeoExt script tag
            // in FF2. Using document.documentElement.getElementsByTagName instead
            // works around this issue.
            var scripts= document.documentElement.getElementsByTagName('script');
            for (var i= 0, len= scripts.length; i<len; i++) {
                var src= scripts[i].getAttribute('src');
                if (src) {
                    var match= src.match(isGP);
                    if (match) {
                        scriptLocation= match[1];
                        break;
                    }
                }
            }
            return (function() { return scriptLocation; });
         })()
    };
    /**
     * Geoportal.singleFile is a flag indicating this file is being included
     * in a Single File Library build of the Geoportal Library.
     *
     * When we are *not* part of a SFL build we dynamically include the
     * Geoportal library code.
     *
     * When we *are* part of a SFL build we do not dynamically include the
     * Geoportal library code as it will be appended at the end of this file.
     */
    if(!singleFile) {
        if (!jsFiles) {

            var jsFilesOL= [];
            if (!window.OpenLayers) {
                jsFilesOL= [
                // OpenLayers Minimum
                "../../openlayers/lib/OpenLayers/SingleFile.js",//make OpenLayers believes it is compacted!
                "../../openlayers/lib/OpenLayers/Animation.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Class.js",
                "../../openlayers/lib/OpenLayers/BaseTypes.js",
                "../../openlayers/lib/OpenLayers/Tween.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Bounds.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Element.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/LonLat.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Pixel.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Size.js",
                "../../openlayers/lib/OpenLayers/Console.js",
                "../../openlayers/lib/OpenLayers/Lang.js",
                "../../openlayers/lib/OpenLayers/Util.js",
                "../../openlayers/lib/OpenLayers/Format.js",
//                "../../openlayers/lib/OpenLayers/Format/CSWGetRecords.js",
                "../../openlayers/lib/OpenLayers/Control.js",
                "../../openlayers/lib/OpenLayers/Events.js",
//                "../../openlayers/lib/OpenLayers/Events/buttonclick.js",
//                "../../openlayers/lib/OpenLayers/Control/OverviewMap.js",
                "../../openlayers/lib/OpenLayers/Feature.js",
                "../../openlayers/lib/OpenLayers/Feature/Vector.js",
                "../../openlayers/lib/OpenLayers/Format/WKT.js",
                "../../openlayers/lib/OpenLayers/Geometry.js",
                "../../openlayers/lib/OpenLayers/Strategy.js",
                "../../openlayers/lib/OpenLayers/Style.js",
                "../../openlayers/lib/OpenLayers/Filter.js", // GeoExt
//                "../../openlayers/lib/OpenLayers/Strategy/Filter.js",
                "../../openlayers/lib/OpenLayers/Geometry/Collection.js",
                "../../openlayers/lib/OpenLayers/Geometry/Point.js",
                "../../openlayers/lib/OpenLayers/Geometry/MultiPoint.js",
                "../../openlayers/lib/OpenLayers/Geometry/Curve.js",
                "../../openlayers/lib/OpenLayers/Geometry/LineString.js",
                "../../openlayers/lib/OpenLayers/Geometry/LinearRing.js",
//                "../../openlayers/lib/OpenLayers/Strategy/Save.js",
                "../../openlayers/lib/OpenLayers/Renderer.js",
//                "../../openlayers/lib/OpenLayers/Renderer/Canvas.js",
                "../../openlayers/lib/OpenLayers/Format/XML.js",
                "../../openlayers/lib/OpenLayers/Geometry/Polygon.js",
                "../../openlayers/lib/OpenLayers/Projection.js",
//                "../../openlayers/lib/OpenLayers/Format/OSM.js",
                "../../openlayers/lib/OpenLayers/Geometry/MultiLineString.js",
                "../../openlayers/lib/OpenLayers/Geometry/MultiPolygon.js",
                "../../openlayers/lib/OpenLayers/Format/GML.js",
                "../../openlayers/lib/OpenLayers/Format/GML/Base.js",
                "../../openlayers/lib/OpenLayers/Format/GML/v3.js",
                "../../openlayers/lib/OpenLayers/Handler.js",
//                "../../openlayers/lib/OpenLayers/Handler/Drag.js",
//                "../../openlayers/lib/OpenLayers/Handler/Feature.js",
//                "../../openlayers/lib/OpenLayers/Control/DragFeature.js",
//                "../../openlayers/lib/OpenLayers/Tween.js",
                "../../openlayers/lib/OpenLayers/Map.js",
                "../../openlayers/lib/OpenLayers/Layer.js",
                "../../openlayers/lib/OpenLayers/StyleMap.js",
                "../../openlayers/lib/OpenLayers/Layer/Vector.js",
                "../../openlayers/lib/OpenLayers/Layer/Vector/RootContainer.js",
//                "../../openlayers/lib/OpenLayers/Control/SelectFeature.js",
                "../../openlayers/lib/OpenLayers/Handler/Keyboard.js",
//                "../../openlayers/lib/OpenLayers/Control/ModifyFeature.js",
//                "../../openlayers/lib/OpenLayers/Handler/MouseWheel.js",
//                "../../openlayers/lib/OpenLayers/Control/ZoomToMaxExtent.js", // GeoExt
//                "../../openlayers/lib/OpenLayers/Control/NavigationHistory.js", // GeoExt
                "../../openlayers/lib/OpenLayers/Tile.js",
                "../../openlayers/lib/OpenLayers/Tile/Image.js",
                "../../openlayers/lib/OpenLayers/Format/OGCExceptionReport.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/XML/VersionedOGC.js",//NEW
//                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_3.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_3_0.js",
//                "../../openlayers/lib/OpenLayers/Filter/FeatureId.js",
                "../../openlayers/lib/OpenLayers/Filter/Logical.js",
                "../../openlayers/lib/OpenLayers/Filter/Comparison.js", // GeoExt
//                "../../openlayers/lib/OpenLayers/Format/Filter.js",
//                "../../openlayers/lib/OpenLayers/Renderer/Elements.js",
//                "../../openlayers/lib/OpenLayers/Control/Panel.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon/v1.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon/v1_0_0.js",
                "../../openlayers/lib/OpenLayers/Strategy/Fixed.js",
//                "../../openlayers/lib/OpenLayers/Control/Pan.js",
                "../../openlayers/lib/OpenLayers/Layer/HTTPRequest.js",
                "../../openlayers/lib/OpenLayers/Layer/Grid.js",
                "../../openlayers/lib/OpenLayers/Layer/WMS.js",
//                "../../openlayers/lib/OpenLayers/Format/CSWGetDomain.js",
//                "../../openlayers/lib/OpenLayers/Format/CSWGetDomain/v2_0_2.js",
//                "../../openlayers/lib/OpenLayers/BaseTypes/Date.js",//NEW
                "../../openlayers/lib/OpenLayers/Request.js",
//                "../../openlayers/lib/OpenLayers/Request/XMLHttpRequest.js",
                "../../openlayers/lib/OpenLayers/Format/KML.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_1.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_1_0.js",
                "../../openlayers/lib/OpenLayers/Filter/Spatial.js",
                "../../openlayers/lib/OpenLayers/Strategy/BBOX.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon/v1_1_0.js",
//                "../../openlayers/lib/OpenLayers/Control/PanPanel.js",
//                "../../openlayers/lib/OpenLayers/Control/Attribution.js",
//                "../../openlayers/lib/OpenLayers/Control/ScaleLine.js",
//                "../../openlayers/lib/OpenLayers/Renderer/NG.js",//NEW
//                "../../openlayers/lib/OpenLayers/Renderer/SVG2.js",//NEW
//                "../../openlayers/lib/OpenLayers/Kinetic.js",//NEW
//                "../../openlayers/lib/OpenLayers/Ajax.js",
//                "../../openlayers/lib/OpenLayers/Control/TransformFeature.js",
                "../../openlayers/lib/OpenLayers/Layer/XYZ.js",
//                 "../../openlayers/lib/OpenLayers/Layer/OSM.js",
                "../../openlayers/lib/OpenLayers/Format/Context.js",
                "../../openlayers/lib/OpenLayers/Format/WMC.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1_1_0.js",
//                "../../openlayers/lib/OpenLayers/Renderer/SVG.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSDescribeLayer.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSDescribeLayer/v1_1.js",
//                "../../openlayers/lib/OpenLayers/Symbolizer.js",
//                "../../openlayers/lib/OpenLayers/Control/PanZoom.js",
//                "../../openlayers/lib/OpenLayers/Control/PanZoomBar.js",
                "../../openlayers/lib/OpenLayers/Format/JSON.js",
                "../../openlayers/lib/OpenLayers/Format/GeoJSON.js",
//                "../../openlayers/lib/OpenLayers/Strategy/Paging.js",
                "../../openlayers/lib/OpenLayers/Popup.js",
                "../../openlayers/lib/OpenLayers/Popup/Anchored.js",
                "../../openlayers/lib/OpenLayers/Popup/Framed.js",
                "../../openlayers/lib/OpenLayers/Layer/WMTS.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSGetFeatureInfo.js",
                "../../openlayers/lib/OpenLayers/Format/WMTSCapabilities.js",
//                "../../openlayers/lib/OpenLayers/Control/Button.js", // GeoExt
                "../../openlayers/lib/OpenLayers/Format/GML/v2.js",
//                "../../openlayers/lib/OpenLayers/Filter/Function.js",//NEW
//                "../../openlayers/lib/OpenLayers/Format/Filter/v1.js",
//                "../../openlayers/lib/OpenLayers/Format/Filter/v1_0_0.js",
//                "../../openlayers/lib/OpenLayers/Format/Filter/v1_1_0.js",
//                "../../openlayers/lib/OpenLayers/Format/CSWGetRecords/v2_0_2.js",
//                "../../openlayers/lib/OpenLayers/Handler/Click.js",
//                "../../openlayers/lib/OpenLayers/Handler/Hover.js",
//                "../../openlayers/lib/OpenLayers/Control/WMTSGetFeatureInfo.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1_0_0.js",
                "../../openlayers/lib/OpenLayers/Format/WMTSCapabilities/v1_0_0.js",
//                "../../openlayers/lib/OpenLayers/Renderer/VML.js",
//                "../../openlayers/lib/OpenLayers/Control/DrawFeature.js",
//                "../../openlayers/lib/OpenLayers/Popup/FramedCloud.js",
//                "../../openlayers/lib/OpenLayers/Symbolizer/Point.js",
//                "../../openlayers/lib/OpenLayers/Symbolizer/Line.js",
//                "../../openlayers/lib/OpenLayers/Symbolizer/Polygon.js",
//                "../../openlayers/lib/OpenLayers/Symbolizer/Text.js",
//                "../../openlayers/lib/OpenLayers/Symbolizer/Raster.js",
                "../../openlayers/lib/OpenLayers/Rule.js",
//                "../../openlayers/lib/OpenLayers/Handler/Box.js",
//                "../../openlayers/lib/OpenLayers/Control/ZoomBox.js",
//                "../../openlayers/lib/OpenLayers/Control/DragPan.js",
//                "../../openlayers/lib/OpenLayers/Control/Navigation.js",
//                "../../openlayers/lib/OpenLayers/Strategy/Refresh.js",
//                "../../openlayers/lib/OpenLayers/Control/Geolocate.js",//NEW
//                "../../openlayers/lib/OpenLayers/Format/QueryStringFilter.js",//NEW
//                "../../openlayers/lib/Rico/Color.js",
//                "../../openlayers/lib/Rico/Corner.js",
//                "../../openlayers/lib/OpenLayers/Popup/AnchoredBubble.js",
//                "../../openlayers/lib/OpenLayers/Strategy/Cluster.js",
//                "../../openlayers/lib/OpenLayers/Control/MousePosition.js",
//                "../../openlayers/lib/OpenLayers/Layer/Zoomify.js",
//                "../../openlayers/lib/OpenLayers/Handler/RegularPolygon.js",
                "../../openlayers/lib/OpenLayers/Protocol.js",
                "../../openlayers/lib/OpenLayers/Protocol/WFS.js",
                "../../openlayers/lib/OpenLayers/Protocol/HTTP.js",
//                "../../openlayers/lib/OpenLayers/Control/Graticule.js",
                "../../openlayers/lib/OpenLayers/Protocol/Script.js",//NEW
//                "../../openlayers/lib/OpenLayers/Tile/Image/IFrame.js",
//                "../../openlayers/lib/OpenLayers/Layer/WMS/Post.js",
//                "../../openlayers/lib/OpenLayers/Control/WMSGetFeatureInfo.js",
//                "../../openlayers/lib/OpenLayers/Format/CQL.js",//NEW
//                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_1_1.js",
//                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_1_1_WMSC.js",
                "../../openlayers/lib/OpenLayers/Control/KeyboardDefaults.js",
//                "../../openlayers/lib/OpenLayers/Control/ArgParser.js",
                "../../openlayers/lib/OpenLayers/Icon.js",
                "../../openlayers/lib/OpenLayers/Marker.js"
//                ,"../../openlayers/lib/OpenLayers/Lang/en.js",
//                "../../openlayers/lib/OpenLayers/Lang/de.js",
//                "../../openlayers/lib/OpenLayers/Lang/es.js",
//                "../../openlayers/lib/OpenLayers/Lang/fr.js",
//                "../../openlayers/lib/OpenLayers/Lang/it.js"
                ] ;
            }
            var jsFilesP4JS= [];
            if (!window.Proj4js) {
                jsFilesP4JS= [
                // PROJ4JS:
                "../../proj4js/lib/proj4js.js",
                "../../proj4js/lib/OverloadedProj4js.js",
                "../../proj4js/lib/projCode/longlat.js",
//                "../../proj4js/lib/defs/IGNFSTPL69GEO.js",
                "../../proj4js/lib/projCode/mill.js",
                "../../proj4js/lib/defs/EPSG310642901.js",
                "../../proj4js/lib/projCode/lcc.js",
                "../../proj4js/lib/defs/IGNFETRS89LCC.js",
                "../../proj4js/lib/defs/EPSG2154.js",
                "../../proj4js/lib/projCode/eqc.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALANF.js",
                "../../proj4js/lib/defs/IGNFMART38UTM20.js",
                "../../proj4js/lib/defs/IGNFRGNCGEO.js",
                "../../proj4js/lib/defs/IGNFLAMB93.js",
                "../../proj4js/lib/defs/EPSG310547809.js",
                "../../proj4js/lib/projCode/utm.js",
                "../../proj4js/lib/defs/EPSG3296.js",
                "../../proj4js/lib/projCode/tmerc.js",
                "../../proj4js/lib/defs/IGNFRGNCUTM58S.js",
                "../../proj4js/lib/defs/EPSG2975.js",
                "../../proj4js/lib/defs/IGNFRGFG95GEO.js",
                "../../proj4js/lib/defs/IGNFRGM04UTM38S.js",
                "../../proj4js/lib/defs/IGNFWGS84G.js",
                "../../proj4js/lib/defs/IGNFRGNCUTM57S.js",
                "../../proj4js/lib/defs/EPSG4624.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALPYF.js",
//                "../../proj4js/lib/defs/EPSG4640.js",
                "../../proj4js/lib/projCode/laea.js",
                "../../proj4js/lib/defs/IGNFETRS89LAEA.js",
                "../../proj4js/lib/defs/EPSG32743.js",
                "../../proj4js/lib/defs/IGNFUTM20W84GUAD.js",
                "../../proj4js/lib/defs/EPSG4559.js",
                "../../proj4js/lib/defs/EPSG32739.js",
                "../../proj4js/lib/defs/EPSG32707.js",
                "../../proj4js/lib/defs/IGNFTAHAAUTM05S.js",
                "../../proj4js/lib/defs/IGNFMOOREA87U6S.js",
                "../../proj4js/lib/defs/IGNFTAHI79UTM6S.js",
                "../../proj4js/lib/defs/IGNFNUKU72U7S.js",
                "../../proj4js/lib/defs/IGNFIGN63UTM7S.js",
                "../../proj4js/lib/defs/EPSG32757.js",
                "../../proj4js/lib/defs/EPSG3297.js",
                "../../proj4js/lib/defs/EPSG310642801.js",
                "../../proj4js/lib/defs/EPSG310024802.js",
                "../../proj4js/lib/defs/CRS84.js",
                "../../proj4js/lib/defs/IGNFCSG67UTM22.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM6S.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALASP.js",
                "../../proj4js/lib/defs/EPSG4171.js",
                "../../proj4js/lib/projCode/stere.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALGUF.js",
                "../../proj4js/lib/defs/IGNFTERA50STEREO.js",
                "../../proj4js/lib/defs/EPSG3034.js",
                "../../proj4js/lib/defs/IGNFUTM01SW84.js",
                "../../proj4js/lib/defs/IGNFGUAD48UTM20.js",
                "../../proj4js/lib/defs/IGNFRGPFGEO.js",
                "../../proj4js/lib/defs/EPSG32759.js",
                "../../proj4js/lib/defs/IGNFRGSPM06U21.js",
                "../../proj4js/lib/defs/IGNFUTM22RGFG95.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM5S.js",
                "../../proj4js/lib/defs/EPSG3298.js",
                "../../proj4js/lib/defs/EPSG4471.js",
                "../../proj4js/lib/defs/IGNFRGNCUTM59S.js",
                "../../proj4js/lib/defs/EPSG310702807.js",
                "../../proj4js/lib/defs/EPSG32622.js",
                "../../proj4js/lib/defs/EPSG2972.js",
                "../../proj4js/lib/defs/EPSG2986.js",
                "../../proj4js/lib/defs/EPSG32738.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALWLF.js",
                "../../proj4js/lib/defs/IGNFWALL78UTM1S.js",
                "../../proj4js/lib/defs/EPSG310915814.js",
                "../../proj4js/lib/defs/EPSG4258.js",
                "../../proj4js/lib/defs/EPSG310642812.js",
                "../../proj4js/lib/defs/EPSG4627.js",
                "../../proj4js/lib/defs/EPSG310642810.js",
                "../../proj4js/lib/defs/EPSG3035.js",
                "../../proj4js/lib/defs/IGNFUTM42SW84.js",
                "../../proj4js/lib/defs/EPSG4467.js",
                "../../proj4js/lib/defs/IGNFETRS89GEO.js",
                "../../proj4js/lib/defs/EPSG2973.js",
                "../../proj4js/lib/defs/EPSG310032811.js",
                "../../proj4js/lib/defs/EPSG32742.js",
                "../../proj4js/lib/defs/EPSG310486805.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALREU.js",
                "../../proj4js/lib/defs/EPSG32706.js",
                "../../proj4js/lib/defs/EPSG32740.js",
                "../../proj4js/lib/projCode/gstmerc.js",
                "../../proj4js/lib/defs/IGNFREUN47GAUSSL.js",
                "../../proj4js/lib/defs/EPSG2969.js",
                "../../proj4js/lib/defs/EPSG32758.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALCRZ.js",
                "../../proj4js/lib/defs/IGNFRGM04GEO.js",
                "../../proj4js/lib/defs/IGNFMAYO50UTM38S.js",
                "../../proj4js/lib/defs/IGNFMILLER.js",
                "../../proj4js/lib/defs/IGNFUTM39SW84.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM7S.js",
//                "../../proj4js/lib/defs/IGNFSTPL69UTM43S.js",
//                "../../proj4js/lib/defs/EPSG32662.js",
                "../../proj4js/lib/defs/IGNFUTM20W84MART.js",
                "../../proj4js/lib/defs/EPSG5490.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALMYT.js",
                "../../proj4js/lib/defs/IGNFKERG62UTM42S.js",
                "../../proj4js/lib/defs/IGNFRGR92UTM40S.js",
                "../../proj4js/lib/defs/IGNFRGSPM06GEO.js",
                "../../proj4js/lib/projCode/merc.js",
                "../../proj4js/lib/defs/IGNFLAMBE.js",
                "../../proj4js/lib/defs/EPSG27582.js",
                "../../proj4js/lib/defs/EPSG27572.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALSPM.js",
                "../../proj4js/lib/defs/IGNFSTPM50UTM21.js",
                "../../proj4js/lib/defs/IGNFCROZ63UTM39S.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALKER.js",
//                "../../proj4js/lib/defs/IGNFAMST63GEO.js",
                "../../proj4js/lib/defs/IGNFRGR92GEO.js",
                "../../proj4js/lib/defs/EPSG310642813.js",
                "../../proj4js/lib/defs/IGNFUTM43SW84.js",
                "../../proj4js/lib/defs/IGNFWGS84RRAFGEO.js",
                "../../proj4js/lib/defs/EPSG4558.js",
                "../../proj4js/lib/defs/EPSG310706808.js",
                "../../proj4js/lib/defs/EPSG32620.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALNCL.js",
                "../../proj4js/lib/defs/EPSG32606.js",
                "../../proj4js/lib/defs/EPSG310700806.js",
                "../../proj4js/lib/defs/IGNFRGF93G.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALFXX.js",
                "../../proj4js/lib/defs/IGNFWGS84WMSV.js",
                "../../proj4js/lib/defs/EPSG3038.js",
                "../../proj4js/lib/defs/EPSG3039.js",
                "../../proj4js/lib/defs/EPSG3040.js",
                "../../proj4js/lib/defs/EPSG3041.js",
                "../../proj4js/lib/defs/EPSG3042.js",
                "../../proj4js/lib/defs/EPSG3043.js",
                "../../proj4js/lib/defs/EPSG3044.js",
                "../../proj4js/lib/defs/EPSG3045.js",
                "../../proj4js/lib/defs/EPSG3046.js",
                "../../proj4js/lib/defs/EPSG3047.js",
                "../../proj4js/lib/defs/EPSG3048.js",
                "../../proj4js/lib/defs/EPSG3049.js",
                "../../proj4js/lib/defs/EPSG3050.js",
                "../../proj4js/lib/defs/EPSG3051.js",
                "../../proj4js/lib/defs/EPSG25828.js",
                "../../proj4js/lib/defs/EPSG25829.js",
                "../../proj4js/lib/defs/EPSG25830.js",
                "../../proj4js/lib/defs/EPSG25831.js",
                "../../proj4js/lib/defs/EPSG25832.js",
                "../../proj4js/lib/defs/EPSG25833.js",
                "../../proj4js/lib/defs/EPSG25834.js",
                "../../proj4js/lib/defs/EPSG25835.js",
                "../../proj4js/lib/defs/EPSG25836.js",
                "../../proj4js/lib/defs/EPSG25837.js",
                "../../proj4js/lib/defs/EPSG25838.js",
                "../../proj4js/lib/defs/EPSG5489.js",
                "../../proj4js/lib/defs/EPSG4470.js",
                "proj4js/defs/ntf_r93.gsb.js"
                ];
            }
            jsFiles= [].concat(jsFilesOL, jsFilesP4JS, [
                // GEOPORTAL:
                "OpenLayers/OverloadedOpenLayersMinimum.js",
                "Geoportal/Lang.js",
                "Geoportal/Lang/en.js",
                "Geoportal/Lang/fr.js",
                "Geoportal/Lang/de.js",
                "Geoportal/Lang/es.js",
                "Geoportal/Lang/it.js",
                "Geoportal/Util.js",
                "Geoportal/Format.js",
                "Geoportal/Format/WMC.js",
                "Geoportal/Format/WMC/v1_1_0_AutoConf.js",
                "Geoportal/Format/GASR.js",
                "Geoportal/GeoRMHandler.js",
                "Geoportal/Layer.js",
                "Geoportal/Tile.js",
                "Geoportal/Tile/Image.js",
                "Geoportal/Layer/Grid.js",
                "Geoportal/Layer/Aggregate.js",
                "Geoportal/UI.js",
                "Geoportal/Control.js",
                "Geoportal/Control/TermsOfService.js",
                "Geoportal/Layer/WMTS.js",
                "Geoportal/Layer/WMSC.js",
                "Geoportal/Control/Logo.js",
                "Geoportal/Control/PermanentLogo.js",
                "Geoportal/Layer/WMS.js",
                "Geoportal/Catalogue.js",
                "Geoportal/Catalogue/Config.js"
            ]); // etc.
        }

        // See http://trac.osgeo.org/openlayers/ticket/2933
        // use "parser-inserted scripts" for guaranteed execution order
        // http://hsivonen.iki.fi/script-execution/
        var allScriptTags= new Array(jsFiles.length);

        var host= Geoportal._getScriptLocation() + "lib/";
        for (var i= 0, len= jsFiles.length; i < len; i++) {
            allScriptTags[i]= "<script" +
                                " type='text/javascript'" +
                                " src='" + host + jsFiles[i] + "'" +
                                " charset='UTF-8'" +
                              "></script>";
        }
        document.write(allScriptTags.join(""));
    }
})();

/**
 * Constant: VERSION_NUMBER
 * {String} *"Geoportal 2.1.2 Min; publicationDate=2015-04-02"*
 */
Geoportal.VERSION_NUMBER="Geoportal 2.1.2 Min; publicationDate=2015-04-02";
