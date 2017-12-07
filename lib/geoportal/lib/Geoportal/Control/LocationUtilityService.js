/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Form.js
 * @requires Geoportal/Layer/OpenLS/Core/LocationUtilityService.js
 * @requires Geoportal/OLS/Address.js
 * @requires Geoportal/OLS/StreetAddress.js
 * @requires Geoportal/OLS/Street.js
 * @requires Geoportal/OLS/PostalCode.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.LocationUtilityService
 * Control for talking with an OpenLS Location Utility service. This is an
 * abstract class, see <Geoportal.Control.LocationUtilityService.GeoNames>,
 * <Geoportal.Control.LocationUtilityService.Geocode>,
 * <Geoportal.Control.LocationUtilityService.CadrastralParcel>,
 * <Geoportal.Control.LocationUtilityService.GeodeticFixedPoint> and
 * <Geoportal.Control.LocationUtilityService.ReverseGeocode> for
 * implementation classes.
 *
 * Inherits from:
 * - <Geoportal.Control.Form>
 */
Geoportal.Control.LocationUtilityService= OpenLayers.Class( Geoportal.Control.Form, {

    /**
     * Property: type
     * {String} The type of <OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>
     *     Defaults to *OpenLayers.Control.TYPE_TOGGLE*
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} The layer holding the searched locations.
     */
    layer: null,

    /**
     * APIProperty: matchTypes
     * {Array({Object})} Table of (regular expression, image source).
     *      The regular expression is matched versus the *matchType* property of
     *      the <Geoportal.OLS.LUS.GeocodeMatchCode> object.
     *      If the regular expression is null, then the source is directly
     *      used.
     *      The table can be null or empty.
     *
     * (start code)
     * [
     *      { re: /cross/i,   src: 'img/CrossRoads.png' },
     *      { re: /address/i, src: 'img/Number.png' },
     *      { re: null,       src: 'img/Street.png' }
     * ]
     * (end)
     */
    matchTypes: null,

    /**
     * APIProperty: drawLocation
     * {Boolean} Draw result when clicking on result.
     *      Defaults to *true*
     */
    drawLocation: true,

    /**
     * APIProperty: fields
     * {Object} Root names of cancel button (c), submit button (s).
     * Defaults to *{'c':'cancel','s':'search','w':'wait','f0':'extent','f1':territory','f2':'region','f3':'department'}*
     *
     */
    fields: {
        'c':'cancel',
        's':'search',
        'w':'wait',
        'f0':'extent',
        'f1':'territory',
        'f2':'region',
        'f3':'department'
    },

    /**
     * APIProperty: filtersOptions
     * {Boolean} whether or not add filters to this control.
     * Defaults to *null*
     */
    filtersOptions: null,

    /**
     * Property: inputs
     * {Object} List of input fields used by this controls.
     */
    inputs: null,

    /**
     * Property: buttons
     * {Object} List of buttons used by this controls.
     */
    buttons: null,

    /**
     * APIProperty: onSelectLocation
     * {Function} Optional function to be called when the location has been
     * received and located on the map.
     *      The function should expect to be called with a feature.
     */
    onSelectLocation: function(f) {},

    /**
     * APIProperty: countryCode
     * {String} comma-separated codes to specify the reference table used to geocode an address.
     *  See {<Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST>},
     *  {<Geoportal.Control.LocationUtilityService.STREETADDRESS>},
     *  {<Geoportal.Control.LocationUtilityService.CADASTRALPARCEL>},
     *  {<Geoportal.Control.LocationUtilityService.GEODETICFIXEDPOINT>} for
     *  available values.
     *  Defaults to *''*.
     */
    countryCode: '',

    /**
     * APIProperty: allowSearchType
     * extend search countrycode...
     */
    allowSearchType: false,
    
    /**
     * APIProperty: setZoom
     * Returns the zoom from the <Geoportal.OLS.Address> object.
     *      Expect a feature parameter that holds search results.
     *      Defaults to map's current zoom level.
     */
    setZoom: function(f) { return this.map.getZoom(); },

    /**
     * APIProperty: keepFeature
     * {Function} Check whether or not the feature is kept for displaying.
     *      Expect a parameter of type {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     *      returned by the OpenLS service. Defaults to return 1 if the parameter is
     *      not null, 0 otherwise.
     *      If returns -1, no remaining features are processed.
     *      If returns  0, the given feature is skipped.
     *      Otherwise, the feature is kept.
     */
    keepFeature: function(f) { return f? 1:0; },

    /**
     * Property: lusVl
     * {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} The layer holding geocoding
     * location (to display vector features representing the center of reverse geocoding or circle filter or rectangle filter).
     */
    lusVl: null,

    /**
     * Constructor: Geoportal.Control.LocationUtilityService
     * Build a button for searching an OpenLS Location Utility service.
     *
     * Parameters:
     * layer - {<Geoportal.Layer.OpenLS.Core.LocationUtilityService | Object>}
     * the layer to control or options to build this control. In the latter
     * case, this parameter holds a 'layer' option.
     * options - {Object} optional options to build this control.
     *      Amongst possible value, on can find :
     *      * reverseOptions - {Object} options used for the reverse location
     *      controls See {<Geoportal.Control.LocationUtilityService.ReverseGeocode>}.
     *      * autocompleteOptions - {Object} if not null, activates 
     *      autocompletion control
     *      * filtersOptions - {Object} adds filter fields to LUS control, 
     *      only if autocompleteOptions is null. 
     */
    initialize: function(layer, options) {
        if (!options && !(layer instanceof OpenLayers.Layer)) {
            options= layer;
            layer= options.layer;
            delete options.layer;
        }
        Geoportal.Control.Form.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        this.inputs= {};
        this.buttons= {};
        if (this.autoCompleteOptions && !Geoportal.Control.AutoComplete) {
            this.autoCompleteOptions= null;
        }

        if (this.autoCompleteOptions) {
            this.filtersOptions= null;
        }
    },

    /**
     * APIMethod: destroy
     * Clean the control.
     */
    destroy: function() {
        if (this.map) {
            if (this.layer && this.layer.map) {
                this.map.removeLayer(this.layer);
            }
            this.map= null;
        }
        this.buttons= null;
        this.inputs= null;
        if (this.layer) {
            this.layer.destroy();
            this.layer= null;
        }
        Geoportal.Control.Form.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: activate
     * Add the form to query locations and install the callback for getting
     * responses back.
     *      The form is as follows :
     *
     * (start code)
     * <form id='__searchlus__{#Id}' name='__searchlus__{#Id}' action='javascript:void(null)'>
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
        this.layer.selectCntrl.deactivate();
        this.layer.destroyFeatures();
        var f= this.div.ownerDocument.createElement('form');
        f.id= '__searchlus__' + this.id;
        f.name= f.id;
        f.action= 'javascript:void(null)';
        this.loadContent(f);
        this.map.addControl(this.formControl);
        this.formControl.activate();
        this.formControl.addContent(f);
        // addLayer to map now cause we are sure that the map's size is now
        // known : See OpenLayers.Layer.Vector.setMap() that uses the map's
        // getSize() method !
        if (!this.layer.map) {
            this.map.addLayer(this.layer);
        }
        this.initFocus();
        this.addAutoCompleteControl();
        return true;
    },

    /**
     * APIMethod: initFocus
     * Initialize the focus of an input field in the form.
     * To be overwritten by sub-classes.
     */
    initFocus: function() {
    },

    /**
     * Method: addAutoCompleteControl
     * Add the autoComplete control to the map and update its position when form is dragged.
     */
    addAutoCompleteControl: function() {
        if (this.autoCompleteControl) {
            this.map.addControl(this.autoCompleteControl);
            this.formControl.onDrag= OpenLayers.Function.bind(this.autoCompleteControl.updateAutoCompleteListPosition, this.autoCompleteControl);
        }
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
        if (this.rectangleControl) {
            this.rectangleControl.deactivate();
            this.map.removeControl(this.rectangleControl);
            this.rectangleControl= null;
        }
        if (this.lusVl) {
            var cntrl= this.lusVl.slctCntrl;
            cntrl.deactivate();
            this.map.removeControl(cntrl);
            this.lusVl.slctCntrl= null;
            cntrl= this.lusVl.dragCntrl;
            cntrl.deactivate();
            this.map.removeControl(cntrl);
            this.lusVl.dragCntrl= null;
            this.lusVl.destroyFeatures();
            this.map.removeLayer(this.lusVl);
            this.lusVl= null;
        }
        this.layer.cleanQueries();
        if (this.autoCompleteControl) {
            this.autoCompleteControl.destroy();
        }
        return Geoportal.Control.Form.prototype.deactivate.apply(this,arguments);
    },

    /**
     * Method: loadContent
     * Build the form, send the request and display results.
     *      Sub-classes need to fill the form's content.
     *      The form's structure must end with the following content :
     *
     * (start code)
     * <input class='{#displayClass}Button' type='button' id='cancel{#Id}' name='cancel{#Id}'
     *      value='{#displayClass}.button.cancel'/>
     * <input class='{#displayClass}Button' type='button' id='search{#Id}' name='search{#Id}'
     *      value='{#displayClass}.button.search'/>
     * <input class='{#displayClass}Image' type='image' id='wait{#Id}' name='wait{#Id}'
     *      alt='{#displayClass}.imageButton.wait' title='{#displayClass}.imageButton.wait'
     *      src='{#geoportal.img}loading.gif' style="display:none;'/>
     * <div class='{#displayClass}Results' id='results{#Id}' name='results{#Id}' style='display:none;'></div>
     * (end)
     *
     *      To do so, it is advised to write sub-classes loadContent method as :
     *
     * (start code)
     *  loadContent: function(form) {
     *      //fill appropriate content
     *      Geoportal.Control.LocationUtilityService.prototype.loadContent.apply(this,arguments);
     *  }
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    loadContent: function(form) {
        this.addAutoCompletion();
        this.addFilters(form);
        if (this.fields.c) {
            this.buttons[this.fields.c]= this.buildButton(form,this.fields.c,this.closeForm);
        }
        if (this.fields.s) {
            this.buttons[this.fields.s]= this.buildButton(form,this.fields.s,this.onSearchClick,13);//RETURN keycode==13
        }
        if (this.fields.w) {
        	this.wImg= this.buildImageButton(form,'wait',null);
            this.wImg.alt = '';
        }
        if (this.wImg) {
            this.wImg.style.display= 'none';
        }
        this.buildResultsField(form);//now this.resultDiv is set!
        this.addLUSVectorLayer();
        //this.enableNavigation();
    },

    /**
     * Method: addAutoCompletion
     * Build the {<Geoportal.Control.AutoComplete>} control if necessary.
     */
    addAutoCompletion: function() {
        if (this.autoCompleteOptions) {
            if (!this.autoCompleteOptions.url) {
                this.autoCompleteOptions.url= this.getAutoCompleteUrl();
            }
            if (!this.autoCompleteOptions.type) {
                this.autoCompleteOptions.type= this.countryCode;
            }
            if (!this.autoCompleteOptions.onResultClick) {
                this.autoCompleteOptions.onResultClick= OpenLayers.Function.bind(this.geocode,this);
            }
            if (this.autoCompleteOptions.inputText) {
                this.autoCompleteControl= new Geoportal.Control.AutoComplete(
                    this.autoCompleteOptions.inputText,
                    this.autoCompleteOptions
                );
            }
        }
    },

    /**
     * Method: addFilters
     * Add filters to the form.
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addFilters: function(form) {
        if (this.filtersOptions===null) { return ; }
        var opts= [], geoFilters= ['','Map','Manual'];
        for (var i= 0, len= geoFilters.length; i<len; i++) {
            var o= {
                value: geoFilters[i],
                selected: (i==0),
                text: (geoFilters[i]==''? '' : this.getDisplayClass()+'.extent.'+geoFilters[i])
            };
            opts.push(o);
        }
        this.inputs[this.fields.f0]= this.buildSelectField(form,{
            id:this.fields.f0,
            options:opts,
            callbacks:[
                {evt:'change',func:this.onChangeGeoFilter}
            ]});
        opts= [{value:'',text:'',selected:true}];
        for (var t in Geoportal.Catalogue.TERRITORIES) {
            switch(t) {
            case "EUE":
            case "WLD":
            case "ASP":
            case "ATF":
                break;
            default   :
                break;
            }
            var o= {
                value: t,
                text: t
            };
            opts.push(o);
        }
        this.inputs[this.fields.f1]= this.buildSelectField(form,{
            id:this.fields.f1,
            options:opts,
            callbacks:[
                {evt:'change',func:this.onChangeTerritory}
            ]});
        opts= [{value:'',text:'',selected:true}];
        var regions= Geoportal.Catalogue.REGIONS;
        for (var region in regions) {
            var o= {
                value: regions[region].code,
                text: region
            };
            opts.push(o);
        }
        this.inputs[this.fields.f2]= this.buildSelectField(form,{
            id:this.fields.f2,
            options:opts,
            callbacks:[
                {evt:'change',func:this.onChangeRegion}
            ]});
        opts= [{value:'',text:'',selected:true}];
        var depts= Geoportal.Catalogue.DEPARTMENTS;
        for (var dept in depts) {
            var o= {
                value: depts[dept].code,
                text: dept + ' ('+depts[dept].code+')'
            };
            opts.push(o);
        }
        this.inputs[this.fields.f3]= this.buildSelectField(form,{
            id:this.fields.f3,
            options:opts,
            callbacks:[
                {evt:'change',func:this.onChangeDept}
            ]});
    },

    /**
     * Method: getAutoCompleteUrl
     * Get the autocomplete Url
     * 
     * Returns:
     * {String}  Url for autocomplete.
     */
    getAutoCompleteUrl: function(){
        var autoCompleteUrl= null;
        if (this.map && this.map.apiKey && this.map.catalogue && this.layer) {
            var k;
            for (var i= 0, l= this.map.apiKey.length; i<l; i++) {
                k= this.map.apiKey[i];
                if (this.map.catalogue[k].layers[this.layer.name]) {
                    var service= this.countryCode.split(',').shift()+':'+Geoportal.Control.AutoComplete.SERVICE_ID;
                    service= this.map.catalogue[k].layers[service];
                    if (service) {
                        autoCompleteUrl= service.url;
                    }
                    break;
                }
            }
        }
        return autoCompleteUrl;
    },

    /**
     * Method: closeForm
     * Close the floating control and activate the navigation
     */
    closeForm: function() {
        this.layer.abortRequest();
        Geoportal.Control.Form.prototype.closeForm.apply(this, arguments);
    },

    /**
     * Method: resizeForm
     * Resize the form after the floating control has been resized. Resize and update the position of
     * the autocomplete list.
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
        Geoportal.Control.Form.prototype.resizeForm.apply(this,arguments);
        if (this.autoCompleteControl) {
            this.autoCompleteControl.updateAutoCompleteListPosition();
        }
    },

    /**
     * Method: addLUSVectorLayer
     * Initialize and add a vector layer for locating the longitude/latitude
     * (filtering) or restricting the research to a circle or a rectangle
     * (reverse geocoding).
     *
     * Parameters:
     * options - {Object}
     *
     * Returns:
     * {<OpenLayers.Layer.Vector>} the support layer (also known as lusVl
     * property).
     */
    addLUSVectorLayer: function(options) {
        options= options || {};
        this.lusVl= new OpenLayers.Layer.Vector(
            '__rvgc_LL__', {
                projection: this.map.getProjection(),
                //FIXME: options ?
                styleMap: new OpenLayers.StyleMap(
                            new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                fillColor:"#99CCFF",
                                strokeColor:"#99CCFF"
                            }, OpenLayers.Feature.Vector.style["default"]))),
                eventListeners: {
                    beforefeaturesadded: function() {
                        this.destroyFeatures();
                        return true;
                    },
                    featureadded: function(object) {
                        object.feature.state= OpenLayers.State.INSERT;
                        return true;
                    }
                },
                displayInLayerSwitcher:false
            });
        Geoportal.Layer.OpenLS.Core.LocationUtilityService.prototype.applyStyles.apply(this.lusVl, [options]);
        this.map.addLayer(this.lusVl);

        // selecting control :
        var rvgcselectCntrl= new OpenLayers.Control.SelectFeature(
            this.lusVl, {
                multiple: false,
                hover: true,
                onSelect: function(feature) {
                    this.layer.dragCntrl.activate();
                },
                onUnselect: function(feature) {
                    this.layer.dragCntrl.deactivate();
                }
            });
        this.map.addControl(rvgcselectCntrl);

        // dragging control :
        var rvgcdragCntrl= new OpenLayers.Control.DragFeature(
            this.lusVl, {
                onDrag: OpenLayers.Function.bind(this.updateLLForm,this),
                onComplete: OpenLayers.Function.bind(this.updateLLForm,this)
            });
        this.map.addControl(rvgcdragCntrl);

        this.lusVl.slctCntrl= rvgcselectCntrl;
        this.lusVl.dragCntrl= rvgcdragCntrl;
        return this.lusVl;
    },

    /**
     * Method: onChangeGeoFilter
     * An option of the geographic filter select (restrict to map extent or to an extent manually drawn) has been selected.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     */
    onChangeGeoFilter: function(element,evt) {
        this.lusVl.destroyFeatures();
        switch (element.value) {
            case '':
            case 'Map':
                if (this.rectangleControl) {
                    this.rectangleControl.deactivate();
                }
                this.lusVl.slctCntrl.deactivate();
                break;
            case 'Manual':
                if (!this.rectangleControl) {
                    // FIXME: OpenLayers.Control.DragFeature#moveFeature en
                    // erreur this.feature.geometry ou this.onDrag ?
                    // TODO: détruire le rectangle dés le prochain mousedown ...
                    this.rectangleControl= new OpenLayers.Control.DrawFeature(
                        this.lusVl,
                        OpenLayers.Handler.RegularPolygon, {
                            handlerOptions: {
                                // sides: 4, /* default value */
                                irregular: true
                            }
                        });
                    this.map.addControl(this.rectangleControl);
                }
                // FIXME: force draw ? hide form, change cursor ?
                this.rectangleControl.activate();
                this.lusVl.slctCntrl.activate();
                break;
        }
    },

    /**
     * Method: onChangeTerritory
     * An option of the territory select has been selected.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     */
    onChangeTerritory: function(element,evt) {
        var value= element.value;
        var regions= this.updateChildrenSelect(this.fields.f2,Geoportal.Catalogue.REGIONS,value);
        var depts= [];
        for (var dept in Geoportal.Catalogue.DEPARTMENTS) {
            if (regions[Geoportal.Catalogue.DEPARTMENTS[dept].parent]) {
                depts[dept]= Geoportal.Catalogue.DEPARTMENTS[dept];
            }
        }
        this.updateChildrenSelect(this.fields.f3,depts,'',function(values,name) {
            return name + ' ('+values[name].code+')';
        });
    },

    /**
     * Method: onChangeRegion
     * An option of the region select has been selected.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     */
    onChangeRegion: function(element,evt) {
        var value= element.value;
        this.selectParentOption(this.fields.f1,element,Geoportal.Catalogue.REGIONS);
        if (value == '') {
            this.onChangeTerritory(this.inputs[this.fields.f1]);
        } else {
            this.updateChildrenSelect(this.fields.f3,Geoportal.Catalogue.DEPARTMENTS,value,function(values,name) {
                return name + ' ('+values[name].code+')';
            });
        }
    },

    /**
     * Method: onChangeDept
     * An option of the departement select has been selected.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     */
    onChangeDept: function(element,evt) {
        this.selectParentOption(this.fields.f2,element,Geoportal.Catalogue.DEPARTMENTS);
        this.selectParentOption(this.fields.f1,this.inputs[this.fields.f2],Geoportal.Catalogue.REGIONS);
    },

    /**
     * Method: selectParentOption
     * In the select input, select the option corresponding to the 
     * parent of the child.
     *
     * Parameters:
     * fieldId - {String} the id of the select input (parent).
     * element - {<DOMElement>} the input select (children).
     * values - {Object} the possible values of the children.
     * 
     * Returns:
     * {<DOMElement>} the option selected.
     */
    selectParentOption: function(fieldId,element,values) {
        var value= element.value;
        var selected= null;
        if (value != '') {
            for (var name in values) {
                if (values[name].code == value) {
                    var input= this.inputs[fieldId];
                    var len= input.options.length;
                    for (var i=0; i<len; i++) {
                        if (input.options[i].value == values[name].parent) {
                            input.options[i].selected= true;
                            selected= input.options[i];
                            break;
                        }
                    }
                }
            }
        }
        return selected;
    },

    /**
     * Method: updateChildrenSelect
     * Update the children select options.
     *
     * Parameters:
     * selectId - {String} the id of the select input (parent).
     * values - {Object} the possible values of the children.
     * value - {String} the parent value.
     * format - {Function} function to format the option text.
     * 
     * Returns:
     * {Object} hashmap of children.
     */
    updateChildrenSelect: function(selectId,values,value,format) {
        var input= this.inputs[selectId];
        var len= input.options.length;
        var children= [];
        for (var i=0; i<len; i++) {
            input.options[0]= null;
        }
        var o= input.ownerDocument.createElement('option');
        o.text= '';
        o.value= '';
        o.defaultSelected= false;
        o.selected= true;
        input.options[input.options.length]= o;
        for (var name in values) {
            if (value=='' || values[name].parent==value) {
                o= input.ownerDocument.createElement('option');
                o.text= format? format(values,name) : name;
                o.value= values[name].code;
                o.defaultSelected= false;
                o.selected= false;
                input.options[input.options.length]= o;
                children[values[name].code]= true;
            }
        }
        return children;
    },

    /**
     * Method: onSearchClick
     * Search button has been hit, process the Location Utility Service query.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     *
     * Returns:
     * {Boolean} always false to disable default behavior of browser.
     */
    onSearchClick: function(element,evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        this.resultDiv.innerHTML= '';//clean up
        this.resultDiv.style.display= 'none';
        if (this.autoCompleteControl) {
            this.autoCompleteControl.hideAutoCompleteList();
        }
        var isInput= false;
        for (var i in this.inputs) {
            isInput= isInput || (element===this.inputs[i]);
        }
        if (isInput) {
            for (var i in this.inputs) {
                if (element!==this.inputs[i]) {
                    Geoportal.Control.Form.focusOff(this.inputs[i]);
                }
            }
            Geoportal.Control.Form.focusOn(element);
            return false;
        }
        if (this.fields.s && element===this.buttons[this.fields.s]) {
            this.geocode();
            return false;
        }
        this.closeForm();
        return false;
    },

    /**
     * Method: geocode
     * Launch the geocoding request.
     *      To be overwritten by sub-classes.
     */
    geocode: function() {
    },

    /**
     * Method: geocodeWithFilters
     * Utility method to add filters to geocoding request.
     * Eventually, the filters concern the following place's type :
     *      * Territoire : See {<Geoportal.Catalogue.TERRITORIES>}
     *      * Region : the region's CRS bounding box
     *      * Departement : the INSEE code
     *      * Bbox : CRS84 bounding box
     *
     * Parameters:
     * a - {<Geoportal.OLS.Address>} an OpenLS address used to build the
     *      query.
     *
     * Returns:
     * {<Geoportal.OLS.Address>} the modified OpenLS address.
     */
    geocodeWithFilters: function(a) {
        if (this.filtersOptions===null) { return a; }
        // filters :
        var v= this.inputs[this.fields.f3].value;
        if (v!='') {
            var p= new Geoportal.OLS.Place({
                'classification': Geoportal.Control.LocationUtilityService.DEPARTMENT,
                'name': v
            });
            a.addPlace(p);
            //for (var dept in Geoportal.Catalogue.DEPARTMENTS) {
            //    if (Geoportal.Catalogue.DEPARTMENTS[dept].code==v) {
            //        a.restrictedExtent= OpenLayers.Bounds.fromArray(Geoportal.Catalogue.DEPARTMENTS[dept].geobbox);
            //        break;
            //    }
            //}
        } else {
            v= this.inputs[this.fields.f2].value;
            if (v!='') {
                //var p= new Geoportal.OLS.Place({
                //    'classification': Geoportal.Control.LocationUtilityService.REGION,
                //    'name': v
                //});
                //a.addPlace(p);
                var region= Geoportal.Catalogue.REGIONS[this.inputs[this.fields.f2].options[this.inputs[this.fields.f2].selectedIndex].text];
                a.restrictedExtent= OpenLayers.Bounds.fromArray(region.geobbox);
            } else {
                v= this.inputs[this.fields.f1].value;
                if (v!='') {
                    var p= new Geoportal.OLS.Place({
                        'classification': Geoportal.Control.LocationUtilityService.TERRITORY,
                        'name': v
                    });
                    a.addPlace(p);
                    //var territory= Geoportal.Catalogue.TERRITORIES[v];
                    //a.restrictedExtent= OpenLayers.Bounds.fromArray(territory.geobbox);
                }
            }
        }
        v= this.inputs[this.fields.f0].value;
        switch(v) {
        case 'Map'   :
            a.restrictedExtent= this.map.getExtent().transform(this.map.getProjection(),OpenLayers.Projection.CRS84);
            break;
        case 'Manual':
            var feature= this.lusVl.features[0];
            if (feature) {
                a.restrictedExtent= feature.geometry.getBounds().clone().transform(this.map.getProjection(), OpenLayers.Projection.CRS84);
            }
            break;
        default     :
            break;
        }

        return a;
    },

    /**
     * Method: LUSSuccess
     * Called when the Ajax request returns a response for a Location Utility
     * service request.
     *
     * Parameters:
     * request - {XmlNode} request to server.
     *
     * Returns:
     * {Boolean} true if processing went well, false otherwise.
     */
    LUSSuccess: function(request) {
        if (this.wImg) {
            this.wImg.style.display= 'none';
        }
        this.resultDiv.innerHTML= '';//clean up
        this.resultDiv.style.display= '';
        if (!this.layer.queriedAddresses) {
            this.LUSFailure(request);
            return false;
        }
        var features= this.layer.queriedAddresses[0].features;
        if (!features) {
            return false;
        }
        return true;
    },

    /**
     * Method: LUSFailure
     * Called when the Ajax request fails for a Location Utility
     *      service request.
     *      Does nothing.
     *
     * Parameters:
     * request - {XmlNode} request to server.
     */
    LUSFailure: function(request) {
        if (this.wImg) {
            this.wImg.style.display= 'none';
        }
        this.resultDiv.innerHTML= '';//clean up
        var r= this.div.ownerDocument.createElement('div');
        r.className= 'gpLUSResult';
        var s= this.div.ownerDocument.createElement('span');
        s.innerHTML= OpenLayers.i18n('lus.not.match');
        r.appendChild(s);
        this.resultDiv.appendChild(r);
        this.resultDiv.style.display= '';
    },

    /**
     * Method: onResultClick
     * Center the map on the address. If the 'Ctrl-Key' has been pressed the
     * results panel is not removed, allowing the user to control-click on
     * various locations to choose the most relevant.
     *
     * Parameters:
     * evt - {Event}
     *
     * Context:
     * cntrl - {<Geoportal.Control.LocationUtilityService>}
     * zoom - {Integer}
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     */
    onResultClick: function(evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        if (this.cntrl.map) {
            var ll= new OpenLayers.LonLat(this.feature.geometry.x, this.feature.geometry.y);
            this.cntrl.map.setCenter(ll,this.zoom,false,false);
            ll= null;
            if (this.cntrl.drawLocation) {
                this.cntrl.layer.destroyFeatures();
                this.cntrl.layer.addFeatures([this.feature.clone()]);
                this.cntrl.layer.selectCntrl.activate();
            }
        }
        if (!evt || !evt.ctrlKey) {
            this.cntrl.closeForm();
        }
        this.cntrl.onSelectLocation(this.feature);
    },

    /**
     * Method: onAutoCompleteResultClick
     * Center the map on the autocompleted address (if the autocomplete result has coordinates).
     *
     * Parameters:
     * v - {String} the current text value of the autocomplete field.
     *
     * Returns:
     * {String} the autocomplete field value or null if the map is directly centered.
     */
    onAutoCompleteResultClick: function(v) {
        var acc= this.autoCompleteControl;
        if (acc && acc.results && acc.highlightIndex) {
            var acResult= acc.results[acc.highlightIndex-1];
            /* ..., x, y, zipcode */
            if (v==acResult.fulltext) {
                if (acResult.x!=0 && acResult.y!=0) {
                    var point= new OpenLayers.Geometry.Point(acResult.x, acResult.y).transform(
                        OpenLayers.Projection.CRS84, this.map.getProjection()
                    );
                    var atts= {
                        'address':new Geoportal.OLS.Address(),
                        'geocodeMatchCode':new Geoportal.OLS.GeocodeMatchCode()
                    };
                    var a= atts.address;
                    a.countryCode= this.countryCode;
                    atts.geocodeMatchCode.accuracy= 1.0;
                    atts.geocodeMatchCode.matchType= 'City';
                    var f= new OpenLayers.Feature.Vector(
                        point,
                        atts,
                        null
                    );
                    var context= {
                        cntrl: this,
                        feature: f,
                        zoom: this.setZoom(f)
                    };
                    this.onResultClick.apply(context);
                    return null;
                }
            }
        }
        return v;
    },

    /**
     * Method: updateLLForm
     * The icon of the location has been dragged, update the form.
     *
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} the location.
     * pixel - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The pixel location of the mouse.
     */
    updateLLForm: function(feature, pixel) {
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LocationUtilityService"*
     */
    CLASS_NAME:"Geoportal.Control.LocationUtilityService"
});

