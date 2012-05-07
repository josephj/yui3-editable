/*global YUI */
YUI.add("lang/editable_en-US", function (Y) {
    Y.Intl.add("editable", "en-US", {
        default_empty_hint: "Please input your text...",
        default_error_message: "Some error happen, please try again.",
        require_error_message: " The field cannot be blank.",
        max_length_error_message: "Your input contains too many characters.",
        min_length_error_message: "Your input is less than minimal length.",
        filename_error_message: 'These characters cannot be used: &#92; &#47; &#58; &#42; &#63; &#34; &#60; &#62; &#124;',
        default_tooltip: "Click here to edit...",
        save_label: "Save",
        cancel_label: "Cancel"
    });
});
