/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/LayerOpacitySlider.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.LayerOpacity
 * Implements a control for controlling the layer's opacity. Designed
 * to be used with a <Geoportal.Control.Panel>.
 *
 * The control's structure is as follows :
 *
 * (start code)
 *   <div id="#{Id}" class="gpControlLayerOpacityItem[Active|Inactive]">
 *     <div id="trackSlider_#{id}_#{layer.id}" class="gpControlLayerOpacitySlider"></div>
 *     <div id="Opacity_#{id}_#{layer.id}" class="gpOpacityClass">#{layer.opacity}</div>
 *   </div>
 * (end)
 *
 * Inherits from:
 * - {<Geoportal.Control>}
 */
Geoportal.Control.LayerOpacity=
    OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the layer the opacity is watched
     */
    layer: null,

    /**
     * Property: opacitable
     * {Boolean} true when the layer supports opacity, false otherwise.
     *      Defaults to *false*
     */
    opacitable: false,

    /**
     * Property: slider
     * {<Geoportal.Control.LayerOpacitySlider>} the opacity slider control.
     *      May be null when the layer has no opacity.
     */
    slider: null,

    /**
     * Constructor: Geoportal.Control.LayerOpacity
     * Build the control
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the controlled layer.
     * options - {DOMElement} Options for control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        this.opacitable= typeof(this.layer.opacity)=='number';
        if (!this.opacitable) {
            this.setTitle('');
        } else {
            this.setTitle( this.getTitle() || this.getDisplayClass()+'.title');
        }
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete control
     */
    destroy: function() {
        this.deactivate();
        if (this.slider) {
            this.slider.destroy();
        }
        this.slider= null;
        this.layer= null;
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: activate
     * Activate the control and its inner
     * {<Geoportal.Control.LayerOpacitySlider>}.
     * Returns:
     *
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        if (this.slider) {
            this.slider.activate();
        }
        return Geoportal.Control.prototype.activate.apply(this,arguments);
    },

    /**
     * APIMethod: deactivate
     * Deactivate the control and its inner
     * {<Geoportal.Control.LayerOpacitySlider>}.
     *
     * Returns:
     * {Boolean} True if the control was effectively deactivated or false
     *           if the control was already inactive.
     */
    deactivate: function() {
        if (this.slider) {
            this.slider.deactivate();
        }
        return OpenLayers.Control.prototype.deactivate.apply(this,arguments);
    },

    /**
     * APIMethod: draw
     * Call the default draw, and then draw the control.
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the position where to draw the control.
     *
     * Returns:
     * {DOMElement} the control's div.
     */
    draw: function(px) {
        Geoportal.Control.prototype.draw.apply(this, arguments);
        this.redraw();
        this.activate();
        return this.div;
    },

    /**
     * APIMethod: redraw
     * Display the opacity slider.
     * TODO: use Geoportal.UI.LayerOpacity
     *
     * Returns:
     * {DOMElement} A reference to the div DOMElement containing the control
     */
    redraw: function() {
        if (this.opacitable) {
            this.div.innerHTML= "";
            var trackDiv= this.div.ownerDocument.createElement("div");
            trackDiv.id= 'trackSlider_'+this.id;
            trackDiv.className= 'gpControlLayerOpacityTrackSliderClass';
            this.div.appendChild(trackDiv);
            var opacityDiv= this.div.ownerDocument.createElement("div");
            opacityDiv.id= 'Opacity_'+this.id;
            opacityDiv.className= 'gpControlLayerOpacityOpacityClass';
            var op= ''+Math.round(this.layer.opacity*100)+'%';
            opacityDiv.appendChild(this.div.ownerDocument.createTextNode(op));
            opacityDiv.title= op;
            this.div.appendChild(opacityDiv);
            var imgLocation= Geoportal.Util.getImagesLocation();
            this.slider= new Geoportal.Control.LayerOpacitySlider(
                this.layer,
                {
                    id: trackDiv.id,
                    div: trackDiv,
                    levelBarImgWidth: 50,
                    levelBarImgHeight: 5,
                    levelBarImg: imgLocation+"bg_handle.gif",
                    sliderImgWidth: 7,
                    sliderImgHeight: 11,
                    //added to facilitate onDraw() and onSliderMove() works !
                    _opacityDiv: opacityDiv,
                    onDraw: function (level) {
                        if (this._opacityDiv.firstChild) {
                            this._opacityDiv.firstChild.nodeValue= level+"%";
                        }
                    },
                    onSliderMove: function(level) {
                        if (this._opacityDiv.firstChild) {
                            this._opacityDiv.firstChild.nodeValue= level+"%";
                        }
                    }
                }
            );
            this.map.addControl(this.slider,new OpenLayers.Pixel(0,3));
        }

        return this.div;
    },

    /**
     * APIMethod: refreshOpacity
     * Force the control to update itself.
     *      The level's opacity has been updated on the layer itself!
     */
    refreshOpacity: function() {
        if (this.opacitable && this.slider) {
            this.slider.moveSlider();
        }
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.opacitable) {
            Geoportal.Control.prototype.changeLang.apply(this,arguments);
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LayerOpacity"*
     */
    CLASS_NAME: "Geoportal.Control.LayerOpacity"
});
