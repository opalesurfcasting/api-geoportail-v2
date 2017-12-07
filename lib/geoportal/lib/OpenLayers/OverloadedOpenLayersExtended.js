/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license.
 */

/*
 * @requires OpenLayers/OverloadedOpenLayersStandard.js
 */

/**
 * Header: Overloaded classes and methods (part III/III)
 *      OpenLayers extensions for the Geoportal extended API.
 */

/**
 * Namespace: OpenLayers.Lang
 * IGNF: adds translation to untitled, no.description, creationDate,
 * lastUpdateDate and by for <OpenLayers.Layer.GeoRSS at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/GeoRSS-js.html>.
 */

    /**
     * Namespace: OpenLayers.Lang["en"]
     * IGNF: _i18n support_
     */
    OpenLayers.Lang.en['untitled']= 'Untitled';
    OpenLayers.Lang.en['no.description']= 'No description.';
    OpenLayers.Lang.en['creationDate']= 'Creation date ';
    OpenLayers.Lang.en['lastUpdateDate']= 'Last update date ';
    OpenLayers.Lang.en['by']= ' by ';

    /**
     * Namespace: OpenLayers.Lang["de"]
     * IGNF: _i18n support_
     */
    OpenLayers.Lang.de['untitled']= 'Untitled';
    OpenLayers.Lang.de['no.description']= 'Keine Beschreibung.';
    OpenLayers.Lang.de['creationDate']= 'Erstellungsdatum ';
    OpenLayers.Lang.de['lastUpdateDate']= 'Zuletzt aktualisiert am Tag ';
    OpenLayers.Lang.de['by']= ' durch ';

    /**
     * Namespace: OpenLayers.Lang["es"]
     * IGNF: _i18n support_
     */
    OpenLayers.Lang.es['untitled']= 'Sin título';
    OpenLayers.Lang.es['no.description']= 'La descripción no.';
    OpenLayers.Lang.es['creationDate']= 'Fecha ';
    OpenLayers.Lang.es['lastUpdateDate']= 'Última actualización fecha ';
    OpenLayers.Lang.es['by']= ' por ';

    /**
     * Namespace: OpenLayers.Lang["fr"]
     * IGNF: _i18n support_
     */
    OpenLayers.Lang.fr['untitled']= 'Sans titre';
    OpenLayers.Lang.fr['no.description']= 'Aucune description.';
    OpenLayers.Lang.fr['creationDate']= 'Date de création ';
    OpenLayers.Lang.fr['lastUpdateDate']= 'Date de dernière mise-à-jour ';
    OpenLayers.Lang.fr['by']= ' par ';

    /**
     * Namespace: OpenLayers.Lang["it"]
     * IGNF: _i18n support_
     */
    OpenLayers.Lang.it['untitled']= 'Senza titolo';
    OpenLayers.Lang.it['no.description']= 'Nessuna descrizione.';
    OpenLayers.Lang.it['creationDate']= 'Data di creazione ';
    OpenLayers.Lang.it['lastUpdateDate']= 'Ultimo aggiornamento data ';
    OpenLayers.Lang.it['by']= ' per ';

/**
 * Class: OpenLayers.Tile.WFS
 * IGNF: check on event returns
 */
if (OpenLayers.Tile.WFS) {

    OpenLayers.Tile.WFS= OpenLayers.overload(OpenLayers.Tile.WFS, {

    /**
     * Method: draw
     * Check that a tile should be drawn, and load features for it.
     * IGNF: _check on event returns_
     */
    draw: function() {
        if (OpenLayers.Tile.prototype.draw.apply(this, arguments)) {
            if (this.isLoading) {
                //if already loading, send 'reload' instead of 'loadstart'.
                if (this.events.triggerEvent("reload")===false) {//IGNF
                    return;
                }
            } else {
                this.isLoading = true;
                if (this.events.triggerEvent("loadstart")===false) {//IGNF
                    return;
                }
            }
            this.loadFeaturesForRegion(this.requestSuccess);
        }
    }

    });

}

/**
 * Class: OpenLayers.Marker
 * IGNF: add style cursor:pointer; on marker
 */
if (OpenLayers.Marker) {

    OpenLayers.Marker= OpenLayers.overload(OpenLayers.Marker, {

    /**
    * Method: draw
    * Calls draw on the icon, and returns that output.
    * IGNF: _add style cursor:pointer; on marker_
    *
    * Parameters:
    * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>}
    *
    * Returns:
    * {DOMElement} A new DOM Image with this marker's icon set at the
    * location passed-in
    */
    draw: function(px) {
        var imgDiv= this.icon.draw(px);
        imgDiv.style.cursor= 'pointer';
        return imgDiv;
    }

    });

}

/*
TODO:
OpenLayers.UI
OpenLayers.Control.Snapping: noUI (FIXME)
OpenLayers.Control.Split   : noUI (FIXME)
 */

/**
 * Class: OpenLayers.Control.LayerSwitcher
 * IGNF: aware of the current document.
 */
if (OpenLayers.Control.LayerSwitcher) {

    OpenLayers.Control.LayerSwitcher= OpenLayers.overload(OpenLayers.Control.LayerSwitcher, {

    /**
     * Method: redraw
     * Goes through and takes the current state of the Map and rebuilds the
     *     control to display that state. Groups base layers into a
     *     radio-button group and lists each data layer with a checkbox.
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    redraw: function() {
        //if the state hasn't changed since last redraw, no need
        // to do anything. Just return the existing div.
        if (!this.checkRedraw()) {
            return this.div;
        }

        //clear out previous layers
        this.clearLayersArray("base");
        this.clearLayersArray("data");

        var containsOverlays = false;
        var containsBaseLayers = false;

        // Save state -- for checking layer if the map state changed.
        // We save this before redrawing, because in the process of redrawing
        // we will trigger more visibility changes, and we want to not redraw
        // and enter an infinite loop.
        var len = this.map.layers.length;
        this.layerStates = new Array(len);
        for (var i=0; i <len; i++) {
            var layer = this.map.layers[i];
            this.layerStates[i] = {
                'name': layer.name,
                'visibility': layer.visibility,
                'inRange': layer.inRange,
                'id': layer.id
            };
        }

        var layers = this.map.layers.slice();
        if (!this.ascending) { layers.reverse(); }
        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var baseLayer = layer.isBaseLayer;

            if (layer.displayInLayerSwitcher) {

                if (baseLayer) {
                    containsBaseLayers = true;
                } else {
                    containsOverlays = true;
                }

                // only check a baselayer if it is *the* baselayer, check data
                //  layers if they are visible
                var checked = (baseLayer) ? (layer == this.map.baseLayer)
                                          : layer.getVisibility();

                // create input element
                var inputElem = this.div.ownerDocument.createElement("input");//IGNF
                inputElem.id = this.id + "_input_" + layer.name;
                inputElem.name = (baseLayer) ? this.id + "_baseLayers" : layer.name;
                inputElem.type = (baseLayer) ? "radio" : "checkbox";
                inputElem.value = layer.name;
                inputElem.checked = checked;
                inputElem.defaultChecked = checked;

                if (!baseLayer && !layer.inRange) {
                    inputElem.disabled = true;
                }
                var context = {
                    'inputElem': inputElem,
                    'layer': layer,
                    'layerSwitcher': this
                };
                OpenLayers.Event.observe(inputElem, "mouseup",
                    OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                                            context)
                );

                // create span
                var labelSpan = this.div.ownerDocument.createElement("span");//IGNF
                OpenLayers.Element.addClass(labelSpan, "labelSpan") ;
                if (!baseLayer && !layer.inRange) {
                    labelSpan.style.color = "gray";
                }
                labelSpan.innerHTML = layer.name;
                labelSpan.style.verticalAlign = (baseLayer) ? "bottom"
                                                            : "baseline";
                OpenLayers.Event.observe(labelSpan, "click",
                    OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                                            context)
                );
                // create line break
                var br = this.div.ownerDocument.createElement("br");//IGNF


                var groupArray = (baseLayer) ? this.baseLayers
                                             : this.dataLayers;
                groupArray.push({
                    'layer': layer,
                    'inputElem': inputElem,
                    'labelSpan': labelSpan
                });


                var groupDiv = (baseLayer) ? this.baseLayersDiv
                                           : this.dataLayersDiv;
                groupDiv.appendChild(inputElem);
                groupDiv.appendChild(labelSpan);
                groupDiv.appendChild(br);
            }
        }

        // if no overlays, dont display the overlay label
        this.dataLbl.style.display = (containsOverlays) ? "" : "none";

        // if no baselayers, dont display the baselayer label
        this.baseLbl.style.display = (containsBaseLayers) ? "" : "none";

        return this.div;
    },

    /**
     * Method: loadContents
     * Set up the labels and divs for the control
     * IGNF: _aware of the current document_.
     */
    loadContents: function() {

        //configure main div

        OpenLayers.Event.observe(this.div, "mouseup",
            OpenLayers.Function.bindAsEventListener(this.mouseUp, this));
        OpenLayers.Event.observe(this.div, "click",
                      this.ignoreEvent);
        OpenLayers.Event.observe(this.div, "mousedown",
            OpenLayers.Function.bindAsEventListener(this.mouseDown, this));
        OpenLayers.Event.observe(this.div, "dblclick", this.ignoreEvent);

        // layers list div
        this.layersDiv = this.div.ownerDocument.createElement("div");//IGNF
        this.layersDiv.id = this.id + "_layersDiv";
        OpenLayers.Element.addClass(this.layersDiv, "layersDiv");

        this.baseLbl = this.div.ownerDocument.createElement("div");//IGNF
        this.baseLbl.innerHTML = OpenLayers.i18n("baseLayer");
        OpenLayers.Element.addClass(this.baseLbl, "baseLbl");

        this.baseLayersDiv = this.div.ownerDocument.createElement("div");//IGNF
        OpenLayers.Element.addClass(this.baseLayersDiv, "baseLayersDiv");

        this.dataLbl = this.div.ownerDocument.createElement("div");//IGNF
        this.dataLbl.innerHTML = OpenLayers.i18n("overlays");
        OpenLayers.Element.addClass(this.dataLbl, "dataLbl");

        this.dataLayersDiv = this.div.ownerDocument.createElement("div");//IGNF
        OpenLayers.Element.addClass(this.dataLayersDiv, "dataLayersDiv");

        if (this.ascending) {
            this.layersDiv.appendChild(this.baseLbl);
            this.layersDiv.appendChild(this.baseLayersDiv);
            this.layersDiv.appendChild(this.dataLbl);
            this.layersDiv.appendChild(this.dataLayersDiv);
        } else {
            this.layersDiv.appendChild(this.dataLbl);
            this.layersDiv.appendChild(this.dataLayersDiv);
            this.layersDiv.appendChild(this.baseLbl);
            this.layersDiv.appendChild(this.baseLayersDiv);
        }

        this.div.appendChild(this.layersDiv);

        if(this.roundedCorner) {
            OpenLayers.Rico.Corner.round(this.div, {
                corners: "tl bl",
                bgColor: "transparent",
                color: this.roundedCornerColor,
                blend: false
            });
            OpenLayers.Rico.Corner.changeOpacity(this.layersDiv, 0.75);
        }

        var imgLocation = OpenLayers.Util.getImagesLocation();
        var sz = new OpenLayers.Size(18,18);

        // maximize button div
        var img = imgLocation + 'layer-switcher-maximize.png';
        this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MaximizeDiv",
                                    null,
                                    sz,
                                    img,
                                    "absolute");
        OpenLayers.Element.addClass(this.maximizeDiv, "maximizeDiv");
        this.maximizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.maximizeDiv, "click",
            OpenLayers.Function.bindAsEventListener(this.maximizeControl, this)
        );

        this.div.appendChild(this.maximizeDiv);

        // minimize button div
        var img = imgLocation + 'layer-switcher-minimize.png';
        var sz = new OpenLayers.Size(18,18);
        this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MinimizeDiv",
                                    null,
                                    sz,
                                    img,
                                    "absolute");
        OpenLayers.Element.addClass(this.minimizeDiv, "minimizeDiv");
        this.minimizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.minimizeDiv, "click",
            OpenLayers.Function.bindAsEventListener(this.minimizeControl, this)
        );

        this.div.appendChild(this.minimizeDiv);
    }

    });

}

