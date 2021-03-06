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

var _buddyIMOnline = false;
app("buddy", {
	init: function(options){
		options = options || {};
		var ui = this, im = ui.im, buddy = im.buddy, layout = ui.layout;
		var buddyUI = ui.buddy = new webimUI.buddy(null, extend({
			title: i18n("buddy")
		}, options ) );

		layout.addWidget(buddyUI, extend({
			title: i18n("buddy"),
			icon: "buddy",
			sticky: im.setting.get("buddy_sticky"),
			className: "webim-buddy-window",
			//       onlyIcon: true,
			isMinimize: !im.status.get("b"),
			titleVisibleLength: 19
		}, options.windowOptions));
		if(!options.disable_user) {
			ui.addApp( "user", options.userOptions );
			if( options.is_login ) {
				buddyUI.window.subHeader( ui.user.element );
				ui.user._initElement = true;
			}
		}
		if( !options.is_login && !options.disable_login ) {
			ui.addApp("login", extend( { container: buddyUI.$.content }, options.loginOptions ) );
		}
		//buddy events
		im.setting.bind("update",function(key, val){
			if(key == "buddy_sticky")buddyUI.window.option("sticky", val);
		});
		//select a buddy
		buddyUI.bind("select", function(info){
			ui.addChat("buddy", info.id);
			ui.layout.focusChat("buddy", info.id);
		});
		//Bug... 如果用户还没登录，点击， status.set 会清理掉正在聊天的session
		buddyUI.window.bind("displayStateChange",function(type){
			if(type != "minimize"){
				buddy.option("active", true);
				_buddyIMOnline && im.status.set("b", 1);
				buddy.complete();
			}else{
				_buddyIMOnline && im.status.set("b", 0);
				buddy.option("active", false);
			}
		});

		var mapId = function(a){ return isObject(a) ? a.id : a };
		var grepVisible = function(a){ return a.show != "invisible" && a.presence == "online"};
		var grepInvisible = function(a){ return a.show == "invisible"; };
		//some buddies online.
		buddy.bind("online", function(data){
			buddyUI.add(grep(data, grepVisible));
		});
		//some buddies offline.
		buddy.bind("offline", function(data){
			buddyUI.remove(map(data, mapId));
		});
		//some information has been modified.
		buddy.bind("update", function(data){
			buddyUI.add(grep(data, grepVisible));
			buddyUI.update(grep(data, grepVisible));
			buddyUI.remove(map(grep(data, grepInvisible), mapId));
		});
		buddyUI.offline();
	},
	ready: function(){
		var ui = this, im = ui.im, buddy = im.buddy, buddyUI = ui.buddy;
		hide( buddyUI.$.logo );
		buddyUI.online();
	},
	go: function(){
		var ui = this, im = ui.im, buddy = im.buddy, buddyUI = ui.buddy;
		ui.user && !ui.user._initElement && buddyUI.window.subHeader(ui.user.element);
		_buddyIMOnline = true;
		buddyUI.titleCount();
		buddyUI.hideError();
	},
	stop: function(type, msg){
		var ui = this, im = ui.im, buddy = im.buddy, buddyUI = ui.buddy;
		_buddyIMOnline = false;
		buddyUI.offline();
		if ( type == "online" || type == "connect" ) {
			buddyUI.showError( msg );
		}
	}
});

