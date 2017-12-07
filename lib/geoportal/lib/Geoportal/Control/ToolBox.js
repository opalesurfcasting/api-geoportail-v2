/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/ToggleControl.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.ToolBox
 * The Geoportal framework toolbox class.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id='#{Id}' class='gpControlToolBox'>
 *   <div id='#{toolbox}' class='gpToolBoxClass'>
 *     <div id='#{nameOfBox}' class='gpControlLabelClass'>
 *       <center>outils</center>
 *     </div>
 *     <div id='#{contenuTools}' class='gpToolBoxContentContainer'>
 *       <div class='gpToolBoxContent'>
 *         <div id='#{mapid}_navbar' class='gpControlNavToolbar'></div>
 *         <div id='#{mapid}_measure' class='gpControlMeasureToolbar' style=''></div>
 *         <div id='#{mapid}_search' class='gpControlSearchToolbar' style=''></div>
 *         <div id='#{mapid}_addlyr' class='gpControlLayerToolbar' style=''></div>
 *         <div id='#{mapid}_zoombar' class='gpZoomBarClass'></div>
 *         <div id='#{mapid}_meares' class='gpControlMeasureToolbarResult'></div>
 *         <div id='#{mapid}_userctrls' class='gpToolBoxUsersControlsContainer'></div>
 *       </div>
 *       <div id='"+this.id+"_ovmap' class='gpControlOverviewMap'></div>
 *     </div>
 *   </div>
 * </div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control.ToggleControl>}
 */
Geoportal.Control.ToolBox = OpenLayers.Class( Geoportal.Control.ToggleControl, {

    /**
     * Property: labelDivID
     * {String} the toolbox label
     */
    labelDivID: null,

    /**
     * Property: tbxContent
     * {DOMElement} the toolbox content panel.
     */
    tbxContent: null,

    /**
     * Property: usersContent
     * {DOMElement} the user's controls container.
     */
    usersContent: null,

    /**
     * Property: ovmContent
     * {DOMElement} the overview map panel.
     */
    ovmContent: null,

    /**
     * Constructor: Geoportal.Control.ToolBox
     * Build the toolbox
     *
     * Parameters:
     * options - {Object} Hashtable of options to set on the toolbox
     */
    initialize: function(options) {
        Geoportal.Control.ToggleControl.prototype.initialize.apply(this, [options]);
    },

    /**
     * APIMethod: destroy
     * Stop observing events and delete control.
     */
    destroy: function() {
        OpenLayers.Event.stopObservingElement(this.div);
        this.usersContent= null;
        this.cntrlContent= null;
        Geoportal.Control.ToggleControl.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: loadContents
     * Set up the labels and divs for the control
     */
    loadContents: function() {
        OpenLayers.Event.observe(
            this.div,
            "dblclick",
            OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
        );
        OpenLayers.Event.observe(
            this.div,
            "click",
            OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
        );
        OpenLayers.Event.observe(
            this.div,
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
            this.div,
            "mouseup",
            OpenLayers.Function.bindAsEventListener(this.mouseUp,this)
        );
        OpenLayers.Event.observe(
            this.div,
            "mouseover",
            OpenLayers.Function.bindAsEventListener(Geoportal.Control.mapMouseOut,this)
        );
        OpenLayers.Event.observe(
            this.div,
            "mouseout",
            OpenLayers.Function.bindAsEventListener(Geoportal.Control.mapMouseOver,this)
        );

        var d1= this.createInnerDiv(
            OpenLayers.Util.createUniqueID("toolbox"),
            'gpToolBoxClass',
            this.div);
        var d2;
        if (!this.outsideViewport) {
            this.labelDivID= OpenLayers.Util.createUniqueID("nameOfBox");
            d2= this.createInnerDiv(
                this.labelDivID,
                'gpControlLabelClass',
                d1,
                OpenLayers.i18n(this.getDisplayClass()+'.label'));
            OpenLayers.Event.observe(
                d2,
                "click",
                OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
            );
            OpenLayers.Event.observe(
                d2,
                "dblclick",
                OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
            );
        }
        d2= this.createInnerDiv(
            OpenLayers.Util.createUniqueID("contenuTools"),
            'gpToolBoxContentContainer',
            d1);
        this.tbxContent= this.createInnerDiv(null,'gpToolBoxContent',d2);
        // Navigation :
        var d4= this.createInnerDiv(this.id+'_navbar','gpControlNavToolbar',this.tbxContent);
        // Measure :
        d4= this.createInnerDiv(this.id+'_measure','gpControlMeasureToolbar',this.tbxContent);
        d4.style.display= 'none';
        // Search :
        d4= this.createInnerDiv(this.id+'_search','gpControlSearchToolbar',this.tbxContent);
        d4.style.display= 'none';
        // Addition :
        d4= this.createInnerDiv(this.id+'_addlyr','gpControlLayerToolbar',this.tbxContent);
        d4.style.display= 'none';
        // Zoom :
        d4= this.createInnerDiv(this.id+'_zoombar','gpZoomBarClass',this.tbxContent);
        // Measure results :
        d4= this.createInnerDiv(this.id+'_meares','gpControlMeasureToolbarResult',this.tbxContent);
        d4.style.display= 'none';
        // Users' controls :
        this.usersContent= this.createInnerDiv(this.id+'_userctrls','gpToolBoxUsersControlsContainer',this.tbxContent);
        // Overview :
        this.ovmContent= this.createInnerDiv(this.id+'_ovmap','gpControlOverviewMap',d2);

        if (!this.outsideViewport) {
            //sauvegarde pour minimize/maximize
            this.setContent(this.div.firstChild.childNodes[1]);//contenuTools
        }
    },

    /**
     * APIMethod: createControlAnchor
     * Create an empty div into the ToolBox content for anchoring external
     * controls. Append this div to the user's controls div of the panel.
     *
     * (start code)
     * var d= this.createControlAnchor('myCntrlID',displayClass);
     * var c= new OpenLayers.Control({div: d, ...});
     * (end)
     *
     * Parameters:
     * id - {String} div's identifier, optional.
     * cn - {String} className value, optional. The div's class will at least
     *               contain 'olControlNoSelect'.
     *
     * Returns:
     * {DOMElement} the newly created div or null if the user's controls
     * container does not exist.
     */
    createControlAnchor: function(id,cn) {
        var d= null;
        if (this.usersContent) {
            d= this.createInnerDiv(id,cn,this.tbxContent);
            this.usersContent.appendChild(d);
        }

        return d;
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *
     * Parameters:
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} event fired
     *       evt.lang holds the new language
     */
    changeLang: function(evt) {
        var div= OpenLayers.Util.getElement(this.labelDivID);
        if (div) {
            div.innerHTML= '<center>'+OpenLayers.i18n(this.getDisplayClass()+'.label')+'</center>';
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.ToolBox"*
     */
    CLASS_NAME: "Geoportal.Control.ToolBox"
});
