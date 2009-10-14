//
/* webim layout air:
 *
 options:
 attributes：

 methods:
 addApp(widget)
 addChat(id, info, history)
 focusChat(id, info, history)
 removeChat(ids)

 online() //
 offline()

 activate(window) // activate a window

 destroy()

 events: 

 */
webim.layout.air = function(element, options){
        this._init(element, options);

};

$.extend(webim.layout.air.prototype, {
        _init: function(element, options){
                var self = this;
                var element = self.element = $(element);
                var options = self.options = $.extend({}, options);
                var win = self.window = new webim.air.ui.window(element, {
                        htmlLoader: window.htmlLoader
                });
                var ui = self.ui = {
                        content: win.ui.content,
                        welcome: element.find(".webim-welcome"),
                        main: element.find(".webim-main"),
                        user: element.find(".webim-user"),
                        apps: element.find(".webim-apps"),
                        tabs: element.find(".webim-tabs"),
                        shortcut: element.find(".webim-shortcut")
                };
                var tabs = self.tabs = new webim.ui.tabs(ui.tabs, {});
                self.apps = {}, self.panels = {};
                self._initEvents();
                self._fitUI();
                //test
                self.addChat({"id":"2","eid":"2@www.uchome.com","name":"test","pic":"http://www.uchome.com/uc/ucenter/avatar.php?uid=2&size=small&type=virtual","statusText":"","statusTime":"","link":"space.php?uid=2","is_friend":1,"status":"online"});

        },
        addApp: function(app, options){
                var self = this;
                self.apps[app.widgetName] = app;
        },
        focusChat: function(info, options){
                var self = this, panel = self.panels[info.id];
                if(panel)panel.window.activate();
                else{ self.addChat(info, options); }
        },
        addChat: function(info, options){
                var self = this, panels = self.panels, id = info.id;
                if(!panels[id]){
                        var win = new webim.air.ui.window(null, {
                        });
                        win.bind("ready", function(e){
                                panels[id] = new webim.ui.chat(null, {
                                        window: win,
                                        info: info
                                });
                        });
                }
        },
        addShortcut: function(title, options){
        },
        addWindow: function(){
                new webim.air.ui.window(null, {
                        });
        },
        online: function(){
                var self = this, ui = self.ui;
                ui.welcome.hide();
                ui.main.show();
                self._fitUI();
        },
        offline: function(){
                var self = this, ui = self.ui;
                ui.welcome.show();
                ui.main.hide();
                self._fitUI();
        },
        _initEvents: function(){
                var self = this, win = self.window;
                win.bind("resize",function(e){
                        self._fitUI();
                });
        },
        _fitUI: function(){
                var self = this, ui = self.ui, apps = ui.apps;
                var h = ui.content.height();
                h = h - ui.shortcut.outerHeight() - ui.user.outerHeight();
                h = h - (apps.outerHeight() - apps.height());
                self.tabs.height(h);
        }

});
