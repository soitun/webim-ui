/*
 * 状态(cookie临时存储[刷新页面有效])
 * webim.status.init(status);//初始化状态
 * webim.status.all //所有状态
 * webim.status(key);//get
 * webim.status(key,value);//set
 */
//var d = {
//        tabs:{1:{n:5}}, // n -> notice count
//        tabIds:[1],
//        p:5, //tab prevCount
//        a:5, //tab activeTabId
//        b:0, //is buddy open
//        o:0 //has offline
//}

webim.status = function(key, value){
    var options = key;
    if (typeof key == "string") {
        if (value === undefined) {
            return webim.status.all[key];
        }
        options = {};
        options[key] = value;
    }
    var old_status = webim.status.all;
    if (checkUpdate(old_status, options)) {
        var new_status = $.extend({}, old_status, options);
        webim.status.all = new_status;
        $.cookie(webim.status.cookieName, toString(new_status), {
            path: '/',
            domain: window.document.domain
        });
    }
};
webim.status.cookieName = "_webim";
webim.status.all = {};
webim.status.init = function(status){
    if (!status){
                var c = $.cookie(webim.status.cookieName);
                status = c ? toJSON(c) : null;
    }
    $.extend(webim.status.all, status);
};
webim.status.clear = function(){
        webim.status.all = {};
        $.cookie(webim.status.cookieName, "", {
            path: '/',
            domain: window.document.domain
        });
};
