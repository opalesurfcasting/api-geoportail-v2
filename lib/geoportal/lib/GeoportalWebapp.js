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
    var scriptName= (!singleFile) ? "lib/GeoportalWebapp.js" : "Geoportal.js";

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
     * The Geoportal mobile API based on OpenLayers 2.12.
     *      Aims at providing fullfledge OpenLayers and Geoportail's
     *      capabilities.
     * The Geoportal object provides a namespace for all things Geoportal.
     * The Geoportal weabapp API provides :
     *
     *      the following OpenLayers classes :
     *          * OpenLayers.SingleFile.js
     *          * OpenLayers.BaseTypes.Class.js
     *          * OpenLayers.Console.js
     *          * OpenLayers.Control.js
     *          * OpenLayers.Control.Panel.js
     *          * OpenLayers.Control.ZoomIn.js
     *          * OpenLayers.Control.ZoomOut.js
     *          * OpenLayers.Lang.js
     *          * OpenLayers.BaseTypes.js
     *          * OpenLayers.BaseTypes.Bounds.js
     *          * OpenLayers.BaseTypes.Element.js
     *          * OpenLayers.BaseTypes.LonLat.js
     *          * OpenLayers.BaseTypes.Pixel.js
     *          * OpenLayers.BaseTypes.Size.js
     *          * OpenLayers.Util.js
     *          * OpenLayers.Format.js
     *          * OpenLayers.Feature.js
     *          * OpenLayers.Feature.Vector.js
     *          * OpenLayers.Geometry.js
     *          * OpenLayers.Geometry.Point.js
     *          * OpenLayers.Events.js
     *          * OpenLayers.Handler.js
     *          * OpenLayers.Geometry.Polygon.js
     *          * OpenLayers.Renderer.js
     *          * OpenLayers.Renderer.Canvas.js
     *          * OpenLayers.Handler.Drag.js
     *          * OpenLayers.Handler.Feature.js
     *          * OpenLayers.Control.DragFeature.js
     *          * OpenLayers.Tween.js
     *          * OpenLayers.Map.js
     *          * OpenLayers.Projection.js
     *          * OpenLayers.Layer.js
     *          * OpenLayers.Style.js
     *          * OpenLayers.StyleMap.js
     *          * OpenLayers.Layer.Vector.js
     *          * OpenLayers.Control.SelectFeature.js
     *          * OpenLayers.Handler.Keyboard.js
     *          * OpenLayers.Layer.HTTPRequest.js
     *          * OpenLayers.Layer.Grid.js
     *          * OpenLayers.Tile.js
     *          * OpenLayers.Tile.Image.js
     *          * OpenLayers.Layer.XYZ.js
     *          * OpenLayers.Layer.SphericalMercator.js
     *          * OpenLayers.Format.JSON.js
     *          * OpenLayers.Renderer.Elements.js
     *          * OpenLayers.Strategy.js
     *          * OpenLayers.Strategy.Fixed.js
     *          * OpenLayers.Control.Pan.js
     *          * OpenLayers.Format.XML.js
     *          * OpenLayers.Request.js
     *          * OpenLayers.Request.XMLHttpRequest.js
     *          * OpenLayers.Format.KML.js
     *          * OpenLayers.Filter.js
     *          * OpenLayers.Filter.Spatial.js
     *          * OpenLayers.Strategy.BBOX.js
     *          * OpenLayers.Format.OGCExceptionReport.js
     *          * OpenLayers.Format.XML.VersionedOGC.js
     *          * OpenLayers.Format.OWSCommon.js
     *          * OpenLayers.Format.OWSCommon.v1.js
     *          * OpenLayers.Format.OWSCommon.v1_1_0.js
     *          * OpenLayers.Kinetic.js
     *          * OpenLayers.Layer.WMS.js
     *          * OpenLayers.Format.WMC.js
     *          * OpenLayers.Format.WMC.v1.js
     *          * OpenLayers.Format.WMC.v1_1_0.js
     *          * OpenLayers.Renderer.SVG.js
     *          * OpenLayers.Format.GeoJSON.js
     *          * OpenLayers.Format.WMTSCapabilities.js
     *          * OpenLayers.Filter.Comparison.js
     *          * OpenLayers.Format.WMC.v1_0_0.js
     *          * OpenLayers.Format.WMTSCapabilities.v1_0_0.js
     *          * OpenLayers.Rule.js
     *          * OpenLayers.Handler.Pinch.js
     *          * OpenLayers.Control.Geolocate.js
     *          * OpenLayers.Format.QueryStringFilter.js
     *          * OpenLayers.Handler.Click.js
     *          * OpenLayers.Format.GML.js
     *          * OpenLayers.Control.DragPan.js
     *          * OpenLayers.Control.PinchZoom.js
     *          * OpenLayers.Control.TouchNavigation.js
     *          * OpenLayers.Control.Navigation.js
     *          * OpenLayers.Control.ZoomBox.js
     *          * OpenLayers.Handler.Box.js
     *          * OpenLayers.Handler.MouseWheel.js
     *          * OpenLayers.Layer.WMTS.js
     *          * OpenLayers.Renderer.VML.js
     *          * OpenLayers.Protocol.js
     *          * OpenLayers.Protocol.HTTP.js
     *          * OpenLayers.Protocol.Script.js
     *          * OpenLayers.Popup.js
     *
     *      PROJ4JS with the following algorithms :
     *          * eqc
     *          * lcc
     *          * longlat
     *          * merc
     *          * stere
     *          * tmerc
     *          * gstmerc
     *
     *      PROJ4JS with the following projections :
     *          * CRS:84
     *          * EPSG:2154
     *          * EPSG:27572
     *          * EPSG:27582
     *          * EPSG:4171
     *          * IGNF:LAMB93
     *          * IGNF:LAMBE
     *          * IGNF:REUN47GAUSSL
     *          * IGNF:RGF93G
     *          * IGNF:RGM04UTM38S
     *          * IGNF:RGNCUTM57S
     *          * IGNF:RGNCUTM58S
     *          * IGNF:RGNCUTM59S
     *          * IGNF:RGPFUTM5S
     *          * IGNF:RGPFUTM6S
     *          * IGNF:RGPFUTM7S
     *          * IGNF:RGR92UTM40S
     *          * IGNF:RGSPM06U21
     *          * IGNF:TERA50STEREO
     *          * IGNF:UTM01SW84
     *          * IGNF:UTM20W84GUAD
     *          * IGNF:UTM20W84MART
     *          * IGNF:UTM22RGFG95
     *          * IGNF:UTM39SW84
     *          * IGNF:UTM42SW84
     *          * IGNF:UTM43SW84
     *          * IGNF:WGS84G
     *
     *      the following Geoportal classes :
     *          * <Geoportal.Catalogue>
     *          * <Geoportal.Catalogue.Configuration>
     *          * <Geoportal.Control>
     *          * <Geoportal.Control.Form>
     *          * <Geoportal.Control.AutoComplete>
     *          * <Geoportal.Control.GraphicScale>
     *          * <Geoportal.Control.LocationUtilityService>
     *          * <Geoportal.Control.LocationUtilityService.GeoNames>
     *          * <Geoportal.Control.LocationUtilityService.Geocode>
     *          * <Geoportal.Control.Logo>
     *          * <Geoportal.Control.PermanentLogo>
     *          * <Geoportal.Control.TermsOfService>
     *          * <Geoportal.Format>
     *          * <Geoportal.Format.WMC>
     *          * <Geoportal.Format.WMC.v1_1_0_AutoConf>
     *          * <Geoportal.Format.XLS>
     *          * <Geoportal.Format.XLS.v1_1>
     *          * <Geoportal.Format.XLS.v1_1.LocationUtilityService>
     *          * <Geoportal.Format.XLS.v1_2>
     *          * <Geoportal.Format.XLS.v1_2.LocationUtilityService>
     *          * <Geoportal.GeoRMHandler>
     *          * <Geoportal.Layer>
     *          * <Geoportal.Layer.Grid>
     *          * <Geoportal.Layer.GXT>
     *          * <Geoportal.Layer.OpenLS>
     *          * <Geoportal.Layer.OpenLS.Core>
     *          * <Geoportal.Layer.OpenLS.Core.LocationUtilityService>
     *          * <Geoportal.Layer.WMTS>
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
     *          * <Geoportal.OLS.Error>
     *          * <Geoportal.OLS.ErrorList>
     *          * <Geoportal.OLS.LUS>
     *          * <Geoportal.OLS.LUS.GeocodedAddress>
     *          * <Geoportal.OLS.LUS.GeocodeRequest>
     *          * <Geoportal.OLS.LUS.GeocodeResponse>
     *          * <Geoportal.OLS.LUS.GeocodeResponseList>
     *          * <Geoportal.OLS.GeocodeMatchCode>
     *          * <Geoportal.OLS.Place>
     *          * <Geoportal.OLS.PostalCode>
     *          * <Geoportal.OLS.Response>
     *          * <Geoportal.OLS.ResponseHeader>
     *          * <Geoportal.OLS.Request>
     *          * <Geoportal.OLS.RequestHeader>
     *          * <Geoportal.OLS.Street>
     *          * <Geoportal.OLS.StreetAddress>
     *          * <Geoportal.OLS.XLS>
     *          * <Geoportal.Tile>
     *          * <Geoportal.Tile.Image>
     *          * <Geoportal.UI>
     *          * <Geoportal.Util>
     *          * <Geoportal.Viewer>
     *          * <Geoportal.Viewer.Mobile>
     *          * <Geoportal.Viewer.Simple>
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
                "../../openlayers/lib/OpenLayers/Animation.js",// à ajouter
                "../../openlayers/lib/OpenLayers/BaseTypes/Class.js",
                "../../openlayers/lib/OpenLayers/Console.js",
                "../../openlayers/lib/OpenLayers/Control.js",
                "../../openlayers/lib/OpenLayers/Control/ZoomBox.js",//NEW
                "../../openlayers/lib/OpenLayers/Control/Panel.js",
                "../../openlayers/lib/OpenLayers/Control/ZoomIn.js",
                "../../openlayers/lib/OpenLayers/Control/ZoomOut.js",
                //"../../openlayers/lib/OpenLayers/Control/ZoomToMaxExtent.js",//
                //"../../openlayers/lib/OpenLayers/Control/ZoomPanel.js",//
                "../../openlayers/lib/OpenLayers/BaseTypes.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Bounds.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Element.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/LonLat.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Pixel.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Size.js",
                "../../openlayers/lib/OpenLayers/Lang.js",
                "../../openlayers/lib/OpenLayers/Util.js",
                "../../openlayers/lib/OpenLayers/Format.js",
                "../../openlayers/lib/OpenLayers/Feature.js",
                "../../openlayers/lib/OpenLayers/Feature/Vector.js",
                //"../../openlayers/lib/OpenLayers/Format/WKT.js",//
                "../../openlayers/lib/OpenLayers/Geometry.js",
                "../../openlayers/lib/OpenLayers/Geometry/Collection.js",// à ajouter
                "../../openlayers/lib/OpenLayers/Geometry/Point.js",
                //"../../openlayers/lib/OpenLayers/Geometry/MultiPoint.js",//
                //"../../openlayers/lib/OpenLayers/Geometry/Curve.js",//
                //"../../openlayers/lib/OpenLayers/Geometry/LineString.js",//
                //"../../openlayers/lib/OpenLayers/Geometry/LinearRing.js",//
                "../../openlayers/lib/OpenLayers/Events.js",
                //"../../openlayers/lib/OpenLayers/Events/buttonclick.js",//
                "../../openlayers/lib/OpenLayers/Handler.js",
                "../../openlayers/lib/OpenLayers/Handler/MouseWheel.js",//NEW
                //"../../openlayers/lib/OpenLayers/Handler/Point.js",//
                //"../../openlayers/lib/OpenLayers/Handler/Path.js",//
                "../../openlayers/lib/OpenLayers/Geometry/Polygon.js",
                //"../../openlayers/lib/OpenLayers/Handler/Polygon.js",//
                "../../openlayers/lib/OpenLayers/Renderer.js",//à ajouter
                "../../openlayers/lib/OpenLayers/Renderer/Canvas.js",
                "../../openlayers/lib/OpenLayers/Handler/Drag.js",
                "../../openlayers/lib/OpenLayers/Handler/Feature.js",
                "../../openlayers/lib/OpenLayers/Control/DragFeature.js",
                //"../../openlayers/lib/OpenLayers/Control/WMSGetFeatureInfo.js",//NEW
                "../../openlayers/lib/OpenLayers/Tween.js",
                "../../openlayers/lib/OpenLayers/Map.js",
                "../../openlayers/lib/OpenLayers/Projection.js",
                "../../openlayers/lib/OpenLayers/Layer.js",
                "../../openlayers/lib/OpenLayers/Style.js",
                "../../openlayers/lib/OpenLayers/StyleMap.js",
                "../../openlayers/lib/OpenLayers/Layer/Vector.js",
                //"../../openlayers/lib/OpenLayers/Layer/Vector/RootContainer.js",//
                "../../openlayers/lib/OpenLayers/Control/SelectFeature.js",
                "../../openlayers/lib/OpenLayers/Handler/Keyboard.js",
                //"../../openlayers/lib/OpenLayers/Control/ModifyFeature.js",//
                "../../openlayers/lib/OpenLayers/Layer/HTTPRequest.js",
                "../../openlayers/lib/OpenLayers/Tile.js",
                "../../openlayers/lib/OpenLayers/Tile/Image.js",
                "../../openlayers/lib/OpenLayers/Layer/Grid.js",
                "../../openlayers/lib/OpenLayers/Layer/XYZ.js",
                "../../openlayers/lib/OpenLayers/Layer/SphericalMercator.js",
                //"../../openlayers/lib/OpenLayers/Layer/Bing.js",//NEW
                //"../../openlayers/lib/OpenLayers/Geometry/MultiLineString.js",//
                "../../openlayers/lib/OpenLayers/Format/JSON.js",
                "../../openlayers/lib/OpenLayers/Renderer/Elements.js",
                "../../openlayers/lib/OpenLayers/Strategy.js",
                "../../openlayers/lib/OpenLayers/Strategy/Fixed.js",
                "../../openlayers/lib/OpenLayers/Control/Pan.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Date.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/XML.js",
                "../../openlayers/lib/OpenLayers/Request.js",
                "../../openlayers/lib/OpenLayers/Request/XMLHttpRequest.js",
                "../../openlayers/lib/OpenLayers/Format/KML.js",
                //"../../openlayers/lib/OpenLayers/Geometry/MultiPolygon.js",//
                "../../openlayers/lib/OpenLayers/Filter.js",
                "../../openlayers/lib/OpenLayers/Filter/Spatial.js",
                "../../openlayers/lib/OpenLayers/Strategy/BBOX.js",
                "../../openlayers/lib/OpenLayers/Format/OGCExceptionReport.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/XML/VersionedOGC.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/OWSCommon.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon/v1.js",
                "../../openlayers/lib/OpenLayers/Format/OWSCommon/v1_1_0.js",
                //"../../openlayers/lib/OpenLayers/Control/PanPanel.js",//
                //"../../openlayers/lib/OpenLayers/Control/Attribution.js",//
                "../../openlayers/lib/OpenLayers/Kinetic.js",//NEW
                //"../../openlayers/lib/OpenLayers/Filter/Logical.js",//
                "../../openlayers/lib/OpenLayers/Layer/WMS.js",
                //"../../openlayers/lib/OpenLayers/Format/WMSGetFeatureInfo.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/Context.js",// à ajouter
                "../../openlayers/lib/OpenLayers/Format/WMC.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1_1_0.js",
                "../../openlayers/lib/OpenLayers/Renderer/SVG.js",
                //"../../openlayers/lib/OpenLayers/Symbolizer.js",//
                "../../openlayers/lib/OpenLayers/Format/GeoJSON.js",
                "../../openlayers/lib/OpenLayers/Format/WMTSCapabilities.js",
                //"../../openlayers/lib/OpenLayers/Control/Button.js",//
                "../../openlayers/lib/OpenLayers/Filter/Comparison.js",
                "../../openlayers/lib/OpenLayers/Format/WMC/v1_0_0.js",
                "../../openlayers/lib/OpenLayers/Format/WMTSCapabilities/v1_0_0.js",
                //"../../openlayers/lib/OpenLayers/Control/DrawFeature.js",//
                //"../../openlayers/lib/OpenLayers/Symbolizer/Point.js",//
                //"../../openlayers/lib/OpenLayers/Symbolizer/Line.js",//
                //"../../openlayers/lib/OpenLayers/Symbolizer/Polygon.js",//
                //"../../openlayers/lib/OpenLayers/Symbolizer/Text.js",//
                //"../../openlayers/lib/OpenLayers/Symbolizer/Raster.js",//
                "../../openlayers/lib/OpenLayers/Rule.js",
                "../../openlayers/lib/OpenLayers/Handler/Pinch.js",//NEW
                "../../openlayers/lib/OpenLayers/Control/Geolocate.js",//NEW
                "../../openlayers/lib/OpenLayers/Format/QueryStringFilter.js",//NEW
                "../../openlayers/lib/OpenLayers/Handler/Box.js",//NEW
                "../../openlayers/lib/OpenLayers/Handler/Click.js",
                "../../openlayers/lib/OpenLayers/Format/GML.js",
                "../../openlayers/lib/OpenLayers/Control/DragPan.js",
                "../../openlayers/lib/OpenLayers/Control/PinchZoom.js",//NEW
                "../../openlayers/lib/OpenLayers/Control/TouchNavigation.js",//NEW
                "../../openlayers/lib/OpenLayers/Control/Navigation.js",//NEW
                "../../openlayers/lib/OpenLayers/Layer/WMTS.js",
                "../../openlayers/lib/OpenLayers/Renderer/VML.js",
                "../../openlayers/lib/OpenLayers/Protocol.js",
                "../../openlayers/lib/OpenLayers/Protocol/HTTP.js",
                "../../openlayers/lib/OpenLayers/Protocol/Script.js",//NEW
                // PROJ4JS:
                "../../proj4js/lib/proj4js.js",
                "../../proj4js/lib/OverloadedProj4js.js",
                "../../proj4js/lib/projCode/longlat.js",
                "../../proj4js/lib/projCode/lcc.js",
                "../../proj4js/lib/projCode/eqc.js",
                "../../proj4js/lib/projCode/merc.js",
                "../../proj4js/lib/projCode/tmerc.js",
                "../../proj4js/lib/projCode/gstmerc.js",
                "../../proj4js/lib/projCode/stere.js",
                "../../proj4js/lib/defs/IGNFLAMB93.js",
                "../../proj4js/lib/defs/IGNFLAMBE.js",
                "../../proj4js/lib/defs/IGNFREUN47GAUSSL.js",
                "../../proj4js/lib/defs/EPSG4171.js",
                "../../proj4js/lib/defs/EPSG2154.js",
                "../../proj4js/lib/defs/EPSG27582.js",
                "../../proj4js/lib/defs/EPSG27572.js",
                "../../proj4js/lib/defs/IGNFUTM20W84MART.js",
                "../../proj4js/lib/defs/IGNFUTM20W84GUAD.js",
                "../../proj4js/lib/defs/IGNFUTM43SW84.js",
                "../../proj4js/lib/defs/IGNFTERA50STEREO.js",
                "../../proj4js/lib/defs/IGNFUTM39SW84.js",
                "../../proj4js/lib/defs/IGNFUTM22RGFG95.js",
                "../../proj4js/lib/defs/IGNFUTM42SW84.js",
                "../../proj4js/lib/defs/IGNFRGM04UTM38S.js",
                "../../proj4js/lib/defs/IGNFRGNCUTM57S.js",
                "../../proj4js/lib/defs/IGNFRGNCUTM58S.js",
                "../../proj4js/lib/defs/IGNFRGNCUTM59S.js",
                "../../proj4js/lib/defs/IGNFRGR92UTM40S.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM5S.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM6S.js",
                "../../proj4js/lib/defs/IGNFRGPFUTM7S.js",
                "../../proj4js/lib/defs/IGNFRGSPM06U21.js",
                "../../proj4js/lib/defs/IGNFUTM01SW84.js",
                "../../proj4js/lib/defs/IGNFWGS84G.js",
                "../../proj4js/lib/defs/CRS84.js",
                "../../proj4js/lib/defs/IGNFRGF93G.js",
                // GEOPORTAL:
                "OpenLayers/OverloadedOpenLayersMinimum.js",
                "OpenLayers/OverloadedOpenLayersStandard.js",
                "Geoportal/Layer.js",
                "Geoportal/Format.js",
                "Geoportal/Format/XLS.js",
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
                "Geoportal/Format/XLS/v1_1/LocationUtilityService.js",
                "Geoportal/Layer/OpenLS.js",
                "Geoportal/Layer/OpenLS/Core.js",
                "Geoportal/UI.js",
                "Geoportal/Control.js",
                "Geoportal/Util.js",
                "Geoportal/Control/Form.js",
                "Geoportal/OLS/RequestHeader.js",
                "Geoportal/OLS/Request.js",
                "Geoportal/Layer/OpenLS/Core/LocationUtilityService.js",
                "Geoportal/Control/LocationUtilityService.js",
                "Geoportal/Control/AutoComplete.js",
                "Geoportal/Control/LocationUtilityService/GeoNames.js",
                "Geoportal/Control/LocationUtilityService/Geocode.js",
                "Geoportal/Tile.js",
                "Geoportal/Format/WMC.js",
                "Geoportal/Format/WMC/v1_1_0_AutoConf.js",
                "Geoportal/GeoRMHandler.js",
                "Geoportal/Control/Logo.js",
                "Geoportal/Control/PermanentLogo.js",
                "Geoportal/Control/GraphicScale.js",
                "Geoportal/Tile/Image.js",
                "Geoportal/Format/XLS/v1_2.js",
                "Geoportal/Format/XLS/v1_2/LocationUtilityService.js",
                "Geoportal/Layer/GXT.js",
                "Geoportal/Layer/Grid.js",
                "Geoportal/Control/TermsOfService.js",
                "Geoportal/Layer/WMTS.js",
                "Geoportal/Map.js",
                "Geoportal/Catalogue.js",
                "Geoportal/Catalogue/Config.js",
                "Geoportal/Viewer.js",
                "Geoportal/Viewer/Simple.js",
                "Geoportal/Viewer/Mobile.js",
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
 * {String} *"Geoportal 2.1.2 Webapp ; publicationDate=2015-04-02"*
 */
Geoportal.VERSION_NUMBER="Geoportal 2.1.2 Webapp ; publicationDate=2015-04-02";
