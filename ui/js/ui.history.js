//
/* ui.history:
 *
 options:
 attributes：

 methods:
 add(data) //
 clear

 destroy()
 events: 
 clear
 update

 */
webim.widget("history",{
        _init: function(){
                var self = this, element = self.element, options = self.options;
                if(!element){
                        element = self.element = $(options.template);
                }
                var ui = self.ui = {
                        content: element.find(".webim-history-content")
                };
                webim.ui.plugin.call(self, "init", [null, self.plugin_ui()]);
        },
        clear:function(){
                var self = this;
                self.ui.content.empty();
                self.trigger("clear");
        },
        add: function(data){
                data = $.makeArray(data);
                var self = this, l = data.length, markup = [];
                if(!l)return;
                for (var i = 0; i < l; i++){
                        var val = data[i];
                        markup.push(self._renderMsg(val));
                }
                self.ui.content.append(markup.join(''));
                self.trigger("update");
        },
        _renderMsg: function(logItem){
                var self = this;
                logItem = $.extend({}, logItem);
                webim.ui.plugin.call(self, "render", [null, self.plugin_ui({msg: logItem})]);
                var  from = logItem.from, to = logItem.to, time = logItem.timestamp, msg = logItem.body, shouldTilte = true, last = self._lastLogItem, markup = [], buddyInfo = self.options.buddyInfo, userInfo = self.options.userInfo;
                var fromSelf = from != buddyInfo.id;
                var fromToSelf = fromSelf && from == to;

                var name = fromSelf ? userInfo.name : (buddyInfo.name ? '<a href="' + buddyInfo.url + '">' + buddyInfo.name + '</a>' : buddyInfo.id);
                if (last && last.to == to && last.from == from && time - last.timestamp < 60000){
                    shouldTilte = false;
                }
                //markup.push(self._renderDateBreak(time));
                if (shouldTilte) {
                        self._lastLogItem = logItem;
                        var t = (new webim.date(time));
                        markup.push('<h4><span class="webim-gray">');
                        markup.push(t.getDay(true));
                        markup.push(" ");
                        markup.push(t.getTime());
                        markup.push('</span>');
                        markup.push(name);
                        markup.push('</h4>');
                }
                
                markup.push('<p>');
                markup.push(msg);
                markup.push('</p>');
                return markup.join("");
        },
        _renderDateBreak: function(time){
                var self = this, last = self._lastLogItem, newDate = new Date(), lastDate = new Date(), markup = [];
                newDate.setTime(time);
                last && lastDate.setTime(last.timestamp);
                if(!last || newDate.getDate() != lastDate.getDate() || newDate.getMonth() != lastDate.getMonth()){
                    markup.push("<h5>");
                    markup.push((new webim.date(time)).getDay(true));
                    markup.push("</h5>");
                }
                return markup.join("");
        },
        plugin_ui:function(extend){
                var self = this;
                return $.extend({
                        element: self.element,
                        ui: self.ui
                }, extend);
        },
        plugins:{}

});
//<p class="webim-history-actions"> \
//                                                        <a href="#">{{clear history}}</a> \
//                                                        </p> \

webim.ui.history.defaults = {
        userInfo: {},
        buddyInfo: {},
        template:'<div class="webim-history">\
                        <div class="webim-history-content"> \
                </div></div>'
};

var autoLinkUrls = (function(){
        var attrStr;
        function filterUrl(a, b, c){
                return '<a href="' + (b=='www.' ? ('http://' + a) : a) + '"' + attrStr + '>' + a + '</a>'
        }
        function serialize(key, val){
                attrStr += ' ' + key + '="' + val + '"';
        }
        return function(str, attrs){
                attrStr = "";
                attrs && isObject(attrs) && $.each(attrs, serialize);
                return str.replace(/(https?:\/\/|www\.)([^\s<]+)/ig, filterUrl);
        };
})();

webim.ui.history.defaults.parseMsg = true;
webim.ui.plugin.add("history","parseMsg",{
        render:function(e, ui){
                var msg = ui.msg.body;
                msg = HTMLEnCode(msg);
                msg = autoLinkUrls(msg, {target:"_blank"});
                ui.msg.body = msg;
        }
});

webim.ui.history.defaults.emot = true;
webim.ui.plugin.add("history","emot",{
        render:function(e, ui){
                ui.msg.body = webim.ui.emot.parse(ui.msg.body);
        }
});

 
 
