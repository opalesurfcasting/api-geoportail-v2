/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Viewer.js
 * @requires Geoportal/Viewer/Simple.js
 * @requires Geoportal/Util.js
 * @requires Geoportal/Control/Logo.js
 * @requires Geoportal/Control/ToolBox.js
 * @requires Geoportal/Control/NavToolbar.js
 * @requires Geoportal/Control/ZoomBar.js
 * @requires Geoportal/Control/LayerSwitcher.js
 * @requires Geoportal/Control/Information.js
 */
/**
 * Class: Geoportal.Viewer.Default
 * The Geoportal default viewer.
 * Class which must be instanciated to create a map viewer. This is a
 * helper class of the API for embedding a {<Geoportal.Map>}.
 *
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_basic.html>
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalMap_mini.html>
 *
 * Inherits from:
 *  - {<Geoportal.Viewer>}
 */
Geoportal.Viewer.Default= OpenLayers.Class( Geoportal.Viewer, {

    /**
     * APIProperty: mode
     * {String} Kind of view you want to create (allowed values are "normal"
     *     and "mini"). By default, "normal".
     */
    mode:'normal',

    /**
     * Property: mapDiv
     * {DOMElement} The OpenLayers map div.
     */
    mapDiv: null,

    /**
     * APIProperty: viewerSpecifics
     * {Array({String})} Array of options' name specific to the viewer.
     */
    viewerSpecifics: ['mode'],

    /**
     * Property: defaultControls
     * {Object} Control's that are added to the viewer.
     *      Currently supported controls are:
     *      * <OpenLayers.Control.KeyboardDefaults at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/KeyboardDefaults-js.html> ;
     *      * <Geoportal.Control.Logo> ;
     *      * <Geoportal.Control.ToolBox> ;
     *      * <Geoportal.Control.NavToolbar> ;
     *      * <Geoportal.Control.ZoomBar> ;
     *      * <Geoportal.Control.LayerSwitcher> ;
     *      * <Geoportal.Control.Information>.
     */
    defaultControls: {
        'OpenLayers.Control.KeyboardDefaults':{
            activeOverMapOnly: true
        },
        'Geoportal.Control.Logo':{
            logoSize: 0,
            destroy: function() {
                if (this.map.getApplication()) {
                    this.map.getApplication().logoCntrl= null;
                }
                Geoportal.Control.Logo.prototype.destroy.apply(this,arguments);
            },
            viewerProperty: 'logoCntrl'
        },
        'Geoportal.Control.ToolBox':{
            destroy: function() {
                if (this.map.getApplication()) {
                    this.map.getApplication().toolBoxCntrl= null;
                }
                Geoportal.Control.ToolBox.prototype.destroy.apply(this,arguments);
            },
            viewerProperty: 'toolBoxCntrl'
        },
        'Geoportal.Control.NavToolbar':{
            position: new OpenLayers.Pixel(0,2), //FIXME
            parentCntrl: function() {
                return (this['toolBoxCntrl'] && this['toolBoxCntrl'].id)?
                    OpenLayers.Util.getElement(this['toolBoxCntrl'].id+'_navbar')
                :   null;
            }
         },
        'Geoportal.Control.ZoomBar':{
            check: function() {
                return this.mode!='mini';
            },
            position: new OpenLayers.Pixel(0,0), //FIXME
            parentCntrl: function() {
                return (this['toolBoxCntrl'] && this['toolBoxCntrl'].id)?
                    OpenLayers.Util.getElement(this['toolBoxCntrl'].id+'_zoombar')
                :   null;
            }
        },
        'Geoportal.Control.LayerSwitcher':{
            check: function() {
                return this.mode!='mini';
            },
            destroy: function() {
                if (this.map.getApplication()) {
                    this.map.getApplication().lyrSwCntrl= null;
                }
                Geoportal.Control.LayerSwitcher.prototype.destroy.apply(this,arguments);
            },
            viewerProperty: 'lyrSwCntrl'
        },
        'Geoportal.Control.Information':{
            check: function() {
                return this.mode!='mini';
            },
            destroy: function() {
                if (this.map.getApplication()) {
                    this.map.getApplication().infoCntrl= null;
                }
                Geoportal.Control.Information.prototype.destroy.apply(this,arguments);
            },
            viewerProperty: 'infoCntrl'
        }
    },

    /**
     * Constructor: Geoportal.Viewer.Default
     * Generates the Geoportal default viewer. Could build a big viewer with all the controls
     * or a small viewer without controls (See mode parameter).
     *
     * Parameters:
     * div - {String} Id of the DIV tag in which you want
     *       to insert your viewer.
     *       Default is "geoportalViewerDiv".
     * options - {Object} Optional object with properties to
     *       tag onto the viewer.
     *       Supported options are : mode, territory,
     *       projection, displayProjection, proxy,
     *       nameInstance, [apiKey], {apiKey{}}, tokenServerUrl, tokenTtl.
     *       * mode defaults to *normal*
     *       * territory defaults to *FXX*
     *       * nameInstance defaults to *geoportalMap*
     *       Other options like resolutions, center, minExtent, maxExtent,
     *       zoom, minZoomLevel, maxZoomLevel, scales, minResolution, maxResolution,
     *       minScale, maxScale, numZoomLevels, events, restrictedExtent,
     *       fallThrough, eventListeners are handed over to the underlaying
     *       <Geoportal.Map>.
     */
    initialize: function(div, options) {
        this.viewerSpecifics=
            Geoportal.Viewer.Default.prototype.viewerSpecifics.concat(
            Geoportal.Viewer.prototype.viewerSpecifics
        );
        options= options || {};
        options.defaultControls= options.defaultControls || {};
        var superControls= OpenLayers.Util.extend({}, Geoportal.Viewer.Simple.prototype.defaultControls);
        delete superControls['OpenLayers.Control.Navigation'];
        superControls= OpenLayers.Util.extend(superControls, options.defaultControls);
        delete options.defaultControls;
        var defaultControls= this.defaultControls;
        this.defaultControls= OpenLayers.Util.extend(superControls, defaultControls);
        if (this.defaultControls['Geoportal.Control.Logo'].logoSize==0) {
            this.defaultControls['Geoportal.Control.Logo'].logoSize=
                Geoportal.Control.Logo.WHSizes[options.mode || this.mode];
        }
        Geoportal.Viewer.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: render
     * Render the map to a specified container.
     *
     * Parameters:
     * div - {String|DOMElement} The container that the map should be rendered
     *     to. If different than the current container, the map viewport
     *     will be moved from the current to the new container.
     */
    render: function(div) {
        this.div= OpenLayers.Util.getElement(div);
        this.div.style.overflow= "hidden";
        this.mapDiv.parentNode.removeChild(this.mapDiv);
        this.div.appendChild(this.mapDiv);
        this.getMap().updateSize();

/*
        if (this.timeout['render']) { window.clearTimeout(this.timeout['render']); this.timeout['render']= null; }
        this.timeout['render']= window.setTimeout(OpenLayers.Function.bind(function(){
 */
            // force computation :
            this.ready= {w:-1,h:-1,b:0};
            var b= (this.infoCntrl? (this.infoCntrl.div.style.display=='none'? false:true) : false);
            this.setInformationPanelVisibility(true);
            if (!b) this.setInformationPanelVisibility(false);
/*
        },this),250);
 */
    },

    /**
     * APIMethod: destroy
     * Destroy this viewer.
     */
    destroy: function() {
        // if unloadDestroy is null, we've already been destroyed
        if (!this.unloadDestroy) {
            return;
        }
        OpenLayers.Event.stopObserving(window, 'unload', this.unloadDestroy);
        this.unloadDestroy= null;
        this.infoCntrl= null;
        this.lyrSwCntrl= null;
        this.toolBoxCntrl= null;
        this.logoCntrl= null;
        if (this.map) {
            // already destroyed as OpenLayers.Event has FIFO events list.
            this.map= null;
        }
        if (this.timeout) {
            if (this.timeout[true]) { window.clearTimeout(this.timeout[true]); this.timeout[true]= null; }
            if (this.timeout[false]) { window.clearTimeout(this.timeout[false]); this.timeout[false]= null; }
/*
            if (this.timeout['render']) { window.clearTimeout(this.timeout['render']); this.timeout['render']= null; }
 */
        }
        Geoportal.Viewer.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: loadLayout
     * Add the div which contains the map and also a hack for ie.
     *
     * (start code)
     * <div id="{#Id}">
     *   <div id="{#Id}_OlMap" class="gpMainMap gpMainMapCell olMap gpMap"></div> // OpenLayers Map
     * </div>
     * (end)
     *
     * Parameters:
     * options - {Object}
     *
     * Returns:
     * {DOMElement} the OpenLayers map's div.
     */
    loadLayout: function(options) {
        //ensure creating element is done within the same document :
        var ownerDoc= this.div.ownerDocument;
        this.div.style.overflow= "hidden";

        this.mapDiv= ownerDoc.createElement('div');
        this.mapDiv.id= this.div.id + "_OlMap";
        this.mapDiv.style.width='1px';
        this.mapDiv.style.height='1px';
        OpenLayers.Element.addClass(this.mapDiv, 'gpMainMap');
        OpenLayers.Element.addClass(this.mapDiv, 'gpMainMapCell');
        OpenLayers.Element.addClass(this.mapDiv, 'olMap');
        OpenLayers.Element.addClass(this.mapDiv, 'gpMap');
        this.div.appendChild(this.mapDiv);

        this.ready= {w:-1,h:-1,b:0};

        return this.mapDiv;
    },

    /**
     * APIMethod: loadControls
     * {Function} Called after creating the {<Geoportal.Map>} map.
     *      It expects an object parameter taken from options.controlsOptions
     *      of the constructor and defaultControls property.
     *      It adds controls to the map.
     *
     * Parameters:
     * options - {Object}
     *      * activeOverMapOnly : defaults to *true* (deprecated);
     *      * logoSize (deprecated);
     *      * 'OpenLayers.Control.KeyboardDefaults' - {Object} options for control
     *      <OpenLayers.Control.KeyboardDefaults at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/KeyboardDefaults-js.html>.
     *      activeOverMapOnly can be put here;
     *      * 'Geoportal.Control.Logo' - {Object} options for control <Geoportal.Control.Logo>.
     *      logoSize can be put here;
     *      * 'Geoportal.Control.ToolBox' - {Object} options for control
     *      <Geoportal.Control.ToolBox>;
     *      * 'Geoportal.Control.NavToolbar' - {Object} options for control
     *      <Geoportal.Control.NavToolbar>;
     *      * 'Geoportal.Control.ZoomBar' - {Object} options for control
     *      <Geoportal.Control.ZoomBar>;
     *      * 'Geoportal.Control.LayerSwitcher' - {Object} options for control
     *      <Geoportal.Control.LayerSwitcher>;
     *      * 'Geoportal.Control.Information' - {Object} options for control
     *      <Geoportal.Control.Information>.
     *      If the *disabled* option is part of the control's options, then
     *      the control will not be loaded.
     */
    loadControls: function(options) {
        options= options || {};
        // deprecated options :
        if (options.activeOverMapOnly===false) {
            options['OpenLayers.Control.KeyboardDefaults']=
                options['OpenLayers.Control.KeyboardDefaults'] || {};
            options['OpenLayers.Control.KeyboardDefaults'].activeOverMapOnly= false;
            delete options.activeOverMapOnly;
        }
        if (options.logoSize) {
            options['Geoportal.Control.Logo']=
                options['Geoportal.Control.Logo'] || {};
            options['Geoportal.Control.Logo'].logoSize= options.logoSize || Geoportal.Control.Logo.WHSizes[this.mode];
        }
        // misc :
        options['Geoportal.Control.Information']=
            options['Geoportal.Control.Information'] || {};
        options['Geoportal.Control.Information'].displayProjections=
            options['Geoportal.Control.Information'].displayProjections || this.allowedDisplayProjections;

        Geoportal.Viewer.prototype.loadControls.apply(this,[options]);
    },

    /**
     * APIMethod: completeLayout
     * Configure map according to mode.
     *      mode of map, Values are :
     *      mini : map is small without control
     *      normal : map is large with all controls
     *
     * Parameters:
     * options - {Object}
     */
    completeLayout: function(options) {
        switch(this.mode) {
        case "mini"   :
            this.setToolsPanelVisibility(false);
            this.setLayersPanelVisibility(false);
            this.setInformationPanelVisibility(false);
            // no info panel
            break;
        default       :
            this.openLayersPanel(true);
            this.openToolsPanel(true);
            this.setInformationPanelVisibility(true);
            break;
        }
    },

    /**
     * APIMethod: setSize
     * Defines the view viewer size.
     *
     * Parameters:
     * width - {String} The new width of the viewer.
     * height - {String} The new height of the viewer.
     * rendered size.
     */
    setSize: function(width, height) {
        width= typeof(width)=='number'? width+'px':width;//ensure compatibility with width in pixels
        var w= Geoportal.Util.convertToPixels(width,true);
        height= typeof(height)=='number'? height+'px':height;//ensure compatibility with height in pixels
        var h= Geoportal.Util.convertToPixels(height,false);

        var wg= this.div.offsetWidth - w;
        this.div.style.width= width;
        this.mapDiv.style.width= width;
        var hg= this.div.offsetHeight - h;
        this.div.style.height= height;
        this.mapDiv.style.height= height;
        this.getMap().updateSize();
        if (wg!=0 || hg!=0) {//width or height has changed ...
            // force computation :
            this.render(this.div);
        }
        if (this.infoCntrl) {
            this.infoCntrl.updateSize();
        }
        if (this.logoCntrl) {
            this.logoCntrl.changeLogoSize(Geoportal.Control.Logo.WHSizes[this.mode]);
        }
    },

    /**
     * APIMethod: setToolsPanelVisibility
     * Allows to show or not the tools panel.
     *
     * Parameters:
     * b - {Boolean} If true, show the panel, if not, do not show it.
     */
    setToolsPanelVisibility: function(b) {
        if (this.mode=="mini") {b= false;}
        if (this.toolBoxCntrl) {
            this.toolBoxCntrl.div.style.display= b? '' : 'none';
        }
    },

    /**
     * APIMethod: setLayersPanelVisibility
     * Allows to show or not the layers panel.
     *
     * Parameters:
     * b - {Boolean} If true, show the panel, if not, do not show it.
     */
    setLayersPanelVisibility: function(b) {
        if (this.mode=="mini") {b= false;}
        if (this.lyrSwCntrl) {
            this.lyrSwCntrl.div.style.display= b? '' : 'none';
        }
    },

    /**
     * APIMethod: openToolsPanel
     * Allows to open or not the tools panel.
     *
     * Parameters:
     * b - {Boolean} If true, open the panel, if not, do not open it.
     */
    openToolsPanel: function(b) {
        if (this.mode=="mini") {b= false;}
        if (this.toolBoxCntrl) {
            this.toolBoxCntrl.showControls(!b);
        }
    },

    /**
     * APIMethod: openLayersPanel
     * Allows to open or not the layers switcher panel.
     *
     * Parameters:
     * b - {Boolean} If true, open the panel, if not, do not open it.
     */
    openLayersPanel: function(b) {
        if (this.mode=="mini") {b= false;}
        if (this.lyrSwCntrl) {
            this.lyrSwCntrl.showControls(!b);
        }
    },

    /**
     * APIMethod: setInformationPanelVisibility
     * Allows to show or not the information panel (the blue bar just under the
     * map).
     *
     * Parameters:
     * b - {Boolean} If true, show the panel, if not, do not show it.
     */
    setInformationPanelVisibility: function(b) {
        if (this.mode=="mini") { b= false; }
        if (this.timeout[b]) { window.clearTimeout(this.timeout[b]); this.timeout[b]= null; }
        var reload= false;
        if (!b && this.timeout[!b]) {
            reload= true;
        } else {
            var loading= this.ready.h==-1;
            if (loading) {
                var rh= this.div.offsetHeight;
                if (/\d(%|em|pt)/.test(this.div.style.height)) {
                    rh= Geoportal.Util.convertToPixels(this.div.style.height,false,this.div.parentNode) || rh;
                } else {
                    rh= parseInt(this.div.style.height) || rh;
                }

                var bh= this.infoCntrl?
                    this.infoCntrl.div.offsetHeight-this.infoCntrl.div.clientHeight//border-top + border-bottom
                :   0;
                var h= this.infoCntrl?
                    Geoportal.Util.getComputedStyle(this.infoCntrl.div,'height',true)
                :   0;
                var d= 'gpViewerDefault';
                var s= OpenLayers.Util.getRenderedDimensions("",null,{displayClass:d});
                if (Geoportal.Util.getCSSRule('.'+d)) {
                    s.w= 1;//prevent infinite loops
                }
                var ic= this.infoCntrl?
                    this.infoCntrl.getSize(true)
                :   new OpenLayers.Size(0,0);
                var bmh= this.mapDiv.offsetHeight - this.mapDiv.clientHeight;//border-top + border-bottom
                var bmw= this.mapDiv.offsetWidth - this.mapDiv.clientWidth;//border-left + border-right
                this.mapDiv.style.height= (rh-bmh)+'px';
                this.mapDiv.style.width= (this.div.offsetWidth-bmw)+'px';
                reload= reload || !this.isMapReady(b) || ic.h!=bh+h || s.w==0;
                this.ready.h= bh+h;
            }
        }
        if (reload) {
            if (b || (!b && !this.timeout[!b])) {
                this.ready.h= -1;
            }
            this.timeout[b]=
                window.setTimeout(OpenLayers.Function.bind(function(b){this.setInformationPanelVisibility(b);},this,b),200);
            return;
        }
        if (this.mode=="mini") {
            this.getMap().events.triggerEvent("controlvisibilitychanged",{
                visibility:false,
                size:new OpenLayers.Size(0,0)
            });
            return;
        }
        if (this.infoCntrl) {
            this.infoCntrl.showControls(!b);
            this.infoCntrl.updateSize();
        }
    },

    /**
     * APIMethod: isMapReady
     * Checks whether the map's div is rendered or not.
     *
     * Returns:
     * {Boolean} true if ready, false otherwise.
     */
    isMapReady: function() {
        var b= arguments[0];
        var ready= (
            this.div!=null &&
            !(this.mapDiv.clientHeight<=1) &&
            this.div.offsetWidth==this.mapDiv.offsetWidth &&
            this.div.offsetHeight==this.mapDiv.offsetHeight &&
            this.mapDiv.clientWidth==parseInt(this.mapDiv.style.width) &&
            this.mapDiv.clientHeight==parseInt(this.mapDiv.style.height)
        ) &&
        !(
            this.timeout &&
            ((b!=undefined && this.timeout[b]) ||
             (b==undefined && (this.timeout[true] || this.timeout[false])))
        );
        return ready;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Viewer.Default"*
     */
    CLASS_NAME: "Geoportal.Viewer.Default"
});
