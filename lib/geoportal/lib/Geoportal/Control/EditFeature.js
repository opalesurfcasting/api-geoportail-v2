/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.EditFeature
 * Edit vector features from a given layer on click.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.EditFeature= OpenLayers.Class(Geoportal.Control, {

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
     * Constructor: Geoportal.Control.EditFeature
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} layer holding features.
     * options - {Object} Options for controlling this control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        var callbacks= {
            click: this.clickFeature
        };
        this.callbacks= OpenLayers.Util.extend(callbacks, this.callbacks);
        this.handlers= {
            feature: new OpenLayers.Handler.Feature(
                this, layer, this.callbacks, {}
            )
        };
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function () {
        this.layer= null;
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
        this.openEditionPopup(feature);
    },

    /**
     * Method: openEditionPopup
     * Open the edition popup of the feature.
     *
     *  Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the feature we want to open the popup
     * 
     */
    openEditionPopup: function(feature) {
        if (feature && feature.layer && feature.layer.map) {
            var ll= feature.geometry.getBounds().getCenterLonLat();
            var nm= '';
            var atts= '';
            for (var i= 0, l= feature.layer.schema.length; i<l; i++) {
                var a= feature.layer.schema[i];
                var id= this.generateAttributeId(a.attributeName,feature.id);
                var v= (feature.attributes[a.attributeName]?
                    feature.attributes[a.attributeName]
                :   a.defaultValue || '').replace(/'/g,"&#39;");
                if (a.attributeName === 'name') {
                    nm = '<input type="text" size="19" value="' + v + '" id="' + id
                            + '" name="' + id + '"/>';
                    continue;
                }
                var h = '<label id="lbl' + id + '" for="' + id + '">'
                        + a.attributeName + '</label>&nbsp;:<br/>';
                if (a.type === 'text') {
                    h += '<textarea id="' + id + '" name="' + id
                            + '" rows="3" cols="22">' + v + '</textarea>';
                } else {
                    if (a.type === 'link' && v != '') {
                        h += '<div class="olControlDrawFeaturePointItemInactive" id="updateLink_'
                                + id + '"></div>';
                        h += '<div class="olControlDrawFeaturePointItemInactive" id="modifyLink_'
                                + id + '"></div>';
                    }
                    h += '<input type="text" size="22" value="' + v + '" id="' + id
                            + '" name="' + id + '"/>';
                    if (a.type === 'link' && v != '') {
                        h += '<a target="_blank" id="link_' + id + '" href="' + v
                                + '">' + a.attributeName + '</a>';
                    }
                }
                h+= '<br/>';
                atts+= h;
            }
            feature.popup= new OpenLayers.Popup.FramedCloud(
                "chicken",
                ll,
                null,
                "<form id='edit"+ this.generateAttributeId('',feature.id) + "' action='javascript:(void)null'>" +
                    "<div class='gpPopupHead'>" + nm + "</div>" +
                    "<div class='gpPopupBody'>" + atts + "</div>" +
                "</form>",
                null,
                true,
                this.closeEditionPopup);
            feature.popup.autoSize= true;
            feature.popup.minSize= new OpenLayers.Size(250, 120);
            feature.popup.maxSize= new OpenLayers.Size(300, 300);
            feature.layer.map.addPopup(feature.popup,true);
            var kbControl= feature.layer.map.getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
            for (var i= 0, l= feature.layer.schema.length; i<l; i++) {
                var a= feature.layer.schema[i];
                var id= this.generateAttributeId(a.attributeName,feature.id);
                var npt= OpenLayers.Util.getElement(id);
                // closure for capturing each attribute and DOM element :
                (function(att,el) {
                    el.onfocus= function() {
                        if (kbControl && kbControl.active) {
                            kbControl.deactivate();
                        }
                    };
                    el.onblur= function() {
                        if (kbControl && !kbControl.active) {
                            kbControl.activate();
                        }
                        if (this.value) {//WARNING: text/textarea ok - select ! ok
                            feature.attributes[att.attributeName]=
                                this.value.replace(/&#039;/g,"'").replace(/\r/g,"_br_") ||  att.defautValue || '';
                            if(att.attributeName === 'name' && feature.extendedData && feature.extendedData.isLabel){
                                feature.style.label = feature.attributes[att.attributeName];
                                feature.layer.drawFeature(feature);
                            }
                        }
                        this.blur();
                    };
                    el.onkeyup= function() {
                        if (this.value) {
                            feature.attributes[att.attributeName]=
                                this.value.replace(/&#039;/g,"'").replace(/\r/g,"_br_") ||  att.defautValue || '';
                            if(att.attributeName === 'name' && feature.extendedData && feature.extendedData.isLabel){
                                feature.style.label = feature.attributes[att.attributeName];
                                feature.layer.drawFeature(feature);
                            }
                        }
                    };
                })(a,npt);
                if (OpenLayers.Util.getElement('modifyLink_' + id)) {
                    OpenLayers.Util.getElement(id).style.display = 'none';
                    OpenLayers.Util.getElement('updateLink_' + id).style.display = 'none';
                    OpenLayers.Event.observe('modifyLink_' + id, "click",
                            OpenLayers.Function.bind(this.modifyLink, this, id));
                    OpenLayers.Event.observe('updateLink_' + id, "click",
                            OpenLayers.Function.bind(this.updateLink, this, id));
                }
            }
        }
    },

    /**
     * Method: generateAttributeId
     * Generate a new id for an attribute field based on the attribute name and
     * the feature id
     * 
     * Parameters: 
     * n - {String} name of the attribute
     * f - {String} feature id
     * 
     * Returns:
     * {String} a new id for the attribute field
     *
     */
    generateAttributeId : function(n, f) {
        return '__featureInfo' + n + f.id + '__';
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
        Geoportal.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * Method: closeEditionPopup
     * Close the edition popup of a feature.
     *
     *  Parameters:
     * evt - {<OpenLayers.Event>}
     * 
     *  Context:
     *  this - {<OpenLayers.Popup>} the popup we want to close
     */
    closeEditionPopup : function(evt) {
        OpenLayers.Event.stop(evt);
        this.hide();//this===OpenLayers.Popup
        if (OpenLayers.Util.getBrowserName() == 'firefox') {
            if (this.map && this.map.events) {
                this.map.events.unregister("movestart", this, this.onMoveStartPopup);//See OpenLayers patch
                this.map.events.unregister("moveend", this, this.onMoveEndPopup);
            }
        }
    },

    /**
     * Method: modifyLink
     * Display an input text to modify the link of URL attribute
     * 
     * Parameters:
     * id - {String} id of the link
     */
    modifyLink : function(id) {
        OpenLayers.Util.getElement(id).style.display = 'block';
        OpenLayers.Util.getElement('updateLink_' + id).style.display = 'block';
        OpenLayers.Util.getElement('modifyLink_' + id).style.display = 'none';
        OpenLayers.Util.getElement('link_' + id).style.display = 'none';
    },

    /**
     * Method: updateLink
     * Update the link of URL attribute
     * 
     * Parameters:
     * id - {String} id of the link
     */
    updateLink : function(id) {
        OpenLayers.Util.getElement(id).style.display = 'none';
        OpenLayers.Util.getElement('modifyLink_' + id).style.display = 'block';
        OpenLayers.Util.getElement('link_' + id).style.display = 'block';
        OpenLayers.Util.getElement('updateLink_' + id).style.display = 'none';
        OpenLayers.Util.getElement('link_' + id).href = OpenLayers.Util.getElement(id).value;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.EditFeature"*
     */
    CLASS_NAME: "Geoportal.Control.EditFeature"
});
