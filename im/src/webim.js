/*
*
* Depends:
* 	core.js
*
*
*/
function webim(element, options){
	this._init(element, options);
}
//_webim = window.webim;
window.webim = webim;
extend(webim,{
	version:"@VERSION",
	defaults:{},
	idsArray:idsArray
});
function model(name, defaults, proto){
	function m(data,options){
		var self = this;
		self.data = data;
		self.options = extend({}, m.defaults,options);
		isFunction(self._init) && self._init();
	}
	m.defaults = defaults;
	extend(m.prototype, objectExtend, proto);
	webim[name] = m;
}

function idsArray(ids){
	return ids && ids.split ? ids.split(",") : (isArray(ids) ? ids : []);
}
