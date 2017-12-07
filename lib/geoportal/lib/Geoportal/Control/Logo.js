/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.Logo
 * The Geoportal framework distributor class.
 * Allow to add logo on the map. Logos are fetched from layer's originator
 * properties. This originator property holds :
 *  * logo property : an acronym or identifier. Combined with logoPrefix,
 *                    logoSuffix, it gives the logo URL;
 *  * pictureUrl property : when defined, it gives the logo URL;
 *  * url : the URL to redirect to when the logo is clicked;
 *  * attribution : string to indicate copyright owner.
 *  * extent : {Array({<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}) | <OpenLayers/Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
 *          the extent for which the logo applies.
 *          Defaults to *null* (logo applies if layer is visible).
 *
 * Inherits from:
 * - {<Geoportal.Control>}
 */
Geoportal.Control.Logo= OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: logoPrefix
     * {String} prefix used when the logo is a key. Usually, it is the path to
     * the image, the key being the image basename without the extension.
     *      Default *'http://wxs.ign.fr/static/logos/'*
     */
    logoPrefix: 'http://wxs.ign.fr/static/logos/',

    /**
     * APIProperty: logoSuffix
     * {String} suffix to be applied to the logo. Usually, it is the image's
     * extension (e.g., '.png').
     *      Default *'.gif'*
     */
    logoSuffix: '.gif',

    /**
     * APIProperty: logoSize
     * {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} Size in width and height of logo image.
     *      Default *Geoportal.Control.Logo.WHSizes.normal*,
     *      *Geoportal.Control.Logo.WHSizes.normal*
     */
    logoSize: null,

    /**
     * APIProperty: attributionDiv
     * {DOMElement} element where to put the attribution string.
     */
    attributionDiv: null,

    /**
     * APIProperty: separator
     * {String} String used to seperate layers when computing attribution
     * string.
     */
    separator: ", ",

    /**
     * Property: _isSizeFixed
     * {Boolean} indicate whether the logo's size is fixed (option logoSize
     * given to the constructor) or not.
     */
    _isSizeFixed: false,

    /**
     * Property: _listeLogos
     * {Array({DOMElement})} List of logo (displayed or not)
     */
    _listeLogos: null,

    /**
     * Property: _attributions
     * {String} attribution array.
     */
    _attributions: null,

    /**
     * Constructor: Geoportal.Control.Logo
     * Build the control
     *
     * Parameters:
     * options - {Object} Options for control.
     *           logoSize option indicates the width and height of logos when
     *           given the logo's size is considered fixed.
     *           attributionDiv option indicates the DOMElement where to insert
     *           attribution string.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
        this._isSizeFixed= this.logoSize!=null;
        if (!this._isSizeFixed) {
            this.logoSize= new OpenLayers.Size(
                Geoportal.Control.Logo.WHSizes.normal,Geoportal.Control.Logo.WHSizes.normal);
        } else {
            if (typeof(this.logoSize)=='number') {
                this.logoSize= new OpenLayers.Size(this.logoSize,this.logoSize);
            }
        }
        this._listeLogos= [];
        this._attributions= [];
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete control
     */
    destroy: function() {
        var childs= this.div.childNodes;
        for (var i= 0; i < childs.length; i++) {
            this.div.removeChild(childs[i]);
        }
        this._listeLogos= null;
        this._attributions= null;
        this.logoSize= null;
        this._isSizeFixed= false;

        this.map.events.unregister("addlayer", this, this.redraw);
        this.map.events.unregister("changelayer", this, this.redraw);
        this.map.events.unregister("removelayer", this, this.redraw);
        this.map.events.unregister("zoomend", this, this.redraw);
        this.map.events.unregister("move", this, this.redraw);
        this.map.events.unregister("changebaselayer", this, this.changeBaseLayer);
        this.map.events.unregister("controlvisibilitychanged", this, this.onVisibilityChanged);

        Geoportal.Control.prototype.destroy.apply(this, arguments);
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
        return this.div;
    },

    /**
     * APIMethod: redraw
     * Display the logo of the distributors of the current active layers.
     *      Compute the attributions.
     */
    redraw: function() {
        // on masque tous les logos actifs
        var i, l;
        var childs= this.div.childNodes;
        for (i= 0, l= childs.length; i<l; i++) {
            childs[i].style.display= "none";
        }
        if (this.attributionDiv) {
            this.attributionDiv.innerHTML= '';
        }

        var layers= this.map.layers;
        var zoom= this.map.getZoom();
        var logo;
        this._attributions= [];
        for (i= 0, l= layers.length; i<l; i++) {
            if (!layers[i].getVisibility() || !layers[i].inRange) {
                continue;
            }

            if (layers[i].originators!=null) {
                var afficherLogo;
                for (var j= 0, jl= layers[i].originators.length; j < jl; j++) {
                    afficherLogo= true;
                    var logo= layers[i].originators[j];
                    if (logo.minZoomLevel && (logo.minZoomLevel > zoom)) {
                        afficherLogo= false;
                    }
                    if (afficherLogo && logo.maxZoomLevel && (logo.maxZoomLevel < zoom)) {
                        afficherLogo= false;
                    }
                    if (afficherLogo && logo.extent) {
                        var viewExtent= this.map.calculateBounds();
                        if (viewExtent) {
                            if (!(OpenLayers.Util.isArray(logo.extent))) {
                                logo.extent= [logo.extent];
                            }
                            var eok= false;
                            for (var k= 0, kl= logo.extent.length; k<kl; k++) {
                                if (viewExtent.intersectsBounds(logo.extent[k])) {
                                    eok= true;
                                    break;
                                }
                            }
                            afficherLogo= eok;
                        }
                    }
                    if (afficherLogo) {
                        if (!logo.logo) { logo.logo= logo.url || '#'; }
                        if (!logo.pictureUrl || !logo.url) {
                            var o= Geoportal.Catalogue.getOriginator(logo.logo);
                            logo.pictureUrl= o.pictureUrl || '';
                            logo.url= o.url || '#';
                            logo.attribution= logo.attribution || o.attribution;
                        }
                        var attribution= logo.attribution ||
                                         layers[i].attribution ||
                                         '&copy; ' + logo.logo.toUpperCase();
                        this._ajoutLogo(logo.logo, logo.url, logo.pictureUrl, attribution);
                    }
                }
            }
        }
    },

    /**
     * Method: _ajoutLogo
     * Add a logo to the control
     *
     * Parameters:
     * logo - {String} logo acronym.
     *      the final url is computed by {<Geoportal.Control.Logo.buildPathToLogo>()}.
     * url - {String} url associated with the logo.
     *      If url starts with 'javascript:' then the url is assigned to the
     *      onclick attribute.
     * pictureUrl - {String} logo url. Takes precedence over logo parameter.
     * attribution - {String} copyright owner. May be empty.
     */
    _ajoutLogo: function(logo, url, pictureUrl, attribution) {
        if (this._listeLogos[logo]==null) {
            var divLogo= this.div.ownerDocument.createElement("div");
            this.div.appendChild(divLogo);
            this._listeLogos[logo]= divLogo;

            var imgLogo= OpenLayers.Util.createImage(null,null,
                                                     this.logoSize,
                                                     pictureUrl?
                                                        pictureUrl
                                                     :  this.buildPathToLogo(logo),
                                                     null,null,null,false);

            if (url!=null) {
                var aLogo= this.div.ownerDocument.createElement("a");
                if (url.match(/^javascript:/)) {
                    aLogo.setAttribute("href", "#");
                    aLogo.setAttribute("onclick", url);
                } else {
                    aLogo.setAttribute("href", url);
                    aLogo.setAttribute("target", "_blank");
                }
                aLogo.appendChild(imgLogo);
                divLogo.appendChild(aLogo);
            } else {
                divLogo.appendChild(imgLogo);
            }
        } else {
            this._listeLogos[logo].style.display= "";
        }
        if (this.attributionDiv) {
            this._attributions.push(attribution);
            this.attributionDiv.innerHTML= this._attributions.join(this.separator);
        }
    },

    /**
     * APIMethod: buildPathToLogo
     * Construct path to logo knowing the originator's identifier.
     *
     * Parameters:
     * id - {String} the originator's identifier.
     *
     * Returns:
     * {String} the path to the originator's logo.
     */
    buildPathToLogo: function(id) {
        return this.logoPrefix + id + '/'+ id + this.logoSuffix;
    },

    /**
     * APIMethod: setMap
     * Set map and register events
     *
     * Parameters:
     * map - {OpenLayers.Map}
     */
    setMap: function() {
        Geoportal.Control.prototype.setMap.apply(this, arguments);

        this.map.events.register("addlayer", this, this.redraw);
        this.map.events.register("changelayer", this, this.redraw);
        this.map.events.register("removelayer", this, this.redraw);
        this.map.events.register("zoomend", this, this.redraw);
        this.map.events.register("move", this, this.redraw);
        this.map.events.register("changebaselayer", this, this.changeBaseLayer);
        this.map.events.register("controlvisibilitychanged", this, this.onVisibilityChanged);
    },

    /**
     * APIMethod: changeLogoSize
     * Changes the size of displayed logos.
     *
     * Parameters:
     * size - {Integer | <OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} new size in pixels
     * force - {Boolean} force changing size even if logo's size is fixed (See <Geoportal.Control.Logo.initialize>()).
     */
    changeLogoSize: function(size) {
        if (this._isFixedSize) {
            return;
        }
        var oSize= null;
        if (typeof(size)=='number') {
            oSize= new OpenLayers.Size(size,size);
        } else {
            oSize= size.clone();
        }
        this.logoSize= oSize;
        var layers= this.map.layers;
        for (var i= 0, il= layers.length; i < il; i++) {
            var layer= layers[i];
            if (layer.originators!=null) {
                for (var j= 0, jl= layer.originators.length; j < jl; j++) {
                    var logo= layer.originators[j];
                    if (this._listeLogos[logo.logo]!=null) {
                        var img= this._listeLogos[logo.logo].firstChild;
                        if (img) {
                            if (img.firstChild) { // it is the anchor, find the img !
                                img= img.firstChild;
                            }
                            if (img) {
                                img.style.width= this.logoSize.w+"px";
                                img.style.height= this.logoSize.h+"px";
                            }
                        }
                    }
                }
            }
        }
        oSize= null;
    },

    /**
     * Method: changeBaseLayer
     * Reproject logo's extent.
     *
     * Parameters:
     * evt - {Event} "changebaselayer" event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     */
    changeBaseLayer: function(evt) {
        if (!evt) { return; }
        if (!(evt.layer)) { return; }
        if (!(evt.baseLayer)) { return; }
        var op= evt.baseLayer.getNativeProjection();
        var np= evt.layer.getNativeProjection();
        var layers= this.map.layers;
        var logo;
        for (var i= 0, l= layers.length; i<l; i++) {
            if (layers[i].originators!=null) {
                for (var j= 0, jl= layers[i].originators.length; j < jl; j++) {
                    var logo= layers[i].originators[j];
                    if (logo.extent) {
                        if (!(OpenLayers.Util.isArray(logo.extent))) {
                            logo.extent= [logo.extent];
                        }
                        for (var k= 0, kl= logo.extent.length; k<kl; k++) {
                            logo.extent[k].transform(op, np, true);
                        }
                    }
                }
            }
        }
    },

    /**
     * Method: onVisibilityChanged
     * Move the control if necessary on "controlvisibilitychanged" event.
     *
     * Parameters:
     * e - {Event}
     */
    onVisibilityChanged: function(e) {
        if (!e || !e.size) { return; }
        var f= (e.visibility? 1:-1);
        var b= Geoportal.Util.getComputedStyle(this.div, 'bottom', true);
        b= b+f*e.size.h;
        this.div.style['bottom']= b+'px';
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Logo"*
     */
    CLASS_NAME: "Geoportal.Control.Logo"
});

/**
 * Constant: Geoportal.Control.Logo.WHSizes
 * {Object} Square sizes of logo in pixels.
 *      They are two predefined sizes :
 *      - normal : *50*
 *      - mini   : *30*
 */
Geoportal.Control.Logo.WHSizes= {
    'normal':50,
    'mini'  :30
};
