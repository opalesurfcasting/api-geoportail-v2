/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Class: Geoportal.Popup
 * The Geoportal framework popup handler.
 *
 * Inherits from:
 * - <OpenLayers.Popup at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Popup-js.html>
 */
Geoportal.Popup= OpenLayers.Class( OpenLayers.Popup, {

    /** 
     * APIProperty: displayClass
     * {String} The CSS class of the popup.
     */
    displayClass: "gpPopup",

    /**
     * APIProperty: contentDisplayClass
     * {String} The CSS class of the popup content div.
     */
    contentDisplayClass: "gpPopupContent",

    /**
     * APIProperty: closeBoxDisplayClass
     * {String} The CSS class of the popup close box div.
     */
    closeBoxDisplayClass: "gpPopupCloseBox",

    /** 
     * APIProperty: autoSize
     * {Boolean} Resize the popup to auto-fit the contents.
     *     Default is true.
     */
    autoSize: true,

    /**
     * APIProperty: feature
     * {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} The feature supporting this popup
     */
    feature: null,

    /**
     * Constructor: Geoportal.Popup
     * Create a popup.
     *
     * Parameters:
     * id - {String} a unique identifier for this popup.
     *      If null is passed an identifier will be automatically generated.
     * lonlat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} The position on the map the popup will be shown.
     * contentSize - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} The size of the popup.
     * contentHTML - {String} The HTML content to display inside the popup.
     * closeBox - {Boolean} Whether to display a close box inside the popup.
     * closeBoxCallback - {Function} Function to be called on closeBox click.
     * feature - {OpenLayers.Feature} the feature linked with this popup.
     */
    initialize:function(id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback, feature) {
        var newArguments= [id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback];
        OpenLayers.Popup.prototype.initialize.apply(this, newArguments);
        this.feature= feature;

        if (this.feature && this.feature.layer) {
            this.feature.layer.events.register("visibilitychanged", this, this.onVisibilityChanged);
        }
    },

    /**
     * Method: destroy
     * Nullify references to prevent circular references and memory
     * leaks
     */
    destroy: function() {
        if (this.feature) {
            if (this.feature.layer) {
                this.feature.layer.events.unregister("visibilitychanged", this, this.onVisibilityChanged);
            }
            this.feature= null;
        }
        OpenLayers.Popup.prototype.destroy.apply(this,arguments);
    },

    /**
     * Method: onVisibilityChanged
     * Mainly unselect feature when the underlying layer's visibility is
     * set to false
     */
    onVisibilityChanged: function() {
        if (this.feature) {
            if (!this.feature.layer.getVisibility()) {
                this.hide();
                OpenLayers.Util.removeItem(this.feature.layer.selectedFeatures, this.feature);
                this.feature.layer.events.triggerEvent("featureunselected", {feature: this.feature});
            }
        }
    },

    /**
     * APIMethod: defaultCloseBoxCallback
     * Stop event, hide the popup, unregister "movestart" and "moveend" events
     * (under FF only) and triggers "featureunselected".
     *
     * Parameters:
     * e - {Event}
     */
    defaultCloseBoxCallback: function(e) {
        OpenLayers.Popup.prototype.defaultCloseBoxCallback.apply(this, arguments);
        if (this.feature) {
            OpenLayers.Util.removeItem(this.feature.layer.selectedFeatures, this.feature);
            this.feature.layer.events.triggerEvent("featureunselected", {feature: this.feature});
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Popup"*
     */
    CLASS_NAME:"Geoportal.Popup"
});

/**
 * APIMethod: setCursorForFeature
 * Give cursor style to feature's style.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
 * cursor - {String}
 * styles - {Array({String})}
 */
Geoportal.Popup.setCursorForFeature= function(feature, cursor, styles) {
    if (feature) {
        cursor= cursor || 'pointer';
        if (feature.style) {
            feature.style.cursor= cursor;
        } else {
            if (feature.layer) {
                if (feature.layer.style) {
                    feature.layer.style.cursor= cursor;
                } else {
                    if (!feature.layer.styleMap) {
                        feature.layer.styleMap= new OpenLayers.StyleMap();
                    }
                    if (!styles) {
                        styles= [];
                        for (var s in feature.layer.styleMap.styles) {
                            styles.push(s);
                        }
                    }
                    for (var i= 0, l= styles.length; i<l; i++) {
                        var s= feature.layer.styleMap.styles[ styles[i] ];
                        if (s) {
                            feature.layer.styleMap.styles[ styles[i] ]= s.clone();//prevent overwriting defaults
                            feature.layer.styleMap.styles[ styles[i] ].defaultStyle.cursor= cursor;
                        }
                    }
                }
            } else {
                feature.style= OpenLayers.Util.applyDefaults({'cursor':cursor},OpenLayers.Feature.Vector.style['default']);
            }
        }
    }
};

/**
 * APIMethod: setPointerCursorForFeature
 * Give cursor:'pointer' style to feature's style. Allow then to have the
 * mouse pointer changing when hovering the feature.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
 */
Geoportal.Popup.setPointerCursorForFeature= function(feature) {
    Geoportal.Popup.setCursorForFeature(feature,'pointer',['default']);
};

/**
 * APIFunction: completePopup
 * Finalize popup options.
 *
 * Parameters:
 * popup - {<Geoportal.Popup>} the popup to complete.
 * options - {Object} the options (autoSize, maxSize, minSize, overflow,
 *      backgroundColor, opacity, border, className).
 *
 * Returns:
 * {<Geoportal.Popup>} completed.
 */
Geoportal.Popup.completePopup= function(popup, options) {
    if (!options) { return popup;}
    if (options.backgroundColor) {
        popup.setBackgroundColor(options.backgroundColor);
    }
    if (options.opacity) {
        popup.setOpacity(options.opacity);
    }
    if (options.border) {
        popup.setBorder(options.border);
    }
    if (options.className && popup.div) {
        popup.div.className= options.className;
    }
    popup.autoSize= options.autoSize!=undefined ? options.autoSize:true;
    if (options.maxSize) {
        popup.maxSize= options.maxSize;
    }
    if (options.minSize) {
        popup.minSize= options.minSize;
    }
    if (options.overflow!==undefined) {
        popup.contentDiv.style.overflow= options.overflow;
    }
    if (options.panMapIfOutOfView!==undefined) {
        popup.panMapIfOutOfView= options.panMapIfOutOfView;
    }
    if (options.keepInMap!==undefined) {
        popup.keepInMap= options.keepInMap;
    }
    return popup;
};

/**
 * APIFunction: onPopupClose
 * Call-back function associated with closing the popup.
 *
 * Parameters:
 * evt - {<OpenLayers.Event}
 */
Geoportal.Popup.onPopupClose= function(evt) {
    OpenLayers.Event.stop(evt);
    this.hide();
    if (!this.disableFirefoxOverflowHack && OpenLayers.Util.getBrowserName() == 'firefox') {
        if (this.map && this.map.events) {
            this.map.events.unregister("movestart", this, this.onMoveStartPopup);
            this.map.events.unregister("moveend", this, this.onMoveEndPopup);
        }
    }
    if (this.feature) {
        var f= this.feature;
        var ctrls= this.feature.layer.map.getControlsByClass(/^.*\.Control\.SelectFeature$/);
        for (var i= 0, li= ctrls.length; i<li; i++) {
            var c= ctrls[i];
            if (!c.active) { continue; }
            var ls= c.layers || [c.layer];
            for (var j= 0, lj= ls.length; j<lj; j++) {
                if (ls[j]==f.layer) {
                    c.unselect(f);
                }
            }
        }
    }
};

/**
 * APIFunction: defaultIcon
 * Creates a default <OpenLayers.Icon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Icon-js.html>.
 *
 * Returns:
 * {<OpenLayers.Icon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Icon-js.html>} A default OpenLayers.Icon to use for a marker.
 */
Geoportal.Popup.defaultIcon= function() {
    var url= Geoportal.Util.getImagesLocation() + "xy-target.png";
    var size= new OpenLayers.Size(26, 26);
    var calculateOffset= function(size) {
        return new OpenLayers.Pixel(-(size.w/2), -(size.h/2));
    };
    return new OpenLayers.Icon(url, size, null, calculateOffset);
};

