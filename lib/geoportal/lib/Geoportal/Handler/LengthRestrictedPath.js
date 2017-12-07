/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Handler/Path.js
 */
/**
 * Class: Geoportal.Handler.LengthRestrictedPath
 * Handler to draw a path with a maximum number of points on a map.
 * Path is displayed on mouse down, moves on mouse move, and is finished on
 * mouse up.
 *
 * Inherits from:
 *  - <Geoportal.Handler.Path>
 */
Geoportal.Handler.LengthRestrictedPath= OpenLayers.Class( Geoportal.Handler.Path, {

    /**
     * APIProperty: maxVertices
     * {Number} The maximum number of vertices which can be drawn by this
     * handler. When the number of vertices reaches maxVertices, the
     * geometry is automatically finalized. This property doesn't
     * apply if freehand is set. Default is *2*.
     */
    maxVertices: 2,

    /**
     * Property: freehand
     * {Boolean} In freehand mode, the handler starts the path on mouse down,
     * adds a point for every mouse move, and finishes the path on mouse up.
     * Outside of freehand mode, a point is added to the path on every mouse
     * click and double-click finishes the path. Default is *false*.
     */
    freehand: false,

    /**
     * Property: freehandToggle
     * {String} If set, freehandToggle is checked on mouse events and will set
     * the freehand mode to the opposite of this.freehand.  To disallow
     * toggling between freehand and non-freehand mode, set freehandToggle to
     * null.  Acceptable toggle values are 'shiftKey', 'ctrlKey', and
     * 'altKey'. Default is *null*.
     */
    freehandToggle: null,

//    /**
//     * APIProperty: maxPoints
//     * {Integer} maximum of points of the path.
//     *      Defaults to *2*
//     */
//    maxPoints: 2,
//
//    /**
//     * Constructor: OpenLayers.Handler.LengthRestrictedPath
//     * Create a new path handler.
//     *
//     * Parameters:
//     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} The control that owns this handler
//     * callbacks - {Object} An object with a properties whose values are
//     *     functions.  Various callbacks described below.
//     * options - {Object} An optional object with properties to be set on the
//     *           handler
//     *
//     * Named callbacks:
//     * create - Called when a sketch is first created.  Callback called with
//     *     the creation point geometry and sketch feature.
//     * modify - Called with each move of a vertex with the vertex (point)
//     *     geometry and the sketch feature.
//     * point - Called as each point is added.  Receives the new point
//     * geometry.
//     * done - Called when the point drawing is finished.  The callback will
//     *     recieve a single argument, the linestring geometry.
//     * cancel - Called when the handler is deactivated while drawing.  The
//     *     cancel callback will receive a geometry.
//     */
//    initialize: function(control, callbacks, options) {
//        Geoportal.Handler.Path.prototype.initialize.apply(this,arguments);
//        this.freehand= false;//force
//        this.freehandToggle= null;//prevent toggle to freehand !
//    },
//
//    /**
//     * Method: addPoint
//     * Add point to geometry.  Send the point index to override
//     * the behavior of LinearRing that disregards adding duplicate points.
//     *
//     * Parameters:
//     * pixel - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The pixel location for the new point.
//     */
//    addPoint: function(pixel) {
//        if (this.line.geometry.components.length<this.maxPoints) {
//            Geoportal.Handler.Path.prototype.addPoint.apply(this,arguments);
//        }
//    },
//
//    /**
//     * Method: dblclick
//     * Handle double-clicks.  Finish the geometry and send it back
//     * to the control.
//     *
//     * Parameters:
//     * evt - {Event} The browser event
//     *
//     * Returns:
//     * {Boolean} Allow event propagation
//     */
//    dblclick: function(evt) {
//        this.removePoint();
//        this.finalize();
//        return false;
//    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Handler.LengthRestrictedPath"*
     */
    CLASS_NAME:"Geoportal.Handler.LengthRestrictedPath"
});
