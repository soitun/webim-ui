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

function returnFalse(){
	return false;
}

var _toString = Object.prototype.toString;

function isFunction( obj ){
	return _toString.call(obj) === "[object Function]";
}

function isArray( obj ){
	return _toString.call(obj) === "[object Array]";
}

function trim( text ) {
	return (text || "").replace( /^\s+|\s+$/g, "" );
}

function checkUpdate (old, add){
        var added = false;
        if (isObject(add)) {
                old = old || {};
                for (var key in add) {
                        var val = add[key];
                        if (old[key] != val) {
                                added = added || {};
                                added[key] = val;
                        }
                }
        }
        return added;
}
function makeArray( array ) {
		var ret = [];
		if( array != null ){
			var i = array.length;
			// The window, strings (and functions) also have 'length'
			if( i == null || typeof array === "string" || isFunction(array) || array.setInterval )
				ret[0] = array;
			else
				while( i )
					ret[--i] = array[i];
		}
		return ret;
}

function extend() {
	// copy reference to target object
	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction(target) )
		target = {};
	for ( ; i < length; i++ )
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null )
			// Extend the base object
			for ( var name in options ) {
				var src = target[ name ], copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy )
					continue;

				// Recurse if we're merging object values
				if ( deep && copy && typeof copy === "object" && !copy.nodeType )
					target[ name ] = extend( deep, 
						// Never move original objects, clone them
						src || ( copy.length != null ? [ ] : { } )
					, copy );

				// Don't bring in undefined values
				else if ( copy !== undefined )
					target[ name ] = copy;

			}

	// Return the modified object
	return target;
}

function idsArray(ids){
	return ids && ids.split ? ids.split(",") : (isArray(ids) ? ids : []);
}

// util

//function mapId(a){ return isObject(a) ? a.id : a }
//var mapFrom = function(a){ return a.from; };
//var _idsHashToArray = function(ids){
//        var _ids = [];
//        for(var k in ids){
//                if(ids[k]) _ids.push(k);
//        }
//        return _ids;
//};
//var idsArray = webim.idsArray = function(ids){
//        return ids ? (ids.split ? ids.split(",") : (isObject(ids) ?  _idsHashToArray(ids) : ($.isArray(ids) ? $.map(ids, mapId) : $.makeArray(ids)))) : [];
//};
//



