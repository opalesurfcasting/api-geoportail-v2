/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Floating.js
 */
/**
 * Class: Geoportal.Control.Form
 * Control for handling a HTML form.
 *
 * Inherits from:
 * - <Geoportal.Control>
 */
Geoportal.Control.Form= OpenLayers.Class( Geoportal.Control, {

    /**
     * Property: formControl
     * {Geoportal.Control} the form containing elements for making the control
     * working.
     */
    formControl: null,

    /**
     * Property: labels
     * {HashTable({DOMElement})} List of field labels.
     */
    labels: null,

    /**
     * Property: buttons
     * {HashTable({DOMElement})} List of buttons.
     */
    buttons: null,

    /**
     * Property: htmlElements
     * {HashTable({DomElement})} List of HTML element with observers.
     */
    htmlElements: null,

    /**
     * Constructor: Geoportal.Control.Form
     * Utility control for a HTML form building.
     *
     * Parameters:
     * options - {Object} options to build this control.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     * Clean the control.
     */
    destroy: function() {
        this.formControl= null;
        if (this.map) {
            this.map.events.unregister("controldeleted", this, this.onControlRemoved);
        }
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: setMap
     * Register events and set the map.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register("controldeleted", this, this.onControlRemoved);
    },

    /**
     * Method: onControlRemoved
     * Checks whether the keyboard control has been removed from the map or
     * not.
     *
     * Parameters:
     * evt - {Event} event fired
     *     evt.control holds the almost removed control
     */
    onControlRemoved: function(evt) {
        if (!evt) { return; }
        if (this.formControl) {
            if (this.htmlElements) {
                for (var h in this.htmlElements) {
                    if (this.htmlElements[h] && this.htmlElements[h].kbControl===evt.control) {
                        this.htmlElements[h].kbControl= null;
                    }
                }
            }
        }
    },

    /**
     * Method: activate
     * Build an empty floating form.
     *      Its title is composed of the displayClass concatenated with
     *      '.title'.
     *
     * Returns:
     * {Boolean} True if the control was successfully activated or
     * false if the control was already active.
     */
    activate: function() {
        if (!Geoportal.Control.prototype.activate.apply(this,arguments)) {
            return false;
        }
        this.formControl= new Geoportal.Control.Floating(
            this,
            {
                id: OpenLayers.Util.createUniqueID('_gcf_')+this.id,
                headTitle: this.getDisplayClass()+'.title',
                onClose: this.closeForm,
                onResize: this.resizeForm
            }
        );
        this.labels= {};
        this.buttons= {};
        this.htmlElements= {};
        this.resultDiv= null;
        return true;
    },

    /**
     * APIMethod: deactivate
     * Terminate and clean the form.
     *
     * Returns:
     * {Boolean}  True if the control was successfully deactivated or
     *            false if the control was already inactive.
     */
    deactivate: function() {
        if (this.formControl) {
            if (this.htmlElements) {
                for (var i in this.htmlElements) {
                    OpenLayers.Event.stopObservingElement(this.htmlElements[i]);
                }
            }
            this.htmlElements=null;
            this.buttons= null;
            this.labels= null;
            this.formControl.deactivate();
            this.formControl.destroy();
            this.formControl= null;
            this.resultDiv= null;
        }
        if (!Geoportal.Control.prototype.deactivate.apply(this,arguments)) {
            return false;
        }
        return true;
    },

    /**
     * Method: closeForm
     * Close the floating control and activate the navigation
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    closeForm: function(evt) {
        this.deactivate();
        // Activate KeyboardDefault when leaving :
        var kbControl= this.map.getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
        if (kbControl && kbControl.activeOverMapOnlySavedState) {
            kbControl.activeOverMapOnly= true;
            kbControl.onMouseOver= OpenLayers.Control.KeyboardDefaults.prototype.onMouseOver;
            kbControl.onMouseOut= OpenLayers.Control.KeyboardDefaults.prototype.onMouseOut;
            if (!kbControl.active) {
                kbControl.activate();
            }
        }
        // Activate Navigation by defaut when leaving :
        var ntb= this.map.getControlsByClass(/.*\.Control\.NavToolbar/)[0];
        if (ntb && !ntb.controls[1].active) {
            ntb.activateControl(ntb.controls[0]);
        }
    },

    /**
     * Method: resizeForm
     * Resize the form after the floating control has been resized. Does
     * nothing.
     *      Could be overwritten by sub-classes.
     *
     * Parameters:
     * evt - {Event} the fired event.
     * opts - {Object} Hold information about the control and the selected
     * handle :
     *      * suffix : the name of the handle;
     *      * dx : the last resize on the x axis;
     *      * dy : the last resize on the y axis.
     */
    resizeForm: function(evt,opts) {
        if (evt && opts && this.resultDiv) {
            if (opts.dy!=0 && this.resultDiv) {
                var st= 'max-height';
                var v= OpenLayers.Element.getStyle(this.resultDiv,st);
                if (!v) {
                    st= 'height';
                    v= OpenLayers.Element.getStyle(this.resultDiv,st);
                }
                if (v) {
                    v= parseInt(v);
                    if (opts.suffix.indexOf('t')>=0) {
                        v-= opts.dy;
                    }
                    if (opts.suffix.indexOf('b')>=0) {
                        v+= opts.dy;
                    }
                    this.resultDiv.style[OpenLayers.String.camelize(st)]= v+'px';
                }
            }
        }
    },

    /**
     * APIMethod: buildInputTextField
     * Create an input field with its help.
     *
     * (start code)
     * <label id='lbl{#fld.id}{#Id}' for='{#fld.id}{#Id}' style='font-weight:bold;'>
     *      {#displayClass}.{#fld.id}
     *      <input id='{#fld.id}{#Id}' name='{#fld.name}{#Id}' type='text' value='{#fld.value}'
     *             maxLength='128' size='{#fld.length}' class='{#fld.css}'
     *             hidden='{#fld.hidden}' disabled='{#fld.disabled}'/>
     * </label>
     * <br/>
     * <span id='help{#fld.id}{#Id}' class='gpFormSmall'>{#displayClass}.{#fld.id}.help</span>
     * <br/>
     * (end)
     *
     * in case of textarea :
     *
     * (start code)
     * <label id='lbl{#fld.id}{#Id}' for='{#fld.id}{#Id}' style='font-weight:bold;'>
     *      {#displayClass}.{#fld.id}
     *      <textarea id='{#fld.id}{#Id}' name='{#fld.name}{#Id}' rows='{#fld.rows}'
     *                cols='{#fld.cols}' value='{#fld.value}' class='{#fld.css}'
     *                disabled='{#fld.disabled}'/>
     * </label>
     * <br/>
     * <span id='help{#fld.id}{#Id}' class='gpFormSmall'>{#displayClass}.{#fld.id}.help</span>
     * <br/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the form containing the input text field.
     * fld - {Object} the field definition.
     *      * id - {String} field root to build field id, help, etc ...
     *      The id is suffixed with the control identifier;
     *      * name - {String} field input name;
     *      * type - {String} text || textarea
     *      * size - {Integer} field input text size (default 80);
     *          If -1, no size.
     *      * length - {Integer} field input text maximum length (default 128);
     *          If -1, no maximum length.
     *      * disabled - {Boolean} defaults to false;
     *      * hidden - {Boolean} defaults to false;
     *      * mandatory - {Boolean} true if mandatory (default false);
     *      * rows - {Integer} if type equals textarea (default 5);
     *      * cols - {Integer} if type equals textarea (default 25);
     *      * css - {String} CSS class names (space separated);
     *      * callbacks - Array({object}) functions to call when an event
     *      occurs.
     *          Each object is of the following structure :
     *          {evt:"id",func:function(){}}
     *      * value - {String|Number} possibly the default value to assign.
     * Returns:
     * {DOMElement} the newly created input field.
     */
    buildInputTextField: function(form, fld) {
        var e, npt;

        if (typeof(fld.type)=='undefined' || fld.hidden===true) {
            fld.type= 'text';
        }
        if (!fld.hidden) {
            e= form.ownerDocument.createElement('label');
            e.id= 'lbl'+fld.id+this.id;
            e.setAttribute('for', fld.id+this.id);
            if (fld.mandatory===true) {
                e.style.fontWeight= 'bold';
            }
            this.buildTextNode(e, this.getDisplayClass()+'.'+fld.id);
        }
        if (fld.type==='text') {
            npt= form.ownerDocument.createElement('input');
        } else {
            npt= form.ownerDocument.createElement('textarea');
        }
        npt.id= fld.id+this.id;
        if (fld.name) {
            npt.name= fld.name;
        } else {
            npt.name= npt.id;
        }
        if (fld.type==='text') {
            if (!fld.hidden) {
                npt.type= 'text';
            } else {
                npt.type= 'hidden';
            }
        }
        if (fld.value==undefined) {
            fld.value= '';
        }
        npt.value= fld.value;
        if (fld.size==undefined) {
            fld.size= 80;
        }
        if (fld.type==='text') {
            if (fld.size!=-1) {
                npt.size= fld.size;
            }
            if (fld.length==undefined) {
                fld.length= 128;
            }
            if (fld.length!=-1) {
                npt.maxLength= fld.length;
            }
        } else {
            if (typeof(fld.rows)=='undefined') { fld.rows=  5; }
            if (typeof(fld.cols)=='undefined') { fld.cols= 25; }
            npt.rows= fld.rows;
            npt.cols= fld.cols;
        }
        if (fld.css) {
            npt.className= fld.css;
        }
        npt.disabled= fld.disabled? true:false;
        npt.hasFocus= false;
        if (!fld.hidden) {
            npt.kbControl= this.map.getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
            this.addCallbacks(npt,fld);
            e.appendChild(npt);
            e.appendChild(form.ownerDocument.createElement('br'));

            this.addHelp(e,fld);
            form.appendChild(e);
        } else {
            form.appendChild(npt);
        }

        return npt;
    },

    /**
     * APIMethod: buildInputFileField
     * Create an input file field with its help.
     *
     * (start code)
     * <label id='lbl{#fld.id}{#Id}' for='{#fld.id}{#Id}' style='font-weight:bold;'>
     *      {#displayClass}.{#fld.id}
     *      <input id='{#fld.id}{#Id}' name='{#fld.name}{#Id}' type='file' value='{#fld.value}'
     *             maxLength='131072' size='{#fld.length}' class='{#fld.css}'
     *             disabled='{#fld.disabled}'/>
     * </label>
     * <br/>
     * <span id='help{#fld.id}{#Id}' class='gpFormSmall'>{#displayClass}.{#fld.id}.help</span>
     * <br/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the form containing the input text field.
     * fld - {Object} the field definition.
     *      * id - {String} field root to build field id, help, etc ...
     *      The id is suffixed with the control identifier;
     *      * name - {String} field input name;
     *      * size - {Integer} field input text size (default 80);
     *          If -1, no size.
     *      * length - {Integer} field file maximum size (default 128K);
     *          If -1, no maximum length.
     *      * disabled - {Boolean} defaults to false;
     *      * mandatory - {Boolean} true if mandatory (default false);
     *      * callbacks - Array({object}) functions to call when an event
     *      occurs.
     *          Each object is of the following structure :
     *          {evt:"id",func:function(){}}
     *      * value - {String|Number} possibly the default value to assign.
     * Returns:
     * {DOMElement} the newly created input field.
     */
    buildInputFileField: function(form, fld) {
        var e, npt;

        e= form.ownerDocument.createElement('label');
        e.id= 'lbl'+fld.id+this.id;
        e.setAttribute('for', fld.id+this.id);
        if (fld.mandatory===true) {
            e.style.fontWeight= 'bold';
        }
        this.buildTextNode(e, this.getDisplayClass()+'.'+fld.id);
        npt= form.ownerDocument.createElement('input');
        npt.id= fld.id+this.id;
        if (fld.name) {
            npt.name= fld.name;
        } else {
            npt.name= npt.id;
        }
        npt.type= 'file';
        if (fld.value==undefined) {
            fld.value= '';
        }
        npt.value= fld.value;
        if (fld.size==undefined) {
            fld.size= 80;
        }
        if (fld.size!=-1) {
            npt.size= fld.size;
        }
        if (fld.length==undefined) {
            fld.length= 131072;
        }
        if (fld.length!=-1) {
            npt.maxLength= fld.length;
        }
        if (fld.css) {
            npt.className= fld.css;
        }
        npt.disabled= fld.disabled? true:false;
        npt.hasFocus= false;
        npt.kbControl= this.map.getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
        this.addCallbacks(npt,fld);
        e.appendChild(npt);
        e.appendChild(form.ownerDocument.createElement('br'));

        this.addHelp(e,fld);
        form.appendChild(e);

        return npt;
    },

    /**
     * APIMethod: buildSelectField
     * Create a select field with its help.
     *
     * (start code)
     * <label id='lbl{#fld.id}{#Id}' for='{#fld.id}{#Id}' style='font-weight:bold;'>
     *      {#displayClass}.{#fld.id}
     *      <select id='{#fld.id}{#Id}' name='{#fld.name}{#Id}' class='{#fld.css}'>
     *          <option value='{#fld.options[].value}' selected='{#fld.options[].selected}' class='{#fld.css}'>{#fld.options[].text}</option>
     *      </select>
     * </label>
     * <br/>
     * <span id='help{#fld.id}{#Id}' class='gpFormSmall'>{#displayClass}.{#fld.id}.help</span>
     * <br/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the form containing the select field.
     * fld - {Object} the field definition.
     *      * id - {String} field root to build field id, help, etc ...
     *      The id is suffixed with the control identifier;
     *      * name - {String} field input name;
     *      * length - {Integer} displayed options number. Defaults to *1* ;
     *      * multiple - {Boolean} allow several selection when true. Defaults to *false* ;
     *      * options - {Array({Object}) options of the select.
     *              Each option is of the following structure :
     *              {value:"",selected:true||false,disabled:true||false,text:"",css:""}
     *      * mandatory - {Boolean} true if mandatory (default false);
     *      * css - {String} CSS class names (space separated);
     *      * callbacks - Array({object}) functions to call when an event
     *      occurs.
     *          Each object is of the following structure :
     *          {evt:"id",func:function(){}}
     * Returns:
     * {DOMElement} the newly created select field.
     */
    buildSelectField: function(form, fld) {
        var e, npt;

        e= form.ownerDocument.createElement('label');
        e.id= 'lbl'+fld.id+this.id;
        e.setAttribute('for', fld.id+this.id);
        if (fld.mandatory===true) {
            e.style.fontWeight= 'bold';
        }
        this.buildTextNode(e, this.getDisplayClass()+'.'+fld.id);
        npt= form.ownerDocument.createElement('select');
        npt.id= fld.id+this.id;
        if (fld.name) {
            npt.name= fld.name;
        } else {
            npt.name= npt.id;
        }
        npt.size= fld.length? fld.length : 1;
        if (fld.options && fld.options.length>0) {
            for (var i= 0, len= fld.options.length; i<len; i++) {
                var o= form.ownerDocument.createElement('option');
                o.value= fld.options[i].value;
                o.selected= fld.options[i].selected===true? true:false;
                o.disabled= fld.options[i].disabled===true? true:false;
                if (fld.options[i].css) { o.className= fld.options[i].css; }
                this.buildTextNode(o, fld.options[i].text);
                npt.appendChild(o);
            }
        }
        if (fld.multiple) {
            npt.multiple= 'multiple';
        }
        if (fld.css) {
            npt.className= fld.css;
        }
        npt.hasFocus= false;
        npt.kbControl= this.map.getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
        this.addCallbacks(npt,fld);
        e.appendChild(npt);
        e.appendChild(form.ownerDocument.createElement('br'));

        this.addHelp(e,fld);
        form.appendChild(e);

        return npt;
    },

    /**
     * APIMethod: buildCheckboxField
     * Create a checkbox field with its help.
     *
     * (start code)
     * <label id='lbl{#fld.id}{#Id}' for='{#fld.id}{#Id}'>
     *      {#displayClass}.{#fld.id}
     *      <input id='{#fld.id}{#Id}' name='{#fld.name}{#Id}' type='checkbox' value='{#fld.name}{#Id}'
     *             disabled='{#fld.disabled}' checked='{#fld.checked}' defaultChecked='{#fld.checked}'
     *             style='autocomplete:off;' />
     * </label>
     * <br/>
     * <span id='help{#fld.id}{#Id}' class='gpFormSmall'>{#displayClass}.{#fld.id}.help</span>
     * <br/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the form containing the input text field.
     * fld - {Object} the field definition.
     *      * id - {String} field root to build field id, help, etc ...
     *      The id is suffixed with the control identifier;
     *      * name - {String} field input name;
     *      * disabled - {Boolean} defaults to false;
     *      * checked - {Boolean} defaults to false;
     *      * defaultChecked - {Boolean} defaults to false;
     *      * css - {String} CSS class names (space separated);
     *      * callbacks - Array({object}) functions to call when an event
     *      occurs.
     *          Each object is of the following structure :
     *          {evt:"id",func:function(){}}
     * Returns:
     * {DOMElement} the newly created checkbox field.
     */
    buildCheckboxField: function(form, fld) {
        var e, npt;

        e= form.ownerDocument.createElement('label');
        e.id= 'lbl'+fld.id+this.id;
        e.setAttribute('for', fld.id+this.id);
        this.buildTextNode(e, this.getDisplayClass()+'.'+fld.id);
        npt= form.ownerDocument.createElement('input');
        npt.id= fld.id+this.id;
        if (fld.name) {
            npt.name= fld.name;
        } else {
            npt.name= npt.id;
        }
        npt.value= npt.id;
        npt.type= 'checkbox';
        npt.disabled= fld.disabled? true:false;
        npt.checked= fld.checked? true:false;
        npt.defaultChecked= fld.defaultChecked? true:false;
        npt.style.autocomplete= 'off';
        if (fld.css) {
            npt.className= fld.css;
        }
        this.addCallbacks(npt,fld);
        e.appendChild(npt);
        e.appendChild(form.ownerDocument.createElement('br'));

        this.addHelp(e,fld);
        form.appendChild(e);

        return npt;
    },

    /**
     * APIMethod: buildRadioFields
     * Create a group of radio fields with its help.
     *
     *  (start code)
     *  <fieldset>
     *      <legend align='{#fld.align}'>
     *          {#displayClass}.{#fld.id}
     *      </legend>
     *      <input id='{#fld.radios[i].id}{#Id}' name='{#fld.name}{#Id}' type='radio'
     *             value='{#fld.radios[i].name}{#Id}' disabled='{#fld.radios[i].disabled}'
     *             checked='{#fld.radios[i].checked}' style='autocomplete:off;'/>
     *      <label id='lbl{#fld.radios[i].id}{#Id}' for='{#fld.radios[i].id}{#Id}'>
     *          {#displayClass}.{#fld.radios[i].id}
     *      </label>
     *      <br/>
     *      <span id='help{#fld.id}{#Id}' class='gpFormSmall'>{#displayClass}.{#fld.id}.help</span>
     *      <br/>
     * </fieldset>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the form containing the input text field.
     * fld - {Object} the field definition.
     *      * id - {String} field root to build field id, help, etc ...
     *      The id is suffixed with the control identifier;
     *      * name - {String} field input name;
     *      * align - {String} "left", "center", "right";
     *      * radio - {Array({Object})} radio information.
     *          * id - {String} field root to build field id, help, etc ...
     *          The id is suffixed with the control identifier;
     *          * disabled - {Boolean} defaults to false;
     *          * checked - {Boolean} defaults to false;
     *          * css - {String} CSS class names (space separated);
     *          * callbacks - Array({object}) functions to call when an event
     *          occurs.
     *              Each object is of the following structure :
     *              {evt:"id",func:function(){}}
     * Returns:
     * {DOMElement} the newly created checkbox field.
     */
    buildRadioFields: function(form, fld) {
        var g, e, npt;

        g= form.ownerDocument.createElement('fieldset');
        g.className= this.getDisplayClass()+'RadioGroup';
        e= form.ownerDocument.createElement('legend');
        e.align= fld.align || 'left';
        this.buildTextNode(e, this.getDisplayClass()+'.'+fld.id);
        g.appendChild(e);

        for (var i= 0, l= fld.radios.length; i<l; i++) {
            var r= fld.radios[i];
            npt= form.ownerDocument.createElement('input');
            npt.id= r.id+this.id;
            if (fld.name) {
                npt.name= fld.name;
            } else {
                npt.name= fld.id+this.id ;
            }
            npt.value= npt.id;
            npt.type= 'radio';
            npt.disabled= r.disabled? true:false;
            npt.checked= r.checked? true:false;
            npt.style.autocomplete= 'off';
            if (r.css) {
                npt.className= r.css;
            }
            this.addCallbacks(npt,r);
            g.appendChild(npt);
            e= form.ownerDocument.createElement('label');
            e.id= 'lbl'+r.id+this.id;
            e.setAttribute('for', npt.id);
            this.buildTextNode(e, this.getDisplayClass()+'.'+r.id);
            g.appendChild(e);
            g.appendChild(form.ownerDocument.createElement('br'));
            this.addHelp(g,r);
        }
        form.appendChild(g);

        return g;
    },

    /**
     * Method: buildTextNode
     * Create a text node.
     *
     * Parameters:
     * e - {DOMElement} the parentNode where to insert the text node.
     * k - {String} the i18n key of the text.
     *
     * Returns:
     * {DOMElement} the newly built text node.
     */
    buildTextNode: function(e, k) {
        var t= e.ownerDocument.createTextNode(OpenLayers.String.trim(OpenLayers.i18n(k)));
        this.labels[k]= e;
        e.appendChild(t);
    },

    /**
     * Method: addCallbacks
     * Add event listeners on the form's field.
     *
     * Parameters:
     * npt - {DOMElement} the form's field.
     * fld - {Object} the field definition.
     *
     */
    addCallbacks: function(npt, fld) {
        if (fld.callbacks && fld.callbacks.length>0) {
            for (var i= 0, len= fld.callbacks.length; i<len; i++) {
                OpenLayers.Event.observe(
                    npt,
                    fld.callbacks[i].evt,
                    OpenLayers.Function.bind(fld.callbacks[i].func,this,npt)
                );
                this.htmlElements[fld.callbacks[i].evt+fld.id+this.id]= npt;
            }
        }
    },

    /**
     * Method: addHelp
     * Add help information to a form's field.
     *
     * (start code)
     * <span id='help{#fld.id}{#Id}' class='gpFormSmall'>{#displayClass}.{#fld.id}.help</span>
     * <br/>
     * (end)
     *
     * Parameters:
     * elt - {DOMElement} the element that will contain the help text.
     * fld - {Object} the field definition.
     *
     * Returns:
     * {DOMElement} the help element.
     */
    addHelp: function(elt, fld) {
        var e= elt.ownerDocument.createElement('span');
        e.id= 'help'+fld.id+this.id;
        e.className= 'gpFormSmall';
        this.buildTextNode(e, this.getDisplayClass()+'.'+fld.id+'.help');
        elt.appendChild(e);
        elt.appendChild(elt.ownerDocument.createElement('br'));

        return e;
    },

    /**
     * APIMethod: buildButton
     * Create HTML buttons.
     *
     * (start code)
     * <input class='{#displayClass}Button' type='button' id='{#fld.label}{#Id}' name='{#fld.label}{#Id}'
     *        value='{#displayClass}.button.{#fld.label}'/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the form containing the input field.
     * label - {String} the action label.
     *      Used to compose the identifier and value.
     * buttonCb - {Function} the function to call when the button is hit.
     * key - {Integer} optional,  key code associated with this button.
     *
     * Returns:
     * {DOMElement} the new created button.
     */
    buildButton: function(form,label,buttonCb,key) {
        var e;

        e= form.ownerDocument.createElement('input');
        e.className= this.getDisplayClass()+'Button';
        e.type= 'button';
        e.id= label+this.id;
        e.name= e.id;
        e.value= OpenLayers.i18n(this.getDisplayClass()+'.button.'+label);
        if (buttonCb) {
            OpenLayers.Event.observe(
                e,
                "click",
                OpenLayers.Function.bind(buttonCb,this,e)
            );
            this.htmlElements['click'+label+this.id]= e;
        }
        this.buttons[this.getDisplayClass()+'.button.'+label]= e;
        form.appendChild(e);
        if (buttonCb && key) {
            //FIXME: helpers observe/stopObserving to allow external
            //interactions ?
            OpenLayers.Event.observe(
                form,
                "keypress",
                OpenLayers.Function.bind(function(evt) {
                    if (evt.keyCode==key || (key==13 && evt.keyCode==10)) {
                        return buttonCb.apply(this,[e,evt]);
                    }
                    return true;
                },this)
            );
        }

        return e;
    },

    /**
     * APIMethod: buildImageButton
     * Create image buttons.
     *
     * (start code)
     * <input class='{#displayClass}ImageButton' type='image' id='{#fld.label}{#Id}' name='{#fld.label}{#Id}'
     *        alt='{#displayClass}.button.{#fld.label}' title='{#displayClass}.button.{#fld.label}'
     *        src={#url}' />
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the form containing the input field.
     * url - {String} the image URL. 
     *    A null value means that the image is handled by CSS.
     * label - {String} the action label.
     *      Used to compose the identifier and value.
     * buttonCb - {Function} the function to call when the button is hit.
     *
     * Returns:
     * {DOMElement} the new created button.
     */
    buildImageButton: function(form,label,url,buttonCb) {
        var e;

        e= form.ownerDocument.createElement('input');
        e.className= this.getDisplayClass()+'ImageButton';
        e.type= 'image';
        e.id= label+this.id;
        e.name= e.id;
        if (url) {
            e.src= url;
        }
        e.title= OpenLayers.i18n(this.getDisplayClass()+'.imageButton.'+label);
        e.alt= e.title;
        if (buttonCb) {
            OpenLayers.Event.observe(
                e,
                "click",
                OpenLayers.Function.bind(buttonCb,this,e)
            );
            this.htmlElements['click'+label+this.id]= e;
        }
        this.buttons[this.getDisplayClass()+'.imageButton.'+label]= e;
        form.appendChild(e);

        return e;
    },

    /**
     * APIMethod: buildResultsField
     * Create the empty div for writing results.
     *
     * (start code)
     * <div class='{#displayClass}Results' id='results{#Id}' name='results{#Id}' style='display:none;'></div>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the form containing the input field.
     */
    buildResultsField: function(form) {
        if (!this.resultDiv) {
            this.resultDiv= form.ownerDocument.createElement('div');
            this.resultDiv.className= this.getDisplayClass()+'Results';
            this.resultDiv.id= 'results'+this.id;
            this.resultDiv.style.display= 'none';
            this.resultDiv.innerHTML= '';
            form.appendChild(this.resultDiv);
        }
    },

    /**
     * APIMethod: changeLang
     * Assign the current language.
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.getTitle()) {
            this.div.title= OpenLayers.i18n(this.getTitle());
        }
        if (this.formControl) {
            if (this.labels) {
                for (var l in this.labels) {
                    if (this.labels[l]) {
                        this.labels[l].childNodes[0].nodeValue= OpenLayers.i18n(l);
                    }
                }
            }
            if (this.buttons) {
                for (var l in this.buttons) {
                    if (this.buttons[l]) {
                        if (this.buttons[l].type=='image') {
                            this.buttons[l].alt= this.buttons[l].title= OpenLayers.i18n(l);
                        } else {
                            this.buttons[l].value= OpenLayers.i18n(l);
                        }
                    }
                }
            }
        }
    },

    /**
     * APIMethod: disableNavigation
     * Callback when the mouse is down : disable map's drag through
     * OpenLayers.Control.Navigation.
     *  FIXME : dblclick too ?
     *
     * Parameters:
     * evt - {Event}
     */
    disableNavigation: function(evt) {
        var navCntrls= this.map.getControlsByClass('OpenLayers.Control.Navigation');
        if (navCntrls && navCntrls.length>0) {
            navCntrls[0].deactivate();
        }
    },

    /**
     * APIMethod: enableNavigation
     * Callback when the mouse is up : enable map's drag through
     * OpenLayers.Control.Navigation.
     *  FIXME : dblclick too ?
     *
     * Parameters:
     * evt - {Event}
     */
    enableNavigation: function(evt) {
        var navCntrls= this.map.getControlsByClass('OpenLayers.Control.Navigation');
        if (navCntrls && navCntrls.length>0) {
            navCntrls[0].activate();
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Form"*
     */
    CLASS_NAME:"Geoportal.Control.Form"
});

/**
 * APIFunction: Geoportal.Control.Form.focusOn
 * Gain focus on a form input.
 *
 * Parameters:
 * e - {DOMElement} the element gaining the focus.
 */
Geoportal.Control.Form.focusOn= function(e) {
    if (e.kbControl) {
        if (e.kbControl.activeOverMapOnly && !e.kbControl.outsideViewport) {
            e.kbControl.activeOverMapOnlySavedState= true;
            e.kbControl.activeOverMapOnly= false;
            e.kbControl.onMouseOver= e.kbControl.onMouseOut= function(){};
            if (e.kbControl.active) {
                e.kbControl.deactivate();
            }
        }
    }
    e.hasFocus= true;
    e.focus();
};

/**
 * APIFunction: Geoportal.Control.Form.focusOff
 * Lost focus on a form input.
 *
 * Parameters:
 * e - {DOMElement} the element loosing the focus.
 */
Geoportal.Control.Form.focusOff= function(e) {
    if (e.kbControl) {
        if (e.kbControl.activeOverMapOnlySavedState) {
            e.kbControl.activeOverMapOnly= true;
            e.kbControl.onMouseOver= OpenLayers.Control.KeyboardDefaults.prototype.onMouseOver;
            e.kbControl.onMouseOut= OpenLayers.Control.KeyboardDefaults.prototype.onMouseOut;
            if (!e.kbControl.active) {
                e.kbControl.activate();
            }
        }
    }
    e.hasFocus= false;
    e.blur();
};
