/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Handler.js
 */
/**
 * Class: Geoportal.Handler.Path
 * Handler to draw a path on a map.
 * Path is displayed on mouse down, moves on mouse move, and is finished on
 * mouse up.
 *
 * Inherits from:
 *  - <Geoportal.Handler>
 */
Geoportal.Handler.Path= OpenLayers.Class( Geoportal.Handler, OpenLayers.Handler.Path, {

    /**
     * Constructor: OpenLayers.Handler.Path
     * Create a new path handler.
     *
     * Parameters:
     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} The control that owns this handler
     * callbacks - {Object} An object with a properties whose values are
     *     functions.  Various callbacks described below.
     * options - {Object} An optional object with properties to be set on the
     *           handler
     *
     * Named callbacks:
     * create - Called when a sketch is first created.  Callback called with
     *     the creation point geometry and sketch feature.
     * modify - Called with each move of a vertex with the vertex (point)
     *     geometry and the sketch feature.
     * point - Called as each point is added.  Receives the new point
     * geometry.
     * done - Called when the point drawing is finished.  The callback will
     *     recieve a single argument, the linestring geometry.
     * cancel - Called when the handler is deactivated while drawing.  The
     *     cancel callback will receive a geometry.
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Path.prototype.initialize.apply(this,arguments);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Handler.Path"*
     */
    CLASS_NAME:"Geoportal.Handler.Path"
});
