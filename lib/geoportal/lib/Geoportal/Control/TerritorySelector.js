/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.TerritorySelector
 * Allow changing Geoportal's territory.
 *
 * Inherits from:
 * - <OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>
 */
Geoportal.Control.TerritorySelector= OpenLayers.Class(Geoportal.Control, {

    /**
     * Constructor: Geoportal.Control.TerritorySelector
     * 
     * Parameters:
     * options - {Object} holds various options :
     *      * territory - {String} See {<Geoportal.Viewer.territory>}
     */
    initialize:function(options) {
        Geoportal.Control.prototype.initialize.apply(this,arguments);
        if (!this.territory) {
            this.territory= 'FXX';
        }
    },

    /**
     * APIMethod: destroy
     * Destroy this control
     */
    destroy:function() {
        if (this.titleDiv) {
            OpenLayers.Event.stopObservingElement(this.titleDiv);
            this.titleDiv= null;
        }
        this.territoriesDiv= null;
        if (this.selectTerritories) {
            OpenLayers.Event.stopObservingElement(this.selectTerritories);
            this.selectTerritories= null;
        }
        this.div.innerHTML= '';
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: setMap
     * Set the map property for the control. This is done through an accessor
     * so that subclasses can override this and take special action once
     * they have their map variable set.
     * IGNF: _redesign due to activeOverMapOnly addition_
     *
     * Parameters:
     * map - {<OpenLayers.Map at
     * http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this,arguments);
        var browser= this.map.getApplication().browser;
        if (browser.msie && parseFloat(browser.version)<=8) {
            this.ieHack= {};
        }
    },

    /**
     * APIMethod: draw
     * The draw method is called when the control is ready to be displayed
     * on the page.  If a div has not been created one is created.  Controls
     * with a visual component will almost always want to override this method
     * to customize the look of control.
     *
     * IE 8- hack :
     * If you have developed a custom Web page that launches a ClickOnce application
     * using Active Scripting, you may find that the application will not launch on
     * some machines. Internet Explorer contains a setting called Automatic prompting
     * for file downloads, which affects this behavior. This setting is available on
     * the Security Tab in its Options menu that affects this behavior. It is called
     * Automatic prompting for file downloads, and it is listed underneath the
     * Downloads category. The property is set to Enable by default for intranet Web
     * pages, and to Disable by default for Internet Web pages. When this setting is
     * set to Disable, any attempt to activate a ClickOnce application
     * programmatically (for example, by assigning its URL to the document.location
     * property) will be blocked. Under this circumstance, users can launch
     * applications only through a user-initiated download, for example, by clicking
     * a hyperlink set to the application's URL.
     *
     * Parameters:
     * px - {<OpenLayers.Pixel>} The top-left pixel position of the control
     *      or null.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    draw:function(px) {
        this.div= Geoportal.Control.prototype.draw.apply(this, arguments);
        this.getUI().reset();
        this.titleDiv= this.div.ownerDocument.createElement('div');
        this.titleDiv.id= this.id+'_title';
        this.titleDiv.className= this.getDisplayClass()+'Label';
        this.titleDiv.innerHTML= OpenLayers.i18n(this.getDisplayClass()+'.title');
        this.div.appendChild(this.titleDiv);
        this.territoriesDiv= this.div.ownerDocument.createElement('div');
        this.territoriesDiv.id= this.id+'_container';
        this.territoriesDiv.className= this.getDisplayClass()+'Container';
        if (this.ieHack) {
            this.selectTerritories= this.div.ownerDocument.createElement('div');
            this.selectTerritories.id= this.id+'_selter';
            this.selectTerritories.style.width= '100%';
            var ul= this.div.ownerDocument.createElement('ul');
            for (var t in Geoportal.Catalogue.TERRITORIES) {
                if (t=='EUE') { continue; } // alias of FXX !
                if (Geoportal.Catalogue.TERRITORIES[t].baseLayers===undefined) { continue }
                this.ieHack[t]= (t==this.territory);
                this.ieHack.selected= t;
                var o= this.div.ownerDocument.createElement('li');
                if (t!==this.territory) {
                    var a= this.div.ownerDocument.createElement('a');
                    a.id= t+'_href_'+this.id;
                    var rHref= location.pathname+"?";
                    var prms= OpenLayers.Util.getParameters();
                    for (var prm in prms) {
                        if (prm=="t" || prm=="l") {
                            delete prms[prm];
                        }   
                    }
                    rHref+= OpenLayers.Util.getParameterString(prms);
                    var tt= this.territoryToUrlParameter(t);
                    rHref= OpenLayers.Util.urlAppend(rHref, "t="+tt);
                    rHref= OpenLayers.Util.urlAppend(rHref, "l="+OpenLayers.Lang.getCode());
                    a.href= "#";
                    a.alt= tt;
                    //the ugly hack ...
                    a.onclick= (function(href) { return function() { window.location.assign(href); } })(rHref);
                    a.appendChild(this.div.ownerDocument.createTextNode(OpenLayers.i18n(t)));
                    o.appendChild(a);
                } else {
                    o.id= t+'_href_'+this.id;
                    o.appendChild(this.div.ownerDocument.createTextNode(OpenLayers.i18n(t)));
                }
                ul.appendChild(o);
            }
            this.selectTerritories.appendChild(ul);
            this.territoriesDiv.appendChild(this.selectTerritories);
        } else {
            var c= this.div.ownerDocument.createElement('center');
            var f= this.div.ownerDocument.createElement('form');
            f.name= f.id= this.id+'_territories';
            f.action= 'javascript:void(0);';
            f.style.margin= '0px';
            f.style.padding= '0px';
            f.style.border= '0px';
            this.selectTerritories= this.div.ownerDocument.createElement('select');
            this.selectTerritories.name= this.selectTerritories.id= this.id+'_selter';
            this.selectTerritories.style.width= '100%';
            this.selectTerritories.size= 1;
            for (var t in Geoportal.Catalogue.TERRITORIES) {
                if (t=='EUE') { continue; } // alias of FXX !
                if (Geoportal.Catalogue.TERRITORIES[t].baseLayers===undefined) { continue }
                var o= this.selectTerritories.ownerDocument.createElement('option');
                o.value= t;
                o.selected= (t==this.territory);
                o.disabled= false;
                o.innerHTML= /*'&nbsp;&nbsp;'+*/OpenLayers.i18n(t);
                this.selectTerritories.appendChild(o);
            }
            f.appendChild(this.selectTerritories);
            c.appendChild(f);
            this.territoriesDiv.appendChild(c);
        }
        this.div.appendChild(this.territoriesDiv);
        this.showControls(false);
        OpenLayers.Event.observe(this.titleDiv, "click",
            OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
        );
        OpenLayers.Event.observe(this.titleDiv, "dblclick",
            OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
        );
        OpenLayers.Event.observe(this.titleDiv, "mousedown",
            OpenLayers.Function.bindAsEventListener(this.disableNavigation, this)
        );
        OpenLayers.Event.observe(this.titleDiv, "mouseup",
            OpenLayers.Function.bindAsEventListener(this.enableNavigation, this)
        );
        if (!this.ieHack) {

            OpenLayers.Event.observe(this.selectTerritories, "mousedown",
                OpenLayers.Function.bindAsEventListener(this.disableNavigation, this)
            );
            OpenLayers.Event.observe(this.selectTerritories, "mouseup",
                OpenLayers.Function.bindAsEventListener(this.enableNavigation, this)
            );

            this.selectTerritories.onchange= OpenLayers.Function.bindAsEventListener(this.onTerritoryChange, this);
        }

        return this.div;
    },

    /**
     * APIMethod: showControls
     * Hide/Show all territories depending on whether we are
     *     minimized or not.
     *
     * Parameters:
     * minimize - {Boolean}
     */
    showControls: function(minimize) {
        this.territoriesDiv.style.display= minimize ? "none" : "block";
    },

    /**
     * APIMethod: clickOnLabel
     * In case of double click on the label, open or close it.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    clickOnLabel: function(evt) {
        var minimize= this.territoriesDiv.style.display=="block";
        this.showControls(minimize);
        this.ignoreEvent(evt);
    },

    /**
     * APIMethod: ignoreEvent
     * Stop the given event.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    ignoreEvent: function(evt) {
        if (evt!=null) {
            OpenLayers.Event.stop(evt);
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
    disableNavigation:function(evt) {
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
    enableNavigation:function(evt) {
        var navCntrls= this.map.getControlsByClass('OpenLayers.Control.Navigation');
        if (navCntrls && navCntrls.length>0) {
            navCntrls[0].activate();
        }
    },

    /**
     * APIMethod: onTerritoryChange
     * Callback when an analogic scale has been chosen
     *
     * Parameters:
     * evt - {Event}
     */
    onTerritoryChange:function(evt) {
        this.enableNavigation(evt);
        var territory= this.territory;
        if (this.selectTerritories) {
            if (!this.ieHack) {
                territory= this.selectTerritories.options[this.selectTerritories.selectedIndex].value;
                this.selectTerritories.blur();
                if (this.territory!=territory) {
                    var rHref= location.pathname+"?";
                    var prms= OpenLayers.Util.getParameters();
                    for (var prm in prms) {
                        if (prm=="t" || prm=="l") {
                            delete prms[prm];
                        }
                    }
                    rHref+= OpenLayers.Util.getParameterString(prms);
                    var tt= this.territoryToUrlParameter(territory);
                    rHref= OpenLayers.Util.urlAppend(rHref, "t="+tt);
                    rHref= OpenLayers.Util.urlAppend(rHref, "l="+OpenLayers.Lang.getCode());
                    window.location.assign(rHref);
                }
            } else {
                ;/* never get there ! */
            }
        }
    },

    /**
     * APIMethod: territoryToUrlParameter
     * Map the the territory code value with the expected territory parameter
     * value on the targetted URL.
     *      Defaults to return the territory code.
     *
     * Parameter:
     * t - {String} a country code. If none, use territory property.
     *
     * Returns:
     * {String} the parameter value bound to the given code.
     */
    territoryToUrlParameter: function(t) {
        return t;
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.titleDiv) {
            this.titleDiv.innerHTML= OpenLayers.i18n(this.getDisplayClass()+'.title');
        }
        if (this.selectTerritories) {
            if (!this.ieHack) {
                for (var i= 0, l= this.selectTerritories.options.length; i<l; i++) {
                    var territory= this.selectTerritories.options[i].value;
                    this.selectTerritories.options[i].innerHTML=
                        /*'&nbsp;&nbsp;'+*/OpenLayers.i18n(territory);
                }
            } else {
                for (var t in this.ieHack) {
                    if (t=='selected') { continue; }
                    var e= OpenLayers.Util.getElement(t+"_href_"+this.id);
                    if (e) {
                        e.innerHTML= OpenLayers.i18n(t);
                    }
                }
            }
        }
    },

    /**
     * Constant: Geoportal.Control.TerritorySelector
     * {String} *Geoportal.Control.TerritorySelector*
     */
    CLASS_NAME: 'Geoportal.Control.TerritorySelector'
});


