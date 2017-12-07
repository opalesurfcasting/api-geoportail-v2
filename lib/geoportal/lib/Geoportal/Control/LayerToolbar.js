/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Panel.js
 * @requires Geoportal/Control/AddImageLayer.js
 * @requires Geoportal/Control/AddVectorLayer.js
 */
/**
 * Class: Geoportal.Control.LayerToolbar
 * A tool for controlling addition of various kind of layer to the map.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id="addlayer_#{Id}" class="gpControlLayerToolbar olControlNoSelect" style="display:">
 *   <div id="addvector_#{Id}" class="gpControlAddVectorLayerItem[Active|Inactive]"/>
 *   <div id="addimage_#{Id}" class="gpControlAddImageLayerItem[Active|Inactive]"></div>
 * </div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control.Panel>}
 */
Geoportal.Control.LayerToolbar =
    OpenLayers.Class( Geoportal.Control.Panel, {

    /**
     * Property: addVectorLayerCntrlId
     * {String} identifier of the {<Geoportal.Control.AddVectorLayer>} control.
     */
    addVectorLayerCntrlId: null,

    /**
     * Property: addImageLayerCntrlId
     * {String} identifier of the {<Geoportal.Control.AddImageLayer>} control.
     */
    addImageLayerCntrlId: null,

    /**
     * Constructor: Geoportal.Control.LayerToolbar
     * Create a toolbar for adding layers.
     *
     * Parameters:
     * options - {Object} Hashtable of options to set on the toolbar.
     *      Options for {<Geoportal.Control.AddImageLayer>} are expected under
     *      options.addImageLayerOptions. Options for
     *      {<Geoportal.Control.AddVectorLayer>} are expected under
     *      options.addVectorLayerOptions.
     */
    initialize: function(options) {
        Geoportal.Control.Panel.prototype.initialize.apply(this, [options]);
        var ctrl= null;

        if (!options) {
            options= {};
        }
        if (!options.addVectorLayerOptions && !options.addImageLayerOptions) {
            options.addVectorLayerOptions= {};
            options.addImageLayerOptions= {};
        }

        if (options.addVectorLayerOptions) {
            this.addVectorLayerCntrlId=
                options.addVectorLayerOptions.id ||
                (options.addVectorLayerOptions.div? options.addVectorLayerOptions.div.id : null) ||
                "addvector_" + this.id;
            this.addControls(
                new Geoportal.Control.AddVectorLayer(
                    OpenLayers.Util.extend({
                        id: this.addVectorLayerCntrlId,
                        title: 'gpControlAddVectorLayer.title'
                    },
                    OpenLayers.Util.applyDefaults(options.addVectorLayerOptions,{editingToolbarOptions:{}}))
                )
            );
        }

        if (options.addImageLayerOptions) {
            this.addImageLayerCntrlId=
                options.addImageLayerOptions.id ||
                (options.addImageLayerOptions.div? options.addImageLayerOptions.div.id : null) ||
                "addimage_" + this.id;
            this.addControls(
                new Geoportal.Control.AddImageLayer(
                    OpenLayers.Util.extend({
                        id: this.addImageLayerCntrlId,
                        title: 'gpControlAddImageLayer.title'
                    },
                    options.addImageLayerOptions)
                )
            );
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LayerToolbar"*
     */
    CLASS_NAME: "Geoportal.Control.LayerToolbar"
});
