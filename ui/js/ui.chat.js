//
/* ui.chat:
 *
 options:
 window
 history

 methods:
 update(info)
 status(type)
 insert(text, isCursorPos)
 focus
 notice(text, timeOut)
 destroy()

 events: 
 sendMsg
 sendStatus

 */
 
function ieCacheSelection(e){
        document.selection && $.data(this, "caretPos", document.selection.createRange());
}
webim.widget("chat",{
        _init: function(){
                var self = this, element = self.element, options = self.options;
                var win = self.window = options.window;
                if(!element){
                        if(!win){
                                throw "[webim.ui.chat]Where is window?";
                                return;
                        }
                        element = self.element = $(tpl(options.template));
                        win.html(element);
                }
                element.data("chat", self);
                var ui = self.ui = {
                        header: element.find(".webim-chat-header"),
                        content: element.find(".webim-chat-content"),
                        actions: element.find(".webim-chat-actions"),
                        status: element.find(".webim-chat-status"),
                        tools: element.find(".webim-chat-tools"),
                        toolContent: element.find(".webim-chat-tool-content"),
                        notice: element.find(".webim-chat-notice"),
                        input: element.find(".webim-chat-input"),
                        user: element.find(".webim-user")
                };
                var userUI = ui.user;
                $.extend(self.ui,{
                        userPic: userUI.find(".webim-user-pic"),
                        userStatus: userUI.find(".webim-user-status")
                });
                var history = self.history = new webim.ui.history(null,{
                        userInfo: options.userInfo,
                        buddyInfo: options.buddyInfo
                });
                history.element.prependTo(ui.content);
                self._initEvents();
                if(win){
                        self._bindWindow();
                        //self._fitUI();
                }
                self.update(options.buddyInfo);
                history.add(options.history);
                webim.ui.plugin.call(self, "init", [null, self.plugin_ui()]);
                self._adjustContent();
        },
        update: function(buddyInfo){
                var self = this;
                if(buddyInfo){
                        self.option("buddyInfo", buddyInfo);
                        self.history.option("buddyInfo", buddyInfo);
                        self._updateInfo(buddyInfo);
                }
                var userOn = self.options.userInfo.presence == "online";
                var buddyOn = self.options.buddyInfo.presence == "online";
                if(!userOn){
                        self.notice(i18n("user offline notice"));
                }else if(!buddyOn){
                        self.notice(i18n("buddy offline notice",{name: buddyInfo.name}));
                }else{
                        self.notice("");
                }
        },
        focus: function(){
                this.ui.input.focus();
        },
        _noticeTime: null,
        _noticeTxt:"",
        notice: function(text, timeOut){
                var self = this, content = self.ui.notice, time = self._noticeTime;
                if(time)clearTimeout(time);
                if(!text){
                        self._noticeTxt = null;
                        content.hide();
                        return;
                }
                if(timeOut){
                        content.html(text).show();
                        setTimeout(function(){
                                if(self._noticeTxt)
                                content.html(self._noticeTxt);
                                else content.fadeOut(500);
                        }, timeOut);

                }else{
                        self._noticeTxt = text;
                        content.html(text).show();
                }
        },
        _adjustContent: function(){
                var content = this.ui.content;
                content.scrollTop(content[0].scrollHeight);
        },
        _fitUI: function(e){
                var self = (e && e.data && e.data.self) || this, win = self.window, ui = self.ui;
                self._adjustContent();
                
        },
        _focus: function(e, type){
                var self = e.data.self;
                if(type != "minimize"){
                        self.ui.input.focus();
                        self._adjustContent();
                }
        },
        _bindWindow: function(){
                var self = this, win = self.window;
                win.bind("displayStateChange", {self: self}, self._focus);
                //win.bind("resize",{self: self}, self._fitUI);
        },
        _onHistoryUp:function(e){
                var self = (e && e.data && e.data.self) || this;
                self._adjustContent();
        },
        _inputAutoHeight:function(){
                var el = this.ui.input, scrollTop = el[0].scrollTop;
                if(scrollTop > 0){
                        var h = el.height();
        	        if(h> 32 && h < 100) el.height(h + scrollTop);
                }
        },
        _inputkeyup: function(e){
                ieCacheSelection.call(this);
                var self = e.data.self;
                //self._inputAutoHeight();
        },
        _sendMsg: function(val){
                var self = this, options = self.options, buddyInfo = options.buddyInfo;
                var msg = {
                        type: "msg",
                        to: buddyInfo.id,
                        from: options.userInfo.id,
                        stype: '',
                        offline: buddyInfo.presence == "online" ? 0 : 1,
                        body: val,
                        timestamp: (new Date()).getTime()
                };
                webim.ui.plugin.call(self, "send", [null, self.plugin_ui({msg: msg})]);
                self.trigger('sendMsg', msg);
                //self.sendStatus("");
        },
        _inputkeypress: function(e){
                var self = (e && e.data && e.data.self) || this, ui = self.ui;
                if (e.keyCode == 13){
                	if(e.ctrlKey){
                		self.insert("\n", true);
                		return true;
                	}else{
                                var el = $(this), val = el.val();
                                if ($.trim(val)) {
                                        self._sendMsg(val);
                                        el.val('');
                                        e.preventDefault();
                                }
                        }
                }
                else self._typing();
 
        },
        _onFocusInput: function(e){
                var self = e.data.self, el = e.target;
                
                //var val = el.setSelectionRange ? el.value.substring(el.selectionStart, el.selectionEnd) : (window.getSelection ? window.getSelection().toString() : (document.selection ? document.selection.createRange().text : ""));
                var val = window.getSelection ? window.getSelection().toString() : (document.selection ? document.selection.createRange().text : "");
                if(!val)self.ui.input.focus();
        },
        _initEvents: function(){
                var self = this, options = self.options, ui = self.ui, placeholder = i18n("input notice"), gray = "webim-gray", input = ui.input;
                self.history.bind("update",{self:self}, self._onHistoryUp).bind("clear", function(){
                        self.notice(i18n("clear history notice"), 3000);
                });
            //输入法中，进入输入法模式时keydown,keypress触发，离开输入法模式时keyup事件发生。
            //autocomplete之类事件放入keyup，回车发送事件放入keydown,keypress

                input.bind('keyup',{self:self}, self._inputkeyup).click(ieCacheSelection).select(ieCacheSelection).focus(function(){
                        input.removeClass(gray);
                        if(this.value == placeholder)this.value = "";
                }).blur(function(){
                        if(this.value == ""){
                                input.addClass(gray);
                                this.value = placeholder;
                        }
                }).bind("keypress", {self: self},self._inputkeypress);
                ui.content.bind("click", {self : self}, self._onFocusInput);
 
        },
        _updateInfo:function(info){
        		var self = this, ui = self.ui;
        		ui.userPic.attr("href", info.url);
        		ui.userPic.children().attr("src", info.pic_url);
        		ui.userStatus.html(info.status);
        		self.window.title(info.name);
        },
        insert:function(value, isCursorPos){
        //http://hi.baidu.com/beileyhu/blog/item/efe29910f31fd505203f2e53.html
        	var self = this,input = self.ui.input;
        	input.focus();
                if(!isCursorPos){
                        input.val(value);
                        return;
                }
        	if(!value) value = "";
        	input = input.get(0);
                        if(input.setSelectionRange){
  				var val = input.value, rangeStart = input.selectionStart, rangeEnd = input.selectionEnd, tempStr1 = val.substring(0,rangeStart), tempStr2 = val.substring(rangeEnd), len = value.length;  
                                input.value = tempStr1+value+tempStr2;  
                                input.setSelectionRange(rangeStart+len,rangeStart+len);
  			}else if(document.selection){
                                var caretPos = $.data(input, "caretPos");
  				if(caretPos){
                                        caretPos.text = value;
                                        caretPos.collapse();
                                        caretPos.select();
                                }
 				else{
 				 	input.value += value;
 				}
                        }else{
 				input.value += value;
                        }
        },
        _statusText: '',
        sendStatus: function(show){
            var self = this;
            if (!show || show == self._statusText) return;
            self._statusText = show;
            self.trigger('sendStatus', {
                    to: self.options.buddyInfo.id,
                    show: show
            });
        },
        _checkST: false,
        _typing: function(){
            var self = this;
            self.sendStatus("typing");
            if (self._checkST) 
                clearTimeout(self._checkST);
            self._checkST = window.setTimeout(function(){
                self.sendStatus('clear');
            }, 6000);
        },
        _setST: null,
        status: function(type){
                //type ['typing']
                type = type || 'clear';
                var self = this, el = self.ui.status, name = self.options.buddyInfo.name, markup = '';
                markup = type == 'clear' ? '' : name + i18n(type);
                el.html(markup);
                self._adjustContent();
                if (self._setST)  clearTimeout(self._setST);
                if (markup != '') 
                        self._setST = window.setTimeout(function(){
                                el.html('');
                        }, 10000);
        },
        destroy: function(){
                this.window.close();
        },
        plugin_ui:function(extend){
                var self = this;
                return $.extend({
                        self: self,
                        ui: self.ui,
                        history: self.history
                }, extend);
        },
        plugins: {}
});
webim.ui.chat.defaults = {
        event:'click',
        template:'                                        <div class="webim-chat"> \
                                                <div class="webim-chat-header ui-widget-subheader">  \
                                                        <div class="webim-user"> \
                                                                <a class="webim-user-pic" href="#id"><img src="about:blank"></a> \
                                                                <span title="" class="webim-user-status">Hello</span> \
                                                        </div> \
                                                </div> \
                                                                                                                                        <div class="webim-chat-notice-wrap"><div class="webim-chat-notice ui-state-highlight"></div></div> \
                                                <div class="webim-chat-content"> \
                                                                                                                <div class="webim-chat-status webim-gray"></div> \
                                                </div> \
                                                <div class="webim-chat-actions"> \
                                                        <div class="webim-chat-tool-content"></div>\
                                                        <div class="webim-chat-tools ui-helper-clearfix ui-state-default"></div>\
                                                        <table class="webim-chat-t" cellSpacing="0"> \
                                                                <tr> \
                                                                        <td style="vertical-align:top;"> \
                                                                        <em class="webim-icon webim-icon-chat"></em>\
                                                                        </td> \
                                                                        <td style="vertical-align:top;width:100%;"> \
                                                                        <div class="webim-chat-input-wrap">\
                                                                                <textarea class="webim-chat-input webim-gray">{{input notice}}</textarea> \
                                                                        </div> \
                                                                        </td> \
                                                                </tr> \
                                                        </table> \
                                                </div> \
                                        </div>'
};

webim.ui.chat.defaults.emot = true;
webim.ui.plugin.add("chat","emot",{
        init:function(e, ui){
                var chat = ui.self;
                var emot = new webim.ui.emot(null,{
                    select: function(e, alt){
                        chat.focus();
                        chat.insert(alt, true);
                    }
                });
                var trigger = $(tpl('<a href="#chat-emot" title="{{emot}}"><em class="webim-icon webim-icon-emot"></em></a>')).click(function(){
                        emot.toggle();
                        return false;
                });
                ui.ui.toolContent.append(emot.element);
                ui.ui.tools.append(trigger);
        },
        send:function(e, ui){
        }
});
webim.ui.chat.defaults.clearHistory = true;
webim.ui.plugin.add("chat","clearHistory",{
        init:function(e, ui){
                var chat = ui.self;
                var trigger = $(tpl('<a href="#chat-clearHistory" title="{{clear history}}"><em class="webim-icon webim-icon-clear"></em></a>')).click(function(){
                        chat.trigger("clearHistory",[chat.options.buddyInfo]);
                        return false;
                });
                ui.ui.tools.append(trigger);
        }
});
