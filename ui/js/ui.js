//
//
//
/* webim:
 *
 options:
 attributes：
 layout  //ui layout
 connection // connection
 setting //save parameters in the server
 status //save parameters in the local
 buddy
 history

 methods:

 online() //get data for start.
 offline()
 handle(data)
 sendMsg(msg)
 sendStatus(msg)
 refresh()
 destroy()

 events: 

 ready
 go
 stop

 message
 presence
 status

 inherit events:
 ui.chat{
         sendMsg
         sendStatus
         clearHistory
 }


 */
    

function grepOffline(msg){
        return msg.type == "offline";
}
function grepOnline(msg){
        return msg.type == "online";
}
var webimUI = webim.ui = function(element, options){
	var self = this;
	self.element = element;
        self.options = extend({}, webimUI.defaults, options);
	self._init();
}
extend(webimUI.prototype, objectExtend, {
        _init:function(){
                var self = this;
		options = self.options;
		var layout = self.layout = new webimUI.layout();
                self.notification = new webimUI.notification();
                self.setting = new webimUI.setting();
                self.buddy = new webimUI.buddy();
                self.menu = new webimUI.menu();
		//render start
		layout.addApp(self.menu, {
			title: i18n("menu"),
			icon: "home",
			sticky: false,
			onlyIcon: false,
			isMinimize: true
		},"shortcut");
                layout.addApp(self.buddy, {
                        title: i18n("chat"),
                        icon: "buddy",
                        className: "webim-buddy-window",
                 //       onlyIcon: true,
                        //isMinimize: isOffline || !status("b"),
                        titleVisibleLength: 19
                });
                layout.addApp(self.notification, {
                        title: i18n("notification"),
                        icon: "notification",
                        sticky: false,
                        onlyIcon: true,
                        isMinimize: true
                });
                layout.addApp(self.setting, {
                        title: i18n("setting"),
                        icon: "setting",
                        sticky: false,
                        onlyIcon: true,
                        isMinimize: true
                });

		document.body.appendChild(layout.element);
		for(var i = 1; i < 7; i++){
			layout.addChat({id:i, name: "11"}, {}, {});
		}
		layout.buildUI();

		//render end
                //self.layout.element.appendTo(element);
                //self._initEvents();
        },
        initSound: function(urls){
                soundNotce.init(urls || this.options.soundUrls);
        },
        _initEvents: function(){
                return;
                var im = this, layout = im.layout, buddy = im.buddy, history = im.history, connection = im.connection, status = im.status, isOffline = status("o"), setting = im.setting;
                var buddyUI = new webim.ui.buddy(null);
                connection.bind("connect",function(e, data){
                        log(data, "connect");
                }).bind("data",function(e, data){
                        im.handle(data);
                }).bind("error",function(e, data){
                        im.stop(e, "connect error");
                        log(data, "connect:error");
                }).bind("close",function(e, data){
                        im.stop(e, "disconnect");
                        log(data, "connect:close");
                });
                layout.addApp(buddyUI, {
                        title: i18n("chat"),
                        icon: "buddy",
                        className: "webim-buddy-window",
                        titleVisibleLength: 19,
                 //       onlyIcon: true,
                        isMinimize: isOffline || !status("b")
                });
                (isOffline ? buddyUI.offline() : buddyUI.online());

                var notificationUI = new webim.ui.notification(null);
                layout.addApp(notificationUI, {
                        title: i18n("notification"),
                        icon: "notification",
                        sticky: false,
                        onlyIcon: true,
                        isMinimize: true
                });
                var settingUI = new webim.ui.setting(null);
                settingUI.bind("change",function(e, key, val){
                        im._updateConfig(key, val);
                });
                layout.addApp(settingUI, {
                        title: i18n("setting"),
                        icon: "setting",
                        sticky: false,
                        onlyIcon: true,
                        isMinimize: true
                });
                each(setting.all, function(k,v){
                        settingUI.check_tag(k, v);
                        im._updateConfig(k, v, true);
                });
                //select a buddy
                buddyUI.bind("select", function(e, info){
                        log(info, "buddyUI.select");
                        im.addChat(info.id);
                        layout.focusChat(info.id);
                }).bind("offline",function(){
                        im.offline();
                }).bind("online",function(){
                        im.online();
                });
                buddyUI.window.bind("displayStateChange",function(e, type){
                        if(type != "minimize")buddy.loadDelay();
                });
                //some buddies online.
                buddy.bind("online", function(e, data){
                        log(data, "buddy.online");
                        buddyUI.add(data);
                        layout.updateChat(data);
                        buddyUI.notice("count", buddy.count({presence:"online"}));
                });
                buddy.bind("onlineDelay", function(e, data){
                        log(data, "buddy.onlineDelay");
                        buddyUI.notice("count", buddy.count({presence:"online"}));
                });
                //some buddies offline.
                buddy.bind("offline", function(e, data){
                        log(data, "buddy.offline");
                        buddyUI.remove(map(data, mapId));
                        layout.updateChat(data);
                        buddyUI.notice("count", buddy.count({presence:"online"}));
                });
                //some information has been modified.
                buddy.bind("update", function(e, data){
                        log(data, "buddy.update");
                        buddyUI.update(data);
                        layout.updateChat(data);
                });

                //all ready.
                //message
                im.bind("message",function(e,data){
                        log(data,"message");
                        var show = false, l = data.length, d, uid = im.data.user.id, id, c, online_ids = [], count = "+1";
                        for(var i = 0; i < l; i++){
                                d = data[i];
                                id = d.to == uid ? d.from : d.to;
                                if(!d["new"])online_ids.push(id);
                                c = layout.chat(id);
                                c && c.status("");//clear status
                                if(!c){	
                                		im.addChat(id);
                                		c = layout.chat(id);
                                }
                                c && setting("msg_auto_pop") && !layout.activeTabId && layout.focusChat(id);
                                c.window.notifyUser("information", count);
                                var p = c.window.pos;
                                (p == -1) && layout.setNextMsgNum(count);
                                (p == 1) && layout.setPrevMsgNum(count);
                                if(d.to == uid && d.from != uid)show = true;
                        }
                        if(show){
                                soundNotce.play('msg');
                                winNotice.show(i18n("new message"), 5);
                        }
                        history.handle(data);
                        buddy.online(online_ids, 1);
                });
                im.bind("presence",function(e,data){
                        log(data,"presence");
                        offline = grep(data, grepOffline);
                        online = grep(data, grepOnline);
                        buddy.online(map(online, mapFrom), buddyUI.window.isMinimize());
                        buddy.offline(map(offline, mapFrom));
                        online.length && buddyUI.notice("buddyOnline", online.pop()["nick"]);
                });
                im.bind("status",function(e,data){
                        log(data,"status");
                	each(data,function(n,msg){
                                var userId = im.data.user.id;
            		        var id = msg['from'];
            		        if (userId != msg.to && userId != msg.from) {
            		        	id = msg.to; //群消息
                	        	var nick = msg.nick;
            		        }else{
            				var c = im.layout.chat(id);
                                	c && c.status(msg['show']);
                                }
                        });
                });
                im.bind("sendMsg", function(e, msg){
                        im.sendMsg(msg);
                        history.handle(msg);
                        log(msg, "sendMsg");
                });
                im.bind("sendStatus", function(e, msg){
                        im.sendStatus(msg);
                        log(msg, "sendStatus");
                });
                im.bind("clearHistory", function(e, buddyInfo){
                        history.clear(buddyInfo.id);
                        log(buddyInfo, "clearHistory");
                });
                //for test
                history.bind("data", function(e, id, data){
                        var c = layout.chat(id), count = "+" + data.length;
                        if(c){
                                c.history.add(data);
                        }
                        //(c ? c.history.add(data) : im.addChat(id));
                });
                history.bind("clear", function(e, id){
                        var c = layout.chat(id);
                        c && c.history.clear();
                });

                layout.bind("displayUpdate", function(e){
                        im._updateStatus(); //save status
                });
                layout.bind("collapse", function(e, type){
                        im._updateConfig("minimize_layout", true);
                        settingUI.check_tag("minimize_layout", true);
                });
                layout.bind("expand", function(e, type){
                        im._updateConfig("minimize_layout", false);
                        settingUI.check_tag("minimize_layout", false);
                });
                ///notification
                im.notification.bind("data",function(e, data){
                        notificationUI.window.notifyUser("information", "+" + data.length);
                        notificationUI.add(data);
                });
                setTimeout(function(){
                        im.notification.load();
                }, 2000);
        },
        _unloadFun: null,
        ready: function(){
                var im = this, layout = im.layout, buddyUI = layout.app("buddy");
                im._unloadFun = window.onbeforeunload;
                window.onbeforeunload = function(){
                        im.refresh();
                };
                buddyUI.online();
                im.trigger("ready");
        },
        _initStatus: false,
        go: function(){
                var im = this, layout = im.layout, buddy = im.buddy, history = im.history, connection = im.connection, status = im.status, isOffline = status("o"), setting = im.setting, settingUI = layout.app("setting"), buddyUI = layout.app("buddy"), data = im.data;

                //model init
                webim.date.init(data.server_time);
                connection.connect(data.connection);
                setting.init(data.setting);
                history.option("userInfo", data.user);
                layout.option("userInfo", data.user);
                //model handle
                //
                buddy.handle(data.buddies);
                history.init(data.histories);
                buddy.online(data.buddy_online_ids, buddyUI.window.isMinimize());
                //ui start
                buddyUI.notice("count", buddy.count({presence:"online"}));
                if(data.setting)
                each(setting.all,function(k,v){
                        settingUI.check_tag(k, v);
                        im._updateConfig(k, v, true);
                });
                if(!im._initStatus){
                // status start
                        im._initStatus = true;
                        var tabs = status("tabs"), tabIds = status("tabIds");
                        var p = status("p"), a = status("a");
                        if(tabIds && tabIds.length && tabs){
                                each(tabs, function(k,v){
                                        im.addChat(k, null,{ isMinimize: true});
                                        layout.chat(k).window.notifyUser("information", v["n"]);
                                });
                        }
                        p && (layout.prevCount = p) && layout._fitUI();
                        a && layout.focusChat(a);
                // status end
                }
                else
                layout.updateAllChat();
                var n_msg = data.new_messages;
                if(n_msg && n_msg.length)
                im.trigger("message",[n_msg]);
                //ui end
                log(data.user);
                im.trigger("go");

        },
        stop: function(e, msg){
                var im = this, layout = im.layout;
                window.onbeforeunload = im._unloadFun;
                im.data.user.presence = "offline";
                layout.updateAllChat();
                im.buddy.clear();
                layout.app("buddy").offline();
                if(msg)layout.app("buddy").notice(msg);
                im.trigger("stop", msg);
        },
        addChat: function(id, options, winOptions){
                var self = this, layout = self.layout, history = self.history, buddy = self.buddy;
                        var h = history.get(id), info = buddy.get(id);
                        var buddyInfo = info || {id:id, name: id};
                        layout.addChat(buddyInfo, extend({history: h}, options), winOptions);
                        if(!info) buddy.update(id);
                        if(!h) history.load(id);
        },
        _updateStatus: function(){
                var self = this, layout = self.layout, _tabs = {};
                each(layout.tabs, function(n, v){
                        _tabs[n] = {
                                n: v._count()
                                };
                });
                var d = {
                        tabs: _tabs, // n -> notice count
                        tabIds: layout.tabIds,
                        p: layout.prevCount, //tab prevCount
                        a: layout.activeTabId, //tab activeTabId
                        b: layout.app("buddy").window.isMinimize() ? 0 : 1 //is buddy open
                        //o:0 //has offline
                }
                self.status(d);
        },
        _updateConfig: function(name, value, is_init){
                var self = this, layout = self.layout;
                switch(name){
                        case "buddy_sticky": layout.app("buddy").window.option("sticky", value);break;
                        case "play_sound": (value ? soundNotce.enable() : soundNotce.disable() ); break;
                        case "msg_auto_pop": layout.option("chatAutoPop", value); break;
                        case "minimize_layout": 
                                (value ? layout.collapse() : layout.expand()); 
                        break;
                }
                if(!is_init)self.setting(name,value);
        }
});

