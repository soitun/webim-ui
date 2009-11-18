//not use.
//need change.. 
//
webim.ui.tabs = function(element, options){
        var self = this;
        self.element = $(element);
        self.options = $.extend({}, options);
        self._init();
};

$.extend(webim.ui.tabs.prototype, {
        _init: function(){
                var self = this, element = self.element, options = self.options;
                var ui = self.ui = {
                        nav: element.find(".webim-tabs-nav"),
                        content: element.find(".webim-tabs-content")
                };
                var list = ui.list = ui.nav.children();
		var anchors = ui.anchors = list.map(function() { return $('a', this)[0]; });
                var addState = function(state, el) {
			if (el.is(':not(.ui-state-disabled)')) {
				el.addClass('ui-state-' + state);
			}
		};
		var removeState = function(state, el) {
			el.removeClass('ui-state-' + state);
		};
		list.bind('mouseover.tabs', function() {
			addState('hover', $(this));
		});
		list.bind('mouseout.tabs', function() {
			removeState('hover', $(this));
		});
		anchors.bind('focus.tabs', function() {
			addState('focus', $(this).closest('li'));
		});
		anchors.bind('blur.tabs', function() {
			removeState('focus', $(this).closest('li'));
		});
                anchors.bind('blur.tabs', function() {
			removeState('focus', $(this).closest('li'));
		});
                anchors.bind('click.tabs', function() {
                        self.select(this);
                        return false;
		});
                
        },
        select: function(anchor){
                var self = this, ui = self.ui;
                if(typeof anchor == "number"){
                        anchor = ui.anchors.eq(anchor);
                }
                else{
                        anchor = $(anchor);
                }
                var li = anchor.closest("li").addClass("ui-state-active webim-tabs-selected");
                var panel = $("#" + anchor.attr("href").split("#")[1]).removeClass("webim-tabs-hide");
                ui.list.not(li).removeClass("ui-state-active webim-tabs-selected");
                ui.content.children().not(panel).addClass("webim-tabs-hide");
                
        },
        height: function(h){
                var self = this, element = self.element, ui = self.ui, nav = ui.nav, content = ui.content;
                if(h === undefined){
                        return element.outerHeight();
                }
                else{
                        var p_element = element.outerHeight() - element.height();
                        var p_content = content.outerHeight() - content.height();
                        content.height(h - p_element - p_content - nav.outerHeight());
                }
        }

});
