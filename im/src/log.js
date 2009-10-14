//测试模式使用 
//webim.log.enable();打开log记录
//webim.log.disable();关闭记录
//webim.log(log,action);记录log
webim.log = log;
var _logable = true;
function log(str, action){
        if (!_logable) 
        return;
        action = action ? (action + ':') : ':';
        var d = new Date(),  prefix = ['[', d.getHours(), ':', d.getMinutes(), ':', d.getSeconds(), '-', d.getMilliseconds(), ']', action].join(""), msg = prefix + toString(str);
        window.console && window.console.log(prefix); //firebug
        window.console && window.console.log(str); 
	//cosole.log("%s: %o",msg,this);
	var log = $("#webim-log");
        window.air && window.air.trace(msg); //air
        if (!log.size()) 
        return;
        log.append('<p>' + msg + '</p>');
        log.scrollTop(log.get(0).scrollHeight);
}
log.enable = function(){
	_logable = true;
};
log.disable = function(){
       	_logable = false;
};
