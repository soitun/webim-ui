//
/* ui.notification:
 *
 options:
 attributes：

 methods:
 check_tag

 destroy()
 events: 
 change

 */
webim.widget("notification",{
        _init: function(){
                var self = this, element = self.element, options = self.options;
                if(!element){
                        element = self.element = $(tpl(options.template)).addClass(self.widgetClassName);
                }
                self.ui = {
                        ul: element.children("ul:first"),
                        empty: element.children(".webim-notification-empty")
                };
                var win = options.window;
                if(win){
                        win.bind("displayStateChange", function(e, type){
                                if(type != "minimize"){
                                        self._fitUI();
                                }
                        });
                }
                //self._initEvents();
        },
	_fitUI:function(){
                var el = this.element;
		el.height() > 300 && el.height(300);
	},
        add: function(text, link, isExtlink){
                var self = this, d;
                if($.isArray(text)){
                        for(var i=0; i < text.length; i++){
                                d = text[i];
                                self.add(d.text, d.link, d.isExtlink);
                        }
                        return;
                }
                var ui = self.ui, template_li = self.options.template_li;
                ui.empty.hide();
                ui.ul.append(tpl(template_li, {
                        text: text,
                        link: link,
                        target: isExtlink ? "_blank" : ""
                }));
        },
        destroy: function(){
        }
});
webim.ui.notification.defaults = {
        event:'click',
        template: '<div id="webim-notification">\
                        <ul></ul>\
                        <div class="webim-notification-empty">{{empty notification}}</div>\
                  </div>',
        template_li: '<li><a href="{{link}}" target="{{target}}">{{text}}</a></li>'
};
