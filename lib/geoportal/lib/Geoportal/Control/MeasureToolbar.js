/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Panel.js
 * @requires Geoportal/Control/Measure.js
 * @requires Geoportal/Control/Measure/Azimuth.js
 * @requires Geoportal/Control/Measure/ElevationComponent.js
 */

/**
 * Class: Geoportal.Control.MeasureToolbar
 *
 * Inherits from:
 *  - <Geoportal.Control.Panel>
 */
Geoportal.Control.MeasureToolbar = OpenLayers.Class(Geoportal.Control.Panel, {

    /**
     * APIProperty: targetElement
     * {DOMElement} the element that will receive measurements.
     *      When null, measures are send to the Console for partial
     *      measurements, to an alert window otherwise.
     */
    targetElement: null,

    /**
     * Constructor: Geoportal.Control.MeasureToolbar
     * Add two tools for measuring length and areas.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     *     If options.pathOptions exists it is handed over to
     *     <OpenLayers.Control.Measure at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Measure-js.html>.
     *     If options.polygonOptions exists it is handed over to
     *     <OpenLayers.Control.Measure at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Measure-js.html>. 
     *     If options.azimuthOptions exists it is handed over to
     *     <Geoportal.Control.Measure.Azimuth>.
     *     If options.elevationOptions exists it is handed over to
     *     <Geoportal.Control.Measure.Elevation>.
     *     If options.elevationPathOptions exists it is handed over to
     *     <Geoportal.Control.Measure.ElevationPath>.
     */
    initialize: function(options) {
        if (!options) { options= {}; }
        Geoportal.Control.Panel.prototype.initialize.apply(this, [options]);
        var style= (options.style || Geoportal.Control.MeasureToolbar.DEFAULTSTYLE).clone();
        this.lastMeasurement= null;
        
        var controls = [];

        // always by default
        controls.push(

            new OpenLayers.Control.Measure(
                OpenLayers.Handler.Path,
                OpenLayers.Util.extend({
                    geodesic:true,
                    handlerOptions:{
                        style: "default", //this forces default render intent
                        layerOptions: {
                            styleMap: new OpenLayers.StyleMap({"default":style.clone()})
                        },
                        persist: true
                    },
                    type: OpenLayers.Control.TYPE_TOGGLE,
                    title: 'olControlMeasurePath.title',
                    displayClass: 'olControlMeasurePath',
                    targetElement: this.targetElement
                },
                options.pathOptions)
            )
        );

        // always by default
        controls.push(
                
             new OpenLayers.Control.Measure(
                OpenLayers.Handler.Polygon,
                OpenLayers.Util.extend({
                    geodesic:true,
                    handlerOptions:{
                        style: "default",
                        layerOptions: {
                            styleMap: new OpenLayers.StyleMap({"default":style.clone()})
                        },
                        persist: true
                    },
                    type: OpenLayers.Control.TYPE_TOGGLE,
                    title: 'olControlMeasurePolygon.title',
                    displayClass: 'olControlMeasurePolygon',
                    targetElement: this.targetElement
                },
                options.polygonOptions)
            )  
        );

        // always by default
        controls.push(
                
            new Geoportal.Control.Measure.Azimuth(
                Geoportal.Handler.LengthRestrictedPath,
                OpenLayers.Util.extend({
                    handlerOptions:{
                        style: "default",
                        layerOptions: {
                            styleMap: new OpenLayers.StyleMap({"default":style.clone()})
                        },
                        persist: true
                    },
                    type: OpenLayers.Control.TYPE_TOGGLE,
                    title: 'gpControlMeasureAzimuth.title',
                    displayClass: 'gpControlMeasureAzimuth'
                },
                options.azimuthOptions)
            )
        );
        
        // optional      
        var hdl_elevations  = new Geoportal.Control.Measure.ElevationComponent(options);
        var ctrl_elevations = hdl_elevations.getControlsElevation();
        for(var index=0; index<ctrl_elevations.length; index++) {
            controls.push(ctrl_elevations[index]);
        }
        
        // add all controls
        this.addControls(controls);

    },

    /**
     * APIMethod: destroy
     * Clean control.
     */
    destroy: function() {
        //this.measurementLabels= null;
        //this.accuracies= null;
        this.lastMeasurement= null;
        Geoportal.Control.Panel.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: activate
     */
    activate: function() {
        if (Geoportal.Control.Panel.prototype.activate.apply(this, arguments)) {
            for (var i= 0, len= this.controls.length; i<len; i++) {
                var cntrl= this.controls[i];
                if (cntrl.events) {
                    cntrl.events.on({
                        "measure": OpenLayers.Function.bind(this.handleMeasurements, this),
                        "measurepartial": OpenLayers.Function.bind(this.handleMeasurements, this)
                    });
                    cntrl.events.register("activate", cntrl, this.onActivate);
                    cntrl.events.register("deactivate", cntrl, this.onDeactivate);
                }
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (Geoportal.Control.Panel.prototype.deactivate.apply(this, arguments)) {
            for (var i= 0, len= this.controls.length; i<len; i++) {
                var cntrl= this.controls[i];
                if (cntrl.events) {
                    cntrl.events.un({
                        "measure": OpenLayers.Function.bind(this.handleMeasurements, this),
                        "measurepartial": OpenLayers.Function.bind(this.handleMeasurements, this)
                    });
                    cntrl.events.unregister("activate", cntrl, this.onActivate);
                    cntrl.events.unregister("deactivate", cntrl, this.onDeactivate);
                }
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: onActivate
     * Explicitly activate a control and it's associated
     * handler if one has been set.  Controls can be
     * deactivated by calling the deactivate() method.
     *
     * Parameters:
     * evt - {Array({Event})} the fired event.
     *      evt.object holds the control which has registered the event (this)
     */
    onActivate: function(evt) {
        if (!this.active) { return; }// 'this' is the 2nd argument of register()
        if (!evt) { return; }
        if (this.map) {
            var mapproj= this.map.getProjection();
            if (this instanceof Geoportal.Control.Measure.Azimuth ||
                mapproj && mapproj.getProjName()=='longlat') {
                this.displaySystem= 'geographic';
            } else {
                var dsu= this.displaySystemUnits['metric'];
                if (dsu) {
                    this.displaySystem= 'metric';
                }
                // else keep as it is ...
            }
            // As per OpenLayers.Handler.Feature, one moves the handler's
            // layer up to force the application of the cursor property in the
            // style ...
            if (this.handler && this.handler.layer) {
                var index= Math.max(this.map.Z_INDEX_BASE['Feature']-1,this.handler.layer.getZIndex()) + 1;
                this.handler.layer.setZIndex(index);
            }
        }
        if (this.targetElement) {
            this.targetElement.style.display= 'block';
            this.targetElement.innerHTML= OpenLayers.i18n('waiting.measurement');
        }
    },

    /**
     * Method: onDeactivate
     * Explicitly deactivate a control and it's associated
     * handler if one has been set.  Controls can be
     * activated by calling the activate() method.
     *
     * Parameters:
     * evt - {Array({Event})} the fired event.
     *      evt.object holds the control which has registered the event (this)
     */
    onDeactivate: function(evt) {
        if (this.active) { return; }// 'this' is the 2nd argument of register()
        if (!evt) { return; }
        // when the control has been deactived the layer attached to the
        // handler is not more set !
        if (this.targetElement) {
            this.targetElement.style.display= 'none';
        }
    },

    /**
     * Method: draw
     * calls the default draw.
     */
    draw: function() {
        return Geoportal.Control.Panel.prototype.draw.apply(this, arguments);
    },

    /**
     * Method: handleMeasurements
     * Display the measure and store the informations on the measure.
     *      The informations on the measure is as follows:
     *      * order;
     *      * measure;
     *      * unit;
     *      * key;
     *      * label;
     *      * targetFormat;
     *      * targetElement;
     *      * accuracy;
     *      * dimension.
     *
     * Parameters:
     * evt - {Event} triggered by OpenLayers.Control.Measure.measure method.
     *      event context is (event.object being the underneath measure control):
     *      * measure : length, area or angle so far measured;
     *      * units : units of measure;
     *      * order : 1 for length, 2 for area, 3 for angle;
     *      * geometry : the path of measurement.
     *      If the evt.object holds a handleMeasurements function, it is then
     *      first called.
     */
    handleMeasurements: function(evt) {
        if (!evt) {
            return;
        }
        if (typeof(evt.object.handleMeasurements)=='function') {
            this.lastMeasurement= evt.object.handleMeasurements(evt);
        } else {
            var tge= (evt.object.targetElement && evt.object.targetElement.style.display!='none'?
                evt.object.targetElement
            :   (this.targetElement && this.targetElement.style.display!='none'?
                    this.targetElement
                :   null));
            var key= (!(0<=evt.order &&
                        evt.order<(evt.object.measurementLabels || Geoportal.Control.MeasureToolbar.LABELS).length) ||
                      (evt.order!=4 && evt.measure===0)?
                'wait'
            :   (tge?
                    'targetElement'
                :   'default'));
            var order= (key=='wait'? 0 : evt.order);
            this.lastMeasurement= {
                'order':order,
                'measure':evt.measure,
                'unit':evt.units,
                'key':key,
                'label': (evt.object.measurementLabels || Geoportal.Control.MeasureToolbar.LABELS)[order],
                'targetFormat':(evt.object.targetFormat || Geoportal.Control.MeasureToolbar.TARGETFORMAT)[key],
                'targetElement':tge,
                'accuracy':(evt.object.accuracies || Geoportal.Control.MeasureToolbar.ACCURACIES)[evt.units] || '',
                'dimension':(order==2? (tge? '<sup>2</sup>':'^2'):'')
            };
        }

        this.printResult(this.lastMeasurement);
    },

    /**
     * Method: printResult
     * Outputs the measurement.
     *
     * Parameters:
     * m - {Array({Object})} the informations about the measurement.
     */
    printResult: function(m) {
        if (!m) {
            m= [{
                'order':0,
                'measure':0,
                'unit':'',
                'key':'wait',
                'label':Geoportal.Control.MeasureToolbar.LABELS[0],
                'targetFormat':Geoportal.Control.MeasureToolbar.TARGETFORMAT['wait'],
                'targetElement':this.targetElement,
                'accuracy':0,
                'dimension':''
            }];
        }
        if (!(OpenLayers.Util.isArray(m))) {
            m= [m];
        }
        for (var i= 0, l= m.length; i<l; i++) {
            var title= (m[i].key==='wait'?
                OpenLayers.i18n('waiting.measurement')
            :   OpenLayers.i18n(m[i].label));
            var msg= (m[i].key==='wait'?
                ''
            :   OpenLayers.String.sprintf(
                    m[i].targetFormat.measure,
                    m[i].accuracy,
                    m[i].measure,
                    OpenLayers.i18n(m[i].unit),
                    m[i].dimension));
            if (m[i].targetElement) {
                if (m[i].targetElement.type=='text') {
                    m[i].targetElement.value= msg || title;
                } else {
                    m[i].targetElement.innerHTML=
                        OpenLayers.String.sprintf(
                            m[i].targetFormat.result,
                            title,
                            msg);
                }
            } else {
                OpenLayers.Console.info(
                    OpenLayers.String.sprintf(
                        m[i].targetFormat.result,
                        title,
                        msg));
            }
        }
    },

    /**
     * APIMethod: changeLang
     * Assign the current language.
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.getTitle()) {
            this.div.title= OpenLayers.i18n(this.getTitle());
        }
        this.printResult(this.lastMeasurement);
        Geoportal.Control.Panel.prototype.changeLang.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.MeasureToolbar"*
     */
    CLASS_NAME: "Geoportal.Control.MeasureToolbar"
});

/**
 * Constant: LABELS
 * {Array({String})} Labels for measurements. They are used as
 * key for i18n purposes.
 *      This array holds 3 positions :
 *      * 0 : 'waiting.measurement' (wait message);
 *      * 1 : 'length.measurement' (mapped with order equals 1);
 *      * 2 : 'area.measurement' (mapped with order equals 2);
 *      * 3 : 'azimuth.measurement' (mapped with order equals 3);
 *      * 4 : 'elevation.measurement' (mapped with order equals 4).
 */
Geoportal.Control.MeasureToolbar.LABELS= [
    'waiting.measurement',
    'length.measurement',
    'area.measurement',
    'azimuth.measurement',
    'elevation.measurement'
];

/**
 * Constant: ACCURACIES
 * {HashTable({Integer})} number of figures to display for measurements
 * based on the units.
 */
Geoportal.Control.MeasureToolbar.ACCURACIES= {
    'dd' :6,
    'rad':8,
    'gon':6,
    'mi' :3,
    'ft' :2,
    'in' :1,
    'km' :3,
    'm'  :0
};

/**
 * Constant: TARGETFORMAT
 * {Object} the way the measurements are rendered.
 *      The measure option gives the format of the measurement, while the
 *      result option gives the final output format (title and
 *      measurement). The title comes from
 *      Geoportal.Control.MeasureToolbar.LABELS.
 *      Defaults to :
 *      'targetElement': { measure: "%.*f %s%s", result: "%s :<br/>%s" },
 *      'wait'         : { measure: "",          result: "%s"          },
 *      'default'      : { measure: "%.*f %s%s", result: "%s : %s"     }
 */
Geoportal.Control.MeasureToolbar.TARGETFORMAT= {
    'targetElement': { measure: "%.*f %s%s", result: "%s :<br/>%s" },
    'wait'         : { measure: "",          result: "%s"          },
    'default'      : { measure: "%.*f %s%s", result: "%s : %s"     }
};

/**
 * Constant: DEFAULTSTYLE
 * {<OpenLayers.Style at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Style-js.html>} default style applied to inner controls.
 */
Geoportal.Control.MeasureToolbar.DEFAULTSTYLE= new OpenLayers.Style(null,{
    rules:[
        new OpenLayers.Rule({
            symbolizer:{
                'Point':{
                    fillColor:'#F1960B',
                    fillOpacity:1,
                    strokeColor:'#F1960B',
                    strokeWidth:0,
                    strokeOpacity:1,
                    pointRadius:10,
                    graphicName:'cross'
                },
                'Line':{
                    fillColor:'#F1960B',
                    strokeColor:'#F1960B',
                    strokeWidth:2,
                    strokeOpacity:1,
                    strokeDashstyle:'dash'
                },
                'Polygon':{
                    fillColor:'#F1960B',
                    fillOpacity:0.25,
                    strokeColor:'#F1960B',
                    strokeWidth:2,
                    strokeOpacity:1,
                    strokeDashstyle:'dash'
                }
            }
        })
    ]});
