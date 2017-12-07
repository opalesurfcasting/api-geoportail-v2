/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/BasicLayerToolbar.js
 * @requires Geoportal/Control/Loading.js
 * @requires Geoportal/Control/ToggleControl.js
 * @requires Geoportal/Control/LayerAbstract.js
 * @requires Geoportal/Control/LayerLegend.js
 * @requires Geoportal/Control/LayerMetadata.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.LayerSwitcher
 * The Geoportal framework layer switch class.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id="#{id}" class="gpControlLayerSwitcher olControlNoSelect gpMainDivClass">
 *   <div id="#{id}_containerDiv" class="gpCLSContainer">
 *     <div id="#{id}_layersDiv" class="gpLayersClass">
 *       <div id="#{id}_layer_title" class="gpControlLabelClass"></div>
 *       <form id="__lrswtchr__#{id}" action="javascript:void(null)" style="margin:0px;padding:0px;border:0px;">
 *         <div id="#{id}_layers_container" class="gpGroupDivClass">
 *           <div id="#{id}_#{layer.id} class="gpLayerDivClass">
 *           <div class="gpLayerNameGroupDivClass">
 *             <input id="input_#{layer.id}" type="checkbox" name="#{layerName}" value="#{layerName}" class="gpLayerVisibilityClass" disabled=""/>
 *             <span id="label_#{layer.id}" class="gpLayerSpanClass">name</span>
 *             <div id="buttonsChangeOrder_#{layer.id} class="gpButtonsChangeOrderClass">
 *               <div id="buttonUp_#{layer.id} class="gpButtonUp"></div>
 *               <div id="buttonDown_#{layer.id} class="gpButtonDown"></div>
 *             </div>
 *             <div id="loading_#{layer.id} class="gpControlLoading olControlNoSelect" style="display:"></div>
 *           </div>
 *           <div id="basic_#{LayerId}" class="gpControlBasicLayerToolbar olControlNoSelect" style="display:"></div>
 *           <div id="edit_#{layerId}" class="gpControlEditingToolbar olControlNoSelect" style="display:"></div>
 *         </div>
 *       </form>
 *     </div>
 *   </div>
 *   <div id="#{id}_userctrls" class="gpCLSUsersControlsContainer"/></div>
 * </div>
 * (end)
 *
 * Inherits from:
 * - {<Geoportal.Control.ToggleControl>}
 */