var _countDisplay = function(element, count){
	if (count === undefined){
		return parseInt(element.innerHTML);
	}
	else if (count){
		count = (typeof count == "number") ? count : (parseInt(element.innerHTML) + parseInt(count));
		element.innerHTML = count.toString();
		show(element);
	}
	else {
		element.innerHTML = '0';
		hide(element);
	}
	return count;
};

var keyCode = {
	BACKSPACE: 8,
	CAPS_LOCK: 20,
	COMMA: 188,
	CONTROL: 17,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	INSERT: 45,
	LEFT: 37,
	NUMPAD_ADD: 107,
	NUMPAD_DECIMAL: 110,
	NUMPAD_DIVIDE: 111,
	NUMPAD_ENTER: 108,
	NUMPAD_MULTIPLY: 106,
	NUMPAD_SUBTRACT: 109,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SHIFT: 16,
	SPACE: 32,
	TAB: 9,
	UP: 38
};
function mapElements(obj){
	var elements = obj.getElementsByTagName("*"), el, id, need = {}, pre = ":";
	for(var i = elements.length - 1; i > -1; i--){
		el = elements[i];
		id = el.id;
		if(id && id.indexOf(pre) == 0)need[id.substring(pre.length, id.length)] = el;
	}
	return need;
}
function createElement(str){
	var el = document.createElement("div");
	el.innerHTML = str;
	el = el.firstChild; // release memory in IE ???
	return el;
}
var tpl = (function(){
	var dic = null, re = /\<\%\=(.*?)\%\>/ig;
	function call(a, b){
		return dic && isObject(dic) ? dic[b] : i18n(b);
	}
	return function(str, hash){
		if(!str)return '';
		dic = hash;
		return str.replace(re, call);
	};
})();



