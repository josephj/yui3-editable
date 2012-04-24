// This configuration will be maintained globally in the future.
(function () {
    YUI.GlobalConfig = {
        combine: true,
        comboBase: "http://a.mimgs.com/combo/?f=", // Use local combo handler.
        root: "lib/yui/3.5.0/", // The default root is pointed to YUI 3.5.0 lib.
        lang: "zh-TW,en-US", // Currently we only provide Chinese and English.
        filter: { // Change connector for local combo handler.
            "searchExp": "&",
            "replaceStr": ","
        },
        filters: { //
            "editable": "raw"
        },
        groups: {
            mui: { // Customized mui modules.
                combine: true, // Need to specify it again to make combo works.
                root: "/lib/mui/", // Change to mui lib.
                modules: {
                    "editable": {
                        lang: ["en-US", "zh-TW"],
                        requires: [ // Dependencies
                            "base", "panel", "event-mouseenter",
                            "event-delegate", "node-event-delegate",
                            "io-base", "escape", "intl"
                        ]
                    }
                }
            }
        }
    };
}())
