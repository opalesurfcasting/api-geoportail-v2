/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/UI.js
 */
/**
 * Class: Geoportal.UI.Button
 * Class for rendering {<Geoportal.Control.Button>} components.
 */
if (OpenLayers.Control.Button) {

Geoportal.UI.Button = OpenLayers.Class(OpenLayers.UI.Button, Geoportal.UI, {
    /**
     * Constant: Geoportal.UI.Button.CLASS_NAME
     *  Defaults to *Geoportal.UI.Button*
     */
    CLASS_NAME: "Geoportal.UI.Button"
});

}
