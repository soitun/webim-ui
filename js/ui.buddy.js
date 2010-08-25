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
online
offline

destroy()
events: 
select
offline
online

*/
app("buddy", {
	init: function(options){
		var ui = this, im = ui.im, buddy = im.buddy, layout = ui.layout;
		var buddyUI = ui.buddy = new webimUI.buddy(null, options);
		layout.addWidget(buddyUI, {
			title: i18n("buddy"),
			icon: "buddy",
			sticky: im.setting.get("buddy_sticky"),
			className: "webim-buddy-window",
			//       onlyIcon: true,
			isMinimize: !im.status.get("b"),
			titleVisibleLength: 19
		});
		//buddy events
		im.setting.bind("update",function(key, val){
			if(key == "buddy_sticky")buddyUI.window.option("sticky", val);
		});
		//select a buddy
		buddyUI.bind("select", function(info){
			ui.addChat("buddy", info.id);
			ui.layout.focusChat("buddy", info.id);
		}).bind("online",function(){
			im.online();
		});
		buddyUI.window.bind("displayStateChange",function(type){
			if(type != "minimize"){
				buddy.option("loadDelay", false);
				im.status.set("b", 1);
				buddy.loadDelay();
			}else{
				im.status.set("b", 0);
				buddy.option("loadDelay", true);
			}
		});
		//some buddies online.
		buddy.bind("online", function(data){
			buddyUI.add(data);
			buddyUI.notice("count", buddy.count({presence:"online"}));
		});
		buddy.bind("onlineDelay", function(data){
			buddyUI.notice("count", buddy.count({presence:"online"}));
		});
		//some buddies offline.
		var mapId = function(a){ return isObject(a) ? a.id : a };
		buddy.bind("offline", function(data){
			buddyUI.remove(map(data, mapId));
			buddyUI.notice("count", buddy.count({presence:"online"}));
		});
		//some information has been modified.
		buddy.bind("update", function(data){
			buddyUI.update(data);
		});
		buddyUI.offline();
		//user events
		var user = buddyUI.user;
		user.bind("online", function(params){
			im.online(params);
		}).bind("offline", function(){
			im.offline();
		}).bind("presence", function(params){
			im.sendPresence(params);
		});
		buddyUI.user.update(im.data.user);
	},
	ready: function(){
		var ui = this, im = ui.im, buddy = im.buddy, buddyUI = ui.buddy;
		buddyUI.online();
	},
	go: function(){
		var ui = this, im = ui.im, buddy = im.buddy, buddyUI = ui.buddy;
		buddyUI.notice("count", buddy.count({presence:"online"}));
		buddyUI.user.update(im.data.user);
	},
	stop: function(type){
		var ui = this, im = ui.im, buddy = im.buddy, buddyUI = ui.buddy;
		buddyUI.offline();
		buddyUI.user.show("unavailable");
		type && buddyUI.notice(type);
	}
});

