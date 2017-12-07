/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 * @requires Geoportal/Viewer/Default.js
 */
/**
 * Class: Geoportal.Control.PrintMapDOM
 * Implements a button control for printing the current map. It has the same
 * ipurpose as the <Geoportal.Control.PrintMap> Control but differs from that 
 * one by the the way it does the job.
 * The print page that results from this control is made by a simple copy of 
 * the DOM of the current map whereas the PrintMap controls acts by creating 
 * a new viewer based on the one of the map. 
 * The PrintMapDOM controls aims at correctig referer transmission issues met
 * on browsers like Chrome. Yet it has to be considered as experimental too
 * because it still meets some issues like copy of Vector Layers that are
 * rendered whth VML engine (used by IE8 and IE9 browsers).
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.PrintMapDOM= OpenLayers.Class(Geoportal.Control, {

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
            this.createMap() ;
        }
    },

    /**
     * Method: createMap
     * Build the print map by fetching layers in the current map.
     */
    createMap: function() {
       var tgtDoc= this.printableDocument.document ;
       var targetDiv= tgtDoc.getElementById('printContainer_'+this.tick);
       targetDiv.innerHTML= "" ;
       var mapDiv= OpenLayers.getDoc().getElementById(this.map.div.id).cloneNode(true) ;
       try {
         var len= mapDiv.childNodes.length ;
         var docFrag= tgtDoc.createDocumentFragment() ;
         while (len--) {
           docFrag.appendChild(mapDiv.childNodes[0]) ;
         }
         targetDiv.appendChild(docFrag) ;
       } catch (err) {
         // IE raises an exception when cross-document node copying...
         // in such case, we do it the old (slower) way
         targetDiv.innerHTML= mapDiv.innerHTML ;
       }
       for (i=0 ; i<this.map.controls.length ; i++) {
         var ctrl= this.printableDocument.document.getElementById(this.map.controls[i].id);
         if (!ctrl || !ctrl.id) continue ;
         // this 2 controls are kept and replaced on the map.
         if (ctrl.id.match(/Geoportal.Control.TermsOfService/g) || 
             ctrl.id.match(/Geoportal.Control.PermanentLogo/g)     )  {
             ctrl.style.bottom= '0px' ;
             continue ;
         }
         // others controls are removed
         ctrl.parentNode.removeChild(ctrl) ;
       }

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
                    if (rule.style && rule.style.cssText) {
                        csses+= rule.selectorText+'{'+rule.style.cssText+'}\n';
                    } else {
                        // just in case...
                        console.log(rule.style) ;
                    }
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
   '<script type="text/javascript">\n'+
   '<!--//--><![CDATA[//><!--\n'+
   'function printPage() {\n'+
   'var elm= document.getElementById("prnt'+this.id+'");\n'+
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
     * {String} *"Geoportal.Control.PrintMapDOM"*
     */
    CLASS_NAME: "Geoportal.Control.PrintMapDOM"
});
