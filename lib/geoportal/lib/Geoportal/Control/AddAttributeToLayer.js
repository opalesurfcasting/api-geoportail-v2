/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Form.js
 */
/**
 * Class: Geoportal.Control.AddAttributeToLayer
 * Implements a button control for adding an attribute to the layer and
 * its features. Designed to be used with a <Geoportal.Control.Panel>.
 *
 * The control is displayed through <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> by using
 * the displayClass of the control : gpControlAddAttributeToLayer. Two
 * effective styles are connected with this :
 * gpControlAddAttributeToLayerIemActive and
 * gpControlAddAttributeToLayerIemInactive.
 *
 * Inherits from:
 *  - <Geoportal.Control.Form>
 */
Geoportal.Control.AddAttributeToLayer= OpenLayers.Class(Geoportal.Control.Form, {
    /**
     * Property: type
     * {String} The type of <Geoportal.Control.AddAttributeToLayer>
     *     Defaults to *OpenLayers.Control.TYPE_TOGGLE*
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} the controlled layer
     */
    layer: null,

    /**
     * Constructor: Geoportal.Control.AddAttributeToLayer
     * Build a button to add an attribute to a layer's schema and its
     * features.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} layer where to add attributes.
     * options - {Object} any options usefull for control. The
     *      *defaultAttributes* option allows adding default attributes
     *      directly to the layer's schema and its features :
     *      * defaultAttributes - {Object} the keys (attribute name) and
     *      values (default value for this attributes) to be added :
     *
     * (start code)
     *      defaultAttributes: {
     *          'name': {
     *              defaultValue: 'Libellé de l'anomalie',
     *              persistent: true
     *          },
     *          'description': {
     *              defaultValue: 'Aucune',
     *              persistent: true
     *          }
     *      }
     * (end)
     */
    initialize: function(layer, options) {
        if (!options) { options= {}; }
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        if (typeof(this.layer.schema)=='undefined' ||
            !(OpenLayers.Util.isArray(this.layer.schema))) {
            this.layer.schema= [];
        }
        if (options.defaultAttributes) {
            for (var a in options.defaultAttributes) {
                if (typeof(this.layer.schema[a])=='undefined') {
                    var att= { 'attributeName': a };
                    OpenLayers.Util.extend(att,options.defaultAttributes[a]);
                    this.layer.schema.push(att);
                }
            }
        }
        if (this.layer.schema.length>0 && layer.features && layer.features.length>0) {
            for (var i= 0, l= layer.features.length; i<l; i++) {
                var f= layer.features[i];
                for (var i= 0, l= this.layer.schema.length; i<l; i++) {
                    var att= this.layer.schema[i];
                    if (typeof(f.attributes[att.attributeName])=='undefined') {
                        f.attributes[att.attributeName]= att.defaultValue;
                    }
                }
            }
        }
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
     * Do the addition via a form.
     *      The form is as follows :
     *
     * (start code)
     * <form id='__addattlayer__{#Id}' name='__addattlayer__{#Id}' action='javascript:void(null)'>
     * </form>
     * (end)
     *
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        if (!Geoportal.Control.Form.prototype.activate.apply(this,arguments)) {
            return false;
        }
        var f= document.createElement('form');
        f.id= '__addattlayer__' + this.id;
        f.name= f.id;
        f.action= 'javascript:void(null)';
        this.addattlayer(f);
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
     * Method: addattlayer
     * Build the form to add the attribute to the specified layer and its
     * features.
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id='lblattName{#Id}' for='attName{#Id}' style='font-weight:bold;'>{#displayClass}.attName</label>
     * <input id='attName{#Id}' name='attName{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}'/>
     * <br/>
     * <span id='helpattName{#Id}' class='gpFormSmall'>{#displayClass}.attName.help</span>
     * <br/>
     * <label id='lblattDefaultValue{#Id}' for='attDefaultValue{#Id}' style='font-weight:bold;'>{#displayClass}.attDefaultValue</label>
     * <input id='attDefaultValue{#Id}' name='attDefaultValue{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}'/>
     * <br/>
     * <span id='helpattDefaultValue{#Id}' class='gpFormSmall'>{#displayClass}.attDefaultValue.help</span>
     * <br/>
     * <label id='lblattList{#Id}' for='attList{#Id}' style='font-weight:bold;'>{#displayClass}.attList</label>
     * <select id='attList{#Id}' name='attList{#Id}'>
     *      <option value='{#fld.options[].value}' selected='{#fld.options[].selected}'>{#fld.options[].text}</option>
     * </select>
     * <br/>
     * <span id='helpattList{#Id}' class='gpFormSmall'>{#displayClass}.attList.help</span>
     * <br/>
     * <input class='{#displayClass}Button' type='button' id='cancel{#Id}' name='cancel{#Id}'
     *      value='{#displayClass}.button.cancel'/>
     * <input class='{#displayClass}Button' type='button' id='add{#Id}' name='add{#Id}'
     *      value='{#displayClass}.button.addatt'/>
     * <input class='{#displayClass}Button' type='button' id='del{#Id}' name='del{#Id}'
     *      value='{#displayClass}.button.delatt'/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addattlayer: function(form) {
        this.buildInputTextField(form,{
            id:'attName',
            mandatory:true,
            size:20,
            length:20,
            callbacks:[
                {evt:'click',func:this.onClick}
            ],
            value:''});
        this.buildInputTextField(form,{
            id:'attDefaultValue',
            mandatory:false,
            size:40,
            length:40,
            callbacks:[
                {evt:'click',func:this.onClick}
            ],
            value:''});
        this.buildCheckboxField(form,{
                id:'isUrl'
            });
        this.buildSelectField(form,{
            id:'attList',
            length:Math.min(this.layer.schema.length,5),
            multiple:true,
            mandatory:false,
            options:this.listAttributes(),
            callbacks:[
                {evt:'click',func:this.onClick}
            ]});
        this.buildButton(form,'cancel',this.closeForm);
        this.buildButton(form,'addatt',this.onClick,13);//RETURN keycode==13
        this.buildButton(form,'delatt',this.onClick);
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
        if (!evt) evt= window.event;
        var tgt= evt.target || evt.srcElement;
        OpenLayers.Event.stop(evt);
        var es= ['attName', 'attDefaultValue', 'attList'];
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
        if (element.id.match(/^(add|del)att/) && !tgt.id.match(/^cancel/)) {
            if (element.id.match(/^addatt/)) {
                element= OpenLayers.Util.getElement('attName' + this.id);
                var aName= OpenLayers.String.trim(element.value);
                element.value= '';
                if (aName=='') {
                    OpenLayers.Console.userError(OpenLayers.i18n(this.getDisplayClass()+".emptyName"));
                    return false;
                }
                for (var i= 0, l= this.layer.schema.length; i<l; i++) {
                    // attribute already existing ...
                    if (this.layer.schema[i].attributeName===aName) {
                        OpenLayers.Console.userError(OpenLayers.i18n(this.getDisplayClass()+".existingName",{'name':aName}));
                        return false;
                    }
                }
                var att= {};
                att.attributeName= aName;
                element= OpenLayers.Util.getElement('attDefaultValue' + this.id);
                var aDValue= OpenLayers.String.trim(element.value);
                element.value= '';
                element= OpenLayers.Util.getElement('isUrl' + this.id);
                var aIsUrl= element.checked;
                if (aDValue!='') { att.defaultValue= aDValue; }
                if (aIsUrl!='') { att.type = 'link'; }
                element.checked = false;
                this.layer.schema.push(att);
                for (var i= 0, l= this.layer.features.length; i<l; i++) {
                    this.layer.features[i].attributes[aName]= aDValue;
                }
                element= OpenLayers.Util.getElement('attList' + this.id);
                var o= document.createElement('option');
                o.value= aName;
                o.selected= false;
                o.disabled= false;
                o.appendChild(document.createTextNode(aName));
                this.labels[aName]= o;
                element.setAttribute('size', Math.min(this.layer.schema.length,5));
                try {
                    element.add(o, null);
                } catch (e) {
                    element.add(o);//IE !
                }
                //force redraw popups :
                this.forceRedrawPopups();
                return false;
            } else if (element.id.match(/^delatt/)) {
                element= OpenLayers.Util.getElement('attList' + this.id);
                var ad= {};
                for (var i= 0, l= element.options.length; i<l; i++) {
                    var o= element.options[i];
                    if (o.selected) {
                        for (var ii= 0, li= this.layer.schema.length; ii<li; ii++) {
                            var a= this.layer.schema[ii];
                            if (a.attributeName===o.value) {
                                this.layer.schema.splice(ii);
                                ad[o.value]= true;
                                break;
                            }
                        }
                    }
                }
                for (var i= 0, l= this.layer.features.length; i<l; i++) {
                    var f= this.layer.features[i];
                    for (var a in f.attributes) {
                        if (ad[a]===true) {
                            delete(f[a]);
                        }
                    }
                }
                ad= null;
                for (var i= element.options.length-1; i>=0; i--) {
                    var o= element.options[i];
                    if (o.selected) {
                        element.remove(i);
                    }
                }
                element.setAttribute('size', Math.min(this.layer.schema.length,5));
                //force redraw popups :
                this.forceRedrawPopups();
                return false;
            }
            element= OpenLayers.Util.getElement('__addattlayer__' + this.id);
            element.submit();
        }
        this.closeForm();
        return false;
    },

    /**
     * Method: listAttributes
     * List all attribute for the layer.
     *
     * Returns:
     * {Array(Object)} each object has the following structure
     * {value:"",selected:true||false,disabled:true||false,text:""}.
     */
    listAttributes: function() {
        var opts= [];
        for (var i= 0, l= this.layer.schema.length; i<l; i++) {
            var att= this.layer.schema[i];
            var opt= {
                text: att.attributeName,
                value: att.attributeName,
                disabled: att.persistent===true
            };
            opts.push(opt);
        }
        return opts;
    },

    /**
     * Method: forceRedrawPopups
     * Refresh popups and trigger "featureunselected" and "featureselected"
     * events.
     */
    forceRedrawPopups: function() {
       //force redraw popups :
        for (var i= 0, l= this.layer.selectedFeatures.length; i<l; i++) {
            var f= this.layer.selectedFeatures[i];
            //onUnselectCallback(f);
            this.layer.events.triggerEvent("featureunselected", {feature: f});
            //onSelectCallback(f);
            this.layer.events.triggerEvent("featureselected", {feature: f});
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.AddAttributeToLayer"*
     */
    CLASS_NAME: "Geoportal.Control.AddAttributeToLayer"
});
