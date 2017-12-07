/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Panel.js
 */
/**
 * Class: Geoportal.Control.EditingToolbar
 * The Geoportal editing tool class. Only one drawing control is allowed.
 * Controls and layer are closely linked : activation of a control makes the
 * associated layer visible and making the layer not visible deactivates the
 * controls. The panel is added to the {<Geoportal.Control.LayerSwitcher>}
 * layer's tabs.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id="edit_#{LayerId}" class="gpControlEditingToolbar olControlNoSelect" style="display:">
 *   <div id="draw_#{Layer.id}" class="olControlDrawFeatureXXXXXItem[Active|Inactive]"/>
 *   <div id="drag_#{layer.id}" class="olControlDragFeatureItem[Active|Inactive]"></div>
 *   <div id="modf_#{Layer.id}" class="olControlModifyFeatureItem[Active|Inactive]"/>
 *   <div id="dele_#{Layer.id}" class="gpControlDeleteFeatureItem[Active|Inactive]"/>
 *   <div id="slct_#{Layer.id}" class="olControlSelectFeatureItem[Active|Inactive]"/>
 * </div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control.Panel>}
 */
Geoportal.Control.EditingToolbar =
    OpenLayers.Class( Geoportal.Control.Panel, {

    /**
     * Property: DEFAULT_OPTIONS
     * Default options for various controls. Keys are Handler class names or
     * Control class names :
     *
     * - OpenLayers.Handler.Point (one of, default if none)
     * - OpenLayers.Handler.Path (one of)
     * - OpenLayers.Handler.Polygon (one of)
     * - OpenLayers.Handler.RegularPolygon (one of)
     * - OpenLayers.Control.DragFeature
     * - OpenLayers.Control.ModifyFeature (when Path, Polygon or Regular
     *          Polygon handler)
     * - Geoportal.Control.DeleteFeature
     * - OpenLayers.Control.SelectFeature
     */
    DEFAULT_OPTIONS: {
        'OpenLayers.Handler.Point' : {
            uiOptions:{
                title       : '',
                displayClass: 'olControlDrawFeaturePoint'
            },
            featureAdded: function(feature) { feature.state = OpenLayers.State.INSERT; }
        },
        'OpenLayers.Handler.Path' : {
            uiOptions:{
                title       : '',
                displayClass: 'olControlDrawFeaturePath'
            },
            featureAdded: function(feature) { feature.state = OpenLayers.State.INSERT; }
        },
        'OpenLayers.Handler.Polygon' : {
            uiOptions:{
                title       : '',
                displayClass: 'olControlDrawFeaturePolygon'
            },
            featureAdded: function(feature) { feature.state = OpenLayers.State.INSERT; }
        },
        'OpenLayers.Handler.RegularPolygon' : {
            uiOptions:{
                title       : '',
                displayClass: 'olControlDrawFeatureRegularPolygon'
            },
            featureAdded: function(feature) { feature.state = OpenLayers.State.INSERT; }
        },
        'OpenLayers.Control.DragFeature' : {
            uiOptions:{
                title       : ''
            }
        },
        'OpenLayers.Control.ModifyFeature' : {
            uiOptions:{
                title       : ''
            }
        },
        'Geoportal.Control.DeleteFeature' : {
            uiOptions:{
                title       : ''
            }
        },
        'OpenLayers.Control.SelectFeature' : {
            uiOptions:{
                title       : ''
            }
        }
    },

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} the layer under controlled
     */
    layer: null,

    /**
     * APIProperty: geometryType
     * {String} the features' geometry type.
     *      One of "OpenLayers.Geometry.Point",
     *      "OpenLayers.Geometry.LineString", "OpenLayers.Geometry.Polygon".
     *      Defaults to *"OpenLayers.Geometry.Point"*
     */
    geometryType: "OpenLayers.Geometry.Point",

    /**
     * Constructor: Geoportal.Control.EditingToolbar
     * Create an editing toolbar for a given layer that holds a geometry type
     * (<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>,
     *  <OpenLayers.Geometry.LineString at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/LineString-js.html>,
     *  <OpenLayers.Geometry.Polygon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Polygon-js.html>).
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} the overlay to attach with
     * type - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>} the feature's geometry type.
     * options - {Object} Hashtable of options to set on the toolbar.
     *   If options.drawFeatureOptions exists it is hand over to
     *   {<OpenLayers.Control.DrawFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DrawFeature-js.html>} constructor.
     *   options.dragFeatureOptions, options.modifyFeatureOptions, options.deleteFeatureOptions and
     *   options.selectFeatureOptions are handed over to
     *   {<OpenLayers.Control.DragFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DragFeature-js.html>},
     *   {<OpenLayers.Control.ModifyFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/ModifyFeature-js.html>},
     *   {<Geoportal.Control.DeleteFeature>},
     *   {<OpenLayers.Control.SelectFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/SelectFeature-js.html>} respectively.
     *   The options.regularPolygon set to true indicates to use of
     *   {<OpenLayers.Handler.RegularPolygon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Handler/RegularPolygon-js.html>}
     *   handler when type is set to 'OpenLayers.Geometry.Polygon'.
     */
    initialize: function(layer, type, options) {
        Geoportal.Control.Panel.prototype.initialize.apply(this, [options]);
        this.DEFAULT_OPTIONS['OpenLayers.Handler.Point'].uiOptions.title= this.getDisplayClass()+'.drawpoint';
        this.DEFAULT_OPTIONS['OpenLayers.Handler.Path'].uiOptions.title= this.getDisplayClass()+'.drawline';
        this.DEFAULT_OPTIONS['OpenLayers.Handler.Polygon'].uiOptions.title= this.getDisplayClass()+'.drawpolygon';
        this.DEFAULT_OPTIONS['OpenLayers.Handler.RegularPolygon'].uiOptions.title= this.getDisplayClass()+'.drawpolygon';
        this.DEFAULT_OPTIONS['OpenLayers.Control.DragFeature'].uiOptions.title= this.getDisplayClass()+'.dragfeature';
        this.DEFAULT_OPTIONS['OpenLayers.Control.ModifyFeature'].uiOptions.title= this.getDisplayClass()+'.modifyfeature';
        this.DEFAULT_OPTIONS['Geoportal.Control.DeleteFeature'].uiOptions.title= this.getDisplayClass()+'.deletefeature';
        this.DEFAULT_OPTIONS['OpenLayers.Control.SelectFeature'].uiOptions.title= this.getDisplayClass()+'.selectfeature';
        this.layer= layer;
        var handlerClass= null;
        if (type=='OpenLayers.Geometry.Point') {
            handlerClass= OpenLayers.Handler.Point;
        } else if (type=='OpenLayers.Geometry.LineString') {
            handlerClass= OpenLayers.Handler.Path;
        } else if (type=='OpenLayers.Geometry.Polygon') {
            if (this.regularPolygon) {
                handlerClass= OpenLayers.Handler.RegularPolygon;
            } else {
                handlerClass= OpenLayers.Handler.Polygon;
            }
        } else {
            type= null;
        }
        this.geometryType= type;

        options= options || {};
        options.handlerClass= handlerClass;
        this.addToolbarControls(options);
        this.registerControlsEvents();
    },

    /**
     * Method: addToolbarControls
     * Add controls to the toolbar panel.
     *
     * Parameters:
     * options - {Object} Hashtable of options to set on the toolbar.
     *   If options.drawFeatureOptions exists it is hand over to
     *   {<OpenLayers.Control.DrawFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DrawFeature-js.html>} constructor.
     *   options.dragFeatureOptions, options.modifyFeatureOptions, options.deleteFeatureOptions and
     *   options.selectFeatureOptions are handed over to
     *   {<OpenLayers.Control.DragFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DragFeature-js.html>},
     *   {<OpenLayers.Control.ModifyFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/ModifyFeature-js.html>},
     *   {<Geoportal.Control.DeleteFeature>},
     *   {<OpenLayers.Control.SelectFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/SelectFeature-js.html>} respectively.
     *   The options.regularPolygon set to true indicates to use of
     *   {<OpenLayers.Handler.RegularPolygon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Handler/RegularPolygon-js.html>}
     *   handler when type is set to 'OpenLayers.Geometry.Polygon'.
     *
     */
    addToolbarControls: function(options) {
        // TODO: add options not to create a control in the toolbar !
        if (options.handlerClass) {
            this.addControls(
                new OpenLayers.Control.DrawFeature(
                    this.layer,
                    options.handlerClass,
                    OpenLayers.Util.extend(
                        OpenLayers.Util.applyDefaults({},this.DEFAULT_OPTIONS[options.handlerClass.prototype.CLASS_NAME]),
                        options.drawFeatureOptions
                    )
                )
            );
        }

        this.addControls(
            new OpenLayers.Control.DragFeature(
                this.layer,
                OpenLayers.Util.extend(
                    OpenLayers.Util.applyDefaults({},this.DEFAULT_OPTIONS['OpenLayers.Control.DragFeature']),
                    options.dragFeatureOptions
                )
            )
        );

        if (this.geometryType && this.geometryType!='OpenLayers.Geometry.Point') {
            this.addControls(
                new OpenLayers.Control.ModifyFeature(
                    this.layer,
                    OpenLayers.Util.extend(
                        OpenLayers.Util.applyDefaults({},this.DEFAULT_OPTIONS['OpenLayers.Control.ModifyFeature']),
                        options.modifyFeatureOptions
                    )
                )
            );
        }

        this.addControls(
            new Geoportal.Control.DeleteFeature(
                this.layer,
                OpenLayers.Util.extend(
                    OpenLayers.Util.applyDefaults({},this.DEFAULT_OPTIONS['Geoportal.Control.DeleteFeature']),
                    options.deleteFeatureOptions
                )
            )
        );

        this.addControls(
            new OpenLayers.Control.SelectFeature(
                this.layer,
                OpenLayers.Util.extend(
                    OpenLayers.Util.applyDefaults({},this.DEFAULT_OPTIONS['OpenLayers.Control.SelectFeature']),
                    options.selectFeatureOptions
                )
            )
        );
    },

    /**
     * Method: registerControlsEvents
     * Register events for controls.
     */
    registerControlsEvents: function() {
        for (var i= 0, len= this.controls.length; i<len; i++) {
            if (this.controls[i].events) {
                this.controls[i].events.register("activate", this.controls[i], this.onActivate);
                if (this.layer.map) {
                    this.layer.map.events.register("changelayer", this.controls[i], this.onChangeLayer);
                }
                this.layer.events.register("visibilitychanged", this.controls[i], this.onVisibilityChange);
            }
        }
    },

    /**
     * Method: unregisterControlsEvents
     * Unregister events for controls.
     */
    unregisterControlsEvents: function() {
        for (var i= 0, len= this.controls.length; i<len; i++) {
            if (this.controls[i].events) {
                if(this.layer){
                    this.layer.events.unregister("visibilitychanged", this.controls[i], this.onVisibilityChange);
                    if (this.layer.map) {
                        this.layer.map.events.unregister("changelayer", this.controls[i], this.onChangeLayer);
                    }
                }
                this.controls[i].events.unregister("activate", this.controls[i], this.onActivate);
            }
        }
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete the control.
     */
    destroy: function() {
        this.unregisterControlsEvents();
        Geoportal.Control.Panel.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: draw
     * Call the default draw, and then activate draw control.
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the position where to draw the control.
     *
     * Returns:
     * {DOMElement} the control's div.
     */
    draw: function(px) {
        Geoportal.Control.Panel.prototype.draw.apply(this, arguments);
        // panelVisibility is added by Geoportal.Control.PanelToggle
        if (this.panelVisibility) {
            this.activateControl(this.getControlsByClass('Geoportal.Control.PanelToggle')[0]);
        } else {
            this.activateControl(this.controls[0]);
        }
        return this.div;
    },

    /**
     * Method: onActivate
     * Explicitly activates a control and it's associated
     * handler if one has been set.  Controls can be
     * deactivated by calling the deactivate() method.
     *
     * Parameters:
     * evt - {Array({Event})} the fired event.
     *      evt.object holds the control which has registered the event (this)
     */
    onActivate: function(evt) {
        if (!this.active) { return; }// 'this' is the 2nd argument of register()
        if (!evt) { return; }
        if (this.layer && !this.layer.getVisibility()) {
            if (!this.layer.calculateInRange()) {
                this.deactivate();
                return;
            }
            this.layer.setVisibility(true);
        }
    },

    /**
     * Method: onChangeLayer
     * Listener of event "changelayer". Only property "visibility" set to
     *      false will be of interest.
     *
     * Parameters:
     * evt - {Array({Event})} the fired event
     *
     * Context:
     *      - evt.object holds the map which has registered the event
     *      - evt.layer holds the listened layer
     *      - evt.property should be equal to "visibility" to be of interest
     */
    onChangeLayer: function(evt) {
        if (!this.active) { return; }// 'this' is the 2nd argument of register()
        if (!evt) { return; }
        if (evt.layer!=this.layer) { return; }
        if (!evt.property) { return; }
        if (evt.property!="visibility") { return ; }
        if (!this.layer.getVisibility()) {
            this.deactivate();
            // there are more controls activated for that panel, get the map's
            // main navigation control
            var navCtrls= this.layer.map.getControlsByClass('OpenLayers.Control.Navigation');
            if (navCtrls && navCtrls.length>0) {
                var navCtrl= navCtrls[0];
                navCtrl.activate();
            }
        }
    },

    /**
     * Method: onVisibilityChange
     * Listener of event "visibilitychange". Only property "visibility" set to
     *      false will be of interest.
     *
     * Parameters:
     * evt - {Array({Event})} the fired event
     *
     * Context:
     *      - evt.object holds the layer which has registered the event
     */
    onVisibilityChange: function(evt) {
        if (!this.active) { return; }// 'this' is the 2nd argument of register()
        if (!evt) { return; }
        if (evt.object!=this.layer) { return; }
        // FIXME: in fact the "visibitychange" is handled ...
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.EditingToolbar"*
     */
    CLASS_NAME: "Geoportal.Control.EditingToolbar"
});
