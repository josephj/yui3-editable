# YUI3 Editable Widget

A JavaScript widget that makes a node content editable.

## Dependencies

You must embed YUI seed file in your web page.

```html
<script src="http://yui.yahooapis.com/3.5.0pr6/build/yui/yui-min.js"></script>
```

## Editable JavaScript Library

Make a copy of editable.js to your website and embed it in your web page too.

```html
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
YUI().use("editable", function () {
    var editable = new Y.Editable({
        "selector": ".nickname-editable"
    });
});
```

### Interacting with Server

The above example only works in browser-side.
You must want to know how to save your data to your web server.

```javascript
YUI().use("editable", function () {
    var editable = new Y.Editable({
        "selector"     : ".nickname-editable"
        "postData"     : "crumb=a12345",      // Extra data you want send to server.
        "postField"    : "nickname",          // The input field name.
        "postUrl"      : "/service/api.php",  // The server's API entrypoint.
        "postValidator": function (o) {       // Validate server response before updating UI.
            // o is response object of Y.io.
            return (o.responseText === "ok");
        }
    });
});

### Sample Code

* http://josephj.com/lab/2012/yui3-editable/sample/demo-simple.html
* http://josephj.com/lab/2012/yui3-editable/sample/demo.html
