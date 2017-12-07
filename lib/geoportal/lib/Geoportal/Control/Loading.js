/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.Loading
 * A control that listen to "loadstart" and "loadend" events.
 *      Designed from OpenLayers addin : OpenLayers.Control.LoadingPanel.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.Loading= OpenLayers.Class(Geoportal.Control, {

    /**
     * Property: counter
     * {Integer} A counter for the number of layers loading.
     */
    counter: 0,

    /**
     * Property: maximized
     * {Boolean} A boolean indicating whether or not the control is maximized.
     */
    maximized: false,

    /**
     * Property: visible
     * {Boolean} A boolean indicating whether or not the control is visible.
     */
    visible: true,

    /**
     * APIProperty: layers
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html> | Array({<OpenLayers/Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>})} The controlled layers.
     */
    layers: null,

    /**
     * Constructor: Geoportal.Control.Loading
     * Builds the control.
     *
     * Parameters:
     * layers - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html> | Array({<OpenLayers/Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>})} layers to monitor.
     *      When passing an object, the control reacts only to "loadstart",
     *      "loadend" events of that layers.
     *      When passing an array of {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>}, the control reacts
     *      only to "loadstart", "loadend" events of those layers.
     *      When null, the control monitors every layers in the current map.
     * options - {Object} additional options.
     */
    initialize: function(layers, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        if (layers && typeof(layers)=='object') {
            layers=[layers];
        }
        this.layers= layers;
    },

    /**
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        var i, l, lyr, layers;
        if (this.layers) {
            layers= this.layers;
            this.layers= null;
        } else {
            if (this.map) {
                this.map.events.unregister('preaddlayer', this, this.addLayer);
                if (this.map.layers) {
                    layers= this.map.layers;
                }
            }
        }
        if (layers) {
            for (i= 0, l= layers.length; i<l; i++) {
                lyr= layers[i];
                if (lyr instanceof Geoportal.Layer.Aggregate) {
                    if (lyr.layers) {
                        for (var i= 0, len= lyr.layers.length; i<len; i++) {
                            lyr.layers[i].events.unregister('loadstart', this, this.increaseCounter);
                            lyr.layers[i].events.unregister('loadend', this, this.decreaseCounter);
                        }
                    }
                } else {
                    lyr.events.unregister('loadstart', this, this.increaseCounter);
                    lyr.events.unregister('loadend', this, this.decreaseCounter);
                }
            }
        }
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: setVisible
     * Set the visibility of this control
     *
     * Parameters:
     * visible - {Boolean} should the control be visible or not?
     */
    setVisible: function(visible) {
        this.visible= visible;
        this.div.style.display= visible? '' : 'none';
    },

    /**
     * Method: getVisible
     * Get the visibility of this control
     *
     * Returns:
     * {Boolean} the current visibility of this control
     */
    getVisible: function() {
        return this.visible;
    },

    /**
     * APIMethod: hide
     * Hide the loading panel control
     */
    hide: function() {
        this.setVisible(false);
    },

    /**
     * APIMethod: show
     * Show the loading panel control
     */
    show: function() {
        this.setVisible(true);
    },

    /**
     * APIMethod: toggle
     * Toggle the visibility of the loading panel control
     */
    toggle: function() {
        this.setVisible(!this.getVisible());
    },

    /**
     * Method: addLayer
     * Attach event handlers when new layer gets added to the map. This method
     * is used only when the no layers have been passed to the control's
     * constructor.
     *
     * Parameters:
     * evt - {Event}
     */
    addLayer: function(evt) {
        if (evt.layer) {
            if (evt.layer instanceof Geoportal.Layer.Aggregate) {
                if (evt.layer.layers) {
                    for (var i= 0, len= evt.layer.layers.length; i<len; i++) {
                        if (evt.layer.layers[i].events) {
                            evt.layer.layers[i].events.register('loadstart', this, this.increaseCounter);
                            evt.layer.layers[i].events.register('loadend', this, this.decreaseCounter);
                        }
                    }
                }
            } else {
                evt.layer.events.register('loadstart', this, this.increaseCounter);
                evt.layer.events.register('loadend', this, this.decreaseCounter);
            }
        }
    },

    /**
     * APIMethod: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>} The control's map.
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this, arguments);
        if (!this.layers) {
            // Monitor all map's layers :
            this.map.events.register('preaddlayer', this, this.addLayer);
        }
        var layers= this.layers || this.map.layers;
        for (var i= 0, l= layers.length; i <l; i++) {
            var layer= layers[i];
            if (layer instanceof Geoportal.Layer.Aggregate) {
                if (layer.layers) {
                    for (var j= 0, lj= layer.layers.length; j<lj; j++) {
                        layer.layers[j].events.register('loadstart', this, this.increaseCounter);
                        layer.layers[j].events.register('loadend', this, this.decreaseCounter);
                    }
                }
            } else {
                layer.events.register('loadstart', this, this.increaseCounter);
                layer.events.register('loadend', this, this.decreaseCounter);
            }
        }
    },

    /**
     * Method: increaseCounter
     * Increase the counter and show control.
     */
    increaseCounter: function() {
        this.counter++;
        if (this.counter>0) {
            if (!this.maximized && this.visible) {
                this.maximizeControl();
            }
        }
    },

    /**
     * Method: decreaseCounter
     * Decrease the counter and hide the control if finished.
     */
    decreaseCounter: function() {
        if (this.counter>0) {
            this.counter--;
        }
        if (this.counter==0) {
            if (this.maximized && this.visible) {
                this.minimizeControl();
            }
        }
    },

    /**
     * Method: draw
     * Create and return the element to be splashed over the map.
     */
    draw: function () {
        Geoportal.Control.prototype.draw.apply(this, arguments);
        return this.div;
    },

    /**
     * Method: minimizeControl
     * Set the display properties of the control to make it disappear.
     *
     * Parameters:
     * evt - {Event}
     */
    minimizeControl: function(evt) {
        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
        this.div.style.display= "none";
        this.maximized= false;
    },

    /**
     * Method: maximizeControl
     * Make the control visible.
     *
     * Parameters:
     * evt - {Event}
     */
    maximizeControl: function(evt) {
        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
        this.div.style.display= "block";
        if (!this.layers) {
            var viewSize= this.map.getSize();
            var msgW= viewSize.w;
            var msgH= viewSize.h;
            this.div.style.left=  msgW/2 - this.div.offsetWidth/2  + "px";
            this.div.style.top= msgH/2 - this.div.offsetHeight/2 + "px";
        }
        this.maximized= true;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Loading"*
     */
    CLASS_NAME: "Geoportal.Control.Loading"
});

/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * Class: OpenLayers.Control.LoadingPanel
 * In some applications, it makes sense to alert the user that something is
 * happening while tiles are loading. This control displays a div across the
 * map when this is going on.
 *      This implementation is a refactoring of the original OpenLayers addin
 *      to implement it using the <Geoportal.Control.Loading> class.
 *
 * Inherits from:
 *  - <Geoportal.Control.Loading>
 */
OpenLayers.Control.LoadingPanel= OpenLayers.Class(Geoportal.Control.Loading, {

    /**
     * Constructor: OpenLayers.Control.LoadingPanel
     * Display a panel across the map that says 'loading'.
     *
     * Parameters:
     * options - {Object} additional options.
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.layers= null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"OpenLayers.Control.LoadingPanel"*
     */
    CLASS_NAME: "OpenLayers.Control.LoadingPanel"
});
