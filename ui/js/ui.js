//
//
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
	var elements = obj.getElementsByTagName("*"), el, id, need = {};
	for(var i = elements.length -1; i > -1; i--){
		el = elements[i];
		id = el.id;
		if(id)need[id.replace("webim-","")] = el;
	}
	return need;
}
function createElement(str){
	var el = document.createElement("div");
	el.innerHTML = trim(str);
	return el.firstChild;
}
var _widgetId = 1;
function widget(name,defaults, prototype){
	var m = function(element, options){
		var self = this;
		self.id = _widgetId++;
		self.name = name;
		self.className = "webim-" + name;
		self.options = extend({}, m['defaults'], options);
		isFunction(self._init) && self._init();
	};
	m.defaults = defaults// default options;
	// add prototype
	extend(m.prototype, widget.prototype, prototype);
	webimUI[name] = m;
}

extend(widget.prototype, {
	_init: function(){
	}
});

var webimUI = {
	version:"@VERSION"
}
webim.ui = webimUI;
//
/* webim:
 *
 options:
 attributes：
 layout  //ui layout
 connection // connection
 config //save parameters in the server
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
extend(webim.prototype, objectExtend, {
        _init:function(element,options){
                speedUp("im");
                var self = this;
                options = self.options = extend({}, webim.defaults, options);
                if(!element){
                        element = $(tpl(options.template));
                }
                element = self.element = $(element);
                self.data = {
                        user:{}
                };
                self.onlineIdsHash = {};
                self.status = webim.status;
                speedUp("status");
                self.status.init();
                speedDown("status");
                speedUp("layout");
                self.layout = new webim.layout.webapi(element.find(".webim-layout"), {
                });//
                speedDown("layout");
                self.layout.element.appendTo(element);
                self.connection = new webim.comet(null,{jsonp: true});
                self.notification = new webim.notification();
                self.config = webim.config;
                self.buddy = new webim.buddy();
                self.history = new webim.history();
                speedUp("iminitEvent");
                self._initEvents();
                speedDown("iminitEvent");
                speedDown("im");
        },
        initSound: function(urls){
                soundNotce.init(urls || this.options.soundUrls);
        },
        _initEvents: function(){
                return;
                var im = this, layout = im.layout, buddy = im.buddy, history = im.history, connection = im.connection, status = im.status, isOffline = status("o"), config = im.config;
speedUp("buddyUI");
                var buddyUI = new webim.ui.buddy(null);
speedDown("buddyUI");                
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
                speedUp("apps");
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
                var configUI = new webim.ui.config(null);
                configUI.bind("change",function(e, key, val){
                        im._updateConfig(key, val);
                });
                layout.addApp(configUI, {
                        title: i18n("config"),
                        icon: "config",
                        sticky: false,
                        onlyIcon: true,
                        isMinimize: true
                });
                speedDown("apps");
                speedUp("config.tag");
                each(config.all, function(k,v){
                        configUI.check_tag(k, v);
                        im._updateConfig(k, v, true);
                });
                speedDown("config.tag");
                speedUp("bind");
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
                                c && config("msg_auto_pop") && !layout.activeTabId && layout.focusChat(id);
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
                        configUI.check_tag("minimize_layout", true);
                });
                layout.bind("expand", function(e, type){
                        im._updateConfig("minimize_layout", false);
                        configUI.check_tag("minimize_layout", false);
                });
                ///notification
                im.notification.bind("data",function(e, data){
                        notificationUI.window.notifyUser("information", "+" + data.length);
                        notificationUI.add(data);
                });
                speedDown("bind");
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
                var im = this, layout = im.layout, buddy = im.buddy, history = im.history, connection = im.connection, status = im.status, isOffline = status("o"), config = im.config, configUI = layout.app("config"), buddyUI = layout.app("buddy"), data = im.data;

                //model init
                webim.date.init(data.server_time);
                connection.connect(data.connection);
                config.init(data.setting);
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
                each(config.all,function(k,v){
                        configUI.check_tag(k, v);
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
                if(!is_init)self.config(name,value);
        },
        handle:function(data){
                var self = this;
                if(data.messages.length)
                self.trigger("message",[data.messages]);
                if(data.presences.length)
                self.trigger("presence",[data.presences]);
                if(data.statuses.length)
                self.trigger("status",[data.statuses]);
        },
        sendMsg: function(msg){
                var self = this;
                msg.ticket = self.data.connection.ticket;
                ajax({
                        type: 'post',
                        url: self.options.urls.message,
                        type: 'post',
                        cache: false,
                        data: msg
                });
        },
        sendStatus: function(msg){
                var self = this;
                msg.ticket = self.data.connection.ticket;
                ajax({
                        type: 'post',
                        url: self.options.urls.status,
                        type: 'post',
                        cache: false,
                        data: msg
                });
        },
//        online_list:function(){
//                var self = this;
//                ajax({
//                        type:"post",
//                        dataType: "json",
//                        url: self.options.urls.online_list,
//                        success: function(data){
//                                self.trigger("online_list", [data]);
//                        },
//                        error: function(data){
//                                log(data, "online:error");
//                        }
//                });
//
//        },
        setStranger: function(ids){
                this.stranger_ids = idsArray(ids);
        },
        stranger_ids:[],
        online:function(){
                var self = this, status = self.status, ids = idsArray(status("tabIds"));
                status("o", false);
                self.ready();
                ajax({
                        type:"post",
                        dataType: "json",
                        data:{
                                buddy_ids: ids.join(","),
                                stranger_ids: self.stranger_ids.join(",")
                        },
                        url: self.options.urls.online,
                        success: function(data){
                        		if(!data || !data.user || !data.connection){
                        			
                        			self.stop(null, "online error");
                                	log(data, "online:error");
                        		}else{
                        			data.user = extend(self.data.user, data.user);
                                	self.data = data;
                                	self.go();
                        		}
                                
                        },
                        error: function(data){
                                self.stop(null, "online error");
                                log(data, "online:error");
                        }
                });

        },
        offline:function(){
                var self = this, data = self.data;
                self.status("o", true);
                self.connection.close();
                self.layout.removeAllChat();
                self.stop();
                ajax({
                        type: 'post',
                        url: self.options.urls.offline,
                        type: 'post',
                        cache: false,
                        data: {
                                status: 'offline',
                                ticket: data.connection.ticket
                        }
                });
 
        },
        refresh:function(){
                var self = this, data = self.data;
                if(!data || !data.connection || !data.connection.ticket) return;
                ajax({
                        type: 'post',
                        url: self.options.urls.refresh,
                        type: 'post',
                        cache: false,
                        data: {
                                ticket: data.connection.ticket
                        }
                });
        }

});

webim.defaults.template = '<div id="webim" class="webim">\
                    <div class="webim-preload ui-helper-hidden-accessible">\
                    <div id="webim-flashlib-c">\
                    </div>\
                    </div>\
<div id="webim-layout" class="webim-layout webim-webapi"><div class="webim-ui ui-helper-clearfix  ui-toolbar">\
                            <div class="webim-shortcut">\
                            </div>\
                            <div class="webim-layout-r">\
                            <div class="webim-panels">\
                                <div class="webim-window-tab-wrap ui-widget webim-panels-next-wrap">\
                                            <div class="webim-window-tab webim-panels-next ui-state-default">\
                                                    <div class="webim-window-tab-count">\
                                                            0\
                                                    </div>\
                                                    <em class="ui-icon ui-icon-triangle-1-w"></em>\
                                                    <span>0</span>\
                                            </div>\
                                </div>\
                                <div class="webim-panels-tab-wrap">\
                                        <div class="webim-panels-tab">\
                                        </div>\
                                </div>\
                                <div class="webim-window-tab-wrap ui-widget webim-panels-prev-wrap">\
                                            <div class="webim-window-tab webim-panels-prev ui-state-default">\
                                                    <div class="webim-window-tab-count">\
                                                            0\
                                                    </div>\
                                                    <span>0</span>\
                                                    <em class="ui-icon ui-icon-triangle-1-e"></em>\
                                            </div>\
                                </div>\
                                <div class="webim-window-tab-wrap webim-collapse-wrap ui-widget">\
                                            <div class="webim-window-tab webim-collapse ui-state-default" title="<%=collapse%>">\
                                                    <em class="ui-icon ui-icon-circle-arrow-e"></em>\
                                            </div>\
                                </div>\
                                <div class="webim-window-tab-wrap webim-expand-wrap ui-widget">\
                                            <div class="webim-window-tab webim-expand ui-state-default" title="<%=expand%>">\
                                                    <em class="ui-icon ui-icon-circle-arrow-w"></em>\
                                            </div>\
                                </div>\
                            </div>\
                            <div class="webim-apps">\
                            </div>\
                            </div>\
            </div></div>\
                    </div>';
