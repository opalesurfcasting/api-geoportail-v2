/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Viewer.js
 * @requires Geoportal/Viewer/Simple.js
 * @requires Geoportal/Util.js
 * @requires Geoportal/Control/Logo.js
 * @requires Geoportal/Control/LayerSwitcher.js
 * @requires Geoportal/Control/ToolBox.js
 * @requires Geoportal/Control/NavToolbar.js
 * @requires Geoportal/Control/ZoomBar.js
 * @requires Geoportal/Control/Information.js
 */
/**
 * Class: Geoportal.Viewer.Standard
 * The Geoportal standard viewer.
 * Class which must be instanciated to create a map viewer. This is a
 * helper class of the API for embedding a <Geoportal.Map>.
 *
 * See <this example at http://api.ign.fr/tech-docs-js/examples/geoportalLike.html>
 *
 * Inherits from:
 *  - <Geoportal.Viewer>
 */
Geoportal.Viewer.Standard= OpenLayers.Class( Geoportal.Viewer, {

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
        'Geoportal.Control.LayerSwitcher':{
            outsideViewport: true,
            destroy: function() {
                if (this.map.getApplication()) {
                    this.map.getApplication().lyrSwCntrl= null;
                }
                Geoportal.Control.LayerSwitcher.prototype.destroy.apply(this,arguments);
            },
            viewerProperty: 'lyrSwCntrl',
            finalize: function() {
                if (this['lyrSwCntrl'] && this['lyrSwCntrl'].div) {
                    this.layersDiv.appendChild(this['lyrSwCntrl'].div);
                }
            }
        },
        'Geoportal.Control.ToolBox':{
            outsideViewport: true,
            destroy: function() {
                if (this.map.getApplication()) {
                    this.map.getApplication().toolBoxCntrl= null;
                }
                Geoportal.Control.ToolBox.prototype.destroy.apply(this,arguments);
            },
            viewerProperty: 'toolBoxCntrl',
            finalize: function() {
                if (this['toolBoxCntrl'] && this['toolBoxCntrl'].div) {
                    this.toolboxDiv.appendChild(this['toolBoxCntrl'].div);
                }
            }
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
            position: new OpenLayers.Pixel(0,0), //FIXME
            parentCntrl: function() {
                return (this['toolBoxCntrl'] && this['toolBoxCntrl'].id)?
                    OpenLayers.Util.getElement(this['toolBoxCntrl'].id+'_zoombar')
                :   null;
            }
        },
        'Geoportal.Control.Information':{
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
     * Property: mapDiv
     * {DOMElement} The OpenLayers map div.
     */
    mapDiv: null,

    /**
     * Constructor: Geoportal.Viewer.Standard
     * Generates the Geoportal standard viewer : it is made up of three panels
     * layers' controller, map and toolbox. The first and last panel are
     * outside of the map panel.
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
        options= options || {};
        var superControls= OpenLayers.Util.extend({}, Geoportal.Viewer.Simple.prototype.defaultControls);
        delete superControls['OpenLayers.Control.Navigation'];
        superControls= OpenLayers.Util.extend(superControls, options.defaultControls);
        var defaultControls= this.defaultControls;
        this.defaultControls= OpenLayers.Util.extend(superControls, defaultControls);
        if (this.defaultControls['Geoportal.Control.Logo'].logoSize==0) {
            this.defaultControls['Geoportal.Control.Logo'].logoSize=
                Geoportal.Control.Logo.WHSizes.normal;
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
        var sdiv= this.div;
        var ow= sdiv.offsetWidth, oh= sdiv.offsetHeight;
        this.div= OpenLayers.Util.getElement(div);
        this.div.style.overflow= "hidden";
        var nw= this.div.offsetWidth || ow, nh= this.div.offsetHeight || oh;
        var w= this.catalgDiv.offsetWidth+this.toolsDiv.offsetWidth;
        var h= this.fullScDiv.parentNode.offsetHeight+this.infoTgDiv.parentNode.offsetHeight;
        this.mapTbl.parentNode.removeChild(this.mapTbl);
        this.catalgDiv.style.height= (nh - h)+'px';
        this.toolsDiv.style.height= (nh - h)+'px';
        this.div.appendChild(this.mapTbl);
        this.getMap().updateSize();

        if (this.timeout['render']) { window.clearTimeout(this.timeout['render']); this.timeout['render']= null; }
        this.timeout['render']= window.setTimeout(OpenLayers.Function.bind(function(){
            // force computation :
            var b= (this.infoCntrl? (this.infoCntrl.div.style.display=='none'? false:true) : false);
            this.setInformationPanelVisibility(true);
            if (!b) this.setInformationPanelVisibility(false);
        },this),250);
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
        this.toolboxDiv= null;
        this.infoTgDiv= null;
        this.rT= null;
        this.toolsDiv= null;
        this.lT= null;
        this.layersDiv= null;
        this.fullScDiv= null;
        this.catalgDiv= null;
        this.infoCntrl= null;
        if (this.map) {
            // already destroyed as OpenLayers.Event has FIFO events list.
            this.map= null;
        }
        if (this.mapDiv) {
            this.mapDiv= null;
        }
        if (this.timeout) {
            if (this.timeout[true]) { window.clearTimeout(this.timeout[true]); this.timeout[true]= null; }
            if (this.timeout[false]) { window.clearTimeout(this.timeout[false]); this.timeout[false]= null; }
            if (this.timeout['render']) { window.clearTimeout(this.timeout['render']); this.timeout['render']= null; }
        }
        Geoportal.Viewer.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: loadTheme
     * {Function} Called after loading OpenLayers' default theme.
     *      The standard theme is attached to the standard.css in the
     *      geoportal folder. The CSS id is '__StandardCss__'. The standard
     *      theme relies upon the default theme (See
     *      <Geoportal.Viewer.loadTheme>()).
     */
    loadTheme: function() {
        Geoportal.Viewer.prototype.loadTheme.apply(this,arguments);
        Geoportal.Util.loadCSS(Geoportal._getScriptLocation()+'theme/geoportal/standard.css','__StandardCss__','');
    },

    /**
     * APIMethod: loadLayout
     * Add the div which contains the map and also a hack for ie.
     *
     * (start code)
     * <div id="{#Id}"> // the div given to the constructor
     *   <table id="{#Id}_GpMap" cellPadding="0" cellSpacing="0" className="gpMainMap">
     *     <tbody>
     *       <tr>
     *         <td colSpan="3" class="gpViewerUpperSeparator">
     *           <div id="{#Id}_fullScreenToggle" class="gpHorizontalUpperToggle"></div>
     *         </td>
     *       </tr>
     *       <tr>
     *         <td vAlign="top" class="gpLeftColumnCell"> // left column
     *           <div id="{#Id}_Catalg" class="gpLeftColumn">
     *             <div id="{#Id}_Layers" class="gpLeftColumnLayers"></div>
     *             <div id="{#Id}_LayersToggle" class="gpVerticalLeftToggle"></div>
     *           </div>
     *         </td>
     *         <td class="gpCentralColumnCell">
     *           <div id="{#Id}_OlMap" class="gpMainMap gpMainMapCell olMap gpMap"></div> // OpenLayers Map
     *         </td>
     *         <td vAlign="top" class="gpRightColumnCell">
     *           <div id="{#Id}_Tools" class="gpRightColumn"> // right column
     *             <div id="{#Id}_ToolsToggle" class="gpVerticalRightToggle"></div>
     *             <div id="{#Id}_ToolBx" class="gpRightColumnTools"></div>
     *           </div>
     *         </td>
     *       </tr>
     *       <tr>
     *         <td colSpan="3" class="gpViewerLowerSeparator">
     *           <div id="{#Id}_infoToggle" class="gpHorizontalLowerToggle"></div>
     *         </td>
     *       </tr>
     *     </tbody>
     *   </table>
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

        this.mapTbl= ownerDoc.createElement('table');
        this.mapTbl.id= this.div.id + "_GpMap";
        this.mapTbl.cellSpacing= this.mapTbl.cellPadding= '0';
        this.mapTbl.className= 'gpMainMap';
        var b= ownerDoc.createElement('tbody');

        var r= ownerDoc.createElement('tr');
        var c= ownerDoc.createElement('td');
        c.colSpan= '3';
        c.className= 'gpViewerUpperSeparator';
        this.fullScDiv= ownerDoc.createElement('div');
        this.fullScDiv.id= this.div.id + "_fullScreenToggle";
        this.fullScDiv.className= 'gpHorizontalUpperToggle';
        c.appendChild(this.fullScDiv);
        r.appendChild(c);
        b.appendChild(r);
        this.mapTbl.appendChild(b);

        r= ownerDoc.createElement('tr');
        c= ownerDoc.createElement('td');
        c.vAlign= 'top';
        c.className= 'gpLeftColumnCell';
        this.leftCell= c;
        this.catalgDiv= ownerDoc.createElement('div');
        this.catalgDiv.id= this.div.id + "_Catalg";
        this.catalgDiv.className= 'gpLeftColumn';
        this.layersDiv= ownerDoc.createElement('div');
        this.layersDiv.id= this.div.id + "_Layers";
        this.layersDiv.className= 'gpLeftColumnLayers';
        this.catalgDiv.appendChild(this.layersDiv);
        this.lT= ownerDoc.createElement('div');
        this.lT.id= this.div.id + "_LayersToggle";
        this.lT.className= 'gpVerticalLeftToggle';
        this.catalgDiv.appendChild(this.lT);
        c.appendChild(this.catalgDiv);
        r.appendChild(c);

        c= ownerDoc.createElement('td');
        c.vAlign= 'top';
        c.className= 'gpCentralColumnCell';
        this.mapDiv= ownerDoc.createElement('div');
        this.mapDiv.id= this.div.id + "_OlMap";
        this.mapDiv.className= 'gpMainMap gpMainMapCell olMap gpMap';
        c.appendChild(this.mapDiv);
        r.appendChild(c);

        c= ownerDoc.createElement('td');
        c.vAlign= 'top';
        c.className= 'gpRightColumnCell';
        this.rightCell= c;
        this.toolsDiv= ownerDoc.createElement('div');
        this.toolsDiv.id= this.div.id + "_Tools";
        this.toolsDiv.className= 'gpRightColumn';
        this.rT= ownerDoc.createElement('div');
        this.rT.id= this.div.id + "_ToolsToggle";
        this.rT.className= 'gpVerticalRightToggle';
        this.toolsDiv.appendChild(this.rT);
        this.toolboxDiv= ownerDoc.createElement('div');
        this.toolboxDiv.id= this.div.id + "_ToolBx";
        this.toolboxDiv.className= 'gpRightColumnTools';
        this.toolsDiv.appendChild(this.toolboxDiv);
        c.appendChild(this.toolsDiv);
        r.appendChild(c);
        b.appendChild(r);

        r= ownerDoc.createElement('tr');
        c= ownerDoc.createElement('td');
        c.colSpan= '3';
        c.className= 'gpViewerLowerSeparator';
        this.infoTgDiv= ownerDoc.createElement('div');
        this.infoTgDiv.id= this.div.id + "_infoToggle";
        this.infoTgDiv.className= 'gpHorizontalLowerToggle';
        c.appendChild(this.infoTgDiv);
        r.appendChild(c);
        b.appendChild(r);

        this.div.appendChild(this.mapTbl);

        OpenLayers.Event.observe(
            this.lT,
            "click",
            OpenLayers.Function.bindAsEventListener(
                this.onVHandleClick,
                {
                    handle:this.lT,
                    target:this.layersDiv,
                    viewer:this
                })
        );
        OpenLayers.Event.observe(
            this.rT,
            "click",
            OpenLayers.Function.bindAsEventListener(
                this.onVHandleClick,
                {
                    handle:this.rT,
                    target:this.toolboxDiv,
                    viewer:this
                })
        );

        this.ready= {w:-1,h:-1,b:0};

        return this.mapDiv;
    },

    /**
     * APIMethod: onVHandleClick
     * A vertical handle has been clicked, hide/show the target div.
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * handle - {DOMElement}
     * toOpen - {Boolean}
     * target - {DOMElement}
     * viewer - {<Geoportal.Viewer.Standard>}
     */
    onVHandleClick: function(e) {
        var openIt= this.toOpen;
        if (openIt===undefined) {
            openIt= this.target.style.display=='none'? true:false;
        }
        if ((openIt==true  && this.target.style.display=='none' ) ||
            (openIt==false && this.target.style.display!='none')) {
            var w= Geoportal.Util.getComputedStyle(this.handle,'width',false);
            this.handle.className=
                this.handle.className=='gpVerticalLeftToggle'?
                    'gpVerticalRightToggle'
                :   'gpVerticalLeftToggle';
            this.target.style.display= openIt? '' : 'none';
            if (openIt) {
                this.target.parentNode.style.width= this.target.parentNode.savedWidth;
            } else {
                this.target.parentNode.savedWidth= Geoportal.Util.getComputedStyle(this.target.parentNode,'width',false);
                this.target.parentNode.style.width= w;
            }
            this.viewer.getMap().updateSize();
            if (this.viewer.infoCntrl) {
                this.viewer.infoCntrl.updateSize();
            }
        }
        if (e!=null) {
            OpenLayers.Event.stop(e);
        }
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
     * Compute view size (gpMainMap div).
     *
     * Parameters:
     * options - {Object}
     */
    completeLayout: function(options) {
        this.setInformationPanelVisibility(true);

        if (this.timeout['render']) { window.clearTimeout(this.timeout['render']); this.timeout['render']= null; }
        this.timeout['render']= window.setTimeout(OpenLayers.Function.bind(function(){
            this.render(this.div);
        },this),250);
    },

    /**
     * APIMethod: setSize
     * Defines the view viewer size.
     *
     * Parameters:
     * width - {String} The new width of the viewer.
     * height - {String} The new height of the viewer.
     */
    setSize: function(width, height) {
        width= typeof(width)=='number'? width+'px':width;//ensure compatibility with width in pixels
        var w= Geoportal.Util.convertToPixels(width,true);
        height= typeof(height)=='number'? height+'px':height;//ensure compatibility with height in pixels
        var h= Geoportal.Util.convertToPixels(height,false);

        var wg= this.div.offsetWidth - w;
        var hg= this.div.offsetHeight - h;
        //var wo= this.catalgDiv.offsetWidth+this.toolsDiv.offsetWidth;
        var ho= this.fullScDiv.parentNode.offsetHeight+this.infoTgDiv.parentNode.offsetHeight;
        this.div.style.width= width;
        this.div.style.height= height;
        if (hg!=0) {
            this.catalgDiv.style.height= (h - ho)+'px';
            this.toolsDiv.style.height= (h - ho)+'px';
        }
        this.getMap().updateSize();
        if (wg!=0 || hg!=0) {//width or height has changed ...
            // force computation :
            this.render(this.div);
        }
        if (this.infoCntrl) {
            this.infoCntrl.updateSize();
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
        if (this.lT) {
            Geoportal.Viewer.Standard.prototype.onVHandleClick.apply({
                handle:this.lT,
                toOpen:b,
                target:this.layersDiv,
                viewer:this
            });
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
        if (this.rT) {
            Geoportal.Viewer.Standard.prototype.onVHandleClick.apply({
                handle:this.rT,
                toOpen:b,
                target:this.toolboxDiv,
                viewer:this
            });
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
        this.openLayersPanel(b);
    },

    /**
     * APIMethod: setToolsPanelVisibility
     * Allows to show or not the tools panel.
     *
     * Parameters:
     * b - {Boolean} If true, show the panel, if not, do not show it.
     */
    setToolsPanelVisibility: function(b) {
        this.openToolsPanel(b);
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
        if (this.timeout[b]) { window.clearTimeout(this.timeout[b]); this.timeout[b]= null; }
        var reload= false;
        if (!b && this.timeout[!b]) {
            reload= true;
        } else {
            var loading= this.ready.h==-1;
            if (loading) {
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
                if (/\d(%|em|pt)/.test(this.div.style.height)) {
                    var rh= Geoportal.Util.convertToPixels(this.div.style.height,false,this.div.parentNode) || this.div.offsetHeight;
                    this.mapTbl.style.height= rh+'px';//table
                    this.mapTbl.rows[1].cells[0].style.height=
                    this.mapTbl.rows[1].cells[1].style.height=
                    this.mapTbl.rows[1].cells[2].style.height=
                    this.toolsDiv.style.height=
                    this.catalgDiv.style.height= (
                        - this.mapTbl.rows[0].offsetHeight
                        + rh
                        - this.mapTbl.rows[2].offsetHeight
                    )+'px';
                }
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
        if (this.infoCntrl) {
            this.infoCntrl.showControls(!b);
            this.infoCntrl.updateSize();
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Viewer.Standard"*
     */
    CLASS_NAME: "Geoportal.Viewer.Standard"
});
