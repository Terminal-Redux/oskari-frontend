/**
 * Definition for bundle. See source for details.
 *
 * @class Oskari.custombundles.helloworld.HelloWorld
 */
Oskari.clazz.define("Oskari.custombundles.helloworld.HelloWorld",

    /**
     * Called automatically on construction. At this stage bundle sources have been
     * loaded, if bundle is loaded dynamically.
     *
     * @contructor
     * @static
     */
    function() {

    }, {
        /*
         * called when a bundle instance will be created
         *
         * @method create
         */
        "create": function() {
            return Oskari.clazz.create("Oskari.custombundles.helloworld.HelloWorldInstance");
        },
        /**
         * Called by Bundle Manager to provide state information to
         *
         * @method update
         * bundle
         */
        "update": function(manager, bundle, bi, info) {}
    },

    /**
     * metadata
     */
    {
        "protocol": ["Oskari.bundle.Bundle"],
        "source": {
            "scripts": [{
                "type": "text/javascript",
                "src": "../../../bundles/custombundles/helloworld/instance.js"
            }],
            "locales": [{
                "lang": "fi",
                "type": "text/javascript",
                "src": "../../../bundles/custombundles/helloworld/resources/locale/fi.js"
            }, {
                "lang": "sv",
                "type": "text/javascript",
                "src": "../../../bundles/custombundles/helloworld/resources/locale/sv.js"
            }, {
                "lang": "en",
                "type": "text/javascript",
                "src": "../../../bundles/custombundles/helloworld/resources/locale/en.js"
            }]
        }
    });

// Install this bundle by instantating the Bundle Class
Oskari.bundle_manager.installBundleClass("helloworld", "Oskari.custombundles.helloworld.MyBundle");
