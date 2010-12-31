/* 
* ui.logmsg
*
* Log user message to db.
*
* options:
*
* methods:
* 
* events: 
* 
*/

app("logmsg", {
	init: function(options){
		var ui = this, im = ui.im;
		im.connection.bind("data",function(data){
			var messages = data && data.messages;
			for (var i = 0; i < messages.length; i++) {
				var msg = messages[i];
				msg.ticket = im.data.connection.ticket;
				im.request({
					type: 'post',
					url: im.options.urls.logmsg,
					cache: false,
					data: msg
				});
			};
		});
	}
});

