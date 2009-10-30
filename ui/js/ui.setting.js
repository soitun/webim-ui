//
/* ui.setting:
 *
 options:
 	data

 attributes：

 methods:
 check_tag

 destroy()
 events: 
 change

 */
widget("setting",{
        template: '<div id="webim-setting" class="webim-setting">\
                        <ul id=":ul"><%=tags%></ul>\
                  </div>',
        tpl_check: '<li id=":<%=name%>"><input type="checkbox" <%=checked%> id="webim-setting-<%=name%>" name="<%=name%>"/><label for="webim-setting-<%=name%>"><%=label%></label></li>'
},{
        _init: function(){
                this._initEvents();
        },
	template: function(){
		var self = this, temp = [], data = self.options.data;
		data && each(data, function(key, val){
			temp.push(self._check_tpl(key, val));
		});
		return tpl(self.options.template,{
		   tags:temp.join("")
		});
	},
	_initEvents:function(){
		var self = this, data = self.options.data, $ = self.$;
		data && each(data, function(key, val){
			$[key] && self._check_event($[key]);
		});
	},
	_check_tpl: function(name, isChecked){
		return tpl(this.options.tpl_check,{
			label: i18n(name),
			name: name,
			checked: isChecked ? 'checked="checked"' : ''
		});
	},
	_check_event: function(el){
		var self = this;
		addEvent(el.firstChild, "click", function(e){
                        self._change(this.name, this.checked);
		});
	},
        check_tag: function(name, isChecked){
		var self = this;
		if(isObject(name)){
			each(name, function(key,val){
				self.check_tag(key, val);
			});
			return;
		}
                var $ = self.$, tag = $[name];
                if(tag){
                        tag.firstChild.checked = isChecked;
                        return;
                }
		var el = $[name] = createElement(self._check_tpl(name, isChecked));
		self._check_event(el);
		$.ul.appendChild(el);
        },
        _change:function(name, value){
                this.trigger("change", [name, value]);
        },
        destroy: function(){
        }
});