widget("buddy",{
	template: '<div id="webim-buddy" class="webim-buddy">\
		<div id=":search" class="webim-buddy-search ui-state-default ui-corner-all"><em class="ui-icon ui-icon-search"></em><input id=":searchInput" type="text" value="" /></div>\
			<div class="webim-buddy-content" id=":content">\
				<div id=":logo" class="webim-buddy-logo">&nbsp;</div>\
				<div class="ui-state-error webim-login-error ui-corner-all" style="display: none;" id=":error"></div>\
				<div id=":empty" class="webim-buddy-empty"><%=empty buddy%></div>\
					<ul id=":ul"></ul>\
						</div>\
							</div>',
	tpl_group: '<li><h4><%=title%>(<%=count%>)</h4><hr class="webim-line ui-state-default" /><ul></ul></li>',
	tpl_li: '<li title=""><a href="<%=url%>" rel="<%=id%>" class="ui-helper-clearfix"><em class="webim-icon webim-icon-<%=show%>" title="<%=human_show%>"><%=show%></em><img width="25" src="<%=pic_url%>" defaultsrc="<%=default_pic_url%>" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" /><strong><%=nick%></strong><span><%=status%></span></a></li>'
},{
	_init: function(){
		var self = this, options = self.options;
		self.groups = {
		};
		self.li = {
		};
		self.li_group = {
		};
		self.size = 0;
		if(options.disable_group){
			addClass(self.element, "webim-buddy-hidegroup");
		}
		if(options.simple){
			addClass(self.element, "webim-buddy-simple");
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
	titleCount: function(){
		var self = this, size = self.size, win = self.window, empty = self.$.empty, element = self.element;
		win && win.title(self.options.title + "(" + (size ? size : "0") + ")");
		if(!size){
			show(empty);
		}else{
			hide(empty);
		}
		if(size > 8){
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
			self.titleCount();
		}, 5000);
	},
	_title: function(type){
		var win = this.window;
		if(win){
			win.title(this.options.title + "[" + i18n(type) + "]");
		}
	},
	notice: function(type, name){
		var self = this;
		switch(type){
			case "buddyOnline":
				self._titleBuddyOnline(name);
			break;
			default:
				self._title(type);
		}
	},
	online: function(){
		var self = this, $ = self.$, win = self.window;
		self.notice("connect");
		hide( $.empty );
	},
	offline: function(){
		var self = this, $ = self.$, win = self.window;
		self.scroll(false);
		self.removeAll();
		hide( $.empty );
		show( $.logo );
		self.notice("offline");
	},
	_updateInfo:function(el, info){
		el = el.firstChild;
		el.setAttribute("href", info.url);
		el = el.firstChild;
		var show = info.show ? info.show : "available";
		el.className = "webim-icon webim-icon-" + show;
		el.setAttribute("title", i18n(show));
		el = el.nextSibling;
		el.setAttribute("defaultsrc", info.default_pic_url ? info.default_pic_url : "");
		if(info.pic_url || info.default_pic_url) {
			el.setAttribute("src", info.pic_url || info.default_pic_url);
		}
		el = el.nextSibling;
		el.innerHTML = info.nick;
		el = el.nextSibling;
		el.innerHTML = stripHTML(info.status) || "&nbsp;";
		return el;
	},
	_addOne:function(info, end){
		var self = this, li = self.li, id = info.id, ul = self.$.ul;
		if(!li[id]){
			self.size++;
			if(!info.default_pic_url)info.default_pic_url = "";
			info.status = stripHTML(info.status) || "&nbsp;";
			info.show = info.show || "available";
			info.human_show = i18n(info.show);
			info.pic_url = info.pic_url || "";
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
		this.titleCount();
	},
	removeAll: function(){
		var ids = [], li = this.li;
		for(var k in li){
			ids.push(k);
		}
		this.remove(ids);
		this.titleCount();
	},
	remove: function(ids){
		var self = this, id, el, li = self.li, group, li_group = self.li_group;
		ids = idsArray(ids);
		for(var i=0; i < ids.length; i++){
			id = ids[i];
			el = li[id];
			if(el){
				self.size--;
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
		self.titleCount();
	},
	select: function(id){
		var self = this, el = self.li[id];
		el && el.firstChild.click();
		return el;
	},
	hideError: function() {
		hide( this.$.error );
	},
	showError: function( msg ) {
		var er = this.$.error;
		er.innerHTML = i18n( msg );
		show( er );
	},
	destroy: function(){
	}
});