widget("buddy",{
	template: '<div id="webim-buddy" class="webim-buddy">\
		<div id=":search" class="webim-buddy-search ui-state-default ui-corner-all"><em class="ui-icon ui-icon-search"></em><input id=":searchInput" type="text" value="" /></div>\
			<div class="webim-buddy-content">\
				<div id=":empty" class="webim-buddy-empty"><%=empty buddy%></div>\
					<ul id=":ul"></ul>\
						</div>\
							</div>',
	tpl_group: '<li><h4 class="ui-state-default"><%=title%>(<%=count%>)</h4><ul></ul></li>',
	tpl_li: '<li title=""><a href="<%=url%>" rel="<%=id%>" class="ui-helper-clearfix"><img width="25" src="<%=pic_url%>" defaultsrc="<%=default_pic_url%>" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" /><strong><%=nick%></strong><span><%=status%></span></a></li>'
},{
	_init: function(){
		var self = this;
		self.groups = {
		};
		self.li = {
		};
		self.li_group = {
		};
		self._count = 0;
		//self._initEvents();
		self.user = new webimUI.user();
		self.header = self.user.element;
		if(self.window){
			self.window.subHeader(self.header);
		}
	},
	_initEvents: function(){
		var self = this, $ = self.$, search = $.search, input = $.searchInput, placeholder = i18n("search buddy"), activeClass = "ui-state-active";
		addEvent(search.firstChild, "click",function(){
			input.focus();
		});
		input.value = placeholder;
		addEvent(input, "focus", function(){
			addClass(search, activeClass);
			if(this.value == placeholder)this.value = "";
		});
		addEvent(input, "blur", function(){
			removeClass(search, activeClass);
			if(this.value == "")this.value = placeholder;
		});
		addEvent(input, "keyup", function(){
			var list = self.li, val = this.value;
			each(self.li, function(n, li){
				if(val && (li.text || li.innerHTML.replace(/<[^>]*>/g,"")).indexOf(val) == -1) hide(li);
				else show(li);
			});
		});
/*
var a = $.online.firstChild;
addEvent(a, "click", function(e){
preventDefault(e);
self.trigger("online");
});
hoverClass(a, "ui-state-hover");
addEvent($.offline.firstChild, "click", function(e){
preventDefault(e);
self.trigger("offline");
});
*/

	},
	_titleCount: function(){
		var self = this, _count = self._count, win = self.window, empty = self.$.empty, element = self.element;
		win && win.title(i18n("buddy") + "(" + (_count ? _count : "0") + ")");
		if(!_count){
			show(empty);
		}else{
			hide(empty);
		}
		if(_count > 8){
			self.scroll(true);
		}else{
			self.scroll(false);
		}
	},
	scroll:function(is){
		toggleClass(this.element, "webim-buddy-scroll", is);
	},
	_time:null,
	_titleBuddyOnline: function(name){
		var self = this, win = self.window;
		if(!name) name = "";
		//	win && win.title(subVisibleLength(name, 0, 8) + " " + i18n("online"));
		if(self._time) clearTimeout(self._time);
		self._time = setTimeout(function(){
			self._titleCount();
		}, 5000);
	},
	_title: function(type){
		var win = this.window;
		if(win){
			win.title(i18n("buddy") + "[" + i18n(type) + "]");
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
		var self = this, $ = self.$, win = self.window;
		self.notice("connect");
		show($.empty);
	},
	offline: function(){
		var self = this, $ = self.$, win = self.window;
		self.notice("offline");
		show($.empty);
		self.scroll(false);
		self.removeAll();
	},
	_updateInfo:function(el, info){
		el = el.firstChild;
		el.setAttribute("href", info.url);
		el = el.firstChild;
		el.setAttribute("defaultsrc", info.default_pic_url ? info.default_pic_url : "");
		el.setAttribute("src", info.pic_url);
		el = el.nextSibling;
		el.innerHTML = info.nick;
		el = el.nextSibling;
		el.innerHTML = info.status;
		return el;
	},
	_addOne:function(info, end){
		var self = this, li = self.li, id = info.id, ul = self.$.ul;
		if(!li[id]){
			if(!info.default_pic_url)info.default_pic_url = "";
			var el = li[id] = createElement(tpl(self.options.tpl_li, info));
			//self._updateInfo(el, info);
			var a = el.firstChild;
			addEvent(a, "click",function(e){
				preventDefault(e);
				self.trigger("select", [info]);
				this.blur();
			});

			var groups = self.groups, group_name = i18n(info["group"] || "friend"), group = groups[group_name];
			if(!group){
				var g_el = createElement(tpl(self.options.tpl_group));
				hide(g_el);
				if(group_name == i18n("stranger")) end = true;
				if(end) ul.appendChild(g_el);
				else ul.insertBefore(g_el, ul.firstChild);
				group = {
					name: group_name,
					el: g_el,
					count: 0,
					title: g_el.firstChild,
					li: g_el.lastChild
				};
				self.groups[group_name] = group;
			}
			if(group.count == 0) show(group.el);
			self.li_group[id] = group;
			group.li.appendChild(el);
			group.count++;
			group.title.innerHTML = group_name + "("+ group.count+")";
		}
	},
	_updateOne:function(info){
		var self = this, li = self.li, id = info.id;
		li[id] && self._updateInfo(li[id], info);
	},
	update: function(data){
		data = makeArray(data);
		for(var i=0; i < data.length; i++){
			this._updateOne(data[i]);
		}
	},
	add: function(data, end){
		data = makeArray(data);
		for(var i=0; i < data.length; i++){
			this._addOne(data[i], end);
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
		var id, el, li = this.li, group, li_group = this.li_group;
		ids = idsArray(ids);
		for(var i=0; i < ids.length; i++){
			id = ids[i];
			el = li[id];
			if(el){
				group = li_group[id];
				if(group){
					group.count --;
					if(group.count == 0)hide(group.el);
					group.title.innerHTML = group.name + "("+ group.count+")";
				}
				remove(el);
				delete(li[id]);
			}
		}
	},
	select: function(id){
		var self = this, el = self.li[id];
		el && el.firstChild.click();
		return el;
	},
	destroy: function(){
	}
});
