/*
 本地化
 webim.i18n.locale = 'zh-CN';//设置本地语言
 webim.i18n.store('zh-CN',{bbb:"test"});//添加
 webim.i18n(name,args);// 获取
 */
var i18nArgs = {};
var i18nRe = function(a, b){
                return i18nArgs[b] || "";
}
var i18n = webim.i18n = function(name, args, options){
        options = $.extend({
                locale: i18n.locale
        }, options);
        var dict = i18n.dictionary[options.locale];
        if (!isObject(dict)) 
        dict = {};
        var str = dict[name] === undefined ? name : dict[name];

        if (args) {
                i18nArgs = args;
                for (var key in args) {
                //str = str.replace('{{' + key + '}}', args[key]);
                str = str.replace(/\{\{(.*?)\}\}/g, i18nRe);
                }
        }
return str;
};
i18n.locale = 'zh-CN';
i18n.dictionary = {};
i18n.store = function(locale, data){
        var dict = i18n.dictionary;
        if (!isObject(dict[locale])) 
        dict[locale] = {};
        $.extend(dict[locale], data);
};
