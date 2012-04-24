/*global YUI */
YUI.add("lang/editable_zh-TW", function (Y) {
    Y.Intl.add("editable", "zh-TW", {
        default_empty_hint: "請輸入文字...",
        default_error_message: "有錯誤狀況發生，請再試一次。",
        require_error_message: "本欄位不能空白。",
        max_length_error_message: "你所輸入的文字超過限制。",
        min_length_error_message: "您的限制小於最小限制",
        filename_error_message: '下列字元不能使用：&#92; &#47; &#58; &#42; &#63; &#34; &#60; &#62; &#124;',
        default_tooltip: "點選即可編輯",
        header_prompt: "修改資料",
        save_label: "儲存",
        cancel_label: "取消"
    });
});
