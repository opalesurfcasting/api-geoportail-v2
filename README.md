# api-geoportail-v2


Canonicalize Géoportail API V2.12 using jsDelivr Github CDN and mod_pagespeed.

In Apache pagespeed.conf:

This will enable canonicalization for GeoportalExtended.js using jsDelivr Github CDN - The parameter below will enable detection from this librarie size and checksum :

ModPagespeedEnableFilters canonicalize_javascript_libraries

Adding this :

 ModPagespeedLibrary 2500817 t1KCnbbw9WCA9AxmAnMKY \
    //cdn.jsdelivr.net/gh/opalesurfcasting/api-geoportail-v2@V2.1.2/GeoportalExtended.min.js
    
will enable canonicalization for GeoportalExtended.js, also based on file size 2500817 and checksum. This is needed as this file is not in default mod_pagespeed canonicalized libraries list.

Find the size and checksum :

pagespeed_js_minify --print_size_and_hash GeoportalExtended.js - Find the size and checksum

Direct urls :

minified : https://cdn.jsdelivr.net/gh/opalesurfcasting/api-geoportail-v2@V2.1.2/GeoportalExtended.min.js

    When canonicalized, libraries will not be combined or minifyed by mod_pagespeed, but it can be done through jsdlivr. It's up to you to check what is the best.
