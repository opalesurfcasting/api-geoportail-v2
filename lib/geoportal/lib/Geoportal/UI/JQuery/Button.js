/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/UI/JQuery.js
 */
/**
 * Class: Geoportal.UI.JQuery.Button
 * Class for rendering {<Geoportal.Control.Button>} components with JQuery.
 */
if (OpenLayers.Control.Button) {

Geoportal.UI.JQuery.Button = OpenLayers.Class(OpenLayers.UI.JQuery.Button, Geoportal.UI.JQuery, {
    /**
     * Constant: Geoportal.UI.JQuery.Button.CLASS_NAME
     *  Defaults to *Geoportal.UI.JQuery.Button*
     */
    CLASS_NAME: "Geoportal.UI.JQuery.Button"
});

}
