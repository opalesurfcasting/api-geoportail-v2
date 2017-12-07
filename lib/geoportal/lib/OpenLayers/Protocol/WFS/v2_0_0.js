/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires OpenLayers/Protocol/WFS/v2.js
 */
/**
 * Class: OpenLayers.Protocol.WFS.v2_0_0
 * A WFS v2.0.0 protocol for vector layers.  Create a new instance with the
 *     <OpenLayers.Protocol.WFS.v2_0_0> constructor.
 *
 * Differences from the v1.1.0 protocol:
 *  - uses Filter Encoding 2.0.0 instead of 1.1.0
 *  - uses GML 3.2.1 instead of 3.1.1 if no format is provided
 *  
 * Inherits from:
 *  - <OpenLayers.Protocol.WFS.v2>
 */
OpenLayers.Protocol.WFS.v2_0_0 = OpenLayers.Class(OpenLayers.Protocol.WFS.v2, {

    /**
     * Property: version
     * {String} WFS version number.
     */
    version: "2.0.0",

    /**
     * Constant: OpenLayers.Protocol.WFS.v2_0_0
     * {String} *"OpenLayers.Protocol.WFS.v2_0_0"*
     */
    CLASS_NAME: "OpenLayers.Protocol.WFS.v2_0_0"
});
