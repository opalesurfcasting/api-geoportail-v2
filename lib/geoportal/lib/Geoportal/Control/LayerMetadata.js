/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.LayerMetadata
 * Implements a control for displaying the layer's metadata URLs.
 *
 * The control's structure is as follows :
 *
 * (start code)
 *   <div id="#{Id}" class="gpLayerUrlsDivClass">
 *     <div id="metadataURLs_#{layer.id}" class="gpLayerMetadataUrlsDivClass">
 *       <a id="metadataURL_0#{layer.id}" class="gpLayerMetadataURLClass" title="...">...</a><br>
 *       <a id="metadataURL_1#{layer.id}" class="gpLayerMetadataURLClass" title="...">...</a><br>
 *       ...
 *     </div>
 *   </div>
 * (end)
 *
 * Inherits from:
 * - {<Geoportal.Control>}
 */
Geoportal.Control.LayerMetadata=
    OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the layer the metadata is watched
     */
    layer: null,

    /**
     * Constructor: Geoportal.Control.LayerMetadata
     * Build the control
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the controlled layer.
     * options - {DOMElement} Options for control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete control
     */
    destroy: function() {
        Geoportal.Control.prototype.destroy.apply(this, arguments);
        this.layer= null;
    },

    /**
     * Method: addDataUrl
     * Add a metadata Url to the control.
     *
     * Parameters:
     * dataurl - {String} the metadata Url.
     * prefixId - {String} the prefix id of the Url link.
     * className - {String} the CSS class name of the Url link.
     * title - {String} the title of the metadata popup.
     * div - {DOMElement} parent div of the Url link.
     * i - {Integer} Index of the Url link.
     * l - {Integer} Total number of Url links.
     *
     */
    addDataUrl: function(dataurl, prefixId, className, title, div, i, l) {
        var doc= this.div.ownerDocument;
        var dtu= doc.createElement("a");
        dtu.id= prefixId + '_' + i + this.layer.id;
        dtu.className= className;
        dtu.title= OpenLayers.i18n('gpLayer.'+prefixId);
        dtu.alt= dtu.title;
        dtu.appendChild(doc.createTextNode(dtu.title));
        var wopts= "width=750,height=350,menubar=no,status=no,scrollbars=yes,resizable=yes";
        OpenLayers.Event.observe(
            dtu,
            "click",
            OpenLayers.Function.bindAsEventListener(
                function(evt) {window.open(this.url,title,wopts)},
                {'url':dataurl}
            ));
        div.appendChild(dtu);
        if (i!=l-1) {
            div.appendChild(doc.createElement('br'));
        }
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
        var doc= this.div.ownerDocument;
        if (this.layer.dataURL) {
            if (typeof(this.layer.dataURL)=='string') {
                this.layer.dataURL= [this.layer.dataURL];
            }
            var dataURLsDiv= doc.createElement('div');
            dataURLsDiv.id= 'dataURLs_' + this.layer.id ;
            dataURLsDiv.className= "gpLayerDataUrlsDivClass";
            for (var i= 0, l= this.layer.dataURL.length; i<l; i++) {
                var dataurl= this.layer.dataURL[i];
                this.addDataUrl(dataurl, 'dataURL' , "gpLayerDataURLClass", "data", 
                    dataURLsDiv, i, l);
            }
            this.div.appendChild(dataURLsDiv);
        }
        if (this.layer.metadataURL) {
            if (typeof(this.layer.metadataURL)=='string') {
                this.layer.metadataURL= [this.layer.metadataURL];
            }
            var metadataURLsDiv= doc.createElement('div');
            metadataURLsDiv.id= 'metadataURLs_' + this.layer.id ;
            metadataURLsDiv.className= "gpLayerMetadataUrlsDivClass";
            for (var i= 0, l= this.layer.metadataURL.length; i<l; i++) {
                var metadataurl= this.layer.metadataURL[i];
                this.addDataUrl(metadataurl, 'metadataURL', "gpLayerMetadataURLClass", "metadata", 
                    metadataURLsDiv, i, l);
            }
            this.div.appendChild(metadataURLsDiv);
        }
        return this.div;
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
        Geoportal.Control.prototype.changeLang.apply(this,arguments);
        var doc= this.div.ownerDocument;
        var e;
        if (this.layer.dataURL) {
            for (var i= 0, l= this.layer.dataURL.length; i<l; i++) {
                e= OpenLayers.Util.getElement('dataURL_'+i+this.layer.id);
                if (e) {
                    e.title= OpenLayers.i18n('gpLayer.dataURL');
                    e.alt= e.title;
                    e.innerHTML= '';
                    e.appendChild(doc.createTextNode(e.title));
                }
            }
        }
        if (this.layer.metadataURL) {
            for (var i= 0, l= this.layer.metadataURL.length; i<l; i++) {
                e= OpenLayers.Util.getElement('metadataURL_'+i+this.layer.id);
                if (e) {
                    e.title= OpenLayers.i18n('gpLayer.metadataURL');
                    e.alt= e.title;
                    e.innerHTML= '';
                    e.appendChild(doc.createTextNode(e.title));
                }
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LayerMetadata"*
     */
    CLASS_NAME: "Geoportal.Control.LayerMetadata"
});
