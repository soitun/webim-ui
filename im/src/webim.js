/*
*
* Depends:
* 	core.js
*
*
*/

function idsArray(ids){
	return ids && ids.split ? ids.split(",") : (isArray(ids) ? ids : []);
}
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
function webim(element, options){
	var self = this;
	self.options = extend({}, webim.defaults, options);
	this._init(element, options);
}
//_webim = window.webim;
window.webim = webim;

extend(webim,{
	version:"@VERSION",
	defaults:{},
	log:log,
	idsArray:idsArray
});


extend(webim.prototype, objectExtend,{
	_init:function(){
		var self = this;
		self.status = new webim.status();
		self.setting = new webim.setting();
		self.buddy = new webim.buddy();
		self.history = new webim.history();
		self.online();
	},
	online:function(){
		var self = this, status = self.status, ids = idsArray(status.get("tabIds"));
		//status("o", false);
		//self.ready();
		ajax({
			type:"post",
			dataType: "json",
			data:{                                
				buddy_ids: ids.join(",")
			},
			url: self.options.urls.online,
			success: function(data){
				if(!data || !data.user || !data.connection){

					self.stop(null, "online error");
					log(data, "online:error");
				}else{
					data.user = $.extend(self.data.user, data.user);
							     self.data = data;
							     self.go();
				}

			},
			error: function(data){
				self.stop(null, "online error");
				log(data, "online:error");
			}
		});

	}

});
