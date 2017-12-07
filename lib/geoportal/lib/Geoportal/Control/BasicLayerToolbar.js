/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Panel.js
 * @requires Geoportal/Control/PanelToggle.js
 * @requires Geoportal/Control/RemoveLayer.js
 * @requires Geoportal/Control/LayerOpacity.js
 * @requires Geoportal/Control/ZoomToLayerMaxExtent.js
 */
/**
 * Class: Geoportal.Control.BasicLayerToolbar
 * A tool for controlling removal of layer from the map, layer's opacity and
 * zoom to layer's maximum extent.
 * The panel is added to the {<Geoportal.Control.LayerSwitcher>} layer's tabs.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id="basic_#{LayerId}" class="gpControlBasicLayerToolbar olControlNoSelect" style="display:">
 *   <div id="panelToggle_#{Layer.id}" class="gpControlPanelToogleItem[Active|Inactive]"/>
 *   <div id="layerDrop_#{Layer.id}" class="gpControlRemoveLayerItem[Active|Inactive]"/>
 *   <div id="layerOpacity_#{layer.id}" class="gpControlLayerOpacitySliderItem[Active|Inactive]"></div>
 *   <div id="layerZoom_#{Layer.id}" class="gpControlZoomToLayerMaxExtentItem[Active|Inactive]"/>
 * </div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control.Panel>}
 */
Geoportal.Control.BasicLayerToolbar =
    OpenLayers.Class( Geoportal.Control.Panel, {

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the layer under controlled
     */
    layer: null,

    /**
     * Property: panelToggleCntrlId
     * {String} identifier of the {<Geoportal.Control.PanelToggle>} control.
     */
    panelToggleCntrlId: null,

    /**
     * Property: removeLayerCntrlId
     * {String} identifier of the {<Geoportal.Control.RemoveLayer>} control.
     */
    removeLayerCntrlId: null,

    /**
     * Property: opacitySliderCntrlId
     * {String} identifier of the {<Geoportal.Control.OpacitySlider>} control.
     */
    opacitySliderCntrlId: null,

    /**
     * Property: zoomToLayerMaxExtentCntrlId
     * {String} identifier of the {<Geoportal.Control.ZoomToLayerMaxExtent>}
     * control.
     */
    zoomToLayerMaxExtentCntrlId: null,

    /**
     * Constructor: Geoportal.Control.BasicLayerToolbar
     * Create a basic toolbar for a given layer.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the overlay to attach with
     * options - {Object} Hashtable of options to set on the toolbar.
     *      - Options for {<Geoportal.Control.PanelToggle>} are expected under
     *      options.panelToggleOptions.
     *      - Options for {<Geoportal.Control.RemoveLayer>} are expected under
     *      options.removeLayerOptions.
     *      - Options for {<Geoportal.Control.LayerOpacity>} are expected under
     *      options.layerOpacityOptions.
     *      - Options for {<Geoportal.Control.ZoomToLayerMaxExtent>} are expected under
     *      options.zoomToLayerMaxExtentOptions.
     */
    initialize: function(layer, options) {
        Geoportal.Control.Panel.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        var ctrl= null;

        if (!options) {
            options= {};
        }

        if (!options.panelToggleOptions) {
            options.panelToggleOptions= {};
        }
        this.panelToggleCntrlId=
            options.panelToggleOptions.id ||
            (options.panelToggleOptions.div? options.panelToggleOptions.div.id : null) ||
            "panelToggle_" + this.id;
        this.addControls(
            new Geoportal.Control.PanelToggle(
                this,
                OpenLayers.Util.extend(
                    {
                        id: this.panelToggleCntrlId
                    },
                    options.panelToggleOptions
                )
            )
        );

        if (!options.removeLayerOptions) {
            options.removeLayerOptions= {};
        }
        this.removeLayerCntrlId=
            options.removeLayerOptions.id ||
            (options.removeLayerOptions.div? options.removeLayerOptions.div.id : null) ||
            "layerDrop_" + this.id;
        this.addControls(
            new Geoportal.Control.RemoveLayer(
                this.layer,
                OpenLayers.Util.extend(
                    {
                        id: this.removeLayerCntrlId,
                        title: 'gpControlRemoveLayer.title'
                    },
                    options.removeLayerOptions
                )
            )
        );

        if (!options.layerOpacityOptions) {
            options.layerOpacityOptions= {};
        }
        if (typeof(this.layer.opacity)==='number') {
            this.opacitySliderCntrlId=
                options.layerOpacityOptions.id ||
                (options.layerOpacityOptions.div? options.layerOpacityOptions.div.id : null) ||
                "layerOpacity_" + this.id;
            this.addControls(
                new Geoportal.Control.LayerOpacity(
                    this.layer,
                    OpenLayers.Util.extend(
                        {
                            id: this.opacitySliderCntrlId,
                            title: 'gpControlLayerOpacity.title'
                        },
                        options.layerOpacityOptions
                    )
                )
            );
        }

        if (!options.zoomToLayerMaxExtentOptions) {
            options.zoomToLayerMaxExtentOptions= {};
        }
        this.zoomToLayerMaxExtentCntrlId=
            options.zoomToLayerMaxExtentOptions.id ||
            (options.zoomToLayerMaxExtentOptions.div? options.zoomToLayerMaxExtentOptions.div.id : null) ||
            "layerZoom_" + this.id;
        this.addControls(
            new Geoportal.Control.ZoomToLayerMaxExtent(
                this.layer,
                OpenLayers.Util.extend(
                    {
                        id: this.zoomToLayerMaxExtentCntrlId,
                        title: 'gpControlZoomToLayerMaxExtent.title'
                    },
                    options.zoomToLayerMaxExtentOptions
                )
            )
        );
    },

    /**
     * APIMethod: draw
     * Call the default draw, and then activate panel switch.
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
        }
        return this.div;
    },

    /**
     * Method: onClick
     * Override <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> to prevent
     * <Geoportal.Control.LayerOpacity> to be clicked.
     *
     * Parameters:
     * ctrl - {OpenLayers.Control} the clicked control.
     * evt - {Event} the fired event.
     */
    onClick: function (ctrl, evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        if (!(ctrl instanceof Geoportal.Control.LayerOpacity)) {
            // only the slider listens to click !
            this.activateControl(ctrl);
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.BasicLayerToolbar"*
     */
    CLASS_NAME: "Geoportal.Control.BasicLayerToolbar"
});
