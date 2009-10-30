/*!
 * Webim UI v@VERSION
 * http://www.nextim.cn/
 *
 * Copyright (c) 2009 Hidden
 *
 * Date: 
 * Revision: 
 */
(function(window,document,undefined){

function returnFalse(){
	return false;
}
function HTMLEnCode(str)  
{  
	var    s    =    "";  
	if    (str.length    ==    0)    return    "";  
	s    =    str.replace(/&/g,    "&gt;");  
	s    =    s.replace(/</g,        "&lt;");  
	s    =    s.replace(/>/g,        "&gt;");  
	s    =    s.replace(/    /g,        "&nbsp;");  
	s    =    s.replace(/\'/g,      "&#39;");  
	s    =    s.replace(/\"/g,      "&quot;");  
	s    =    s.replace(/\n/g,      "<br />");  
	return    s;  
}
function isUrl(str){
	return /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/.test(str);
}

function subVisibleLength(cont,start,length){
	if(!cont) return cont;
	var l = 0,a =[],c = cont.split(''),ln=c.length;
	for(var i =0;i<ln;i++){
		if(l>=length||l<start)
			break;
		else{
			if(c[i].charCodeAt(0) > 255)l+=2;
			else l++;
			a.push(c[i]);
		}

	}
	return a.join('');
}

function $(id){
	return id ? (id.nodeType ? id : document.getElementById(id)) : null;
}

function hasClass(obj,name){
	return obj && (new RegExp("(^|\\s+)"+name+"(\\s+|$)").test(obj.className));

}
function addClass(obj,name){
	if(!obj)return;
	if(!hasClass(obj,name)){
		obj.className+=" "+name;
	}
}
function removeClass(obj,name){
	obj && (obj.className=obj.className.replace(new RegExp("(^|\\s+)("+name.split(/\s+/).join("|")+")(\\s+|$)","g")," "));
}
function replaceClass(obj,_old, _new){
	obj && (obj.className=obj.className.replace(new RegExp("(^|\\s+)("+_old.split(/\s+/).join("|")+")(\\s+|$)","g")," ") + " " + _new);
}
function hoverClass(obj, name){
	addEvent(obj,"mouseover",function(){
		addClass(this, name);
	});
	addEvent(obj,"mouseout",function(){
		removeClass(this, name);
	});
}
function toggleClass(obj, _old, _new){
	removeClass(obj,_old);
	addClass(obj, _new);
}
function show(obj){
	if(obj && obj.style && obj.style.display=="none"){
		obj.style.display = "";
	}
}
function hide(obj){
	if(obj && obj.style && obj.style.display!="none"){
		obj.style.display = "none";
	}
}
function remove(obj){
	obj && obj.parentNode && (obj.parentNode.removeChild(obj));
}
function addEvent( obj, type, fn ) {
	if ( obj.addEventListener ) {
		obj.addEventListener( type, fn, false );
	} else{
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
		obj.attachEvent( 'on'+type, obj[type+fn] );
	}
}
function removeEvent( obj, type, fn ) {
	if ( obj.addEventListener ) {
		obj.removeEventListener( type, fn, false );
	} else{
		obj.detachEvent( 'on'+type, obj[type+fn] );
		obj[type+fn] = null;
	}
}
function stopPropagation(e){
	if(!e)return;
	e.stopPropagation && e.stopPropagation();
	e.cancelBubble = true;
}
function preventDefault(e){
	if(!e)return;
	e.preventDefault && e.preventDefault();
	e.returnValue = false;
}
function target(event){
	if ( !event.target ) {
		event.target = event.srcElement || document; 
		// Fixes #1925 where srcElement might not be defined either
	}
	// check if target is a textnode (safari)
	if ( event.target.nodeType === 3 ) {
		event.target = event.target.parentNode;
	}
	return event.target;
}

function enableSelection(obj) {
	obj.setAttribute("unselectable","off");
	obj.style.MozUserSelect = '';
	removeEvent(obj,'selectstart', returnFalse);
}
function disableSelection(obj) {
	obj.setAttribute("unselectable","on");
	obj.style.MozUserSelect = 'none';
	addEvent(obj,'selectstart', returnFalse);
}

//document ready
//

function ready(fn){
	// Attach the listeners
	bindReady();
	// If the DOM is already ready
	if ( isReady ) {
		// Execute the function immediately
		fn();
		// Otherwise, remember the function for later
	} else {
		// Add the function to the wait list
		readyList.push( fn );
	}

}

var isReady = false, readyList = [];
function triggerReady() {
	// Make sure that the DOM is not already loaded
	if ( !isReady ) {
		// Remember that the DOM is ready
		isReady = true;

		// If there are functions bound, to execute
		if ( readyList ) {
			// Execute all of them
			var fn, i = 0;
			while ( (fn = readyList[ i++ ]) ) {
				fn();
			}

			// Reset the list of functions
			readyList = null;
		}

	}
}

var readyBound = false;
function bindReady() {
	if ( readyBound ) return;
	readyBound = true;

	// Catch cases where $(document).ready() is called after the
	// browser event has already occurred.
	if ( document.readyState === "complete" ) {
		return triggerReady();
	}

	// Mozilla, Opera and webkit nightlies currently support this event
	if ( document.addEventListener ) {
		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", function() {
			document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
			triggerReady();
		}, false );

		// If IE event model is used
	} else if ( document.attachEvent ) {
		// ensure firing before onload,
		// maybe late but safe also for iframes
		document.attachEvent("onreadystatechange", function() {
			if ( document.readyState === "complete" ) {
				document.detachEvent( "onreadystatechange", arguments.callee );
				triggerReady();
			}
		});

		// If IE and not an iframe
		// continually check to see if the document is ready
		// NOTE: DO NOT CHANGE TO ===, FAILS IN IE.
		if ( document.documentElement.doScroll && window == window.top ) (function() {
			if ( isReady ) {
				return;
			}

			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch( error ) {
				setTimeout( arguments.callee, 0 );
				return;
			}

			// and execute any waiting functions
			triggerReady();
		})();
	}
	// A fallback to window.onload, that will always work
	addEvent( window, "load", triggerReady );
}
//格式化时间输出，消除本地时间和服务器时间差，以计算机本地时间为准
//date.init(serverTime);设置时差
//date()
function date(time){
        var date = (new Date());
        date.setTime(time ? (parseFloat(time) + date.timeSkew) : (new Date()).getTime());
        this.date = date;
};
date.timeSkew = 0;
date.init = function(serverTime){//设置本地时间和服务器时间差
    date.timeSkew = (new Date()).getTime() - parseFloat(serverTime);
};
extend(date.prototype, {
    getTime: function(){
            var date = this.date;
        var hours = date.getHours();
        var ampm = '';
        /*ampm = 'am';
         if (hours >= 12) {
         ampm = 'pm';
         }
         if (hours == 0) {
         hours = 12;
         }
         else
         if (hours > 12) {
         hours -= 12;
         }
         */
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        var timeStr = hours + ':' + minutes + ampm;
        return timeStr;
    },
    getDay: function(showRelative){
            var date = this.date;
        if (showRelative) {
            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);
            var dayMilliseconds = 24 * 60 * 60 * 1000;
            var diff = today.getTime() - date.getTime();
            if (diff <= 0) {
                return i18n('dt:today');
            }
            else 
                if (diff < dayMilliseconds) {
                    return i18n('dt:yesterday');
                }
        }
        return i18n('dt:monthdate', {
                'month': i18n(['dt:january','dt:february','dt:march','dt:april','dt:may','dt:june','dt:july','dt:august','dt:september','dt:october','dt:november','dt:december'][date.getMonth()]),
                'date': date.getDate()
        });
    }
});
var sound = (function(){
        var playSound = true;
        var play = function(url){
            try {
                document.getElementById('webim-flashlib').playSound(url ? url : '/sound/sound.mp3');
            } 
            catch (e){
            }
        };
        var _urls = {
                lib: "sound.swf",
                msg:"sound/msg.mp3"
        };
        return {
                enable:function(){
                        playSound = true;
                },
                disable:function(){
                        playSound = false;
                },
                init: function(urls){
                        extend(_urls, urls);
                        swfobject.embedSWF(_urls.lib + "?_" + new Date().getTime(), "webim-flashlib-c", "100", "100", "9.0.0", null, null, {
                        allowscriptaccess:'always'
                        }, {
                            id: 'webim-flashlib'
                        });
                    
                },
                play: function(type){
                        var url = isUrl(type) ? type : _urls[type];
                        playSound && play(url);
                }
        }
})();


var titleShow = (function(){
	var _showNoti = false;
	addEvent(window,"focus",function(){
		_showNoti = false;
	});
	addEvent(window,"blur",function(){
		_showNoti = true;
	});
	var title = document.title, t = 0, s = false, set = null;
	return  function(msg, time){
		if(!_showNoti) 
			return;
		if(set){
			clearInterval(set);
			t = 0;
			s = false;
		}

		var set = setInterval(function(){
			t++;
			s = !s;
			if (t == time || !_showNoti) {
				clearInterval(set);
				t = 0;
				s = false;
			}
			if (s) {
				document.title = "【" + msg + "】" + title;
			}
			else {
				document.title = title;
			}
		}, 1500);
	}
})();
/*
本地化
i18n.locale = 'zh-CN';//设置本地语言
i18n.store('zh-CN',{bbb:"test"});//添加
i18n(name,args);// 获取
*/
var i18nArgs = {};
var i18nRe = function(a, b){
	return i18nArgs[b] || "";
}
function i18n(name, args, options){
	options = extend({
		locale: i18n.locale
	}, options);
	var dict = i18n.dictionary[options.locale];
	if (!isObject(dict)) 
		dict = {};
	var str = dict[name] === undefined ? name : dict[name];

	if (args) {
		i18nArgs = args;
		for (var key in args) {
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
	extend(dict[locale], data);
};
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


/* webim ui window:
 *
 options:
 attributes：
 active //boolean
 displayState //normal, maximize, minimize

 methods:
 html()
 title(str, icon)
 notifyUser(type,count)  //type in [air.NotificationType.INFORMATIONAL, air.NotificationType.CRITICAL]
 isMinimize()
 isMaximize()
 activate()
 deactivate()
 maximize()
 restore()
 minimize()
 close() //
 height()

 events: 
 //ready
 activate
 deactivate
 displayStateChange
 close
 resize
 move
 */
widget("window", {
        isMinimize: false,
        minimizable:true,
        maximizable:false,
        closeable:true,
        sticky: true,
        titleVisibleLength: 12,
        count: 0, // notifyUser if count > 0
        template:'<div id=":webim-window" class="webim-window ui-widget">\
                                            <div class="webim-window-tab-wrap">\
                                            <div id=":tab" class="webim-window-tab ui-state-default">\
                                            <div class="webim-window-tab-inner">\
                                                    <div id=":tabTip" class="webim-window-tab-tip">\
                                                            <strong id=":tabTipC"><%=tooltip%></strong>\
                                                    </div>\
                                                    <a id=":tabClose" title="<%=close%>" class="webim-window-close" href="#close"><em class="ui-icon ui-icon-close"><%=close%></em></a>\
                                                    <div id=":tabCount" class="webim-window-tab-count">\
                                                            0\
                                                    </div>\
                                                    <em id=":tabIcon" class="webim-icon webim-icon-chat"></em>\
                                                    <h4 id=":tabTitle"><%=title%></h4>\
                                            </div>\
                                            </div>\
                                            </div>\
                                            <div class="webim-window-window">\
                                                    <div id=":header" class="webim-window-header ui-widget-header ui-corner-top">\
                                                            <span id=":actions" class="webim-window-actions">\
                                                                    <a id=":minimize" title="<%=minimize%>" class="webim-window-minimize" href="#minimize"><em class="ui-icon ui-icon-minus"><%=minimize%></em></a>\
                                                                    <a id=":maximize" title="<%=maximize%>" class="webim-window-maximize" href="#maximize"><em class="ui-icon ui-icon-plus"><%=maximize%></em></a>\
                                                                    <a id=":close" title="<%=close%>" class="webim-window-close" href="#close"><em class="ui-icon ui-icon-close"><%=close%></em></a>\
                                                            </span>\
                                                            <h4 id=":headerTitle"><%=title%></h4>\
                                                    </div>\
                                                    <div id=":content" class="webim-window-content ui-widget-content">\
                                                    </div>\
                                            </div>\
                                            </div>'
},
{
	html: function(obj){
		return this.$.content.appendChild(obj);
	},
	_init: function(element, options){
		var self = this, options = self.options, $ = self.$;
		element = self.element;
		element.window = self;
		//$.title = $.headerTitle.add($.tabTitle);
		options.tabWidth && ($.tab.style.width = options.tabWidth + "px");
		self.title(options.title, options.icon);
		!options.minimizable && hide($.minimize);
		!options.maximizable && hide($.maximize);
		if(!options.closeable){
		       	hide($.tabClose);
		       	hide($.close);
		}
		if(options.isMinimize){
			self.minimize();
		}else{
			self.restore();
		}
		if(options.onlyIcon){
			hide($.tabTitle);
		}else{
			remove($.tabTip);
		}
		options.count && self.notifyUser("information", options.count);
		self._initEvents();
		//self._fitUI();
		//setTimeout(function(){self.trigger("ready");},0);
		winManager(self);
	},
	notifyUser: function(type, count){
		var self = this, $ = self.$;
		if(type == "information"){
			if(self.isMinimize()){
				if(_countDisplay($.tabCount, count))addClass($.tab,"ui-state-highlight");
			}
		}
	},
	_count: function(){
		return _countDisplay(this.$.tabCount);
	},
	title: function(title, icon){
		var self = this, $ = self.$, tabIcon = $.tabIcon;
		if(icon){
			if(isUrl(icon)){
				tabIcon.className = "webim-icon";
				tabIcon.style.backgroundImage = "url("+ icon +")";
			}
			else{
				tabIcon.className = "webim-icon webim-icon-" + icon;
			}
		}
		$.tabTipC.innerHTML = title;
		$.tabTitle.innerHTML = subVisibleLength(title, 0, self.options.titleVisibleLength);
		$.headerTitle.innerHTML = title;
	},
	_changeState:function(state){
		var el = this.element, className = state == "restore" ? "normal" : state;
		replaceClass(el, "webim-window-normal webim-window-maximize webim-window-minimize", "webim-window-" + className);
		this.trigger("displayStateChange", [state]);
	},
	active: function(){
		return hasClass(this.element, "webim-window-active");
	},
	activate: function(){
		var self = this;
		if(self.active())return;
		addClass(self.element, "webim-window-active");
		self.trigger("activate");
	},
	deactivate: function(){
		var self = this;
		if(!self.active())return;
		removeClass(self.element, "webim-window-active");
		if(!self.options.sticky) self.minimize();
		self.trigger("deactivate");
	},
	_setVisibile: function(){
		var self = this, $ = self.$;
		addClass($.tab, "ui-state-active");
		self.activate();
		_countDisplay($.tabCount, 0);
		removeClass($.tab, "ui-state-highlight");
	},
	maximize: function(){
		var self = this;
		if(self.isMaximize())return;
		self._setVisibile();
		self._changeState("maximize");
	},
	restore: function(){
		var self = this;
		if(hasClass(self.element, "webim-window-normal"))return;
		self._setVisibile();
		self._changeState("restore");
	},
	minimize: function(){
		var self = this;
		if(self.isMinimize())return;
		removeClass(self.$.tab, "ui-state-active");
		self.deactivate();
		self._changeState("minimize");
	},
	close: function(){
		var self = this;
		self.trigger("close");
		remove(self.element);
	},
	_initEvents:function(){
		var self = this, element = self.element, $ = self.$, tab = $.tab;
		var stop = function(e){
			stopPropagation(e);
			preventDefault(e);
		};
		//resize
		var minimize = function(e){
			self.minimize();
		};
		addEvent($.header, "click", minimize);
		addEvent(tab, "click", function(e){
			if(self.isMinimize())self.restore();
			else self.minimize();
			stop(e);
		});
		hoverClass(tab, "ui-state-hover");
		addEvent(tab,"mousedown",stop);
		disableSelection(tab);

		each(["minimize", "maximize", "close"], function(n,v){
			addEvent($[v], "click", function(e){
				if(!this.disabled)self[v]();
				stop(e);
			});
			addEvent($[v],"mousedown",stop);
		});

	},
	height:function(){
		return this.$.content.offsetHeight;
	},
	_fitUI: function(bounds){
		return;
	},
	isMaximize: function(){
		return hasClass(this.element,"webim-window-maximize");
	},
	isMinimize: function(){
		return hasClass(this.element,"webim-window-minimize");
	}
});
var winManager = (function(){
	var curWin = false;
	var deactivateCur = function(){
		curWin && curWin.deactivate();
		curWin = false;
		return true;
	};
	var activate = function(e){
		var win = this;
		win && win != curWin && deactivateCur() && (curWin = win);
	};
	var deactivate = function(e){
		var win = this;
		win && curWin == win && (curWin = false);
	};
	var register = function(win){
		if(win.active()){
			deactivateCur();
			curWin = win;
		}
		win.bind("activate", activate);
		win.bind("deactivate", deactivate);
	};
	///////////
	addEvent(document,"mousedown",function(e){
		e = target(e);
		var el;
		while(e){
			if(e.id == ":webim-window"){
				el = e;
				break;
			}
			else
				e = e.parentNode;
		}
		if(el){
			var win = el.window;
			win && win.activate();
		}else{
			deactivateCur();
		}
	});
	return function(win){
		register(win);
	}
})();
//
/* webim layout webapi:
 *
 options:
 attributes：

 methods:
 addApp(widget, options)
 addShortcut(title,icon,link, isExtlink)
 chat(id)
 addChat(info, options)
 focusChat(id)
 updateChat(data)
 removeChat(ids)

 online() //
 offline()

 activate(window) // activate a window

 destroy()

 events: 
 displayUpdate //ui displayUpdate

 */

widget("layout",{
        template: '<div id="webim" class="webim">\
                    <div class="webim-preload ui-helper-hidden-accessible">\
                    <div id="webim-flashlib-c">\
                    </div>\
                    </div>\
<div id=":layout" class="webim-layout webim-webapi"><div class="webim-ui ui-helper-clearfix  ui-toolbar">\
                            <div id=":shortcut" class="webim-shortcut">\
                            </div>\
                            <div class="webim-layout-r">\
                            <div id=":panels" class="webim-panels">\
                                <div class="webim-window-tab-wrap ui-widget webim-panels-next-wrap">\
                                            <div id=":next" class="webim-window-tab webim-panels-next ui-state-default">\
                                                    <div id=":nextMsgCount" class="webim-window-tab-count">\
                                                            0\
                                                    </div>\
                                                    <em class="ui-icon ui-icon-triangle-1-w"></em>\
                                                    <span id=":nextCount">0</span>\
                                            </div>\
                                </div>\
                                <div id=":tabsWrap" class="webim-panels-tab-wrap">\
                                        <div id=":tabs" class="webim-panels-tab">\
                                        </div>\
                                </div>\
                                <div class="webim-window-tab-wrap ui-widget webim-panels-prev-wrap">\
                                            <div id=":prev" class="webim-window-tab webim-panels-prev ui-state-default">\
                                                    <div id=":prevMsgCount" class="webim-window-tab-count">\
                                                            0\
                                                    </div>\
                                                    <span id=":prevCount">0</span>\
                                                    <em class="ui-icon ui-icon-triangle-1-e"></em>\
                                            </div>\
                                </div>\
                                <div class="webim-window-tab-wrap webim-collapse-wrap ui-widget">\
                                            <div id=":collapse" class="webim-window-tab webim-collapse ui-state-default" title="<%=collapse%>">\
                                                    <em class="ui-icon ui-icon-circle-arrow-e"></em>\
                                            </div>\
                                </div>\
                                <div class="webim-window-tab-wrap webim-expand-wrap ui-widget">\
                                            <div id=":expand" class="webim-window-tab webim-expand ui-state-default" title="<%=expand%>">\
                                                    <em class="ui-icon ui-icon-circle-arrow-w"></em>\
                                            </div>\
                                </div>\
                            </div>\
                            <div id=":apps" class="webim-apps">\
                            </div>\
                            </div>\
            </div></div>\
                    </div>',
        shortcutLength:5,
        chatAutoPop: true,
        template_s: '<div class="webim-window-tab-wrap ui-widget webim-shortcut-item">\
                                            <a class="webim-window-tab" href="{{link}}" target="{{target}}">\
                                                    <div class="webim-window-tab-tip">\
                                                            <strong>{{title}}</strong>\
                                                    </div>\
                                                    <em class="webim-icon" style="background-image:url({{icon}})"></em>\
                                            </a>\
                                            </div>'
},{
	_init: function(element, options){
		var self = this, options = self.options;
		extend(self,{
			window: window,
			apps : {},
			panels: {},
			tabWidth : 136,
			maxVisibleTabs: null,
			animationTime : 210,
			activeTabId : null,
			tabs : {},
			tabIds : [],
			nextCount : 0,
			prevCount : 0

		});

		//self.addShortcut(options.shortcuts);
		self._initEvents();
		options.isMinimize && self.collapse();
		//self.buildUI();
		//self.element.parent("body").length && self.buildUI();
		//
		//test
	},
	_ready:false,
	buildUI: function(e){
		var self = this, $ = self.$;
		//var w = self.element.width() - $.shortcut.outerWidth() - $.apps.outerWidth() - 55;
		var w = (windowWidth() - 45) - $.shortcut.offsetWidth - $.apps.offsetWidth - 70;
		self.maxVisibleTabs = parseInt(w / self.tabWidth);
		self._fitUI();
		self._ready = true;
	},
	_updatePrevCount: function(activeId){
		var self = this, tabIds = self.tabIds, max = self.maxVisibleTabs, len = tabIds.length, id = activeId, count = self.prevCount;
		if (len <= max) 
			return;
		if (!id) {
			count = len - max;
		}
		else {
			var nn = 0;
			for (var i = 0; i < len; i++) {
				if (tabIds[i] == id) {
					nn = i;
					break;
				}
			}
			if (nn <= count) 
				count = nn;
			else 
				if (nn >= count + max) 
					count = nn - max + 1;
		}
		self.prevCount = count;
	},
	_setVisibleTabs: function(all){
		var self = this, numPrev = self.prevCount, upcont = numPrev + self.maxVisibleTabs, tabs = self.tabs, tabIds = self.tabIds;
		var len = tabIds.length, nextN = 0, prevN = 0;
		for (var i = 0; i < len; i++) {
			var tab = tabs[tabIds[i]];
			if (i < numPrev || i >= upcont) {
				if (all) 
					show(tab.element);
				else {
					if (self.activeTabId == tabIds[i]) 
						tab.minimize();
					var n = tab._count();
					if (i < numPrev) {
						prevN += n;
						tab.pos = 1;
					}
					else {
						nextN += n;
						tab.pos = -1;
					}
					hide(tab.element);
				}
			}
			else {
				tab.pos = 0;
				show(tab.element);
			}
		}
		if (!all) {
			self.setNextMsgNum(nextN);
			self.setPrevMsgNum(prevN);
		}
	},
	setNextMsgNum: function(num){
		_countDisplay(this.$.nextMsgCount, num);
	},
	setPrevMsgNum: function(num){
		_countDisplay(this.$.prevMsgCount, num);
	},
	slideing: false,
	_slide: function(direction){
		var self = this, pcount = self.prevCount, ncount = self.nextCount;

		if ((ncount > 0 && direction == -1) || (pcount > 0 && direction == 1)) {

			self.slideing = true;
			if (ncount == 1 && direction == -1 || pcount == 1 && direction == 1) {

				self.slideing = false;
			}

			self._slideSetup(false);
			self._setVisibleTabs(true);

			if (direction == -1) {
				self.nextCount--;
				self.prevCount++;
			}
			else 
				if (direction == 1) {
					self.nextCount++;
					self.prevCount--;
				}

				var tabs = self.$.tabs, old_left = parseFloat(tabs.style.left), 
				left = -1 * self.tabWidth * self.nextCount, 
				times = parseInt(500/13),
				i = 1,
				pre = (left - old_left)/times;
				var time = setInterval(function(){
					tabs.style.left = old_left + pre*i + 'px';
					if(i == times){
						if (self.slideing) 
							self._slide(direction);
						else {
							self._fitUI();
							self._slideReset();
						}
						clearInterval(time);
						return;
					}
					i++;
				},13);
		}

	},
	_slideUp: function(){
		this.slideing = false;

	},
	_slideSetup: function(reset){
		var self = this, $ = self.$, tabsWrap = $.tabsWrap, tabs = $.tabs;

		if (!self._tabsWidth) {
			self._tabsWidth = tabs.clientWidth;
		}
		if (reset) {
			self._tabsWidth = null;
		}
		tabsWrap.style.position = reset ? '' : 'relative';
		tabsWrap.style.overflow = reset ? 'visible' : 'hidden';
		tabsWrap.style.width = reset ? '' : self._tabsWidth + "px";
		tabs.style.width = reset ? '' : self.tabWidth * self.tabIds.length + "px";
		tabs.style.position = reset ? '' : 'relative';
	},
	_slideReset: function(){
		this._slideSetup(true);

	},
	_updateCount: function(){
		var self = this, tabIds = self.tabIds, max = self.maxVisibleTabs, len = tabIds.length, pcount = self.prevCount, ncount = self.nextCount;
		if (len <= max) {
			ncount = 0;
			pcount = 0;
		}
		else {
			ncount = len - max - pcount;
			ncount = ncount < 0 ? 0 : ncount;
			pcount = len - max - ncount;
		}
		self.prevCount = pcount;
		self.nextCount = ncount;
	},
	_updateCountUI: function(){
		var self = this, $ = self.$, pcount = self.prevCount, ncount = self.nextCount;
		if (ncount <= 0) {
			addClass($.next, 'ui-state-disabled');
		}
		else {
			removeClass($.next, 'ui-state-disabled');
		}
		if (pcount <= 0) {
			addClass($.prev, 'ui-state-disabled');
		}
		else {
			removeClass($.prev, 'ui-state-disabled');
		}
		if (pcount > 0 || ncount > 0) {
			$.next.style.display = "block";
			$.prev.style.display = "block";
		}
		else {
			hide($.next);
			hide($.prev);
		}
		$.nextCount.innerHTML = ncount.toString();
		$.prevCount.innerHTML = pcount.toString();
	},
	_initEvents: function(){
		var self = this, win = self.window, $ = self.$;
		addEvent(win,"resize", function(){self.buildUI();});
		addEvent($.next,"mousedown", function(){self._slide(-1);});
		addEvent($.next,"mouseup", function(){self._slideUp();});
		disableSelection($.next);
		addEvent($.prev,"mousedown", function(){self._slide(1);});
		addEvent($.prev,"mouseup", function(){self._slideUp();});
		disableSelection($.prev);
		addEvent($.expand, "click", function(){
			self.expand();
			return false;
		});
		addEvent($.collapse, "click", function(){
			self.collapse();
			return false;
		});
	},
	isMinimize: function(){
		return hasClass(this.$.layout, "webim-webapi-minimize");
	},
	collapse: function(){
		if(this.isMinimize()) return;
		addClass(this.$.layout, "webim-webapi-minimize");
		this.trigger("collapse");
	},
	expand: function(){
		if(!this.isMinimize()) return;
		removeClass(this.$.layout, "webim-webapi-minimize");
		this.trigger("expand");
	},
	_displayUpdate:function(e){
		this._ready && this.trigger("displayUpdate");
	},
	_fitUI: function(){
		var self = this, $ = self.$, apps = $.apps;
		self._updateCount();
		self.$.tabs.style.left = -1 * self.tabWidth * self.nextCount + 'px';
		self._updateCountUI();
		self._setVisibleTabs();
		//self.tabs.height(h);
		self._displayUpdate();
	},
	_stickyWin: null,
	_appStateChange:function(win, state){
		var self = this;
		if(state != "minimize"){
			each(self.apps, function(key, val){
				if(val.window != win){
					val.window.minimize();
				}
			});
		}
		self._displayUpdate();
	},
	app:function(name){
		return this.apps[name];
	},
	addApp: function(app, options, container){
		var self = this, options = extend(options,{closeable: false});
		var win, el = app.element;
		win = new webimUI.window(null, options);
		win.html(el);
		self.$[container ? container : "apps"].appendChild(win.element);
		app.window = win;
		win.bind("displayStateChange", function(state){ self._appStateChange(this, state);});
		self.apps[app.name] = app;
	},
	focusChat: function(id){
		var self = this, tab = self.tabs[id];
		tab && tab.isMinimize() && tab.restore();
	},
	chat:function(id){
		return this.panels[id];
	},
	updateChat: function(data){
		data = makeArray(data);
		var self = this, info, l = data.length, panel;
		for(var i = 0; i < l; i++){
			info = data[i];
			panel = self.panels[info.id];
			panel && panel.update(info);
		}
	},
	updateAllChat:function(){
		each(this.panels, function(k,v){
			v.update();
		});
	},
	_onChatClose:function(id){
		var self = this;
		self.tabIds = grep(self.tabIds, function(v, i){
			return v != id;
		});
		delete self.tabs[id];
		delete self.panels[id];
		self._changeActive(id, true);
		self._fitUI();
	},
	_onChatChange:function(id, type){
		var self = this;
		if(type == "minimize"){
			self._changeActive(id, true);
			self._displayUpdate();
		}else{
			self._changeActive(id);
			self._fitUI();
		}
	},
	_changeActive: function(id, leave){
		var self = this, a = self.activeTabId;
		if(leave){
			a == id && (self.activeTabId = null);
		}else{
			a && a != id && self.tabs[a].minimize();
			self.activeTabId = id;
			self._updatePrevCount(id);
		}
	},
	addChat: function(info, options,winOptions){
		var self = this, panels = self.panels, id = info.id, chat;
		if(!panels[id]){
			var win = self.tabs[id] = new webimUI.window(null, extend({
				isMinimize: self.activeTabId || !self.options.chatAutoPop,
				tabWidth: self.tabWidth -2
			},winOptions)).bind("close", function(){ self._onChatClose(id)}).bind("displayStateChange", function(state){ self._onChatChange(id,state)});
			self.tabIds.push(id);
			self.$.tabs.insertBefore(win.element, self.$.tabs.firstChild);
			chat = panels[id] = new webimUI.chat(null, extend({
				window: win,
				userInfo: self.options.userInfo,
				buddyInfo: info
			}, options));
			!win.isMinimize() && self._changeActive(id);
			self._fitUI();
		}//else self.focusChat(id);
	},
	removeChat: function(ids){
		ids = idsArray(ids);
		var self = this, id, l = ids.length, tab;
		for(var i = 0; i < l; i++){
			tab = self.tabs[ids[i]];
			tab && tab.close();
		}
	},
	removeAllChat: function(){
		this.removeChat(this.tabIds);
	},
	addShortcut: function(title,icon,link, isExtlink){
		var self = this;
		if(isArray(title)){
			each(title, function(n,v){
				self.addShortcut(v);
			});
			return;

		}else if(isObject(title)){
			self.addShortcut(title.title, title.icon, title.link, title.isExtlink);
			return;
		}else if(typeof title != "string"){
			return;
		}
		var self = this, content = self.$.shortcut, temp = self.options.template_s;
		self.menu.add(title,icon,link, isExtlink);
		if(content.children().length > self.options.shortcutLength)return;
		temp = $(tpl(temp,{title: i18n(title), icon: icon, link: link, target: isExtlink ? "_blank" : ""}));

		temp.find("a").hover(_hoverCss, _outCss);
		content.append(temp);
	},
	addWindow: function(){
		new webimUI.window(null, {
		});
	},
	online: function(){
		var self = this, $ = self.$;
	},
	offline: function(){
		var self = this, $ = self.$;
	}

});
function windowWidth(){
	return document.compatMode === "CSS1Compat" && document.documentElement.clientWidth || document.body.clientWidth;
}
widget("emot", {},{
        _init: function(options){
                var self = this, element = self.element, options = self.options;
                if(!element){
                        element = self.element = $(tpl(options.template)).addClass('webim-emot');
                }
                var emots = self.emots = webim.ui.emot.emots;
                var markup = [];
                markup.push('<ul class="ui-helper-clearfix">');
                $.each(emots, function(n, v){
                    var src = v.src, title = v.t ? v.t : v.q[0];
                    markup.push('<li><img src="');
                    markup.push(src);
                    markup.push('" title="');
                    markup.push(title);
                    markup.push('" alt="');
                    markup.push(v.q[0]);
                    markup.push('" /></li>');
                });
                markup.push('</ul>');
                element.html(markup.join('')).find('li').click(function(){
                        self.element.removeClass("webim-emot-show");
                        self.trigger('select', $(this).children().attr('alt'));
                });
        },
        toggle: function(){
                this.element.toggleClass("webim-emot-show");
        }
});
extend(webimUI.emot, {
        defaults: {
                template: '<div class="webim-emot ui-widget-content"></div>'
        },
        emots: [
                {"t":"smile","src":"smile.png","q":[":)"]},
                {"t":"smile_big","src":"smile-big.png","q":[":d",":-d",":D",":-D"]},
                {"t":"sad","src":"sad.png","q":[":(",":-("]},
                {"t":"wink","src":"wink.png","q":[";)",";-)"]},
                {"t":"tongue","src":"tongue.png","q":[":p",":-p",":P",":-P"]},
                {"t":"shock","src":"shock.png","q":["=-O","=-o"]},
                {"t":"kiss","src":"kiss.png","q":[":-*"]},
                {"t":"glasses_cool","src":"glasses-cool.png","q":["8-)"]},
                {"t":"embarrassed","src":"embarrassed.png","q":[":-["]},
                {"t":"crying","src":"crying.png","q":[":'("]},
                {"t":"thinking","src":"thinking.png","q":[":-\/",":-\\"]},
                {"t":"angel","src":"angel.png","q":["O:-)","o:-)"]},
                {"t":"shut_mouth","src":"shut-mouth.png","q":[":-X",":-x"]},
                {"t":"moneymouth","src":"moneymouth.png","q":[":-$"]},
                {"t":"foot_in_mouth","src":"foot-in-mouth.png","q":[":-!"]},
                {"t":"shout","src":"shout.png","q":[">:o",">:O"]}
        ],
        init: function(options){
            var emot = webim.ui.emot, q = emot._q = {};
            options = $.extend({
                dir: 'webim/static/emot/default'
            }, options);
            if (options.emots) 
                emot.emots = options.emots;
            var dir = options.dir + "/";
            $.each(emot.emots, function(key, v){
                if (v && v.src) 
                    v.src = dir + v.src;
                v && v.q &&
                $.each(v.q, function(n, val){
                    q[val] = key;

                });

            });
        },
        parse: function(str){
            var q = webim.ui.emot._q, emots = webim.ui.emot.emots;
            q && $.each(q, function(n, v){
                var emot = emots[v], src = emot.src, title = emot.t ? emot.t : emot.q[0], markup = [];
                markup.push('<img src="');
                markup.push(src);
                markup.push('" title="');
                markup.push(title);
                markup.push('" alt="');
                markup.push(emot.q[0]);
                markup.push('" />');
                n = HTMLEnCode(n);
                n = n.replace(new RegExp('(\\' + '.$^*\\[]()|+?{}:<>'.split('').join('|\\') + ')', "g"), "\\$1");
                str = str.replace(new RegExp(n, "g"), markup.join(''));

            });
            return str;
        }
});
//
/* ui.chat:
*
options:

methods:
add(ids)
remove(ids)
online(ids)
offline(ids)
disable()
enable()
destroy()

events: 
select

*/
widget("chatlink",{
	filterId: function(link){
		if(!link)return false;
		var ex = /space\.php\?uid=(\d+)$|space\-(\d+)\.html$/i.exec(link);
		return ex && (ex[1] || ex[2]);
	},
	offline: true
},{
	_init: function(){
		var self = this, element = self.element, ids = {}, options = self.options, filterId = options.filterId, links = {}, offline = options.offline;

		var tpl = $('<span class="webim-chatlink-disable webim-chatlink'+(options.offline ? '' : ' webim-chatlink-no-offline')+'"><span class="webim-chatlink-off-i"></span><span class="webim-chatlink-on-i"></span></span>').click(function(e){
			self.trigger("select", this.id);
			e.stopPropagation();
			return false;
		});

		var a = element ? element.find("a") : $("a"), b;
		a.filter(function(e){
			var id = filterId(this.href), text = this.innerHTML;
			if(id && $(this).children().length == 0 && text){
				ids[id] = true;
				b = tpl.clone(true).attr({id: id, title: i18n('chat with',{name: text})}).insertAfter(this);
				links[id] = links[id] ? links[id].add(b) : b;
				return true;
			}
			return false;
		});
		ids = idsArray(ids);
		var id = filterId(window.location.href);
		if(id){
			ids.push(id);
			b = $("<li class='webim-chatlink-disable'>").append(tpl.removeClass("webim-chatlink-disable").clone(true).attr("id",id)).appendTo($(".spacemenu_list:first,.line_list:first"));
			b.find("span").not(b.children("span")).html("<a href='javascript:void 0'>"+i18n('chat with me')+"</a>");
			links[id] = links[id] ? links[id].add(b) : b;
		}
		self.ids = ids;
		self.links = links;
	},
	disable: function(){
		var self = this, ids = self.ids, l = ids.length;
		for(var i = 0; i < l; i++){
			var li = self.links[ids[i]];
			li && li.addClass("webim-chatlink-disable");
		}
	},
	enable: function(){
		var self = this, ids = self.ids, l = ids.length;
		for(var i = 0; i < l; i++){
			var li = self.links[ids[i]];
			li && li.removeClass("webim-chatlink-disable");
		}
	},
	remove: function(ids){
		ids = idsArray(ids);
		var self = this, l = ids.length, id;
		for(var i = 0; i < l; i++){
			id = ids[i];
			var li = self.links[id];
			if(li){
				li.remove();
				delete self.links[id];
				self.ids = $.grep(self.ids, function(v, i){
					return v != id;
				});
			}
		}
	},
	online: function(ids){
		ids = idsArray(ids);
		var self = this, l = ids.length;
		for(var i = 0; i < l; i++){
			var li = self.links[ids[i]];
			li && li.addClass("webim-chatlink-on");
		}
	},
	offline: function(ids){
		ids = idsArray(ids);
		var self = this, l = ids.length;
		for(var i = 0; i < l; i++){
			var li = self.links[ids[i]];
			li && li.removeClass("webim-chatlink-on");
		}
	}

});

//
/* ui.setting:
 *
 options:
 attributes：

 methods:
 check_tag

 destroy()
 events: 
 change

 */
widget("setting",{
        event:'click',
        template: '<div id="webim-setting" class="webim-setting">\
                        <ul id=":ul"></ul>\
                  </div>',
        template_c: '<li><input type="checkbox" <%=checked%> id="<%=id%>" name="<%=name%>"/><label for="<%=id%>"><%=label%></label></li>'
},{
        _init: function(){
                var self = this, element = self.element, options = self.options;
		return;
                self.tags = {};
                //self._initEvents();
        },
        check_tag: function(name, isChecked){
                var self = this, tags = self.tags, tag = tags[name];
                if(tag){
                        tag.children("input")[0].checked = isChecked;
                        return;
                }
                var temp = $(tpl(self.options.template_c,{
                        label: i18n(name),
                        id: "webim-setting-" + name,
                        name: name,
                        checked: isChecked ? 'checked="checked"' : ''
                }));
                temp.children("input").click(function(e){
                        self._change(this.name, this.checked);
                });
                temp.appendTo(self.ul);
                tags[name] = temp;
        },
        _change:function(name, value){
                this.trigger("change", [name, value]);
        },
        destroy: function(){
        }
});
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

widget("buddy",{
        event:'click',
        template: '<div id="webim-buddy" class="webim-buddy">\
                        <div id=":online" class="webim-buddy-online"><a class="ui-state-default ui-corner-all" href="#online"><%=online%></a></div>\
                        <div id=":search" class="webim-buddy-search ui-state-default ui-corner-all"><em class="ui-icon ui-icon-search"></em><input type="text" value="" /></div>\
                        <div class="webim-buddy-content">\
                                <div id=":empty" class="webim-buddy-empty"><%=empty buddy%></div>\
                                <div id=":offline" class="webim-buddy-offline"><a href="#offline"><%=offline%></a></div>\
                                <ul id=":ul"></ul>\
                        </div>\
                  </div>',
        template_g: '<li><h4 class="ui-state-default"><%=title%>(<%=count%>)</h4><ul></ul></li>',
        template_li: '<li title=""><a href="<%=link%>" rel="<%=id%>" class="ui-helper-clearfix"><img width="25" src="about:blank"/><strong><%=name%></strong><span><%=status%></span></a></li>'
},{
	_init: function(){
		var self = this, element = self.element, options = self.options;
		return;
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
widget("notification",{
        event:'click',
        template: '<div id="webim-notification" class="webim-notification">\
                        <ul id=":ul"></ul>\
                        <div id=":empty" class="webim-notification-empty"><%=empty notification%></div>\
                  </div>',
        template_li: '<li><a href="<%=link%>" target="<%=target%>"><%=text%></a></li>'
},{
        _init: function(){
                var self = this, element = self.element, options = self.options;
		return;
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
widget("history",{
        userInfo: {},
        buddyInfo: {},
        template:'<div class="webim-history">\
                        <div id=":content" class="webim-history-content"> \
                </div></div>'
},{
	_init: function(){
		var self = this, element = self.element, options = self.options;
		return;
		plugin.call(self, "init", [null, self.plugin_ui()]);
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
//                                                        <a href="#"><%=clear history%></a> \
//                                                        </p> \

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

webimUI.history.defaults.parseMsg = true;
plugin.add("history","parseMsg",{
	render:function(e, ui){
		var msg = ui.msg.body;
		msg = HTMLEnCode(msg);
		msg = autoLinkUrls(msg, {target:"_blank"});
		ui.msg.body = msg;
	}
});

webimUI.history.defaults.emot = true;
plugin.add("history","emot",{
	render:function(e, ui){
		ui.msg.body = webim.ui.emot.parse(ui.msg.body);
	}
});



//
/* ui.menu:
 *
 options:
 attributes£º

 methods:
 check_tag

 destroy()
 events: 
 change

 */
widget("menu",{
        event:'click',
        template: '<div id="webim-menu" class="webim-menu">\
                        <ul id=":ul"></ul>\
                        <div id=":empty" class="webim-menu-empty"><%=empty menu%></div>\
                  </div>',
        template_li: '<li><a href="<%=link%>" target="<%=target%>"><img src="<%=icon%>"/><span><%=title%></span></a></li>'
},{
	_init: function(){
		var self = this, element = self.element, options = self.options;
		return;
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
	add: function(title,icon,link, isExtlink){
		var self = this;
		var ui = self.ui, template_li = self.options.template_li;
		ui.empty.hide();
		ui.ul.append(tpl(template_li, {
			title: i18n(title),
			icon: icon,
			link: link,
			target: isExtlink ? "_blank" : ""
		}));
	},
	destroy: function(){
	}
});
//
/* ui.chat:
 *
 options:
 window
 history

 methods:
 update(info)
 status(type)
 insert(text, isCursorPos)
 focus
 notice(text, timeOut)
 destroy()

 events: 
 sendMsg
 sendStatus

 */
 
function ieCacheSelection(e){
        document.selection && (this.caretPos = document.selection.createRange());
}
widget("chat",{
        event:'click',
        template:'<div class="webim-chat"> \
                                                <div id=":header" class="webim-chat-header ui-widget-subheader">  \
                                                        <div id=":user" class="webim-user"> \
                                                                <a id=":userPic" class="webim-user-pic" href="#id"><img src="about:blank"></a> \
                                                                <span id="userStatus" title="" class="webim-user-status">Hello</span> \
                                                        </div> \
                                                </div> \
                                                                                                                                        <div class="webim-chat-notice-wrap"><div id=":notice" class="webim-chat-notice ui-state-highlight"></div></div> \
                                                <div id=":content" class="webim-chat-content"> \
                                                                                                                <div id=":status" class="webim-chat-status webim-gray"></div> \
                                                </div> \
                                                <div id=":actions" class="webim-chat-actions"> \
                                                        <div id=":toolContent" class="webim-chat-tool-content"></div>\
                                                        <div id=":tools" class="webim-chat-tools ui-helper-clearfix ui-state-default"></div>\
                                                        <table class="webim-chat-t" cellSpacing="0"> \
                                                                <tr> \
                                                                        <td style="vertical-align:top;"> \
                                                                        <em class="webim-icon webim-icon-chat"></em>\
                                                                        </td> \
                                                                        <td style="vertical-align:top;width:100%;"> \
                                                                        <div class="webim-chat-input-wrap">\
                                                                                <textarea id=":input" class="webim-chat-input webim-gray"><%=input notice%></textarea> \
                                                                        </div> \
                                                                        </td> \
                                                                </tr> \
                                                        </table> \
                                                </div> \
                                        </div>'
},{
	_init: function(){
		var self = this, element = self.element, options = self.options;
		return;
		var win = self.window = options.window;
		if(!element){
			if(!win){
				throw "[webim.ui.chat]Where is window?";
				return;
			}
			element = self.element = $(tpl(options.template));
			win.html(element);
		}
		element.data("chat", self);
		var history = self.history = new webimUI.history(null,{
			userInfo: options.userInfo,
			buddyInfo: options.buddyInfo
		});
		history.element.prependTo($.content);
		self._initEvents();
		if(win){
			self._bindWindow();
			//self._fitUI();
		}
		self.update(options.buddyInfo);
		history.add(options.history);
		plugin.call(self, "init", [null, self.plugin_ui()]);
		self._adjustContent();
	},
	update: function(buddyInfo){
		var self = this;
		if(buddyInfo){
			self.option("buddyInfo", buddyInfo);
			self.history.option("buddyInfo", buddyInfo);
			self._updateInfo(buddyInfo);
		}
		var userOn = self.options.userInfo.presence == "online";
		var buddyOn = self.options.buddyInfo.presence == "online";
		if(!userOn){
			self.notice(i18n("user offline notice"));
		}else if(!buddyOn){
			self.notice(i18n("buddy offline notice",{name: buddyInfo.name}));
		}else{
			self.notice("");
		}
	},
	focus: function(){
		this.$.input.focus();
	},
	_noticeTime: null,
	_noticeTxt:"",
	notice: function(text, timeOut){
		var self = this, content = self.$.notice, time = self._noticeTime;
		if(time)clearTimeout(time);
		if(!text){
			self._noticeTxt = null;
			content.hide();
			return;
		}
		if(timeOut){
			content.html(text).show();
			setTimeout(function(){
				if(self._noticeTxt)
					content.html(self._noticeTxt);
				else content.fadeOut(500);
			}, timeOut);

		}else{
			self._noticeTxt = text;
			content.html(text).show();
		}
	},
	_adjustContent: function(){
		var content = this.$.content;
		content.scrollTop(content[0].scrollHeight);
	},
	_fitUI: function(e){
		var self = (e && e.data && e.data.self) || this, win = self.window, $ = self.$;
		self._adjustContent();

	},
	_focus: function(e, type){
		var self = e.data.self;
		if(type != "minimize"){
			self.$.input.focus();
			self._adjustContent();
		}
	},
	_bindWindow: function(){
		var self = this, win = self.window;
		win.bind("displayStateChange", {self: self}, self._focus);
		//win.bind("resize",{self: self}, self._fitUI);
	},
	_onHistoryUp:function(e){
		var self = (e && e.data && e.data.self) || this;
		self._adjustContent();
	},
	_inputAutoHeight:function(){
		var el = this.$.input, scrollTop = el[0].scrollTop;
		if(scrollTop > 0){
			var h = el.height();
			if(h> 32 && h < 100) el.height(h + scrollTop);
		}
	},
	_inputkeyup: function(e){
		ieCacheSelection.call(this);
		var self = e.data.self;
		//self._inputAutoHeight();
	},
	_sendMsg: function(val){
		var self = this, options = self.options, buddyInfo = options.buddyInfo;
		var msg = {
			type: "msg",
			to: buddyInfo.id,
			from: options.userInfo.id,
			stype: '',
			offline: buddyInfo.presence == "online" ? 0 : 1,
			body: val,
			timestamp: (new Date()).getTime()
		};
		plugin.call(self, "send", [null, self.plugin_ui({msg: msg})]);
		self.trigger('sendMsg', msg);
		//self.sendStatus("");
	},
	_inputkeypress: function(e){
		var self = (e && e.data && e.data.self) || this, $ = self.$;
		if (e.keyCode == 13){
			if(e.ctrlKey){
				self.insert("\n", true);
				return true;
			}else{
				var el = $(this), val = el.val();
				if ($.trim(val)) {
					self._sendMsg(val);
					el.val('');
					e.preventDefault();
				}
			}
		}
		else self._typing();

	},
	_onFocusInput: function(e){
		var self = e.data.self, el = e.target;

		//var val = el.setSelectionRange ? el.value.substring(el.selectionStart, el.selectionEnd) : (window.getSelection ? window.getSelection().toString() : (document.selection ? document.selection.createRange().text : ""));
		var val = window.getSelection ? window.getSelection().toString() : (document.selection ? document.selection.createRange().text : "");
		if(!val)self.$.input.focus();
	},
	_initEvents: function(){
		var self = this, options = self.options, $ = self.$, placeholder = i18n("input notice"), gray = "webim-gray", input = $.input;
		self.history.bind("update",{self:self}, self._onHistoryUp).bind("clear", function(){
			self.notice(i18n("clear history notice"), 3000);
		});
		//输入法中，进入输入法模式时keydown,keypress触发，离开输入法模式时keyup事件发生。
		//autocomplete之类事件放入keyup，回车发送事件放入keydown,keypress

		input.bind('keyup',{self:self}, self._inputkeyup).click(ieCacheSelection).select(ieCacheSelection).focus(function(){
			input.removeClass(gray);
			if(this.value == placeholder)this.value = "";
		}).blur(function(){
			if(this.value == ""){
				input.addClass(gray);
				this.value = placeholder;
			}
		}).bind("keypress", {self: self},self._inputkeypress);
		$.content.bind("click", {self : self}, self._onFocusInput);

	},
	_updateInfo:function(info){
		var self = this, $ = self.$;
		$.userPic.attr("href", info.url);
		$.userPic.children().attr("src", info.pic_url);
		$.userStatus.html(info.status);
		self.window.title(info.name);
	},
	insert:function(value, isCursorPos){
		//http://hi.baidu.com/beileyhu/blog/item/efe29910f31fd505203f2e53.html
		var self = this,input = self.$.input;
		input.focus();
		if(!isCursorPos){
			input.val(value);
			return;
		}
		if(!value) value = "";
		input = input.get(0);
		if(input.setSelectionRange){
			var val = input.value, rangeStart = input.selectionStart, rangeEnd = input.selectionEnd, tempStr1 = val.substring(0,rangeStart), tempStr2 = val.substring(rangeEnd), len = value.length;  
			input.value = tempStr1+value+tempStr2;  
			input.setSelectionRange(rangeStart+len,rangeStart+len);
		}else if(document.selection){
			var caretPos = $.data(input, "caretPos");
			if(caretPos){
				caretPos.text = value;
				caretPos.collapse();
				caretPos.select();
			}
			else{
				input.value += value;
			}
		}else{
			input.value += value;
		}
	},
	_statusText: '',
	sendStatus: function(show){
		var self = this;
		if (!show || show == self._statusText) return;
		self._statusText = show;
		self.trigger('sendStatus', {
			to: self.options.buddyInfo.id,
			show: show
		});
	},
	_checkST: false,
	_typing: function(){
		var self = this;
		self.sendStatus("typing");
		if (self._checkST) 
			clearTimeout(self._checkST);
		self._checkST = window.setTimeout(function(){
			self.sendStatus('clear');
		}, 6000);
	},
	_setST: null,
	status: function(type){
		//type ['typing']
		type = type || 'clear';
		var self = this, el = self.$.status, name = self.options.buddyInfo.name, markup = '';
		markup = type == 'clear' ? '' : name + i18n(type);
		el.html(markup);
		self._adjustContent();
		if (self._setST)  clearTimeout(self._setST);
		if (markup != '') 
			self._setST = window.setTimeout(function(){
				el.html('');
			}, 10000);
	},
	destroy: function(){
		this.window.close();
	},
	plugin_ui:function(extend){
		var self = this;
		return $.extend({
			self: self,
			ui: self.$,
			history: self.history
		}, extend);
	},
	plugins: {}
});

webimUI.chat.defaults.emot = true;
plugin.add("chat","emot",{
	init:function(e, ui){
		var chat = ui.self;
		var emot = new webimUI.emot(null,{
			select: function(e, alt){
				chat.focus();
				chat.insert(alt, true);
			}
		});
		var trigger = $(tpl('<a href="#chat-emot" title="<%=emot%>"><em class="webim-icon webim-icon-emot"></em></a>')).click(function(){
			emot.toggle();
			return false;
		});
		ui.$.toolContent.append(emot.element);
		ui.$.tools.append(trigger);
	},
	send:function(e, ui){
	}
});
webimUI.chat.defaults.clearHistory = true;
plugin.add("chat","clearHistory",{
	init:function(e, ui){
		var chat = ui.self;
		var trigger = $(tpl('<a href="#chat-clearHistory" title="<%=clear history%>"><em class="webim-icon webim-icon-clear"></em></a>')).click(function(){
			chat.trigger("clearHistory",[chat.options.buddyInfo]);
			return false;
		});
		ui.$.tools.append(trigger);
	}
});
})(window, document);
