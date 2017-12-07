/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Panel.js
 * @requires Geoportal/Control/LocationUtilityService/GeoNames.js
 * @requires Geoportal/Control/LocationUtilityService/Geocode.js
 * @requires Geoportal/Control/LocationUtilityService/ReverseGeocode.js
 * @requires Geoportal/Control/CSW.js
 */
/**
 * Class: Geoportal.Control.SearchToolbar
 * A tool for controlling searching of locations and panning to them.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id="search_#{Id}" class="gpControlSearchToolbar olControlNoSelect" style="display:">
 *   <div id="gc_#{Id}" class="gpControlLocationUtilityServiceGeoNamesItem[Active|Inactive]"/>
 *   <div id="gc_#{Id}" class="gpControlLocationUtilityServiceGeocodeItem[Active|Inactive]"/>
 *   <div id="rvgc_#{Id}" class="gpControlLocationUtilityServiceReverseItem[Active|Inactive]"></div>
 * </div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control.Panel>}
 */
Geoportal.Control.SearchToolbar =
    OpenLayers.Class( Geoportal.Control.Panel, {

    /**
     * Property: geonamesCntrlId
     * {String} identifier of the {<Geoportal.Control.LocationUtilityService>} control.
     */
    geonamesCntrlId: null,

    /**
     * Property: geocodeCntrlId
     * {String} identifier of the {<Geoportal.Control.LocationUtilityService>} control.
     */
    geocodeCntrlId: null,

    /**
     * Property: reverseGeocodeCntrlId
     * {String} identifier of the {<Geoportal.Control.LocationUtilityService>} control.
     */
    reverseGeocodeCntrlId: null,

    /**
     * Constructor: Geoportal.Control.SearchToolbar
     * Create a toolbar for searching locations.
     *
     * Parameters:
     * options - {Object} Hashtable of options to set on the toolbar.
     *      Options for {<Geoportal.Control.LocationUtilityService>} are expected under
     *      options.geonamesOptions or options.geocodeOptions or
     *      under options.reverseGeocodeOptions :
     *      * if a control option is included then it is used as the
     *      control's for options.geonamesOptions,
     *      options.geocodeOptions and options.reverseGeocodeOptions;
     *      * if no control option is included then all options are used for
     *      <Geoportal.Layer.OpenLS> layers creation.
     *
     *      options.geonamesOptions deals with pure geographic locations
     *      search (no reverse method).
     *      options.geocodeOptions and options.reverseGeocodeOptions deal with
     *      address locations search (geocode and reverse geocode methods).
     */
    initialize: function(options) {
        options= options || {};
        Geoportal.Control.Panel.prototype.initialize.apply(this, [options]);

        var cntrl= null;
        if (options.geonamesOptions) {
            if (options.geonamesOptions.control) {
                cntrl= options.geonamesOptions.control;
                this.geonamesCntrlId= cntrl.id;
            } else {
                options.geonamesOptions.layerOptions= options.geonamesOptions.layerOptions || {};
                var gnOptions= OpenLayers.Util.extend({},options.geonamesOptions.layerOptions);
                var gnLayer= new Geoportal.Layer.OpenLS.Core.LocationUtilityService(
                    gnOptions.name || OpenLayers.Util.createUniqueID('LUS.Geonames'),
                    gnOptions);
                this.geonamesCntrlId=
                    options.geonamesOptions.id ||
                    (options.geonamesOptions.div? options.geonamesOptions.div.id : null) ||
                    "gn_" + this.id;
                cntrl= new Geoportal.Control.LocationUtilityService.GeoNames(
                    gnLayer,
                    OpenLayers.Util.extend(
                        {
                            id: this.geonamesCntrlId,
                            title: 'gpControlLocationUtilityService.geonames.title'
                        },
                        options.geonamesOptions
                    ));
            }
            if (cntrl.layer.isAvailable) {this.addControls([cntrl]);}
        }

        if (options.geocodeOptions) {
            if (options.geocodeOptions.control) {
                cntrl= options.geocodeOptions.control;
                this.geocodeCntrlId= cntrl.id;
            } else {
                options.geocodeOptions.layerOptions= options.geocodeOptions.layerOptions || {};
                var gcOptions= OpenLayers.Util.extend({},options.geocodeOptions.layerOptions);
                var gcLayer= new Geoportal.Layer.OpenLS.Core.LocationUtilityService(
                    gcOptions.name || OpenLayers.Util.createUniqueID('LUS.Geocode'),
                    gcOptions);
                this.geocodeCntrlId=
                    options.geocodeOptions.id ||
                    (options.geocodeOptions.div? options.geocodeOptions.div.id : null) ||
                    "gc_" + this.id;
                cntrl= new Geoportal.Control.LocationUtilityService.Geocode(
                    gcLayer,
                    OpenLayers.Util.extend(
                        {
                            id: this.geocodeCntrlId,
                            title: 'gpControlLocationUtilityService.geocode.title'
                        },
                        options.geocodeOptions
                    ));
            }
            if (cntrl.layer.isAvailable) {this.addControls([cntrl]);}
        }

        if (options.reverseGeocodeOptions) {
            if (options.reverseGeocodeOptions.control) {
                cntrl= options.reverseGeocodeOptions.control;
                this.reverseGeocodeCntrlId= cntrl.id;
            } else {
                options.reverseGeocodeOptions.layerOptions= options.reverseGeocodeOptions.layerOptions || {};
                var rvGcOptions= OpenLayers.Util.extend({},options.reverseGeocodeOptions.layerOptions);
                var rvLayer= new Geoportal.Layer.OpenLS.Core.LocationUtilityService(
                    rvGcOptions.name || OpenLayers.Util.createUniqueID('LUS.ReverseGeocode'),
                    rvGcOptions);
                this.reverseGeocodeCntrlId=
                    options.reverseGeocodeOptions.id ||
                    (options.reverseGeocodeOptions.div? options.reverseGeocodeOptions.div.id : null) ||
                    "rvgc_" + this.id;
                cntrl= new Geoportal.Control.LocationUtilityService.ReverseGeocode(
                    rvLayer,
                    OpenLayers.Util.extend(
                        {
                            id: this.reverseGeocodeCntrlId,
                            title: 'gpControlLocationUtilityService.reverse.geocode.title'
                        },
                        options.reverseGeocodeOptions
                    ));
            }
            if (cntrl.layer.isAvailable) {this.addControls([cntrl]);}
        }
        
        if (options.cswOptions) {
            if (options.cswOptions.control) {
                cntrl= options.cswOptions.control;
                this.cswCntrlId= cntrl.id;
            } else {
                this.cswCntrlId= options.cswOptions.id ||
                    (options.cswOptions.div? options.cswOptions.div.id : null) ||
                    "csw_" + this.id;
                cntrl= new Geoportal.Control.CSW(
                    OpenLayers.Util.extend(
                        {
                            id: this.cswCntrlId,
                            title:'gpControlCSW.title'
                        },
                        options.cswOptions
                    ));
                this.addControls([cntrl]);
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.SearchToolbar"*
     */
    CLASS_NAME: "Geoportal.Control.SearchToolbar"
});
