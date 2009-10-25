//
/* ui.buddy:
 *
 options:
 attributes：

 methods:
 add(data, [index]) //
 remove(ids)
 select(id)
 update(data, [index])
 notice

 destroy()
 events: 
 select
 offline
 online

 */

webim.widget("buddy",{
        _init: function(){
                var self = this, element = self.element, options = self.options;
                if(!element){
                        element = self.element = $(tpl(options.template)).addClass(self.widgetClassName);
                }
                self.template_li = $(options.template_li);
                self.ul = element.find("ul:first");
                self.groups = {
                };
                var ui = self.ui = {
                        online: element.find(".webim-buddy-online"),
                        offline: element.find(".webim-buddy-offline"),
                        search: element.find(".webim-buddy-search"),
                        empty: element.find(".webim-buddy-empty")
                };
                ui.searchInput = ui.search.children("input");
                self.li = {};
                self._count = 0;
                self._initEvents();
        },
        _initEvents: function(){
                var self = this, ui = self.ui, search = ui.search, input = ui.searchInput, placeholder = i18n("search buddy"), activeClass = "ui-state-active";
                search.children("em").click(function(){
                        input.focus();
                });
                input.val(placeholder).focus(function(){
                        search.addClass(activeClass);
                        if(this.value == placeholder)this.value = "";
                }).blur(function(){
                        search.removeClass(activeClass);
                        if(this.value == "")this.value = placeholder;
                });
                input.bind("keyup", function(e){
                        var list = self.ul.find("ul li");
                        list.show();
                        if (this.value){
                                list.not(":contains('" + this.value + "')").hide();
                        }
                });
                ui.online.children("a").click(function(){
                        self.trigger("online");
                        return false;
                }).hover(_hoverCss, _outCss);
                ui.offline.children("a").click(function(){
                        self.trigger("offline");
                        return false;
                });

        },
        _titleCount: function(){
                var self = this, _count = self._count, win = self.window, empty = self.ui.empty, element = self.element;
                win && win.title(i18n("chat") + "(" + (_count ? _count : "0") + ")");
                if(!_count){
                        empty.show();
                }else{
                        empty.hide();
                }
                if(_count > 8){
                        self.scroll(true);
                }else{
                        self.scroll(false);
                }
        },
        scroll:function(is){
                this.element.toggleClass("webim-buddy-scroll", is);
        },
        _time:null,
        _titleBuddyOnline: function(name){
                var self = this, win = self.window;
                if(!name) name = "";
                win && win.title(subVisibleLength(name, 0, 8) + " " + i18n("online"));
                if(self._time) clearTimeout(self._time);
                self._time = setTimeout(function(){
                        self._titleCount();
                }, 5000);
        },
        _title: function(type){
                var win = this.window;
                if(win){
                        win.title(i18n("chat") + "[" + i18n(type) + "]");
                }
        },
        notice: function(type, nameOrCount){
                var self = this;
                switch(type){
                        case "buddyOnline":
                        self._titleBuddyOnline(nameOrCount);
                        break;
                        case "count":
                        self._count = nameOrCount;
                        self._titleCount();
                        break;
                        default:
                        self._title(type);
                }
        },
        online: function(){
                var self = this, ui = self.ui, win = self.window;
                self.notice("connect");
                ui.online.hide();
                ui.offline.show();
        },
        offline: function(){
                var self = this, ui = self.ui, win = self.window;
                self.notice("offline");
                ui.online.show();
                ui.offline.hide();
                ui.empty.hide();
                self.scroll(false);
                self.removeAll();
        },
        _updateInfo:function(el, info){
                el.find("strong").html(info.name);
                el.find("span").html(info.status);
                el.find("img").attr("src", info.pic_url);
                el.find("a").attr("href", info.url);
                return el;
        },
        _handler: function(e){
                e.preventDefault();
                var d = e.data;
                d.self.trigger("select", [d.data]);
                this.blur();
        },
        _addOne:function(info){
                var self = this, li = self.li, id = info.id, event = self.options.event;
                if(!li[id]){
                        var el = li[id] = self.template_li.clone();
                        self._updateInfo(el, info);
                        var a = el.children('a').bind(event + ".buddy",{self: self, data: info}, self._handler);
                        if(event != 'click')
                                a.bind('click', returnFalse);

                        var groups = self.groups, group_name = i18n(info["group"] || "friend"), group = groups[group_name];
                        if(!group){
                                var g_el = $(self.options.template_g).hide().appendTo(self.ul);
                                group = {
                                        name: group_name,
                                        el: g_el,
                                        count: 0,
                                        title: g_el.children("h4"),
                                        li: g_el.children("ul")
                                };
                                self.groups[group_name] = group;
                        }
                        if(group.count == 0) group.el.show();
                        el.data("group",group);
                        group.li.append(el);
                        group.count++;
                        group.title.html(group_name + "("+ group.count+")");
                }
        },
         _updateOne:function(info){
                var self = this, li = self.li, id = info.id;
                li[id] && self._updateInfo(li[id], info);
        },
        update: function(data, index){
                data = $.makeArray(data);
                for(var i=0; i < data.length; i++){
                        this._updateOne(data[i]);
                }
        },
        add: function(data, index){
                data = $.makeArray(data);
                for(var i=0; i < data.length; i++){
                        this._addOne(data[i]);
                }
        },
        removeAll: function(){
                var ids = [], li = this.li;
                for(var k in li){
                        ids.push(k);
                }
                this.remove(ids);
        },
        remove: function(ids){
                var id, el, li = this.li, group;
                ids = idsArray(ids);
                for(var i=0; i < ids.length; i++){
                        id = ids[i];
                        el = li[id];
                        if(el){
                                group = el.data("group");
                                if(group){
                                        group.count --;
                                        if(group.count == 0)group.el.hide();
                                        group.title.html(group.name + "("+ group.count+")");
                                }
                                el.remove();
                                delete(li[id]);
                        }
                }
        },
        select: function(id){
                var self = this, el = self.li[id], event = self.options.event;
                el && el.trigger(event + ".buddy");
                return el;
        },
        destroy: function(){
        }
});
webim.ui.buddy.defaults = {
        event:'click',
        template: '<div id="webim-buddy">\
                        <div class="webim-buddy-online"><a class="ui-state-default ui-corner-all" href="#online">{{online}}</a></div>\
                        <div class="webim-buddy-search ui-state-default ui-corner-all"><em class="ui-icon ui-icon-search"></em><input type="text" value="" /></div>\
                        <div class="webim-buddy-content">\
                                <div class="webim-buddy-empty">{{empty buddy}}</div>\
                                <div class="webim-buddy-offline"><a href="#offline">{{offline}}</a></div>\
                                <ul></ul>\
                        </div>\
                  </div>',
        template_g: '<li><h4 class="ui-state-default">{{title}}({{count}})</h4><ul></ul></li>',
        template_li: '<li title=""><a href="{{link}}" rel="{{id}}" class="ui-helper-clearfix"><img width="25" src="about:blank"/><strong>{{name}}</strong><span>{{status}}</span></a></li>'
};