/**
 * Constant: Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST
 * {String} Value of countryCode used for toponyms research.
 */
Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST= "PositionOfInterest";//"TOPONYME";

/**
 * Constant: Geoportal.Control.LocationUtilityService.STREETADDRESS
 * {String} Value of countryCode used for addresses research.
 */
Geoportal.Control.LocationUtilityService.STREETADDRESS= "StreetAddress";//"ADDRESS";

/**
 * Constant: Geoportal.Control.LocationUtilityService.CADASTRALPARCEL
 * {String} Value of countryCode used for cadastral parcels research.
 */
Geoportal.Control.LocationUtilityService.CADASTRALPARCEL= "CadastralParcel";

/**
 * Constant: Geoportal.Control.LocationUtilityService.GEODETICFIXEDPOINT
 * {String} Value of countryCode used for geodetic fixed point research.
 */
Geoportal.Control.LocationUtilityService.GEODETICFIXEDPOINT= "GeodeticFixedPoint";

/**
 * Constant: Geoportal.Control.LocationUtilityService.COUNTRYCODES
 * {Array({String})} List of countryCodes available for location utility
 * services direct and reverse geocoding.
 */
Geoportal.Control.LocationUtilityService.COUNTRYCODES= [
    Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST,
    Geoportal.Control.LocationUtilityService.STREETADDRESS,
    Geoportal.Control.LocationUtilityService.CADASTRALPARCEL,
    Geoportal.Control.LocationUtilityService.GEODETICFIXEDPOINT
];

/**
 * Constant: Geoportal.Control.LocationUtilityService.TERRITORY
 * {String} Classification name of the place type to restrict on a territory. Default is 'Territoire'.
 */
Geoportal.Control.LocationUtilityService.TERRITORY= 'Territoire';

/**
 * Constant: Geoportal.Control.LocationUtilityService.REGION
 * {String} Classification name of the place type to restrict on a region. Default is 'Region'.
 */
Geoportal.Control.LocationUtilityService.REGION= 'Region';

/**
 * Constant: Geoportal.Control.LocationUtilityService.DEPARTMENT
 * {String} Classification name of the place type to restrict on a department. Default is 'Departement'.
 */
Geoportal.Control.LocationUtilityService.DEPARTMENT= 'Departement';

