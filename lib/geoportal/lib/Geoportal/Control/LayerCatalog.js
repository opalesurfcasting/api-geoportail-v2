/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/LayerSwitcher.js
 */
/**
 * Class: Geoportal.Control.LayerCatalog
 * The Geoportal framework layer catalog class.
 *
 * Inherits from:
 * - {<Geoportal.Control.LayerSwitcher>}
 */
Geoportal.Control.LayerCatalog = OpenLayers.Class(Geoportal.Control.LayerSwitcher, {

    /**
     * Property: layers
     * {Array(<Object>)} The layers displayed in the catalog. A layer is an object with
     * the following properties :
     * - name : the Geoportal layer name of the layer (used in addGeoportalLayer method)
     * - description : the layer description
     * - label : the layer label displayed in the catalog.
     * 
     */
    layers : [],

    /**
     * APIProperty: filter
     * {<OpenLayers.Filter>} Filter to apply on layer search service request.
     * Supported filters are : 
     * - OpenLayers.Filter.Spatial with OpenLayers.Filter.Spatial.BBOX type
     * - OpenLayers.Filter.Comparison
     * - OpenLayers.Filter.Logical with OpenLayers.Filter.Logical.AND type.
     */
    filter : null,

    /**
     * APIProperty: editable
     * {<Boolean>} Allow user to edit the catalog filter. Defaults is true.
     */
    editable : true,

    /**
     * APIProperty: keyOnly
     * {<Boolean>} Displays only allowedLayers. Defaults is true.
     */
    keyOnly : true,

    /**
     * Constructor: Geoportal.Control.LayerCatalog
     * Build the layer catalog.
     *
     * Parameters:
     * options  - {Object} Hashtable of options to set on the layer catalog. Specific option is keyOnly : if set to false, the LayerCatalog will display all layers, even those which are not allowed for the current contract key. 
     */
    initialize: function(options) {
        Geoportal.Control.LayerSwitcher.prototype.initialize.apply(this, [options]);
        if (options && options.keyOnly===false) this.keyOnly= false ;
    },

    /**
     * APIMethod: setMap
     * Register events and set the map.
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        Geoportal.Control.LayerSwitcher.prototype.setMap.apply(this, arguments);
        this.map.events.un({
            "changelayer": this.redraw,
            //"changebaselayer": this.redraw,
            scope: this});

        var catalogue = this.map.catalogue;
        if (catalogue && catalogue.apiKey) {
            if (!this.layerSearchServiceUrl) {
                this.layerSearchServiceUrl = catalogue[catalogue.apiKey[0]].services[Geoportal.Control.LayerCatalog.SERVICE_ID].url;
            }
            this.searchLayers();
        }
    },

    /**
     * Method: searchLayers
     * Request the layer search service.
     * 
     */
    searchLayers : function() {
        var params = {
            service : 'WFS',
            version : '1.1.0',
            request : 'GetFeature',
            srsname : 'EPSG:4326',
            typeName : 'ign:layers',
            outputFormat : 'json',
            propertyName : 'description,gppid,name,title,type'
        };
        var filter = '';
        if(this.filter){
            var format = new OpenLayers.Format.CQL();
            var filter = format.write(this.filter);
            params.CQL_FILTER = filter;
        }
        var protocol= new OpenLayers.Protocol.Script({
            url: this.layerSearchServiceUrl,
            callbackKey: 'format_options',
            callbackPrefix: 'callback:',
            params: params,
            handleResponse:function(resp,opts) {
                if (resp.data) {
                    resp.features= resp.data.features;
                    resp.code= OpenLayers.Protocol.Response.SUCCESS;
                } else {
                    resp.status= resp.data.http? resp.data.http.code || 400 : 400;
                    resp.statusText= resp.data.http? resp.data.http.error || '' : '';
                    resp.code= OpenLayers.Protocol.Response.FAILURE;
                }
                if (resp.priv) {
                    this.destroyRequest(resp.priv);
                }
                opts.callback.call(opts.scope, resp);
            },
            callback:function(r) {
                if (r.code===OpenLayers.Protocol.Response.FAILURE) {
                    this.redraw();
                } else {
                    this.handleFilteredLayers(r);
                }
            },
            scope: this
        });
        protocol.read();
    },

    /**
     * Method: handleFilteredLayers
     * Set the filtered layers to the catalog (check if the layers are allowed for the user's keys).
     * 
     * Parameters:
     * response - {Object} the layer search service response.
     *
     */
    handleFilteredLayers : function(response) {
        this.layers = [];
        var allgplayers= this.map.allowedGeoportalLayers  ;
        for (var i=0,len=response.features.length;i<len;i++) {
            var layer = response.features[i].properties;
            // ignore non alias layers
            if (!layer || !layer.isalias) continue ;
            var layerName = layer.name + ':' + (layerType ? layerType.split(':').pop() : 'WMTS');
            var found= false ;
            // is the layer allowed ?
            if (this.keyOnly) {
              for (var j=0 ; j<allgplayers.length ; j++) {
                if (allgplayers[j]==layerName) {
                  found= true ; 
                  break ;
                }
              }
              if (!found) continue ;
              found= false ;
            }
            // has the layer already been added ?
            for (var j=0 ; j<this.layers.length ; j++) {
              if (this.layers[j].name==layerName) {
                found= true ;
                break ;
              }
            }
            if (found) continue ;
            var layerId = layer.gppid;
            var layerType = layer.type;
            this.layers.push({
                name : layerName,
                description : layer.description,
                title : layer.title
            });
        }
        this.layers.sort(function(a,b){
            return [a.title, a.name] < [b.title, b.name] ? 1:-1;
        });
        this.redraw();
    },

    /**
     * Method: checkLayerCanBeAdded
     * Checks if the layer can be added to the map :
     * layer is not already added to the map,
     * layer projection is compatible with the map baselayer projection,
     * layer has parameters for the current map territory.
     *
     * Parameters:
     * layerId - {String} id of the layer to be checked.
     *
     * Returns:
     * {Boolean} true if the layer can be added to the map, false else.
     */
    checkLayerCanBeAdded : function(layerId){
        var parts= layerId.split(':');
        if (parts[0].length==0) {// layerId empty or beginning with :
            return null;
        }
        if (parts.length==1) {
            parts.push('WMTS');
        }
        var theType = parts.pop(), theLid = parts.join(':');
        var alreadyAdded = this.checkLayerIsAlreadyAdded(layerId);

        var compatibleProj = false;
        var validTerritory = false;
        var lDef= Geoportal.Catalogue.LAYERNAMES[theLid];
        if(lDef) {
            var lKey= lDef.key;
            var crs = this.map.getProjection();
            var layerConfig= Geoportal.Catalogue.CONFIG[lKey];
            if (layerConfig) {
                if (layerConfig.layerOptions && layerConfig.layerOptions.projection) {
                    compatibleProj = crs.isCompatibleWith(layerConfig.layerOptions.projection);
                }
                validTerritory = (layerConfig[this.map.baseLayer.territory] != null);
            }
        }
        return (!alreadyAdded && compatibleProj && validTerritory);
    },

    /**
     * Method: checkLayerIsAlreadyAdded
     * Checks if the layer is already added to the map.
     *
     * Parameters:
     * layerId - {String} id of the layer to be checked.
     *
     * Returns:
     * {Boolean} true if the layer is already added to the map, false else.
     */
    checkLayerIsAlreadyAdded : function(layerId) {
        var parts= layerId.split(':');
        if (parts[0].length==0){// layerId empty or beginning with :
            return null;
        }
        if (parts.length==1){
            parts.push('WMTS');
        }
        var theType = parts.pop(), theLid = parts.join(':');
        var mapLayers = this.map.getLayersByName(theLid);
        var alreadyAdded = false;
        for (var i=0,len=mapLayers.length;i<len;i++) {
            if (mapLayers[i].territory == this.map.baseLayer.territory) {
                alreadyAdded = true;
                break;
            }
        }
        return alreadyAdded;
    },

    /**
     * APIMethod: redraw
     * Redraw the catalog of layers
     * 
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    redraw : function() {
        var doc= this.div.ownerDocument;
        var i, l= this.layers.length;
        var layer;

        //clear out previous layers
        this.clearLayersArray("data");

        var layers= this.layers.slice(0);
        var groupDiv= this.dataLayersDiv;
        for (i= l-1; i>=0; i--) {
            layer= layers[i].name;
            var layerDiv= doc.createElement("div");
            layerDiv.id= this.id+"_"+layer;
            layerDiv.className= "gpLayerDivClass";
            if ((this.dataLayers.length %2) == 1) {
                layerDiv.className+= "Alternate";
            }
            groupDiv.appendChild(layerDiv);

            var dg1= doc.createElement("div");
            dg1.className= "gpLayerNameGroupDivClass";
            layerDiv.appendChild(dg1);

            // button 'add'
            var buttonAdd= doc.createElement("div");
            buttonAdd.id= "buttonAdd_" + layer;
            buttonAdd.className= 'gpButtonAdd';
            if (!this.checkLayerCanBeAdded(layer)) {
                buttonAdd.className+= "Deactive";
                buttonAdd.title= OpenLayers.i18n(this.getDisplayClass()+'.button.add.disabled');
                if (this.checkLayerIsAlreadyAdded(layer)) {
                    buttonAdd.className='gpButtonRemove';
                    buttonAdd.title= OpenLayers.i18n(this.getDisplayClass()+'.button.add.alreadyAdded');
                    OpenLayers.Event.observe(
                      buttonAdd,
                      "click",
                      OpenLayers.Function.bindAsEventListener(
                        this.onButtonRemoveClick,
                        ({
                            'layer': layer,
                            'layerCatalog': this
                        })));
                }
            } else {
                buttonAdd.title= OpenLayers.i18n(this.getDisplayClass()+'.button.add');
                OpenLayers.Event.observe(
                    buttonAdd,
                    "click",
                    OpenLayers.Function.bindAsEventListener(
                        this.onButtonAddClick,
                        ({
                            'layer': layer,
                            'layerCatalog': this
                        })));
            }
            dg1.appendChild(buttonAdd);

            // layer label
            var labelDiv= doc.createElement("div");
            labelDiv.id= 'label_' + layer;
            var layerLab= OpenLayers.i18n(layers[i].title || layer);
            // convert HTML entities to get the right length :
            var entityBuffer= doc.createElement("textarea");
            entityBuffer.innerHTML= layerLab.replace(/</g,"&lt;").replace(/>/g,"&gt;");
            layerLab= entityBuffer.value;
            entityBuffer= null;
            labelDiv.innerHTML= layerLab;
            labelDiv.className= this.getDisplayClass()+"LayerDivClass";
            labelDiv.title= OpenLayers.i18n(layers[i].title || layer);
            if (layers[i].description) {
                labelDiv.style.cursor= "help";
                // a pop-up for description
                OpenLayers.Event.observe(
                    labelDiv,
                    "click",
                    OpenLayers.Function.bindAsEventListener(
                        this.onLabelClick,
                        ({
                            'layer': layers[i],
                            'layerSwitcher': this
                        })));
            }
            dg1.appendChild(labelDiv);

            this.dataLayers.push({
                'layer': layer
            });
        }

        return this.div;
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
            for (var i= 0, len= layers.length; i<len; i++) {
                var datalayer= layers[i];
                var lid = datalayer.layer;
                OpenLayers.Event.stopObservingElement(OpenLayers.Util.getElement("buttonAdd_"+lid));
            }
        }
        this[layersType + "Layers"]= [];
        this[layersType + "LayersDiv"].innerHTML= "";
    },

    /**
     * APIMethod: onButtonAddClick
     * The button 'add' has been clicked, so adds the Geoportal layer to the map.
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * layerCatalog - {<Geoportal.Control.LayerCatalog>} the layer catalog
     * layer - {String} the Geoportal layer id
     */
    onButtonAddClick : function(e){
        this.layerCatalog.map.getApplication().addGeoportalLayer(this.layer, { view:{
                    drop:true,
                    zoomToExtent:true
                }});
    },

    /**
     * APIMethod: onButtonRemoveClick
     * The button 'remove' has been clicked, so removes the Geoportal layer from the map.
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * layerCatalog - {<Geoportal.Control.LayerCatalog>} the layer catalog
     * layer - {String} the Geoportal layer id
     */
    onButtonRemoveClick : function(e){
        var layerParts= this.layer.split(':') ;
        var lyrs= this.layerCatalog.map.getLayersByName(layerParts[0]) ;
        // TODO : consider layer types (layerParts[1]) for removal
        if (lyrs && lyrs[0]) {
          this.layerCatalog.map.removeLayer(lyrs[0]) ;
        }
    },

    /**
     * APIMethod: loadContents
     * Set up the labels and divs for the control.
     */
    loadContents: function() {
        Geoportal.Control.LayerSwitcher.prototype.loadContents.apply(this, []);
        if(this.editable) {
            OpenLayers.Event.stopObservingElement(this.cntrlContent);
            
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
 

            this.filterButtons = this.createInnerDiv(this.id+'_filterButtons',this.getDisplayClass()+'FilterButtons',this.div);
            this.filterButtons.style.display = 'none';

            var filterButtonsForm = new Geoportal.Control.Form({div:this.filterButtons, autoActivate:true});
            this.map.addControl(filterButtonsForm);

            var f= this.div.ownerDocument.createElement('form');
            f.id= '__fifilters__'+this.id;
            f.name= f.id;
            f.action= 'javascript:void(null)';
            this.filterButtons.appendChild(f);

            this.filterBtn = filterButtonsForm.buildButton(f, 'filter');
            OpenLayers.Event.observe(
                    this.filterBtn,
                    "click",
                    OpenLayers.Function.bind(this.displayFilterForm,this)
                );
            this.catalogBtn = filterButtonsForm.buildButton(f, 'catalog');
            OpenLayers.Event.observe(
                    this.catalogBtn,
                    "click",
                    OpenLayers.Function.bind(this.displayLayersList,this)
                );
            this.catalogBtn.style.display = 'none';
            var resetBtn = filterButtonsForm.buildButton(f, 'reset');
            OpenLayers.Event.observe(
                    resetBtn,
                    "click",
                    OpenLayers.Function.bind(this.resetFilter,this)
                );
        }
    },

    /**
     * Method: resetFilter
     * Reset the current filter.
     *
     */
    resetFilter: function() {
        this.filter = null;
        this.updateFilter();
    },

    /**
     * Method: updateFilter
     * Update the layers in the catalog with the current filter.
     *
     */
    updateFilter: function() {
        OpenLayers.Event.stopObservingElement(this.filterApplyBtn);
        this.searchLayers();
        this.displayLayersList();
    },

    /**
     * Method: getFormElt
     * Get the input element of the filter form.
     * 
     * Parameters:
     * id - {String} id of the element
     * 
     * Returns:
     * {DOMElement} the DOM element corresponding to the id.
     *
     */
    getFormElt: function(id) {
        return OpenLayers.Util.getElement(id+this.filterForm.id);
    },

    /**
     * Method: addComparisonFilter
     * Add a comparison filter to the filters array.
     * 
     * Parameters:
     * filters - {Array(<OpenLayers.Filter>)} array of filters to construct a logical filter
     * property - {String} name of the context property to compare
     * value - {String} comparison value for binary comparisons
     * type - {String} type of the comparison
     * separator - {String} separator character for multiple values (used for keywords and thematics)
     *
     */
    addComparisonFilter: function(filters, property, value, type, separator) {
        if (value != '') {
            if(separator){
                var values = value.split(separator);
                var orFilters = [];
                for (var i=0, len=values.length;i<len;i++) {
                    this.addComparisonFilter(orFilters,property,values[i]);
                }
                filters.push(new OpenLayers.Filter.Logical({filters : orFilters, type: OpenLayers.Filter.Logical.OR}));
            } else {
                type = type || OpenLayers.Filter.Comparison.LIKE;
                if (type == OpenLayers.Filter.Comparison.LIKE) {
                    value = '%'+value+'%';
                } else { // YYYYMMDD date
                    var date = value.substring(0,4);
                    if (value.substring(4,6)!='' && value.substring(6,8)!='') {
                        date += '-'+value.substring(4,6)+'-'+value.substring(6,8);
                    }
                    value = OpenLayers.Date.toISOString(OpenLayers.Date.parse(date));
                }
                filters.push(new OpenLayers.Filter.Comparison({type:type,property:property,value:value}));
            }
        }
    },

    /**
     * Method: applyFilter
     * Apply the new filter.
     *
     */
    applyFilter: function() {
        var checked = this.getFormElt('catalogRestrictToMapExtent').checked;
        var title = this.getFormElt('catalogLayerName').value;
        var keywords = this.getFormElt('catalogKeywords').value;
        var thematics = this.getFormElt('catalogThematics').value;
        var startProductionMin = this.getFormElt('catalogBeginProductionMinDate').value;
        var startProductionMax = this.getFormElt('catalogBeginProductionMaxDate').value;
        var endProductionMin = this.getFormElt('catalogEndProductionMinDate').value;
        var endProductionMax = this.getFormElt('catalogEndProductionMaxDate').value;
        var publicationMin = this.getFormElt('catalogPublicationMinDate').value;
        var publicationMax = this.getFormElt('catalogPublicationMaxDate').value;

        var filters = [];
        if (checked) {
            var bbox = this.map.getExtent().transform(this.map.getProjection(),OpenLayers.Projection.CRS84);
            filters.push(new OpenLayers.Filter.Spatial({
                type:OpenLayers.Filter.Spatial.BBOX,
                property:'the_geom',
                value: OpenLayers.Bounds.fromString(bbox.toBBOX(null,true))
            }));
        }
        this.addComparisonFilter(filters,'title',title);
        this.addComparisonFilter(filters,'keywords',keywords,null,',');
        this.addComparisonFilter(filters,'inspirethematics',thematics,null,',');
        var gt = OpenLayers.Filter.Comparison.GREATER_THAN;
        var lt = OpenLayers.Filter.Comparison.LESS_THAN;
        this.addComparisonFilter(filters,'startproduction',startProductionMin,gt);
        this.addComparisonFilter(filters,'startproduction',startProductionMax,lt);
        this.addComparisonFilter(filters,'endproduction',endProductionMin,gt);
        this.addComparisonFilter(filters,'endproduction',endProductionMax,lt);
        this.addComparisonFilter(filters,'publicationdate',publicationMin,gt);
        this.addComparisonFilter(filters,'publicationdate',publicationMax,lt);
        
        this.filter = null;
        if (filters.length == 1) {
            this.filter = filters[0];
        }
        if (filters.length > 1) {
            this.filter = new OpenLayers.Filter.Logical({ filters : filters, type: OpenLayers.Filter.Logical.AND });
        }
        this.updateFilter();
    },

    /**
     * Method: displayLayersList
     * Display the list of layers.
     *
     */
    displayLayersList: function() {
        this.map.removeControl(this.filterForm);
        this.catalogBtn.style.display = 'none';
        this.filterBtn.style.display = '';
        this.redraw();
    },

    /**
     * Method: displayFilterForm
     * Display the form for catalog filters.
     *
     */
    displayFilterForm: function() {
        this.clearLayersArray('data');
        this.catalogBtn.style.display = '';
        this.filterBtn.style.display = 'none';
        var div = this.dataLayersDiv;
        OpenLayers.Element.addClass(div,'gpControlLayerCatalogFilterForm');
        var form = new Geoportal.Control.Form({div:div, autoActivate:true});
        this.filterForm = form;
        this.map.addControl(this.filterForm);

        var checked = this.getFormValue(this.filter,"the_geom") != '';
        form.buildCheckboxField(div, { id:'catalogRestrictToMapExtent', checked: checked });
        var title = this.getFormValue(this.filter,"title");
        form.buildInputTextField(div, { id:'catalogLayerName', value: title });
        var keywords = this.getFormValue(this.filter,"keywords");
        form.buildInputTextField(div, { id:'catalogKeywords', value: keywords });
        var thematics = this.getFormValue(this.filter,"inspirethematics");
        form.buildInputTextField(div, { id:'catalogThematics', value: thematics });
        var gt = OpenLayers.Filter.Comparison.GREATER_THAN;
        var lt = OpenLayers.Filter.Comparison.LESS_THAN;
        var startProductionMin = this.getFormValue(this.filter,"startproduction", gt, true);
        form.buildInputTextField(div, { id:'catalogBeginProductionMinDate', value: startProductionMin, length:8 });
        var startProductionMax = this.getFormValue(this.filter,"startproduction", lt, true);
        form.buildInputTextField(div, { id:'catalogBeginProductionMaxDate', value: startProductionMax, length:8 });
        var endProductionMin = this.getFormValue(this.filter,"endproduction", gt, true);
        form.buildInputTextField(div, { id:'catalogEndProductionMinDate', value: endProductionMin, length:8 });
        var endProductionMax = this.getFormValue(this.filter,"endproduction", lt, true);
        form.buildInputTextField(div, { id:'catalogEndProductionMaxDate', value: endProductionMax, length:8 });
        var publicationMin = this.getFormValue(this.filter,"publicationdate", gt, true);
        form.buildInputTextField(div, { id:'catalogPublicationMinDate', value: publicationMin, length:8 });
        var publicationMax = this.getFormValue(this.filter,"publicationdate", lt, true);
        form.buildInputTextField(div, { id:'catalogPublicationMaxDate', value: publicationMax, length:8 });
        this.filterApplyBtn = form.buildButton(div, 'apply');
        OpenLayers.Event.observe(
                    this.filterApplyBtn,
                    "click",
                    OpenLayers.Function.bind(this.applyFilter,this)
                );

    },

    /**
     * Method: getFormValue
     * From the filter, get the property value to display in the filter form.
     * 
     * Parameters:
     * filter - {OpenLayers.Filter} the filter
     * property - {String} name of the context property to get the value
     * type - {String} type of the comparison for dates filter.
     * 
     * Returns:
     * {String} the value to display in the filter form for the property.
     *
     */
    getFormValue: function(filter,property,type,isDate) {
        var value = '';
        if (filter) {
            switch (filter.CLASS_NAME) {
                case OpenLayers.Filter.Logical.prototype.CLASS_NAME:
                    var filters= filter.filters;
                    if (filter.type == OpenLayers.Filter.Logical.AND) {
                        for (var i=0,len=filters.length;i<len;i++) {
                            var hasProperty = filters[i].property == property;
                            if (filters[i].type == OpenLayers.Filter.Logical.OR) {
                                var childs = filters[i].filters;
                                hasProperty = childs.length>0 && childs[0].property == property;
                            }
                            if (hasProperty) {
                                value = this.getFormValue(filters[i],property,type,isDate);
                                if (!type || value!='') {
                                    break;
                                }
                            }
                        }
                    }
                    if( filter.type == OpenLayers.Filter.Logical.OR) {
                        for (var i=0,len=filters.length;i<len;i++) {
                            if (filters[i].property == property) {
                                value += this.getFormValue(filters[i],property,type,isDate) + ',';
                            }
                        }
                        value = value.substring(0,value.length-1);
                    }
                    break;
                case OpenLayers.Filter.Spatial.prototype.CLASS_NAME:
                    if (filter.property == property) {
                        value = filter.value;
                    }
                    break;
                case OpenLayers.Filter.Comparison.prototype.CLASS_NAME:
                    if (filter.property == property){
                        if (!type || (type && filter.type == type)) {
                            value = filter.value;
                            if (filter.type == OpenLayers.Filter.Comparison.LIKE) {
                                value = value.replace(new RegExp('%','g'),'');
                            }
                            if (isDate) {
                                var date = value.match(/(\d{4})-(\d{2})-(\d{2})/);
                                date.shift();
                                value = date.join('');
                            }
                        }
                    }
                    break;
            }
        }
        return value;
    },

    /**
     * APIMethod: showControls
     * Hide/Show all the contents of the control depending on whether we are
     *     minimized or not
     *
     * Parameters:
     * minimize - {Boolean}
     */
    showControls: function(minimize) {
        Geoportal.Control.LayerSwitcher.prototype.showControls.apply(this, [minimize]);
        if (this.editable) {
            this.filterButtons.style.display= minimize ? "none"  : "block";
        }
    },

    /**
     * Constant: CLASS_NAME 
     * {String} *"Geoportal.Control.LayerCatalog"*
     */
    CLASS_NAME: "Geoportal.Control.LayerCatalog"
});

/**
 * Constant: Geoportal.Control.LayerCatalog.SERVICE_ID
 * {String} Id of the layer search service returned by the autoconfiguration.
 */
Geoportal.Control.LayerCatalog.SERVICE_ID = "GPP:SearchLayers";
