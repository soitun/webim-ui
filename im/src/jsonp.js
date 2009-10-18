//var jsonpSettings = {
//	url: location.href,
//	timeout: 30,
//	jsonp:"callback",
//	success:function(data){},
//	error:function(s){}
//};
function emptyFunction(){}
function jsonp(s){
	s = extend({}, s);
	var data = "" + param(s.data),
	callbackContext = s.context || window,
	jsonp = "jsonp" + jsc++,
	head = document.getElementsByTagName("head")[0] || document.documentElement,
	script = document.createElement("script");
	data = (data ? (data + "&") : "") + (s.jsonp || "callback") + "=" + jsonp;
	s.url += (rquery.test( s.url ) ? "&" : "?") + data;
	script.src = s.url;
	if ( s.scriptCharset ) {
		script.charset = s.scriptCharset;
	}
	// Handle Script loading
	var done = false;
	window[ jsonp ] = function(tmp){
		s.success && s.success.call( callbackContext, tmp, "success" );
		destroy();
	};
	// Attach handlers for all browsers
	script.onload = script.onreadystatechange = function(){
		if(!done){
			//error
			error("error");
			destroy();
		}
	};
	if ( s.timeout > 0 ) {
		setTimeout(function(){
			if (!done){
				error("timeout");
				destroy();
				// The script may be loading.
				window[ jsonp ] = emptyFunction;
			}
		}, s.timeout);
	}
	// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
	head.insertBefore( script, head.firstChild );
	// We handle everything using the script element injection
	return undefined;
	function destroy(){
		done = true;
		// Garbage collect
		window[ jsonp ] = undefined;
		try{ delete window[ jsonp ]; } catch(e){}
		// Handle memory leak in IE
		script.onload = script.onreadystatechange = null;
		//if ( head ) {
		if ( head && script.parentNode ) {
			head.removeChild( script );
		}
	}
	function error(status){
		s.error && s.success.call( callbackContext, data, status );
	}
}
