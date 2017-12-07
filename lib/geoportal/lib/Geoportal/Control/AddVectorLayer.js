/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Form.js
 * @requires Geoportal/Control/EditingToolbar.js
 */
/**
 * Class: Geoportal.Control.AddVectorLayer
 * Implements a button control for adding a vector layer to the map. Designed
 * to be used with a <Geoportal.Control.Panel>.
 *
 * The control is displayed through <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> by using the
 * displayClass of the control : gpControlAddVectorLayer. Two effective styles are
 * connected with this : gpControlAddVectorLayerItemActive and
 * gpControlAddVectorLayerItemInactive.
 *
 * Inherits from:
 *  - <Geoportal.Control.Form>
 */
Geoportal.Control.AddVectorLayer= OpenLayers.Class(Geoportal.Control.Form, {

    /**
     * Constant: SUPPORTED_CLASSES
     * {Object} Array of vector layers' types supported by the control.
     *  The following types are supported by default when no supportedClasses
     *  option in given to the constructor :
     *  * 'OpenLayers.Geometry.Point',
     *  * 'OpenLayers.Geometry.LineString',
     *  * 'OpenLayers.Geometry.Polygon'.
     *
     *      'OpenLayers.Geometry.Collection', 'OpenLayers.Format.KML',
     *      'Geoportal.Format.GPX', 'OpenLayers.Format.OSM',
     *      'OpenLayers.Layer.WFS' and 'OpenLayers.Layer.GeoRSS' are also
     *      supported but must be part of the initialize() method through
     *      the use of options.supportedClasses to be taken into account
     *      by the control.
     */
    SUPPORTED_CLASSES: [
        'OpenLayers.Geometry.Point',
        'OpenLayers.Geometry.LineString',
        'OpenLayers.Geometry.Polygon'
    ],

    /**
     * Property: type
     * {String} The type of <Geoportal.Control.AddVectorLayer>
     *     Defaults to *OpenLayers.Control.TYPE_TOGGLE*
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * APIProperty: supportedClasses
     * {Array({String})} Array of supported vector layers' types supported by the
     * control (CLASS_NAMEs).
     */
    supportedClasses: null,

    /**
     * APIProperty: asynchronousCapabilities
     * {Boolean} GetCapabilities request is asynchronously launched or not.
     *      Defauts to *true*
     */
    asynchronousCapabilities: true,

    /**
     * Property: request
     * {<OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html>} the current Ajax request.
     */
    request: null,

    /**
     * Constructor: Geoportal.Control.AddVectorLayer
     * Build a button for adding a vector layer (Point, Line, Polygon, KML, WFS, ...).
     *
     * Parameters:
     * options - {Object} options to build this control. Amongst them one can
     * use :
     *  * supportedClasses (See property description);
     *  * styleMapTemplates : Hash of StyleMap, keys are
     *      'OpenLayers.Geometry.Point', 'OpenLayers.Geometry.LineString',
     *      'OpenLayers.Geometry.Polygon', 'OpenLayers.Geometry.Collection',
     *      'OpenLayers.Format.KML', 'Geoportal.Format.GPX',
     *      'OpenLayers.Format.OSM', 'OpenLayers.Layer.WFS',
     *      'OpenLayers.Layer.GeoRSS';
     *  * layerVectorOptions : See <OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>;
     *  * drawFeatureOptions : See <OpenLayers.Handler.DrawFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Handler/DrawFeature-js.html>;
     *  * dragFeatureOptions : See <OpenLayers.Handler.DragFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Handler/DragFeature-js.html>;
     *  * modifyFeatureOptions : See <OpenLayers.Handler.ModifyFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Handler/ModifyFeature-js.html>;
     *  * selectFeatureOptions : See <OpenLayers.Handler.selectFeature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Handler-js.html#OpenLayers.Handler.selectFeature>;
     *  * editingToolbarOptions : options for <Geometry.Control.EditingToolbar> like eventListeners.
     */
    initialize: function(options) {
        Geoportal.Control.Form.prototype.initialize.apply(this, arguments);
        if (!this.supportedClasses) {
            this.supportedClasses= [];
            for (var i= this.SUPPORTED_CLASSES.length-1; i>=0; i--) {
                this.supportedClasses.unshift(this.SUPPORTED_CLASSES[i]);
            }
        }
        if (!this.layerVectorOptions) {
            this.layerVectorOptions= {};
        }
        if (this.layerVectorOptions.global) {
            for (var i= this.supportedClasses.length-1; i>=0; i--) {
                var h= this.supportedClasses[i];
                this.layerVectorOptions[h]= this.layerVectorOptions[h] || {};
                OpenLayers.Util.extend(this.layerVectorOptions[h], this.layerVectorOptions.global);
            }
            delete this.layerVectorOptions.global;
        }
        this.supportFileAPI= window.File && window.FileReader && window.FileList;
    },

    /**
     * APIMethod: destroy
     * Clean the control.
     */
    destroy: function() {
        this.abortRequest();
        Geoportal.Control.Form.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: activate
     * Do the addition via a form.
     *      The form is as follows :
     *
     * (start code)
     * <form id='__addvlayer__{#Id}' name='__addvlayer__{#Id}' action='javascript:void(null)'>
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
        var f= this.div.ownerDocument.createElement('form');
        f.id= '__addvlayer__' + this.id;
        f.name= f.id;
        f.action= 'javascript:void(null)';
        this.addvlayer(f);
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
     * Method: addvlayer
     * Build the form and add the specified layer.
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id='lbllayerName{#Id}' for='layerName{#Id}' style='font-weight:bold;'>{#displayClass}.layerName</label>
     * <input id='layerName{#Id}' name='layerName{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helplayerName{#Id}' class='gpFormSmall'>{#displayClass}.layerName.help</span>
     * <br/>
     * <label id='lbllayerType{#Id}' for='layerType{#Id}' style='font-weight:bold;'>{#displayClass}.layerType</label>
     * <select id='layerType{#Id}' name='layerType{#Id}'>
     *      <option value='{#fld.options[].value}' selected='{#fld.options[].selected}'>{#fld.options[].text}</option>
     * </select>
     * <br/>
     * <span id='helplayerType{#Id}' class='gpFormSmall'>{#displayClass}.layerType.help</span>
     * <br/>
     * <label id='lbllayerFreeHand{#Id}' for='layerFreeHand{#Id}'>{#displayClass}.layerFreeHand</label>
     * <input id='layerFreeHand{#Id}' name='layerFreeHand{#Id}' type='checkbox' value='layerFreeHand{#Id}'
     *        disabled='{#fld.disabled}' checked='{#fld.checked}' defaultChecked='{#fld.checked}'
     *        style='autocomplete:off;' />
     * <br/>
     * <span id='helplayerFreeHand{#Id}' class='gpFormSmall'>{#displayClass}.layerFreeHand.help</span>
     * <br/>
     * <label id='lbllayerUrl{#Id}' for='layerUrl{#Id}'>{#displayClass}.layerUrl</label>
     * <input id='layerUrl{#Id}' name='layerUrl{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helplayerUrl{#Id}' class='gpFormSmall'>{#displayClass}.layerUrl.help</span>
     * <br/>
     * <label id='lbllayerFile{#Id}' for='layerFile{#Id}'>{#displayClass}.layerFile</label>
     * <input id='layerFile{#Id}' name='layerFile{#Id}' type='file'
     *        maxLength='131072' size='{#fld.length}' class='{#fld.css}' disabled='{#fld.disabled}'/>
     * </label>
     * <br/>
     * <span id='helplayerFile{#Id}'
     * class='gpFormSmall'>{#displayClass}.layerFile.help</span>
     * <br/>
     * <input class='{#displayClass}Button' type='button' id='cancel{#Id}' name='cancel{#Id}'
     *      value='{#displayClass}.button.cancel'/>
     * <input class='{#displayClass}Button' type='button' id='add{#Id}' name='add{#Id}'
     *      value='{#displayClass}.button.add'/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addvlayer: function(form) {
        this.buildInputTextField(form,{
            id:'layerName',
            mandatory:true,
            size:20,
            length:20,
            callbacks:[
                {evt:'click',func:this.onClick}
            ],
            value:'____________________'});
        var opts= [];
        var hasLP= false, isLP= false;
        var hasUrl= false, isUrl= false;
        for (var i= 0, len= this.supportedClasses.length; i<len; i++) {
            var o= {
                value: this.supportedClasses[i],
                selected: (i==0),
                text: this.getDisplayClass()+'.layerType.'+this.supportedClasses[i].split('.').pop()
            };
            if (this.supportedClasses[i].match(/^OpenLayers\.Geometry\.(LineString|Polygon)$/)) {
                hasLP= true;
                if (i==0) { isLP= true; }
            }
            if (this.supportedClasses[i].match(/^(.*\.Format\.(KML|GPX|OSM)|OpenLayers\.Layer\.(WFS|GeoRSS))$/)) {
                hasUrl= true;
                if (i==0) { isUrl= true; }
            }
            opts.push(o);
        }
        this.buildSelectField(form,{
            id:'layerType',
            mandatory:true,
            options:opts,
            callbacks:[
                {evt:'click',func:this.onClick},
                {evt:'change',func:this.onChange}
            ]});
        if (hasLP) {
            this.buildCheckboxField(form,{
                id:'layerFreeHand',
                disabled:!isLP
            });
        }
        if (hasUrl) {
            this.buildInputTextField(form,{
                id:'layerUrl',
                size:40,
                length:512,
                disabled:!isUrl,
                callbacks:[
                    {evt:'click',func:this.onClick}
                ]});
            var e;
            if (this.supportFileAPI) {
                //FIXME: FileAPI
                e= this.buildInputFileField(form,{
                    id:'layerFile',
                    size:40,
                    disabled:!isUrl,
                    callbacks:[
                        {evt:'dragenter',func:this.onDragEnter},
                        {evt:'dragover',func:this.onDragOver},
                        {evt:'change',func:this.onFileUpload},
                        {evt:'drag',func:this.onFileUpload}
                    ]});
            } else {
                e= this.buildInputTextField(form,{
                    id:'layerContent',
                    type:'textarea',
                    cols:40,
                    rows:2,
                    disabled:!isUrl,
                    callbacks:[
                        {evt:'click',func:this.onClick}
                    ]});
            }
            e= e.parentNode;
            e.style.display= 'none';
            this.buildCheckboxField(form,{
                id:'layerUrlSwitch',
                checked:true,
                callbacks:[
                    //IE: when click, the checkbox gains focus, but change is
                    //only triggered when the checkbox losts focus (blur) :
                    {evt:'click',func:this.onSwitch}
                ]});
        }
        this.buildButton(form,'cancel',this.closeForm);
        this.buildButton(form,'add',this.onClick,13);//RETURN keycode==13
        this.wImg= this.buildImageButton(form,'wait',null);
        this.wImg.alt = '';
        this.wImg.style.display= 'none';
        this.buildResultsField(form);
    },

    /**
     * Method: closeForm
     * Close the floating control and activate the navigation
     */
    closeForm: function() {
        this.abortRequest();
        Geoportal.Control.Form.prototype.closeForm.apply(this, arguments);
    },

    /**
     * Method: onClick
     * Add button has been hit, process the layer addition to the map.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onClick: function(element,evt) {
        if (!evt) evt= window.event;
        // check whether return key has been pressed and has been issued from
        // layerContent element :
        var tgt= evt.target || evt.srcElement;
        if (evt.keyCode==13 || evt.keyCode==10) {
            if (tgt.id.match(/^layerContent/)) {
                return true;
            }
        }
        OpenLayers.Event.stop(evt);
        var es= ['layerName', 'layerType', 'layerUrl', 'layerUrlSwitch', 'layerContent'];
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
        if (element.id.match(/^add/) && !tgt.id.match(/^cancel/)) {
            element= OpenLayers.Util.getElement('layerType' + this.id);
            var h= OpenLayers.String.trim(element.options[element.selectedIndex].value);
            if (h=='') { return false; }
            element.options[0].selected= true;
            var geom= h.match(/^OpenLayers\.Geometry\.(Point|LineString|Polygon|Collection)$/);
            var isGeom= geom!=null;
            var isCollection= isGeom==true && geom[1]=='Collection';
            var m= h.match(/.*\.Format\.(KML|GPX|OSM)$/);
            var isFmt= m!=null;
            var whichFmt= isFmt? m[1]:'';
            m= h.match(/.*\.Layer\.(WFS|GeoRSS)$/);
            var isLayer= m!=null;
            var whichLayer= isLayer? m[1]:'';
            if (!isGeom && !isFmt && !isLayer) { return false; }
            element= OpenLayers.Util.getElement('layerName' + this.id);
            var name= OpenLayers.String.trim(element.value);
            if (name=='' && (!isLayer || whichLayer=='GeoRSS')) { return false; }
            //element.value= '';
            var ho= false;
            element= OpenLayers.Util.getElement('layerFreeHand' + this.id);
            if (element!=null) {
                ho= element.checked;
                if (h.match(/(Point|Collection)$/)) {
                    ho= false;
                }
                element.checked= false;
            }

            var vlayer= null;
            if (isGeom) {
                this.wImg.style.display= '';
                vlayer= new OpenLayers.Layer.Vector(
                    name,
                    OpenLayers.Util.extend({
                            //IGN: when set, there is a problem in
                            //OpenLayers.Layer.Vector when using
                            //OpenLayers.Control.ModifyFeature : componentShouldBe!
                            //this control collect point to modify so we
                            //cannot set the layer's geometryType ...
                            //geometryType:eval(h),
                            hasType:h,//IGNF addition as a workaround !
                            projection: this.map.getProjection().clone(),
                            //opacity:1.0,
                            styleMap: (this.styleMapTemplates && this.styleMapTemplates[h])? this.styleMapTemplates[h].clone():undefined,
                            view: {
                                drop:true,
                                zoomToExtent:true
                            }
                        },
                        this.layerVectorOptions[h]
                    )
                );
                this.map.addLayer(vlayer);
                var vrtStl= OpenLayers.Util.extend({}, vlayer.style || vlayer.styleMap.createSymbolizer());
                vrtStl.fillOpacity= 1.0;
                vrtStl.strokeOpacity= 0.5;
                // (Editiong|Drawing)Toolbar is also LayerSwitcher dependant
                var lsid= "" ;
                var lss= this.map.getControlsByClass("Geoportal.Control.LayerSwitcher") ;
                if (lss!=null && lss.length>0) {
                   lsid= lss[0].id+"_" ;
                }
                var editId = "edit_"+lsid+vlayer.id;
                var o= OpenLayers.Util.applyDefaults(
                        {},
                        {
                            id: editId,
                            div: h.match(/Collection$/)? this.div.ownerDocument.createElement('div') : OpenLayers.Util.getElement(editId),
                            drawFeatureOptions:
                                OpenLayers.Util.extend(
                                    {
                                        //eventListeners: {}
                                        //callbacks: {
                                        //  done:,
                                        //  cancel:,
                                        //  point: /* OpenLayers.Geometry.Path, OpenLayers.Geometry.Polygon only */
                                        //}
                                        handlerOptions : {
                                            style: "default",
                                            layerOptions: {
                                                styleMap: this.styleMapTemplates && this.styleMapTemplates[h]? this.styleMapTemplates[h].clone():undefined
                                            },
                                            freehand: ho
                                        }
                                    },
                                    this.drawFeatureOptions? this.drawFeatureOptions[h] : {}
                                ),
                            dragFeatureOptions:
                                OpenLayers.Util.extend(
                                    {
                                        //Cf. supra :
                                        //geometryTypes:[h]
                                        //dragCallbacks: {
                                        //  down:,
                                        //  move:,
                                        //  up:,
                                        //  out:,
                                        //  done:
                                        //},
                                        //featureCallbacks: {
                                        //  over:,
                                        //  out:
                                        //},
                                        //onStart: function(feature, pixel) {},
                                        //onDrag: function(feature, pixel) {},
                                        //onComplete: function(feature, pixel) {}
                                    },
                                    this.dragFeatureOptions? this.dragFeatureOptions[h] : {}
                                ),
                            modifyFeatureOptions:
                                OpenLayers.Util.extend(
                                    {
                                        //FIXME:
                                        //snappingOptions:,
                                        //TODO: register beforefeaturemodified,
                                        //featuremodified, afterfeaturemodified
                                        virtualStyle: vrtStl
                                    },
                                    this.modifyFeatureOptions? this.modifyFeatureOptions[h] : {}
                                ),
                            deleteFeatureOptions:
                                OpenLayers.Util.extend(
                                    {
                                    },
                                    this.deleteFeatureOptions? this.deleteFeatureOptions[h] : {}
                                ),
                            selectFeatureOptions:
                                OpenLayers.Util.extend(
                                    {
                                        multiple: false,    //default
                                        clickout: true,     //default
                                        toggle: true,
                                        hover: false,       //default
                                        box: false          //default
                                        //onSelect: function(feature) {},
                                        //onUnselect: function(feature) {}
                                    },
                                    this.selectFeatureOptions? this.selectFeatureOptions[h] : {}
                                )
                        });
                o= OpenLayers.Util.extend(o,this.editingToolbarOptions? this.editingToolbarOptions[h] : {});
                var p= isCollection?
                    new Geoportal.Control.DrawingToolbar(vlayer, o)
                :   new Geoportal.Control.EditingToolbar(vlayer, h, o);
                this.map.addControl(p);
                vlayer.setVisibility(false);
            } else if (isFmt || (isLayer && whichLayer=='GeoRSS')) {
                var isUrl= OpenLayers.Util.getElement('layerUrlSwitch' + this.id);
                if (!isUrl) { return false; }
                var dataSource= null;
                if (isUrl.checked) {
                    dataSource= OpenLayers.Util.getElement('layerUrl' + this.id);
                } else {
                    dataSource= OpenLayers.Util.getElement('layerContent' + this.id);
                }
                if (!dataSource) { return false; }
                dataSource= OpenLayers.String.trim(dataSource.value);
                if (dataSource.length==0) { return false; }
                this.wImg.style.display= '';
                var lprms= OpenLayers.Util.extend({
                    visibility: true,
                    styleMap  : (this.styleMapTemplates && this.styleMapTemplates[h])? this.styleMapTemplates[h].clone():undefined
                }, this.layerVectorOptions[h]);
                if (!lprms.eventListeners) {
                    lprms.eventListeners= {};
                }
                var svClbk= lprms.eventListeners["loadend"];
                lprms.eventListeners["loadend"]= function() {
                    if (typeof(svClbk)=='function') {
                        svClbk();
                    }
                    var bounds= this.getDataExtent();
                    if (bounds) {
                        if (bounds.getWidth()==0 || bounds.getHeight()==0) {
                            // reduced to 1 point ?
                        } else {
                            this.map.zoomToExtent(bounds);
                        }
                    }
                };
                var url= isUrl.checked? dataSource:null;
                var lopts= {
                    preventDefaultBehavior:{
                        loadend: true
                    }
                };
                if (!isUrl.checked) {
                    lopts.data= dataSource;
                }
                vlayer= this.map.addLayer(
                    whichFmt || whichLayer,
                    name,
                    url,
                    lprms,
                    lopts);
            } else if (isLayer) {
                var url= OpenLayers.Util.getElement('layerUrl' + this.id);
                if (!url) { return false; }
                url= OpenLayers.String.trim(url.value);
                if (url.length==0) { return false; }
                this.wImg.style.display= '';
                // WFS GetCapabilities : application/vnd.ogc.wfs_xml
                this.request= OpenLayers.Request.GET({
                    async  :this.asynchronousCapabilities,
                    url    :url,
                    params :{
                        'SERVICE': 'WFS',
                        'REQUEST': 'GetCapabilities'
                    },
                    success: this.successedInLoadingUrl,
                    failure: this.failedOnLoadingUrl,
                    scope  :{'cntrl':this, 'serviceType':'WFS', 'name':name}
                });
                return false;
            } else {
                OpenLayers.Console.userError(OpenLayers.i18n('addvlayer.type.not.supported',{'type':h}));
            }
        }
        this.wImg.style.display= 'none';
        this.closeForm();
        return false;
    },

    /**
     * Method: onFileUpload
     * A file is being uploaded, process the layer addition to the map.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onFileUpload: function(element,evt) {
        if (!evt) evt= window.event;
        OpenLayers.Event.stop(evt);
        evt.preventDefault();
        var ctrl= this;
        // FileList object.
        var files= (evt.dataTransfer?
            evt.dataTransfer.files
        :   (evt.target?
            evt.target.files
        :   []));
        var file= files[0];//properties: mozFullPath, name, size, type
        if (file) { // files is a FileList of File objects.
            // See http://www.html5rocks.com/en/tutorials/file/dndfiles/
            OpenLayers.Console.log("file: "+file.name+", "+file.size+", "+file.type);
            this.fReader= new FileReader();
            this.fReader.onerror= function(e) {
                if (e) {
                    switch (e.target.error.code) {
                    case e.target.error.NOT_FOUND_ERR    :
                        OpenLayers.Console.userError(OpenLayers.i18n('addvlayer.type.not.supported',{'file':file.name}));
                        return;
                    case e.target.error.NOT_READABLE_ERR :
                        OpenLayers.Console.userError(OpenLayers.i18n('addvlayer.file.not.readable',{'file':file.name}));
                        return;
                    case e.target.error.ABORT_ERR        :
                        return;// noop
                    default                              :
                        break;
                    }
                }
                OpenLayers.Console.userError(OpenLayers.i18n('addvlayer.file.is.empty',{'file':file.name}));
            };
            this.fReader.onprogress= function(e) {
            };
            this.fReader.onabort= function(e) {
                ctrl.wImg.style.display= 'none';
            };
            this.fReader.onloadstart= function(e) {
                ctrl.wImg.style.display= '';
            };
            this.fReader.onloadend= function(e) {
                ctrl.fReader= null;
                ctrl.wImg.style.display= 'none';
                ctrl.closeForm();
            };
            this.fReader.onload= function(e) {
                var features= null;
                element= OpenLayers.Util.getElement('layerType' + ctrl.id);
                var hSel= OpenLayers.String.trim(element.options[element.selectedIndex].value);
                if (hSel=='') {
                    fReader.abort();
                    return false;
                }
                for (var i in ctrl.supportedClasses) {
                    var h= ctrl.supportedClasses[i];
                    var m= h.match(/.*\.Format\.(.*)$/);
                    if (m!=null && h==hSel) {// FIXME: GeoRSS
                        var parser= null ;
                        var fmt= null ;
                        try {
                            fmt= eval(h);
                            var ofmt= {
                                internalProjection: ctrl.map.getProjection()
                            };
                            switch(m[1]) {
                            case "KML"   :
                                ofmt.extractStyles= true;
                                break;
                            case "GeoRSS":
                                ofmt.size= new OpenLayers.Size(250, 150);
                                ofmt.autoSize= false;
                                ofmt.overflow= 'auto';
                                break;
                            default      :
                                break;
                            }
                            parser= new fmt(ofmt);
                            features= parser.read(e.target.result);
                        } catch(ex) {
                            features= null;
                        } finally {
                            if (parser) {
                              parser.destroy();
                              parser= null;
                            }
                            fmt= null;
                            if (features && features.length) {
                                // create layer:
                                element= OpenLayers.Util.getElement('layerName' + ctrl.id);
                                var name= OpenLayers.String.trim(element.value);
                                if (name=='') {
                                    name= file.name;
                                }
                                var lprms= OpenLayers.Util.extend({
                                    visibility: true,
                                    //projection: ctrl.map.getProjection().clone(),
                                    styleMap  : (ctrl.styleMapTemplates && ctrl.styleMapTemplates[h])? ctrl.styleMapTemplates[h].clone():undefined,
                                    view: {
                                        drop:true,
                                        zoomToExtent:true
                                    }
                                }, ctrl.layerVectorOptions[h]);
                                if (!lprms.eventListeners) {
                                    lprms.eventListeners= {};
                                }
                                var svClbk= lprms.eventListeners["loadend"];
                                lprms.eventListeners["loadend"]= function() {
                                    if (typeof(svClbk)=='function') {
                                        svClbk();
                                    }
                                    var bounds= this.getDataExtent();
                                    if (bounds) {
                                        if (bounds.getWidth()==0 || bounds.getHeight()==0) {
                                            // reduced to 1 point ?
                                        } else {
                                            this.map.zoomToExtent(bounds);
                                        }
                                    }
                                };
                                var lopts= {
                                    preventDefaultBehavior:{
                                        loadend: true
                                    }
                                };
                                var vlayer= ctrl.map.addLayer(m[1],name,null,lprms,lopts);
                                vlayer.addFeatures(features);
                                vlayer.events.triggerEvent("loadend");
                                break;
                            }
                        }
                    }
                    // try another format ...
                }
                if (!features || !features.length) {
                    hSel= hSel.split('.'); hSel= hSel.pop();
                    OpenLayers.Console.userError(OpenLayers.i18n('addvlayer.expected.type',{'file':file.name,'type':hSel}));
                    return false;
                }
                return false;
            };
            this.fReader.readAsText(file);
        }
        return false;
    },

    /**
     * Method: onDragEnter
     * A file is being dragged over the input, prepare the layer addition to the map.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onDragEnter: function(element,evt) {
        if (!evt) evt= window.event;
        OpenLayers.Event.stop(evt);
        evt.preventDefault();
        return false;
    },

    /**
     * Method: onDragEnter
     * A file has been dragged over the input, prepare the layer addition to the map.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onDragOver: function(element,evt) {
        if (!evt) evt= window.event;
        OpenLayers.Event.stop(evt);
        evt.preventDefault();
        if (evt.dataTransfer) {
            evt.dataTransfer.dropEffect= 'copy'; // Explicitly show this is a copy.
        }
        return false;
    },

    /**
     * Method: onChange
     * An option of the select has been selected.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     */
    onChange: function(element,evt) {
        var eid= element.id;
        eid= eid.replace(/^layerType/,'layerName');
        var e= OpenLayers.Util.getElement(eid);
        if (e) {
            if (element.options[element.selectedIndex].value.match(/^OpenLayers.Layer.WFS$/)) {
                e.disabled= true;
            } else {
                e.disabled= false;
            }
        }
        eid= eid.replace(/^layerName/,'layerFreeHand');
        e= OpenLayers.Util.getElement(eid);
        if (e) {
            if (element.options[element.selectedIndex].value=='OpenLayers.Geometry.LineString' ||
                element.options[element.selectedIndex].value=='OpenLayers.Geometry.Polygon') {
                e.disabled= false;
            } else {
                e.disabled= true;
                e.checked= false;
            }
        }
        eid= eid.replace(/^layerFreeHand/,'layerUrl');
        e= OpenLayers.Util.getElement(eid);
        if (e) {
            if (element.options[element.selectedIndex].value.match(/^(.*\.Format\.(KML|GPX|OSM)|OpenLayers\.Layer\.(WFS|GeoRSS))$/)) {
                e.disabled= false;
            } else {
                e.value= '';
                e.disabled= true;
            }
        }
        if (!this.supportFileAPI) {
            eid= eid.replace(/^layerUrl/,'layerContent');
        } else {
            eid= eid.replace(/^layerUrl/,'layerFile');
        }
        e= OpenLayers.Util.getElement(eid);
        if (e) {
            if (element.options[element.selectedIndex].value.match(/^.*\.Format\.(KML|GPX|OSM)$/)) {
                e.disabled= false;
            } else {
                if (!this.supportFileAPI) {
                    e.value= '';
                }
                e.disabled= true;
            }
        }
        eid= eid.replace(/^layer(Content|File)/,'layerUrlSwitch');
        e= OpenLayers.Util.getElement(eid);
        if (e) {
            if (element.options[element.selectedIndex].value.match(/^.*\.Format\.(KML|GPX|OSM)$/)) {
                e.disabled= false;
            } else {
                e.disabled= true;
            }
        }
    },

    /**
     * Method: onSwitch
     * Change remote URL to local content and vice versa.
     *      Only allowed with KML, GPX, OSM type of layer is selected.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     */
    onSwitch: function(element,evt) {
        var eid= element.id;
        eid= eid.replace(/^layerUrlSwitch/,'layerType');
        var e= OpenLayers.Util.getElement(eid);
        if (e) {
            if (e.options[e.selectedIndex].value.match(/^.*\.Format\.(KML|GPX|OSM)$/)) {
                eid= eid.replace(/^layerType/,'layerUrl');
                e= OpenLayers.Util.getElement(eid);
                if (e) {
                    e.disabled= !element.checked;
                    e= e.parentNode;
                    if (e) {
                        e.style.display= element.checked? '':'none';
                    }
                    if (!this.supportFileAPI) {
                        eid= eid.replace(/^layerUrl/,'layerContent');
                    } else {
                        eid= eid.replace(/^layerUrl/,'layerFile');
                    }
                    e= OpenLayers.Util.getElement(eid);
                    if (e) {
                        e.disabled= element.checked;
                        e= e.parentNode;
                        if (e) {
                            e.style.display= element.checked? 'none':'';
                        }
                    }
                }
            }
        }
    },

    /**
     * APIMethod: successedInLoadingUrl
     * Called when successfully getting the url, it is now time to parse.
     *      Context:
     *      * cntrl: this control;
     *      * serviceType: the service's type.
     *      * name: the typename's name.
     * 
     * Parameters:
     * request - {<OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html>}
     */
    successedInLoadingUrl: function(request) {
        if (!request) {
            this.cntrl.request= null;
            this.cntrl.wImg.style.display= 'none';
            return;
        }
        var doc= request.responseXML;
        if (!doc && request.responseText) {
            doc= OpenLayers.Format.XML.prototype.read.call({},[request.responseText]);
            var pet= OpenLayers.Request.XMLHttpRequest.getParseErrorText(doc);
            if (pet != OpenLayers.Request.XMLHttpRequest.PARSED_OK) {
                this.cntrl.wImg.style.display= 'none';
                OpenLayers.Console.userError(OpenLayers.i18n(pet));
                return;
            }
        }

        var capsFmt= new OpenLayers.Format.WFSCapabilities() ;
        var caps= null;
        try {
            caps= capsFmt.read(doc);
        } catch (er) {
            this.cntrl.wImg.style.display= 'none';
            OpenLayers.Console.userError(er);
            return;
        }
        if (caps.exceptions) {
            var msg= '';
            for (var i= 0, l= caps.exceptions.length; i<l; i++) {
                msg+= caps.exceptions[i]+'\n';
            }
            this.cntrl.wImg.style.display= 'none';
            OpenLayers.Console.userError(msg);
            return;
        }
        if (!(caps.capability &&                  // FIXME : caps.capability null en WFS 1.1.0 !?
              caps.capability.operations &&
              caps.capability.operations.GetFeature &&
              caps.capability.operations.GetFeature.href &&
              (caps.capability.operations.GetFeature.href.get || caps.capability.operations.GetFeature.href.post)
             ) &&
            ! (caps.featureTypeList && caps.version )) {//not a WFS
            this.cntrl.request= null;
            this.cntrl.wImg.style.display= 'none';
            OpenLayers.Console.userError(request.responseText);
            //OpenLayers.i18n('ogc.caps.unknown.service',{serviceType:caps.service.name||'',expectedType:'WFS'});
            return;
        }
        this.cntrl.request= null;

        var e= OpenLayers.Util.getElement('results' + this.cntrl.id);
        e.innerHTML= '';//clean up
        var nbfts= 0;
        var mx= this.cntrl.map.getMaxExtent();
        switch (caps.version) {
        case '1.0.0':
        case '1.1.0':
            // sort features by title:
            caps.featureTypeList.featureTypes.sort(function(a,b){return b.title < a.title;});
            for (var i= 0, len= caps.featureTypeList.featureTypes.length; i<len; i++) {
                var f= caps.featureTypeList.featureTypes[i];
                // check llbox :
                var geobbox= null ;
                if (f.bbox) { // FIXME : normalement, f.bbox n'est pas renseigne !?
                    if (f.bbox.length>0) {
                        geobbox= new OpenLayers.Bounds();
                        for (var j= 0, lbbox= f.bbox.length; j<lbbox; j++) {
                            geobbox.extend(OpenLayers.Bounds.fromArray(f.bbox[j]));
                        }
                    }
                } else if (f.bounds) {
                    geobbox= new OpenLayers.Bounds();
                    geobbox.extend(f.bounds);
                }
                if (geobbox) {
                    geobbox.transform(OpenLayers.Projection.CRS84, this.cntrl.map.getProjection());
                    if (!mx.containsBounds(geobbox,true,true) &&
                        !geobbox.containsBounds(mx,true,true)) {
                        continue;
                    }
                }
                var r= this.cntrl.div.ownerDocument.createElement('div');
                r.className= 'gpWFSCapsFeatureTypesResult';
                if ((nbfts%2)==1) {
                    r.className+= 'Alternate';
                }
                var s= this.cntrl.div.ownerDocument.createElement('span');
                s.innerHTML= f.title;
                s.style.cursor= 'pointer';
                var context= {
                    cntrl           : this.cntrl,
                    serviceType     : this.serviceType,
                    name            : this.name,
                    caps            : caps,
                    featureTypeIndex: nbfts
                };
                OpenLayers.Event.observe(
                    s,
                    "click",
                    OpenLayers.Function.bindAsEventListener(this.cntrl.onFeatureTypeNameClick,context));
                r.appendChild(s);
                e.appendChild(r);
                nbfts++;
            }
            break;
        default     :
            break;
        }
        if (nbfts==0) {
            var r= this.cntrl.div.ownerDocument.createElement('div');
            r.className= 'gpWFSCapsFeatureTypesResult';
            var s= this.cntrl.div.ownerDocument.createElement('span');
            switch (caps.version) {
            case '1.0.0':
            case '1.1.0':
                s.innerHTML= OpenLayers.i18n('wfs.caps.no.feature.found');
                break;
            default     :
                s.innerHTML= OpenLayers.i18n('wfs.caps.unsupported.version',{version:caps.version});
                break;
            }
            r.appendChild(s);
            e.appendChild(r);
        }
        this.cntrl.wImg.style.display= 'none';
        e.style.display= '';
    },

    /**
     * Method: onFeatureTypeNameClick
     * Builds the chosen featureType. Use DescribeFeatureType operation
     * whenever possible.
     *
     * Parameters:
     * evt - {Event}
     *
     * Context:
     * cntrl - {<Geoportal.Control.AddVectorLayer>}
     * serviceType - {String}
     * name - {String}
     * caps - {<OpenLayers.Format.WFSCapabilities at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/WFSCapabilities-js.html>}
     * featureTypeIndex - {Integer}
     */
    onFeatureTypeNameClick: function(evt) {
        if (!evt) evt= window.event;
        OpenLayers.Event.stop(evt);
        this.cntrl.wImg.style.display= '';
        var f= this.caps.featureTypeList.featureTypes[this.featureTypeIndex];
        
        // FIXME: Check Geoportal's WFS :
        var params= {
            'version' :this.caps.version,
            'typename':f.name
        };
        var x= null;
        // FIXME : WFS 1.1.0 => f.bbox est vide, c'est f.bounds qu'il faut tester.
        if (f.bbox && f.bbox.length>0) {
            x= new OpenLayers.Bounds();
            for (var j= 0, lbbox= f.bbox.length; j<lbbox; j++) {
                x.extend(OpenLayers.Bounds.fromArray(f.bbox[j]));
            }
            var p= new OpenLayers.Projection(f.srs);
            x.transform(OpenLayers.Projection.CRS84, p);
        } else if (f.bounds) {
            x= new OpenLayers.Bounds();
            x.extend(f.bounds) ;
            var p= new OpenLayers.Projection(f.srs);
            x.transform(OpenLayers.Projection.CRS84, p);
        }
        
        // FIXME : caps.capability est null avec WFS 1.1.0
        var href= this.caps.capability && this.caps.capability.operations && this.caps.capability.operations.DescribeFeatureType &&
                  this.caps.capability.operations.DescribeFeatureType.href ?
                  this.caps.capability.operations.DescribeFeatureType.href
                  : null;

        if (href==null) {
            var dcpHttp= this.caps.operationsMetadata && this.caps.operationsMetadata.DescribeFeatureType && this.caps.operationsMetadata.DescribeFeatureType.dcp && this.caps.operationsMetadata.DescribeFeatureType.dcp.http ? this.caps.operationsMetadata.DescribeFeatureType.dcp.http : null ;
            if (dcpHttp) {
                // FIXME : on ne recupere que l'URL en GET car on ne sait pas si le POST est supporté...
                href= dcpHttp.get && dcpHttp.get.length>0 ? dcpHttp.get[0].url : null ;                                   
            }
        }
        
        var options= {
            projection     :f.srs,
            maxExtent      :x,
            visibility     :true,
            protocolOptions:{
                featurePrefix:f.featurePrefix || '',
                featureNS    :f.featureNS || '',
                geometryName :f.geometryName || ''
            },
            describeFeatureTypeUrl:href
        };
        var cn= 'OpenLayers.Layer.WFS';
        switch (this.serviceType) {
        case 'WFS' :
            break;
        default    :
            break;
        }
        if (f['abstract']) {
            options.description= f['abstract'];
        }
        options.originators= [{
            logo      :'logo'+f.name,
            pictureUrl: Geoportal.Util.getImagesLocation()+'logo_unknownAuthority.gif',
            url       : (f.href? f.href : 'javascript:void(0)')
        }];
        if (f.metadataURLs && f.metadataURLs.length>0) {
            options.metadataURL= [];
            for (var j= 0, lj= f.metadataURLs.length; j<lj; j++) {
                options.metadataURL.push(f.metadataURLs[j].href);
            }
        }
        //FIXME: only large scales ...
        //FIXME: caps.service -> mtd ?
        this.cntrl.wImg.style.display= 'none';

        if (href) {
            var vlayer= this.cntrl.map.addLayer(
                this.serviceType,
                f.title || f.name,
                href,
                params,
                OpenLayers.Util.extend(options,this.cntrl.layerVectorOptions[cn])//FIXME
            );
        }

        this.cntrl.closeForm();
    },

    /**
     * APIMethod: failedOnLoadingUrl
     * Called when unsuccessfully getting the url.
     *      Context:
     *      * cntrl: this control;
     *      * serviceType: the service's type.
     *
     * Parameters:
     * request - {<OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html>}
     */
    failedOnLoadingUrl: function(request) {
        OpenLayers.Console.userError(request.statusText);
        this.cntrl.request= null;
        this.cntrl.closeForm();
    },

    /**
     * Method: abortRequest
     * Stops the current request against the underlaying W*S service.
     */
    abortRequest: function() {
        if (this.supportFileAPI) {
            if (this.fReader) {
                try {
                    this.fReader.abort();
                } catch(e) {
                    ;
                } finally {
                    this.fReader= null;
                }
            }
        }
        if (this.request) {
            this.request.abort();
            this.request= null;
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.AddVectorLayer"*
     */
    CLASS_NAME: "Geoportal.Control.AddVectorLayer"
});
