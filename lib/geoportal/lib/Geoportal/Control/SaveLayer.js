/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Form.js
 */
/**
 * Class: Geoportal.Control.SaveLayer
 * Implements a button control for saving the layer. Designed
 * to be used with a <Geoportal.Control.Panel>.
 *
 * The control is displayed through <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> by using the
 * displayClass of the control : gpControlSaveLayer. Two effective styles are
 * connected with this : gpControlSaveLayerItemActive and
 * gpControlSaveLayerItemInactive.
 *
 * Inherits from:
 *  - <Geoportal.Control.Form>
 */
Geoportal.Control.SaveLayer= OpenLayers.Class(Geoportal.Control.Form, {

    /**
     * Property: type
     * {String} The type of <Geoportal.Control.SaveLayer>
     *     Defaults to *OpenLayers.Control.TYPE_TOGGLE*
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} the controlled layer
     */
    layer: null,

    /**
     * Property: supportedFormats
     * {Object} Hash of supported formats supported by the control.
     *      Each format has the following properties :
     *      * mime (mandatory) ;
     *      * featureNS (optional) ;
     *      * creator (optional).
     */
    supportedFormats: null,

    /**
     * Property: supportedProjections
     * {Object} Hash of supported projections supported by the control.
     *      Each format has the following properties :
     *      * Array({String}) : array of projections.
     */
     supportedProjections: null,

    /**
     * APIProperty: url
     * {String} the url where to send the serialized layer.
     *      This url should support POST method for the moment.
     */
    url: null,

    /**
     * Constructor: Geoportal.Control.SaveLayer
     * Build a save button.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} layer to save.
     * options - {Object} any options usefull for control.
     *      Amongst these options one can have :
     *      * url - {String} the service's URL to send the data to;
     *      * supportedFormats - {Object} description of output formats. Each
     *      format is an object holding formatClass and options used in
     *      various {<OpenLayers.Format at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format-js.html>} classes;
     *      * supportedProjections - {Object} for each output format an array
     *      of {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} is given.
     *
     * this code snippet shows default options used by the constructor when
     * the options parameters is not given :
     *
     * (code)
     * var slc= new Geoportal.Control.SaveLayer(vectorLayer, {
     *      url:baseUrlOftheCurrentPage,
     *      supportedFormats:{
     *          gml: {
     *              formatClass: OpenLayers.Format.GML,
     *              options:{
     *                  featureNS:'http://interop.ign.fr/exchange',
     *                  mime: 'application/vnd.ogc.gml'
     *              }
     *          },
     *          kml: {
     *              formatClass: OpenLayers.Format.KML,
     *              options:{
     *                  mime: 'application/vnd.google-earth.kml'
     *              }
     *          },
     *          gpx: {
     *              formatClass: Geoportal.Format.GPX,
     *              options:{
     *                  creator: 'IGN',
     *                  mime: 'text/xml'
     *              }
     *          },
     *          osm: {
     *              formatClass: OpenLayers.Format.OSM,
     *              options:{
     *                  mime: 'text/xml'
     *              }
     *          },
     *          gxt: {
     *              formatClass: Geoportal.Format.Geoconcept,
     *              options:{
     *                  mime: 'text/plain'
     *              }
     *          },
     *          geoRSS: {
     *              formatClass: OpenLayers.Format.GeoRSS,
     *              options:{
     *                  mime: 'text/xml'
     *              }
     *          }
     *      },
     *      supportedProjections:{
     *          gml:[
     *              'CRS:84',
     *              'EPSG:2154',
     *              'EPSG:27582',
     *              'EPSG:4171'
     *          ],
     *          kml:[
     *              'CRS:84'
     *          ],
     *          gpx:[
     *              'CRS:84'
     *          ],
     *          osm:[
     *              'CRS:84'
     *          ],
     *          gxt:[
     *              'CRS:84',
     *              'EPSG:2154',
     *              'EPSG:27582',
     *              'EPSG:4171'
     *          ],
     *          geoRSS:[
     *              'CRS:84'
     *          ]
     *      }
     * });
     * (end)
     */
    initialize: function(layer, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        // formats :
        if (!this.supportedFormats) {
            this.supportedFormats= {
                gml: {
                    formatClass: OpenLayers.Format.GML,
                    options:{
                        featureNS:'http://interop.ign.fr/exchange',
                        mime: 'application/vnd.ogc.gml'
                    }
                },
                kml: {
                    formatClass: OpenLayers.Format.KML,
                    options:{
                        mime: 'application/vnd.google-earth.kml'
                    }
                },
                gpx: {
                    formatClass: Geoportal.Format.GPX,
                    options:{
                        creator: 'IGN',
                        mime: 'text/xml'
                    }
                },
                osm: {
                    formatClass: OpenLayers.Format.OSM,
                    options:{
                        mime: 'text/xml'
                    }
                },
                gxt: {
                    formatClass: Geoportal.Format.Geoconcept,
                    options:{
                        mime: 'text/plain'
                    }
                },
                geoRSS: {
                    formatClass: OpenLayers.Format.GeoRSS,
                    options:{
                        mime: 'text/xml'
                    }
                }
            };
        }
        // projections :
        if (!this.supportedProjections) {
            this.supportedProjections= {
                gml:[
                    'CRS:84',
                    'EPSG:2154',
                    'EPSG:27582',
                    'EPSG:4171'
                ],
                kml:[
                    'CRS:84'
                ],
                gpx:[
                    'CRS:84'
                ],
                osm:[
                    'CRS:84'
                ],
                gxt:[
                    'CRS:84',
                    'EPSG:2154',
                    'EPSG:27582',
                    'EPSG:4171'
                ],
                geoRSS:[
                    'CRS:84'
                ]
            };
        }
        if (!this.url) {
            var doc= OpenLayers.getDoc();
            var base= doc.location.pathname.split('?')[0];
            var parts= base.split('/');
            base= parts.pop();
            base= parts.join('/');
            this.url=
                doc.location.protocol+'//'+
                doc.location.hostname+
                (doc.location.port? ':'+doc.location.port : '')+
                base+'/';
        }
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function () {
        this.layer= null;
        this.supportedFormats= null;
        this.supportedProjections= null;
        Geoportal.Control.Form.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: activate
     * Do the saving via a form.
     *      The form is as follows :
     *
     * (start code)
     * <form id='__savelayer__{#Id}' name='__savelayer__{#Id}' action='@apiUrl@/api/save'>
     * </form>
     * (end)
     *
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        if (!this.layer || this.layer.features.length==0) {
            OpenLayers.Console.userError(OpenLayers.i18n(this.getDisplayClass()+".noData"));
            return false;
        }
        if (!Geoportal.Control.Form.prototype.activate.apply(this,arguments)) {
            return false;
        }
        var f= document.createElement('form');
        f.id= '__savelayer__' + this.id;
        f.name= f.id;
        f.action= this.url;
        //TODO: properties ?
        f.method= 'post';
        f.enctype= 'application/x-www-form-urlencoded';
        f.target= '_blank';
        this.savelayer(f);
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
     * Method: savelayer
     * Build the form and save the specified layer.
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id='lblformat{#Id}' for='format{#Id}'>{#displayClass}.format</label>
     * <select id='format{#Id}' name='format{#Id}'>
     *      <option value='{#fld.options[].value}' selected='{#fld.options[].selected}'>{#fld.options[].text}</option>
     * </select>
     * <br/>
     * <span id='helpformat{#Id}' class='gpFormSmall'>{#displayClass}.format.help</span>
     * <br/>
     * <label id='lblproj{#Id}' for='proj{#Id}'>{#displayClass}.proj</label>
     * <select id='proj{#Id}' name='proj{#Id}'>
     *      <option value='{#fld.options[].value}' selected='{#fld.options[].selected}'>{#fld.options[].text}</option>
     * </select>
     * <br/>
     * <span id='helpproj{#Id}' class='gpFormSmall'>{#displayClass}.proj.help</span>
     * <br/>
     * <label id='lblpretty{#Id}' for='pretty{#Id}'>{#displayClass}.pretty</label>
     * <input id='pretty{#Id}' name='pretty{#Id}' type='checkbox' value='pretty{#Id}'
     *        disabled='{#fld.disabled}' checked='{#fld.checked}' defaultChecked='{#fld.checked}'
     *        style='autocomplete:off;' />
     * <br/>
     * <span id='helppretty{#Id}' class='gpFormSmall'>{#displayClass}.pretty.help</span>
     * <br/>
     * <input id='CT{#Id}' name='CT' type='text' value='' hidden='true' disabled='false'/>
     * <input id='FN{#Id}' name='FN' type='text' value='' hidden='true' disabled='false'/>
     * <input id='DT{#Id}' name='DT' type='text' value='' hidden='true' disabled='false'/>
     * <input class='{#displayClass}Button' type='button' id='cancel{#Id}' name='cancel{#Id}'
     *      value='{#displayClass}.button.cancel'/>
     * <input class='{#displayClass}Button' type='button' id='add{#Id}' name='add{#Id}'
     *      value='{#displayClass}.button.save'/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    savelayer: function(form) {
        var opts= [];
        for (var f in this.supportedFormats) {
            if (this.supportedFormats.hasOwnProperty(f)) {
                var o= {
                    value: f,
                    selected: (f=='gml'),
                    text: this.getDisplayClass()+'.'+f
                };
                opts.push(o);
            }
        }
        this.buildSelectField(form,{
            id:'format',
            mandatory:true,
            options:opts,
            callbacks:[
                {evt:'click',func:this.onClick},
                {evt:'change',func:this.onChange}
            ]});
        var opt2s= [];
        for (var p= 0, lp= this.supportedProjections['gml'].length; p<lp; p++) {
            var pn= this.supportedProjections['gml'][p];
            var o= {
                value: pn,
                selected: (pn=='CRS:84'),
                text: pn
            };
            opt2s.push(o);
        }
        this.buildSelectField(form,{
            id:'proj',
            options:opt2s,
            callbacks:[
                {evt:'click',func:this.onClick}
            ]});
        this.buildCheckboxField(form,{
            id:'pretty'
            });
        this.buildInputTextField(form,{
            id:'CT',
            name:'CT',
            size:-1,
            length:-1,
            hidden:true
            });
        this.buildInputTextField(form,{
            id:'FN',
            name:'FN',
            size:-1,
            length:-1,
            hidden:true
            });
        this.buildInputTextField(form,{
            id:'DT',
            name:'DT',
            size:-1,
            length:-1,
            hidden:true
            });
        this.buildButton(form,'cancel',this.closeForm);
        this.buildButton(form,'save',this.onClick,13);//RETURN keycode==13
    },

    /**
     * Method: onClick
     * Save button has been hit, process the layer saving.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onClick: function(element,evt) {
        OpenLayers.Event.stop(evt? evt : window.event);
        var es= ['format', 'proj', 'pretty'];
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
        if (element.id.match(/^save/)) {
            element= OpenLayers.Util.getElement('format' + this.id);
            var fmt= OpenLayers.String.trim(element.options[element.selectedIndex].value);
            element.options[0].selected= true;
            if (fmt=='') { return false; }
            element= OpenLayers.Util.getElement('proj' + this.id);
            var prj= OpenLayers.String.trim(element.options[element.selectedIndex].value);
            element.options[0].selected= true;
            element= OpenLayers.Util.getElement('pretty' + this.id);
            var prt= element.checked;
            element.checked= false;
            var opts= OpenLayers.Util.extend({},this.supportedFormats[fmt].options);
            OpenLayers.Util.applyDefaults(opts,{
                internalProjection: this.map.getProjection().clone(),
                externalProjection: new OpenLayers.Projection(prj)
            });
            var fw= new this.supportedFormats[fmt].formatClass(opts);
            var str= fw.write(this.layer.features, prt);
            str= this.showPretty(str, fmt, prt);
            if (fmt instanceof OpenLayers.Format.XML) {
                str= '<?xml version="1.0" encoding="UTF-8"?>' + (prt?  '\n':'') + str;
            }
            element= OpenLayers.Util.getElement('CT' + this.id);
            element.value= this.supportedFormats[fmt].mime;
            element= OpenLayers.Util.getElement('FN' + this.id);
            element.value= this.layer.name+'.'+fmt;
            element= OpenLayers.Util.getElement('DT' + this.id);
            element.value= str;
            element= OpenLayers.Util.getElement('__savelayer__' + this.id);
            element.submit();
        }
        this.closeForm();
        return false;
    },

    /**
     * Method: onChange
     * Format selector has been changes, process projections.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onChange: function(element,evt) {
        var eid= element.id;
        eid= eid.replace(/^format/,'proj');
        var e= OpenLayers.Util.getElement(eid);
        if (e) {
            var fmt= element.options[element.selectedIndex].value;
            for (var i= e.options.length-1; i>=0; i--) {
                this.labels[e.options[i].value]= null;
                e.remove(i);
            }
            for (var p= 0, lp= this.supportedProjections[fmt].length; p<lp; p++) {
                var pn= this.supportedProjections[fmt][p];
                var o= document.createElement('option');
                o.value= pn;
                o.selected= (pn=='CRS:84');
                o.appendChild(document.createTextNode(OpenLayers.i18n(pn)));
                this.labels[p]= o;
                e.appendChild(o);
            }
        }
    },

    /**
     * Method: showPretty
     * Print with nice formatting.
     *
     * Parameters:
     * str - {String} the string to format.
     * type - {String} the data type (gml, kml, gpx, wfs)
     * pretty - {Boolean} pretty formatting indicator.
     */
    showPretty: function(str, type, pretty) {
        if (pretty) if (type=='gml' || type=='kml' || type=='gpx' || type=='osm' || type=='wfs') {
            //KML: coordinates are , separated preventing Google Earth to load
            //KML-> suppressed !
            //str= str.replace(/,/g, ', ');
            var A= str.split ("<");
            var n= 0;
            var tab;
            str= "";
            for (var i= 0, iA= A.length; i<iA; i++) {
                if (A[i]!="") {
                    if (A[i].charAt(0)=='/' || A[i].charAt(A[i].length-2)=='/') {
                        n--;
                    }
                    tab= "";
                    for (var j= 0; j<n; j++) {
                        tab+= "  ";
                    }
                    if (A[i].charAt(0)!='/' && A[i].charAt(A[i].length-2)!='/') {
                        n++;
                        if (A[i].charAt(A[i].length-1)!='>') {
                            A[i] = A[i].replace(/>/,">\n  "+tab);
                        }
                    }
                    str+= tab + "<" + A[i] + "\n";
                }
            }
        }
        return str;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.SaveLayer"*
     */
    CLASS_NAME: "Geoportal.Control.SaveLayer"
});
