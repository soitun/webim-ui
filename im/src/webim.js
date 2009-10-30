/*
*
* Depends:
* 	core.js
*
* options:
*
* attributes:
* 	data
* 	status
* 	setting
* 	history
* 	buddy
* 	connection
*
*
* methods:
* 	online
* 	offline
* 	sendMsg
* 	sendStatus
* 	setStranger
*
* events:
* 	ready
* 	go
* 	stop
*
* 	message
* 	presence
* 	status
*/


function webim(element, options){
	var self = this;
	self.options = extend({}, webim.defaults, options);
	this._init(element, options);
}

extend(webim.prototype, objectExtend,{
	_init:function(){
		var self = this;
		self.data = {user:{}};
		self.status = new webim.status();
		self.setting = new webim.setting();
		self.buddy = new webim.buddy();
		self.history = new webim.history();
		self.connection = new comet(null,{jsonp:true});
		self._initEvents();
		//self.online();
	},
	ready: function(){
		var self = this;
		self._unloadFun = window.onbeforeunload;
		window.onbeforeunload = function(){
			self.refresh();
		};
		self.trigger("ready");
	},
	go: function(){
		var self = this, data = self.data, history = self.history, buddy = self.buddy;
		self.connection.connect(data.connection);
		history.option("userInfo", data.user);
		history.init(data.histories);
		buddy.handle(data.buddies);
		self.trigger("go");
	},
	stop: function(){
		var self = this, layout = im.layout;
		window.onbeforeunload = self._unloadFun;
		self.data.user.presence = "offline";
		self.buddy.clear();
		self.trigger("stop", msg);

	},
	_initEvents: function(){
		var self = this, status = self.status, setting = self.setting, history = self.history, connection = self.connection;
                connection.bind("connect",function(e, data){
                        log(data, "connect:success");
                }).bind("data",function(data){
                        im.handle(data);
                }).bind("error",function(data){
                        im.stop("connect error");
                        log(data, "connect:error");
                }).bind("close",function(data){
                        im.stop("disconnect");
                        log(data, "connect:close");
                });
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
		var self = this, status = self.status, ids = idsArray(status.get("tabIds"));
		//set auto open true
		status.set("o", false);
		self.ready();
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
		//self.layout.removeAllChat();
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
	}

});
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
//_webim = window.webim;
window.webim = webim;

extend(webim,{
	version:"@VERSION",
	defaults:{},
	log:log,
	idsArray:idsArray
});

