/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Form.js
 */
/**
 * Class: Geoportal.Control.LayerStyling
 * Implements a button control for changing styles of the layer and
 * its features. Designed to be used with a <Geoportal.Control.Panel>.
 *
 * The control is displayed through <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> by using
 * the displayClass of the control : gpControlLayerStyling. Two
 * effective styles are connected with this :
 * gpControlLayerStylingIemActive and
 * gpControlLayerStylingIemInactive.
 *
 * TODO : applies change to the current selected features instead of the whole
 * layer.
 *
 * Inherits from:
 *  - <Geoportal.Control.Form>
 */
Geoportal.Control.LayerStyling= OpenLayers.Class(Geoportal.Control.Form, {
    /**
     * Property: type
     * {String} The type of <Geoportal.Control.LayerStyling>
     *     Defaults to *OpenLayers.Control.TYPE_TOGGLE*
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} the controlled layer
     */
    layer: null,

    /**
     * Constructor: Geoportal.Control.LayerStyling
     * Build a button to change the style map of the layer.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} layer to change the style map.
     * options - {Object} any options usefull for control.
     */
    initialize: function(layer, options) {
        if (!options) { options= {}; }
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function () {
        this.layer= null;
        Geoportal.Control.Form.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: activate
     * Do the coloring via a form.
     *      The form is as follows :
     *
     * (start code)
     * <form id='__changestylelayer__{#Id}' name='__changestylelayer__{#Id}' action='javascript:void(null)'>
     * </form>
     * (end)
     *
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        var newArguments= [];
        for (var i= 0, l= arguments.length; i<l; i++) {
            newArguments.push(arguments[i]);
        }
        newArguments.push({onClose:this.closeForm});
        if (!Geoportal.Control.Form.prototype.activate.apply(this,newArguments)) {
            return false;
        }
        var f= document.createElement('form');
        f.id= '__changestylelayer__' + this.id;
        f.name= f.id;
        f.action= 'javascript:void(null)';
        this.changestylelayer(f);
        this.map.addControl(this.formControl);
        this.formControl.activate();
        this.formControl.addContent(f);
        return true;
    },

    /**
     * Method: deactivate
     * Terminate and clean the form.
     *
     * Returns:
     * {Boolean}  True if the control was successfully deactivated or
     *            false if the control was already inactive.
     */
    deactivate: function() {
        return Geoportal.Control.Form.prototype.deactivate.apply(this,arguments);
    },

    /**
     * Method: changestylelayer
     * Build the form to add the attribute to the specified layer and its
     * features.
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id='lblcolor{#Id}' for='color{#Id}'>
     *      {#displayClass}.color
     *      <input id='color{#Id}' name='color{#Id}' type='text' value='{#fld.value}' maxLength='7' size='{#fld.length}'/>
     * </label>
     * <br/>
     * <span id='helpcolor{#Id}' class='gpFormSmall'>{#displayClass}.color.help</span>
     * <br/>
     * <label id='lblsize{#Id}' for='size{#Id}'>
     *      {#displayClass}.size
     *      <select id='size{#Id}' name='size{#Id}' class='{#fld.css}'>
     *          <option value='{#fld.options[].value}' selected='{#fld.options[].selected}' class='{#fld.css}'>{#fld.options[].text}</option>
     *      </select>
     * </label>
     * <br/>
     * <span id='helpsize{#Id}' class='gpFormSmall'>{#displayClass}.size.help</span>
     * <br/>
     * <label id='lblstyle{#Id}' for='style{#Id}'>
     *      {#displayClass}.style
     *      <select id='style{#Id}' name='style{#Id}' class='{#fld.css}'>
     *          <option value='{#fld.options[].value}' selected='{#fld.options[].selected}' class='{#fld.css}'>{#fld.options[].text}</option>
     *      </select>
     * </label>
     * <br/>
     * <span id='helpstyle{#Id}' class='gpFormSmall'>{#displayClass}.style.help</span>
     * <br/>
     * <input class='{#displayClass}Button' type='button' id='cancel{#Id}' name='cancel{#Id}'
     *      value='{#displayClass}.button.cancel'/>
     * <input class='{#displayClass}Button' type='button' id='add{#Id}' name='add{#Id}'
     *      value='{#displayClass}.button.changestyle'/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    changestylelayer: function(form) {
        this.coChooser= this.buildInputTextField(form,{
            id:'color',
            size:7,
            length:7,
            value:this.layer.styleMap.styles['default'].defaultStyle.strokeColor,
            callbacks:[{
                evt:'mouseup',
                func:function() {
                    var colorId= '__color__'+this.id;
                    var d= OpenLayers.Util.getElement(colorId);
                    if (d && d.parentNode) {
                        d.parentNode.removeChild(d);
                    } else {
                        d= this.div.ownerDocument.createElement('div');
                        d.id= colorId;
                        d.className= 'gpControlLayerStyling-color';
                        this.formControl.div.appendChild(d);
                        d.style.left= this.coChooser.offsetLeft+'px';
                        d.style.top= (this.coChooser.offsetTop+this.coChooser.offsetHeight)+'px';
                        var c= d.ownerDocument.createElement('div');
                        c.id= '__color__greyscales__';
                        d.appendChild(c);
                        var clbk= function(e) {
                            if (e!=null) { OpenLayers.Event.stop(e); }
                            this.input.value= this.bgcolor;
                            this.input.style.backgroundColor= this.bgcolor;
                            this.input.style.color= OpenLayers.Util.invertRGBColor(this.bgcolor);
                            if (this.widget!=null) { this.widget.parentNode.removeChild(this.widget); }
                        };
                        for (var i= 0; i<255; i+=16) {
                            var dc= d.ownerDocument.createElement('div');
                            var rgb= "#"+i.toString(16)+i.toString(16)+i.toString(16);
                            dc.style.backgroundColor= rgb;
                            c.appendChild(dc);
                            OpenLayers.Event.observe(
                                dc,
                                "mouseover",
                                OpenLayers.Function.bindAsEventListener(
                                    clbk,
                                    ({
                                        'bgcolor': rgb,
                                        'input'  : this.coChooser,
                                        'widget' : null
                                    })));
                            OpenLayers.Event.observe(
                                dc,
                                "click",
                                OpenLayers.Function.bindAsEventListener(
                                    clbk,
                                    ({
                                        'bgcolor': rgb,
                                        'input'  : this.coChooser,
                                        'widget' : d
                                    })));
                        }
                        var t= ["0","5","A","F"];
                        for (var i= 0; i<4; i++) {
                            c= d.ownerDocument.createElement('div');
                            d.appendChild(c);
                            for (var j= 0; j<4; j++) {
                                for (var k= 0; k<4; k++) {
                                    var dc= d.ownerDocument.createElement('div');
                                    var rgb= "#"+t[i]+t[j]+t[k];
                                    dc.style.backgroundColor= rgb;
                                    c.appendChild(dc);
                                    OpenLayers.Event.observe(
                                        dc,
                                        "mouseover",
                                        OpenLayers.Function.bindAsEventListener(
                                            clbk,
                                            ({
                                                'bgcolor': rgb,
                                                'input'  : this.coChooser,
                                                'widget' : null
                                            })));
                                    OpenLayers.Event.observe(
                                        dc,
                                        "click",
                                        OpenLayers.Function.bindAsEventListener(
                                            clbk,
                                            ({
                                                'bgcolor': rgb,
                                                'input'  : this.coChooser,
                                                'widget' : d
                                            })));
                                }
                            }
                        }
                    }
                }
            }]
        });
        this.coChooser.style.backgroundColor= this.layer.styleMap.styles['default'].defaultStyle.strokeColor;
        this.coChooser.style.color= OpenLayers.Util.invertRGBColor(this.layer.styleMap.styles['default'].defaultStyle.strokeColor);

        var isPoint= !(this.layer.hasType && !this.layer.hasType.match(/Point/));
        var isCollection= !this.layer.hasType && this.isCollection;
        var swOpts= [];
        var swTarget= 'pointRadius';
        var swFactor= 2;
        if (!isPoint || isCollection) {
            swTarget= 'strokeWidth';
            swFactor= 1;
        }
        for (var i= 1, l= 9; i<=l; i++) {
            var swo= {
                value:''+(swFactor*i),
                selected:this.layer.styleMap.styles['default'].defaultStyle[swTarget]==swFactor*i,
                disabled:false,
                text:''+(swFactor)*i+'px',
                css:'gpControlLayerStyling-'+swTarget+'-0 gpControlLayerStyling-'+swTarget+'-'+i
            };
            swOpts.push(swo);
        }
        this.swChooser= this.buildSelectField(form,{
            id:'size',
            css:'gpControlLayerStyling-'+swTarget,
            options:swOpts
        });
        if (!isPoint || isCollection) {
            var ssOpts= [];
            for (var i in {'solid':"",'dot':"",'dash':"",'dashdot':"",'longdash':"",'longdashdot':""}) {
                var sso= {
                    value:i,
                    selected:this.layer.styleMap.styles['default'].defaultStyle.strokeDashstyle==i,
                    disabled:false,
                    text:i,
                    css:'gpControlLayerStyling-strokeDashstyle-0 gpControlLayerStyling-strokeDashstyle-'+i
                };
                ssOpts.push(sso);
            }
            this.ssChooser= this.buildSelectField(form,{
                id:'style',
                css:'gpControlLayerStyling-strokeDashstyle',
                options:ssOpts
            });
        } 
        if (isPoint || isCollection) {
            this.roChooser= this.buildInputTextField(form,{
                id:'rotation',
                size:4,
                length:4,
                value:''+(this.layer.styleMap.styles['default'].defaultStyle.rotation || ''),
                callbacks:[{
                    evt:'mouseup',
                    func:function() {
                        var clockId= '__clock__'+this.id;
                        var d= OpenLayers.Util.getElement(clockId);
                        if (d && d.parentNode) {
                            d.parentNode.removeChild(d);
                        } else {
                            d= this.div.ownerDocument.createElement('div');
                            d.id= clockId;
                            d.className= 'gpControlLayerStyling-rotation';
                            this.formControl.div.appendChild(d);
                            d.style.left= this.roChooser.offsetLeft+'px';
                            d.style.top= (this.roChooser.offsetTop+this.roChooser.offsetHeight)+'px';
                            var clbk= function(e) {
                                if (e!=null) { OpenLayers.Event.stop(e); }
                                this.input.value= this.angle;
                                if (this.widget!=null) { this.widget.parentNode.removeChild(this.widget); }
                            };
                            for (var i= 0; i<36; i++) {
                                var da= d.ownerDocument.createElement('div');
                                var a= i*Math.PI/18.0;
                                da.style.left= (50.0+Math.sin(a)*45)+'px';
                                da.style.top= (50.0-Math.cos(a)*45)+'px';
                                d.appendChild(da);
                                OpenLayers.Event.observe(
                                    da,
                                    "mouseover",
                                    OpenLayers.Function.bindAsEventListener(
                                        clbk,
                                        ({
                                            'angle' : ''+10*i,
                                            'input' : this.roChooser,
                                            'widget': null
                                        })));
                                OpenLayers.Event.observe(
                                    da,
                                    "click",
                                    OpenLayers.Function.bindAsEventListener(
                                        clbk,
                                        ({
                                            'angle' : ''+10*i,
                                            'input' : this.roChooser,
                                            'widget': d
                                        })));
                            }
                        }
                    }
                }]
            });

            this.egChooser= this.buildInputTextField(form,{
                id:'externalgraphic',
                size:40,
                maxlength:512,
                value:this.layer.styleMap.styles['default'].defaultStyle.externalGraphic || ''
            });
            //TODO: graphicWidth, graphicHeight, graphicOpacity,
            //graphicXOffset, graphicYOffset, graphicZIndex,
            //graphicTitle, backgroundGraphic,
            //backgroundGraphicZIndex, backgroundXOffset,
            //backgroundYOffset, backgroundWidth, backgroundHeight
        }

        this.buildButton(form,'cancel',this.closeForm);
        this.buildButton(form,'changestyle',this.onClick,13);//RETURN keycode==13
    },

    /**
     * Method: onClick
     * Add/Delete button has been hit, process the layer.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onClick: function(element,evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        var es= ['color', 'size', 'style', 'rotation', 'externalgraphic'];
        var em= '^('+es.join('|')+')';
        var er= new RegExp(em);
        if (element.id.match(er) && OpenLayers.String.contains(element.id,this.id)) {
            if (!element.hasFocus) {
                for (var i= 0, l= es.length; i<l; i++) {
                    var e= OpenLayers.Util.getElement(es[i] + this.id);
                    if (e && element.id!=e.id && e.hasFocus) {
                        Geoportal.Control.Form.focusOff(e);
                    }
                }
                Geoportal.Control.Form.focusOn(element);
            }
            return false;
        }
        if (element.id.match(/^changestyle/)) {
            var aColor= OpenLayers.String.trim(this.coChooser.value);
            if (aColor=='') {
                OpenLayers.Console.userError(OpenLayers.i18n(this.getDisplayClass()+".emptyColor"));
                return false;
            }
            // update colors :
            // FIXME :
            // OpenLayers.Control.ModifyFeature.virtualStyle= OpenLayers.Util.extend({},
            //          this.layer.style || this.layer.styleMap.createSymbolizer());
            for (var s in this.layer.styleMap.styles) {
                this.layer.styleMap.styles[s].defaultStyle.fillColor=
                this.layer.styleMap.styles[s].defaultStyle.strokeColor= aColor;
            }
            var isPoint= !(this.layer.hasType && !this.layer.hasType.match(/Point/));
            var isCollection= !this.layer.hasType && this.isCollection;
            // update strokeWidth or pointRadius :
            var v= parseInt(this.swChooser.value);
            for (var s in this.layer.styleMap.styles) {
                if (isPoint || isCollection) {
                    this.layer.styleMap.styles[s].defaultStyle.pointRadius= v+(s=='select'? 4:0);
                } 
                if (!isPoint || isCollection) {
                    this.layer.styleMap.styles[s].defaultStyle.strokeWidth= v*(s=='select'? 2:1);
                    this.layer.styleMap.styles[s].defaultStyle.hoverStrokeWidth= v*(s=='select'? 2:1)/10;
                }
            }
            if (!isPoint || isCollection) {
                // update strokeDashStyle :
                v= this.ssChooser.value;
                for (var s in this.layer.styleMap.styles) {
                    this.layer.styleMap.styles[s].defaultStyle.strokeDashstyle= v;
                }
            } 
            if (isPoint || isCollection) {
                // update rotation :
                v= this.roChooser.value;
                for (var s in this.layer.styleMap.styles) {
                    if (v.length==0) {
                        if (this.layer.styleMap.styles[s].defaultStyle.rotation) {
                            delete this.layer.styleMap.styles[s].defaultStyle.rotation;
                        }
                    } else {
                        this.layer.styleMap.styles[s].defaultStyle.rotation= parseInt(v);
                    }
                }
                // update external Graphic :
                v= this.egChooser.value;
                for (var s in this.layer.styleMap.styles) {
                    if (v.length==0) {
                        if (this.layer.styleMap.styles[s].defaultStyle.externalGraphic) {
                            delete this.layer.styleMap.styles[s].defaultStyle.externalGraphic;
                        }
                        if (this.layer.styleMap.styles[s].defaultStyle.graphicOpacity) {
                            delete this.layer.styleMap.styles[s].defaultStyle.graphicOpacity;
                        }
                    } else {
                        this.layer.styleMap.styles[s].defaultStyle.externalGraphic= v;
                        this.layer.styleMap.styles[s].defaultStyle.graphicOpacity= 1.0;
                    }
                }
            }
            // force redraw features :
            for (var i= 0, l= this.layer.features.length; i<l; i++) {
                var f= this.layer.features[i];
                this.layer.drawFeature(f,"default");
            }
            // force redraw popups :
            for (var i= 0, l= this.layer.selectedFeatures.length; i<l; i++) {
                var f= this.layer.selectedFeatures[i];
                onUnselectCallback(f);
                onSelectCallback(f);
            }
        }
        //element= OpenLayers.Util.getElement('__changestylelayer__' + this.id);
        //element.submit();
        this.closeForm();
        return false;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LayerStyling"*
     */
    CLASS_NAME: "Geoportal.Control.LayerStyling"
});
