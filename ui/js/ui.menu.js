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
