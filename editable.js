/*global YUI */
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
        MODULE_ID          = "Y.Editable",
        CLASS_NAME         = "yui3-editable",
        CLICK_SELECTOR     = "." + CLASS_NAME,
        INPUT_CLASS_NAME   = CLASS_NAME + "-dialog-input",
        CLICKED_CLASS_NAME = CLASS_NAME + "-clicked",
        VALUE_CLASS_NAME   = CLASS_NAME + "-value",
        HINT_CLASS_NAME    = CLASS_NAME + "-hint",
        EMPTY_CLASS_NAME   = CLASS_NAME + "-empty",
        MESSAGE_CLASS_NAME = CLASS_NAME + "-dialog-message",
        INPUT_SELECTOR     = "." + INPUT_CLASS_NAME,
        //==================
        // Private Function
        //==================
        _documentClick,
        _initPanel;

    /**
     * Render global panel.
     *
     * @method _initPanel
     * @private
     */
    _initPanel = function () {
        Y.log("_initPanel() is executed.", "info", MODULE_ID);
        var panel = new Y.Panel({
            boundingBox: Y.Node.create('<div class="' + CLASS_NAME + '-dialog"/>'),
            contentBox: Y.Node.create('<form class="' + CLASS_NAME + '-dialog-content"/>'),
            constrain: "body",
            headerContent: "Edit",
            visible: false,
            render: true
        });
        // FIXME - button disappear after _uiSetPosition.
        panel.addButton({
            value: "Close",
            action: function () {
                panel.hide();
            },
            section: Y.WidgetStdMod.HEADER
        });
        Y.one("body").on("click", _documentClick);
        return panel;
    };
    /**
     * Hide panel when user clicks outside the panel.
     *
     * @event _documentClick
     * @private
     */
    _documentClick = function (e) {
        Y.log("_documentClick(e) is executed.", "info", MODULE_ID);
        if (!_panel.get("visible")) {
            Y.log("_documentClick(e) - Panel is not visible.", "info", MODULE_ID);
            return;
        }
        if (
            !e.target.test("." + CLASS_NAME) &&
            !e.target.test("." + HINT_CLASS_NAME) &&
            !e.target.test("." + VALUE_CLASS_NAME) &&
            !_panel.get("srcNode").contains(e.target)
        ) {
            Y.log("_documentClick(e) - Panel is hided.", "info", MODULE_ID);
            _panel.hide();
        }
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
         * The default empty string
         * if the HTML is not defined.
         *
         * @attribute emptyDefault
         * @type {String}
         * @default "Please input your text..."
         */
        "emptyDefault": {
            value: "Please input your text...",
            validator: Y.Lang.isString
        },
        /**
         * The error message which shows when validating fails.
         *
         * @attribute errorMessage
         * @type {String}
         * @default "Something wrong, please try again."
         */
        "errorMessage": {
            value: "Something wrong, please try again.",
            validator: Y.Lang.isString
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
        },
        /**
         * The CSS selector of editable nodes.
         *
         * @attribute selector
         * @type {String}
         */
        "selector": {
            value: null
        },
        /**
         * The tooltip which shows when mouse hover the editable nodes.
         *
         * @attribute tooltip
         * @type {String}
         */
        "tooltip": {
            value: "Click here to edit..."
        }
    };

    Y.extend(Editable, Y.Base, {
        //=====================
        // Private Attribute
        //=====================
        _activeValue: "", // Compare with the value user submits.
        _clickNode: null, // The node user clicks.
        _handlers: [],    // Event handlers which will be removed if destroy() is called.
        _inputNode: null, // The node user inputs string.
        //=====================
        // Private Events
        //=====================
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
                clickNode = null,
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
                value = Y.Escape.html(value);
                clickNode = self._clickNode;
                clickNode.one("." + VALUE_CLASS_NAME).setContent(value);
                if (!value) {
                    clickNode.addClass(EMPTY_CLASS_NAME);
                } else {
                    clickNode.removeClass(EMPTY_CLASS_NAME);
                }
                _panel.hide();
                return;
            }

            // Otherwise, it uses Y.io() to communicate with server.
            Y.log("_handleSubmit(e) - Exchange data with server.", "info", MODULE_ID);
            Y.io(url, {
                method: "POST",
                data: self.get("postData"),
                context: self,
                on: {
                    "start": function (id, args) {
                        this._lock();
                    },
                    "success": function (id, o, args) {
                        Y.log("_handleSubmit(e) - Server responses data successfully.", "info", MODULE_ID);
                        var self = this,
                            validator,
                            clickNode;

                        validator = self.get("postValidator");
                        clickNode = self._clickNode;

                        // After passing user defined validator,
                        // The editable node's content will be updated,
                        // and the panel will be hided.
                        if (validator(o)) {
                            Y.log("_handleSubmit(e) - Validation rule passed.", "info", MODULE_ID);
                            value = Y.Escape.html(value);
                            value = Y.Lang.trim(value);
                            clickNode.one("." + VALUE_CLASS_NAME).setContent(value);
                            if (!value) {
                                clickNode.addClass(EMPTY_CLASS_NAME);
                            } else {
                                clickNode.removeClass(EMPTY_CLASS_NAME);
                            }
                            _panel.hide();
                        } else {
                            _panel.get("srcNode").one("." + MESSAGE_CLASS_NAME).setContent(self.get("errorMessage"));
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
         * @event _handleClick
         * @private
         * @param e {Y.Event} The YUI Event instance.
         */
        _handleClick: function (e) {
            Y.log("_handleClick(e) is executed.", "info", MODULE_ID);
            var self = this,
                bodyContent,
                clickNode,
                clickText,
                fieldName,
                panelNode,
                inputNode;

            panelNode = _panel.get("srcNode");
            clickNode = e.currentTarget;

            // Update UI if necessary.
            if (!clickNode.hasClass(CLICKED_CLASS_NAME)) {
                self._uiSetNode(clickNode);
            }

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
            clickText = clickNode.one("." + VALUE_CLASS_NAME).getContent();
            if (self.get("inputType") === "input") {
                bodyContent = [
                    '<input type="text"' + fieldName,
                    ' class="' + INPUT_CLASS_NAME + '"',
                    ' value="' + clickText + '">',
                    '<p class="' + MESSAGE_CLASS_NAME + '">&nbsp;</p>'
                ].join("");
            } else {
                bodyContent = [
                    '<textarea' + fieldName,
                    ' class="' + INPUT_CLASS_NAME + '"',
                    '>' + clickText + '</textarea>',
                    '<p class="' + MESSAGE_CLASS_NAME + '">&nbsp;</p>'
                ].join("");
            }
            _panel.set("bodyContent", bodyContent);

            inputNode = panelNode.one(INPUT_SELECTOR);

            self._clickNode = clickNode;
            self._inputNode = inputNode;

            // Adjust panel position.
            self._uiSetPosition(inputNode, panelNode, clickNode);

            // Show the panel for editing.
            _panel.show();

            inputNode.select();
            inputNode.focus();
            self._activeValue = clickNode.one("." + VALUE_CLASS_NAME).getContent();

        },
        /**
         * Set title as tooltip.
         *
         * @event _handleHover
         * @private
         * @param e {Y.Event} The YUI Event instance.
         */
        _handleHover: function (e) {
            Y.log("_handleHover(e) is executed.", "info", MODULE_ID);
            var node = e.currentTarget;
            if (!Y.Lang.isUndefined(node.hasTitle)) {
                return;
            }
            if (!node.get("title")) {
                node.set("title", this.get("tooltip"));
            }
            node.hasTitle = true;
        },
        //=====================
        // Private Methods
        //=====================
        /**
         * All buttons in panel footer will be disabled.
         * It prevents duplicate form submission.
         *
         * @event _lock
         * @private
         */
        _lock: function () {
            Y.log("_lock() is executed.", "info", MODULE_ID);
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
            Y.log("_unlock() is executed.", "info", MODULE_ID);
            var self = this;
            Y.each(_panel.get("buttons.footer"), function (button) {
                button.set("disabled", false);
            });
        },
        /**
         * Render the node that triggers editable panel.
         *
         * @method _uiSetNode
         * @private
         * @param node {Y.Node} The clicked node.
         */
        _uiSetNode: function (node) {
            Y.log("_uiSetNode() is executed.", "info", MODULE_ID);
            if (node.hasClass(CLASS_NAME)) {
                node.addClass(CLASS_NAME);
            }
            if (node.hasClass(CLICKED_CLASS_NAME)) {
                return;
            }
            var empty, text;
            node.addClass(CLICKED_CLASS_NAME);
            if (!node.one("." + VALUE_CLASS_NAME)) {
                text = node.get("innerText") || node.get("textContent");
                node.setContent("");
                node.append('<div class="' + VALUE_CLASS_NAME + '">' + text + '</div>');
            }
            if (!node.one("." + HINT_CLASS_NAME)) {
                empty = this.get("emptyDefault"); // The default empty text.
                node.append('<div class="' + HINT_CLASS_NAME + '">' + empty  + '</div>');
            }
        },
        /**
         * Set the position for panel editor.
         *
         * @method _uiSetPosition
         * @param inputNode {Y.Node} The input node.
         * @param panelNode {Y.Node} The panel node.
         * @param clickNode {Y.Node} The editable node.
         */
        _uiSetPosition: function (inputNode, panelNode, clickNode) {
            Y.log("_uiSetPosition() is executed.", "info", MODULE_ID);
            var clickXY  = clickNode.getXY(),
                dialogXY = panelNode.getXY(),
                inputXY  = inputNode.getXY(),
                padX     = 18, // TODO - padX and padY should be dynamic.
                padY     = 15;

            inputNode.setStyles({
                "width" : clickNode.get("offsetWidth"),
                "height": clickNode.get("offsetHeight")
            });

            _panel.set("xy", [
                clickXY[0] - (inputXY[0] - dialogXY[0]) - padX,
                clickXY[1] - (inputXY[1] - dialogXY[1]) - padY
            ]);
        },
        //=====================
        // Public Methods
        //=====================
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
                selector,
                node,
                handler;

            selector = config.selector || CLICK_SELECTOR;
            self._set("selector", selector);

            node = config.node || "body";
            node = Y.one(node);
            if (!node) {
                Y.log("initializer() - The 'node' attribute you provide is not valid.", "error", MODULE_ID);
                return;
            }
            self._set("node", node);

            if (!_panel) {
                _panel = _initPanel();
            }

            // Use event delegation to prevent too many editable node exists.
            node = Y.one(self.get("node"));
            handler = node.delegate("mouseenter", self._handleHover, selector, self);
            self._handlers.push(handler);
            handler = node.delegate("click", self._handleClick, selector, self);
            self._handlers.push(handler);
        }
    });

    // Promote to YUI environment.
    Y.Editable = Editable;

}, "0.0.1", {requires:["base", "panel", "event-mouseenter", "event-delegate", "node-event-delegate", "io-form", "escape", "widget-buttons"]});
