/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Form.js
 */
/**
 * Class: Geoportal.Control.AddImageLayer
 * Implements a button control for adding an image layer to the map. Designed
 * to be used with a <Geoportal.Control.Panel>.
 *
 * The control is displayed through <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> by using the
 * displayClass of the control : gpControlAddImageLayer. Two effective styles are
 * connected with this : gpControlAddImageLayerItemActive and
 * gpControlAddImageLayerItemInactive.
 *
 * Inherits from:
 *  - <Geoportal.Control.Form>
 */
Geoportal.Control.AddImageLayer= OpenLayers.Class( Geoportal.Control.Form, {

    /**
     * Constant: SUPPORTED_CLASSES
     * {Object} Array of raster layers' types supported by the control.
     *  The following types are supported by default when no supportedClasses
     *  option in given to the constructor :
     *  * 'OpenLayers.Layer.WMS',
     *  * 'Geoportal.Layer.WMTS'.
     *  * 'Geoportal.Layer.WMSC'.
     */
    SUPPORTED_CLASSES: [
        'OpenLayers.Layer.WMS',
        'Geoportal.Layer.WMTS',
        'Geoportal.Layer.WMSC'
    ],

    /**
     * APIProperty: asynchronousCapabilities
     * {Boolean} GetCapabilities request is asynchronously lauched or not.
     *      Defauts to *true*
     */
    asynchronousCapabilities: true,

    /**
     * Property: type
     * {String} The type of <Geoportal.Control.AddImageLayer>.
     *     Defaults to *OpenLayers.Control.TYPE_TOGGLE*
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * APIProperty: maxCrsLen
     * {Number} See <Geoportal.Control.AddImageLayer.TRY_CRS_BBOX_WHEN>.
     */
    maxCrsLen: Number.NaN,

    /**
     * Property: request
     * {<OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html>} the current Ajax request.
     */
    request: null,

    /**
     * Constructor: Geoportal.Control.AddImageLayer
     * Build a button for adding an image layer (WMS, ...).
     *
     * Parameters:
     * options - {Object} options to build this control.
     */
    initialize: function(options) {
        Geoportal.Control.Form.prototype.initialize.apply(this, arguments);
        if (!this.supportedClasses) {
            this.supportedClasses= [];
            for (var i= this.SUPPORTED_CLASSES.length-1; i>=0; i--) {
                this.supportedClasses.unshift(this.SUPPORTED_CLASSES[i]);
            }
        }
        if (!this.layerImageOptions) {
            this.layerImageOptions= {};
        }
        if (isNaN(this.maxCrsLen)) {
            this.maxCrsLen= Geoportal.Control.AddImageLayer.TRY_CRS_BBOX_WHEN;
        }
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
     * <form id='__addilayer__{#Id}' name='__addlayer__{#Id}' action='javascript:void(null)'>
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
        f.id= '__addilayer__' + this.id;
        f.name= f.id;
        f.action= 'javascript:void(null)';
        this.addilayer(f);
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
     * Method: addilayer
     * Build the form and add the specified layer.
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id='lbllayerUrl{#Id}' for='layerUrl{#Id}' style='font-weight:bold;'>{#displayClass}.layerUrl</label>
     * <input id='layerUrl{#Id}' name='layerUrl{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helplayerUrl{#Id}' class='gpFormSmall'>{#displayClass}.layerUrl.help</span>
     * <br/>
     * <label id='lbllayerType{#Id}' for='layerType{#Id}' style='font-weight:bold;'>{#displayClass}.layerType</label>
     * <select id='layerType{#Id}' name='layerType{#Id}'>
     *      <option value='{#fld.options[].value}' selected='{#fld.options[].selected}'>{#fld.options[].text}</option>
     * </select>
     * <br/>
     * <span id='helplayerType{#Id}' class='gpFormSmall'>{#displayClass}.layerType.help</span>
     * <br/>
     * <input class='{#displayClass}Button' type='button' id='cancel{#Id}' name='cancel{#Id}'
     *      value='{#displayClass}.button.cancel'/>
     * <input class='{#displayClass}Button' type='button' id='add{#Id}' name='add{#Id}'
     *      value='{#displayClass}.button.add'/>
     * <input class='{#displayClass}Image' type='image' id='wait{#Id}' name='wait{#Id}'
     *      alt='{#displayClass}.imageButton.wait' title='{#displayClass}.imageButton.wait'
     *      src='{#geoportal.img}loading.gif' style="display:none;'/>
     * <div class='{#displayClass}Results' id='results{#Id}' name='results{#Id}' style='display:none;'></div>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addilayer: function(form) {
        this.buildInputTextField(form,{
            id:'layerUrl',
            mandatory:true,
            size:40,
            length:512,
            disabled:false,
            callbacks:[
                {evt:'click',func:this.onClick}
            ]});
        var opts= [];
        for (var i= 0, len= this.supportedClasses.length; i<len; i++) {
            var o= {
                value: this.supportedClasses[i],
                selected: (i==0),
                text: this.getDisplayClass()+'.layerType.'+this.supportedClasses[i].split('.').pop()
            };
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
        var tgt= evt.target || evt.srcElement;
        OpenLayers.Event.stop(evt);
        var es= ['layerUrl', 'layerType'];
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

            var isWMS= h.match(/.*\.Layer\.(WMS|WMTS|WMSC)$/);
            if (isWMS) {
                var url= OpenLayers.Util.getElement('layerUrl' + this.id);
                if (!url) { return false; }
                url= OpenLayers.String.trim(url.value);
                if (url.length==0) { return false; }
                this.wImg.style.display= '';
                // WMS GetCapabilities : application/vnd.ogc.wms_xml
                this.request= OpenLayers.Request.GET({
                    async:this.asynchronousCapabilities,
                    url:url,
                    params:{
                        'SERVICE': isWMS[1]!='WMTS'? 'WMS':'WMTS',
                        'REQUEST': 'GetCapabilities'
                    },
                    success: this.successedInLoadingUrl,
                    failure: this.failedOnLoadingUrl,
                    scope:{'cntrl':this, 'serviceType':isWMS[1]}
                });
            } else {
                OpenLayers.Console.userError('type '+h+' not supported');
                this.closeForm();
            }
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
    },

    /**
     * APIMethod: successedInLoadingUrl
     * Called when successfully getting the url, it is now time to parse.
     *      Context:
     *      * cntrl: this control;
     *      * serviceType: the service's type.
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

        var isWMTS= this.serviceType=='WMTS';
        var capsClass= isWMTS? OpenLayers.Format.WMTSCapabilities : OpenLayers.Format.WMSCapabilities;
        var capsOpts= {};
        switch (this.serviceType) {
        case 'WMSC':
            capsOpts= {
                profile:'WMSC'
            };
            break;
        default    :
            break;
        }
        var capsFmt= new capsClass(capsOpts);
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
        var isUnknownService= false;
        switch (this.serviceType) {
        case 'WMTS':
            isUnknownService= (!(caps.operationsMetadata && caps.operationsMetadata.GetTile));
            break;
        default    :
            isUnknownService= (!(caps.capability && caps.capability.request && caps.capability.request.getmap));//not a WMS
            break;
        }
        if (isUnknownService) {
            this.cntrl.request= null;
            this.cntrl.wImg.style.display= 'none';
            OpenLayers.Console.userError(request.responseText);
            //OpenLayers.i18n('ogc.caps.unknown.service',{serviceType:caps.service.name||'',expectedType:'WMS'});
            return;
        }
        this.cntrl.request= null;

        var entries= isWMTS? caps.contents : caps.capability;
        var e= OpenLayers.Util.getElement('results' + this.cntrl.id);
        e.innerHTML= '';//clean up
        // Display layers list and choose one ...
        // loop over them - display only if srs is compatible :
        var lrComp= 0;
        var mx= this.cntrl.map.getMaxExtent();
        // sort layers by title:
        entries.layers.sort(function(a,b){return b.title < a.title;});
        for (var i= 0, len= entries.layers.length; i<len; i++) {
            var lyr= entries.layers[i];
            var bbox= null;
            var ms= null;
            var p= null;

            if (!isWMTS) {
                if (lyr.llbbox && lyr.llbbox.length>0) {
                    bbox= OpenLayers.Bounds.fromArray(lyr.llbbox);
                    bbox.transform(OpenLayers.Projection.CRS84, this.cntrl.map.getProjection());
                }
                if (!bbox && lyr.bbox) {
                    for (var crs in lyr.bbox) {
                        p= new OpenLayers.Projection(crs);
                        if (this.cntrl.map.getProjection().isCompatibleWith(p)) {
                            bbox= OpenLayers.Bounds.fromArray(lyr.bbox[crs].bbox);
                            break;
                        }
                    }
                }
            } else {
                // only handle image formats ...
                var fmtOk= false;
                for (var ifmt= 0, lfmt= lyr.formats.length; ifmt<lfmt; ifmt++) {
                    if (OpenLayers.Layer.WMTS.prototype.formatSuffixMap[lyr.formats[ifmt]]) {
                        fmtOk= true;
                        break;
                    }
                }
                if (!fmtOk) {
                    continue;
                }
                if (lyr.boundingBoxes) {
                    for (var ibx= 0, lbx= lyr.boundingBoxes.length; ibx<lbx; ibx++) {
                        var bx= lyr.boundingBoxes[ibx];
                        if (bx.crs) {
                            p= new OpenLayers.Projection(bx.crs);
                            if (this.cntrl.map.getProjection().isCompatibleWith(p)) {
                                bbox= bx.bounds.clone();
                                break;
                            }
                        }
                    }
                }
                if (!bbox) {
                    var matrixSets= entries.tileMatrixSets;
                    for (var itms= 0, ltms= lyr.tileMatrixSetLinks.length; itms<ltms; itms++) {
                        var tmsl= lyr.tileMatrixSetLinks[itms];
                        var tms= tmsl.tileMatrixSet;
                        ms= matrixSets[tms];
                        // IGN's WMTS bug : epsg:nnnn instead of EPSG:nnnn
                        var crs= ms.supportedCRS.replace(/epsg/,"EPSG");
                        p= new OpenLayers.Projection(crs);
                        if (this.cntrl.map.getProjection().isCompatibleWith(p)) {
                            var zx= ms.matrixIds.length-1;
                            var mid= ms.matrixIds[zx];
                            // OpenLayers.Format.WMTSCapabilities takes care
                            // of axis order (EPSG:4326 only for the moment)
                            var lt= mid.topLeftCorner;
                            // bug in Geoserver GeoWebCache ?
                            if (p.getProjName()=='longlat') {
                                if (lt.lat==-180) {
                                    var _lat= lt.lat;
                                    lt.lat= lt.lon;
                                    lt.lon= _lat;
                                }
                                if (lt.lon<-180) {lt.lon= -180;}
                                if (lt.lon> 180) {lt.lon=  180;}
                                if (lt.lat< -90) {lt.lat=  -90;}
                                if (lt.lat>  90) {lt.lat=   90;}
                            }
                            var res= 0.00028*mid.scaleDenominator
                                    /(OpenLayers.METERS_PER_INCH*OpenLayers.INCHES_PER_UNIT[p.getUnits()]);
                            var tlon= 1;
                            if (tmsl.limits &&
                                tmsl.limits[tms+''+zx].maxTileCol!=undefined &&
                                tmsl.limits[tms+''+zx].minTileCol!=undefined) {
                                tlon= tmsl.limits[tms+''+zx].maxTileCol - tmsl.limits[tms+''+zx].minTileCol + 1;
                            } else if (mid.matrixWidth!=undefined) {
                                tlon= mid.matrixWidth;
                            }
                            var tlat= 1;
                            if (tmsl.limits &&
                                tmsl.limits[tms+''+zx].maxTileRow!=undefined &&
                                tmsl.limits[tms+''+zx].minTileRow!=undefined) {
                                tlat= tmsl.limits[tms+''+zx].maxTileRow - tmsl.limits[tms+''+zx].minTileRow + 1;
                            } else if (mid.matrixHeight!=undefined) {
                                tlat= mid.matrixHeight;
                            }
                            bbox= new OpenLayers.Bounds(
                                lt.lon,                         // left
                                lt.lat-res*mid.tileHeight*tlat, // bottom
                                lt.lon+res*mid.tileWidth*tlon,  // right
                                lt.lat);                        // top
                            break;
                        }
                    }
                }
            }
            if (!bbox) {// No compatible CRS found ...
                continue;
            }
            // Out of map's bounds ...
            bbox.transform(p, this.cntrl.map.getProjection());
            if (!mx.containsBounds(bbox,true,true) &&
                !bbox.containsBounds(mx,true,true)) {
                continue;
            }

            var compatCrs= {};
            var compatCrsLen= 0;
            if (!isWMTS) {
                // Find "best" CRS ... Some badly configured WMS have long long
                // list of CRS that slow down or completely block the parsing.
                // If there are not too many CRS, try them, otherwise try bboxes
                // as there are not too many bboxes ...
                for (var crs in lyr.srs) {
                    if (this.cntrl.map.getProjection().isCompatibleWith(crs)) {
                        compatCrs[crs]= {
                            'p':lyr.srs[crs],
                            'i':-1
                        };
                        compatCrsLen++;
                        lrComp++;
                    }
                }
            } else {
                var matrixSets= entries.tileMatrixSets;
                for (var itms= 0, ltms= lyr.tileMatrixSetLinks.length; itms<ltms; itms++) {
                    ms= matrixSets[lyr.tileMatrixSetLinks[itms].tileMatrixSet];
                    // IGN's WMTS bug : epsg:nnnn instead of EPSG:nnnn
                    var crs= ms.supportedCRS.replace(/epsg/,"EPSG");
                    p= new OpenLayers.Projection(crs);
                    if (this.cntrl.map.getProjection().isCompatibleWith(p)) {
                        compatCrs[crs]= {
                            'p':p,
                            'i':itms
                        };
                        compatCrsLen++;
                        lrComp++;
                    }
                }
            }
            if (compatCrsLen>0) {
                var crs= null;
                if (this.cntrl.map.getProjection().projCode in compatCrs) {
                    crs= this.cntrl.map.getProjection().projCode;
                }
                if (!crs && Geoportal.Catalogue.TERRITORIES && this.cntrl.map.baseLayer.territory) {
                    var dps= Geoportal.Catalogue.TERRITORIES[this.cntrl.map.baseLayer.territory].displayCRS;
                    for (var is= 0, slen= dps.length; is<slen; is++) {
                        if (dps[is] in compatCrs) {
                            crs= dps[is];
                            break;
                        }
                    }
                }
                if (!crs) {
                    // take the first !
                    for (crs in compatCrs) {
                        break;
                    }
                }
                var r= this.cntrl.div.ownerDocument.createElement('div');
                r.className= 'gpWMSCapsLayersResult';
                if ((lrComp%2)==1) {
                    r.className+= 'Alternate';
                }
                var s= this.cntrl.div.ownerDocument.createElement('span');
                s.innerHTML= lyr.title+' ('+crs+')';
                s.style.cursor= 'pointer';
                var context= {
                    cntrl: this.cntrl,
                    serviceType: this.serviceType,
                    caps: caps,
                    layerIndex: i,
                    crs: crs,
                    matrixSetIndex: compatCrs[crs].i
                };
                OpenLayers.Event.observe(
                        s,
                        "click",
                        OpenLayers.Function.bindAsEventListener(this.cntrl.onLayerNameClick,context));
                r.appendChild(s);
                e.appendChild(r);
            }
        }
        if (lrComp==0) {
            var r= this.cntrl.div.ownerDocument.createElement('div');
            r.className= 'gpWMSCapsLayersResult';
            var s= this.cntrl.div.ownerDocument.createElement('span');
            s.innerHTML= OpenLayers.i18n('wms.caps.no.compatible.srs');
            r.appendChild(s);
            e.appendChild(r);
        }
        this.cntrl.wImg.style.display= 'none';
        e.style.display= '';
    },

    /**
     * Method: calculateNativeResolutions
     * Try to find out minZoomLevel, maxZoomLevel and fill nativeResolutions
     * accordingly.
     *
     * Parameters:
     * rs - {Array({Float})} the layer's resolutions (in map's projection)
     * options - {Object} the options to calculate
     *
     * Returns:
     * {Object} options updated.
     */
    calculateNativeResolutions: function(rs, options) {
        var rmax= this.map.resolutions[options.minZoomLevel],
            rmin= this.map.resolutions[options.maxZoomLevel];
        //  (1)
        //   +
        //   |        (4)
        //   +      +  +
        // + -------|--|------- rmax @ minZoomLevel
        // |        |  +   (6)
        // |        |       +
        // .        .       |
        // |        |   (5) |
        // |        |    +  +
        // +--------|----|----- rmin @ maxZoomLevel
        //     (2)  +    +
        //      +  (3)
        //      |
        //      +
        if (rs[rs.length-1]>rmax || rs[0]<rmin) {
                // (1) lowest resolution is greater than Geoportal's highest
                // (2) highest resolution is lower than Geoportal's lowest
                // => layer never visible
                options.minZoomLevel= this.map.baseLayer.maxZoomLevel+1;
                options.maxZoomLevel= this.map.baseLayer.maxZoomLevel+1;
        } else {
            if (rs[0]>=rmax) {//=>minZoomLevel OK
                ;//(3)||(4)
            } else {
                //(5)||(6)
                do {
                    options.minZoomLevel++;
                    rmax= this.map.resolutions[options.minZoomLevel];
                } while (rs[0]<rmax && options.minZoomLevel<options.maxZoomLevel);
            }
            if (rs[rs.length-1]<=rmin) {//maxZoomLevel OK
                ;//(3)||(5)
            } else {
                //(4)||(6)
                do {
                    options.maxZoomLevel--;
                    rmin= this.map.resolutions[options.maxZoomLevel];
                } while (rs[rs.length-1]>rmin && options.maxZoomLevel>options.minZoomLevel);
            }
        }
        // add dummy resolutions to match baselayer's resolutions length :
        for (var i= 0, l= options.minZoomLevel-1; i<l; i++) {
            options.nativeResolutions.unshift(0);
        }
        for (var i= options.maxZoomLevel+1, l= Geoportal.Catalogue.RESOLUTIONS.length-1; i<l; i++) {
            options.nativeResolutions.push(0);
        }

        return options;
    },

    /**
     * Method: onLayerNameClick
     * Builds the chosen layer.
     *
     * Parameters:
     * evt - {Event}
     *
     * Context:
     * cntrl - {<Geoportal.Control.AddImageLayer>}
     * serviceType - {String}
     * caps - {<OpenLayers.Format.WMSCapabilities at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/WMSCapabilities-js.html>}
     * layerIndex - {Integer}
     * crs - {String}
     * matrixSetIndex - {Integer}
     */
    onLayerNameClick: function(evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        this.cntrl.wImg.style.display= '';
        var isWMTS= this.serviceType=='WMTS';
        var lyr= isWMTS? this.caps.contents.layers[this.layerIndex] : this.caps.capability.layers[this.layerIndex];
        if (!isWMTS) {
            if (this.caps.capability.vendorSpecificCaps && this.caps.capability.vendorSpecificCaps.tileSets) {
                this.serviceType= 'WMSC';
            }
        }
        // Check Geoportal's WMTS :
        var lyrPrms= this.cntrl.map.catalogue.getLayerParameters(this.cntrl.map.baseLayer.territory, lyr.identifier+':'+this.serviceType);
        if (lyrPrms) {
            // it is a Geoportal's layer :
            this.cntrl.map.getApplication().addGeoportalLayer(lyrPrms.resourceId,{
                visibility:true,
                view:{
                    drop:true,
                    zoomToExtent:true
                }
            });
            if (this.cntrl.map.getZoom()<lyrPrms.options.minZoomLevel) {
                this.cntrl.map.zoomTo(lyrPrms.options.minZoomLevel);
            } else {
                if (lyrPrms.options.maxZoomLevel<this.cntrl.map.getZoom()) {
                    this.cntrl.map.zoomTo(lyrPrms.options.maxZoomLevel);
                }
            }
            this.cntrl.closeForm();
            return;
        }
        var crs= this.crs;
        var params= {
            'VERSION':this.caps.version
        };
        if (!isWMTS) {
            params.LAYERS= lyr.name;
            var opts= {
                'application/vnd.ogc.se_inimage':false,
                'application/vnd.ogc.se_blank'  :false,
                'application/vnd.ogc.se_xml'    :false
            };
            for (var fi=0, fl= this.caps.capability.exception.formats.length; fi<fl; fi++) {
                opts[this.caps.capability.exception.formats[fi]]= true;
            }
            params.exceptions=
                opts['application/vnd.ogc.se_inimage']?
                    'application/vnd.ogc.se_inimage'
                :   opts['application/vnd.ogc.se_blank']?
                    'application/vnd.ogc.se_blank'
                :   'application/vnd.ogc.se_xml';// FIXME
        } else {
            params.layer= lyr.identifier;
        }
        var opts= {
            'image/jpeg':false,
            'image/png' :false,
            'image/gif' :false
        };
        for (var fi=0, fl= lyr.formats.length; fi<fl; fi++) {
            opts[lyr.formats[fi]]= true;
        }
        params.format=
            opts['image/png']?
                'image/png'
            :   opts['image/gif']?
                'image/gif'
            :   'image/jpeg';// FIXME
        if (!isWMTS) {
            if (lyr.opaque==false && params.format!='image/jpeg') {
                params.transparent= true;
            }
            // Get first style :
            if (lyr.styles && lyr.styles.length>0) {
                params.styles= lyr.styles[0].name;
            }
        } else {
            // Get default style :
            for (var si= 0, sl= lyr.styles.length; si<sl; si++) {
                if (lyr.styles[si].isDefault) {
                    params.style= lyr.styles[si].identifier;
                    break;
                }
            }
            if (!params.style) {
                params.style= lyr.styles[0].identifier;
            }
            params.matrixSet= lyr.tileMatrixSetLinks[this.matrixSetIndex].tileMatrixSet;
        }
        var x= null;
        var p= new OpenLayers.Projection(crs);
        var options= {
            projection: crs,
            units: p.getUnits(),
            visibility: true
        };
        if (!isWMTS) {
            if (lyr.bbox[crs]) {
                x= OpenLayers.Bounds.fromArray(lyr.bbox[crs].bbox);
            } else if (lyr.llbbox && lyr.llbbox.length>0) {
                x= OpenLayers.Bounds.fromArray(lyr.llbbox);
                if (p.getProjName()!='longlat' || !OpenLayers.Projection.CRS84.isCompatibleWith(p)) {
                    x.transform(OpenLayers.Projection.CRS84, p);
                }
            }
            options.singleTile= true; // does not prevent too big images, but service DOS
        } else {
            if (lyr.boundingBoxes) {
                for (var ibx= 0, lbx= lyr.boundingBoxes.length; ibx<lbx; ibx++) {
                    var bx= lyr.boundingBoxes[ibx];
                    if (bx.crs) {
                        var bp= new OpenLayers.Projection(bx.crs);
                        if (this.cntrl.map.getProjection().isCompatibleWith(bp)) {
                            x= bx.bounds.clone();
                            // in WMTS 1.0.0.0 axis order is important !
                            if (bp.isAxisInverted()) {
                                var xy= x.left;
                                x.left= x.bottom;
                                x.bottom= xy;
                                xy= x.right;
                                x.right= x.top;
                                x.top= xy;
                            }
                            x.transform(bp,p,true);
                            break;
                        }
                    }
                }
            }
            var tmsl= lyr.tileMatrixSetLinks[this.matrixSetIndex];
            var tms= tmsl.tileMatrixSet;
            var ms= this.caps.contents.tileMatrixSets[tms];
            var zx= ms.matrixIds.length-1;
            var mid= ms.matrixIds[zx];
            // OpenLayers.Format.WMTSCapabilities takes care of axis order
            // (EPSG:4326 only for the moment)
            var lt= mid.topLeftCorner;
            // bug in Geoserver GeoWebCache ?
            if (p.getProjName()=='longlat') {
                if (lt.lat==-180) {
                    var _lat= lt.lat;
                    lt.lat= lt.lon;
                    lt.lon= _lat;
                }
                if (lt.lon<-180) {lt.lon= -180;}
                if (lt.lon> 180) {lt.lon=  180;}
                if (lt.lat< -90) {lt.lat=  -90;}
                if (lt.lat>  90) {lt.lat=   90;}
            }
            if (!x) {
                var res= 0.00028*mid.scaleDenominator
                        /(OpenLayers.METERS_PER_INCH*OpenLayers.INCHES_PER_UNIT[p.getUnits()]);
                var tlon= 1;
                if (tmsl.limits &&
                    tmsl.limits[tms+''+zx].maxTileCol!=undefined &&
                    tmsl.limits[tms+''+zx].minTileCol!=undefined) {
                    tlon= tmsl.limits[tms+''+zx].maxTileCol - tmsl.limits[tms+''+zx].minTileCol + 1;
                } else if (mid.matrixWidth!=undefined) {
                    tlon= mid.matrixWidth;
                }
                var tlat= 1;
                if (tmsl.limits &&
                    tmsl.limits[tms+''+zx].maxTileRow!=undefined &&
                    tmsl.limits[tms+''+zx].minTileRow!=undefined) {
                    tlat= tmsl.limits[tms+''+zx].maxTileRow - tmsl.limits[tms+''+zx].minTileRow + 1;
                } else if (mid.matrixHeight!=undefined) {
                    tlat= mid.matrixHeight;
                }
                x= new OpenLayers.Bounds(
                    lt.lon,                         // left
                    lt.lat-res*mid.tileHeight*tlat, // bottom
                    lt.lon+res*mid.tileWidth*tlon,  // right
                    lt.lat);                        // top
            }
            params.tileOrigin= lt.clone();
            params.tileFullExtent= x.clone();
        }
        options.maxExtent= x;
        switch (this.serviceType) {
        case 'WMS' :
            if (lyr.minScale) {
                options.minZoomLevel= this.cntrl.map.getZoomForResolution(
                    OpenLayers.Util.getResolutionFromScale(lyr.minScale,this.cntrl.map.getProjection().getUnits()));
                if (!this.cntrl.map.isValidZoomLevel(options.minZoomLevel)) {
                    options.minZoomLevel= undefined;
                }
            }
            if (options.minZoomLevel==undefined) {
                options.minZoomLevel= this.cntrl.map.baseLayer.minZoomLevel;
            }
            if (lyr.maxScale) {
                options.maxZoomLevel= this.cntrl.map.getZoomForResolution(
                    OpenLayers.Util.getResolutionFromScale(lyr.maxScale,this.cntrl.map.getProjection().getUnits()));
                if (!this.cntrl.map.isValidZoomLevel(options.maxZoomLevel)) {
                    options.maxZoomLevel= undefined;
                }
            }
            if (options.maxZoomLevel==undefined) {
                options.maxZoomLevel= this.cntrl.map.baseLayer.maxZoomLevel;
            }
            break;
        case 'WMSC':
            var tilesets= this.caps.capability.vendorSpecific.tileSets;
            for (var it= 0, lt= tilesets.length; it<lt; it++) {
                var tileset= tilesets[it];
                if (!(crs in tileset.srs)) {
                    continue;
                }
                // tileset.layers is optional ...
                var found= !(tileset.layers && tileset.layers.length>0)? true:false;
                if (!found) {
                    for (var iln=0, lln= tileset.layers.length; iln<lln; iln++) {
                        if (lyr.name==tileset.layers[iln]) {
                            found= true;
                            break;
                        }
                    }
                }
                if (!found) {
                    continue;
                }
                if (tileset.width!=OpenLayers.Map.TILE_WIDTH || tileset.height!=OpenLayers.Map.TILE_HEIGHT) {
                    options.nativeTileSize= new OpenLayers.Size(tileset.width, tileset.height);
                }
                options.minZoomLevel= this.cntrl.map.baseLayer.minZoomLevel;
                options.maxZoomLevel= this.cntrl.map.baseLayer.maxZoomLevel;
                options.nativeResolutions= tileset.resolutions.slice(0);
                var rs= tileset.resolutions.slice(0);
                if (!p.equals(this.cntrl.map.getProjection())) {
                    var pt= new OpenLayers.LonLat(0,0);
                    for (var i= 0, l= rs.length; i<l; i++) {
                        pt.lon= rs[i]; pt.lat= 0;
                        pt.transform(p,this.cntrl.map.getProjection());
                        rs[i]= parseFloat(pt.lon.toFixed(0));
                    }
                }
                options= this.cntrl.calculateNativeResolutions(rs, options);
                //FIXME: no means by which I can get tileOrigin ?
                // hint: take extent, divide by maxResolution * TILE_WIDTH, if int then 0 aligned ?
                break;
            }
            options.singleTile= false;
            break;
        case 'WMTS':
            var mids= this.caps.contents.tileMatrixSets[lyr.tileMatrixSetLinks[this.matrixSetIndex].tileMatrixSet].matrixIds;
            params.matrixIds= [];
            for (var i= 0, l= mids.length; i<l; i++) {
                var lt= mids[i].topLeftCorner.clone();
                // bug in Geoserver GeoWebCache ?
                if (p.getProjName()=='longlat') {
                    if (lt.lat==-180) {
                        var _lat= lt.lat;
                        lt.lat= lt.lon;
                        lt.lon= _lat;
                    }
                    if (lt.lon<-180) {lt.lon= -180;}
                    if (lt.lon> 180) {lt.lon=  180;}
                    if (lt.lat< -90) {lt.lat=  -90;}
                    if (lt.lat>  90) {lt.lat=   90;}
                }
                params.matrixIds[i]= {
                    identifier:mids[i].identifier,
                    scaleDenominator:mids[i].scaleDenominator,
                    topLeftCorner:lt
                };
            }
            //TC 2013-02-14 : sort matrix scaledenominator desc
            params.matrixIds.sort(function(a,b){return (b.scaleDenominator-a.scaleDenominator)});
            options.nativeTileSize= new OpenLayers.Size(mids[0].tileWidth, mids[0].tileHeight);
            var rs= [];
            var reproject= !(p.equals(this.cntrl.map.getProjection()));
            for (var i= 0, l= params.matrixIds.length; i<l; i++) {
                var res= 0.00028*params.matrixIds[i].scaleDenominator
                        /(OpenLayers.METERS_PER_INCH*OpenLayers.INCHES_PER_UNIT[p.getUnits()]);
                rs.push(res);
            }
            options.minZoomLevel= this.cntrl.map.baseLayer.minZoomLevel;
            options.maxZoomLevel= this.cntrl.map.baseLayer.maxZoomLevel;
            options.nativeResolutions= rs.slice(0);
            if (reproject) {
                var pt= new OpenLayers.LonLat(0,0);
                for (var i= 0, l= rs.length; i<l; i++) {
                    pt.lon= rs[i]; pt.lat= 0;
                    pt.transform(p,this.cntrl.map.getProjection());
                    rs[i]= parseFloat(pt.lon.toFixed(0));
                }
            }
            // TODO: zoomOffset ?
            options= this.cntrl.calculateNativeResolutions(rs, options);
            break;
        default    :
            break;
        }
        //FIXME: WMTS metadata ...
        options.description= [];
        if (lyr.attribution) {
            if (lyr.attribution.title) {
                options.description.push(lyr.attribution.title);
            }
            if (lyr.attribution.href && !lyr.attribution.logo) {
                options.description.push('<a href="' + lyr.attribution.href +'" target="_blank">'+lyr.title+'</a>');
            }
        }
        if (lyr['abstract']) {
            options.description.push(lyr['abstract']);
        }
        if (!isWMTS) {
            options.originators= [{ logo:'logo'+(lyr.name) }];
            if (lyr.attribution && lyr.attribution.logo && lyr.attribution.logo.href) {
                options.originators[0].pictureUrl= lyr.attribution.logo.href;
            } else {
                options.originators[0].pictureUrl= Geoportal.Util.getImagesLocation()+'logo_unknownAuthority.gif';
            }
            if (lyr.attribution && lyr.attribution.href) {
                options.originators[0].url= lyr.attribution.href;
            } else {
                if (lyr.AuthorityURL && lyr.AuthorityURL[0] && lyr.AuthorityURL[0].href) {
                    options.originators[0].url= lyr.AuthorityURL[0].href;//FIXME: all?
                } else {
                    options.originators[0].url= 'javascript:void(0)' ;
                }
            }
            if (lyr.metadataURLs && lyr.metadataURLs.length>0) {
                options.metadataURL= [];
                for (var j= 0, lj= lyr.metadataURLs.length; j<lj; j++) {
                    options.metadataURL.push(lyr.metadataURLs[j].href);
                }
            }
            if (lyr.dataURLs && lyr.dataURLs.length>0) {
                options.dataURL= [];
                for (var j= 0, lj= lyr.dataURLs.length; j<lj; j++) {
                    options.dataURL.push(lyr.dataURLs[j].href);
                }
            }
        }
        if (lyr.styles && lyr.styles.length>0) {
            options.legends= [];
            for (var i= 0, l= lyr.styles.length, j= 0; i<l; i++) {
                var stylyr= lyr.styles[i];
                if (stylyr.legend && stylyr.legend.href) {
                    options.legends[j]= {
                        style : stylyr.name,
                        title : stylyr.title,
                        href  : stylyr.legend.href,
                        width : stylyr.legend.width,
                        height: stylyr.legend.height
                    };
                    ++j;
                }
            }
            if (options.legends.length==0) { options.legends= null; }
        }
        // WMSGetFeatureInfo :
        if (this.serviceType=='WMS' && this.caps.capability.request.getfeatureinfo) {
            var gfi= this.caps.capability.request.getfeatureinfo;
            var fmts= ['text/html','application/vnd.ogc.gml','text/plain'], ifmt, lfmts;
            for (ifmt= 0, lfmts= fmts.length; ifmt<lfmts; ifmt++) {
                if (OpenLayers.Util.indexOf(gfi.formats, fmts[ifmt])!=-1) {
                    break;
                }
            }
            if (ifmt!=lfmts) {
                options.afterAdd= function() {
                    //this===layer
                    var blc= this.map.getControlsBy('id', 'basic_'+this.id)[0];
                    if (!blc) { return ; } //FIXME: global event listener ?
                    var wic= new OpenLayers.Control.WMSGetFeatureInfo({
                        url: gfi.href,
                        layers:[this],
                        title: 'OpenLayers.Control.WMSGetFeatureInfo.title',
                        type: OpenLayers.Control.TYPE_BUTTON,
                        queryVisible: true,
                        infoFormat: fmts[ifmt],
                        maxFeatures: 1,
                        eventListeners: {
                            getfeatureinfo: function(evt) {
                                //this===control
                                var txt= '';
                                if (typeof(evt.features)!='undefined') {
                                    for (var i= 0, l= evt.features.length; i<l; i++) {
                                        var T= Geoportal.Control.renderFeatureAttributes(evt.features[i]);
                                        txt+= '<div class="gpPopupHead">' + T[0] + '</div>' +
                                              '<div class="gpPopupBody">' + T[1] + '</div>';
                                    }
                                } else {
                                    if (evt.text) {
                                        txt=
                                            evt.object.infoFormat=='text/plain'?
                                                '<div class="gpPopupBody">' +
                                                    evt.text.replace(/[\r\n]/g,'<br/>').replace(/ /g,'&nbsp;') +
                                                '</div>'
                                            :   evt.text;
                                    }
                                }
                                if (txt) {
                                    this.map.addPopup(new OpenLayers.Popup.FramedCloud(
                                        "chicken",
                                        this.map.getLonLatFromPixel(evt.xy),
                                        null,
                                        Geoportal.Util.cleanContent(txt),
                                        null,
                                        true));
                                }
                            }
                        },
                        trigger: function() {
                            //this===control
                            if (this.active) {
                                this.deactivate();
                            } else {
                                this.activate();
                            }
                        }
                    });
                    blc.addControls([wic]);
                }
            }
        }
        //FIXME: caps.service -> mtd ?
        this.cntrl.wImg.style.display= 'none';

        var vlayer= this.cntrl.map.addLayer(
            this.serviceType==='WMSC'? 'WMS-C' : this.serviceType,
            lyr.title,
            !isWMTS?
                this.caps.capability.request.getmap.href
            :   this.caps.operationsMetadata.GetTile.dcp.http.get[0].url,
            params,
            OpenLayers.Util.extend(options,this.cntrl.layerImageOptions)
        );
        //this.cntrl.map.zoomToExtent(vlayer.getDataExtent());
        
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
        this.cntrl.closeForm();
        OpenLayers.Console.userError(request.statusText);
    },

    /**
     * Method: abortRequest
     * Stops the current request against the underlaying W*S service.
     */
    abortRequest: function() {
        if (this.request) {
            this.request.abort();
            this.request= null;
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.AddImageLayer"*
     */
    CLASS_NAME: "Geoportal.Control.AddImageLayer"
});

/**
 * Constant: Geoportal.Control.AddImageLayer.TRY_CRS_BBOX_WHEN
 * {Number} Maximum of coordinate reference systems declared on a layer for
 * which BBOX's coordinate reference systems are first checked for compliancy
 * with the current map's projection.
 *      Default to *50*
 */
Geoportal.Control.AddImageLayer.TRY_CRS_BBOX_WHEN= 50;

