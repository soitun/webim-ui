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
        template:'<div class="webim-window ui-widget">\
                                            <div class="webim-window-tab-wrap">\
                                            <div class="webim-window-tab ui-state-default">\
                                            <div class="webim-window-tab-inner">\
                                                    <div class="webim-window-tab-tip">\
                                                            <strong>{{tooltip}}</strong>\
                                                    </div>\
                                                    <a title="{{close}}" class="webim-window-close" href="#close"><em class="ui-icon ui-icon-close">{{close}}</em></a>\
                                                    <div class="webim-window-tab-count">\
                                                            0\
                                                    </div>\
                                                    <em class="webim-icon webim-icon-chat"></em>\
                                                    <h4>{{title}}</h4>\
                                            </div>\
                                            </div>\
                                            </div>\
                                            <div class="webim-window-window">\
                                                    <div class="webim-window-header ui-widget-header ui-corner-top">\
                                                            <span class="webim-window-actions">\
                                                                    <a title="{{minimize}}" class="webim-window-minimize" href="#minimize"><em class="ui-icon ui-icon-minus">{{minimize}}</em></a>\
                                                                    <a title="{{maximize}}" class="webim-window-maximize" href="#maximize"><em class="ui-icon ui-icon-plus">{{maximize}}</em></a>\
                                                                    <a title="{{close}}" class="webim-window-close" href="#close"><em class="ui-icon ui-icon-close">{{close}}</em></a>\
                                                            </span>\
                                                            <h4>{{title}}</h4>\
                                                    </div>\
                                                    <div class="webim-window-content ui-widget-content">\
                                                    </div>\
                                            </div>\
                                            </div>'
},
{
	_create: function(options){
		var self = this;
		var template = tpl(options.template);
		self._init($(template), options);
	},
	html: function(str){
		return this.ui.content.html(str);
	},
	_init: function(element, options){
		var self = this;
		options = self.options = $.extend({},options);
		self.changeElement($(element));
		element = self.element;
		element.data("window", self);
		element.addClass(options.className); //extend class
		var ui = self.ui = {
			tab: element.find(".webim-window-tab:first"),
			header: element.find(".webim-window-header:first"),
			content: element.find(".webim-window-content:first"),
			actions: element.find(".webim-window-actions:first"),
			resize_se: element.find(".webim-resizable-se:first")
		};
		$.extend(ui,{
			minimize: ui.actions.find(".webim-window-minimize"),
			maximize: ui.actions.find(".webim-window-maximize"),
			close: ui.actions.find(".webim-window-close").add(ui.tab.find(".webim-window-close")),
			tabIcon: ui.tab.find(".webim-icon"),
			tabTip: ui.tab.find(".webim-window-tab-tip"),
			tabTipC: ui.tab.find(".webim-window-tab-tip strong"),
			tabCount: ui.tab.find(".webim-window-tab-count"),
			headerTitle: ui.header.find("h4"),
			tabTitle: ui.tab.find("h4")
		});
		ui.title = ui.headerTitle.add(ui.tabTitle);
		options.tabWidth && ui.tab.width(options.tabWidth);
		self.title(options.title, options.icon);
		!options.minimizable && ui.minimize.hide();
		!options.maximizable && ui.maximize.hide();
		!options.closeable && ui.close.hide();
		if(options.isMinimize){
			self.minimize();
		}else{
			self.restore();
		}
		if(options.onlyIcon){
			ui.title.filter(":last").hide();
		}else{
			ui.tabTip.remove();
		}
		options.count && self.notifyUser("information", options.count);
		self._initEvents();
		self._fitUI();
		//setTimeout(function(){self.trigger("ready");},0);
		winManager(self);
	},
	notifyUser: function(type, count){
		var self = this, ui = self.ui;
		if(type == "information"){
			if(self.isMinimize()){
				if(_countDisplay(ui.tabCount, count))ui.tab.addClass("ui-state-highlight");
			}
		}
	},
	_count: function(){
		return _countDisplay(this.ui.tabCount);
	},
	title: function(title, icon){
		var self = this, ui = self.ui, tabIcon = ui.tabIcon;
		if(icon){
			if(isUrl(icon)){
				tabIcon.attr("class", "webim-icon").css("background-image","url("+ icon +")");
			}
			else{
				tabIcon.attr("class", "webim-icon webim-icon-" + icon);
			}
		}
		ui.tabTipC.html(title);
		ui.tabTitle.html(subVisibleLength(title, 0, self.options.titleVisibleLength));
		return ui.headerTitle.html(title);
	},
	_changeState:function(state){
		var el = this.element, className = state == "restore" ? "normal" : state;
		el.removeClass("webim-window-normal webim-window-maximize webim-window-minimize").addClass("webim-window-" + className);
		this.trigger("displayStateChange", [state]);
	},
	active: function(){
		return this.element.hasClass("webim-window-active");
	},
	activate: function(){
		var self = this;
		if(self.active())return;
		self.element.addClass("webim-window-active");
		self.trigger("activate");
	},
	deactivate: function(){
		var self = this;
		if(!self.active())return;
		self.element.removeClass("webim-window-active");
		if(!self.options.sticky) self.minimize();
		self.trigger("deactivate");
	},
	_setVisibile: function(){
		var self = this, ui = self.ui;
		ui.tab.addClass("ui-state-active");
		self.activate();
		_countDisplay(ui.tabCount, 0);
		ui.tab.removeClass("ui-state-highlight");
	},
	maximize: function(){
		var self = this;
		if(self.isMaximize())return;
		self._setVisibile();
		self._changeState("maximize");
	},
	restore: function(){
		var self = this;
		if(self.element.hasClass("webim-window-normal"))return;
		self._setVisibile();
		self._changeState("restore");
	},
	minimize: function(){
		var self = this;
		if(self.isMinimize())return;
		self.ui.tab.removeClass("ui-state-active");
		self.deactivate();
		self._changeState("minimize");
	},
	close: function(){
		var self = this;
		self.trigger("close");
		self.element.remove();
	},
	_initEvents:function(){
		var self = this, element = self.element, ui = self.ui;
		//resize
		var minimize = function(e){
			self.minimize();
		};
		ui.header.bind("click", minimize);
		ui.tab.click(function(e){
			if(self.isMinimize())self.restore();
			else self.minimize();
			stop(e);
		}).hover(_hoverCss, _outCss).mousedown(stop).disableSelection();
		var stop = function(e){
			e.stopPropagation();
			e.preventDefault();
		};
		$.each(["minimize", "maximize", "close"], function(n,v){
			ui[v].bind("click", function(e){
				if(!this.disabled)self[v]();
				stop(e);
			}).bind("mousedown",stop);
		});

	},
	height:function(){
		return this.ui.content.height();
	},
	_fitUI: function(bounds){
		return;
	},
	isMaximize: function(){
		return this.element.hasClass("webim-window-maximize");
	},
	isMinimize: function(){
		return this.element.hasClass("webim-window-minimize");
	}
});
var winManager = (function(){
	var curWin = false;
	var deactivateCur = function(){
		curWin && curWin.deactivate();
		curWin = false;
		return true;
	}
	var activate = function(e){
		var win = $(this).data("window");
		win && win != curWin && deactivateCur() && (curWin = win);
	};
	var deactivate = function(e){
		var win = $(this).data("window");
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
	$(function(){
		$(document).bind("mousedown",function(e){
			var el = $(e.target);
			el = el.hasClass("webim-window") ? el : el.parents(".webim-window:first");
			if(el.length){
				var win = el.data("window");
				win && win.activate();
			}else{
				deactivateCur();
			}
		});
	});
	return function(win){
		register(win);
	}
})();
