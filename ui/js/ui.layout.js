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
<div id="webim-layout" class="webim-layout webim-webapi"><div class="webim-ui ui-helper-clearfix  ui-toolbar">\
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
		var self = this;
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

		return;
		self.addShortcut(options.shortcuts);
		self._initEvents();
		options.isMinimize && self.collapse();
		self.element.parent("body").length && self.buildUI();
		//test
	},
	_ready:false,
	buildUI: function(e){
		var self = (e && e.data && e.data.self) || this, ui = self.ui;
		//var w = self.element.width() - ui.shortcut.outerWidth() - ui.apps.outerWidth() - 55;
		var w = ($(window).width() - 45) - ui.shortcut.outerWidth() - ui.apps.outerWidth() - 70;
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
					tab.element.show();
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
					tab.element.hide();
				}
			}
			else {
				tab.pos = 0;
				tab.element.show();
			}
		}
		if (!all) {
			self.setNextMsgNum(nextN);
			self.setPrevMsgNum(prevN);
		}
	},
	setNextMsgNum: function(num){
		_countDisplay(this.ui.nextMsgCount, num);
	},
	setPrevMsgNum: function(num){
		_countDisplay(this.ui.prevMsgCount, num);
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

				self.ui.tabs.animate({
					left: -1 * self.tabWidth * self.nextCount
				}, 500, function(){
					if (self.slideing) 
						self._slide(direction);
					else {
						self._fitUI();
						self._slideReset();
					}
				});
		}

	},
	_sildeUp: function(){
		this.slideing = false;

	},
	_slideSetup: function(reset){
		var self = this, ui = self.ui, tabsWrap = ui.tabsWrap, tabs = ui.tabs;

		if (!self._tabsWidth) {
			self._tabsWidth = tabs.width();
		}
		if (reset) {
			self._tabsWidth = null;
		}
		tabsWrap.css({
			position: reset ? '' : 'relative',
			overflow: reset ? 'visible' : 'hidden',
			width: reset ? '' : self._tabsWidth
		});
		tabs.width(reset ? '' : self.tabWidth * self.tabIds.length).css('position', reset ? '' : 'relative');
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
		var self = this, ui = self.ui, pcount = self.prevCount, ncount = self.nextCount;
		if (ncount <= 0) {
			ui.next.addClass('ui-state-disabled');
		}
		else {
			ui.next.removeClass('ui-state-disabled');
		}
		if (pcount <= 0) {
			ui.prev.addClass('ui-state-disabled');
		}
		else {
			ui.prev.removeClass('ui-state-disabled');
		}
		if (pcount > 0 || ncount > 0) {
			ui.next.show();
			ui.prev.show();
		}
		else {
			ui.next.hide();
			ui.prev.hide();
		}
		ui.nextCount.html(ncount.toString());
		ui.prevCount.html(pcount.toString());
	},
	_initEvents: function(){
		var self = this, win = self.window, ui = self.ui;
		win.bind("resize",{self: self}, self.buildUI);
		ui.next.mousedown(function(){
			self._slide(-1);
		}).mouseup(function(){
			self._sildeUp();
		}).disableSelection();
		ui.prev.mousedown(function(){
			self._slide(1);
		}).mouseup(function(){
			self._sildeUp();
		}).disableSelection();
		ui.expand.click(function(){
			self.expand();
			return false;
		});
		ui.collapse.click(function(){
			self.collapse();
			return false;
		});
	},
	isMinimize: function(){
		return this.element.hasClass("webim-webapi-minimize");
	},
	collapse: function(){
		if(this.isMinimize()) return;
		this.element.addClass("webim-webapi-minimize");
		this.trigger("collapse");
	},
	expand: function(){
		if(!this.isMinimize()) return;
		this.element.removeClass("webim-webapi-minimize");
		this.trigger("expand");
	},
	_displayUpdate:function(e){
		this._ready && this.trigger("displayUpdate");
	},
	_fitUI: function(){
		var self = this, ui = self.ui, apps = ui.apps;
		self._updateCount();
		self.ui.tabs.css('left', -1 * self.tabWidth * self.nextCount);
		self._updateCountUI();
		self._setVisibleTabs();
		//self.tabs.height(h);
		self._displayUpdate();
	},
	_stickyWin: null,
	_appStateChange:function(e, state){
		var self = e.data.self, win = e.data.win;
		if(state != "minimize")
			$.each(self.apps, function(key, val){
				if(val.window != win){
					val.window.minimize();
				}
			});
			self._displayUpdate();
	},
	app:function(name){
		return this.apps[name];
	},
	addApp: function(app, options, container){
		var self = this, options = extend(options,{closeable: false});
		var win, el = app.element;
		win = new webim.ui.window(null, options);
		win.html(el);
		self.$[container ? container : "apps"].appendChild(win.element);
		app.window = win;
		win.bind("displayStateChange", {self: self, win: win}, self._appStateChange);
		self.apps[app.widgetName] = app;
	},
	focusChat: function(id){
		var self = this, tab = self.tabs[id];
		tab && tab.isMinimize() && tab.restore();
	},
	chat:function(id){
		return this.panels[id];
	},
	updateChat: function(data){
		data = $.makeArray(data);
		var self = this, info, l = data.length, panel;
		for(var i = 0; i < l; i++){
			info = data[i];
			panel = self.panels[info.id];
			panel && panel.update(info);
		}
	},
	updateAllChat:function(){
		$.each(this.panels, function(k,v){
			v.update();
		});
	},
	_onChatClose:function(e){
		var self = e.data.self, id = e.data.id;
		self.tabIds = $.grep(self.tabIds, function(v, i){
			return v != id;
		});
		delete self.tabs[id];
		delete self.panels[id];
		self._changeActive(id, true);
		self._fitUI();
	},
	_onChatChange:function(e, type){
		var self = e.data.self, id = e.data.id;
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
			var win = self.tabs[id] = new webim.ui.window(null, $.extend({
				isMinimize: self.activeTabId || !self.options.chatAutoPop,
				tabWidth: self.tabWidth -2
			},winOptions)).bind("close", {self: self, id: id}, self._onChatClose).bind("displayStateChange", {self: self, id: id}, self._onChatChange);
			self.tabIds.push(id);
			self.ui.tabs.prepend(win.element);
			chat = panels[id] = new webim.ui.chat(null, $.extend({
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
		if($.isArray(title)){
			$.each(title, function(n,v){
				self.addShortcut(v);
			});
			return;

		}else if(isObject(title)){
			self.addShortcut(title.title, title.icon, title.link, title.isExtlink);
			return;
		}else if(typeof title != "string"){
			return;
		}
		var self = this, content = self.ui.shortcut, temp = self.options.template_s;
		self.menu.add(title,icon,link, isExtlink);
		if(content.children().length > self.options.shortcutLength)return;
		temp = $(tpl(temp,{title: i18n(title), icon: icon, link: link, target: isExtlink ? "_blank" : ""}));

		temp.find("a").hover(_hoverCss, _outCss);
		content.append(temp);
	},
	addWindow: function(){
		new webim.ui.window(null, {
		});
	},
	online: function(){
		var self = this, ui = self.ui;
	},
	offline: function(){
		var self = this, ui = self.ui;
	}

});
