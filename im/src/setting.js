/*
 * 配置(数据库永久存储)
 * webim.config.url //post地址
 * webim.config.init(config);//初始化配置
 * webim.config.all //所有配置
 * webim.config(key);//get
 * webim.config(key,value);//set
 */
webim.config = function(key, value){
    var options = key;
    
    if (typeof key == "string") {
        if (value === undefined) {
            return webim.config.all[key];
        }
        options = {};
        options[key] = value;
    }
    var old_config = webim.config.all;
    if (checkUpdate(old_config, options)) {
        var new_config = $.extend({}, old_config, options);
        webim.config.all = new_config;
        $.ajax({
            type: 'post',
            url: webim.config.url,
            dataType: 'json',
            cache: false,
            data: {data: toString(new_config)}
        });
    }
};
webim.config.defaults = {
        play_sound:true,
        buddy_sticky:true,
        minimize_layout: false,
        msg_auto_pop:true
};
webim.config.all = {};
webim.config.url = "setting.php";
_configInit = false;
webim.config.init = function(config){
        var defaults = null;
        if(!_configInit){
                defaults = webim.config.defaults;
                _configInit = true;
        }
        $.extend(webim.config.all, defaults, config);
};