var plugin = {
	add: function(module, option, set) {
		var proto = webimUI[module].prototype;
		for(var i in set) {
			proto.plugins[i] = proto.plugins[i] || [];
			proto.plugins[i].push([option, set[i]]);
		}
	},
	call: function(instance, name, args) {
		var set = instance.plugins[name];
		if(!set || !instance.element.parentNode) { return; }

		for (var i = 0; i < set.length; i++) {
			if (instance.options[set[i][0]]) {
				set[i][1].apply(instance.element, args);
			}
		}
	}
};
var _widgetId = 1;
function widget(name, defaults, prototype){
	function m(element, options){
		var self = this;
		self.id = _widgetId++;
		self.name = name;
		self.className = "webim-" + name;
		self.options = extend({}, m['defaults'], options);
		self.element = element || createElement(tpl(self.options.template));
		self.options.className && addClass(self.element, self.options.className);
		self.$ = mapElements(self.element);
		isFunction(self._init) && self._init();
	}
	m.defaults = defaults;// default options;
	// add prototype
	extend(m.prototype, objectExtend, widget.prototype, prototype);
	webimUI[name] = m;
}

extend(widget.prototype, {
	_init: function(){
	}
});

extend(webimUI,{
	version: "@VERSION",
	widget: widget,
	plugin: plugin
});


