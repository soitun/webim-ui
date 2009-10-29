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
        handle:function(data){
                var self = this;
                if(data.messages.length)
                self.trigger("message",[data.messages]);
                if(data.presences.length)
                self.trigger("presence",[data.presences]);
                if(data.statuses.length)
                self.trigger("status",[data.statuses]);
        },
        sendMsg: function(msg){
                var self = this;
                msg.ticket = self.data.connection.ticket;
                ajax({
                        type: 'post',
                        url: self.options.urls.message,
                        type: 'post',
                        cache: false,
                        data: msg
                });
        },
        sendStatus: function(msg){
                var self = this;
                msg.ticket = self.data.connection.ticket;
                ajax({
                        type: 'post',
                        url: self.options.urls.status,
                        type: 'post',
                        cache: false,
                        data: msg
                });
        },
//        online_list:function(){
//                var self = this;
//                ajax({
//                        type:"post",
//                        dataType: "json",
//                        url: self.options.urls.online_list,
//                        success: function(data){
//                                self.trigger("online_list", [data]);
//                        },
//                        error: function(data){
//                                log(data, "online:error");
//                        }
//                });
//
//        },
        setStranger: function(ids){
                this.stranger_ids = idsArray(ids);
        },
        stranger_ids:[],
        online:function(){
                var self = this, status = self.status, ids = idsArray(status("tabIds"));
                status("o", false);
                self.ready();
                ajax({
                        type:"post",
                        dataType: "json",
                        data:{
                                buddy_ids: ids.join(","),
                                stranger_ids: self.stranger_ids.join(",")
                        },
                        url: self.options.urls.online,
                        success: function(data){
                        		if(!data || !data.user || !data.connection){
                        			
                        			self.stop(null, "online error");
                                	log(data, "online:error");
                        		}else{
                        			data.user = extend(self.data.user, data.user);
                                	self.data = data;
                                	self.go();
                        		}
                                
                        },
                        error: function(data){
                                self.stop(null, "online error");
                                log(data, "online:error");
                        }
                });

        },
        offline:function(){
                var self = this, data = self.data;
                self.status("o", true);
                self.connection.close();
                self.layout.removeAllChat();
                self.stop();
                ajax({
                        type: 'post',
                        url: self.options.urls.offline,
                        type: 'post',
                        cache: false,
                        data: {
                                status: 'offline',
                                ticket: data.connection.ticket
                        }
                });
 
        },
        refresh:function(){
                var self = this, data = self.data;
                if(!data || !data.connection || !data.connection.ticket) return;
                ajax({
                        type: 'post',
                        url: self.options.urls.refresh,
                        type: 'post',
                        cache: false,
                        data: {
                                ticket: data.connection.ticket
                        }
                });
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
