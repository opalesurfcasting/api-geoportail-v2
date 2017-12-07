/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Class: Geoportal.UI
 * Base class for rendering Geoportal' components.
 *
 * Inherits from:
 * - <OpenLayers.UI at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/UI-js.html>
 */
Geoportal.UI= OpenLayers.Class(OpenLayers.UI, {

    /**
     * APIMethod: setComponent
     * Assign the rendered component to the user interface.
     *
     * Parameters:
     * cntrl - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    setComponent: function(cntrl) {
        this.component= cntrl;
        if (!this.displayClass) {
            this.displayClass =
                cntrl.CLASS_NAME.replace("Geoportal.", "gp").replace(/\./g, "");
        }
    },

    /**
     * Constant: Geoportal.UI.CLASS_NAME
     *  Defaults to *Geoportal.UI*
     */
    CLASS_NAME: "Geoportal.UI"
});