/**
 * Class: OpenLayers.Control.Scale
 * IGNF: aware of the current document.
 */
if (OpenLayers.Control.Scale) {

    OpenLayers.Control.Scale= OpenLayers.overload(OpenLayers.Control.Scale, {

    /**
     * Method: draw
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {DOMElement}
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (!this.element) {
            this.element = this.div.ownerDocument.createElement("div");//IGNF
            this.div.appendChild(this.element);
        }
        this.map.events.register( 'moveend', this, this.updateScale);
        this.updateScale();
        return this.div;
    }

    });

}

/**
 * Class: OpenLayers.Control.ScaleLine
 * IGNF: aware of the current document.
 */
if (OpenLayers.Control.ScaleLine) {

    OpenLayers.Control.ScaleLine= OpenLayers.overload(OpenLayers.Control.ScaleLine, {

    /**
     * Method: draw
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {DOMElement}
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (!this.eTop) {
            // stick in the top bar
            this.eTop = this.div.ownerDocument.createElement("div");//IGNF
            this.eTop.className = this.displayClass + "Top";
            var theLen = this.topInUnits.length;
            this.div.appendChild(this.eTop);
            if((this.topOutUnits == "") || (this.topInUnits == "")) {
                this.eTop.style.visibility = "hidden";
            } else {
                this.eTop.style.visibility = "visible";
            }

            // and the bottom bar
            this.eBottom = this.div.ownerDocument.createElement("div");//IGNF
            this.eBottom.className = this.displayClass + "Bottom";
            this.div.appendChild(this.eBottom);
            if((this.bottomOutUnits == "") || (this.bottomInUnits == "")) {
                this.eBottom.style.visibility = "hidden";
            } else {
                this.eBottom.style.visibility = "visible";
            }
        }
        this.map.events.register('moveend', this, this.update);
        this.update();
        return this.div;
    }

    });

}

/**
 * Class: OpenLayers.Control.Permalink
 * IGNF: aware of the current document.
 */
if (OpenLayers.Control.Permalink) {

    OpenLayers.Control.Permalink= OpenLayers.overload(OpenLayers.Control.Permalink, {

    /**
     * Constructor: OpenLayers.Control.Permalink
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * element - {DOMElement}
     * base - {String}
     * options - {Object} options to the control.
     */
    initialize: function(element, base, options) {
        if (element !== null && typeof element == 'object' && !OpenLayers.Util.isElement(element)) {
            options = element;
            this.base = OpenLayers.getDoc().location.href;//IGNF
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
            if (this.element != null) {
                this.element = OpenLayers.Util.getElement(this.element);
            }
        }
        else {
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
            this.element = OpenLayers.Util.getElement(element);
            this.base = base || OpenLayers.getDoc().location.href;//IGNF
        }
    },

    /**
     * Method: draw
     *
     * Returns:
     * {DOMElement}
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);

        if (!this.element) {
            this.element = this.div.ownerDocument.createElement("a");//IGNF
            this.element.innerHTML = OpenLayers.i18n("permalink");
            this.element.href="";
            this.div.appendChild(this.element);
        }
        this.map.events.on({
            'moveend': this.updateLink,
            'changelayer': this.updateLink,
            'changebaselayer': this.updateLink,
            scope: this
        });

        // Make it so there is at least a link even though the map may not have
        // moved yet.
        this.updateLink();

        return this.div;
    }

    });

}

/**
 * Class: OpenLayers.Control.Measure
 * See http://trac.openlayers.org/ticket/2501
 * See http://trac.openlayers.org/ticket/2096
 * See http://trac.openlayers.org/ticket/2820
 * 
 * ie. OpenLayers/OverloadedOpenLayersStandard.js
 */

/**
 * Class: OpenLayers.Layer
 * IGNF: changeBaseLayer method addition
 */
if (OpenLayers.Layer) {

    (function() {

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
     *  IGNF: _addition_
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    var cblFunc= function(evt) {
        if (OpenLayers.Layer.prototype.changeBaseLayer.apply(this,arguments)===false) {
            return false;
        }
        if (!this.isBaseLayer) {
            var opts= {
                displayInLayerSwitcher:this.displayInLayerSwitcher
            };
            var p= this.getCompatibleProjection(evt.layer);
            if (p!=null) {
                opts.projection= p.clone();
                if (this.aggregate==undefined) {
                    opts.displayInLayerSwitcher= true;
                }
            } else {
                if (this.aggregate==undefined) {
                    opts.displayInLayerSwitcher= false;
                }
            }
            //FIXME: force re-computing resolutions
            this.addOptions(opts);
            this.redraw();
        }
        return true;
    };

    if (OpenLayers.Layer.Zoomify) {
        OpenLayers.Layer.Zoomify= OpenLayers.overload(OpenLayers.Layer.Zoomify, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.Yahoo) {
        OpenLayers.Layer.Yahoo= OpenLayers.overload(OpenLayers.Layer.Yahoo, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.WorldWind) {
        OpenLayers.Layer.WorldWind= OpenLayers.overload(OpenLayers.Layer.WorldWind, {

        changeBaseLayer: cblFunc

        });

    }
    if (OpenLayers.Layer.VirtualEarth) {
        OpenLayers.Layer.VirtualEarth= OpenLayers.overload(OpenLayers.Layer.VirtualEarth, {

        changeBaseLayer: cblFunc

        });

    }
    if (OpenLayers.Layer.TMS) {
        OpenLayers.Layer.TMS= OpenLayers.overload(OpenLayers.Layer.TMS, {

        changeBaseLayer: cblFunc

        });

    }
    if (OpenLayers.Layer.TileCache) {
        OpenLayers.Layer.TileCache= OpenLayers.overload(OpenLayers.Layer.TileCache, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.MapServer) {
        OpenLayers.Layer.MapServer= OpenLayers.overload(OpenLayers.Layer.MapServer, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.MapGuide) {
        OpenLayers.Layer.MapGuide= OpenLayers.overload(OpenLayers.Layer.MapGuide, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.KaMap) {
        OpenLayers.Layer.KaMap= OpenLayers.overload(OpenLayers.Layer.KaMap, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.KaMapCache) {
        OpenLayers.Layer.KaMapCache= OpenLayers.overload(OpenLayers.Layer.KaMapCache, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.Image) {
        OpenLayers.Layer.Image= OpenLayers.overload(OpenLayers.Layer.Image, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.Google) {
        OpenLayers.Layer.Google= OpenLayers.overload(OpenLayers.Layer.Google, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.EventPane) {
        OpenLayers.Layer.EventPane= OpenLayers.overload(OpenLayers.Layer.EventPane, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.Bing) {
        OpenLayers.Layer.Bing= OpenLayers.overload(OpenLayers.Layer.Bing, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.ArcIMS) {
        OpenLayers.Layer.ArcIMS= OpenLayers.overload(OpenLayers.Layer.ArcIMS, {

        changeBaseLayer: cblFunc

        });
    }
    if (OpenLayers.Layer.ArcGISCache) {
        OpenLayers.Layer.ArcGISCache= OpenLayers.overload(OpenLayers.Layer.ArcGISCache, {

        changeBaseLayer: cblFunc

        });

    }
    if (OpenLayers.Layer.ArcGIS93Rest) {
        OpenLayers.Layer.ArcGIS93Rest= OpenLayers.overload(OpenLayers.Layer.ArcGIS93Rest, {

        changeBaseLayer: cblFunc

        });

    }

    })();

}

/**
 * Class: OpenLayers.Layer.HTTPRequest
 * IGNF: GeoRM addition
 */
if (OpenLayers.Layer.HTTPRequest) {

    if (OpenLayers.Layer.Zoomify) {

    OpenLayers.Layer.Zoomify= OpenLayers.overload(OpenLayers.Layer.Zoomify, {

    mergeNewParams: OpenLayers.Layer.HTTPRequest.prototype.mergeNewParams,
    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

    }

    if (OpenLayers.Layer.WorldWind) {

    OpenLayers.Layer.WorldWind= OpenLayers.overload(OpenLayers.Layer.WorldWind, {

    mergeNewParams: OpenLayers.Layer.HTTPRequest.prototype.mergeNewParams,
    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

    }

    if (OpenLayers.Layer.TMS) {

    OpenLayers.Layer.TMS= OpenLayers.overload(OpenLayers.Layer.TMS, {

    mergeNewParams: OpenLayers.Layer.HTTPRequest.prototype.mergeNewParams,
    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

    }

    if (OpenLayers.Layer.TileCache) {

    OpenLayers.Layer.TileCache= OpenLayers.overload(OpenLayers.Layer.TileCache, {

    mergeNewParams: OpenLayers.Layer.HTTPRequest.prototype.mergeNewParams,
    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

    }

    if (OpenLayers.Layer.MapServer) {

    OpenLayers.Layer.MapServer= OpenLayers.overload(OpenLayers.Layer.MapServer, {

    mergeNewParams: OpenLayers.Layer.HTTPRequest.prototype.mergeNewParams

    });

    }

    if (OpenLayers.Layer.MapGuide) {

    OpenLayers.Layer.MapGuide= OpenLayers.overload(OpenLayers.Layer.MapGuide, {

    mergeNewParams: OpenLayers.Layer.HTTPRequest.prototype.mergeNewParams

    });

    }

    if (OpenLayers.Layer.KaMapCache) {

    OpenLayers.Layer.KaMapCache= OpenLayers.overload(OpenLayers.Layer.KaMapCache, {

    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

    }

    if (OpenLayers.Layer.KaMap) {

    OpenLayers.Layer.KaMap= OpenLayers.overload(OpenLayers.Layer.KaMap, {

    mergeNewParams: OpenLayers.Layer.HTTPRequest.prototype.mergeNewParams,
    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

    }

    if (OpenLayers.Layer.ArcIMS) {

    OpenLayers.Layer.ArcIMS= OpenLayers.overload(OpenLayers.Layer.ArcIMS, {

    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

    }

    if (OpenLayers.Layer.ArcGIS93Rest) {

    OpenLayers.Layer.ArcGIS93Rest= OpenLayers.overload(OpenLayers.Layer.ArcGIS93Rest, {

    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

    }

}

/**
 * Class: OpenLayers.Layer.MapServer
 * IGNF: fix on bounds reprojection
 */
if (OpenLayers.Layer.MapServer) {

    OpenLayers.Layer.MapServer= OpenLayers.overload(OpenLayers.Layer.MapServer, {

    /**
     * Method: getURL
     * Return a query string for this layer
     *
     * IGNF: _fix on bounds reprojection_
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} A bounds representing the bbox
     *          for the request
     *
     * Returns:
     * {String} A string with the layer's url and parameters and also
     *          the passed-in bounds and appropriate tile size specified
     *          as parameters.
     */
    getURL: function (bounds) {
        bounds= this.adjustBounds(bounds);
        // Make a list, so that getFullRequestString uses literal ","
        //IGNF:
        var extent= bounds.clone();
        extent.transform(this.map.getProjection(),this.getNativeProjection());
        extent= extent.toArray();

        var imageSize= this.getImageSize();

        // make lists, so that literal ','s are used
        var url= this.getFullRequestString({
                      mapext:   extent,
                      imgext:   extent,
                      map_size: [imageSize.w, imageSize.h],
                      imgx:     imageSize.w / 2,
                      imgy:     imageSize.h / 2,
                      imgxy:    [imageSize.w, imageSize.h]
                      });

        return url;
    }

    });

}

/**
 * Class: OpenLayers.Layer.Markers
 * IGNF: various enhancements
 */
if (OpenLayers.Layer.Markers) {

    OpenLayers.Layer.Markers= OpenLayers.overload(OpenLayers.Layer.Markers, {

    /**
     * APIMethod: setOpacity
     * Sets the opacity for all the markers.
     * IGNF: _now triggers event "changelayer", property "opacity"_.
     *
     * Parameter:
     * opacity - {Float}
     */
    setOpacity: function(opacity) {
        if (opacity != this.opacity) {
            this.opacity = opacity;
            for (var i=0, len=this.markers.length; i<len; i++) {
                this.markers[i].setOpacity(this.opacity);
            }
            //IGNF:
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "opacity"
                });
            }
        }
    },

    /**
     * APIMethod: transform
     * Reproject markers.
     *  IGNF: _addition_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the source projection.
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the destination projection.
     */
    transform: function(source, dest) {
        for (var i= 0, len= this.markers.length; i<len; i++) {
            var m= this.markers[i];
            m.lonlat.transform(source,dest);
        }
    },

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
     *  IGNF: _addition_
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: function(evt) {
        if (OpenLayers.Layer.prototype.changeBaseLayer.apply(this,arguments)===false) {
            return false;
        }
        if (!this.isBaseLayer) {
            var oldMapProj= evt.baseLayer? evt.baseLayer.getNativeProjection() : null;
            var mapProj= this.map.getProjection();
            // force re-computing resolutions
            this.addOptions({projection: mapProj.clone()});
            var v= this.getVisibility();
            if (v) {
                this.setVisibility(false);
            }
            if (oldMapProj) {
                this.transform(oldMapProj,mapProj);
            }
            if (v) {
                this.setVisibility(true);
            }
        }
        return true;
    }

    });

    if (OpenLayers.Layer.Text) {
        OpenLayers.Layer.Text= OpenLayers.overload(OpenLayers.Layer.Text, {

            changeBaseLayer: OpenLayers.Layer.Markers.prototype.changeBaseLayer

        });

    }
    if (OpenLayers.Layer.GeoRSS) {
        OpenLayers.Layer.GeoRSS= OpenLayers.overload(OpenLayers.Layer.GeoRSS, {

        changeBaseLayer: OpenLayers.Layer.Markers.prototype.changeBaseLayer

        });

    }
    if (OpenLayers.Layer.Boxes) {
        OpenLayers.Layer.Boxes= OpenLayers.overload(OpenLayers.Layer.Boxes, {

        changeBaseLayer: OpenLayers.Layer.Markers.prototype.changeBaseLayer

        });

    }

}

/**
 * Class: OpenLayers.Layer.Text
 * IGNF: check on event returns
 */
if (OpenLayers.Layer.Text) {

    OpenLayers.Layer.Text= OpenLayers.overload(OpenLayers.Layer.Text, {

    /**
     * Method: loadText
     * Start the load of the Text data. Don't do this when we first add the layer,
     * since we may not be visible at any point, and it would therefore be a waste.
     * IGNF: _check on event returns_
     */
    loadText: function() {
        if (!this.loaded) {
            if (this.location != null) {

                var onFail = function(e) {
                    this.events.triggerEvent("loadend");
                };

                //IGNF
                if (this.events.triggerEvent("loadstart")===false) {
                    return;
                }

                OpenLayers.Request.GET({
                    url: this.location,
                    success: this.parseData,
                    failure: onFail,
                    scope: this
                });
                this.loaded = true;
            }
        }
    }

    });

}

/**
 * Class: OpenLayers.Layer.GeoRSS
 * IGNF: check on event returns
 */
if (OpenLayers.Layer.GeoRSS) {

    OpenLayers.Layer.GeoRSS= OpenLayers.overload(OpenLayers.Layer.GeoRSS, {

    /**
     * Method: loadRSS
     * Start the load of the RSS data. Don't do this when we first add the layer,
     * since we may not be visible at any point, and it would therefore be a waste.
     * IGNF: _check on event returns_
     */
    loadRSS: function() {
        if (!this.loaded) {
            if (this.events.triggerEvent("loadstart")===false) {//IGNF
                return;
            }
            OpenLayers.Request.GET({
                url: this.location,
                success: this.parseData,
                scope: this
            });
            this.loaded = true;
        }
    }

    });

}

/**
 * Class: OpenLayers.Layer.Google
 * IGNF: aware of the current document.
 */
if (OpenLayers.Layer.Google) {

    OpenLayers.Layer.Google= OpenLayers.overload(OpenLayers.Layer.Google, {

    /**
     * Method: loadMapObject
     * Load the GMap and register appropriate event listeners. If we can't
     *     load GMap2, then display a warning message.
     * IGNF: _aware of the current document_.
     */
    loadMapObject: function() {
        if (!this.type) {
            this.type = G_NORMAL_MAP;
        }
        var mapObject, termsOfUse, poweredBy;
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            // there are already Google layers added to this map
            mapObject = cache.mapObject;
            termsOfUse = cache.termsOfUse;
            poweredBy = cache.poweredBy;
            // increment the layer count
            ++cache.count;
        } else {
            // this is the first Google layer for this map

            var container = this.map.viewPortDiv;
            var div = container.ownerDocument.createElement("div");//IGNF
            div.id = this.map.id + "_GMap2Container";
            div.style.position = "absolute";
            div.style.width = "100%";
            div.style.height = "100%";
            container.appendChild(div);

            // create GMap and shuffle elements
            try {
                mapObject = new GMap2(div);

                // move the ToS and branding stuff up to the container div
                termsOfUse = div.lastChild;
                container.appendChild(termsOfUse);
                termsOfUse.style.zIndex = "1100";
                termsOfUse.style.right = "";
                termsOfUse.style.bottom = "";
                termsOfUse.className = "olLayerGoogleCopyright";

                poweredBy = div.lastChild;
                container.appendChild(poweredBy);
                poweredBy.style.zIndex = "1100";
                poweredBy.style.right = "";
                poweredBy.style.bottom = "";
                poweredBy.className = "olLayerGooglePoweredBy gmnoprint";

            } catch (e) {
                throw(e);
            }
            // cache elements for use by any other google layers added to
            // this same map
            OpenLayers.Layer.Google.cache[this.map.id] = {
                mapObject: mapObject,
                termsOfUse: termsOfUse,
                poweredBy: poweredBy,
                count: 1
            };
        }

        this.mapObject = mapObject;
        this.termsOfUse = termsOfUse;
        this.poweredBy = poweredBy;

        // ensure this layer type is one of the mapObject types
        if (OpenLayers.Util.indexOf(this.mapObject.getMapTypes(),
                                    this.type) === -1) {
            this.mapObject.addMapType(this.type);
        }

        //since v 2.93 getDragObject is now available.
        if(typeof mapObject.getDragObject == "function") {
            this.dragObject = mapObject.getDragObject();
        } else {
            this.dragPanMapObject = null;
        }

        if(this.isBaseLayer === false) {
            this.setGMapVisibility(this.div.style.display !== "none");
        }

    }

    });

}

/**
 * Class: OpenLayers.Layer.Google.v3
 * IGNF: aware of the current document.
 */
if (OpenLayers.Layer.Google && OpenLayers.Layer.Google.v3) {

    OpenLayers.Layer.Google.v3= OpenLayers.overload(OpenLayers.Layer.Google.v3, {

    /**
     * Method: loadMapObject
     * Load the GMap and register appropriate event listeners. If we can't
     *     load GMap2, then display a warning message.
     * IGNF: _aware of the current document_.
     */
    loadMapObject: function() {
        if (!this.type) {
            this.type = google.maps.MapTypeId.ROADMAP;
        }
        var mapObject;
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            // there are already Google layers added to this map
            mapObject = cache.mapObject;
            // increment the layer count
            ++cache.count;
        } else {
            // this is the first Google layer for this map

            var container = this.map.viewPortDiv;
            var div = container.ownerDocument.createElement("div");//IGNF
            div.id = this.map.id + "_GMapContainer";
            div.style.position = "absolute";
            div.style.width = "100%";
            div.style.height = "100%";
            container.appendChild(div);

            // create GMap and shuffle elements
            var center = this.map.getCenter();
            mapObject = new google.maps.Map(div, {
                center: center ?
                    new google.maps.LatLng(center.lat, center.lon) :
                    new google.maps.LatLng(0, 0),
                zoom: this.map.getZoom() || 0,
                mapTypeId: this.type,
                disableDefaultUI: true,
                keyboardShortcuts: false,
                draggable: false,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                streetViewControl: false
            });

            // cache elements for use by any other google layers added to
            // this same map
            cache = {
                mapObject: mapObject,
                count: 1
            };
            OpenLayers.Layer.Google.cache[this.map.id] = cache;
            this.repositionListener = google.maps.event.addListenerOnce(
                mapObject,
                "center_changed",
                OpenLayers.Function.bind(this.repositionMapElements, this)
            );
        }
        this.mapObject = mapObject;
        this.setGMapVisibility(this.visibility);
    }

    });

}

/**
 * Class: OpenLayers.Control.Panel
 */
if (OpenLayers.Control.Panel) {

    if (OpenLayers.Control.EditingToolbar) {

    OpenLayers.Control.EditingToolbar= OpenLayers.overload(OpenLayers.Control.EditingToolbar, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["OpenLayers.UI.Panel"],

    /**
     * APIMethod: destroy
     * IGNF: _get rid of panel_div_
     */
    destroy: OpenLayers.Control.Panel.prototype.destroy,

    /**
     * APIMethod: addPanelDiv
     * Give a control a panel_div which will be used later.
     *      Access to this div is via the panel_div attribute of the
     *      control added to the panel.
     *      Also, stop mousedowns and clicks, but don't stop mouseup, since
     *      they need to pass through.
     *  IGNF: _addition_
     *
     * Parameters:
     * cntrl - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} the control within the panel.
     */
    addPanelDiv: OpenLayers.Control.Panel.prototype.addPanelDiv,

    /**
     * APIMethod: activateControl
     *  IGNF: _addition_
     *
     * Parameters:
     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    activateControl: OpenLayers.Control.Panel.prototype.activateControl,

    /**
     * APIMethod: addControls
     * To build a toolbar, you add a set of controls to it.  addControls
     * lets you add a single control or a list of controls to the
     * Control Panel.
     * IGNF: _addition of private method addPanelDiv()_.
     *
     * Parameters:
     * controls - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    addControls: OpenLayers.Control.Panel.prototype.addControls,

    /**
     * Method: redraw
     * IGNF: change removal/addition of inner controls (TODO: to be tested)
     */
    redraw: OpenLayers.Control.Panel.prototype.redraw,

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *  IGNF: _addition_
     *
     * Parameters:
     * evt {Event}  - event fired
     * - evt.lang holds the new language
     */
    changeLang: OpenLayers.Control.Panel.prototype.changeLang

    });

    }

    if (OpenLayers.Control.NavToolbar) {
    OpenLayers.Control.NavToolbar= OpenLayers.overload(OpenLayers.Control.NavToolbar, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["OpenLayers.UI.Panel"],

    /**
     * APIMethod: destroy
     * IGNF: _get rid of panel_div_
     */
    destroy: OpenLayers.Control.Panel.prototype.destroy,

    /**
     * APIMethod: addPanelDiv
     * Give a control a panel_div which will be used later.
     *      Access to this div is via the panel_div attribute of the
     *      control added to the panel.
     *      Also, stop mousedowns and clicks, but don't stop mouseup, since
     *      they need to pass through.
     *  IGNF: _addition_
     *
     * Parameters:
     * cntrl - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} the control within the panel.
     */
    addPanelDiv: OpenLayers.Control.Panel.prototype.addPanelDiv,

    /**
     * APIMethod: activateControl
     *  IGNF: _addition_
     *
     * Parameters:
     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    activateControl: OpenLayers.Control.Panel.prototype.activateControl,

    /**
     * APIMethod: addControls
     * To build a toolbar, you add a set of controls to it.  addControls
     * lets you add a single control or a list of controls to the
     * Control Panel.
     * IGNF: _addition of private method addPanelDiv()_.
     *
     * Parameters:
     * controls - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    addControls: OpenLayers.Control.Panel.prototype.addControls,

    /**
     * Method: redraw
     * IGNF: change removal/addition of inner controls (TODO: to be tested)
     */
    redraw: OpenLayers.Control.Panel.prototype.redraw,

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *  IGNF: _addition_
     *
     * Parameters:
     * evt {Event}  - event fired
     * - evt.lang holds the new language
     */
    changeLang: OpenLayers.Control.Panel.prototype.changeLang

    });

    }

    if (OpenLayers.Control.PanPanel) {
    OpenLayers.Control.PanPanel= OpenLayers.overload(OpenLayers.Control.PanPanel, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["OpenLayers.UI.Panel"],

    /**
     * APIMethod: destroy
     * IGNF: _get rid of panel_div_
     */
    destroy: OpenLayers.Control.Panel.prototype.destroy,

    /**
     * APIMethod: addPanelDiv
     * Give a control a panel_div which will be used later.
     *      Access to this div is via the panel_div attribute of the
     *      control added to the panel.
     *      Also, stop mousedowns and clicks, but don't stop mouseup, since
     *      they need to pass through.
     *  IGNF: _addition_
     *
     * Parameters:
     * cntrl - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} the control within the panel.
     */
    addPanelDiv: OpenLayers.Control.Panel.prototype.addPanelDiv,

    /**
     * APIMethod: activateControl
     *  IGNF: _addition_
     *
     * Parameters:
     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    activateControl: OpenLayers.Control.Panel.prototype.activateControl,

    /**
     * APIMethod: addControls
     * To build a toolbar, you add a set of controls to it.  addControls
     * lets you add a single control or a list of controls to the
     * Control Panel.
     * IGNF: _addition of private method addPanelDiv()_.
     *
     * Parameters:
     * controls - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    addControls: OpenLayers.Control.Panel.prototype.addControls,

    /**
     * Method: redraw
     * IGNF: change removal/addition of inner controls (TODO: to be tested)
     */
    redraw: OpenLayers.Control.Panel.prototype.redraw,

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *  IGNF: _addition_
     *
     * Parameters:
     * evt {Event}  - event fired
     * - evt.lang holds the new language
     */
    changeLang: OpenLayers.Control.Panel.prototype.changeLang

    });

    }

    if (OpenLayers.Control.ZoomPanel) {
    OpenLayers.Control.ZoomPanel= OpenLayers.overload(OpenLayers.Control.ZoomPanel, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["OpenLayers.UI.Panel"],

    /**
     * APIMethod: destroy
     * IGNF: _get rid of panel_div_
     */
    destroy: OpenLayers.Control.Panel.prototype.destroy,

    /**
     * APIMethod: addPanelDiv
     * Give a control a panel_div which will be used later.
     *      Access to this div is via the panel_div attribute of the
     *      control added to the panel.
     *      Also, stop mousedowns and clicks, but don't stop mouseup, since
     *      they need to pass through.
     *  IGNF: _addition_
     *
     * Parameters:
     * cntrl - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} the control within the panel.
     */
    addPanelDiv: OpenLayers.Control.Panel.prototype.addPanelDiv,

    /**
     * APIMethod: activateControl
     *  IGNF: _addition_
     *
     * Parameters:
     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    activateControl: OpenLayers.Control.Panel.prototype.activateControl,

    /**
     * APIMethod: addControls
     * To build a toolbar, you add a set of controls to it.  addControls
     * lets you add a single control or a list of controls to the
     * Control Panel.
     * IGNF: _addition of private method addPanelDiv()_.
     *
     * Parameters:
     * controls - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    addControls: OpenLayers.Control.Panel.prototype.addControls,

    /**
     * Method: redraw
     * IGNF: change removal/addition of inner controls (TODO: to be tested)
     */
    redraw: OpenLayers.Control.Panel.prototype.redraw,

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *  IGNF: _addition_
     *
     * Parameters:
     * evt {Event}  - event fired
     * - evt.lang holds the new language
     */
    changeLang: OpenLayers.Control.Panel.prototype.changeLang

    });

    }

}

/**
 * Class: OpenLayers.Format.XML
 * IGNF: check on node parameter
 */
if (OpenLayers.Format.XML) {

    if (OpenLayers.Format.ArcXML) {

    OpenLayers.Format.ArcXML= OpenLayers.overload(OpenLayers.Format.ArcXML, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.Atom) {

    OpenLayers.Format.Atom= OpenLayers.overload(OpenLayers.Format.Atom, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.SLD) {

    // OpenLayers.Format.SLD.v1_0_0
    if (OpenLayers.Format.SLD.v1) {

    OpenLayers.Format.SLD.v1= OpenLayers.overload(OpenLayers.Format.SLD.v1, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    OpenLayers.Format.SLD= OpenLayers.overload(OpenLayers.Format.SLD, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.SOSCapabilities) {

    OpenLayers.Format.SOSCapabilities= OpenLayers.overload(OpenLayers.Format.SOSCapabilities, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.SOSGetFeatureOfInterest) {

    OpenLayers.Format.SOSGetFeatureOfInterest= OpenLayers.overload(OpenLayers.Format.SOSGetFeatureOfInterest, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.SOSGetObservation) {

    OpenLayers.Format.SOSGetObservation= OpenLayers.overload(OpenLayers.Format.SOSGetObservation, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.WFSCapabilities) {

    OpenLayers.Format.WFSCapabilities= OpenLayers.overload(OpenLayers.Format.WFSCapabilities, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.WFSDescribeFeatureType) {

    OpenLayers.Format.WFSDescribeFeatureType= OpenLayers.overload(OpenLayers.Format.WFSDescribeFeatureType, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.WFS) {

    OpenLayers.Format.WFS= OpenLayers.overload(OpenLayers.Format.WFS, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

    if (OpenLayers.Format.GeoRSS) {

    OpenLayers.Format.GeoRSS= OpenLayers.overload(OpenLayers.Format.GeoRSS, {

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: OpenLayers.Format.XML.prototype.readNode,

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

    }

}

/**
 * OpenLayers.Format.GML.Base
 * IGNF: bug fix
 */
if (OpenLayers.Format.GML && OpenLayers.Format.GML.Base) {

    (function() {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     * IGNF: _fix bounds reprojection_
     */
    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.GML.Base.prototype.readers);
    _readers_['feature']['_typeName']= function(node, obj) {
        var container = {components: [], attributes: {}};
        this.readChildNodes(node, container);
        // look for common gml namespaced elements
        if(container.name) {
            container.attributes.name = container.name;
        }
        var feature = new OpenLayers.Feature.Vector(
            container.components[0], container.attributes
        );
        if (!this.singleFeatureType) {
            feature.type = node.nodeName.split(":").pop();
            feature.namespace = node.namespaceURI;
        }
        var fid = node.getAttribute("fid") ||
            this.getAttributeNS(node, this.namespaces["gml"], "id");
        if(fid) {
            feature.fid = fid;
        }
        if(this.internalProjection && this.externalProjection &&
           feature.geometry) {
            feature.geometry.transform(
                this.externalProjection, this.internalProjection
            );
        }
        if(container.bounds) {
            feature.bounds = container.bounds;
            //IGNF: reproject bounds !!
            if(this.internalProjection && this.externalProjection) {
                feature.bounds.transform(
                    this.externalProjection, this.internalProjection
                );
            }
        }
        obj.features.push(feature);
    };
    OpenLayers.Format.GML.Base= OpenLayers.overload(OpenLayers.Format.GML.Base, {
    readers: _readers_
    });

    _readers_= null;

    })();
}

/**
 * Class: OpenLayers.Format.GeoRSS
 * IGNF: externalProjection default setting
 */
if (OpenLayers.Format.GeoRSS) {

    OpenLayers.Format.GeoRSS= OpenLayers.overload(OpenLayers.Format.GeoRSS, {

    /**
     * APIProperty: externalProjection
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} When passed a externalProjection and
     *     internalProjection, the format will reproject the geometries it
     *     reads or writes. The internalProjection is the projection used by
     *     the geometries which are returned by read or which are passed into
     *     write.  In order to reproject, a projection transformation function
     *     for the specified projections must be available. This support may
     *     be
     *     provided via proj4js or via a custom transformation function. See
     *     {<OpenLayers.Projection.addTransform at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html#OpenLayers.Projection.addTransform>}
     *     for more information on custom transformations.
     *  IGNF: _addition_
     */
     // FIXME: externalProjection: should be automatic for GeoRSS ?
    externalProjection: new OpenLayers.Projection('EPSG:4326'),

    /**
     * Method: createFeatureFromItem
     * Return a feature from a GeoRSS Item.
     * IGNF: _add reading of pubDate and author_
     *
     * Parameters:
     * item - {DOMElement} A GeoRSS item node.
     *
     * Returns:
     * {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} A feature representing the item.
     */
    createFeatureFromItem: function(item) {
        var geometry = this.createGeometryFromItem(item);

        /* Provide defaults for title and description */
        var title = this._getChildValue(item, "*", "title", this.featureTitle);

        /* First try RSS descriptions, then Atom summaries */
        var description = this._getChildValue(
            item, "*", "description",
            this._getChildValue(item, "*", "content",
                this._getChildValue(item, "*", "summary", this.featureDescription)));

        /* If no link URL is found in the first child node, try the
           href attribute */
        var link = this._getChildValue(item, "*", "link");
        if(!link) {
            try {
                link = this.getElementsByTagNameNS(item, "*", "link")[0].getAttribute("href");
            } catch(e) {
                link = null;
            }
        }

        var pubDate = this._getChildValue(item, "*", "pubDate");
        if (!pubDate) {
            pubDate= this._getChildValue(item, "*", "updated");
            if (!pubDate) {
                pubDate= this._getChildValue(item, "*", "date");
            }
        }
        var author = this._getChildValue(item, "*", "author");
        if (!author) {
            author = this._getChildValue(item, "*", "creator");
        }

        var id = this._getChildValue(item, "*", "id", null);

        var data = {
            "title": title,
            "description": description,
            "link": link,
            "pubDate": pubDate,
            "author": author
        };

        var feature = new OpenLayers.Feature.Vector(geometry, data);
        feature.fid = id;
        return feature;
    }

    });

}

/**
 * Class: OpenLayers.Format.WFST.v1
 * IGNF: change OpenLayers code in writers['wfs']['GetFeature'] when
 * featureType is an array cause Mapserver does not support multiple wfs:Query
 * in a wfs:GetFeature.
 */
if (OpenLayers.Format.WFST) {

    (function(){

        var wwgfFunc= function(options) {
            var node = this.createElementNSPlus("wfs:GetFeature", {
                attributes: {
                    service: "WFS",
                    version: this.version,
                    handle: options && options.handle,
                    outputFormat: options && options.outputFormat,
                    maxFeatures: options && options.maxFeatures,
                    "xsi:schemaLocation": this.schemaLocationAttr(options)
                }
            });
            this.writeNode("Query", options, node);
            return node ;
        };

        if (OpenLayers.Format.WFST.v1) {

            var _writers_= OpenLayers.Util.extend({}, OpenLayers.Format.WFST.v1.prototype.writers);
            _writers_['wfs']['GetFeature']= wwgfFunc;

            OpenLayers.Format.WFST.v1= OpenLayers.overload( OpenLayers.Format.WFST.v1, {
                writers:_writers_
            });
            _writers_= null;

        }

        if (OpenLayers.Format.WFST.v1_0_0) {

            var _writers_= OpenLayers.Util.extend({}, OpenLayers.Format.WFST.v1_0_0.prototype.writers);
            _writers_['wfs']['GetFeature']= wwgfFunc;

            OpenLayers.Format.WFST.v1_0_0= OpenLayers.overload( OpenLayers.Format.WFST.v1_0_0, {
                writers:_writers_
            });
            _writers_= null;

        }

    }());

}

/**
 * Class: OpenLayers.Format.WFSCapabilities.v1
 * IGNF: various enhancements
 */
if (OpenLayers.Format.WFSCapabilities && OpenLayers.Format.WFSCapabilities.v1) {

    // OpenLayers.Format.WFSCapabilities.v1_0_0
    // OpenLayers.Format.WFSCapabilities.v1_1_0
    OpenLayers.Format.WFSCapabilities.v1= OpenLayers.overload(OpenLayers.Format.WFSCapabilities.v1, {

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     *  IGNF: _addition_
     */
    namespaces: {
        ows: "http://www.opengis.net/ows",
        wms: "http://www.opengis.net/wms",
        wfs: "http://www.opengis.net/wfs",
        gml: "http://www.opengis.net/gml",
        ogc: "http://www.opengis.net/ogc",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },

    /**
     * Property: defaultPrefix
     *  IGNF: _addition_
     */
    defaultPrefix: "wfs",

    /**
     * Method: getNamespacePrefix
     * Get the namespace prefix for a given uri from the <namespaces> object.
     *  IGNF: _addition_
     *
     * Returns:
     * {String} A namespace prefix or null if none found.
     */
    getNamespacePrefix: function(uri) {
        if(uri == null) {
            return this.defaultPrefix;
        } else {
            var gotPrefix= false;
            var prefix= null;
            for(prefix in this.namespaces) {
                if(this.namespaces[prefix] == uri) {
                    gotPrefix= true;
                    break;
                }
            }
            if(!gotPrefix) {
                prefix= null;
            }
            return prefix;
        }
    },

    /**
     * Method: runChildNodes
     * IGNF: _See http://trac.openlayers.org/ticket/1176 _
     */
    runChildNodes: function(obj, node) {
        var children= node.childNodes;
        var childNode, processor, prefix, local;
        for(var i=0, len=children.length; i<len; ++i) {
            childNode= children[i];
            if (childNode.nodeType == 1) {
                prefix= this.getNamespacePrefix(childNode.namespaceURI);
                if (prefix==this.defaultPrefix) { prefix= ""; }
                if (prefix.length>0) { prefix+= "_"; }
                local= childNode.nodeName.split(":").pop();
                processor= this["read_cap_" + prefix + local];
                if (processor) {
                    processor.apply(this, [obj, childNode]);
                } else {
                    // TODO: try default waiting for rewriting methods ... ?
                    OpenLayers.Console.log("no read_cap_" + prefix + local);
                    processor= this["read_cap_" + local];
                    if (processor) {
                        processor.apply(this, [obj, childNode]);
                    }
                }
            }
        }
    },

    /**
     * Method: read_cap_ServiceException
     *  IGNF: _addition_
     */
    read_cap_ServiceException: function(obj, node) {
        if (obj.exceptions===undefined) {
            obj.exceptions= [];
        }
        obj.exceptions.push(this.getChildNode(node));
    },

    /**
     * Method: read_cap_FeatureTypeList
     *  IGNF: _addition_
     */
    read_cap_FeatureTypeList: function(request, node) {
        var featureTypeList= {
            operations: {},//IGNF
            featureTypes: []
        };
        this.runChildNodes(featureTypeList, node);
        request.featureTypeList= featureTypeList;
    },

    /**
     * Method: read_cap_FeatureType
     * IGNF: _addition of keywords, bbox, metadataURLs, operations_
     */
    read_cap_FeatureType: function(featureTypeList, node) {
        var featureType= {
            keywords: [],//IGNF
            formats: [],//IGNF
            bbox: [],//IGNF
            metadataURLs: [],//IGNF
            operations: {},//IGNF
            supportedSRSs: []//IGNF
        };
        this.runChildNodes(featureType, node);
        for (var o in featureTypeList.operations) {//IGNF
            if (!featureType.operations.hasOwnProperty()) {
                featureType.operations[o]= 1;
            }
        }
        featureTypeList.featureTypes.push(featureType);
    },

    /**
     * Method: read_cap_Name
     * IGNF: _addition of featurePrefix_
     */
    read_cap_Name: function(obj, node) {
        var name = this.getChildValue(node);
        if(name) {
            var parts = name.split(":");
            obj.name = parts.pop();
            if(parts.length > 0) {
                obj.featurePrefix = parts[0];//IGNF
                obj.featureNS = this.lookupNamespaceURI(node, parts[0]);
            }
        }
    },

    /**
     * Method: read_cap_Fees
     *  IGNF: _addition_
     */
    read_cap_Fees: function(obj, node) {
        var fees= this.getChildValue(node);
        if (fees && fees.toLowerCase() != "none") {
            obj.fees= fees;
        }
    },

    /**
     * Method: read_cap_AccessConstraints
     *  IGNF: _addition_
     */
    read_cap_AccessConstraints: function(obj, node) {
        var constraints= this.getChildValue(node);
        if (constraints && constraints.toLowerCase() != "none") {
            obj.accessConstraints.push(constraints);
        }
    },

    /**
     * Method: read_cap_Operations
     *  IGNF: _addition_
     */
    read_cap_Operations: function(obj, node) {
        var children= node.childNodes;
        var childNode;
        for(var i=0; i<children.length; i++) {
            childNode= children[i];
            if(childNode.nodeType == 1) {
                obj.operations[childNode.nodeName]= 1;
            }
        }
    },

    /**
     * Method: read_cap_MetadataURL
     *  IGNF: _addition_
     */
    read_cap_MetadataURL: function(featuretype, node) {
        var metadataURL= {};
        metadataURL.type= node.getAttribute("type");
        var f= node.getAttribute("format");
        switch (f) {
        case 'XML' : f= 'text/xml'; break;
        case 'SGML': f= 'text/sgml'; break;
        case 'TXT' : f= 'text/plain'; break;
        default    : break;
        }
        metadataURL.format= f;
        metadataURL.href= this.getChildValue(node);
        featuretype.metadataURLs.push(metadataURL);
    }

    });

}

/**
 * Class: OpenLayers.Format.WFSCapabilities.v1_0_0
 * See http://trac.openlayers.org/ticket/2245
 */
if (OpenLayers.Format.WFSCapabilities && OpenLayers.Format.WFSCapabilities.v1_0_0) {

    OpenLayers.Format.WFSCapabilities.v1_0_0= OpenLayers.overload(OpenLayers.Format.WFSCapabilities.v1_0_0, {

    /**
     * Method: read_cap_Service
     * IGNF: _addition for accessConstraints, keywords_
     */
    read_cap_Service: function(capabilities, node) {
        var service= {
            accessConstraints: [],//IGNF
            keywords: []//IGNF
        };
        this.runChildNodes(service, node);
        capabilities.service= service;
    },

    /**
     * Method: read_cap_Keywords
     *  IGNF: _addition_
     */
    read_cap_Keywords: function(obj, node) {
        var kwrds= this.getChildValue(node);
        var kws= [];
        if (kwrds && kwrds.toLowerCase() != "none") {
            var kwrds= kwrds.replace(/\n/g,',').split(',');//IGNF
            //IGNF
            for (var i= 0, l= kwrds.length; i<l; i++) {
                var k= OpenLayers.String.trim(kwrds[i]);
                if (k) { kws.push(k); }
            }
        }
        //IGNF
        if (kws.length>0) {
            obj.keywords.push({keyword:kws});
        }
    },

    /**
     * Method: read_cap_Capability
     * IGNF: _addition of operations_ (harmonization WFS 1.1.0/1.0.0)
     */
    read_cap_Capability: function(capabilities, node) {
        var capability= {
            operations: {}//IGNF
        };
        this.runChildNodes(capability, node);
        capabilities.capability= capability;
    },

    /**
     * Method: read_cap_Request
     * IGNF: _different from OpenLayers 2.10_ (harmonization WFS 1.1.0/1.0.0)
     */
    read_cap_Request: function(obj, node) {
        var request = {};
        this.runChildNodes(request, node);
        //obj.request = request;//IGNF
        obj.operations = request;
    },

    /**
     * Method: read_cap_GetCapabilities
     * IGNF: _addition_
     */
    read_cap_GetCapabilities: function(obj, node) {
        var GetCapabilities= {
            href:{}//DCPType
        };
        this.runChildNodes(GetCapabilities, node);
        obj["GetCapabilities"]= GetCapabilities;
    },

    /**
     * Method: read_cap_DescribeFeatureType
     *  IGNF: _addition_
     */
    read_cap_DescribeFeatureType: function(obj, node) {
        var DescribeFeaturetype= {
            href:{}//DCPType
        };
        this.runChildNodes(DescribeFeaturetype, node);
        obj["DescribeFeatureType"]= DescribeFeaturetype;
        //FIXME: SchemaDescriptionLanguage
    },

    /**
     * Method: read_cap_Transaction
     *  IGNF: _addition_
     */
    read_cap_Transaction: function(obj, node) {
        var Transaction= {
            href:{}//DCPType
        };
        this.runChildNodes(Transaction, node);
        obj["Transaction"]= Transaction;
    },

    /**
     * Method: read_cap_GetFeature
     * IGNF: _different from OpenLayers 2.10_ (harmonization WFS 1.1.0/1.0.0)
     */
    read_cap_GetFeature: function(obj, node) {
        var GetFeature= {
            href:{},//DCPType
            formats: [] // ResultFormat
        };
        this.runChildNodes(GetFeature, node);
        //request.getfeature = getfeature;//IGNF
        obj["GetFeature"]= GetFeature;
    },

    /**
     * Method: read_cap_GetFeatureWithLock
     * IGNF: _addition_
     */
    read_cap_GetFeatureWithLock: function(obj, node) {
        var GetFeatureWithLock= {
            href:{},//DCPType
            formats: [] // ResultFormat
        };
        this.runChildNodes(GetFeatureWithLock, node);
        obj["getFeatureWithLock"]= getFeatureWithLock;
    },

    /**
     * Method: read_cap_LockFeature
     *  IGNF: _addition_
     */
    read_cap_LockFeature: function(obj, node) {
        var LockFeature= {
            href:{}//DCPType
        };
        this.runChildNodes(LockFeature, node);
        obj["LockFeature"]= LockFeature;
    },

    /**
     * Method: read_cap_SRS
     *  IGNF: _harmonisation of srs support_
     */
    read_cap_SRS: function(featuretype, node) {
        var srs= this.getChildValue(node);
        if (srs) {
            featuretype.srs= srs;
            featuretype.supportedSRSs.push(featuretype.srs);//IGNF
        }
    },

    /**
     * Method: read_cap_LatLongBoundingBox
     *  IGNF: _addition_
     */
    read_cap_LatLongBoundingBox: function(featuretype, node) {
        var bbox= [
            parseFloat(node.getAttribute("minx")),
            parseFloat(node.getAttribute("miny")),
            parseFloat(node.getAttribute("maxx")),
            parseFloat(node.getAttribute("maxy"))
        ];
        // reproject bbox from SRS to CRS:84
        var p= featuretype.srs;
        if (p) {
            try {
                // FIXME: not really optimized ...
                p= new OpenLayers.Projection(p);
                var geobbox= OpenLayers.Bounds.fromArray(bbox);
                geobbox.transform(p, OpenLayers.Projection.CRS84, true);
                featuretype.bbox.push(geobbox.toArray());
                p.destroy();
                p= null;
                return;
            } catch(ex) {
                ;//continue
            }
        }
        featuretype.bbox.push([-180,-90,180,90]);
    }

    });

}

/**
 * Class: OpenLayers.Format.WFSCapabilities.v1_1_0
 * See http://trac.openlayers.org/ticket/1176
 * IGNF: various additions
 */
if (OpenLayers.Format.WFSCapabilities && OpenLayers.Format.WFSCapabilities.v1_1_0) {

    OpenLayers.Format.WFSCapabilities.v1_1_0= OpenLayers.overload(OpenLayers.Format.WFSCapabilities.v1_1_0, {

    /**
     * Method: read_cap_ows_ServiceIdentification
     *  IGNF: _addition_
     */
    read_cap_ows_ServiceIdentification: function(obj, node) {
        var service= {
            accessConstraints: [],
            keywords: []
        };
        this.runChildNodes(service, node);
        obj.service= service;
    },

    /**
     * Method: read_cap_ows_Title
     *  IGNF: _addition_
     */
    read_cap_ows_Title: function(obj, node) {
        OpenLayers.Format.WFSCapabilities.v1.prototype.read_cap_Title.apply(this,arguments);
    },

    /**
     * Method: read_cap_ows_Abstract
     *  IGNF: _addition_
     */
    read_cap_ows_Abstract: function(obj, node) {
        OpenLayers.Format.WFSCapabilities.v1.prototype.read_cap_Abstract.apply(this,arguments);
    },

    /**
     * Method: read_cap_ows_Keywords
     *  IGNF: _addition_
     */
    read_cap_ows_Keywords: function(obj, node) {
        //TODO: Type
        var keywords= {
            keyword: []
        };
        this.runChildNodes(keywords, node);
        obj.keywords.push(keywords);
    },

    /**
     * Method: read_cap_ows_Keyword
     *  IGNF: _addition_
     */
    read_cap_ows_Keyword: function(obj, node) {
        var keyword= this.getChildValue(node);
        obj.keyword.push(keyword);
    },

    /**
     * Method: read_cap_ows_ServiceType
     *  IGNF: _addition_
     */
    read_cap_ows_ServiceType: function(obj, node) {
        var serviceType= {};
        serviceType[this.getChildValue(node)]= node.getAttribute("codeSpace") || this.getChildValue(node);
        obj.serviceType= serviceType;
    },

    /**
     * Method: read_cap_ows_ServiceTypeVersion
     *  IGNF: _addition_
     */
    read_cap_ows_ServiceTypeVersion: function(obj, node) {
        obj.serviceTypeVersion= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_ServiceProvider
     *  IGNF: _addition_
     */
    read_cap_ows_ServiceProvider: function(obj, node) {
        var serviceProvider= {};
        this.runChildNodes(serviceProvider, node);
        obj.serviceProvider= serviceProvider;
    },

    /**
     * Method: read_cap_ows_ProviderName
     *  IGNF: _addition_
     */
    read_cap_ows_ProviderName: function(obj, node) {
        obj.providerName= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_ProviderSite
     *  IGNF: _addition_
     */
    read_cap_ows_ProviderSite: function(obj, node) {
        var providerSite= node.getAttributeNS("xlink","href");
        if (providerSite && providerSite.toLowerCase() != "none") {
            obj.providerSite= providerSite;
        }
    },

    /**
     * Method: read_cap_ows_ServiceContact
     *  IGNF: _addition_
     */
    read_cap_ows_ServiceContact: function(obj, node) {
        var serviceContact= {};
        this.runChildNodes(serviceContact, node);
        obj.serviceContact= serviceContact;
    },

    /**
     * Method: read_cap_ows_IndividualName
     *  IGNF: _addition_
     */
    read_cap_ows_IndividualName: function(obj, node) {
        obj.individualName= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_PositionName
     *  IGNF: _addition_
     */
    read_cap_ows_PositionName: function(obj, node) {
        obj.positionName= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_ContactInfo
     *  IGNF: _addition_
     */
    read_cap_ows_ContactInfo: function(obj, node) {
        var contactInfo= {};
        this.runChildNodes(contactInfo, node);
        obj.contactInfo= contactInfo;
    },

    /**
     * Method: read_cap_ows_Role
     *  IGNF: _addition_
     */
    read_cap_ows_Role: function(obj, node) {
        var role= {};
        role[this.getChildValue(node)]= node.getAttribute("codeSpace");
        obj.role= role;
    },

    /**
     * Method: read_cap_ows_Phone
     *  IGNF: _addition_
     */
    read_cap_ows_Phone: function(obj, node) {
        var phone= {
            voices:[],
            facsimiles:[]
        };
        this.runChildNodes(phone, node);
        obj.phone= phone;
    },

    /**
     * Method: read_cap_ows_Address
     *  IGNF: _addition_
     */
    read_cap_ows_Address: function(obj, node) {
        var address= {
            deliveryPoints: [],
            electronicMailAddresses: []
        };
        this.runChildNodes(address, node);
        obj.address= address;
    },

    /**
     * Method: read_cap_ows_OnlineResource
     *  IGNF: _addition_
     */
    read_cap_ows_OnlineResource: function(obj, node) {
        var onlineResource= this.getAttributeNS(
            node, "http://www.w3.org/1999/xlink", "href"
        );
        obj.onlineResource= onlineResource;
    },

    /**
     * Method: read_cap_ows_HoursOfService
     *  IGNF: _addition_
     */
    read_cap_ows_HoursOfService: function(obj, node) {
        obj.hoursOfService= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_ContactInstructions
     *  IGNF: _addition_
     */
    read_cap_ows_ContactInstructions: function(obj, node) {
        obj.contactInstructions= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_Voice
     *  IGNF: _addition_
     */
    read_cap_ows_Voice: function(obj, node) {
        var voice= this.getChildValue(node);
        if (voice) {
            obj.voices.push(voice);
        }
    },

    /**
     * Method: read_cap_ows_Facsimile
     *  IGNF: _addition_
     */
    read_cap_ows_Facsimile: function(obj, node) {
        var facsimile= this.getChildValue(node);
        if (facsimile) {
            obj.facsimiles.push(facsimile);
        }
    },

    /**
     * Method: read_cap_ows_DeliveryPoint
     *  IGNF: _addition_
     */
    read_cap_ows_DeliveryPoint: function(obj, node) {
        var deliveryPoint= this.getChildValue(node);
        if (deliveryPoint) {
            obj.deliveryPoints.push(deliveryPoint);
        }
    },

    /**
     * Method: read_cap_ows_City
     *  IGNF: _addition_
     */
    read_cap_ows_City: function(obj, node) {
        obj.city= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_AdministrativeArea
     *  IGNF: _addition_
     */
    read_cap_ows_AdministrativeArea: function(obj, node) {
        obj.administrativeArea= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_PostalCode
     *  IGNF: _addition_
     */
    read_cap_ows_PostalCode: function(obj, node) {
        obj.postalCode= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_Country
     *  IGNF: _addition_
     */
    read_cap_ows_Country: function(obj, node) {
        obj.country= this.getChildValue(node);
    },

    /**
     * Method: read_cap_ows_ElectronicMailAddress
     *  IGNF: _addition_
     */
    read_cap_ows_ElectronicMailAddress: function(obj, node) {
        var electronicMailAddress= this.getChildValue(node);
        if (electronicMailAddress) {
            obj.electronicMailAddresses.push(electronicMailAddress);
        }
    },

    /**
     * Method: read_cap_ows_OperationsMetadata
     *  IGNF: _addition_
     */
    read_cap_ows_OperationsMetadata: function(obj, node) {
        var capability= {
            operations: {},
            parameters: [],
            constraints: []
            //FIXME: ows:ExtendedCapabilities
        };
        this.runChildNodes(capability, node);
        obj.capability= capability;
    },

    /**
     * Method: read_cap_ows_Operation
     *  IGNF: _addition_
     */
    read_cap_ows_Operation: function(obj, node) {
        var operation= {};
        var name= node.getAttribute("name");
        operation[name]= {
            parameters: [],
            constraints: [],
            metadata: []
        };
        this.runChildNodes(operation[name], node);
        obj.operations[name]= operation[name];
    },

    /**
     * Method: read_cap_ows_Parameter
     *  IGNF: _addition_
     */
    read_cap_ows_Parameter: function(obj, node) {
        obj.parameters.push(this.readDomainType(node));
    },

    /**
     * Method: readDomainType
     *  IGNF: _addition_
     */
    readDomainType: function(node) {
        var domainType= {
            values: [],
            metadata: [],
            name: node.getAttribute("name")
        };
        this.runChildNodes(domainType, node);
        return domainType;
    },

    /**
     * Method: read_cap_HTTP
     *  IGNF: _addition_
     */
    read_cap_ows_HTTP: function(obj, node) {
        this.runChildNodes(obj, node);
    },

    /**
     * Method: read_cap_ows_DCP
     *  IGNF: _addition_
     */
    read_cap_ows_DCP: function(obj, node) {
        this.runChildNodes(obj, node);
    },

    /**
     * Method: read_cap_ows_Get
     *  IGNF: _addition_
     */
    read_cap_ows_Get: function(obj, node) {
        //FIXME: there can be 0..N GET|POST and each GET|POST can hold 0..N constraints
        var href= {
            get: this.readRequestMethod(node),
            constraints: []
        };
        this.runChildNodes(obj, node);
        obj.href= OpenLayers.Util.extend(obj.href || {},href);
    },

    /**
     * Method: read_cap_ows_Post
     *  IGNF: _addition_
     */
    read_cap_ows_Post: function(obj, node) {
        //FIXME: there can be 0..N GET|POST and each GET|POST can hold 0..N constraints
        var href= {
            post: this.readRequestMethod(node),
            constraints: []
        };
        this.runChildNodes(obj, node);
        obj.href= OpenLayers.Util.extend(obj.href || {},href);
    },

    /**
     * Method: readRequestMethod
     *  IGNF: _addition_
     */
    readRequestMethod: function(node) {
        var href= this.getAttributeNS(
            node, "http://www.w3.org/1999/xlink", "href"
        );
        if(href.indexOf("?") < 0) {
            href += "?";
        } else if(href.lastIndexOf("?", href.length-1) != href.length-1 &&
                  href.lastIndexOf("&", href.length-1) != href.length-1) {
            href += "&";
        }
        return href;
    },

    /**
     * Method: read_cap_ows_Constraint
     *  IGNF: _addition_
     */
    read_cap_ows_Constraint: function(obj, node) {
        obj.constraints.push(this.readDomainType(node));
    },

    /**
     * Method: read_cap_ows_Value
     *  IGNF: _addition_
     */
    read_cap_ows_Value: function(obj, node) {
        var value= this.getChildValue(node);
        if (value) {
            obj.values.push(value);
        }
    },

    /**
     * Method: read_cap_ows_Metadata
     *  IGNF: _addition_
     */
    read_cap_ows_Metadata: function(obj, node) {
        var href= this.getAttributeNS(
            node, "http://www.w3.org/1999/xlink", "href"
        );
        obj.metadata.push(href);
    },

    /**
     * Method: read_cap_ServesGMLObjectTypeList
     *  IGNF: _addition_
     */
    read_cap_ServesGMLObjectTypeList: function(obj, node) {
        obj.serversGMLObjectTypeList= [];
        this.runChildNodes(obj.serversGMLObjectTypeList, node);
    },

    /**
     * Method: read_cap_SupportsGMLObjectTypeList
     *  IGNF: _addition_
     */
    read_cap_SupportsGMLObjectTypeList: function(obj, node) {
        obj.supportsGMLObjectTypeList= [];
        this.runChildNodes(obj.supportsGMLObjectTypeList, node);
    },

    /**
     * Method: read_cap_GMLObjectType
     *  IGNF: _addition_
     */
    read_cap_GMLObjectType: function(objs, node) {
        var GMLObjectType= {
            formats: []
        };
        this.runChildNodes(GMLObjectType, node);
        objs.push(GMLObjectType);
    },

    /**
     * Method: read_cap_OutputFormats
     *  IGNF: _addition_
     */
    read_cap_OutputFormats: function(obj, node) {
        this.runChildNodes(obj, node);
    },

    /**
     * Method: read_cap_Format
     *  IGNF: _addition_
     */
    read_cap_Format: function(obj, node) {
        var format= this.getChildValue(node);
        if (format) {
            obj.formats.push(format);
        }
    },

    /**
     * Method: read_cap_DefaultSRS
     *  IGNF: _harmonisation for srs support_
     */
    read_cap_DefaultSRS: function(featuretype, node) {
        var defaultSRS = this.getChildValue(node);
        if (defaultSRS) {
            featuretype.srs= defaultSRS;
            featuretype.supportedSRSs.push(featuretype.srs);//IGNF
        }
    },

    /**
     * Method: read_cap_OtherSRS
     *  IGNF: _addition_
     */
    read_cap_OtherSRS: function(featuretype, node) {
        featuretype.supportedSRSs.push(this.getChildValue(node));
    },

    /**
     * Method: read_cap_ows_WGS84BoundingBox
     *  IGNF: _addition_
     */
    read_cap_ows_WGS84BoundingBox: function(featuretype, node) {
        var children= node.childNodes;
        var minx, miny, maxx, maxy;
        for (var i= 0, l= children.length; i<l; i++) {
            var childNode= children[i];
            var localName= childNode.nodeName.split(":").pop();
            if (childNode.nodeType==1) {
                if (localName=="LowerCorner") {
                    var corner= this.getChildValue(childNode).split(' ');
                    minx= corner[0];
                    miny= corner[1];
                } else if (localName=="UpperCorner") {
                    var corner= this.getChildValue(childNode).split(' ');
                    maxx= corner[0];
                    maxy= corner[1];
                }
            }
        }
        featuretype.bbox.push([minx, miny, maxx, maxy]);
    }

    });

}

/**
 * Class: OpenLayers.Format.GeoJSON
 * IGNF: refactoring of projection handling
 */
if (OpenLayers.Format.GeoJSON) {

    OpenLayers.Format.GeoJSON= OpenLayers.overload(OpenLayers.Format.GeoJSON, {

    /**
     * APIMethod: createCRSObject
     * Create the CRS object for an object.
     * IGNF: _support for IGNF namespace_
     *
     * Parameters:
     * object - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     *
     * Returns:
     * {Object} An object which can be assigned to the crs property
     * of a GeoJSON object.
     */
    createCRSObject: function(object) {
        var proj;
        if (this.internalProjection && this.externalProjection) {
            proj= this.externalProjection.toString();
        } else {
            proj= object.layer.getNativeProjection().toString();
        }
        var code= proj.substring(proj.indexOf(":")+1);
        var ns= '';
        var crs= {};

        if (proj.match(/^urn:/i)) {
            code= proj;
            ns= 'OGC';
        } else if (proj.match(/epsg:/i)) {
            code= parseInt(code);
            if (code == 4326) {
                code= "urn:ogc:def:crs:OGC:1.3:CRS84";
                ns= 'OGC';
            } else {
                ns= 'EPSG';
            }
        } else if (proj.match(/crs:/i)) {
            code= "urn:ogc:def:crs:OGC:1.3:"+code;
            ns= 'OGC';
        } else if (proj.match(/ignf:/i)) {
            code= "urn:ogc:def:crs:IGNF:1.1:"+code;
            ns= 'OGC';
        } else if (proj.match(/http:\/\/www\.epsg\.org\/#/)) {
            code= parseInt(proj.substring(proj.indexOf("#")+1));
            if (code == 4326) {
                code= "urn:ogc:def:crs:OGC:1.3:CRS84";
                ns= 'OGC';
            } else {
                ns= 'EPSG';
            }
        } else if (proj.match(/\/RIG.xml#/)) {
            // IGNF namespace:
            code= "urn:ogc:def:crs:IGNF:1.1:"+proj.substring(proj.indexOf("#")+1);
            ns= 'OGC';
        }

        switch(ns) {
        case 'OGC'  :
            crs= {
                "type":"name",
                "properties": {
                    "name": code
                }
            }
            break;
        case 'EPSG' :
            crs= {
                "type": "name",
                "properties": {
                    "name": "EPSG:" + code
                }
            };
            break;
        }
        return crs;
    }

    });

}

/**
 * Constant: OpenLayers.Tile.Image.IFrame
 * IGNF: aware of the current document.
 */
if (OpenLayers.Tile.Image && OpenLayers.Tile.Image.IFrame) {

    OpenLayers.Tile.Image.IFrame= OpenLayers.overload(OpenLayers.Tile.Image.IFrame, {

    /**
     * Method: createIFrame
     * Create the IFrame which shows the image.
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {DOMElement} Iframe
     */
    createIFrame: function() {
        var id = this.id+'_iFrame';
        var iframe;
        if(OpenLayers.BROWSER_NAME == "msie") {
            // InternetExplorer does not set the name attribute of an iFrame
            // properly via DOM manipulation, so we need to do it on our own with
            // this hack.
            iframe = OpenLayers.getDoc().createElement('<iframe name="'+id+'">');//IGNF

            // IFrames in InternetExplorer are not transparent, if you set the
            // backgroundColor transparent. This is a workarround to get
            // transparent iframes.
            iframe.style.backgroundColor = '#FFFFFF';
            iframe.style.filter          = 'chroma(color=#FFFFFF)';
        }
        else {
            iframe = OpenLayers.getDoc().createElement('iframe');//IGNF
            iframe.style.backgroundColor = 'transparent';

            // iframe.name needs to be an unique id, otherwise it
            // could happen that other iframes are overwritten.
            iframe.name = id;
        }
        iframe.id = id;

        // some special properties to avoid scaling the images and scrollbars
        // in the iframe
        iframe.scrolling             = 'no';
        iframe.marginWidth           = '0px';
        iframe.marginHeight          = '0px';
        iframe.frameBorder           = '0';

        OpenLayers.Util.modifyDOMElement(iframe, id,
            new OpenLayers.Pixel(0,0), this.layer.getImageSize(), "absolute");

        //bind a listener to the onload of the iframe so that we
        // can register when a tile has finished loading.
        var onload = function() {
            this.show();
            //normally isLoading should always be true here but there are some
            // right funky conditions where loading and then reloading a tile
            // with the same url *really*fast*. this check prevents sending
            // a 'loadend' if the msg has already been sent
            //
            if (this.isLoading) {
                this.isLoading = false;
                this.events.triggerEvent("loadend");
            }
        };
        OpenLayers.Event.observe(iframe, 'load',
            OpenLayers.Function.bind(onload, this));

        return iframe;
    },

    /**
     * Method: createRequestForm
     * Create the html <form> element with width, height, bbox and all
     * parameters specified in the layer params.
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {DOMElement} The form element which sends the HTTP-POST request to the
     *              WMS.
     */
    createRequestForm: function() {
        // creation of the form element
        var form = OpenLayers.getDoc().createElement('form');//IGNF
        form.method = 'POST';
        var cacheId = this.layer.params["_OLSALT"];
        cacheId = (cacheId ? cacheId + "_" : "") + this.bounds.toBBOX();
        form.action = OpenLayers.Util.urlAppend(this.layer.url, cacheId);

        // insert the iframe, which has been removed to avoid back-button
        // problems
        this.imgDiv.insertBefore(this.createIFrame(), this.imgDiv.firstChild);

        form.target = this.id+'_iFrame';

        // adding all parameters in layer params as hidden fields to the html
        // form element
        var imageSize = this.layer.getImageSize();
        var params = OpenLayers.Util.getParameters(this.url);

        for(var par in params) {
            var field = form.ownerDocument.createElement('input');//IGNF
            field.type  = 'hidden';
            field.name  = par;
            field.value = params[par];
            form.appendChild(field);
        }

        return form;
    }

    });

}

/**
 * Class: OpenLayers.Layer.PointTrack
 * IGNF: additions
 */
if (OpenLayers.Layer.Vector) {

    OpenLayers.Layer.PointTrack= OpenLayers.overload(OpenLayers.Layer.PointTrack, {

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
     *  IGNF: _addition_
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: OpenLayers.Layer.Vector.prototype.changeBaseLayer,

    /**
     * Method: getCompatibleProjection
     * Check whether the layer's projection is displayable with the base layer.
     *  IGNF: _addition_
     *
     * Params:
     * blayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the baseLayer to compare with.
     *      if none, use current baseLayer from the map.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} if compatible,
     * undefined if not relevant, null on error.
     */
    getCompatibleProjection: OpenLayers.Layer.Vector.prototype.getCompatibleProjection,

    /**
     * APIMethod: addFeatures
     * Add Features to the layer.
     * IGNF: _bug fixes when geometry is null and
     *       beforefeatureadded event false return_.
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)}
     * options - {Object}
     */
    addFeatures: OpenLayers.Layer.Vector.prototype.addFeatures,

    /**
     * APIMethod: getDataExtent
     * Calculates the max extent which includes all of the features.
     *      See <http://trac.openlayers.org/ticket/1822>.
     *  IGNF: _addition_
     *
     * Returns:
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     */
    getDataExtent: OpenLayers.Layer.Vector.prototype.getDataExtent
    });

}

/**
 * Class: OpenLayers.Protocol.WFS.v1
 * IGNF: various enhancements
 */
if (OpenLayers.Protocol.WFS) {

    if (OpenLayers.Protocol.WFS.v1) {
        OpenLayers.Protocol.WFS.v1= OpenLayers.overload(OpenLayers.Protocol.WFS.v1, {

    /**
     * Method: read
     * Construct a request for reading new features.  Since WFS splits the
     *     basic CRUD operations into GetFeature requests (for read) and
     *     Transactions (for all others), this method does not make use of the
     *     format's read method (that is only about reading transaction
     *     responses).
     * IGNF: _handle multiple typenames_
     */
    read: function(options) {
        OpenLayers.Protocol.prototype.read.apply(this, arguments);
        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options || {});
        //IGNF: [typename1,typename2,etc...]
        //IGNF: the OpenLayers.Format.WFST.v1.writers['wfs']['GetFeature']
        //      make a loop (not documented) but Mapserver (tested under
        //      6.0.1) does not support multiple wfs:Query ...
        var featureTypes= options.featureType;
        if (!(options.featureType && (OpenLayers.Util.isArray(options.featureType)))) {
            var featureTypes= [options.featureType];
        }
        var opts= OpenLayers.Util.extend(options,{});
        for (var i= 0, l= featureTypes.length; i<l; i++) {
            opts.featureType= featureTypes[i];
            var response= new OpenLayers.Protocol.Response({requestType: "read"});

            var data= OpenLayers.Format.XML.prototype.write.apply(
                this.format, [this.format.writeNode("wfs:GetFeature", opts)]
            );

            response.priv= OpenLayers.Request.POST({
                url: opts.url,
                callback: this.createCallback(this.handleRead, response, opts),
                params: opts.params,
                headers: opts.headers,
                data: data
            });
        }

        return response;
    },

    /**
     * APIMethod: setFeatureType
     * Change the feature type on the fly.
     * IGNF: featureType may be an {Array({String})}.
     * IGNF: propagate changes to options and format.options.
     *
     * Parameters:
     * featureType - {Array({String}) | String} Local (without prefix) feature typeName.
     */
    setFeatureType: function(featureType) {
        //IGNF:
        var fT= function() {
            if (OpenLayers.Util.isArray(featureType)) {
                fT= featureType.slice(0);
            } else {
                fT= featureType;
            }
            return fT;
        };
        this.featureType = fT();
        //IGNF:
        if (this.options && this.options.featureType) {
            this.options.featureType= fT();
        }
        this.format.featureType = fT();
        //IGNF:
        if (this.format.options && this.format.options.featureType) {
            this.format.options.featureType= fT();
        }
    },

    /**
     * APIMethod: setGeometryName
     * Sets the geometryName option after instantiation.
     * IGNF: propagate changes to options and format.options.
     *
     * Parameters:
     * geometryName - {String} Name of geometry attribute.
     */
    setGeometryName: function(geometryName) {
        this.geometryName = geometryName;
        //IGNF:
        if (this.options && this.options.geometryName) {
            this.options.geometryName = geometryName;
        }
        this.format.geometryName = geometryName;
        //IGNF:
        if (this.format.options && this.format.options.geometryName) {
            this.format.options.geometryName = geometryName;
        }
    }

        });

    }
    if (OpenLayers.Protocol.WFS.v1_1_0) {
        OpenLayers.Protocol.WFS.v1_1_0= OpenLayers.overload(OpenLayers.Protocol.WFS.v1_1_0, {

        read: OpenLayers.Protocol.WFS.v1.prototype.read,
        setFeatureType: OpenLayers.Protocol.WFS.v1.prototype.setFeatureType,
        setGeometryName: OpenLayers.Protocol.WFS.v1.prototype.setGeometryName
        });
    }
    if (OpenLayers.Protocol.WFS.v1_0_0) {
        OpenLayers.Protocol.WFS.v1_0_0= OpenLayers.overload(OpenLayers.Protocol.WFS.v1_0_0, {
        read: OpenLayers.Protocol.WFS.v1.prototype.read,
        setFeatureType: OpenLayers.Protocol.WFS.v1.prototype.setFeatureType,
        setGeometryName: OpenLayers.Protocol.WFS.v1.prototype.setGeometryName
        });
    }

}

/**
 * Class: OpenLayers.Control.ScaleLine
 * IGNF: see {<OpenLayers.UI>}
 */
if (OpenLayers.Control.ScaleLine) {

    OpenLayers.Control.ScaleLine= OpenLayers.overload(OpenLayers.Control.ScaleLine, {

    /**
     * Method: draw
     * 
     * Returns:
     * {DOMElement}
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (!this.eTop) {
            // stick in the top bar
            this.eTop = this.div.ownerDocument.createElement("div");
            this.eTop.className = this.getDisplayClass() + "Top";//IGNF
            var theLen = this.topInUnits.length;
            this.div.appendChild(this.eTop);
            if((this.topOutUnits == "") || (this.topInUnits == "")) {
                this.eTop.style.visibility = "hidden";
            } else {
                this.eTop.style.visibility = "visible";
            }

            // and the bottom bar
            this.eBottom = this.div.ownerDocument.createElement("div");
            this.eBottom.className = this.getDisplayClass() + "Bottom";//IGNF
            this.div.appendChild(this.eBottom);
            if((this.bottomOutUnits == "") || (this.bottomInUnits == "")) {
                this.eBottom.style.visibility = "hidden";
            } else {
                this.eBottom.style.visibility = "visible";
            }
        }
        this.map.events.register('moveend', this, this.update);
        this.update();
        return this.div;
    }

    });

}

/**
 * Class: OpenLayers.Control.EditingToolbar
 * IGNF: see {<OpenLayers.UI>}
 */
if (OpenLayers.Control.EditingToolbar) {

    OpenLayers.Control.EditingToolbar= OpenLayers.overload(OpenLayers.Control.EditingToolbar, {

    /**
     * Constructor: OpenLayers.Control.EditingToolbar
     * Create an editing toolbar for a given layer. 
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} 
     * options - {Object} 
     */
    initialize: function(layer, options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        
        this.addControls(
          [ new OpenLayers.Control.Navigation() ]
        );  
        var controls = [
          new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Point, {uiOptions:{'displayClass': 'olControlDrawFeaturePoint'}}),
          new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Path, {uiOptions:{'displayClass': 'olControlDrawFeaturePath'}}),
          new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Polygon, {uiOptions:{'displayClass': 'olControlDrawFeaturePolygon'}})
        ];
        this.addControls(controls);
    }

    });

}

/**
 * Class: OpenLayers.Control.NavigationHistory
 * IGNF: see {<OpenLayers.UI>}
 */
if (OpenLayers.Control && OpenLayers.Control.NavigationHistory) {

    OpenLayers.Control.NavigationHistory= OpenLayers.overload(OpenLayers.Control.NavigationHistory, {

    /**
     * Constructor: OpenLayers.Control.NavigationHistory 
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.registry = OpenLayers.Util.extend({
            "moveend": this.getState
        }, this.registry);

        var previousOptions = {
            trigger: OpenLayers.Function.bind(this.previousTrigger, this),
            uiOptions: {}
        };
        OpenLayers.Util.extend(previousOptions, this.previousOptions);
        OpenLayers.Util.extend(previousOptions.uiOptions,{
            displayClass: this.getDisplayClass() + " " + this.getDisplayClass() + "Previous"
        });
        this.previous = new OpenLayers.Control.Button(previousOptions);

        var nextOptions = {
            trigger: OpenLayers.Function.bind(this.nextTrigger, this),
            uiOptions: {}
        };
        OpenLayers.Util.extend(nextOptions, this.nextOptions);
        OpenLayers.Util.extend(nextOptions.uiOptions,{
            displayClass: this.getDisplayClass() + " " + this.getDisplayClass() + "Next"
        });
        this.next = new OpenLayers.Control.Button(nextOptions);

        this.clear();
    }

    });

}

/**
 * Class: OpenLayers.Control.GetFeature
 * IGNF: OpenLayers 2.9 bug fixes and enhancements.
 */
if (OpenLayers.Control.GetFeature) {

    OpenLayers.Control.GetFeature= OpenLayers.overload(OpenLayers.Control.GetFeature, {

    /**
     * APIProperty: polygon
     * {Boolean} Allow feature selection by drawing a polygon.
     *  IGNF: _addition_
     */
    polygon: false,

    /**
     * Constructor: OpenLayers.Control.GetFeature
     * Create a new control for fetching remote features.
     * IGNF: _support for polygon selection_
     *
     * Parameters:
     * options - {Object} A configuration object which at least has to contain
     *     a <protocol> property
     */
    initialize: function(options) {

        options.handlerOptions = options.handlerOptions || {};

        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.features = {};

        this.handlers = {};

        if (this.click) {
            this.handlers.click = new OpenLayers.Handler.Click(this,
                {click: this.selectClick}, this.handlerOptions.click || {}) ;
        }

        if (this.box) {
            this.handlers.box = new OpenLayers.Handler.Box(
                this, {done: this.selectBox},
                OpenLayers.Util.extend(this.handlerOptions.box, {
                    boxDivClassName: "olHandlerBoxSelectFeature"
                })
            );
        }

        //IGNF
        if (this.polygon) {
            this.handlers.polygon = new OpenLayers.Handler.Polygon(
                this, {done: this.selectPolygon},
                OpenLayers.Util.extend(this.handlerOptions.polygon, {
                })
            );
        }

        if (this.hover) {
            this.handlers.hover = new OpenLayers.Handler.Hover(
                this, {'move': this.cancelHover, 'pause': this.selectHover},
                OpenLayers.Util.extend(this.handlerOptions.hover, {
                    'delay': 250
                })
            );
        }
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     * IGNF: _support for srs_
     */
    destroy: function () {
        if (this.srs) {//IGNF
            this.srs.destroy();
            this.srs= null;
        }
        OpenLayers.Control.prototype.destroy.apply(this,arguments);
    },

    /**
     * Method: selectBox
     * Callback from the handlers.box set up when <box> selection is on
     * IGNF: _support for srs_
     *
     * Parameters:
     * position - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     */
    selectBox: function(position) {
        var bounds;
        if (position instanceof OpenLayers.Bounds) {
            var minXY = this.map.getLonLatFromPixel(
                new OpenLayers.Pixel(position.left, position.bottom)
            );
            var maxXY = this.map.getLonLatFromPixel(
                new OpenLayers.Pixel(position.right, position.top)
            );
            bounds = new OpenLayers.Bounds(
                minXY.lon, minXY.lat, maxXY.lon, maxXY.lat
            );

        } else {
            if(this.click) {
                // box without extent - let the click handler take care of it
                return;
            }
            bounds = this.pixelToBounds(position);
        }
        //IGNF
        if (this.srs) {
            bounds= bounds.transform(this.map.getProjection(),this.srs);
        }
        this.setModifiers(this.handlers.box.dragHandler.evt);
        this.request(bounds);
    },

    /**
     * Method: selectPolygon
     * Callback from handlers.polygon set up when <polygon> selection is on
     *  IGNF: _addition_
     *
     * Parameters:
     * geom - {<OpenLayers.Geometry.Polygon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Polygon-js.html>}
     */
    selectPolygon: function(geom) {
        if (geom instanceof OpenLayers.Geometry.Polygon) {
            this.setModifiers(this.handlers.polygon.evt);
            this.request(geom);
        }
    },

    /**
     * Method: request
     * Sends a GetFeature request to the WFS
     * IGNF: _fix on complex filters because of MapServer_
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds | OpenLayers.Geometry>} bounds or geometry for the request's filter
     * options - {Object} additional options for this method.
     *
     * Supported options include:
     * single - {Boolean} A single feature should be returned.
     *     Note that this will be ignored if the protocol does not
     *     return the geometries of the features.
     * hover - {Boolean} Do the request for the hover handler.
     */
    request: function(bounds, options) {
        options = options || {};
        var filter = new OpenLayers.Filter.Spatial({
            type: this.filterType,
            value: bounds,
            projection:(this.srs || this.map.getProjection()).getCode() //IGNF
        });

        //IGNF: complex filter => BBOX AND FILTER to optimize request
        //      needed for Mapserver, not really for Geoserver !
        if (this.filterType===OpenLayers.Filter.Spatial.WITHIN) {
            filter= new OpenLayers.Filter.Logical({
                type: OpenLayers.Filter.Logical.AND,
                filters: [
                    new OpenLayers.Filter.Spatial({
                        type: OpenLayers.Filter.Spatial.BBOX,
                        value: (this.srs? bounds.clone().transform(this.map.getProjection(),this.srs) : bounds).getBounds(),
                        projection:(this.srs || this.map.getProjection()).getCode()
                    }),
                    filter
                ]
            });
        }

        // Set the cursor to "wait" to tell the user we're working on their click.
        OpenLayers.Element.addClass(this.map.viewPortDiv, "olCursorWait");

        var response = this.protocol.read({
            maxFeatures: options.single == true ? this.maxFeatures : undefined,
            filter: filter,
            callback: function(result) {
                if(result.success()) {
                    if(result.features.length) {
                        if(options.single == true) {
                            //IGNF
                            var c= (bounds instanceof OpenLayers.Bounds?
                                bounds
                            :   bounds.getBounds()).getCenterLonLat();
                            this.selectBestFeature(result.features, c, options);
                        } else {
                            this.select(result.features);
                        }
                    } else if(options.hover) {
                        this.hoverSelect();
                    } else {
                        this.events.triggerEvent("clickout");
                        if(this.clickout) {
                            this.unselectAll();
                        }
                    }
                }
                // Reset the cursor.
                OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
            },
            scope: this
        });
        if(options.hover == true) {
            this.hoverResponse = response;
        }
    },

    /**
     * Method: setMap
     * Set the map property for the control.
     * IGNF: _support of srs_
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        for(var i in this.handlers) {
            this.handlers[i].setMap(map);
        }
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        //IGNF
        if (!this.srs && this.protocol.srsName && !this.map.getProjection().equals(this.protocol.srsName)) {
            this.srs= new OpenLayers.Projection(this.protocol.srsName);
        }
    }

    });

}
