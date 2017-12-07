/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/EditingToolbar.js
 */
/**
 * Class: Geoportal.Control.DrawingToolbar
 * The Geoportal drawing tool class.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id="Geoportal.Control.DrawingToolbar_#{LayerId}" class="gpControlDrawingToolbar olControlNoSelect" style="display:">
 *   <div class="olControlDragFeatureItemInactive"></div>
 *   <div class="gpControlDeleteFeatureItemInactive"></div>
 *   <div class="olControlSelectFeatureItemInactive"></div>
 *   <div class="olControlDrawFeaturePointItemInactive"></div>
 *   <div class="olControlDrawFeaturePathItemInactive"></div>
 *   <div class="olControlDrawFeaturePolygonItemInactive"></div>
 *   <div class="olControlDrawFeatureTextItemInactive"></div>
 *   <div class="olControlModifyFeatureItemInactive"></div>
 *   <div class="gpControlAddAttributeToLayerItemInactive"></div>
 *   <div class="gpControlSaveLayerItemInactive"></div>
 *   <div class="gpControlAddVectorLayerItemInactive"></div>
 * </div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control.EditingToolbar>}
 */
Geoportal.Control.DrawingToolbar = OpenLayers.Class(Geoportal.Control.EditingToolbar, {

    /**
     * Property: mode
     * {String} the drawing toolbar can be in 'multiple' mode (each layer in the layer
     * switcher has its own drawing toolbar) or in 'single' mode (there is only one drawing
     * toolbar which controls the layer currently activated in the layer switcher). Defaults is 'multiple'.
     */
    mode : 'multiple',

    /**
     * Property: DEFAULT_SELECT_FONTCOLOR
     * {String} Default fontColor style for label selection. Defaults is 'blue'.
     */
    DEFAULT_SELECT_FONTCOLOR : 'blue',

    /**
     * Constructor: Geoportal.Control.DrawingToolbar
     * Create a drawing toolbar for a given layer that holds geometry types 
     * <OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>, 
     * <OpenLayers/Geometry/LineString at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/LineString-js.html>,
     * <OpenLayers.Geometry.Polygon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Polygon-js.html>.
     * 
     * Parameters: 
     * layer - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} the overlay to attach with
     * options - {Object} any options usefull for control.
     * If options.layerVectorOptions.eventListeners exists, the eventListeners object will be registred to
     * the vector layer with <OpenLayers.Events.on>. Object
     *     structure must be a listeners object as shown in the example for
     *     the events.on method.
     * If options.drawFeatureOptions exists it is hand over to
     *   {<OpenLayers.Control.DrawFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DrawFeature-js.html>} constructor.
     *   options.dragFeatureOptions, options.modifyFeatureOptions, options.deleteFeatureOptions and
     *   options.selectFeatureOptions are handed over to
     *   {<OpenLayers.Control.DragFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DragFeature-js.html>},
     *   {<OpenLayers/Control/ModifyFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/ModifyFeature-js.html>},
     *   {<Geoportal/Control/DeleteFeature>},
     *   {<OpenLayers.Control.SelectFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/SelectFeature-js.html>} respectively.
     * If options.drawFeatureTextOptions exists it is hand over to the
     *   {<OpenLayers.Control.DrawFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DrawFeature-js.html>} constructor.
     * If options.addAttributeToLayerOptions exists it is hand over to {<Geoportal/Control/AddAttributeToLayer>}
     * If options.saveLayerOptions exists it is hand over to
     *   {<Geoportal.Control.SaveLayer>} constructor.
     * If options.addVectorLayerOptions exists it is hand over to
     *   {<Geoportal.Control.AddVectorLayer>} constructor.
     */
    initialize : function(layer,options) {
        if (!options) {
            options= {};
        }
        if (options.mode!='single') {
            options.div = options.div || document.createElement("div");
        }
        var vevnts = OpenLayers.Util.extend({
            "beforefeatureadded" : this.beforeFeatureAddedLayerListener,
            "featureadded" : this.featureAddedLayerListener,
            "beforefeatureselected" : this.beforeFeatureSelectedLayerListener,
            "featureselected" : this.featureSelectedLayerListener,
            "featureunselected" : this.featureUnselectedLayerListener,
            "beforefeaturemodified" : this.beforeFeatureModifiedModifyFeatureListener,
            scope : this
        },options.layerVectorOptions ? options.layerVectorOptions.eventListeners : {});
        this.vectorEvents = vevnts;
        if (!layer) { // init the toolbar as inactive, use a dummy vector layer to init the controls
            layer = new OpenLayers.Layer.Vector("",{displayInLayerSwitcher:false});
            this.blockToolbar = true;
        }
        layer.schema = [];
        this.defaultAttributes = {
                    'name' : {
                        defaultValue : "",
                        persistent : true
                    },
                    'description' : {
                        defaultValue : "",
                        type : 'text',
                        persistent : true
                    }
                };
        Geoportal.Control.EditingToolbar.prototype.initialize.apply(this, [layer,null,options]);
        this.updateLayer();

    },

    /**
     * Method: updateLayer
     * Update the active layer : register events and update styleMap (add default select style for labels).
     * Clone the layer styleMap in order to avoid modify OpenLayers.Feature.Vector.style default values.
     *
     */
    updateLayer: function() {
        if (this.layer) {
            this.layer.events.on(this.vectorEvents);
            if (this.layer.styleMap) {
                this.layer.styleMap = this.layer.styleMap.clone();
                this.layer.styleMap.styles['select'].defaultStyle = OpenLayers.Util.extend({
                    fontColor:this.DEFAULT_SELECT_FONTCOLOR
                },this.layer.styleMap.styles['select'].defaultStyle);
            }
        }
    },

    /**
     * Method: addToolbarControls
     * Add controls to the toolbar panel.
     * Store the initial options to use them in single mode when the active layer changes (the controls of the toolbar
     * need to be instanciated with the new active layer and the initial options). 
     *
     * Parameters:
     * options - {Object} Hashtable of options to set on the toolbar.
     *   If options.drawFeatureOptions exists it is hand over to
     *   {<OpenLayers.Control.DrawFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DrawFeature-js.html>} constructor.
     *   options.dragFeatureOptions, options.modifyFeatureOptions, options.deleteFeatureOptions and
     *   options.selectFeatureOptions are handed over to
     *   {<OpenLayers.Control.DragFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DragFeature-js.html>},
     *   {<OpenLayers/Control/ModifyFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/ModifyFeature-js.html>},
     *   {<Geoportal/Control/DeleteFeature>},
     *   {<OpenLayers.Control.SelectFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/SelectFeature-js.html>} respectively.
     * If options.drawFeatureTextOptions exists it is hand over to the
     *   {<OpenLayers.Control.DrawFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/DrawFeature-js.html>} constructor.
     * If options.addAttributeToLayerOptions exists it is hand over to {<Geoportal/Control/AddAttributeToLayer>}
     * If options.saveLayerOptions exists it is hand over to
     *   {<Geoportal.Control.SaveLayer>} constructor.
     * If options.addVectorLayerOptions exists it is hand over to
     *   {<Geoportal.Control.AddVectorLayer>} constructor.
     *
     */
    addToolbarControls: function(options) {
        if (!this.toolbarOptions) {
            this.toolbarOptions= options;
        }
        options= this.toolbarOptions;
        Geoportal.Control.EditingToolbar.prototype.addToolbarControls.apply(this, [options]);
        var handlers = [OpenLayers.Handler.Point, OpenLayers.Handler.Path, OpenLayers.Handler.Polygon];
        for (var i=0; i<handlers.length; i++){
            this.addControls(
                new OpenLayers.Control.DrawFeature(
                    this.layer,
                    handlers[i],
                    OpenLayers.Util.extend(
                        OpenLayers.Util.applyDefaults({},this.DEFAULT_OPTIONS[handlers[i].prototype.CLASS_NAME]),
                        options.drawFeatureOptions
                    )
                )
            );
        }

        // add text control
        this.addControls(
            new OpenLayers.Control.DrawFeature(
                this.layer,
                OpenLayers.Handler.Point,
                OpenLayers.Util.extend(
                    OpenLayers.Util.applyDefaults({
                            uiOptions:{
                                'displayClass': 'olControlDrawFeatureText',
                                'title': this.getDisplayClass()+'.drawtext'
                            }
                        },this.DEFAULT_OPTIONS["OpenLayers.Handler.Point"]),
                    OpenLayers.Util.extend({
                            eventListeners: {
                                "featureadded" : this.labelAddedDrawFeatureListener,
                                scope: this
                            }/*,
                            handlerOptions: {
                                style: OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], 
                                    {pointRadius:0,label:"T",fontSize:'15px',fontWeight:"Bold"})
                            }*/
                        },options.drawFeatureTextOptions)
                )
            )
        );

        this.addControls(
            new OpenLayers.Control.ModifyFeature(
                this.layer,
                OpenLayers.Util.extend(
                    OpenLayers.Util.applyDefaults({
                            eventListeners: { "activate" : this.unselectAll }
                        },this.DEFAULT_OPTIONS['OpenLayers.Control.ModifyFeature']),
                    options.modifyFeatureOptions
                )
            )
        );

        var attControl = new Geoportal.Control.AddAttributeToLayer(this.layer, OpenLayers.Util.extend({
                title : 'gpControlAddAttributeToLayer.title',
                defaultAttributes : this.defaultAttributes
            },options.addAttributeToLayerOptions)
        );
        this.toolbarOptions.addAttributeToLayerOptions = OpenLayers.Util.extend(
            this.toolbarOptions.addAttributeToLayerOptions,
            { defaultAttributes : null });
        this.addControls(attControl);
        attControl.div.style.display = 'block';
        var saveControl = new Geoportal.Control.SaveLayer(this.layer,
            OpenLayers.Util.extend(
                {title : 'gpControlSaveLayer.title'},
                options.saveLayerOptions
            )
        );
        this.addControls(saveControl);
        saveControl.div.style.display = 'block';

        if (this.mode == 'single') {
            var addVectorLayerControl = new Geoportal.Control.AddVectorLayer(
                OpenLayers.Util.extend({
                    title : 'gpControlAddVectorLayer.title',
                    supportedClasses: [
                        'OpenLayers.Geometry.Collection',
                        'OpenLayers.Format.KML',
                        'Geoportal.Format.GPX',
                        'OpenLayers.Format.OSM']
                    },
                    options.addVectorLayerOptions
                )
            );
            this.addControls(addVectorLayerControl);
        }

        this.addControls(
            new Geoportal.Control.EditFeature(
                this.layer,
                OpenLayers.Util.applyDefaults({
                            uiOptions:{
                                'displayClass': 'olControlSelectFeature',
                                'title': 'gpControlEditFeature.title'}
                        },this.DEFAULT_OPTIONS["OpenLayers.Handler.Point"])
            )
        );

        var layerStyling = new Geoportal.Control.LayerStyling(this.layer,{
            uiOptions:{title: 'gpControlLayerStyling.title'},
            isCollection: true
        });
        this.addControls(layerStyling);
        layerStyling.div.style.display = 'block';

    },

    /**
     * Method: removeControls 
     * Remove the controls from the toolbar panel. Used to reset the toolbar when
     * the drawing layer is changed ('single' mode).
     */
    removeControls: function() {
        for (var ctl, i = this.controls.length - 1; i >= 0; i--) {
            ctl = this.controls[i];
            this.div.removeChild(ctl.div);
            OpenLayers.Util.removeItem(this.controls, ctl);
            ctl.destroy();
        }
    },

    /**
     * Method: destroy 
     * The destroy method is used to perform any clean up before
     * the control is dereferenced. Typically this is where event listeners are
     * removed to prevent memory leaks.
     */
    destroy : function() {
        this.layer = null;
        if (this.mode=='single') {
            this.map.events.unregister("activelayer", this, this.onActivateLayer);
        }
        if (this.highlightCntl) {
            this.highlightCntl.destroy();
        }
        Geoportal.Control.EditingToolbar.prototype.destroy.apply(this, arguments);
    },

    /** 
     * Method: setMap
     * Set the map property for the control. Add the vector layer for
     * drawing once the control has its map variable set. 
     *
     * Parameters:
     * map - {<OpenLayers.Map>} the map
     */
    setMap : function() {
        Geoportal.Control.EditingToolbar.prototype.setMap.apply(this, arguments);
        if (!this.blockToolbar) {
            this.map.addLayer(this.layer);
        }
        if (this.mode == 'single') {
            this.map.events.register("activelayer", this, this.onActivateLayer);
        }
        this.addHighlightControl();
    },

    /**
     * APIMethod: activate
     * Explicitly activates a control and it's associated
     * handler if one has been set.  Controls can be
     * deactivated by calling the deactivate() method.
     * 
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        var result = Geoportal.Control.EditingToolbar.prototype.activate.apply(this, arguments);
        if (this.blockToolbar) {
            for (var i= 0, len= this.controls.length; i<len; i++) {
                this.controls[i].deactivate();
                OpenLayers.Control.Panel.prototype.iconBlock.apply(this.controls[i],[]);
            }
            this.active = false;
        }
        return result;
    },

    /**
     * APIMethod: onActiveLayer
     * Change the drawing toolbar active layer with the current layer selected in the layer switcher.
     * Remove the controls linked to the previous drawing layer and then add new controls linked to the new drawing layer.
     *
     * Parameters:
     * evt - {Event} the fired event. evt.layer holds the layer which has been selected in the layer switcher.
     * 
     */
    onActivateLayer : function(evt) {
        if (this.mode=='single' && evt.layer!=this.layer) {
            this.active = (evt.layer instanceof OpenLayers.Layer.Vector);
            this.unregisterControlsEvents();
            if (this.highlightCntl) {
                this.highlightCntl.destroy();
            }
            for (var i= 0, len= this.controls.length; i<len; i++) {
                this.controls[i].deactivate();
                if (!this.active) {
                    OpenLayers.Control.Panel.prototype.iconBlock.apply(this.controls[i],[]);
                } else {
                    OpenLayers.Control.Panel.prototype.iconOff.apply(this.controls[i],[]);
                }
            }
            this.layer.events.un(this.vectorEvents);
            this.layer = evt.layer;
            if (this.active) {
                if(!this.layer.schema){
                    this.layer.schema = [];
                    for (var a in this.defaultAttributes) {
                        if (typeof(this.layer.schema[a])=='undefined') {
                            var att= { 'attributeName': a };
                            OpenLayers.Util.extend(att,this.defaultAttributes[a]);
                            this.layer.schema.push(att);
                        }
                    }
                }
                this.updateLayer();
                this.removeControls();
                this.addToolbarControls();
                this.registerControlsEvents();
                this.addHighlightControl();
            }
        }
    },

    /**
     * Method: addHighlightControl
     * Add a select control used with 'single' mode and several layers to highlight 
     * the features of the active layer.
     *
     */
    addHighlightControl: function() {
        if (this.mode == 'single') {
            this.highlightCntl = new OpenLayers.Control.SelectFeature(
                this.layer,
                OpenLayers.Util.extend(
                    OpenLayers.Util.applyDefaults({},this.DEFAULT_OPTIONS['OpenLayers.Control.SelectFeature']),
                    {
                        hover: true,
                        highlightOnly: true,
                        autoActivate: true
                        //renderIntent: "temporary"
                    }
                )
            );
            this.map.addControl(this.highlightCntl);
        }
    },

    /**
     * Method: beforeFeatureAddedLayerListener 
     * Unselect all features except the one accessed through the object parameter. Fill 
     * feature attributes with the layer attributes. Called before the feature is drawn.
     * 
     * Parameters:
     * object - {Object} contains the feature we want to add
     * 
     * Returns:
     * {Boolean} true
     */
    beforeFeatureAddedLayerListener : function(object) {
        if (object.feature.layer.format) {
            // KML, GPX, OSM
            return true;
        }
        this.unselectAll(object.feature);
        // add attributes :
        if (object.feature.layer.schema) {
            for (var i = 0, l = object.feature.layer.schema.length; i < l; i++) {
                var a = object.feature.layer.schema[i];
                if (typeof(object.feature.attributes[a.attributeName]) == 'undefined') {
                    var defaultvalue = a.defaultValue;
                    if (a.attributeName == 'name') {
                        defaultvalue = OpenLayers
                                .i18n("gpControlAddAttributeToLayer.attName")
                                + object.feature.layer.features.length;
                    }
                    object.feature.attributes[a.attributeName] = defaultvalue;
                }
            }
        }
        return true;
    },

    /**
     * Method: featureAddedLayerListener
     * Callback of the featureadded event of the vector layer.
     * 
     * Parameters:
     * object - {Object} object that contains the added feature
     *
     * Returns:
     * {Boolean} true
     */
    featureAddedLayerListener : function(object) {
        return true;
    },

    /**
     * Method: beforeFeatureSelectedLayerListener
     * Unselect all features except the one accessed through the object
     * parameter. Assign "select" rendering. Called before the feature is
     * drawn.
     *
     * Parameters:
     * object - {Object} contains the feature we want to select
     *
     * Returns:
     * {Boolean} true
     */
    beforeFeatureSelectedLayerListener : function(object) {
        this.unselectAll(object.feature);
        this.setStyle(object.feature,'', true);
        return true;
    },

    /**
     * Method: featureSelectedLayerListener
     * Called when feature is selected
     * 
     * Parameters:
     * object - {Object} object that contains the selected feature
     */
    featureSelectedLayerListener : function(object) {
        return true;
    },

    /**
     * Method: featureUnselectedLayerListener
     * Callback when a feature gets deselected.
     * 
     * Parameters:
     * object - {Object} object that contains the feature to unselect
     * 
     * Returns:
     * {Boolean} true
     */
    featureUnselectedLayerListener : function(object) {
        this.unselectFeature(object.feature);
        return true;
    },

    /**
     * Method: beforeFeatureModifiedModifyFeatureListener
     * Unselect features except the one that is going to be modified.
     * 
     * Parameters:
     * object - {Object}
     * 
     * Returns: {Boolean} true
     */
    beforeFeatureModifiedModifyFeatureListener : function(object) {
        if (!object || !object.feature) {
            return;
        }
        this.unselectAll(object.feature);
        return true;
    },

    /**
     * Method: labelAddedDrawFeatureListener
     * Called when a new label is added to the layer
     *
     * Parameters:
     * object - {Object} object.feature contains the label feature
     * 
     */
    labelAddedDrawFeatureListener : function(object) {
        var feature = object.feature;
        feature.extendedData = {isLabel:true};
        feature.style = OpenLayers.Util.applyDefaults(
            { pointRadius:0, label:feature.attributes['name'], labelSelect : true },
            feature.layer.style||feature.layer.styleMap.createSymbolizer(feature));
        feature.style.defaultStyle = OpenLayers.Util.extend({},feature.style);
        feature.layer.drawFeature(feature);
        this.getControlsByClass('Geoportal.Control.EditFeature')[0].openEditionPopup(feature);
    },

    /**
     * Method: unselectFeature
     * Unselect a feature
     * 
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} currently selected object.
     */
    unselectFeature : function(feature) {
        Geoportal.Control.unselectFeature(feature);
        this.setStyle(feature,'', false);
        this.layer.drawFeature(feature, 'default');
    },

    /**
     * Method: unselectAll
     * Unselect all currently selected features except the feature passed in
     * parameters.
     * 
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the feature being selected.
     */
    unselectAll : function(feature) {
        var cntrls = this.layer.map.getControlsByClass('Geoportal.Control.DrawingToolbar');
        for (var i = 0, il = cntrls.length; i < il; i++) {
            var p = cntrls[i];
            var sa = p.getControlsByClass('OpenLayers.Control.SelectFeature');
            if (!(sa && sa.length > 0 && sa[0])) {
                continue;
            }
            var s = sa[0];
            if (p.controls[0].layer != feature.layer) {
                s.unselectAll();
            } else {
                s.unselectAll({ except : feature });
            }
        }
    },

    /**
     * Method: setStyle
     * Assigns styles on selection/deselection.
     * 
     * Parameters: 
     * feature - {<OpenLayers.Feature.Vector>} feature being selected/unselected. 
     * ico - {String} icon acronym. If none, null or empty.
     * selectIt - {Boolean} true if the feature is being selected, false otherwise.
     */
    setStyle : function(feature, ico, selectIt) {
        if (!feature.layer.format
                || !feature.layer.format.prototype
                || !feature.layer.format.prototype.CLASS_NAME
                        .match(/.*\.Format\.(KML|GPX)$/)) {
            if (selectIt) {
                if (feature.style) {
                    feature.style.defaultStyle = OpenLayers.Util.extend({},feature.style);
                    var defaultSelectStyle = {};
                    if (this.isFeatureLabel(feature)) {
                        defaultSelectStyle = { pointRadius:0, label:feature.attributes['name'], labelSelect:true };
                    }
                    feature.style = OpenLayers.Util.applyDefaults(
                        OpenLayers.Util.applyDefaults(defaultSelectStyle,{ defaultStyle:feature.style.defaultStyle }),
                        feature.layer.styleMap.styles['select'].createSymbolizer(feature));
                }
                feature.renderIntent= 'select';
            } else {
                if (feature.style) {
                    var defaultUnSelectStyle = {};
                    if (this.isFeatureLabel(feature)) {
                        defaultUnSelectStyle = { pointRadius:0, label:feature.attributes['name'], labelSelect:true };
                    }
                    feature.style = OpenLayers.Util.applyDefaults(defaultUnSelectStyle,feature.style.defaultStyle);
                }
                feature.renderIntent= 'default';
            }
        }
        // force redraw later (especially because of label display) :
        feature.layer.drawFeature(feature, { display : 'none' });
    },

    /**
     * Method: isFeatureLabel 
     * Test if the feature is a label
     * 
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} the feature we want to test
     * 
     * Returns:
     * {Boolean} true if the feature is a label, false else
     */
    isFeatureLabel : function(feature){
        return feature.extendedData ? feature.extendedData.isLabel : false;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.DrawingToolbar"*
     */
    CLASS_NAME : "Geoportal.Control.DrawingToolbar"
});

