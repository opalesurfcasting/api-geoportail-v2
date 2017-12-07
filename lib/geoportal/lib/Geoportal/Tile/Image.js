/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Tile.js
 */
/**
 * Class: Geoportal.Tile.Image
 * The Geoportal framework image class.
 *
 * Inherits from:
 * - {<OpenLayers.Tile.Image at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Tile/Image-js.html>}
 */
Geoportal.Tile.Image = OpenLayers.Class( OpenLayers.Tile.Image, {

    /**
     * APIMethod: setSize
     * Allows changing tile size.
     *
     * Parameters:
     * size - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} image size
     */
    setSize: function (size) {
        if ((!this.size || !this.size.equals(size))) {
            this.size = size;
            if (this.frame !=null) {
                OpenLayers.Util.modifyDOMElement(this.frame, null, null, size);
            }
            if (this.imgDiv != null) {
                OpenLayers.Util.modifyDOMElement(this.imgDiv, null, null, size);
            }
        }
    },

    /**
     * Method: positionTile
     * Using the properties currenty set on the layer, position the tile correctly.
     * This method is used both by the async and non-async versions of the Tile.Image
     * code.
     * IGNF : always use the size property
     */
    positionTile: function() {
        var style = this.getTile().style,

        size = this.size ? this.size : this.layer.getImageSize(this.bounds);       

        style.left = this.position.x + "%";
        style.top = this.position.y + "%";
        style.width = size.w + "%";
        style.height = size.h + "%";
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Tile.Image"*
     */
    CLASS_NAME: "Geoportal.Tile.Image"
});
