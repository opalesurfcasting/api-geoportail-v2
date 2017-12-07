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
    var scriptName= (!singleFile) ? "lib/GeoportalStandard.js" : "Geoportal.js";

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
     * The Geoportal standard API based on OpenLayers 2.12.
     *      Aims at providing fullfledge OpenLayers and Geoportail's
     *      capabilities.
     * The Geoportal object provides a namespace for all things Geoportal.
     * The Geoportal standard API provides :
     *
     *      the following OpenLayers classes :
     *          * OpenLayers.Ajax
     *          * OpenLayers.BaseTypes
     *          * OpenLayers.BaseTypes.Bounds
     *          * OpenLayers.BaseTypes.Class
     *          * OpenLayers.BaseTypes.Date
     *          * OpenLayers.BaseTypes.Element
     *          * OpenLayers.BaseTypes.LonLat
     *          * OpenLayers.BaseTypes.Pixel
     *          * OpenLayers.BaseTypes.Size
     *          * OpenLayers.Console
     *          * OpenLayers.Control
     *          * OpenLayers.Control.ArgParser
     *          * OpenLayers.Control.Attribution
     *          * OpenLayers.Control.Button
     *          * OpenLayers.Control.DragFeature
     *          * OpenLayers.Control.DragPan
     *          * OpenLayers.Control.DrawFeature
     *          * OpenLayers.Control.Geolocate
     *          * OpenLayers.Control.Graticule
     *          * OpenLayers.Control.KeyboardDefaults
     *          * OpenLayers.Control.ModifyFeature
     *          * OpenLayers.Control.MousePosition
     *          * OpenLayers.Control.Navigation
     *          * OpenLayers.Control.SelectFeature
     *          * OpenLayers.Control.TransformFeature
     *          * OpenLayers.Control.OverviewMap
     *          * OpenLayers.Control.Pan
     *          * OpenLayers.Control.Panel
     *          * OpenLayers.Control.PanPanel
     *          * OpenLayers.Control.PanZoom
     *          * OpenLayers.Control.WMSGetFeatureInfo
     *          * OpenLayers.Control.WMTSGetFeatureInfo
     *          * OpenLayers.Control.ZoomBox
     *          * OpenLayers.Control.ZoomToMaxExtent
     *          * OpenLayers.Events
     *          * OpenLayers.Feature
     *          * OpenLayers.Feature.Vector
     *          * OpenLayers.Filter
     *          * OpenLayers.Filter.Comparison
     *          * OpenLayers.Filter.FeatureId
     *          * OpenLayers.Filter.Function
     *          * OpenLayers.Filter.Logical
     *          * OpenLayers.Filter.Spatial
     *          * OpenLayers.Format
     *          * OpenLayers.Format.CQL
     *          * OpenLayers.Format.CSWGetDomain
     *          * OpenLayers.Format.CSWGetDomain.v2_0_2
     *          * OpenLayers.Format.CSWGetRecords
     *          * OpenLayers.Format.CSWGetRecords.v2_0_2
     *          * OpenLayers.Format.Context
     *          * OpenLayers.Format.Filter
     *          * OpenLayers.Format.Filter.v1
     *          * OpenLayers.Format.Filter.v1_0_0
     *          * OpenLayers.Format.Filter.v1_1_0
     *          * OpenLayers.Format.GML
     *          * OpenLayers.Format.GML.Base
     *          * OpenLayers.Format.GML.v2
     *          * OpenLayers.Format.GML.v3
     *          * OpenLayers.Format.GeoJSON
     *          * OpenLayers.Format.JSON
     *          * OpenLayers.Format.KML
     *          * OpenLayers.Format.OGCExceptionReport
     *          * OpenLayers.Format.OSM
     *          * OpenLayers.Format.OWSCommon
     *          * OpenLayers.Format.OWSCommon.v1
     *          * OpenLayers.Format.OWSCommon.v1_0_0
     *          * OpenLayers.Format.OWSCommon.v1_1_0
     *          * OpenLayers.Format.QueryStringFilter
     *          * OpenLayers.Format.WKT
     *          * OpenLayers.Format.WMC
     *          * OpenLayers.Format.WMC.v1
     *          * OpenLayers.Format.WMC.v1_0_0
     *          * OpenLayers.Format.WMC.v1_1_0
     *          * OpenLayers.Format.WMSCapabilities
     *          * OpenLayers.Format.WMSCapabilities.v1
     *          * OpenLayers.Format.WMSCapabilities.v1_1
     *          * OpenLayers.Format.WMSCapabilities.v1_1_0
     *          * OpenLayers.Format.WMSCapabilities.v1_1_1
     *          * OpenLayers.Format.WMSCapabilities.v1_1_1_WMSC
     *          * OpenLayers.Format.WMSCapabilities.v1_3
     *          * OpenLayers.Format.WMSCapabilities.v1_3_0
     *          * OpenLayers.Format.WMSDescribeLayer
     *          * OpenLayers.Format.WMSDescribeLayer.v1_1
     *          * OpenLayers.Format.WMSGetFeatureInfo
     *          * OpenLayers.Format.WMTSCapabilities
     *          * OpenLayers.Format.WMTSCapabilities.v1_0_0
     *          * OpenLayers.Format.XML
     *          * OpenLayers.Format.XML.VersionedOGC
     *          * OpenLayers.Geometry
     *          * OpenLayers.Geometry.Collection
     *          * OpenLayers.Geometry.Curve
     *          * OpenLayers.Geometry.LineString
     *          * OpenLayers.Geometry.LinearRing
     *          * OpenLayers.Geometry.MultiLineString
     *          * OpenLayers.Geometry.MultiPoint
     *          * OpenLayers.Geometry.MultiPolygon
     *          * OpenLayers.Geometry.Polygon
     *          * OpenLayers.Geometry.Point
     *          * OpenLayers.Handler
     *          * OpenLayers.Handler.Box
     *          * OpenLayers.Handler.Click
     *          * OpenLayers.Handler.Drag
     *          * OpenLayers.Handler.Feature
     *          * OpenLayers.Handler.Hover
     *          * OpenLayers.Handler.Keyboard
     *          * OpenLayers.Handler.MouseWheel
     *          * OpenLayers.Handler.RegularPolygon
     *          * OpenLayers.Icon
     *          * OpenLayers.Kinetic
     *          * OpenLayers.Lang
     *          * OpenLayers.Layer
     *          * OpenLayers.Layer.Grid
     *          * OpenLayers.Layer.HTTPRequest
     *          * OpenLayers.Layer.GML
     *          * OpenLayers.Layer.Vector
     *          * OpenLayers.Layer.Vector.RootContainer
     *          * OpenLayers.Layer.WMS
     *          * OpenLayers.Layer.WMS.Post
     *          * OpenLayers.Layer.WMS.Untiled
     *          * OpenLayers.Layer.WMTS
     *          * OpenLayers.Layer.XYZ
     *          * OpenLayers.Layer.OSM
     *          * OpenLayers.Layer.Zoomify
     *          * OpenLayers.Map
     *          * OpenLayers.Marker
     *          * OpenLayers.Popup
     *          * OpenLayers.Popup.Anchored
     *          * OpenLayers.Popup.AnchoredBubble
     *          * OpenLayers.Popup.Framed
     *          * OpenLayers.Popup.FramedCloud
     *          * OpenLayers.Projection
     *          * OpenLayers.Protocol
     *          * OpenLayers.Protocol.HTTP
     *          * OpenLayers.Protocol.Script
     *          * OpenLayers.Renderer
     *          * OpenLayers.Renderer.Canvas
     *          * OpenLayers.Renderer.Elements
     *          * OpenLayers.Renderer.NG
     *          * OpenLayers.Renderer.SVG
     *          * OpenLayers.Renderer.SVG2
     *          * OpenLayers.Renderer.VML
     *          * OpenLayers.Request
     *          * OpenLayers.Request.XMLHttpRequest
     *          * OpenLayers.Rule
     *          * OpenLayers.Strategy
     *          * OpenLayers.Strategy.BBOX
     *          * OpenLayers.Strategy.Cluster
     *          * OpenLayers.Strategy.Filter
     *          * OpenLayers.Strategy.Fixed
     *          * OpenLayers.Strategy.Paging
     *          * OpenLayers.Strategy.Refresh
     *          * OpenLayers.Strategy.Save
     *          * OpenLayers.Style
     *          * OpenLayers.StyleMap
     *          * OpenLayers.Symbolizer
     *          * OpenLayers.Symbolizer.Line
     *          * OpenLayers.Symbolizer.Point
     *          * OpenLayers.Symbolizer.Polygon
     *          * OpenLayers.Symbolizer.Raster
     *          * OpenLayers.Symbolizer.Text
     *          * OpenLayers.Tile
     *          * OpenLayers.Tile.Image
     *          * OpenLayers.Tile.Image.IFrame
     *          * OpenLayers.Tween
     *          * OpenLayers.Util
     *          * Rico.Color
     *          * Rico.Corner
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
     *          * EPSG:2969
     *          * EPSG:2972
     *          * EPSG:2973
     *          * EPSG:2975
     *          * EPSG:2986
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
     *          * EPSG:32606
     *          * EPSG:32622
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
     *          * EPSG:3296
     *          * EPSG:3297
     *          * EPSG:3298
     *          * EPSG:3857
     *          * EPSG:4171
     *          * EPSG:4258
     *          * EPSG:4326
     *          * EPSG:4467
     *          * EPSG:4470
     *          * EPSG:4471
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
     *          * IGNF:IGN63UTM7S
     *          * IGNF:KERG62UTM42S
     *          * IGNF:LAMBE
     *          * IGNF:LAMB93
     *          * IGNF:MART38UTM20
     *          * IGNF:MAYO50UTM38S
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
     *          * IGNF:STPM50UTM21
     *          * IGNF:TAHAAUTM05S
     *          * IGNF:TAHI79UTM6S
     *          * IGNF:TERA50STEREO
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
     *          * <Geoportal.Control.AutoComplete>
     *          * <Geoportal.Control.BasicLayerToolbar>
     *          * <Geoportal.Control.CSW>
     *          * <Geoportal.Control.Copyright>
     *          * <Geoportal.Control.Floating>
     *          * <Geoportal.Control.Form>
     *          * <Geoportal.Control.GraphicScale>
     *          * <Geoportal.Control.Graticule>
     *          * <Geoportal.Control.Information>
     *          * <Geoportal.Control.LayerAbstract>
     *          * <Geoportal.Control.LayerCatalog>
     *          * <Geoportal.Control.LayerLegend>
     *          * <Geoportal.Control.LayerMetadata>
     *          * <Geoportal.Control.LayerOpacity>
     *          * <Geoportal.Control.LayerOpacitySlider>
     *          * <Geoportal.Control.LayerSwitcher>
     *          * <Geoportal.Control.Loading>
     *          * <Geoportal.Control.LocationUtilityService>
     *          * <Geoportal.Control.LocationUtilityService.CadastralParcel>
     *          * <Geoportal.Control.LocationUtilityService.GeoNames>
     *          * <Geoportal.Control.LocationUtilityService.Geocode>
     *          * <Geoportal.Control.LocationUtilityService.GeodeticFixedPoint>
     *          * <Geoportal.Control.LocationUtilityService.ReverseGeocode>
     *          * <Geoportal.Control.Logo>
     *          * <Geoportal.Control.MousePosition>
     *          * <Geoportal.Control.NavToolbar>
     *          * <Geoportal.Control.OverviewMap>
     *          * <Geoportal.Control.PageManager>
     *          * <Geoportal.Control.Panel>
     *          * <Geoportal.Control.PanelToggle>
     *          * <Geoportal.Control.PermanentLogo>
     *          * <Geoportal.Control.PrintMap>
     *          * <Geoportal.Control.Projections>
     *          * <Geoportal.Control.RemoveLayer>
     *          * <Geoportal.Control.SearchToolbar>
     *          * <Geoportal.Control.SliderBase>
     *          * <Geoportal.Control.TermsOfService>
     *          * <Geoportal.Control.TerritorySelector>
     *          * <Geoportal.Control.ToggleControl>
     *          * <Geoportal.Control.ToolBox>
     *          * <Geoportal.Control.ZoomBar>
     *          * <Geoportal.Control.ZoomSlider>
     *          * <Geoportal.Control.ZoomToLayerMaxExtent>
     *          * <Geoportal.Format>
     *          * <Geoportal.Format.GPX>
     *          * <Geoportal.Format.GPX.v1>
     *          * <Geoportal.Format.GPX.v1_0>
     *          * <Geoportal.Format.GPX.v1_1>
     *          * <Geoportal.Format.Geoconcept>
     *          * <Geoportal.Format.WMC>
     *          * <Geoportal.Format.WMC.v1_1_0_AutoConf>
     *          * <Geoportal.Format.XLS>
     *          * <Geoportal.Format.XLS.v1_0>
     *          * <Geoportal.Format.XLS.v1_0.LocationUtilityService>
     *          * <Geoportal.Format.XLS.v1_1>
     *          * <Geoportal.Format.XLS.v1_1.LocationUtilityService>
     *          * <Geoportal.Format.XLS.v1_2>
     *          * <Geoportal.Format.XLS.v1_2.LocationUtilityService>
     *          * <Geoportal.GeoRMHandler>
     *          * <Geoportal.InterfaceViewer>
     *          * <Geoportal.InterfaceViewer.JS>
     *          * <Geoportal.Lang>
     *          * <Geoportal.Layer>
     *          * <Geoportal.Layer.Aggregate>
     *          * <Geoportal.Layer.Grid>
     *          * <Geoportal.Layer.GXT>
     *          * <Geoportal.Layer.OpenLS>
     *          * <Geoportal.Layer.OpenLS.Core>
     *          * <Geoportal.Layer.OpenLS.Core.LocationUtilityService>
     *          * <Geoportal.Layer.Vector>
     *          * <Geoportal.Layer.Vector.Tiled>
     *          * <Geoportal.Layer.WMS>
     *          * <Geoportal.Layer.WMSC>
     *          * <Geoportal.Layer.WMTS>
     *          * <Geoportal.Loader>
     *          * <Geoportal.Loader.JS>
     *          * <Geoportal.Map>
     *          * <Geoportal.OLS>
     *          * <Geoportal.OLS.AbstractAddress>
     *          * <Geoportal.OLS.AbstractBody>
     *          * <Geoportal.OLS.AbstractHeader>
     *          * <Geoportal.OLS.AbstractLocation>
     *          * <Geoportal.OLS.AbstractPosition>
     *          * <Geoportal.OLS.AbstractRequestParameters>
     *          * <Geoportal.OLS.AbstractResponseParameters>
     *          * <Geoportal.OLS.AbstractStreetLocator>
     *          * <Geoportal.OLS.Address>
     *          * <Geoportal.OLS.Building>
     *          * <Geoportal.OLS.Error>
     *          * <Geoportal.OLS.ErrorList>
     *          * <Geoportal.OLS.HorizontalAcc>
     *          * <Geoportal.OLS.LUS>
     *          * <Geoportal.OLS.LUS.GeocodedAddress>
     *          * <Geoportal.OLS.LUS.GeocodeRequest>
     *          * <Geoportal.OLS.LUS.GeocodeResponse>
     *          * <Geoportal.OLS.LUS.GeocodeResponseList>
     *          * <Geoportal.OLS.LUS.ReverseGeocodedLocation>
     *          * <Geoportal.OLS.LUS.ReverseGeocodePreference>
     *          * <Geoportal.OLS.LUS.ReverseGeocodeRequest>
     *          * <Geoportal.OLS.LUS.ReverseGeocodeResponse>
     *          * <Geoportal.OLS.LUS.SearchCentreDistance>
     *          * <Geoportal.OLS.GeocodeMatchCode>
     *          * <Geoportal.OLS.Place>
     *          * <Geoportal.OLS.Position>
     *          * <Geoportal.OLS.PostalCode>
     *          * <Geoportal.OLS.QualityOfPosition>
     *          * <Geoportal.OLS.Response>
     *          * <Geoportal.OLS.ResponseHeader>
     *          * <Geoportal.OLS.Request>
     *          * <Geoportal.OLS.RequestHeader>
     *          * <Geoportal.OLS.Street>
     *          * <Geoportal.OLS.StreetAddress>
     *          * <Geoportal.OLS.UOM>
     *          * <Geoportal.OLS.UOM.AbstractMeasure>
     *          * <Geoportal.OLS.UOM.Angle>
     *          * <Geoportal.OLS.UOM.Distance>
     *          * <Geoportal.OLS.UOM.Distance.Altitude>
     *          * <Geoportal.OLS.UOM.Speed>
     *          * <Geoportal.OLS.UOM.Time>
     *          * <Geoportal.OLS.UOM.TimeStamp>
     *          * <Geoportal.OLS.VerticalAcc>
     *          * <Geoportal.OLS.XLS>
     *          * <Geoportal.Popup>
     *          * <Geoportal.Popup.Anchored>
     *          * <Geoportal.Strategy>
     *          * <Geoportal.Strategy.Tiled>
     *          * <Geoportal.Tile>
     *          * <Geoportal.Tile.Image>
     *          * <Geoportal.UI>
     *          * <Geoportal.UI.Button>
     *          * <Geoportal.UI.JQuery>
     *          * <Geoportal.UI.JQuery.Button>
     *          * <Geoportal.UI.JQuery.Mobile>
     *          * <Geoportal.UI.JQuery.Panel>
     *          * <Geoportal.UI.Panel>
     *          * <Geoportal.Util>
     *          * <Geoportal.Viewer>
     *          * <Geoportal.Viewer.Default>
     *          * <Geoportal.Viewer.Simple>
     *          * <Geoportal.Viewer.Standard>
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
            jsFiles= [
                // OPENLAYERS:
                "../../openlayers/lib/OpenLayers/SingleFile.js",//make OpenLayers believes it is compacted!
                "../../openlayers/lib/OpenLayers/Animation.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Class.js",
                "../../openlayers/lib/OpenLayers/BaseTypes.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Bounds.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Element.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/LonLat.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Pixel.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Size.js",
                "../../openlayers/lib/OpenLayers/Console.js",
                "../../openlayers/lib/OpenLayers/Lang.js",
                "../../openlayers/lib/OpenLayers/Util.js",
                "../../openlayers/lib/OpenLayers/Format.js",
                "../../openlayers/lib/OpenLayers/Format/CSWGetRecords.js",
                "../../openlayers/lib/OpenLayers/Control.js",
                "../../openlayers/lib/OpenLayers/Events.js",
                "../../openlayers/lib/OpenLayers/Events/buttonclick.js",
                "../../openlayers/lib/OpenLayers/Control/OverviewMap.js",
                "../../openlayers/lib/OpenLayers/Feature.js",
                "../../openlayers/lib/OpenLayers/Feature/Vector.js",
                "../../openlayers/lib/OpenLayers/Format/WKT.js",
                "../../openlayers/lib/OpenLayers/Geometry.js",
                "../../openlayers/lib/OpenLayers/Strategy.js",
                "../../openlayers/lib/OpenLayers/Style.js",
                "../../openlayers/lib/OpenLayers/Filter.js",
                "../../openlayers/lib/OpenLayers/Strategy/Filter.js",
                "../../openlayers/lib/OpenLayers/Geometry/Collection.js",
                "../../openlayers/lib/OpenLayers/Geometry/Point.js",
                "../../openlayers/lib/OpenLayers/Geometry/MultiPoint.js",
                "../../openlayers/lib/OpenLayers/Geometry/Curve.js",
                "../../openlayers/lib/OpenLayers/Geometry/LineString.js",
                "../../openlayers/lib/OpenLayers/Geometry/LinearRing.js",
                "../../openlayers/lib/OpenLayers/Strategy/Save.js",
                "../../openlayers/lib/OpenLayers/Renderer.js",
                "../../openlayers/lib/OpenLayers/Renderer/Canvas.js",
                "../../openlayers/lib/OpenLayers/Format/XML.js",
                "../../openlayers/lib/OpenLayers/Geometry/Polygon.js",
                "../../openlayers/lib/OpenLayers/Projection.js",
                "../../openlayers/lib/OpenLayers/Format/OSM.js",
                "../../openlayers/lib/OpenLayers/Geometry/MultiLineString.js",
                "../../openlayers/lib/OpenLayers/Geometry/MultiPolygon.js",
                "../../openlayers/lib/OpenLayers/Format/GML.js",
                "../../openlayers/lib/OpenLayers/Format/GML/Base.js",
                "../../openlayers/lib/OpenLayers/Format/GML/v3.js",
                "../../openlayers/lib/OpenLayers/Handler.js",
                "../../openlayers/lib/OpenLayers/Handler/Drag.js",
                "../../openlayers/lib/OpenLayers/Handler/Feature.js",
                "../../openlayers/lib/OpenLayers/Control/DragFeature.js",
                "../../openlayers/lib/OpenLayers/Tween.js",
                "../../openlayers/lib/OpenLayers/Map.js",
                "../../openlayers/lib/OpenLayers/Layer.js",
                "../../openlayers/lib/OpenLayers/StyleMap.js",
                "../../openlayers/lib/OpenLayers/Layer/Vector.js",
                "../../openlayers/lib/OpenLayers/Layer/Vector/RootContainer.js",
                "../../openlayers/lib/OpenLayers/Control/SelectFeature.js",
                "../../openlayers/lib/OpenLayers/Handler/Point.js",
                "../../openlayers/lib/OpenLayers/Handler/Path.js",
                "../../openlayers/lib/OpenLayers/Handler/Keyboard.js",
                "../../openlayers/lib/OpenLayers/Control/ModifyFeature.js",
                "../../openlayers/lib/OpenLayers/Handler/MouseWheel.js",
                "../../openlayers/lib/OpenLayers/Control/ZoomToMaxExtent.js",
                "../../openlayers/lib/OpenLayers/Tile.js",
                "../../openlayers/lib/OpenLayers/Tile/Image.js",
                "../../openlayers/lib/OpenLayers/Format/OGCExceptionReport.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/XML/VersionedOGC.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities.js",
                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1.js",
                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_3.js",
                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_3_0.js",
                "../../openlayers/lib/OpenLayers/Filter/FeatureId.js",
                "../../openlayers/lib/OpenLayers/Filter/Logical.js",
                "../../openlayers/lib/OpenLayers/Filter/Comparison.js",
                "../../openlayers/lib/OpenLayers/Format/Filter.js",
                "../../openlayers/lib/OpenLayers/Renderer/Elements.js",
                "../../openlayers/lib/OpenLayers/Control/Panel.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon/v1.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon/v1_0_0.js",
                "../../openlayers/lib/OpenLayers/Strategy/Fixed.js",
                "../../openlayers/lib/OpenLayers/Control/Pan.js",
                "../../openlayers/lib/OpenLayers/Layer/HTTPRequest.js",
                "../../openlayers/lib/OpenLayers/Layer/Grid.js",
                "../../openlayers/lib/OpenLayers/Layer/WMS.js",
//                "../../openlayers/lib/OpenLayers/Layer/WMS/Untiled.js",
                "../../openlayers/lib/OpenLayers/Format/CSWGetDomain.js",
                "../../openlayers/lib/OpenLayers/Format/CSWGetDomain/v2_0_2.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Date.js",//NEW
                "../../openlayers/lib/OpenLayers/Request.js",
                "../../openlayers/lib/OpenLayers/Request/XMLHttpRequest.js",
                "../../openlayers/lib/OpenLayers/Format/KML.js",
                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_1.js",
                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_1_0.js",
                "../../openlayers/lib/OpenLayers/Filter/Spatial.js",
                "../../openlayers/lib/OpenLayers/Strategy/BBOX.js",
//                "../../openlayers/lib/OpenLayers/Layer/GML.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon/v1_1_0.js",
                "../../openlayers/lib/OpenLayers/Control/PanPanel.js",
                "../../openlayers/lib/OpenLayers/Control/Attribution.js",
//                "../../openlayers/lib/OpenLayers/Renderer/NG.js",//NEW
//                "../../openlayers/lib/OpenLayers/Renderer/SVG2.js",//NEW
                "../../openlayers/lib/OpenLayers/Kinetic.js",//NEW
//                "../../openlayers/lib/OpenLayers/Ajax.js",
                "../../openlayers/lib/OpenLayers/Control/TransformFeature.js",
                "../../openlayers/lib/OpenLayers/Layer/XYZ.js",
                 "../../openlayers/lib/OpenLayers/Layer/OSM.js",
                "../../openlayers/lib/OpenLayers/Format/Context.js",
                "../../openlayers/lib/OpenLayers/Format/WMC.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1_1_0.js",
                "../../openlayers/lib/OpenLayers/Renderer/SVG.js",
                "../../openlayers/lib/OpenLayers/Format/WMSDescribeLayer.js",
                "../../openlayers/lib/OpenLayers/Format/WMSDescribeLayer/v1_1.js",
                "../../openlayers/lib/OpenLayers/Symbolizer.js",
                "../../openlayers/lib/OpenLayers/Control/PanZoom.js",
                "../../openlayers/lib/OpenLayers/Format/JSON.js",
                "../../openlayers/lib/OpenLayers/Format/GeoJSON.js",
                "../../openlayers/lib/OpenLayers/Strategy/Paging.js",
                "../../openlayers/lib/OpenLayers/Popup.js",
                "../../openlayers/lib/OpenLayers/Popup/Anchored.js",
                "../../openlayers/lib/OpenLayers/Popup/Framed.js",
                "../../openlayers/lib/OpenLayers/Layer/WMTS.js",
                "../../openlayers/lib/OpenLayers/Format/WMSGetFeatureInfo.js",
                "../../openlayers/lib/OpenLayers/Format/WMTSCapabilities.js",
                "../../openlayers/lib/OpenLayers/Control/Button.js",
                "../../openlayers/lib/OpenLayers/Format/GML/v2.js",
                "../../openlayers/lib/OpenLayers/Filter/Function.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/Filter/v1.js",
                "../../openlayers/lib/OpenLayers/Format/Filter/v1_0_0.js",
                "../../openlayers/lib/OpenLayers/Format/Filter/v1_1_0.js",
                "../../openlayers/lib/OpenLayers/Format/CSWGetRecords/v2_0_2.js",
                "../../openlayers/lib/OpenLayers/Handler/Click.js",
                "../../openlayers/lib/OpenLayers/Handler/Hover.js",
                "../../openlayers/lib/OpenLayers/Handler/Polygon.js",
                "../../openlayers/lib/OpenLayers/Control/WMTSGetFeatureInfo.js",
                "../../openlayers/lib/OpenLayers/Control/Measure.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1_0_0.js",
                "../../openlayers/lib/OpenLayers/Format/WMTSCapabilities/v1_0_0.js",
                "../../openlayers/lib/OpenLayers/Renderer/VML.js",
                "../../openlayers/lib/OpenLayers/Control/DrawFeature.js",
                "../../openlayers/lib/OpenLayers/Popup/FramedCloud.js",
                "../../openlayers/lib/OpenLayers/Symbolizer/Point.js",
                "../../openlayers/lib/OpenLayers/Symbolizer/Line.js",
                "../../openlayers/lib/OpenLayers/Symbolizer/Polygon.js",
                "../../openlayers/lib/OpenLayers/Symbolizer/Text.js",
                "../../openlayers/lib/OpenLayers/Symbolizer/Raster.js",
                "../../openlayers/lib/OpenLayers/Rule.js",
                "../../openlayers/lib/OpenLayers/Handler/Box.js",
                "../../openlayers/lib/OpenLayers/Control/ZoomBox.js",
                "../../openlayers/lib/OpenLayers/Control/DragPan.js",
                "../../openlayers/lib/OpenLayers/Control/Navigation.js",
                "../../openlayers/lib/OpenLayers/Strategy/Refresh.js",
                "../../openlayers/lib/OpenLayers/Control/Geolocate.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/QueryStringFilter.js",//NEW
                "../../openlayers/lib/Rico/Color.js",
                "../../openlayers/lib/Rico/Corner.js",
                "../../openlayers/lib/OpenLayers/Popup/AnchoredBubble.js",
                "../../openlayers/lib/OpenLayers/Strategy/Cluster.js",
                "../../openlayers/lib/OpenLayers/Control/MousePosition.js",
                "../../openlayers/lib/OpenLayers/Layer/Zoomify.js",
                "../../openlayers/lib/OpenLayers/Handler/RegularPolygon.js",
                "../../openlayers/lib/OpenLayers/Protocol.js",
                "../../openlayers/lib/OpenLayers/Protocol/HTTP.js",
                "../../openlayers/lib/OpenLayers/Control/Graticule.js",
                "../../openlayers/lib/OpenLayers/Protocol/Script.js",//NEW
                "../../openlayers/lib/OpenLayers/Tile/Image/IFrame.js",
//                "../../openlayers/lib/OpenLayers/Layer/WMS/Post.js",
                "../../openlayers/lib/OpenLayers/Control/WMSGetFeatureInfo.js",
                "../../openlayers/lib/OpenLayers/Format/CQL.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_1_1.js",
                "../../openlayers/lib/OpenLayers/Format/WMSCapabilities/v1_1_1_WMSC.js",
                "../../openlayers/lib/OpenLayers/Control/KeyboardDefaults.js",
                "../../openlayers/lib/OpenLayers/Control/ArgParser.js",
                "../../openlayers/lib/OpenLayers/Icon.js",
                "../../openlayers/lib/OpenLayers/Marker.js",
                "../../openlayers/lib/OpenLayers/Lang/en.js",
                "../../openlayers/lib/OpenLayers/Lang/de.js",
                "../../openlayers/lib/OpenLayers/Lang/es.js",
                "../../openlayers/lib/OpenLayers/Lang/fr.js",
                "../../openlayers/lib/OpenLayers/Lang/it.js",
                // FLEX:
//                "../../flex/lib/swfobject.js",
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
                "../../proj4js/lib/defs/EPSG4558.js",
                "../../proj4js/lib/defs/EPSG4559.js",
                "../../proj4js/lib/defs/IGNFRGFG95GEO.js",
                "../../proj4js/lib/defs/IGNFRGM04UTM38S.js",
                "../../proj4js/lib/defs/IGNFWGS84G.js",
                "../../proj4js/lib/defs/IGNFRGNCUTM57S.js",
                "../../proj4js/lib/defs/EPSG4624.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALPYF.js",
//                "../../proj4js/lib/defs/EPSG4640.js",
                "../../proj4js/lib/projCode/laea.js",
                "../../proj4js/lib/defs/IGNFMAYO50UTM38S.js",
                "../../proj4js/lib/defs/IGNFETRS89LAEA.js",
                "../../proj4js/lib/defs/EPSG32743.js",
                "../../proj4js/lib/defs/IGNFUTM20W84GUAD.js",
                "../../proj4js/lib/defs/EPSG32739.js",
                "../../proj4js/lib/defs/EPSG32707.js",
                "../../proj4js/lib/defs/EPSG32757.js",
                "../../proj4js/lib/defs/EPSG3297.js",
                "../../proj4js/lib/defs/EPSG310642801.js",
                "../../proj4js/lib/defs/EPSG310024802.js",
                "../../proj4js/lib/defs/IGNFLAMBE.js",
                "../../proj4js/lib/defs/EPSG27572.js",
                "../../proj4js/lib/defs/EPSG27582.js",
                "../../proj4js/lib/defs/CRS84.js",
                "../../proj4js/lib/defs/IGNFCSG67UTM22.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM6S.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALASP.js",
                "../../proj4js/lib/defs/IGNFIGN63UTM7S.js",
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
                "../../proj4js/lib/defs/IGNFSTPM50UTM21.js",
                "../../proj4js/lib/defs/IGNFUTM22RGFG95.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM5S.js",
                "../../proj4js/lib/defs/IGNFTAHAAUTM05S.js",
                "../../proj4js/lib/defs/IGNFMOOREA87U6S.js",
                "../../proj4js/lib/defs/IGNFTAHI79UTM6S.js",
                "../../proj4js/lib/defs/IGNFNUKU72U7S.js",
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
                "../../proj4js/lib/projCode/gstmerc.js",
                "../../proj4js/lib/defs/IGNFREUN47GAUSSL.js",
                "../../proj4js/lib/defs/EPSG32706.js",
                "../../proj4js/lib/defs/EPSG32740.js",
                "../../proj4js/lib/defs/EPSG2969.js",
                "../../proj4js/lib/defs/EPSG32758.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALCRZ.js",
                "../../proj4js/lib/defs/IGNFRGM04GEO.js",
                "../../proj4js/lib/defs/IGNFMILLER.js",
                "../../proj4js/lib/defs/IGNFUTM39SW84.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM7S.js",
//                "../../proj4js/lib/defs/IGNFSTPL69UTM43S.js",
//                "../../proj4js/lib/defs/EPSG32662.js",
                "../../proj4js/lib/defs/IGNFUTM20W84MART.js",
                "../../proj4js/lib/defs/EPSG5490.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALMYT.js",
                "../../proj4js/lib/defs/IGNFRGR92UTM40S.js",
                "../../proj4js/lib/defs/IGNFRGSPM06GEO.js",
                "../../proj4js/lib/projCode/merc.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALSPM.js",
                "../../proj4js/lib/defs/IGNFCROZ63UTM39S.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALKER.js",
//                "../../proj4js/lib/defs/IGNFAMST63GEO.js",
                "../../proj4js/lib/defs/IGNFRGR92GEO.js",
                "../../proj4js/lib/defs/EPSG310642813.js",
                "../../proj4js/lib/defs/IGNFUTM43SW84.js",
                "../../proj4js/lib/defs/IGNFWGS84RRAFGEO.js",
                "../../proj4js/lib/defs/EPSG310706808.js",
//                "../../proj4js/lib/defs/EPSG32705.js",
//                "../../proj4js/lib/defs/EPSG32620.js",
//                "../../proj4js/lib/defs/EPSG32701.js",
                "../../proj4js/lib/defs/IGNFGEOPORTALNCL.js",
                "../../proj4js/lib/defs/EPSG32606.js",
                "../../proj4js/lib/defs/EPSG310700806.js",
                "../../proj4js/lib/defs/IGNFRGF93G.js",
                "../../proj4js/lib/defs/IGNFKERG62UTM42S.js",
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
                "proj4js/defs/ntf_r93.gsb.js",
                // GEOPORTAL:
                "OpenLayers/OverloadedOpenLayersMinimum.js",
                "OpenLayers/OverloadedOpenLayersStandard.js",
                "Geoportal/Lang.js",
                "Geoportal/Lang/en.js",
                "Geoportal/Lang/fr.js",
                "Geoportal/Lang/de.js",
                "Geoportal/Lang/es.js",
                "Geoportal/Lang/it.js",
                "Geoportal/Layer.js",
                "Geoportal/Format.js",
                "Geoportal/Format/XLS.js",
                "Geoportal/Format/GASR.js",
                "Geoportal/OLS.js",
                "Geoportal/OLS/XLS.js",
                "Geoportal/OLS/AbstractHeader.js",
                "Geoportal/OLS/Error.js",
                "Geoportal/OLS/ErrorList.js",
                "Geoportal/OLS/ResponseHeader.js",
                "Geoportal/OLS/AbstractBody.js",
                "Geoportal/OLS/AbstractResponseParameters.js",
                "Geoportal/OLS/Response.js",
                "Geoportal/Format/XLS/v1_1.js",
                "Geoportal/OLS/AbstractRequestParameters.js",
                "Geoportal/OLS/LUS.js",
                "Geoportal/OLS/AbstractLocation.js",
                "Geoportal/OLS/AbstractAddress.js",
                "Geoportal/OLS/AbstractStreetLocator.js",
                "Geoportal/OLS/Street.js",
                "Geoportal/OLS/StreetAddress.js",
                "Geoportal/OLS/Place.js",
                "Geoportal/OLS/PostalCode.js",
                "Geoportal/OLS/Address.js",
                "Geoportal/OLS/LUS/GeocodeRequest.js",
                "Geoportal/OLS/GeocodeMatchCode.js",
                "Geoportal/OLS/LUS/GeocodedAddress.js",
                "Geoportal/OLS/LUS/GeocodeResponseList.js",
                "Geoportal/OLS/LUS/GeocodeResponse.js",
                "Geoportal/OLS/AbstractPosition.js",
                "Geoportal/OLS/UOM.js",
                "Geoportal/OLS/UOM/AbstractMeasure.js",
                "Geoportal/OLS/UOM/Distance.js",
                "Geoportal/OLS/UOM/Angle.js",
                "Geoportal/OLS/HorizontalAcc.js",
                "Geoportal/OLS/VerticalAcc.js",
                "Geoportal/OLS/QualityOfPosition.js",
                "Geoportal/OLS/UOM/TimeStamp.js",
                "Geoportal/OLS/UOM/Time.js",
                "Geoportal/OLS/UOM/Speed.js",
                "Geoportal/OLS/Position.js",
                "Geoportal/OLS/LUS/ReverseGeocodePreference.js",
                "Geoportal/OLS/LUS/ReverseGeocodeRequest.js",
                "Geoportal/OLS/LUS/SearchCentreDistance.js",
                "Geoportal/OLS/LUS/ReverseGeocodedLocation.js",
                "Geoportal/OLS/LUS/ReverseGeocodeResponse.js",
                "Geoportal/Format/XLS/v1_1/LocationUtilityService.js",
                "Geoportal/Format/XLS/v1_0.js",
                "Geoportal/Format/XLS/v1_0/LocationUtilityService.js",
                "Geoportal/Layer/OpenLS.js",
                "Geoportal/Layer/OpenLS/Core.js",
                "Geoportal/Format/GPX.js",
                "Geoportal/Format/GPX/v1.js",
                "Geoportal/Format/GPX/v1_1.js",
                "Geoportal/UI.js",
                "Geoportal/Control.js",
                "Geoportal/Control/SliderBase.js",
                "Geoportal/Control/ZoomSlider.js",
                "Geoportal/Util.js",
                "Geoportal/Control/ZoomBar.js",
                "Geoportal/Control/Copyright.js",
                "Geoportal/Control/GraphicScale.js",
                "Geoportal/Control/Projections.js",
                "Geoportal/Control/Floating.js",
                "Geoportal/Control/Form.js",
                "Geoportal/Control/MousePosition.js",
                "Geoportal/Control/Information.js",
                "Geoportal/Control/PageManager.js",
                "Geoportal/Control/CSW.js",
                "Geoportal/Control/LayerMetadata.js",
                "Geoportal/UI/Panel.js",
                "Geoportal/Control/Panel.js",
                "Geoportal/Control/PanelToggle.js",
                "Geoportal/Control/RemoveLayer.js",
                "Geoportal/Control/LayerOpacitySlider.js",
                "Geoportal/Control/LayerOpacity.js",
                "Geoportal/Control/ZoomToLayerMaxExtent.js",
                "Geoportal/Control/BasicLayerToolbar.js",
                "Geoportal/Layer/Aggregate.js",
                "Geoportal/Format/WMC.js",
                "Geoportal/Format/WMC/v1_1_0_AutoConf.js",
                "Geoportal/GeoRMHandler.js",                
                "Geoportal/Control/Logo.js",
                "Geoportal/Control/ToggleControl.js",
                "Geoportal/Control/ToolBox.js",
                "Geoportal/Control/NavToolbar.js",
                "Geoportal/Control/Loading.js",
                "Geoportal/Control/LayerAbstract.js",
                "Geoportal/Control/LayerLegend.js",
                "Geoportal/Control/LayerSwitcher.js",
                "Geoportal/Control/PrintMap.js",
                "Geoportal/Control/PrintMapDOM.js",
                "Geoportal/OLS/RequestHeader.js",
                "Geoportal/OLS/Request.js",
                "Geoportal/Layer/OpenLS/Core/LocationUtilityService.js",
                "Geoportal/Control/LocationUtilityService.js",
                "Geoportal/Control/AutoComplete.js",
                "Geoportal/Control/LocationUtilityService/GeoNames.js",
                "Geoportal/Control/LocationUtilityService/Geocode.js",
                "Geoportal/Control/LocationUtilityService/ReverseGeocode.js",
                "Geoportal/Control/SearchToolbar.js",
                "Geoportal/Control/TerritorySelector.js",
                "Geoportal/Popup.js",
                "Geoportal/Layer/Vector.js",
                "Geoportal/Control/Compass.js",
                "Geoportal/Tile.js",
                "Geoportal/Control/PermanentLogo.js",
                "Geoportal/Control/Measure.js",
                "Geoportal/Control/Measure/ElevationPath.js",
                "Geoportal/Control/Measure/Elevation.js",
                "Geoportal/Control/Measure/ElevationComponent.js",
                "Geoportal/Control/Measure/ElevationRequest.js",
                "Geoportal/Control/Measure/Azimuth.js",
                "Geoportal/Control/MeasureToolbar.js",
                "Geoportal/Handler.js",
                "Geoportal/Handler/Path.js",
                "Geoportal/Handler/LengthRestrictedPath.js",
                "Geoportal/UI/JQuery.js",
                "Geoportal/Strategy.js",
                "Geoportal/Strategy/Tiled.js",
                "Geoportal/Popup/Anchored.js",
                "Geoportal/Format/Geoconcept.js",
                "Geoportal/Tile/Image.js",
                "Geoportal/Control/EditFeature.js",
                "Geoportal/Layer/Vector/Tiled.js",
                "Geoportal/OLS/Building.js",
                "Geoportal/OLS/UOM/Distance/Altitude.js",
                "Geoportal/Format/XLS/v1_2.js",
                "Geoportal/Format/XLS/v1_2/LocationUtilityService.js",
                "Geoportal/Layer/GXT.js",
                "Geoportal/UI/JQuery/Button.js",
                "Geoportal/Layer/Grid.js",
                "Geoportal/Control/TermsOfService.js",
                "Geoportal/Layer/WMTS.js",
                "Geoportal/Control/LayerCatalog.js",
                "Geoportal/Control/PanPanel.js",
                "Geoportal/Control/OverviewMap.js",
                "Geoportal/UI/JQuery/Mobile.js",
                "Geoportal/UI/JQuery/Panel.js",
                "Geoportal/UI/Button.js",
                "Geoportal/Layer/WMS.js",
                "Geoportal/Control/Graticule.js",
                "Geoportal/Format/GPX/v1_0.js",
                "Geoportal/Layer/WMSC.js",
                "Geoportal/Control/LocationUtilityService/GeodeticFixedPoint.js",
                "Geoportal/Control/LocationUtilityService/CadastralParcel.js",
                "Geoportal/Map.js",
                "Geoportal/Catalogue.js",
                "Geoportal/Catalogue/Config.js",
                "Geoportal/Viewer.js",
                "Geoportal/Viewer/Simple.js",
                "Geoportal/Viewer/Default.js",
                "Geoportal/Viewer/Standard.js",
                "Geoportal/InterfaceViewer.js",
                "Geoportal/InterfaceViewer/JS.js",
                "Geoportal/Loader.js",
                "Geoportal/Loader/JS.js"
            ]; // etc.
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
 * {String} *"Geoportal 2.1.2 Standard ; publicationDate=2015-04-02"*
 */
Geoportal.VERSION_NUMBER="Geoportal 2.1.2 Standard ; publicationDate=2015-04-02";
