/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.DeleteFeature
 * Delete vector features from a given layer on click (hover is disabled).
 *      Could be extended with a box handler.
 *      Undeleting not yet implemented.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.DeleteFeature= OpenLayers.Class(Geoportal.Control, {

    /**
     * Constant: EVENT_TYPES
     * {Array(String)} Supported application event types.
     *      Events are :
     *      - *beforefeaturesdeleted* Triggered before deleting features;
     *      - *beforefeaturedeleted* Triggered before deleting a feature;
     *      - *featuredeleted* Triggered after feature's deletion;
     *      - *featuresdeleted* Triggered after features' deletion.
     */
    EVENT_TYPES: ["beforefeaturesdeleted", "featuresdeleted",
                  "beforefeaturedeleted","featuredeleted"],

    /**
     * APIProperty: deleteCodes
     * {Array(Integer)} Keycodes for deleting vertices.
     *      Set to null to disable vertex deltion by keypress.
     *      If non-null, keypresses with codes in this array will delete vertices
     *      under the mouse. Default is 46 and 68, the 'delete' and lowercase 'd' keys.
     */
    deleteCodes : null,

    /**
     * APIProperty: onDelete
     * {Function} Optional function to be called when a feature is selected
     * for deletion.
     *      The function should expect to be called with a feature.
     */
    onDelete: function() {},

    /**
     * APIProperty: onUndelete
     * {Function} Optional function to be called when a feature is unselected.
     *      The function should expect to be called with a feature.
     */
    onUndelete: function() {},

    /**
     * APIProperty: geometryTypes
     * {Array(String)} To restrict selecting to a limited set of geometry types,
     * send a list of strings corresponding to the geometry class names.
     */
    geometryTypes: null,

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} The controlled layer.
     */
    layer: null,

    /**
     * APIProperty: callbacks
     * {Object} The functions that are sent to the handlers.feature for callback.
     */
    callbacks: null,

    /**
     * Property: handlers
     * {Object} Object with references to multiple <OpenLayers.Handler at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Handler-js.html>
     * instances.
     */
    handlers: null,

    /**
     * Property: deletedFeatures
     * {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)} Deleted features that could be
     * recovered.
     */
    deletedFeatures: null,

    /**
     * Constructor: Geoportal.Control.DeleteFeature
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} layer holding features.
     * options - {Object} Options for controlling this control.
     */
    initialize: function(layer, options) {
        // concatenate events specific to this control with those from the base
        this.EVENT_TYPES =
            Geoportal.Control.DeleteFeature.prototype.EVENT_TYPES.concat(
            Geoportal.Control.prototype.EVENT_TYPES
        );

        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        this.deleteCodes= [46, 68];

        var callbacks= {
            click: this.clickFeature
        };
        this.callbacks= OpenLayers.Util.extend(callbacks, this.callbacks);
        var keyboardOptions= {
            keydown: this.handleKeypress
        };
        this.handlers= {
            feature: new OpenLayers.Handler.Feature(
                this, layer, this.callbacks, {geometryTypes: this.geometryTypes}
            ),
            keyboard: new OpenLayers.Handler.Keyboard(this, keyboardOptions)
        };

        this.deletedFeatures= [];
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function () {
        this.deletedFeatures= null;
        Geoportal.Control.prototype.destroy.apply(this,arguments);
    },

    /**
     * Method: activate
     * Activates the control.
     *
     * Returns:
     * {Boolean} The control was effectively activated.
     */
    activate: function () {
        if (!this.active) {
            this.handlers.feature.activate();
        }
        return Geoportal.Control.prototype.activate.apply(
            this, arguments
        );
    },

    /**
     * Method: deactivate
     * Deactivates the control.
     *
     * Returns:
     * {Boolean} The control was effectively deactivated.
     */
    deactivate: function () {
        if (this.active) {
            this.handlers.feature.deactivate();
        }
        return Geoportal.Control.prototype.deactivate.apply(
            this, arguments
        );
    },

    /**
     * Method: clickFeature
     * Called on click in a feature.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     */
    clickFeature: function(feature) {
        this.deleteFeature(feature);
    },

    /**
     * Method: handleKeypress
     * Called on DELETE or 'd' key pressed.
     *      Deleted features are those selected.
     *
     * Parameters:
     * evt - {Event} Keypressed event.
     */
    handleKeypress: function(evt) {
        if (!evt) {
            return;
        }
        if (this.layer.selectedFeatures.length > 0 &&
            OpenLayers.Util.indexOf(this.deleteCodes, evt.keyCode)!=-1) {
            if(this.events.triggerEvent("beforefeaturesdeleted", {features: this.layer.selectedFeatures})===false) {
                return;
            }
            for (var i= 0, len= this.layer.selectedFeatures.length; i<len; i++) {
                var feature= this.layer.selectedFeatures.unshift();
                this.deleteFeature(feature);
            }
            if(this.events.triggerEvent("featuresdeleted", {features: features})==false) {
                return;
            }
            features= null;
        }
    },

    /**
     * Method: deleteFeature
     * Remove feature to the layer's features array.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     */
    deleteFeature: function(feature) {
        if(this.events.triggerEvent("beforefeaturedeleted", {feature: feature})===false) {
            return;
        }
        if (feature.popup) {
            feature.popup.hide();
        }
        // feature is saved (recovery) :
        this.deletedFeatures.push(feature);
        this.layer.destroyFeatures([feature]);
        if(this.events.triggerEvent("featuredeleted", {feature: feature})===false) {
            return;
        }
        this.onDelete(feature);
    },

    /**
     * Method: setMap
     * Set the map property for the control.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        this.handlers.feature.setMap(map);
        this.handlers.keyboard.setMap(map);
        Geoportal.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.DeleteFeature"*
     */
    CLASS_NAME: "Geoportal.Control.DeleteFeature"
});
