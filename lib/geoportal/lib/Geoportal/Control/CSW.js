/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Form.js
 * @requires Geoportal/Control/Floating.js
 * @requires Geoportal/Control/PageManager.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.CSW
 * Control for talking with a Catalogue Service for the Web (ISO AP) service.
 *      Still experimental.
 *
 * Inherits from:
 * - <Geoportal.Control.Form>
 */
Geoportal.Control.CSW= OpenLayers.Class( Geoportal.Control.Form, {

    /**
     * Property: type
     * {String} The type of <OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>
     *     Defaults to *OpenLayers.Control.TYPE_TOGGLE*
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * Property: bBoxViewer
     * {<Geoportal.Viewer>} the map supporting BBOX acquisition.
     */
    bBoxViewer: null,

    /**
     * Property: bboxMapDiv
     * {DOMElement} the div supporting the bBoxViewer.
     */
    bboxMapDiv: null,

    /**
     * APIProperty: cswUrl
     * {String} URL of the queried CSW
     *      Defaults to *"http://www.geocatalogue.fr/api-public/servicesRest"*
     */
    cswUrl: "http://www.geocatalogue.fr/api-public/servicesRest",

    /**
     * Property: getRecordsString
     * {String} the string for the global request
     */
    getRecordsString : "",

    /**
     * Property: request
     * {<OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html>} the current Ajax request.
     */
    request: null,

    /**
     * APIProperty: maxRecords
     * {Integer} Value of the maxRecords attribute of the GetRecords element,
     *     specifies the maximum number of records in the GetRecords response,
     *     10 is the default.
     */
    maxRecords: 10,

    /**
     * Constructor: Geoportal.Control.CSW
     * Build a button for searching an Catalogue Service for the Web (ISO API) service.
     *
     * Parameters:
     * options - {Object} options to build this control.
     */
    initialize: function(options) {
        Geoportal.Control.Form.prototype.initialize.apply(this, [options]);
    },

    /**
     * APIMethod: destroy
     * Clean the control.
     */
    destroy: function() {
        this.abortRequest();
        this.bboxMapDiv= null;
        Geoportal.Control.Form.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: activate
     * Add the form to query locations and install the callback for getting
     * responses back.
     *      The form is as follows :
     *
     * (start code)
     * <form id='__searchcsw__{#Id}' name='__searchcsw__{#Id}' action='javascript:void(null)'>
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
        f.id= '__searchcsw__' + this.id;
        f.name= f.id;
        f.action= 'javascript:void(null)';
        this.loadContent(f);
        this.map.addControl(this.formControl);
        this.formControl.activate();
        this.formControl.addContent(f);
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
        //FIXME: bBoxMap.destroy();
        this.bboxViewer= null;
        return Geoportal.Control.Form.prototype.deactivate.apply(this,arguments);
    },

    /**
     * Method: loadContent
     * Build the form, send the request and display results.
     *      The form's structure must end with the following content :
     *
     * (start code)
     * <label id='lblcswTitle{#Id}' for='cswTitle{#Id}'>{#displayClass}.cswTitle</label>
     * <input id='cswTitle{#Id}' name='cswTitle{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='60'/>
     * <br/>
     * <span id='helpname{#Id}' class='gpFormSmall'>{#displayClass}.name.help</span>
     * <br/>
     * <label id='lblcswKeyWords{#Id}' for='cswKeyWords{#Id}' style='font-weight:bold;'>
     *      {#displayClass}.cswKeyWords
     *      <select id='cswKeyWords{#Id}' name='cswKeyWords{#Id}' class=''>
     *          <option value='{#fld.options[].value}' selected='{#fld.options[].selected}' class='{#fld.css}'>{#fld.options[].text}</option>
     *      </select>
     * </label>
     * <br/>
     * <span id='helpcswKeyWords{#Id}' * class='gpFormSmall'>{#displayClass}.cswKeyWords.help</span>
     * <br/>
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
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    loadContent: function(form) {
        this.buildInputTextField(form,{
            id:'cswTitle',
            mandatory:false,
            size:60,
            callbacks:[
                {evt:'click',func:this.onFocus}
            ],
            value:''});

        var themes= ["NoKeyWords","Addresses","AdministrativeUnits","Agricultural","RegulationZones","Atmospheric","BioGeographical","Buildings","Cadastral","CoordinateSystems","Elevation","Energy","EnvironmentalFacilities","GeographicalSystems","GeographicalNames","Geology","Habitats","HumanHealth","Hydrography","LandCover","LandUse","Meteorological","Mineral","NaturalRiskZones","Oceanographic","Orthoimagery","Population","Production","ProtectedSites","SeaRegions","Soil","SpeciesDistribution","StatisticalUnits","TransportNetworks","UtilityServices"];
        var keyWords= [];
        for (var i= 0, l= themes.length; i<l; i++) {
            var o= {
                value: OpenLayers.i18n('gpControlCSW.cswKeyWords.'+themes[i]),
                selected: false,
                text: OpenLayers.i18n('gpControlCSW.cswKeyWords.'+themes[i])
            };
            keyWords.push(o);
        }
        this.buildSelectField(form,{
            id:'cswKeyWords',
            length:5,
            multiple:true,
            mandatory:false,
            options:keyWords,
            callbacks:[
                {evt:'click',func:this.onFocus}
            ]});

        this.buildInputTextField(form,{
            id:'cswOrganism',
            mandatory:false,
            size:60,
            callbacks:[
                {evt:'click',func:this.onFocus}
            ],
            value:''});

        this.buildRadioFields(form,{
            id:'cswBBOX',
            radios:[
                {
                    id:'cswNoBBOX',
                    checked:true,
                    callbacks:[
                        {evt:'click', func:this.hideBBOXMap}
                    ]
                },
                {
                    id:'cswCurrentBBOX',
                    callbacks:[
                        {evt:'click', func:this.hideBBOXMap}
                    ]
                },
                {
                    id:'cswPersonnalBBOX',
                    callbacks:[
                        {evt:'click', func:this.onClick}
                    ]
                }]});

        this.bboxMapDiv= form.ownerDocument.createElement('div');
        this.bboxMapDiv.id= 'bboxMap' + this.id;
        this.bboxMapDiv.className= this.getDisplayClass()+'BBOX';
        this.bboxMapDiv.style.display= 'none';
        form.appendChild(this.bboxMapDiv);
        form.appendChild(form.ownerDocument.createElement('br'));

        this.buildButton(form,'cancel',this.closeForm);
        this.buildButton(form,'search',this.onSearchClick,13);//RETURN keycode==13
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
     * Method: onFocus
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onFocus: function(element,evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        var es= ['cswTitle', 'cswKeyWords', 'cswOrganism'];
        var em= '^('+es.join('|')+')';
        var er= new RegExp(em);
        if (element.id.match(er) && OpenLayers.String.contains(element.id,this.id)) {
            if (!element.hasFocus) {
                this.resultDiv.style.display= "none";
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
    },

    /**
     * Method: onClick
     * display the map for selecting bbox when the radio input is selected
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onClick : function(evt) {
        this.resultDiv.style.display= "none";

        this.bboxMapDiv.style.display= "";
        if (this.bboxViewer==null) {
            //FIXME: no GEOGRAPHICALGRIDSYSTEMS.MAPS:WMSC
            var rm= {
                apiKey:[]
            };
            var lyr= 'GEOGRAPHICALGRIDSYSTEMS.MAPS:WMSC';
            for (var i= 0, l= this.map.catalogue.apiKey.length; i<l; i++) {
                var k= this.map.catalogue.apiKey[i];
                rm.apiKey.push(k);
                var georm= this.map.catalogue[k]||{};
                rm[k]= {
                    tokenServer:georm.tokenServer||'http://localhost/',
                    tokenTimeOut:georm.tokenTimeOut||60000,
                    transport:georm.transport||'json',
                    bounds:(georm.bounds||new OpenLayers.Bounds(-180,-90,180,90)).toArray(),
                    resources:{},
                    allowedGeoportalLayers:[]
                };
                if (georm.layers.hasOwnProperty(lyr)) {
                    rm[k].resources[lyr]= OpenLayers.Util.applyDefaults({}, georm.layers[lyr]);
                    rm[k].allowedGeoportalLayers.push(lyr);
                }
            }
            var selectCntrl= new OpenLayers.Control.ZoomBox({keyMask: OpenLayers.Handler.MOD_CTRL});
            var opts= OpenLayers.Util.extend({
                mode: 'mini',
                territory: this.map.baseLayer.territory,
                projection: this.map.getProjection(),//current projection
                controls:[selectCntrl,new OpenLayers.Control.Navigation()],
                nameInstance: 'bboxViewer',
                // prevent loading CSSes as they are already loaded !
                loadTheme: function() {}
                },rm);
            this.bboxViewer= new Geoportal.Viewer.Default(this.bboxMapDiv.id, opts);
            // initialize viewer:
            if (this.bboxViewer) {
                this.bboxViewer.addGeoportalLayer(lyr,{opacity:1.0, visibility:true});
                selectCntrl.activate();
                (this.bboxViewer.getMap().getControlsByClass('Geoportal.Control.PermanentLogo')[0]).destroy();
                (this.bboxViewer.getMap().getControlsByClass('Geoportal.Control.TermsOfService')[0]).destroy();
            } else {
                selectCntrl.destroy();
                this.bboxMapDiv.style.display= 'none';
            }
        }
        if (this.bboxViewer) {
            var c= this.map.getCenter().transform(this.map.getProjection(), OpenLayers.Projection.CRS84);
            var z= Math.max(this.map.getZoom()-4, 0);
            this.bboxViewer.getMap().setCenterAtLonLat(c.lon, c.lat, z);
        }
    },

    /**
     * Method: hideBBOXMap
     * Hide the map for selecting bbox
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    hideBBOXMap: function(evt) {
        this.resultDiv.style.display= "none";
        this.bboxMapDiv.style.display= "none";
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
        this.getRecordsString= "";
        this.manager= null;

        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);

        var title= OpenLayers.String.trim(OpenLayers.Util.getElement('cswTitle'+this.id).value);

        var keyWords= [];
        var e= OpenLayers.Util.getElement('cswKeyWords'+this.id);
        for (var i= 0, l= e.options.length; i<l; i++) {
            if (e.options[i].selected) {
                keyWords.push(OpenLayers.String.trim(OpenLayers.String.stripAccentedLetters(e.options[i].value)));
            }
        }

        var organism= OpenLayers.String.trim(OpenLayers.Util.getElement('cswOrganism'+this.id).value);

        var bbox= null;
        var supportMap= null;
        if (OpenLayers.Util.getElement('cswCurrentBBOX'+this.id).checked) {
            supportMap= this.map;
        } else if (OpenLayers.Util.getElement('cswPersonnalBBOX' + this.id).checked) {
            supportMap= this.bboxViewer.getMap();
        }
        if (supportMap) {
            bbox= supportMap.getExtent().transform(supportMap.getProjection(),OpenLayers.Projection.CRS84);
        }
        if (OpenLayers.Util.getElement('cswNoBBOX'+this.id).checked) {
            bbox= new OpenLayers.Bounds(-180,-90,180,90);
        }

        if (title!="" || keyWords.length>=1 || organism!="" || bbox!= null) {
            this.getRecords(title,keyWords,organism,bbox,1);
        }

        return false;
    },

    /**
     * Method: getRecords
     * Send the getRecords request with filters
     *
     * Parameters:
     * title - {String} title of the researched metadata.
     * keyWords - {Array({String})} list of keywords of the researched metadata.
     * organism - {String} organism of the researched metadata.
     * bbox - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} bbox of the researched metadata.
     * startPosition - {Integer} startPosition parameter of the getRecords request.
     */
    getRecords: function(title,keyWords,organism,bbox,startPosition) {
        var getRecords=
            '<?xml version="1.0" encoding="UTF-8"?>' +
            '<GetRecords service="CSW" version="2.0.2" maxRecords="';
        if (this.getRecordsString == "") {
            // FIXME: Pourquoi pas outputSchema="http://www.isotc211.org/2005/gmd" ?
            getRecords += this.maxRecords +'" startPosition="'+ startPosition;

            this.getRecordsString= '" resultType="results" ' +
                    'outputFormat="application/xml" outputSchema="http://www.opengis.net/cat/csw/2.0.2" '+
                    'xmlns="http://www.opengis.net/cat/csw/2.0.2" xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" ' +
//                    'xmlns:apiso="http://www.opengis.net/cat/csw/apiso/1.0" ' +
                    'xmlns:ows="http://www.opengis" ' +
                    'xmlns:ogc="http://www.opengis.net/ogc" ' +
                    'xmlns:gml="http://www.opengis.net/gml" ' +
                    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/" ' +
                    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xsi:schemaLocation="'+
                        'http://www.opengis http://schemas.opengis.net/ows/1.0.0/owsAll.xsd ' +
                        'http://www.opengis.net/ogc http://schemas.opengis.net/filter/1.1.0/filter.xsd ' +
                        'http://purl.org/dc/elements/1.1/ http://schemas.opengis.net/csw/2.0.2/rec-dcmes.xsd ' +
                        'http://purl.org/dc/terms/ http://schemas.opengis.net/csw/2.0.2/rec-dcterms.xsd ' +
                        'http://www.opengis.net/gml http://schemas.opengis.net/gml/3.1.1/base/geometryAggregates.xsd ' +
//                        'http://www.opengis.net/cat/csw/apiso/1.0 http://schemas.opengis.net/csw/2.0.2/profiles/apiso/1.0.0/apiso.xsd ' +
                        'http://www.opengis.net/cat/csw/2.0.2 http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd">' +
                  '<Query typeNames="csw:Record">' +
                    '<ElementSetName typeNames="">brief</ElementSetName>' +
                    '<Constraint version="1.1.0">' +
                      '<ogc:Filter>' +
                        '<ogc:And>';

            //traitement du titre
            if (title!="") {
                this.getRecordsString +=
                            '<ogc:Or>';
                var tabTitle= OpenLayers.String.stripAccentedLetters(title).split(" ");
                for (var i= 0, l= tabTitle.length; i<l; i++) {
                    if (tabTitle[i]!="") {
                        this.getRecordsString +=
                                '<ogc:PropertyIsLike wildCard="%" singleChar="_" escapeChar="\\">' +
                                    '<ogc:PropertyName>dc:title</ogc:PropertyName>' +
                                    '<ogc:Literal>%'+tabTitle[i]+'%</ogc:Literal>' +
                                '</ogc:PropertyIsLike>';
                        }
                }
                this.getRecordsString +=
                            '</ogc:Or>';
            }

            //traitement de chaque mots-clés
            for (var i= 0, l= keyWords.length; i<l; i++) {
                var keyWord= keyWords[i];
                if (keyWord!="") {
                    this.getRecordsString +=
                            '<ogc:Or>';
                    // extraction de chaque mot du mot-clé
                    var tabKeyWord= keyWord.split(" ");
                    for (var j= 0, lj= tabKeyWord.length; j<lj; j++) {
                        if (tabKeyWord!="de" &&
                            tabKeyWord!="et" &&
                            tabKeyWord!="le" &&
                            tabKeyWord!="la") {
                            this.getRecordsString +=
                                '<ogc:PropertyIsLike wildCard="%" singleChar="_" escapeChar="\\">' +
                                    '<ogc:PropertyName>dc:subject</ogc:PropertyName>' +
                                    '<ogc:Literal>%'+tabKeyWord[j]+'%</ogc:Literal>' +
                                '</ogc:PropertyIsLike>';
                        }
                    }
                    this.getRecordsString +=
                            '</ogc:Or>';
                }
            }

            //traitement de l'organisme
            if (organism!="") {
                this.getRecordsString +=
                            '<ogc:Or>' +
//                                '<ogc:PropertyIsLike wildCard="%" singleChar="_" escapeChar="\\">' +
//                                    '<ogc:PropertyName>dc:creator</ogc:PropertyName>' +
//                                    '<ogc:Literal>%'+organism+'%</ogc:Literal>' +
//                                '</ogc:PropertyIsLike>' +
//                                '<ogc:PropertyIsLike wildCard="%" singleChar="_" escapeChar="\\">' +
//                                    '<ogc:PropertyName>dc:publisher</ogc:PropertyName>' +
//                                    '<ogc:Literal>%'+organism+'%</ogc:Literal>' +
//                                '</ogc:PropertyIsLike>' +
                                '<ogc:PropertyIsLike wildCard="%" singleChar="_" escapeChar="\\">' +
                                    '<ogc:PropertyName>AnyText</ogc:PropertyName>' +
                                    '<ogc:Literal>%'+organism+'%</ogc:Literal>' +
                                '</ogc:PropertyIsLike>' +
                            '</ogc:Or>';
            }

            //traitement de l'emprise
            if (bbox!=null) {
                this.getRecordsString +=
                '<ogc:BBOX>' +
                  '<ogc:PropertyName>ows:BoundingBox</ogc:PropertyName>' +
                  '<gml:Envelope>' +
                    '<gml:lowerCorner>'+ bbox.left +' '+ bbox.bottom +'</gml:lowerCorner>' +
                    '<gml:upperCorner>'+ bbox.right +' '+ bbox.top+'</gml:upperCorner>' +
                  '</gml:Envelope>' +
                '</ogc:BBOX>';
            }

            this.getRecordsString +=
            '</ogc:And>' +
          '</ogc:Filter>' +
        '</Constraint>' +
      '</Query>' +
    '</GetRecords>';

            getRecords += this.getRecordsString;

            this.wImg.style.display= '';

            this.request= OpenLayers.Request.POST({
                url: this.cswUrl,
                headers : {
                    "Content-Type" : "application/xml"
                },
                data: getRecords,
                success: this.CSWSuccess,
                failure: this.CSWFailure,
                scope: this
            });
        } else {
            var startPosition;
            if (title.id.charAt(0) == "p") {
                startPosition= (this.currentPage - 2)*this.control.maxRecords + 1;
            } else {
                startPosition= this.currentPage*this.control.maxRecords + 1;
            }

            getRecords += this.control.maxRecords +'" startPosition="'+ startPosition;
            getRecords += this.control.getRecordsString;

            this.control.wImg.style.display= '';

            this.request= OpenLayers.Request.POST({
                url: this.control.cswUrl,
                headers : {
                    "Content-Type" : "application/xml"
                },
                data: getRecords,
                success: this.control.CSWSuccess,
                failure: this.control.CSWFailure,
                scope: this.control
            });
        }
    },

    /**
     * Method: showResults
     * Display the results of the request in the floating panel
     *
     * Parameters:
     * request - {<OpenLayers.Request.POST at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html#OpenLayers.Request.POST>}
     *           getRecords request.
     * e - {Object} div containing the list of results.
     *
     * Returns:
     * {Object} getRecords request parsed.
     */
    showResults: function(request, e) {
        var formater= new OpenLayers.Format.CSWGetRecords();
        var obj= formater.read(request.responseXML);

        if (!obj || !obj.records || obj.records.length==0) {
            this.CSWFailure(request);
            return false;
        }

        for (var i= 0, l= obj.records.length; i<l; i++) {
            var r= e.ownerDocument.createElement('div');
            r.className= 'gpCSWResult';
            if ((i%2)==1) {
                r.className+= 'Alternate';
            }

            var s= e.ownerDocument.createElement('a');
            s.style.textDecoration= "none";
            s.style.color= "black";
            s.target= "_blank";
            s.href= "http://www.geocatalogue.fr/Detail.do?fileIdentifier="+obj.records[i].identifier[0].value;
            var ga= obj.records[i].title[0].value;
            s.innerHTML= ga.toString();
            r.appendChild(s);

            e.appendChild(r);
        }

        return obj;
    },

    /**
     * Method: CSWSuccess
     * Called when the Ajax request returns a response for a Location Utility
     * service request.
     *
     * Parameters:
     * request - {XmlNode} request to server.
     *
     * Returns:
     * {Boolean} true if processing went well, false otherwise.
     */
    CSWSuccess: function(request) {
        this.wImg.style.display= 'none';
        this.resultDiv.innerHTML= '';//clean up
        this.resultDiv.style.display= '';
        var obj= this.showResults(request,this.resultDiv);
        this.request= null;

        //TODO : ajouter la possibilité de mettre les résultats en cache

        //calcul du nombre de pages
        if (obj.SearchResults == null) {
            return;
        }
        var nbPages= obj.SearchResults.numberOfRecordsMatched/this.maxRecords;
        if (parseInt(nbPages)!=parseFloat(nbPages)) {
            nbPages= parseInt(nbPages+1);
        }

        if (this.manager == null) {
            this.manager= new Geoportal.Control.PageManager(this,nbPages,this.getRecords,{div:this.resultDiv});
            this.map.addControl(this.manager);
            this.manager.activate();
        } else {
            this.manager.displayDiv();
        }
    },

    /**
     * Method: CSWFailure
     * Called when the Ajax request fails for a Location Utility
     *      service request.
     *      Does nothing.
     *
     * Parameters:
     * request - {XmlNode} request to server.
     */
    CSWFailure: function(request) {
        this.request= null;
        this.wImg.style.display= 'none';
        this.resultDiv.innerHTML= '';//clean up
        var r= this.div.ownerDocument.createElement('div');
        r.className= 'gpCSWResult';
        var s= this.div.ownerDocument.createElement('span');
        s.innerHTML= OpenLayers.i18n('csw.not.match');
        r.appendChild(s);
        this.resultDiv.appendChild(r);
        this.resultDiv.style.display= '';
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
     * {String} *"Geoportal.Control.CSW"*
     */
    CLASS_NAME:"Geoportal.Control.CSW"
});
