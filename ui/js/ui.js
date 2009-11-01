/* webim UI:
*
* options:
* attributes:
* 	im
* 	layout
* 	setting
* 	buddy
* 	notification
* 	menu
*
* methods:
*
* events:
*
*/

function webimUI(element, options){
	var self = this;
	self.element = element;
	self.options = extend({}, webimUI.defaults, options);
	self._init();
}
extend(webimUI.prototype, objectExtend, {
	_init:function(){
		var self = this,
		layout = self.layout = new webimUI.layout(),
		im = self.im = new webim();
		options = self.options;
		self.notification = new webimUI.notification();
		self.setting = new webimUI.setting(null,{
			data: im.setting.data
		});
		self.buddy = new webimUI.buddy(null,{
		});
		var menu = [{"title":"doing","icon":"image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"album","icon":"image\/app\/album.gif","link":"space.php?do=album"},{"title":"blog","icon":"image\/app\/blog.gif","link":"space.php?do=blog"},{"title":"thread","icon":"image\/app\/mtag.gif","link":"space.php?do=thread"},{"title":"share","icon":"image\/app\/share.gif","link":"space.php?do=share"}];
		self.menu = new webimUI.menu(null,{
			data: menu
		});
					    //render start
		layout.addApp(self.menu, {
			title: i18n("menu"),
			icon: "home",
			sticky: false,
			onlyIcon: false,
			isMinimize: true
		},"shortcut");
		layout.addShortcut(menu);
		layout.addApp(self.buddy, {
			title: i18n("chat"),
			icon: "buddy",
			className: "webim-buddy-window",
			//       onlyIcon: true,
			isMinimize: !im.status.get("b"),
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
		self.buddy.offline();
		document.body.appendChild(layout.element);
		layout.buildUI();

		//render end

		self._initEvents();
	},
	initSound: function(urls){
		sound.init(urls || this.options.soundUrls);
	},
	_initEvents: function(){
		var self = this, im = self.im, buddy = im.buddy, history = im.history, status = im.status, setting = im.setting, buddyUI = self.buddy, layout = self.layout, notificationUI = self.notification, settingUI = self.setting;
		//im events
		im.bind("ready",function(){
			buddyUI.online();
		}).bind("go",function(data){
			layout.option("userInfo", data.user);
			date.init(data.server_time);
			self._initStatus();
			!buddyUI.window.isMinimize() && buddy.loadDelay();
			buddyUI.notice("count", buddy.count({presence:"online"}));
			setting.set(data.setting);
		}).bind("stop", function(type){
			type == "offline" && layout.removeAllChat();
			layout.updateAllChat();
			buddyUI.offline();
			type && buddyUI.notice(type);
		});
		//setting events
		setting.bind("update",function(key, val){
			switch(key){
				case "buddy_sticky": buddyUI.window.option("sticky", val);break;
				case "play_sound": (val ? sound.enable() : sound.disable() ); break;
				case "msg_auto_pop": layout.option("chatAutoPop", val); break;
				case "minimize_layout": 
					(val ? layout.collapse() : layout.expand()); 
				break;
			}
			settingUI.check_tag(key, val);
		});
		settingUI.bind("change",function(key, val){
			setting.set(key, val);
		});
		layout.bind("collapse", function(){
			setting.set("minimize_layout", true);
		});
		layout.bind("expand", function(){
			setting.set("minimize_layout", false);
		});

		//display status
		layout.bind("displayUpdate", function(e){
			self._updateStatus(); //save status
		});

		//buddy events

		//select a buddy
		buddyUI.bind("select", function(info){
			log(info, "buddyUI.select");
			self.addChat(info.id);
			layout.focusChat(info.id);
		}).bind("offline",function(){
			im.offline();
		}).bind("online",function(){
			im.online();
		});
		buddyUI.window.bind("displayStateChange",function(type){
			if(type != "minimize")buddy.loadDelay();
		});
		//some buddies online.
		buddy.bind("online", function(data){
			log(data, "buddy.online");
			buddyUI.add(data);
			layout.updateChat(data);
			buddyUI.notice("count", buddy.count({presence:"online"}));
		});
		buddy.bind("onlineDelay", function(data){
			log(data, "buddy.onlineDelay");
			buddyUI.notice("count", buddy.count({presence:"online"}));
		});

		//some buddies offline.
		var mapId = function(a){ return isObject(a) ? a.id : a };
		buddy.bind("offline", function(data){
			log(data, "buddy.offline");
			buddyUI.remove(map(data, mapId));
			layout.updateChat(data);
			buddyUI.notice("count", buddy.count({presence:"online"}));
		});
		//some information has been modified.
		buddy.bind("update", function(data){
			log(data, "buddy.update");
			buddyUI.update(data);
			layout.updateChat(data);
		});

		//all ready.
		//message
		im.bind("message",function(data){
			log(data,"message");
			var show = false, l = data.length, d, uid = im.data.user.id, id, c, online_ids = [], count = "+1";
			for(var i = 0; i < l; i++){
				d = data[i];
				id = d.to == uid ? d.from : d.to;
				if(!d["new"])online_ids.push(id);
				c = layout.chat(id);
				c && c.status("");//clear status
				if(!c){	
					self.addChat(id);
					c = layout.chat(id);
				}
				c && setting.get("msg_auto_pop") && !layout.activeTabId && layout.focusChat(id);
				c.window.notifyUser("information", count);
				var p = c.window.pos;
				(p == -1) && layout.setNextMsgNum(count);
				(p == 1) && layout.setPrevMsgNum(count);
				if(d.to == uid && d.from != uid)show = true;
			}
			if(show){
				sound.play('msg');
				titleShow(i18n("new message"), 5);
			}
			history.handle(data);
			buddy.online(online_ids, 1);
		});
		function grepOffline(msg){
			return msg.type == "offline";
		}
		function grepOnline(msg){
			return msg.type == "online";
		}
		function mapFrom(a){ return a.from; }

		im.bind("presence",function(data){
			log(data,"presence");
			offline = grep(data, grepOffline);
			online = grep(data, grepOnline);
			buddy.online(map(online, mapFrom), buddyUI.window.isMinimize());
			buddy.offline(map(offline, mapFrom));
			online.length && buddyUI.notice("buddyOnline", online.pop()["nick"]);
		});
		im.bind("status",function(data){
			log(data,"status");
			each(data,function(n,msg){
				var userId = im.data.user.id;
				var id = msg['from'];
				if (userId != msg.to && userId != msg.from) {
					id = msg.to; //群消息
					var nick = msg.nick;
				}else{
					var c = layout.chat(id);
					c && c.status(msg['show']);
				}
			});
		});
				//for test
		history.bind("data", function( id, data){
			var c = layout.chat(id), count = "+" + data.length;
			if(c){
				c.history.add(data);
			}
			//(c ? c.history.add(data) : im.addChat(id));
		});
		history.bind("clear", function( id){
			var c = layout.chat(id);
			c && c.history.clear();
		});

		///notification
		im.notification.bind("data",function( data){
			notificationUI.window.notifyUser("information", "+" + data.length);
			notificationUI.add(data);
		});

		return;
		setTimeout(function(){
			im.notification.load();
		}, 2000);
	},
	__status: false,
	_initStatus: function(){
		var self = this, layout = self.layout;
		if(self.__status)return layout.updateAllChat();
		// status start
		self.__status = true;
		var status = self.im.status,
		tabs = status.get("tabs"), 
		tabIds = status.get("tabIds"),
		//prev num
		p = status.get("p"), 
		//focus tab
		a = status.get("a");

		tabIds && tabIds.length && tabs && each(tabs, function(k,v){
			self.addChat(k, null,{ isMinimize: true});
			layout.chat(k).window.notifyUser("information", v["n"]);
		});
		p && (layout.prevCount = p) && layout._fitUI();
		a && layout.focusChat(a);
		// status end
	},
	addChat: function(id, options, winOptions){
		var self = this, layout = self.layout, im = self.im, history = self.im.history, buddy = self.im.buddy;
		var h = history.get(id), info = buddy.get(id);
		var buddyInfo = info || {id:id, name: id};
		layout.addChat(buddyInfo, extend({history: h}, options), winOptions);
		if(!info) buddy.update(id);
		if(!h) history.load(id);
		layout.chat(id).bind("sendMsg", function(msg){
			im.sendMsg(msg);
			history.handle(msg);
			log(msg, "sendMsg");
		}).bind("sendStatus", function(msg){
			im.sendStatus(msg);
			log(msg, "sendStatus");
		}).bind("clearHistory", function(buddyInfo){
			history.clear(buddyInfo.id);
			log(buddyInfo, "clearHistory");
		});
	},
	_updateStatus: function(){
		var self = this, layout = self.layout, _tabs = {};
		each(layout.tabs, function(n, v){
			_tabs[n] = {
				n: v._count()
			};
		});
		var d = {
			//o:0, //has offline
			tabs: _tabs, // n -> notice count
			tabIds: layout.tabIds,
			p: layout.prevCount, //tab prevCount
			a: layout.activeTabId, //tab activeTabId
			b: layout.app("buddy").window.isMinimize() ? 0 : 1 //is buddy open
		}
		self.im.status.set(d);
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
		return dic && dic[b] !=undefined ? dic[b] : i18n(b);
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

/*
* widget
* options:
* 	template
* 	className
*
* attributes:
* 	id
* 	name
* 	className
* 	element
* 	$
*
* methods:
* 	template
*
*/
var _widgetId = 1;
function widget(name, defaults, prototype){
	function m(element, options){
		var self = this;
		self.id = _widgetId++;
		self.name = name;
		self.className = "webim-" + name;
		self.options = extend({}, m['defaults'], options);

		//template
		self.element = element || (self.template && createElement(self.template())) || ( self.options.template && createElement(tpl(self.options.template)));
		if(self.element){
			self.options.className && addClass(self.element, self.options.className);
			self.$ = mapElements(self.element);
		}
		isFunction(self._init) && self._init();
		//isFunction(self._initEvents) && setTimeout(function(){self._initEvents()}, 0);
		isFunction(self._initEvents) && self._initEvents();
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
	plugin: plugin,
	i18n: i18n
});
webim.ui = webimUI;

