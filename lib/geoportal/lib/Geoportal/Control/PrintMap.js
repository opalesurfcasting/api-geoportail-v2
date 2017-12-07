/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 * @requires Geoportal/Viewer/Default.js
 */
/**
 * Class: Geoportal.Control.PrintMap
 * Implements a button control for printing the current map.
 *     Experimental:
 *     * Successfully tested with Firefox, Chromium, Chrome, Internet
 *     Explorer, Safari, Opera although it cannot be considered to be yet
 *     stable;
 *     * Cookies need to be accepted in order to make this control working.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.PrintMap= OpenLayers.Class(Geoportal.Control, {

    /**
     * Property: type
     * {String} The type of <Geoportal.Control> -- When added to a
     *     <Control.Panel>, 'type' is used by the panel to determine how to
     *     handle our events.
     */
    type: OpenLayers.Control.TYPE_BUTTON,

    /**
     * APIProperty: size
     * {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} Map's size in pixels.
     *      Defaults to map's size.
     */
    size: null,

    /**
     * APIProperty: popupSettings
     * {String} Attributes of the popup window that will contain the printable
     * page.
     *      Defaults to *'toolbar=no,location=no,menubar=no,scrollbars=no'*
     */
    popupSettings: "toolbar=no,location=no,menubar=no,scrollbars=no",

    /**
     * APIProperty: onPrint
     * {String} Javascript code to invoke before printing the popup window.
     */
    onPrint: null,

    /**
     * Constructor: Geoportal.Control.PrintMap
     * Build a simple print preview button.
     *
     * Parameters:
     * options - {Object} any options usefull for control.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
        // FIXME: OpenLayers.UI
        this.setTitle(this.getTitle() || this.getDisplayClass()+'.title');
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function () {
        if (this.delayTrigger) {
            window.clearTimeout(this.delayTrigger);
            this.delayTrigger= null;
        }
        if (this.printableDocument) {
            this.printableDocument.close();
            this.printableDocument= null;
        }
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: setMap
     * Set the map property for the control. This is done through an accessor
     * so that subclasses can override this and take special action once
     * they have their map variable set.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this,arguments);
        if (!this.size) {
            var d= (this.map.getApplication()? this.map.getApplication().div : this.map.div);
            this.size= new OpenLayers.Size(d.clientWidth, d.clientHeight);
        }
    },

    /**
     * APIMethod: trigger
     * Do the print by openning a popup that contains the map's div content to
     * be printed.
     *      Can be overwritten to modify the printing output.
     */
    trigger: function() {
        if (this.delayTrigger) {
            window.clearTimeout(this.delayTrigger);
            this.delayTrigger= null;
        }
        // open a new window by copying the inner content of the map's div ...
        // add attributions/originators for each layer on the window.
        if (!this.map || !this.map.getApplication()) { return; }
        this.tick= ''+new Date().getTime();
        var T= this.getPageContent();
        if (this.printableDocument) {
            this.printableDocument.close();
            this.printableDocument= null;
        }
        var settings= this.popupSettings;
        if (!settings.match(/width/i)) {
            settings+=(settings.length>0? ",":"")+"width="+(20+this.size.w);
        }
        if (!settings.match(/height/i)) {
            settings+=(settings.length>0? ",":"")+"height="+(320+this.size.h);
        }
        //IE9: about:blank is considered unsecured ...
        //this.printableDocument= window.open((T.isUrl? T.html:'about:blank'),this.tick,settings,true);
        this.printableDocument= window.open((T.isUrl? T.html:window.location.href),this.tick,settings,true);
        if (this.printableDocument) {
            if (T.isUrl) {
                this.printableDocument.print();
                this.printableDocument.close();
                this.printableDocument= null;
                return;
            }
            if (!this.printableDocument.opener) {
                this.printableDocument.opener= window.self;
            }
            var tgtDoc= this.printableDocument.document;
            tgtDoc.open();
            tgtDoc.write(T.html);
            tgtDoc.close();
            this.delayTrigger= window.setTimeout(OpenLayers.Function.bind(this.createMap, this), 100);
        }
    },

    /**
     * Method: copyCreatePopup
     * Create a popup with the same arguments as its original.
     *
     * Parameters:
     * popup - {<OpenLayers.Popup at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Popup-js.html>} the popup to copy create
     *
     * Return:
     * {<OpenLayers.Popup at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Popup-js.html>} a copy of the given popup.
     */
    copyCreatePopup: function(popup) {
        var cn= eval(popup.CLASS_NAME);
        var args= [];
        args.push(popup.id);
        args.push(popup.lonlat.clone());
        args.push(popup.contentSize.clone());
        args.push(popup.contentHTML);
        if (popup.anchor) {
            args.push(popup.anchor);
        }
        args.push(popup.closeDiv? true:false);
        if (popup.feature) {
            args.push(popup.backgroundColor);
            args.push(popup.opacity);
            args.push(popup.closeDiv? function(e) {OpenLayers.Event.stop(e);} : null);
            args.push(null);//don't care about feature ...
            //args.push(popup.feature.clone()); /* feature.Layer is null ... */
        } else {
            args.push(popup.closeDiv? function(e) {OpenLayers.Event.stop(e);} : null);
        }
        var cpopup= OpenLayers.Class.newObject(cn, args);
        //FIXME: should be options of OpenLayers' Popup constructor ?
        if (popup.backgroundColor!=OpenLayers.Popup.COLOR) {
            cpopup.setBackgroundColor(popup.backgroundColor);
        }
        if (popup.opacity!=OpenLayers.Popup.OPACITY) {
            cpopup.setOpacity(popup.opacity);
        }
        if (popup.border!=OpenLayers.Popup.BORDER) {
            cpopup.setBorder(popup.border);
        }
        if (popup.autoSize) {
            cpopup.autoSize= true;
        }
        if (popup.minSize) {
            cpopup.minSize= popup.minSize.clone();
        }
        if (popup.maxSize) {
            cpopup.maxSize= popup.maxSize.clone();
        }
        if (popup.panMapIfOutOfView) {
            cpopup.panMapIfOutOfView= true;
        }
        if (popup.keepInMap) {
            cpopup.keepInMap= true;
        }
        if (popup.closeOnMove) {
            cpopup.closeOnMove= true;
        }
        if (popup.fixedRelativePosition) {
            cpopup.fixedRelativePosition= popup.fixedRelativePosition;
        }
        return cpopup;
    },

    /**
     * Method: copyCreateLayer
     * Create a layer with the same arguments as its original.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the layer to copy create
     *
     * Return:
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} a copy of the given layer.
     */
    copyCreateLayer: function(layer) {
        var cn= eval(layer.CLASS_NAME);
        var args= [];
        args.push(layer.name);
        if (layer.url!=undefined) {
            args.push(layer.url);
            if (layer.params!=undefined) {
                if (layer.CLASS_NAME==='OpenLayers.Layer.WorldWind') {
                    args.push(layer.lzd);
                    args.push(layer.zoomLevels);
                }
                args.push(OpenLayers.Util.extend({},layer.params));
            }
        } else if (layer.location!=undefined) {
            //FIXME: OpenLayers.Layer.Text constructor should have location parameter like OpenLayers.Layer.GeoRSS
            if (layer.CLASS_NAME!=='OpenLayers.Layer.Text') {
                args.push(layer.location);
            }
        }
        var opts= layer.getOptions();
        if (opts.projection) {
            opts.projection= opts.projection.clone();
        }
        if (opts.formatOptions) {
            if (opts.formatOptions.internalProjection) {
                opts.formatOptions.internalProjection= opts.formatOptions.internalProjection.clone();
            }
        }
        // maxExtent is expressed in map's projection :
        if (opts.maxExtent) {
            opts.maxExtent= opts.maxExtent.transform(layer.map.getProjection(), layer.getNativeProjection());
        }
        args.push(opts);
        var clayer= OpenLayers.Class.newObject(cn, args);
        return clayer;
    },

    /**
     * Method: addLayers
     * Add all baselayers and visible layers.
     */
    addLayers: function() {
        if (this.delayTrigger) {
            window.clearTimeout(this.delayTrigger);
            this.delayTrigger= null;
        }
        var d= null, a= null;
        try {
            d= this.printableDocument.document.getElementById('printContainer_'+this.tick);
            a= this.printableDocument.document.getElementById('printAttribution_'+this.tick);
            if (d==null || a==null ||
                this.printableDocument.window.__Geoportal$PrintReady===undefined ||
                this.printableDocument.window.printViewer==null ||
                this.printableDocument.window.printViewer.isMapReady()===false) {
                throw "|/-\\|";
            }
        } catch (ex) {
            this.delayTrigger= window.setTimeout(OpenLayers.Function.bind(this.addLayers, this), 100);
            return;
        }
        (function(cntrl){
            var curdoc= OpenLayers.getDoc();
            OpenLayers.setDoc(cntrl.printableDocument.document);
            var map= cntrl.printableDocument.window.printViewer.getMap();
            // make sure all baselayers are in :
            for (var i= 0, l= cntrl.map.layers.length; i<l; i++) {
                var layer= cntrl.map.layers[i];
                if (layer.isBaseLayer && !(layer instanceof Geoportal.Layer)) {
                    // user base layer :
                    var blayer= cntrl.copyCreateLayer(layer);
                    Geoportal.Map.prototype.addLayer.apply(map, [blayer]);
                }
            }
            // center and zoom :
            var c= cntrl.map.getCenter().transform(cntrl.map.getProjection(), OpenLayers.Projection.CRS84);
            map.setCenterAtLonLat(c.lon, c.lat, cntrl.map.getZoom());
            // fetch remaining layers :
            for (var i= 0, l= cntrl.map.layers.length; i<l; i++) {
                var layer= cntrl.map.layers[i];
                if (layer.isBaseLayer) { continue; }
                if (!layer.visibility) { continue; }
                if (!layer.inRange) { continue; }
                if ((typeof(Geoportal.Layer.WMSC)=='function' && layer instanceof Geoportal.Layer.WMSC) ||
                    (typeof(Geoportal.Layer.WMTS)=='function' && layer instanceof Geoportal.Layer.WMTS)) {
                    var opts= {
                        visibility:true,
                        opacity:layer.opacity
                    };
                    cntrl.printableDocument.window.printViewer.addGeoportalLayer(layer.name,opts);
                } else {
                    var clayer= cntrl.copyCreateLayer(layer);
                    Geoportal.Map.prototype.addLayer.apply(map, [clayer]);
                    if ((layer instanceof OpenLayers.Layer.Vector) &&
                        layer.features.length>0) {//true OpenLayers.Layer.Vector with features
                        var features= [];
                        for (var ii= 0, il= layer.features.length; ii<il; ii++) {
                            var feature= layer.features[ii].clone();
                            features.push(feature);
                        }
                        // prevent callbacks :
                        clayer.addFeatures(features,{silent:true});
                    }
                    if ((layer instanceof OpenLayers.Layer.Markers) &&
                        layer.markers.length>0) {//true OpenLayers.Layer.Markers with markers
                        for (var ii= 0, il= layer.markers.length; ii<il; ii++) {
                            var marker= new OpenLayers.Marker(layer.markers[ii].lonlat.clone(), layer.markers[ii].icon.clone());
                            clayer.addMarker(marker);
                        }
                    }
                }
            }
            // popup ?
            for (var i= 0, l= cntrl.map.popups.length; i<l; i++) {
                var popup= cntrl.map.popups[i];
                if (!OpenLayers.Element.visible(popup.div)) { continue; }
                var cpopup= cntrl.copyCreatePopup(popup);
                Geoportal.Map.prototype.addPopup.apply(map, [cpopup]);
            }
            cntrl.printableDocument.window.__Geoportal$PrintReady= true;
            OpenLayers.setDoc(curdoc);
        })(this);
    },

    /**
     * Method: createMap
     * Build the print map by fetching layers in the current map.
     */
    createMap: function() {
        if (this.delayTrigger) {
            window.clearTimeout(this.delayTrigger);
            this.delayTrigger= null;
        }
        var d= null, a= null;
        try {
            d= this.printableDocument.document.getElementById('printContainer_'+this.tick);
            a= this.printableDocument.document.getElementById('printAttribution_'+this.tick);
            if (this.printableDocument.window.OpenLayers===undefined ||
                this.printableDocument.window.Geoportal===undefined ||
                this.printableDocument.window.Geoportal.Viewer===undefined ||
                this.printableDocument.window.Geoportal.Viewer.Default===undefined ||
                this.printableDocument.window.printViewer===undefined ||
                this.printableDocument.window.__Geoportal$PrintReady===undefined ||
                d==null || a==null) {
                throw "|/-\\|";
            }
        } catch (ex) {
            this.delayTrigger= window.setTimeout(OpenLayers.Function.bind(this.createMap, this), 100);
            return;
        }
        var rm= {
            apiKey:[]
        };
        for (var i= 0, l= this.map.catalogue.apiKey.length; i<l; i++) {
            var k= this.map.catalogue.apiKey[i];
            rm.apiKey.push(k);
            var georm= this.map.catalogue[k]||{};
            rm[k]= {
                tokenServer:georm.tokenServer||'http://localhost/',
                tokenTimeOut:georm.tokenTimeOut||60000,
                transport:'referrer',
                referrer:window.location.href||'http://localhost/',
                bounds:(georm.bounds||new OpenLayers.Bounds(-180,-90,180,90)).toArray(),
                resources:{},
                allowedGeoportalLayers:(georm.allowedGeoportalLayers||[]).slice()
            };
            for (var r in georm.layers) {
                rm[k].resources[r]= OpenLayers.Util.applyDefaults({}, georm.layers[r]);
            }
        }
        (function(cntrl){
            var curdoc= OpenLayers.getDoc();
            OpenLayers.setDoc(cntrl.printableDocument.document);
            cntrl.printableDocument.window.OpenLayers.IMAGE_RELOAD_ATTEMPTS= 2;
            cntrl.printableDocument.window.printViewer= new Geoportal.Viewer.Default(
                d,
                OpenLayers.Util.extend({
                    mode:'mini',
                    territory:cntrl.map.baseLayer.territory,
                    projection:cntrl.map.getProjection().clone(),
                    displayProjection:OpenLayers.Projection.CRS84.clone(),
                    defaultControls:{
                        'Geoportal.Control.Logo':{
                            logoSize:Geoportal.Control.Logo.WHSizes['mini'],
                            attributionDiv:a
                        }
                    },
                    controls:[
                        new Geoportal.Control.Loading(null, {
                            printButton: cntrl.printableDocument.document.getElementById('prnt'+cntrl.id),
                            maximizeControl:function(evt) {
                                Geoportal.Control.Loading.prototype.maximizeControl.apply(this, [evt]);
                                // hide Print button
                                this.printButton.style.display= 'none';
                            },
                            minimizeControl:function(evt) {
                                Geoportal.Control.Loading.prototype.minimizeControl.apply(this, [evt]);
                                // show Print button
                                this.printButton.style.display= '';
                            }
                        })
                    ],
                    proxy:OpenLayers.ProxyHost||null,
                    nameInstance:'printViewer',
                    //load viewer's theme :
                    loadTheme:cntrl.map.getApplication().loadTheme
                },rm));
            OpenLayers.setDoc(curdoc);
            cntrl.delayTrigger= window.setTimeout(OpenLayers.Function.bind(cntrl.addLayers, cntrl), 500);
        })(this);
    },

    /**
     * Method: getAPIScripts
     * Retrieve API scripts governing this map.
     *
     * Returns:
     * {String} the API (Geoportal and OpenLayers) scripts for the current map.
     */
    getAPIScripts: function() {
        var scripts= '', px= '', u= '', vn= (Geoportal.VERSION_NUMBER.split(';').shift()).split(' ').pop();
        if (vn=='Min') {
            px= !OpenLayers.singleFile? 'lib/' : '';
            u= OpenLayers.Util.resolveUrl(null,OpenLayers._getScriptLocation()+px+'OpenLayers.js');
            scripts+= '<script type="text/javascript" src="'+u+'"><!--//--><![CDATA[//><!-- //--><!]]></script>\n';
        }
        px= !Geoportal.singleFile? 'lib/' : '';
        u= OpenLayers.Util.resolveUrl(null,Geoportal._getScriptLocation()+px+'Geoportal'+vn+'.js');
        scripts+= '<script type="text/javascript" src="'+u+'"><!--//--><![CDATA[//><!-- //--><!]]></script>\n';
        return scripts;
    },

    /**
     * APIMethod: setScripts
     * Insert Javascript codes to the print page.
     *
     * Parameters:
     * code - {String | Array({String})} Javascript inline code or urls to
     *        add.
     *
     * Returns:
     * {String} the scripts for the current map. Empty code by default is
     * returned.
     */
    setScripts: function(code) {
        var scripts= '';
        if (code) {
            if ((code instanceof String) && code.match(/^(http|\.|\/)/)) {
                code= [code];
            }
            if (code instanceof String) {
                scripts+=
'<script type="text/javascript" charset="utf-8">\n'+
'<!--//--><![CDATA[//><!--\n'+
  code+'\n'+
'  //--><!]]>\n'+
'</script>';
            } else {
                for (var i= 0, l= code.length; i<l; i++) {
                    scripts+=
'\n<script type="text/javascript" charset="utf-8" src="'+code[i]+'"><!--//--><![CDATA[//><!-- //--><!]]></script>';
                }
            }
        }
        return scripts;
    },

    /**
     * Method: getStyles
     * Retrieve CSS rules governing this map.
     *
     * Returns:
     * {String} the CSS links et styles found in the current map.
     */
    getStyles: function() {
        var csses= '';
        for (var i= 0, li= document.styleSheets.length; i<li; i++) {
            var css= document.styleSheets.item(i);
            var ownerNode= css.owningElement || css.ownerNode;
            if (css.href) { //LINK
                csses+=
'<link rel="stylesheet" type="text/css" '+
  (ownerNode.id? 'id="'+ownerNode.id+'" ':'')+
  'href="'+css.href+'"'+
'/>\n';
            } else {        //STYLE
                csses+=
'<style type="text/css"'+(ownerNode.id? ' id="'+ownerNode.id+'"':'')+'>\n'+
'<!--/*--><![CDATA[/*><!--*/\n';
                var rules= css.rules || css.cssRules;
                for (var j= 0, lj= rules.length; j<lj; j++) {
                    var rule= rules.item(j);
                    csses+= rule.selectorText+'{'+rule.style.cssText+'}\n';
                }
                csses+=
'  /*]]>*/-->\n'+
'</style>\n';
            }
        }
        csses+=
'<style type="text/css">\n'+
'<!--/*--><![CDATA[/*><!--*/\n'+
  '.gpMainMapCell {\n'+
    'border:0px solid none;\n'+
  '}\n'+
  'div#pHeader'+this.tick+'{\n'+
    'float:left;\n'+
  '}\n'+
  'h1#pHeaderTitle'+this.tick+'{\n'+
    'margin:5px;\n'+
  '}\n'+
  'div#pProlog'+this.tick+'{\n'+
  '}\n'+
  'form#pPrologFrm'+this.tick+'{\n'+
  '}\n'+
  'form#pPrologFrm'+this.tick+' div{\n'+
    'width:'+this.size.w+'px;\n'+
    'margin-bottom:5px;\n'+
  '}\n'+
  'textarea#pPrologComments'+this.tick+'{\n'+
    'width:99%;\n'+
  '}\n'+
  'div#pFooter'+this.tick+'{\n'+
    'font-size:0.75em;\n'+
    'width:99%;\n'+
    'float:left;\n'+
  '}\n'+
  'div#pFooterInfo'+this.tick+'{\n'+
  '}\n'+
  'div#pFooterDate'+this.tick+'{\n'+
  '}\n'+
  'div#printAttribution_'+this.tick+'{\n'+
  '}\n'+
'  /*]]>*/-->\n'+
'</style>\n';
        return csses;
    },

    /**
     * APIMethod: header
     * Build the header of the page or URL to print.
     *      Defaults to Geoportal's logo.
     *
     * Returns:
     * {String} HTML code of the header.
     */
    header: function() {
        var html=
'<div id="pHeader'+this.tick+'">\n'+
  '<h1 id="pHeaderTitle'+this.tick+'">\n'+
    '<a target="_blank" href="http://www.geoportail.fr/">'+
      '<img alt="Mariane" src="'+Geoportal.Util.getImagesLocation()+'marianeHP.gif"/>'+
      '<img alt="Géoportail" src="'+Geoportal.Util.getImagesLocation()+'logo_geoportail.gif"/>'+
    '</a>\n'+
  '</h1>\n'+
'</div>';
        return html;
    },

    /**
     * APIMethod: prolog
     * Build the header of the page or URL to print.
     *      Defaults to a textarea for putting comments in.
     *
     * Returns:
     * {String} HTML code of the prolog.
     */
    prolog: function() {
        var html=
'<div id="pProlog'+this.tick+'">\n'+
  '<form name="pPrologFrm'+this.tick+'" action="javascript:(void)0;">\n'+
    '<div>\n'+
      '<textarea id="pPrologComments'+this.tick+'" name="pPrologComments'+this.tick+'" cols="80" rows="2">'+
OpenLayers.i18n('gpControlPrintMap.comments')+
      '</textarea>\n'+
    '</div>'+
  '</form>\n'+
'</div>';
        return html;
    },

    /**
     * APIMethod: epilog
     * Build the header of the page or URL to print.
     *      Defaults to *""*
     *
     * Returns:
     * {String} HTML code of the epilog.
     */
    epilog: function() {
        var html= '';
        return html;
    },

    /**
     * APIMethod: footer
     * Build the header of the page or URL to print.
     *      Defaults to Geoportal's copyrights.
     *
     * Returns:
     * {String} HTML code of the footer. If not empty, It must at least
     * contain the following code fragment :
     * (code)
     * footer:function() {
     *      var mandatory= '<div id="printAttribution_'+this.tick+'"></div>';
     *      var someHtml= 'something';
     *      var someMoreHtml= 'somethingelse';
     *      var html= someHtml+mandatory+someMoreHtml;
     *     return html;
     * },
     * (end)
     */
    footer: function() {
        var ll= this.map.getCenter().transform(this.map.getProjection(), OpenLayers.Projection.CRS84);
        var N= OpenLayers.i18n('N');
        var S= OpenLayers.i18n('S');
        var E= OpenLayers.i18n('E');
        var W= OpenLayers.i18n('W');
        var lon= Geoportal.Util.degToDMS(ll.lon,[E,W]).replace(/"/g,"&quot;").replace(/ /g,"&nbsp;");
        var lat= Geoportal.Util.degToDMS(ll.lat,[N,S]).replace(/"/g,"&quot;").replace(/ /g,"&nbsp;");
        var scale= this.map.getApproxScaleDenominator();
        var d= new Date();
        var html=
'<div id="pFooter'+this.tick+'">\n'+
  '<div id="pFooterInfo'+this.tick+'">'+
    OpenLayers.i18n('approx.scale')+scale+'<br/>'+
    OpenLayers.i18n('approx.center')+': '+lon+'&nbsp;&nbsp;'+lat+
  '</div>\n'+
  '<div id="printAttribution_'+this.tick+'"></div>\n'+
  '<div id="pFooterDate'+this.tick+'">'+
   OpenLayers.String.sprintf("%4d-%02d-%02d", d.getFullYear(), (d.getMonth()+1), d.getDate())+
  '&nbsp;&nbsp;-&nbsp;&nbsp;'+
  OpenLayers.i18n('gpControlPrintMap.print.forbidden')+
  '</div>\n'+
'</div>';
        return html;
    },

    /**
     * APIMethod: getPageContent
     * Build page content or URL to print.
     *
     * Returns:
     * {Object} with an indicator of page content or URL ('isUrl' field),
     * the HTML code or URL for the page to print ('html' field) and the base URL
     * of the popup window ('base' field).
     */
    getPageContent: function() {
        var doc= OpenLayers.getDoc();
        var base= doc.location.pathname.split('?')[0];
        var parts= base.split('/');
        base= parts.pop();
        base= parts.join('/');
        var baseUrl=
            doc.location.protocol+'//'+
            doc.location.hostname+
            (doc.location.port? ':'+doc.location.port : '')+
            base+'/';
        var foot= this.footer() || '';
        var rf= new RegExp("\\s[iI][dD]\\s*=\\s*['\"]printAttribution_"+this.tick+"['\"]");
        var mf= foot.match(rf);
        if (!mf || mf.length==0) {
            foot= foot +
    '<div id="pFooter'+this.tick+'">\n'+
          '<div id="printAttribution_'+this.tick+'"></div>\n'+
    '</div>\n';
        };
        var page=
'<!DOCTYPE html>\n'+
'<html>\n'+
  '<head>\n'+
    '<title>'+OpenLayers.i18n(this.getTitle())+'</title>\n'+
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>\n'+
    '<base url="'+baseUrl+'"/>\n'+
    this.getStyles()+
    '<style type="text/css">\n'+
    '<!--/*--><![CDATA[/*><!--*/\n'+
      '@media print {body{display:block!important;}}\n'+
      'div#printContainer_'+this.tick+'{width:'+this.size.w+'px;height:'+this.size.h+'px;}\n'+
    '  /*]]>*/-->\n'+
    '</style>\n'+
  '</head>\n'+
  '<body>\n'+
    '<form id="prnt'+this.id+'" name="prnt'+this.id+'"  action="javascript:(void)0" style="width:100px;">\n'+
      '<input type="button" value="'+OpenLayers.i18n(this.getDisplayClass()+'.print')+'" style="width:100%;" />\n'+
    '</form>\n'+
    this.header()+'\n'+
    '<center>\n'+
      this.prolog()+'\n'+
      '<div id="printContainer_'+this.tick+'"></div>\n'+
      this.epilog()+'\n'+
    '</center>\n'+
    foot+'\n'+
    this.getAPIScripts()+
    this.setScripts()+
    '<script type="text/javascript">\n'+
    '<!--//--><![CDATA[//><!--\n'+
      'var printViewer= null, __Geoportal$timer= null, __Geoportal$PrintReady= false;\n'+
      'function printPage() {\n'+
        'if (__Geoportal$timer) { window.clearTimeout(__Geoportal$timer); __Geoportal$timer= null; }\n'+
        'var d= document.getElementById("printContainer_'+this.tick+'");\n'+
        'var a= document.getElementById("printAttribution_'+this.tick+'");\n'+
        'if (typeof(OpenLayers)==="undefined" || '+
             'typeof(Geoportal)==="undefined" || '+
             'typeof(Geoportal.Viewer)==="undefined" || '+
             'typeof(Geoportal.Viewer.Default)==="undefined" || '+
             'printViewer==null || '+
             'd==null || '+
             'a==null || '+
             '__Geoportal$PrintReady!==true) {\n'+
          '__Geoportal$timer= window.setTimeout("printPage()", 500);\n'+
          'return;\n'+
        '}\n'+
        'OpenLayers.IMAGE_RELOAD_ATTEMPTS= 2;\n'+
        'var elm= OpenLayers.Util.getElement("prnt'+this.id+'");\n'+
        'elm.onclick= function() {\n'+
            'elm.style.display="none";\n'+
            'self.print();\n'+
            'elm.style.display="";\n'+
        '};\n'+
        (this.onPrint ||'')+'\n'+
      '}\n'+
      'window.onload= printPage;\n'+
    '  //--><!]]>\n'+
    '</script>\n'+
  '</body>\n'+
'</html>\n';
        return {'isUrl':false, 'html':page, 'base':baseUrl};
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.PrintMap"*
     */
    CLASS_NAME: "Geoportal.Control.PrintMap"
});
