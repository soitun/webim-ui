/**/
/*
* room
*attributes：
*data []所有信息 readonly 
*methods:
*	get(id)
*	handle()
*	join(id)
*	leave(id)
*	load()
*	count()
*	member_cont(id)
*events:
*/

model("room", {
	urls:{
		join: "/webim/join",
		leave: "/webim/leave"
	}
},{
	_init: function(){
		var self = this;
		self.data = self.data || [];
		self.dataHash = {};
	},
	get: function(id){
		return this.dataHash[id];
	},
	block: function(id){
		var self = this, d = self.dataHash[id];
		if(d && !d.blocked){
			d.blocked = true;
			var list = [];
			each(self.dataHash,function(n,v){
				if(v.blocked) list.push(v.id);
			});
			self.trigger("block",[id, list]);
		}
	},
	unblock: function(id){
		var self = this, d = self.dataHash[id];
		if(d && d.blocked){
			d.blocked = false;
			var list = [];
			each(self.dataHash,function(n,v){
				if(v.blocked) list.push(v.id);
			});
			self.trigger("unblock",[id, list]);
		}
	},
	handle: function(d){
		var self = this, data = self.data, dataHash = self.dataHash, status = {};
		each(d,function(k,v){
			var id = v.id;
			if(id){
				v.members = v.members || [];
				if(!dataHash[id]){
					dataHash[id] = v;
					data.push(v);
				}
				else extend(dataHash[id], v);
			}

		});
		var self = this;
		self.trigger("join",[data]);
	},
	addMember: function(room_id, info){
	},
	removeMember: function(room_id, info){
	},
	join:function(id){
		var self = this, options = self.options;
		ajax({
			cache: false,
			url: options.urls.join,
			data: {
				ticket: options.ticket,
				id: id
			},
			success: function(data){
				//self.trigger("join",[data]);
			}
		});
	},
	leave: function(id){
		var self = this, options = self.options, d = self.dataHash[id];
		if(d){
			ajax({
				cache: false,
				url: options.urls.leave,
				data: {
					ticket: options.ticket,
					id: id
				}
			});
			d.blocked = true;
			self.trigger("leave",[d]);
		}
	},
	clear:function(){
	}
});
