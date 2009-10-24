var objectExtend = webim.objectExtend = {
	option: function(key, value) {
		var options = key, self = this;
		self.options = self.options || {};
		if (typeof key == "string") {
			if (value === undefined) {
				return self.options[key];
			}
			options = {};
			options[key] = value;
		}
		extend(self.options, options);
		return self;
	},

	bind: function(type, fn){
		var self = this, _events = self._events = self._events || {};
		if (isFunction(fn)){
			_events[type] = _events[type] || [];
			_events[type].push(fn);
		}
		return this;
	},

	trigger: function(type, args){
		var self = this, _events = self._events = self._events || {}, fns = _events[type];
		if (!fns) return this;
		args = isArray(args) ? args : makeArray(args);
		for (var i = 0, l = fns.length; i < l; i++){
			fns[i].apply(this, args);
		}
		return this;
	},

	unbind: function(type, fn){
		var self = this, _events = self._events = self._events || {};
		if (!_events[type]) return this;
		if (isFunction(fn)){
			for (var i = _events.length; i--; i){
				if (_events[i] === fn) _events.splice(i, 1);
			}
		} else {
			delete _events[type];
		}
		return this;
	}
};