Geoportal.Control.LayerSwitcher= OpenLayers.Class( Geoportal.Control.ToggleControl, {

    /**
     * Property: layerStates
     * {Array(Object)} Basically a copy of the "state" of the map's layers
     *     the last time the control was drawn. We have this in order to avoid
     *     unnecessarily redrawing the control.
     *
     */
    layerStates: null,

    // DOM Elements

    /**
     * Property: layersDiv
     * {DOMElement} The layerSwitcher div
     */
    layersDiv: null,

    /**
     * APIProperty: dataLbl
     * {DOMElement} Title of the layerSwitcher div
     */
    dataLbl: null,

    /**
     * Property: dataLayersDiv
     * {DOMElement} The inner layerSwitcher div. Holds each layer information
     * div.
     */
    dataLayersDiv: null,

    /**
     * Property: dataLayers
     * {Array(<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>)} Information to display about each layer.
     */
    dataLayers: null,

    /**
     * Property: entityBuffer
     * {DOMElement} the layer's title div.
     */
    entityBuffer: null,

    /**
     * APIProperty: preventControls
     * {Object} block the passed controls to be inserted in the layers
     * switcher.
     */
    preventControls: null,

    /**
     * Property: cntrlContent
     * {DOMElement} the toolbox content panel.
     */
    cntrlContent: null,

    /**
     * Property: usersContent
     * {DOMElement} the user's controls container.
     */
    usersContent: null,

    /**
     * APIProperty: layerStatusConfig
     * {Object} for each layer's property to monitor gives the property of the
     * layer or a function. In the later case, the call is made using a map's
     * layer as context and by passing the key as parameter.
     */
    layerStatusConfig: null,

    /**
     * Constructor: Geoportal.Control.LayerSwitcher
     * Build the layer switcher.
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        Geoportal.Control.ToggleControl.prototype.initialize.apply(this, arguments);
        this.cntrlKeys= OpenLayers.Util.extend({}, Geoportal.Control.LayerSwitcher.CNTRLKEYS);
        this.layerStates= [];
        if (!this.layerStatusConfig) {
            this.layerStatusConfig= {
                'displayInLayerSwitcher': 'displayInLayerSwitcher',
                'name': 'name',
                'visibility': 'visibility',
                'opacity': 'opacity',
                'inRange': 'inRange',
                'id': 'id'
            };
        }
    },

    /**
     * APIMethod: destroy
     * The DOM elements handling base layers are not suppressed.
     */
    destroy: function() {
        OpenLayers.Event.stopObservingElement(this.div);

        //clear out layers info and unregister their events
        if (this.map) {
            for (var i= 0, len= this.layerStates.length; i<len; i++) {
                for (var x in this.cntrlKeys) {
                    var cntrl= this.map.getControl(x+'_'+this.id+'_'+this.layerStates[i].id);
                    if (cntrl) {
                        cntrl.deactivate();
                        cntrl.destroy();
                    }
                }
            }
        }
        this.cntrKeys= null;
        this.layerStates= null;
        this.preventControls= null;
        if (this.dataLbl) {
            OpenLayers.Event.stopObservingElement(this.dataLbl);
        }
        this.clearLayersArray("data");
        if (this.map) {
            this.map.events.un({
                "addlayer": this.redraw,
                "changelayer": this.redraw,
                "changebaselayer": this.redraw,
                "removelayer": this.removeLayer,
                scope:this});
        }
        this.usersContent= null;
        this.cntrlContent= null;

        Geoportal.Control.ToggleControl.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: setMap
     * Register events and set the map.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.ToggleControl.prototype.setMap.apply(this, arguments);

        this.map.events.on({
            "addlayer": this.redraw,
            "changelayer": this.redraw,
            "changebaselayer": this.redraw,
            "removelayer": this.removeLayer,
            scope: this});
    },

    /**
     * APIMethod: clearLayersArray
     * User specifies either "base" or "data". we then clear all the
     *     corresponding listeners, the div, and reinitialize a new array.
     *
     * Parameters:
     * layersType - {String}
     */
    clearLayersArray: function(layersType) {
        var layers= this[layersType + "Layers"];
        if (layers) {
            for(var i= 0, len= layers.length; i<len; i++) {
                var layer= layers[i];
                OpenLayers.Event.stopObservingElement(layer.inputElem);
                OpenLayers.Event.stopObservingElement(layer.labelSpan);
                OpenLayers.Event.stopObservingElement(layer.layerDiv);
                //FIXME layer.id is undefined
                OpenLayers.Event.stopObservingElement(OpenLayers.Util.getElement("buttonUp_"+this.id+'_'+layer.id));
                OpenLayers.Event.stopObservingElement(OpenLayers.Util.getElement("buttonDown_"+this.id+'_'+layer.id));
            }
        }
        this[layersType + "Layers"]= [];
        this[layersType + "LayersDiv"].innerHTML= "";
    },


    /**
     * APIMethod: checkRedraw
     * Checks if the layer state has changed since the last redraw() call.
     *
     * Parameters:
     * options - {Object} allow specifying forceDraw option.
     *
     * Returns:
     * {Boolean} The layer state changed since the last redraw() call.
     */
    checkRedraw: function(options) {
        var redraw= options && options.forceDraw===true || false;
        if (!redraw) {
            if ( !this.layerStates.length ||
                 (this.map.layers.length != this.layerStates.length) ) {
                redraw= true;
            } else {
                for (var i=0, len= this.layerStates.length; i<len; i++) {
                    var layerState= this.layerStates[i];
                    var layer= this.map.layers[i];
                    for (var p in this.layerStatusConfig) {
                        var v= this.layerStatusConfig[p];
                        if (typeof v == 'function') {
                            v= v.call(layer, v);
                        }
                        if (layerState[v]!=layer[v]) {
                            redraw= true;
                            break;
                        }
                    }
                }
            }
        }
        return redraw;
    },

    /**
     * APIMethod: redraw
     *  Goes through and takes the current state of the Map and rebuilds the
     *  control to display that state.  Lists each data layer with a checkbox.
     *      If option *preventControls* {Object} holding controls class names
     *      is present, then the inner control is not created.
     *      So far, two controls can then be deactivated :
     *      * Geoportal.Control.BasicLayerToolbar ;
     *      * Geoportal.Control.EditingToolbar.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    redraw: function() {
        //if the state hasn't changed since last redraw, no need
        // to do anything. Just return the existing div.
        if (!Geoportal.Control.LayerSwitcher.prototype.checkRedraw.apply(this,arguments)) {
            return this.div;
        }

        this.saveStates();

        var containsOverlays= false;
        var layers= this.map.layers.slice();
        var l= this.map.layers.length;
        var lup= false, ldown= false;
        for (var i= l-1; i>=0; i--) {
            var layer= layers[i];
            var result= this.drawLayer(layer, i, l, lup, ldown);
            containsOverlays= containsOverlays || result.drawn;
            lup= lup || result.lup;
            ldown= ldown || result.ldown;
        }

        if (!this.outsideViewport) {
            // if no overlays, don't display the overlay label
            this.dataLbl.style.display= containsOverlays? '' : 'none';
        }

        return this.div;
    },

    /**
     * Method: saveStates
     * Build the layers' status to help checling map's state changement.
     * We save this before redrawing, because in the process of redrawing
     * we will trigger more visibility changes, and we want to not redraw
     * and enter an infinite loop. Same for opacity changes.
     */
    saveStates: function() {
        this.layerStates= [];
        for (var i= 0, l= this.map.layers.length; i<l; i++) {
            var layer= this.map.layers[i];
            // adding preventControls option to disallow some control's class by the user
            if (!layer.preventControls) {
                layer.preventControls= {};
            }
            OpenLayers.Util.extend(layer.preventControls, this.preventControls);
            this.layerStates[i]= {};
            for (var p in this.layerStatusConfig) {
                var v= this.layerStatusConfig[p];
                if (typeof v == 'function') {
                    v= v.call(layer, v);
                }
                this.layerStates[i][v]= layer[v];
            }
            for (var x in this.cntrlKeys) {
                var cntrl= this.map.getControl(x+'_'+this.id+'_'+this.layerStates[i].id);
                if (cntrl) {
                    var searchDiv= cntrl.div;
                    if (searchDiv.parentNode!=null) {
                        searchDiv.parentNode.removeChild(searchDiv);
                    }
                }
            }
        }
        //clear out previous layers
        this.clearLayersArray("data");
    },

    /**
     * Method: drawLayer
     * Draw a layer.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer>} the layer to draw.
     * i - {<Integer>} the layer's rank.
     * l - {<Integer>} the total number of layers in the map.
     * lup - {<Boolean>} false if the previous layer was not the last on top.
     * ldown - {<Boolean>} false if the previous layer was not the first on bottom.
     *
     * Returns:
     * {Object} with the drawn ({Boolean}), lup ({Boolean}) and ldown
     * ({Boolean}) properties.
     */
    drawLayer: function(layer, i, l, lup, ldown) {
        var doc= this.div.ownerDocument;
        var layers= this.map.layers.slice();
        var groupDiv= this.dataLayersDiv;
        var drawn= false;
        var baseLayer= layer.isBaseLayer;
        var layerState= this.layerStates[i];
        var j;

        // don't want baseLayers ...
        if (layer.displayInLayerSwitcher && !baseLayer) {
            drawn= true;

            var layerDiv= doc.createElement("div");
            layerDiv.id= this.id+"_"+layer.id;
            layerDiv.className= "gpLayerDivClass";
            if ((this.dataLayers.length %2) == 1) {
                layerDiv.className+= "Alternate";
            }
            groupDiv.appendChild(layerDiv);
            OpenLayers.Event.observe(
                layerDiv,
                "click",
                OpenLayers.Function.bindAsEventListener(
                    this.onActiveLayer,
                    ({
                        'layer': layer,
                        'layerSwitcher': this
                    })));
/*
            if (this.activeLayer===layer) {
                OpenLayers.Element.addClass(layerDiv, "gpLayerDivClassActive");
            }
 */

            var dg1= doc.createElement("div");
            dg1.className= "gpLayerNameGroupDivClass";
            layerDiv.appendChild(dg1);

            // check data layers if they are visible
            var checked= layer.getVisibility();
            var inputElem= doc.createElement("input");
            inputElem.id= "input_" + this.id+"_" + layer.id;
            inputElem.name= layer.name;
            inputElem.type= "checkbox";
            inputElem.value= layer.name;
            inputElem.checked= checked;
            inputElem.defaultChecked= checked;
            inputElem.className= 'gpLayerVisibilityClass';
            inputElem.style.autocomplete= "off";
            OpenLayers.Event.observe(
                inputElem,
                "mouseup",
                OpenLayers.Function.bindAsEventListener(
                    this.onInputClick,
                    ({
                        'inputElem': inputElem,
                        'layer': layer,
                        'layerSwitcher': this
                    })));
            dg1.appendChild(inputElem);

            // create span
            var labelSpan= doc.createElement("span");
            labelSpan.id= 'label_' + this.id+"_"+ layer.id;
            var label= layer.title || layer.name;
            var layerLab= OpenLayers.i18n(label);
            // convert HTML entities to get the right length :
            var entityBuffer= doc.createElement("textarea");
            entityBuffer.innerHTML= layerLab.replace(/</g,"&lt;").replace(/>/g,"&gt;");
            layerLab= entityBuffer.value;
            entityBuffer= null;
            labelSpan.innerHTML= layerLab;
            labelSpan.className= "gpLayerSpanClass";
            labelSpan.title= OpenLayers.i18n(label);
            if (!layer.inRange) {
                labelSpan.className+= "NotInRange";
            }
            if (layer.description || layer.dataURL || layer.metadataURL || layer.legends) {
                labelSpan.style.cursor= "help";
                // a pop-up for description, dataURL, metadataURL, ...
                OpenLayers.Event.observe(
                    labelSpan,
                    "click",
                    OpenLayers.Function.bindAsEventListener(
                        this.onLabelClick,
                        ({
                            'inputElem': inputElem,
                            'layer': layer,
                            'layerSwitcher': this
                        })));
            }
            dg1.appendChild(labelSpan);

            //Layers order management:
            var buttons= doc.createElement('div');
            buttons.id='buttonsChangeOrder'+this.id+"_"+layer.id;
            buttons.className= 'gpButtonsChangeOrderClass';
            dg1.appendChild(buttons);

            // Moving a layer up ...
            var buttonUp= doc.createElement('div');
            buttonUp.id="buttonUp_" +this.id+"_"+layer.id;
            buttonUp.className= "gpButtonUp";
            // if it is the last displayed in layer switcher ...
            if (!lup) {
                var dils= true;
                for (j= i+1; j<l-1; j++) {
                    if (!layers[j].isBaseLayer && layers[j].displayInLayerSwitcher) {
                        dils= false;
                        break;
                    }
                }
                if (dils) {
                    buttonUp.className+= "Deactive";
                    lup= true;
                }
            }
            OpenLayers.Event.observe(
                buttonUp,
                "click",
                OpenLayers.Function.bindAsEventListener(
                    this.onButtonUpClick,
                    ({
                        'layerSwitcher':this,
                        'layerRank':i
                    })
                )
            );
            buttons.appendChild(buttonUp);

            //Moving a layer down ...
            var buttonDown= doc.createElement('div');
            buttonDown.id="buttonDown_" +this.id+"_"+ layer.id;
            buttonDown.className= "gpButtonDown";
            // if it is the first displayed in layer switcher ...
            if (!ldown) {
                var dils= true;
                for (j= i-1; j>=0; j--) {
                    if (!layers[j].isBaseLayer && layers[j].displayInLayerSwitcher) {
                        dils= false;
                        break;
                    }
                }
                if (dils) {
                    buttonDown.className+= "Deactive";
                    ldown= true;
                }
            }
            OpenLayers.Event.observe(
                buttonDown,
                "click",
                OpenLayers.Function.bindAsEventListener(
                    this.onButtonDownClick,
                    ({
                        'layerSwitcher':this,
                        'layerRank':i
                    })
                )
            );
            buttons.appendChild(buttonDown);
            var ctrlId= 'loading_'+this.id+"_"+layer.id;
            var loadingCtrl= this.map.getControl(ctrlId);
            if (loadingCtrl) {
                dg1.appendChild(loadingCtrl.div);
            } else {
                var loadingCtrlDiv= doc.createElement('div');
                loadingCtrlDiv.id= ctrlId;
                loadingCtrlDiv.className= 'gpControlLoading olControlNoSelect';
                loadingCtrl= new Geoportal.Control.Loading(
                                    layer, {
                                        id : loadingCtrlDiv.id,
                                        div: loadingCtrlDiv
                                    });
                dg1.appendChild(loadingCtrlDiv);
                this.map.addControl(loadingCtrl);
            }

            if (layer.preventControls['Geoportal.Control.BasicLayerToolbar']!==true &&
                ((layer.view && (layer.view.drop || layer.view.zoomToExtent)) ||
                 (layer.opacity!=undefined))) {
                ctrlId= 'basic_'+this.id+"_"+layer.id;
                var basicCtrl= this.map.getControl(ctrlId);
                if (basicCtrl) {
                    layerDiv.appendChild(basicCtrl.div);
                    for (var ibc= 0, lbc= basicCtrl.controls.length; ibc<lbc; ibc++) {
                        if (basicCtrl.controls[ibc] instanceof Geoportal.Control.LayerOpacity) {
                            basicCtrl.controls[ibc].refreshOpacity();
                            break;
                        }
                    }
                } else {
                    var basicCtrlDiv= doc.createElement('div');
                    basicCtrlDiv.id= ctrlId;
                    basicCtrlDiv.className= 'gpControlBasicLayerToolbar olControlNoSelect';
                    var basicCtrl= new Geoportal.Control.BasicLayerToolbar(
                                            layer, {
                                                id : basicCtrlDiv.id,
                                                div: basicCtrlDiv
                                            });
                    layerDiv.appendChild(basicCtrlDiv);
                    this.map.addControl(basicCtrl);
                }
            }

            if (layer.preventControls['Geoportal.Control.EditingToolbar']!==true) {
                var preventDrawingControl= false;
                if (typeof(Geoportal.Control.DrawingToolbar)=='function') {
                    var drawingControls= this.map.getControlsByClass('Geoportal.Control.DrawingToolbar');
                    if (drawingControls.length > 0) {
                        for (var dtc= 0, dtclen= drawingControls.length; dtc<dtclen; dtc++) {
                            if (drawingControls[dtc].mode=='single') {
                                preventDrawingControl= true;
                                if (!this.activeLayer) {
                                    this.setActiveLayer(drawingControls[dtc].layer);
                                }
                                break;
                            }
                        }
                    }
                }
                if (!preventDrawingControl) {
                    // editing toolbar (makes provision of ...) :
                    ctrlId= 'edit_'+this.id+"_"+layer.id;
                    var editCtrl= this.map.getControl(ctrlId);
                    if (editCtrl) {
                        layerDiv.appendChild(editCtrl.div);
                        if (editCtrl.div.childNodes.length>0) {
                            editCtrl.div.style.display= '';
                        } else {
                            editCtrl.div.style.display= 'none';
                        }
                    } else {
                        var editDiv= doc.createElement('div');
                        editDiv.id= ctrlId;
                        editDiv.className= 'gpControlEditingToolbar olControlNoSelect';
                        editDiv.style.display= 'none';
                        layerDiv.appendChild(editDiv);
                    }
                }
            }

            this.dataLayers.push({
                'layer': layer,
                'inputElem': inputElem,
                'labelSpan': labelSpan,
                'layerDiv': layerDiv
            });
        }
        return {'drawn': drawn, 'lup': lup, 'ldown':ldown};
    },

    /**
     * APIMethod: onInputClick
     * A checkbox has been clicked, check or uncheck its corresponding input.
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * inputElem - {DOMElement}
     * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>}
     */
    onInputClick: function(e) {
        if (e != null) {
            OpenLayers.Event.stop(e);
        }
        this.inputElem.checked= !this.inputElem.checked;
        if (this.layer.inRange) {
            this.layerSwitcher.updateMap();
        } else {
            // store visibility hint:
            this.layer.visibility= this.inputElem.checked;
        }
        // force layerSwitcher redraw
        this.layerSwitcher.redraw();
    },

    /**
     * APIMethod: onActiveLayer
     * A layer has been clicked in the layer switcher, trigger the associated event.
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>}
     */
    onActiveLayer: function(e) {
        this.layerSwitcher.setActiveLayer(this.layer);
    },

    /**
     * APIMethod: setActiveLayer
     * Set an active layer in the layer switcher, trigger the associated event.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the active layer.
     *
     */
    setActiveLayer: function(layer) {
        var layerDiv= null;
/*
        if (this.activeLayer) {
            layerDiv= OpenLayers.Util.getElement(this.id+"_"+this.activeLayer.id);
            if (layerDiv) {
                OpenLayers.Element.removeClass(layerDiv, "gpLayerDivClassActive");
            }
        }
 */
        this.activeLayer= layer;
        layerDiv= OpenLayers.Util.getElement(this.id+"_"+layer.id);
        if (layerDiv) {
            OpenLayers.Element.addClass(layerDiv, "gpLayerDivClassActive");
            this.map.events.triggerEvent("activelayer", {
                layer: layer
            });
            OpenLayers.Element.removeClass(layerDiv, "gpLayerDivClassActive");
        }
    },

    /**
     * APIMethod: onLabelClick
     * A layer's label has been clicked, show up the associated pop-up.
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * inputElem - {DOMElement}
     * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>}
     */
    onLabelClick: function(e) {
        var doc= this.layerSwitcher.div.ownerDocument;
        var xy= null;
        var map= this.layerSwitcher.map;
        if (e!=null) {
            xy= OpenLayers.Events.prototype.getMousePosition.apply({
                includeXY:true,
                hasScrollEvent:true,
                element:map.div,
                clearMouseCache: function() { /*OpenLayers.Events.prototype.clearMouseCache.apply(this);*/ },
                clearMouseListener: function() { /*OpenLayers.Events.prototype.clearMouseCache.apply(this);*/ }
            }, [e]);
            OpenLayers.Event.stop(e);
            if (xy.x<0) { xy.x= 0; }
            if (xy.y<0) { xy.y= 0; }
        }

        var mtdPopupId= '_mtdpopup_' + this.layer.id;
        var mtdPopup= map.getControlsBy('id',mtdPopupId);
        if (mtdPopup.length>0) {
            mtdPopup= mtdPopup[0].closeControl();
            return;
        }
        //popupDiv: div globale
        var popupDiv= doc.createElement("div");

        // Création de abstractDiv
        var abstractDiv= null;
        if (this.layer.description) {
            abstractDiv= doc.createElement("div");
            abstractDiv.className= "gpLayerAbstractDivClass";
            popupDiv.appendChild(abstractDiv);
        }
        // Création de legendsDiv
        var legendsDiv= null ;
        if (this.layer.legends) {
            legendsDiv= doc.createElement("div");
            legendsDiv.className= "gpLayerLegendsDivClass";
            popupDiv.appendChild(legendsDiv);
        }
        // Création de  urlsDiv
        var urlsDiv= null;
        if (this.layer.dataURL || this.layer.metadataURL) {
            urlsDiv= doc.createElement("div");
            urlsDiv.className= "gpLayerUrlsDivClass";
            popupDiv.appendChild(urlsDiv);
        }
        
        var mapSz= new OpenLayers.Size(
            Geoportal.Util.getComputedStyle(map.div,'width',true),
            Geoportal.Util.getComputedStyle(map.div,'height',true)
        );
        mapSz.w/= 2;
        mapSz.h/= 4;
        mtdPopup= new Geoportal.Control.Floating(this, {
            id: mtdPopupId,
            headTitle: this.layer.title || this.layer.name,
            size: mapSz
        });
        mtdPopup.onResize= OpenLayers.Function.bind(function(evt,opts) {
            this.bodyDiv.style.width= 'auto';
            this.bodyDiv.style.height= (this.div.clientHeight-this.headDiv.clientHeight)+"px";
        }, mtdPopup) ;
        mtdPopup.onClose= OpenLayers.Function.bind(function() {
            if (this.layerAbstract) {
              this.layerAbstract.destroy();
              this.layerAbstract = null;
            }
            if (this.layerLegend) {
              this.layerLegend.destroy();
              this.layerLegend = null;
            }
            if (this.layerMetadata) {
              this.layerMetadata.destroy();
              this.layerMetadata = null;
            }
            this.destroy();
        }, mtdPopup) ;
        map.addControl(mtdPopup,xy);
        xy= null;
        mtdPopup.addContent(popupDiv);

        if (abstractDiv) {
          mtdPopup.layerAbstract = new Geoportal.Control.LayerAbstract(
            this.layer, {
                autoActivate: true,
                div : abstractDiv
            }
          );
          map.addControl(mtdPopup.layerAbstract);
        }
        if (legendsDiv) {
          mtdPopup.layerLegend = new Geoportal.Control.LayerLegend(
            this.layer, {
                autoActivate: true,
                div: legendsDiv
            }
          );
          map.addControl(mtdPopup.layerLegend);
        }
        if (urlsDiv) {
          mtdPopup.layerMetadata = new Geoportal.Control.LayerMetadata(
            this.layer, {
                autoActivate: true,
                div: urlsDiv
            }
          );
          map.addControl(mtdPopup.layerMetadata);
        }

    },

    /**
     * APIMethod: onButtonUpClick
     * the button up has been clicked, move layer accordingly
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
     * layerRank - {Integer}
     */
    onButtonUpClick: function(e) {
        var layersTemp= this.layerSwitcher.map.layers;
        var layer= layersTemp[this.layerRank];//layer moving up
        if (this.layerSwitcher.map.moveLayerUp(layer.name)) {
            this.layerSwitcher.redraw();
        }
        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },

    /**
     * APIMethod: onButtonDownClick
     * the button down has been clicked, move layer accordingly
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
     * layerRank - {Integer}
     */
    onButtonDownClick: function(e) {
        var layersTemp= this.layerSwitcher.map.layers;
        var layer= layersTemp[this.layerRank];//layer moving down
        if (this.layerSwitcher.map.moveLayerDown(layer.name)) {
            this.layerSwitcher.redraw();
        }
        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },

    /**
     * APIMethod: onLayerClick
     * Need to update the map accordingly whenever user clicks in either of
     *     the layers.
     *
     * Parameters:
     * e - {Event} the browser event
     */
    onLayerClick: function(e) {
        this.updateMap();
    },

    /**
     * APIMethod: updateMap
     * Cycles through the loaded data and makes
     * the necessary calls to the Map object such that that the map's
     * visual state corresponds to what the user has selected in the control
     * Does not take into account base layers.
     */
    updateMap: function() {
        // set the correct visibilities for the overlays
        for (var i= 0, len= this.dataLayers.length; i<len; i++) {
            var layerEntry= this.dataLayers[i];
            if (layerEntry.inputElem) {
                layerEntry.layer.setVisibility(layerEntry.inputElem.checked);
            }
        }
    },

    /**
     * APIMethod: loadContents
     * Set up the labels and divs for the control.
     * DOM elements for the base layers are not created here.
     */
    loadContents: function() {
        var doc= this.div.ownerDocument;
        this.addClass("gpMainDivClass");

        this.cntrlContent= this.createInnerDiv(
            this.id+"_containerDiv",
            "gpCLSContainer",
            this.div);

        OpenLayers.Event.observe(
            this.cntrlContent,
            "dblclick",
            OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
        );
        OpenLayers.Event.observe(
            this.cntrlContent,
            "click",
            OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
        );
        OpenLayers.Event.observe(
            this.cntrlContent,
            "mousedown",
            OpenLayers.Function.bindAsEventListener(this.mouseDown,this)
        );
        //under FF this prevents tooltips to show up !
        //OpenLayers.Event.observe(
        //    this.div,
        //    "mousemove",
        //    OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
        //);
        OpenLayers.Event.observe(
            this.cntrlContent,
            "mouseup",
            OpenLayers.Function.bindAsEventListener(this.mouseUp,this)
        );
        OpenLayers.Event.observe(
            this.div,
            "mouseover",
            OpenLayers.Function.bindAsEventListener(Geoportal.Control.mapMouseOut,this)
        );
        OpenLayers.Event.observe(
            this.div,
            "mouseout",
            OpenLayers.Function.bindAsEventListener(Geoportal.Control.mapMouseOver,this)
        );

        // layers list div
        this.layersDiv= doc.createElement("div");
        this.layersDiv.id= this.id+"_layersDiv";
        this.layersDiv.className= "gpLayersClass";

        if (!this.outsideViewport) {
            this.dataLbl= doc.createElement("div");
            this.dataLbl.id= this.id+"_layer_title";
            this.dataLbl.innerHTML= OpenLayers.i18n(this.getDisplayClass()+'.label');
            this.dataLbl.className= "gpControlLabelClass";
            OpenLayers.Event.observe(
                this.dataLbl,
                "click",
                OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
            );
            OpenLayers.Event.observe(
                this.dataLbl,
                "dblclick",
                OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
            );
            this.layersDiv.appendChild(this.dataLbl);
        }

        // as we use input fields, we put a form !
        var f= doc.createElement("form");
        f.id= '__lrswtchr__' + this.id;
        f.name= f.id;
        f.action= 'javascript:void(null)';
        f.style.margin= '0px';
        f.style.padding= '0px';
        f.style.border= '0px';

        this.dataLayersDiv= doc.createElement("div");
        this.dataLayersDiv.id= this.id+"_layers_container";
        this.dataLayersDiv.className= "gpGroupDivClass";
        this.layersDiv.appendChild(f);
        f.appendChild(this.dataLayersDiv);
        if (this.outsideViewport) {
            this.dataLayersDiv.style.display= 'block';
        }

        this.cntrlContent.appendChild(this.layersDiv);
        this.div.appendChild(this.cntrlContent);
        // hook for user's controls :
        this.usersContent= this.createInnerDiv(this.id+'_userctrls','gpCLSUsersControlsContainer',this.div);
        this.setContent(this.dataLayersDiv);
    },

    /**
     * APIMethod: createControlAnchor
     * Create an empty div into the layers' switcher content for anchoring external
     * controls. Append this div to the user's controls div of the panel.
     *
     * (start code)
     * var d= this.createControlAnchor('myCntrlID',displayClass);
     * var c= new OpenLayers.Control({div: d, ...});
     * (end)
     *
     * Parameters:
     * id - {String} div's identifier, optional.
     * cn - {String} className value, optional. The div's class will at least
     *               contain 'olControlNoSelect'.
     *
     * Returns:
     * {DOMElement} the newly created div or null if the user's controls
     * container does not exist.
     */
    createControlAnchor: function(id,cn) {
        var d= null;
        if (this.usersContent) {
            d= this.createInnerDiv(id,cn,this.cntrlContent);
            this.usersContent.appendChild(d);
        }

        return d;
    },

    /**
     * APIMethod: removeLayer
     * Listener of "removelayer" event.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    removeLayer: function(evt) {
        if (evt.layer) {
            for (var i= this.layerStates.length -1; i>=0; i--) {
                if (this.layerStates[i].id==evt.layer.id) {
                    for (var x in this.cntrlKeys) {
                        var cntrl= this.map.getControl(x+'_'+this.id+'_'+evt.layer.id);
                        if (cntrl) {
                            cntrl.deactivate();
                            cntrl.destroy();
                        }
                    }
                    break;
                }
            }
        }
        // layerStates is cleaned during redraw (checkRedraw() will return true) ...
        this.redraw();
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
        if (this.dataLbl) {
            this.dataLbl.innerHTML= OpenLayers.i18n(this.getDisplayClass()+'.label');
        }
        if (this.dataLayers && this.dataLayersDiv) {
            this.redraw({forceDraw:true});
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LayerSwitcher"*
     */
    CLASS_NAME: "Geoportal.Control.LayerSwitcher"
});

/**
 * Constant: CNTRLKEYS
 * {Object} *loading, basic, edit, info*
 */
Geoportal.Control.LayerSwitcher.CNTRLKEYS= {
    'loading':'',
    'basic':'',
    'edit':'',
    'info':''
};
