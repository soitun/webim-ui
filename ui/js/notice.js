var sound = (function(){
        var playSound = true;
        var play = function(url){
            try {
                document.getElementById('webim-flashlib').playSound(url ? url : '/sound/sound.mp3');
            } 
            catch (e){
            }
        };
        var _urls = {
                lib: "sound.swf",
                msg:"sound/msg.mp3"
        };
        return {
                enable:function(){
                        playSound = true;
                },
                disable:function(){
                        playSound = false;
                },
                init: function(urls){
                        extend(_urls, urls);
                        swfobject.embedSWF(_urls.lib + "?_" + new Date().getTime(), "webim-flashlib-c", "100", "100", "9.0.0", null, null, {
                        allowscriptaccess:'always'
                        }, {
                            id: 'webim-flashlib'
                        });
                    
                },
                play: function(type){
                        var url = isUrl(type) ? type : _urls[type];
                        playSound && play(url);
                }
        }
})();


var titleShow = (function(){
	var _showNoti = false;
	addEvent(window,"focus",function(){
		_showNoti = false;
	});
	addEvent(window,"blur",function(){
		_showNoti = true;
	});
	var title = document.title, t = 0, s = false, set = null;
	return  function(msg, time){
		if(!_showNoti) 
			return;
		if(set){
			clearInterval(set);
			t = 0;
			s = false;
		}

		var set = setInterval(function(){
			t++;
			s = !s;
			if (t == time || !_showNoti) {
				clearInterval(set);
				t = 0;
				s = false;
			}
			if (s) {
				document.title = "[" + msg + "]" + title;
			}
			else {
				document.title = title;
			}
		}, 1500);
	}
})();
