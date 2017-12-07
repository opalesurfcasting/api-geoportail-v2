/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Namespace: Geoportal.Lang
 * The Geoportal framework internationalization namespace.
 * Contains dictionaries in various languages and methods to set and get the current language.
 */
Geoportal.Lang = {

    /**
     * APIMethod: add
     * Add a new message to the API.
     *
     * Parameters:
     * translationsMap - {Object} The translated texts. This object holds the keys,
     *     the codes that follow the IETF recommendations at
     *     http://www.ietf.org/rfc/rfc3066.txt and the texts :
     *     {"key":{"fr":"blabla","en":"blabla",..},"key":{}}
     */
    add: function(translationsMap) {
        for(var key in translationsMap) {
            if(translationsMap.hasOwnProperty(key)) {
                for(var lang in translationsMap[key]) {
                    if(translationsMap[key].hasOwnProperty(lang)) {
                        var dictionary= Geoportal.Lang[lang];
                        // creates new dictionary is needed :
                        if(!dictionary) { dictionary= {}; }
                        // FIXME overwrites existing translation ...
                        dictionary[key]= translationsMap[key][lang];
                    }
                }
            }
        }
    },

    /**
     * APIMethod: translate
     * Looks up a key from a dictionary based on the current language string.
     *     The value of {<getCode>} will be used to determine the appropriate
     *     dictionary.  Dictionaries are stored in {<OpenLayers.Lang at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Lang-js.html>}.
     *
     * Parameters:
     * key - {String} The key for an i18n string value in the dictionary.
     * context - {Object} Optional context to be used with
     *     <OpenLayers.String.format at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/BaseTypes-js.html#OpenLayers.String.format>.
     *
     * Returns:
     * {String} An internationalized string.
     */
    translate: function(key,context) {
        var dictionary = Geoportal.Lang[OpenLayers.Lang.getCode()];
        // FIXME key trimming ?
        // key= OpenLayers.String.trim(key);
        var message = dictionary[key];
        if(!message) {
            // Message not found, fall back to message key
            message = OpenLayers.Lang.translate(key);
        }
        if(context) {
            message = OpenLayers.String.format(message, context);
        }
        return message;
    },
    
    /**
     * APIMethod: getLocalizationForKey
     * Looks up a key from a dictionary based on the current language string.
     *     The value of {<getCode>} will be used to determine the appropriate
     *     dictionary.  Dictionaries are stored in {<OpenLayers.Lang>}.
     *
     * Parameters:
     * key - {String} The key for an i18n string value in the dictionary.
     *
     * Returns:
     * {String} An internationalized string.
     */
    getLocalizationForKey : function(key){
        return Geoportal.Lang.translate(key);
    },

    /**
     * APIMethod: addLocale
     * Add a new locale to the API.
     * 
     * Parameters: 
     * localeKey - {String} The key of the locale
     * localeName - {String} The name of the locale in English
     * localizedName - {String} The key of the locale in the locale language
     */
    addLocale : function(localeKey, localeName, localizedName) {
        Geoportal.Lang[localeKey] = {};
    },
    
    /**
     * APIMethod: getLocaleByKey
     * Get a locale from its key.
     * 
     * Parameters: 
     * localeKey - {String} The key of the locale
     * 
     * Returns:
     * {Object} A locale object.
     */
    getLocaleByKey : function(localeKey) {
        return Geoportal.Lang[localeKey];
    },

    /**
     * APIMethod: getLocalizationForLocaleAndKey
     * Get message by the key and locale.
     * 
     * Parameters: 
     * locale - {String} The locale key
     * key - {String} The key to translate
     * 
     * Returns:
     * {String} An internationalized string.
     */
    getLocalizationForLocaleAndKey : function(locale, key) {
        var message = Geoportal.Lang[locale] ? Geoportal.Lang[locale][key] : null;
        if (!message) {
            // Message not found, fall back to message key
            message = OpenLayers.Lang.translate(key);
        }
        return message;
    },
    
    /**
     * APIMethod: setLocalizationForKey
     * Set new message by the key and locale.
     * 
     * Parameters: 
     * locale - {String} The locale key
     * key - {String} The message key
     * translation - {String} The translated text
     */
    setLocalizationForKey : function(locale,key,translation){
        var dictionary = Geoportal.Lang[locale];
        if(!dictionary){
            this.addLocale(locale);
        }
        dictionary[key] = translation;
    },
    
    /**
     * APIMethod: setLocalizationsForKey
     * Set new messages by the keys and locale.
     * 
     * Parameters: 
     * key - {String} The message key
     * translations - {Object} The translated texts. This object holds the locale codes and
     *     the translated texts : {"fr":"...","en":"..."}
     */
    setLocalizationsForKey: function(key,translations){
        for (var locale in translations){
            this.setLocalizationForKey(locale,key,translations[locale]);
        }
    },
    
    /**
     * APIMethod: setLocalizationsForKeys
     * Set new messages by the keys and locale.
     * 
     * Parameters: 
     * translations - {Object} {key1:{"fr":"...","en":"..."},key2:{"fr":"...","en":"..."}}
     */
    setLocalizationsForKeys : function(translations){
        for (var t in translations){
            this.setLocalizationsForKey(t,translations[t]);
        }
    }

};

/**
 * Function: Geoportal.i18n
 * Alias for <Geoportal.Lang.translate>.  Looks up a key from a dictionary
 *     based on the current language string. The value of
 *     <OpenLayers.Lang.getCode at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Lang-js.html#OpenLayers.Lang.getCode>
 *     will be used to determine the appropriate dictionary.
 *     Dictionaries are stored in {<OpenLayers.Lang at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Lang-js.html>}.
 *
 * Parameters:
 * key - {String} The key for an i18n string value in the dictionary.
 * context - {Object} Optional context to be used with
 *     <OpenLayers.String.format at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/BaseTypes-js.html#OpenLayers.String.format>.
 *
 * Returns:
 * {String} An internationalized string.
 */
Geoportal.i18n = Geoportal.Lang.translate;

/**
 * Function: OpenLayers.i18n
 * Alias for <Geoportal.Lang.translate>.  Looks up a key from a dictionary
 *     based on the current language string. The value of
 *     <OpenLayers.Lang.getCode at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Lang-js.html#OpenLayers.Lang.getCode>
 *     will be used to determine the appropriate dictionary.
 *     Dictionaries are stored in {<OpenLayers.Lang at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Lang-js.html>}.
 *     It is overidden to ensure reading dictionaries from Geoportal, then
 *     OpenLayers.
 *
 * Parameters:
 * key - {String} The key for an i18n string value in the dictionary.
 * context - {Object} Optional context to be used with
 *     <OpenLayers.String.format at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/BaseTypes-js.html#OpenLayers.String.format>.
 * 
 * Returns:
 * {String} A internationalized string.
 */
OpenLayers.i18n = Geoportal.Lang.translate;
