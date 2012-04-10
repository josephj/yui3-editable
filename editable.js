/*global YUI */
// 當資料是空的時候..
// 定位速度如何更快
// 多國語系
/**
 * A widget that makes a node's content editable.
 *
 * @module editable
 * @requires base, panel, event-delegate, node-event-delegate, io-base, escape
 */
YUI.add("editable", function (Y) {

    var _panel = null, // The single Y.Panel instance for all editable instances.
        //=============
        // Constants
        //=============
        MODULE_ID        = "Y.Editable",
        CLASS_NAME       = "yui3-editable",
        CLICK_SELECTOR   = "." + CLASS_NAME,
        INPUT_CLASS_NAME = CLASS_NAME + "-dialog-input",
        INPUT_SELECTOR   = "." + INPUT_CLASS_NAME,
        //==================
        // Private Function
        //==================
        _initPanel;

    /**
     * Render global panel.
     *
     * @method _initPanel
     * @private
     */
    _initPanel = function () {
        var panel = new Y.Panel({
            boundingBox: Y.Node.create('<div class="' + CLASS_NAME + '-dialog"/>'),
            contentBox: Y.Node.create('<form class="' + CLASS_NAME + '-dialog-content"/>'),
            headerContent: "Edit",
            visible: false,
            render: true
        });
        Y.one("body").on("click", function (e) {
            if (
                !e.target.test("." + CLASS_NAME) &&
                !_panel.get("srcNode").contains(e.target)
            ) {
                panel.hide();
            }
        }, this);
        return panel;
    };

    /**
     * A widget that makes a node's content editable.
     * The following is sample usage.
     *
     *    var editable = new Y.Editable({
     *        "node": "#foo",          // The context node.
     *        "inputType": "textarea", // The input field type.
     *        "postUrl": "api.php",    // The entrypoint of your request.
     *        "postValidator": function (response) {
     *            // Define your validator here.
     *            // The parameter is Y.io response object.
     *            // Return true if the response is successful.
     *        }
     *    });
     *
     *
     * @constructor
     * @class Editable
     * @param {Object} config attribute object
     */
    function Editable (config) {
        Editable.superclass.constructor.apply(this, arguments);
    }

    /**
     * @property NAME
     */
    Editable.NAME = "editable";

    /**
     * @property ATTRS
     */
    Editable.ATTRS = {
        /**
         * The event type to trigger editor.
         * Currently it only supports "click" event.
         *
         * @attribute eventType
         * @type {String}
         * @default "click"
         */
        "eventType": {
            value: "click",
            validator: function (value) {
                return (value === "hover" || value === "click");
            }

        },
        /**
         * The form element type for user to input.
         * It only supports "text" (text field) and "textarea".
         *
         * @attribute type
         * @default "input"
         */
        "inputType": {
            value: "input",
            validator: function (value) {
                return (value === "input" || value === "textarea");
            }
        },
        /**
         * The context node that editable takes effect within.
         *
         * @attribute node
         * @type {Y.Node|String|HTML Element}
         * @default "body"
         */
        "node": {
            value: null
        },
        /**
         * The query string as POST data.
         * ex. crumb_name=1234&crumb_value=5678
         *
         * @attribute postUrl
         * @type {String}
         */
        "postData": {
            value: null
        },
        /**
         * The API entrypoint URL.
         * Note it must be in same domain with current page.
         *
         * @attribute postUrl
         * @type {String}
         */
        "postUrl": {
            value: null
        },
        /**
         * The server response value must pass
         * this validator to update editable value.
         *
         * @attribute postValidator
         * @type {Function}
         */
        "postValidator": {
            value: function (o) {
                return (o.status === 200);
            },
            validator: Y.Lang.isFunction
        },
        /**
         * The input field name.
         *
         * @attribute postField
         * @type {String}
         */
        "postField": {
            value: null
        }
    };

    Y.extend(Editable, Y.Base, {
        _handlers: [],
        _inputNode: null,
        _clickNode: null,
        _activeValue: "",
        /**
         * Set the position for panel editor.
         *
         * @method _uiSetPosition
         * @param inputNode {Y.Node} The input node.
         * @param panelNode {Y.Node} The panel node.
         * @param clickNode {Y.Node} The editable node.
         */
        _uiSetPosition: function (inputNode, panelNode, clickNode) {
            var clickXY  = clickNode.getXY(),
                dialogXY = panelNode.getXY(),
                inputXY = inputNode.getXY(),
                padX    = 18, // TODO - padX and padY should be dynamic.
                padY    = 15;

            inputNode.setStyles({
                "width" : clickNode.get("offsetWidth"),
                "height": clickNode.get("offsetHeight")
            });

            _panel.set("xy", [
                clickXY[0] - (inputXY[0] - dialogXY[0]) - padX,
                clickXY[1] - (inputXY[1] - dialogXY[1]) - padY
            ]);
        },
        /**
         * All buttons in panel footer will be disabled.
         * It prevents duplicate form submission.
         *
         * @event _lock
         * @private
         */
        _lock: function () {
            var self = this;
            Y.each(_panel.get("buttons.footer"), function (button) {
                button.set("disabled", true);
            });
        },
        /**
         * Remove disable attribute for panel footer buttons.
         *
         * @event _unlock
         * @private
         */
        _unlock: function () {
            var self = this;
            Y.each(_panel.get("buttons.footer"), function (button) {
                button.set("disabled", false);
            });
        },
        /**
         * Handle form submission.
         *
         * @event _handleSubmit
         * @private
         * @param e {Y.Event} The Y.Event instance.
         */
        _handleSubmit: function (e) {
            Y.log("_handleSubmit(e) is executed.", "info", MODULE_ID);
            var self = this,
                value = "",
                url;

            e.preventDefault();
            url = self.get("postUrl");
            value = self._inputNode.get("value");

            if (self._activeValue === value) {
                Y.log("_handleSubmit(e) - Value not change.", "warn", MODULE_ID);
                _panel.hide();
                return;
            }

            // If the postUrl attribute is not defined,
            // it just copies the user input value to the editable node.

            if (!url) {
                self._clickNode.setContent(Y.Escape.html(value));
                _panel.hide();
                if (!value) {
                    self._clickNode.addClass(CLASS_NAME + "-empty");
                }
                return;
            }

            // Otherwise, it uses Y.io() to communicate with server.
            Y.log("_handleSubmit(e) - Exchange data with server.");
            Y.io(url, {
                method: "POST",
                data: self.get("postData"),
                context: self,
                on: {
                    "start": function (id, args) {
                        this._lock();
                    },
                    "success": function (id, o, args) {
                        Y.log("_handleSubmit(e) - Server responses data successfully.");
                        var self = this,
                            validator;

                        validator = self.get("postValidator");

                        // After passing user defined validator,
                        // The editable node's content will be updated,
                        // and the panel will be hided.
                        if (validator(o)) {
                            Y.log("_handleSubmit(e) - Validation rule passed.");
                            if (!value) {
                                self._clickNode.addClass(CLASS_NAME + "-empty");
                            }
                            self._clickNode.setContent(Y.Escape.html(value));
                            _panel.hide();
                        }
                    },
                    "end": function (id, args) {
                        this._unlock();
                    }
                }
            });
        },
        /**
         * Move the panel to correct position and show.
         *
         * @method _handleClick
         * @private
         * @param e {Y.Event} The YUI Event instance.
         */
        _handleClick: function (e) {
            Y.log("_handleClick(e) is executed.", "info", MODULE_ID);
            var self = this,
                clickNode,
                panelNode,
                inputNode;

            panelNode = _panel.get("srcNode");
            clickNode = e.currentTarget;

            // Update the submit event.
            _panel.set("buttons", {
                footer: [
                    {
                        label    : "Save",
                        isDefault: true,
                        events: {
                            click: Y.bind(self._handleSubmit, self)
                        }
                    },
                    {
                        label    : "Cancel",
                        hasFocus : false,
                        events: {
                            click: function (e) {
                                e.preventDefault();
                                this.hide();
                            }
                        }
                    }
                ]
            });

            // Update input node.
            fieldName = self.get("postField");
            fieldName = (fieldName) ? ' name="' + fieldName + '"' : "";
            if (self.get("inputType") === "input") {
                bodyContent = '<input type="text"' + fieldName + ' class="' + INPUT_CLASS_NAME + '">';
            } else {
                bodyContent = '<textarea' + fieldName + ' class="' + INPUT_CLASS_NAME + '"></textarea>';
            }
            _panel.set("bodyContent", bodyContent);
            inputNode = panelNode.one(INPUT_SELECTOR);
            inputNode.set("value", clickNode.get("innerText"));

            self._clickNode = clickNode;
            self._inputNode = inputNode;

            // Adjust panel position.
            self._uiSetPosition(inputNode, panelNode, clickNode);

            self._activeValue = clickNode.get("innerText");

            // Show the panel for editing.
            _panel.show();
        },
        /**
         * It will be invoked after user instanitate a instance.
         *
         * @method initializer
         * @public
         */
        initializer: function (config) {
            Y.log("initializer() is executed.", "info", MODULE_ID);
            var self = this,
                node,
                handler;

            if (!_panel) {
                _panel = _initPanel();
            }

            // Use event delegation to prevent too many editable node exists.
            node = Y.one(self.get("node"));
            handler = node.delegate("click", self._handleClick, CLICK_SELECTOR, self);
            self._handlers.push(handler);
        },
        /**
         * It will be invoked after user calls destroy().
         *
         * @method destructor
         * @public
         */
        destructor: function () {
            Y.log("destructor() is executed.", "info", MODULE_ID);
            var self = this;
            Y.each(self._handlers, function (handler) {
                handler.detach();
            });
        },
        /**
         * Hide the panel.
         *
         * @method hide
         * @public
         */
        hide: function () {
            Y.log("hide() is executed.", "info", MODULE_ID);
            if (!_panel) {
                return;
            }
            _panel.hide();
        }
    });

    // Promote to YUI environment.
    Y.Editable = Editable;

}, "0.0.1", {requires:["base", "panel", "event-delegate", "node-event-delegate", "io-form", "escape"]});
