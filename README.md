# YUI3 Editable Widget

A JavaScript widget that makes a node content editable.

## Dependencies

You must embed YUI seed file, editable library, and editable CSS in your web page.

```html
<link rel="stylesheet" href="assets/editable.css">
<script src="http://yui.yahooapis.com/3.5.0/build/yui/yui-min.js"></script>
<script src="editable.js"></script>
```

## HTML

Suppose you have following HTML code:

```html
<ul>
    <li>
        <img src="..." alt="David's Buddy Icon">
        <div class="nickname-editable">Killer</p>
    </li>
    <li>
        <img src="..." alt="Kate's Buddy Icon">
        <div class="nickname-editable">Katty</p>
    </li>
    <li>
        <img src="..." alt="John's Buddy Icon">
        <div class="nickname-editable"></p>
    </li>
</ul>
```

Say, you want to make all nodes with 'nickname-editable' class name become editable.

## JavaScript

### Basic Example

Only with few lines, you can achieve it.

```javascript
YUI({
    filter: "raw",
    fetchCSS: false,
    lang: "zh-TW, en-US",
    groups: {
        mui: {
            filter: "raw",
            base: "http://josephj.com/project/",
            modules: {
                "editable": {
                    lang: ["en-US"],
                    requires: [
                        "base", "panel", "event-mouseenter",
                        "event-delegate", "node-event-delegate",
                        "io-base", "escape", "intl"
                    ]
                }
            }
        }
    }
}).use("editable", function (Y) {
    var editable = new Y.Editable({
        "selector": ".nickname-editable"
    });
});
```

### Interacting with Server

The above example only works in browser-side.
You must want to know how to save your data to your web server.

```javascript
YUI({
    lang: "zh-TW, en-US",
    groups: {
        mui: {
            base: "http://josephj.com/project/",
            modules: {
                "editable": {
                    lang: ["en-US"],
                    requires: [
                        "base", "panel", "event-mouseenter",
                        "event-delegate", "node-event-delegate",
                        "io-base", "escape", "intl"
                    ]
                }
            }
        }
    }
}).use("editable", function (Y) {
    var editable = new Y.Editable({
        "selector"     : ".nickname-editable"
        "validateRule" : "required|max_length[25]",
        "postData"     : "crumb=a12345",      // Extra data you want send to server.
        "postField"    : "nickname",          // The input field name.
        "postUrl"      : "/service/api.php",  // The server's API entrypoint.
        "postValidator": function (o) {       // Validate server response before updating UI.
            // o is response object of Y.io.
            return (o.responseText === "ok");
        }
    });
});
```

### Attributes
* emptyDefault: The prompt message that shows when the editable node has no value.
* inputType: You can choose "input" or "textarea" for users to edit.
* node: Provide selector, Y.Node, or HTML element here if you don't want this editable instance take effect everywhere in <body>. Default is <body>.
* postData: Extra form post data in query string style. (a=1&b=2)
* postUrl: The URL Y.io makes request to.
* postValidator: A function which validates server response. The only argument is Y.io response object.
* postField: The name of your input field.
* errorMessage: The message that shows after postValidator return false.
* selector: The default is ".yui3-editable". You can specify the selector you want to make these nodes become editable.
* tooltip: The tooltip which shows when user hovers the editable nodes.
* validateRule: The built-in form validation rules you want use in this instance, separating by pipe ( | ). Currently I only provide "required", "max_length[]", "min_length[]", and "filename".

### Supported Languages
* en-US
* zh-TW

### Sample Code

#### Everybody can access
* http://josephj.com/project/yui3-editable/sample/demo.html
* http://josephj.com/project/yui3-editable/sample/demo-simple.html

#### Only miiiCasa Engineer can access
* http://a.mimgs.com/lib/mui/editable/sample/demo-combo.html

