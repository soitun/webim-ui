webim = window.webim;
//webim.extend(webim.setting.defaults.data,{});
//webim.extend(webim.setting.defaults.data,{block_list: ["1000001"]});
_path = "./";
webim.ui.emot.init({"dir": _path + "images/emot/default"});
var ui = new webim.ui(document.body, {
	soundUrls: {
		lib: _path + "assets/sound.swf",
		msg: _path + "assets/sound/msg.mp3"
	}
}), im = ui.im;
im.buddy.bind("online", function(data){
	webim.each(data, function(n,d){ d.pic_url = "test/" + d.pic_url;});
});
im.bind("go", function(data){
	data.connection.server = "im/test/" + data.connection.server;
});
//ui.addApp("menu", {"data": menu});
//ui.layout.addShortcut( menu);
ui.addApp("buddy");
ui.addApp("room");
ui.addApp("notification");
ui.addApp("setting", {"data": webim.setting.defaults.data});
ui.render();
//im.online();
