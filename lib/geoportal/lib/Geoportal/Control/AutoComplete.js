/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.AutoComplete
 * Provides suggestions while the user type into an input text field.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.AutoComplete= OpenLayers.Class( Geoportal.Control, {

    /**
     * Property: textinput
     * {String} The last input text value
     */
    textinput: '',

    /**
     * Property: inputText
     * {DOMElement} The input text field
     */
    inputText: null,

    /**
     * Property: autoCompleteQueryDelay
     * {Integer} The delay (in ms) before sending new autocomplete queries
     */
    autoCompleteQueryDelay: 200,

    /**
     * Property: maximumResponses
     * {Integer} The maximum number of responses for each autocomplete query.
     * Defaults to *5*
     */
    maximumResponses: 5,

    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map. Default is
     *     true.
     */
    autoActivate: true,


    /**
     * APIProperty: url
     * {String} URL resource that will return autocomplete results.
     */
    url: null,

    /**
     * APIProperty: type
     * {String} Type of autocomplete ('PositionOfInterest' or 'StreetAddress' values).
     */
    type: null,

    /**
     * Property: oldKbdfsActive
     * {Boolean} indicates il Keybords Navigation is active before deactivation
     *           in order to know if we need to reactivate it.
     */
    oldKbdfsActive: false,

    /**
     * Constructor: Geoportal.Control.Autocomplete
     * Build a control for autocompleting an input text field.
     *
     * Parameters:
     * inputText - {<DOMElement>} the input text field.
     * options - {Object} optional options to build this control.
     */
    initialize: function(inputText,options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.inputText= inputText;
        this.observeInputText();
    },

    /**
     * Method: draw
     * Create handler.
     */
    draw: function() {
        this.handler= new OpenLayers.Handler.Keyboard( this, { 
                                "keydown": this.defaultKeyPress });
        this.createAutoCompleteList();
    },

    /**
     * Method: defaultKeyPress
     * When handling the key event, we only use evt.keyCode. This holds 
     * some drawbacks, though we get around them below. When interpretting
     * the keycodes below (including the comments associated with them),
     * consult the URL below. For instance, the Safari browser returns
     * "IE keycodes", and so is supported by any keycode labeled "IE".
     * 
     * Very informative URL:
     *    http://unixpapa.com/js/key.html
     *
     * Parameters:
     * code - {Integer} 
     */
    defaultKeyPress: function (evt) {
        // on desactive la navigation au clavier sur la carte lorque
        // la liste déroulante est visible.
        if (this.completeList && this.completeList.style["visibility"]!="hidden") {
            var kbdfs= this.map.getControlsByClass("OpenLayers.Control.KeyboardDefaults") ;
            if (kbdfs && kbdfs.length>0) {
                this.oldKbdfsActive= kbdfs[0].active? true : false ;
                kbdfs[0].deactivate();
            }
        }
        switch (evt.keyCode) {
            case OpenLayers.Event.KEY_UP:
                this.highlightIndex--;
                this.highlightProposal(true);
                break;
            case OpenLayers.Event.KEY_DOWN:
                this.highlightIndex++;
                this.highlightProposal(true);
                break;
            // si on appuie sur RETURN, on choisit la suggestion proposée,
            // sinon, on cache la fenêtre de suggestions.
            case OpenLayers.Event.KEY_RETURN:
                if (this.highlightIndex >0) {
                    this.selectProposal(this.highlightIndex) ;
                } else {
                    this.hideAutoCompleteList() 
                }
                break ;
        }
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        this.deactivate();
        window.clearTimeout(this.inputObserver);
        this.inputObserver= null;
        while (this.completeList.childNodes.length>0) {
            OpenLayers.Event.stopObservingElement(this.completeList.childNodes[0]);
            this.completeList.removeChild(this.completeList.childNodes[0]);
        }
        if (this.completeList && this.completeList.parentNode) {
            this.completeList.parentNode.removeChild(this.completeList);
        }
        Geoportal.Control.prototype.destroy.apply(this,arguments);
    },

    /**
     * Method: observeInputText
     * Observe the changes of the input text for autocomplete.
     */
    observeInputText: function() {
        if (this.inputText.value != this.textinput) {
            this.textinput= this.inputText.value;
            this.callAutoComplete(this.textinput);
        }
        this.inputObserver= window.setTimeout(OpenLayers.Function.bind(this.observeInputText, this), this.autoCompleteQueryDelay);
    },

    /**
     * Method: callAutoComplete
     * Call (with a Get JSON-P request) the autocomplete service to get geocoded proposals.
     *
     * Parameters:
     * text - {String} the input text
     */
    callAutoComplete: function(text){
        if (text.length>0) {
            var s= new OpenLayers.Protocol.Script({
                url: this.url,
                params: {
                    text : text,
                    type : this.type,
                    maximumResponses : this.maximumResponses
                },
                callback: OpenLayers.Function.bind(this.showResults,this),
                handleResponse: function(response, options) {
                    this.destroyRequest(response.priv);
                    options.callback.call(options.scope, response);
                }
            });
            s.read();
        }else{
            this.hideAutoCompleteList();
        }
    },

    /**
     * Method: showResults
     * Display the proposals in the autocomplete list div.
     * 
     * Parameters:
     * response - {Object} Hold information about the autocomplete response :
     *      * status : the status of the response;
     *      * results : the results objects with 'fulltext' property
     */
    showResults: function(response){
        this.results= response.data.results;
        if (this.results && !(this.results instanceof Array)) {
            this.results= [this.results];
        }
        this.highlightIndex= 0;
        if (!this.results || this.results.length==0) {
            this.hideAutoCompleteList();
            return;
        } else {
            this.showAutoCompleteList();
        }
        while (this.completeList.childNodes.length>0) {
            OpenLayers.Event.stopObservingElement(this.completeList.childNodes[0]);
            this.completeList.removeChild(this.completeList.childNodes[0]);
        }
        var maxResults= (this.results.length>this.maximumResponses) ? this.maximumResponses : this.results.length;
        for (var f=0; f<maxResults; ++f) {
            var div= document.createElement("div");
            var span= document.createElement("span");
            span.innerHTML= this.results[f].fulltext;
            div.appendChild(span);
            OpenLayers.Event.observe(
                    div,
                    'click',
                    OpenLayers.Function.bind(this.selectProposal, this,f)
                );
            OpenLayers.Event.observe(
                    div,
                    'mouseover',
                    OpenLayers.Function.bind(this.highlightOver, this,f)
                );
            this.completeList.appendChild(div);
        }
    },

    /**
     * Method: highlightOver
     * Highlight the proposal in the autocomplete list. Called on mouseover in the autocomplete list.
     * 
     * Parameters:
     * index - {Integer} the index of the proposal in the autocomplete list
     */
    highlightOver: function(index){
        this.highlightIndex= index+1;
        this.highlightProposal(true);
    },

    /**
     * Method: selectProposal
     * Select the proposal in the autocomplete list. Called on click in the autocomplete list.
     * 
     * Parameters:
     * index - {Integer} the index of the proposal in the autocomplete list
     */
    selectProposal:function(index){
        this.highlightIndex= index+1;
        this.highlightProposal(true);
        this.hideAutoCompleteList();
        while (this.completeList.childNodes.length>0) {
            OpenLayers.Event.stopObservingElement(this.completeList.childNodes[0]);
            this.completeList.removeChild(this.completeList.childNodes[0]);
        }
        this.onResultClick();
    },

    /**
     * Method: onResultClick
     * Callback function called when a proposal is selected in the autocomplete list.
     * Could be overwritten by sub-classes.
     */
    onResultClick: function() {
    },

    /**
     * Method: setCompleteDivSize
     * Set the size and position of the autocomplete list div.
     */
    updateAutoCompleteListPosition: function(){
        if (this.completeList) {
            var inputPosition= OpenLayers.Util.pagePosition(this.inputText);
            this.completeList.style.left= inputPosition[0]+"px";
            this.completeList.style.top= inputPosition[1]+this.inputText.offsetHeight+"px";
            this.completeList.style.width= this.inputText.offsetWidth+"px";
        }
    },

    /**
     * Method: hideCompleteDiv
     * Hide the autocomplete list div.
     */
    hideAutoCompleteList: function(){
        // on reactive la navigation clavier de la carte si elle était 
        // présente et active.
        if (this.oldKbdfsActive) {
            var kbdfs= this.map.getControlsByClass("OpenLayers.Control.KeyboardDefaults") ;
            if (kbdfs && kbdfs.length>0) kbdfs[0].activate() ;
            this.oldKbdfsActive= true ;
        }
        if (this.completeList) {
            this.completeList.style.visibility= "hidden";
        }
    },

    /**
     * Method: showCompleteDiv
     * Show the autocomplete list div.
     */
    showAutoCompleteList: function(){
        this.completeList.style.visibility= "visible";
    },

    /**
     * Method: createAutocompleteList
     * Create the list that will contains the autocomplete proposals.
     */
    createAutoCompleteList: function(){
        this.completeList= document.createElement("div");
        this.completeList.className= "gpGeocodeAutoCompleteList";
        this.completeList.id= "completeList";
        this.updateAutoCompleteListPosition();
        this.hideAutoCompleteList();
        document.body.appendChild(this.completeList);
    },

    /**
     * Method: highlightProposal
     * Highlight the current proposal (on mouseover or key up/down) in the autocomplete list.
     * 
     * Parameters:
     * changeTextInput - {Boolean} true value to modify the text input with the highlighted value (key up/down),
     * false to just highlight the proposal (mouseover)
     */
    highlightProposal:function(changeTextInput){
        var nbAutoCompleteResults= this.completeList.childNodes.length;
        if (nbAutoCompleteResults==0) {
            return;
        }
        if (this.highlightIndex>nbAutoCompleteResults) {
            this.highlightIndex= nbAutoCompleteResults;
        }
        if (this.highlightIndex<1) {
            this.highlightIndex= 1;
        }
        for (var i=0; i<nbAutoCompleteResults; i++) {
            this.completeList.childNodes[i].className= "gpGeocodeAutoCompleteProposal";
        }
        this.completeList.childNodes[this.highlightIndex-1].className= "gpGeocodeAutoCompleteProposalHighlighted";
        if (changeTextInput && this.results && this.results.length) {
            this.textinput= this.results[this.highlightIndex-1].fulltext;
            this.inputText.value= this.textinput;
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.AutoComplete"*
     */
    CLASS_NAME:"Geoportal.Control.AutoComplete"

});

/**
 * Constant: Geoportal.Control.AutoComplete.SERVICE_ID
 * {String} Id of the autocompletion service returned by the autoconfiguration.
 */
Geoportal.Control.AutoComplete.SERVICE_ID= "OPENLS;AutoCompletion";//"GPP:AutoCompletion";
