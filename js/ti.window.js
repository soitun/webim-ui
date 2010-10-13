/* webim ui window */

widget("window", {
	layout: true,
        isMinimized: false,
        minimizable: true,
        maximizable: false,
        closeable: true,
        count: 0, // notifyUser if count > 0
	//A box with position:absolute next to a float may disappear
	//http://www.brunildo.org/test/IE_raf3.html
	//here '<div><div id=":window"'
        template:'<div class="webim"><div id=":webim-window" class="webim-window ui-widget">\
                                            <div id=":window" class="webim-window-window webim-box">\
                                                    <div id=":header" class="webim-window-header ui-widget-header ui-corner-top">\
                                                    	<a id=":resize" title="<%=resize%>" class="webim-window-resize" href="#resize"><em class="ui-icon ui-icon-grip-diagonal-se"><%=resize%></em></a>\
                                                            <span id=":actions" class="webim-window-actions">\
                                                                    <a id=":maximize" title="<%=maximize%>" class="webim-window-maximize" href="#maximize"><em class="ui-icon ui-icon-plus"><%=maximize%></em></a>\
                                                                    <a id=":minimize" title="<%=minimize%>" class="webim-window-minimize" href="#minimize"><em class="ui-icon ui-icon-minus"><%=minimize%></em></a>\
                                                                    <a id=":close" title="<%=close%>" class="webim-window-close" href="#close"><em class="ui-icon ui-icon-close"><%=close%></em></a>\
                                                            </span>\
                                                            <h4 id=":headerTitle"><%=title%></h4>\
                                                            <div id=":subHeader" class="webim-window-subheader"></div>\
                                                    </div>\
                                                    <div id=":content" class="webim-window-content ui-widget-content webim-box webim-flex">\
                                                    </div>\
                                            </div>\
                                            </div></div>'
},
{
	html: function(obj){
		return this.$.content.appendChild(obj);
	},
	subHeader: function( obj ){
		//this.$.subHeader.innerHTML = "";
		return this.$.subHeader.appendChild(obj);
	},
	_init: function( element, options ) {
		var self = this, options = self.options, $ = self.$;
		element = self.element;
		options.name && addClass( element, "webim-" + options.name + "-window" );
		if ( window.Titanium ) {
			if ( options.layout ) {
				var win = Titanium.UI.createWindow( { 
					url: "app://ti.window.html",
						transparentBackground: true,
					height: 480,
					width: 480
				} );
				win.setUsingChrome( false );
				win.setMinHeight( 400 );
				win.setMinWidth( 400 );
				addEvent( win, Titanium.PAGE_INITIALIZED, function() {
					var doc = win.getWindow().document;
					self.__initEvents();
					doc.body.appendChild( element );
				} );
				win.open();
				self.window = win;
			} else {
				self.window = Titanium.UI.getCurrentWindow();
				self.__initEvents();
			}
		} else {
			addClass( element, "webim-browser" );
			if ( options.layout ) {
				document.body.appendChild( element );
			}
			self.__initEvents();
		}

		options.subHeader && self.subHeader( options.subHeader );
		self.title( options.title, options.icon );
		!options.minimizable && hide( $.minimize );
		!options.maximizable && hide( $.maximize );
		!options.closeable && hide( $.close );
		if(options.isMinimized){
			self.minimize();
		}else{
			self.restore();
		}
		options.count && self.notifyUser( "information", options.count );
	},
	notifyUser: function(type, count){
		var self = this, $ = self.$;
		if(type == "information"){
			if( self.isMinimized() ) {
				Titanium.UI.setBadge( count ? count.toString() : null );
			}
		}
	},
	_count: function(){
	},
	title: function(title, icon){
		var self = this, $ = self.$;
		$.headerTitle.innerHTML = title;
	},
	_changeState:function(state){
		var el = this.element, className = state == "restore" ? "normal" : state;
		replaceClass(el, "webim-window-normal webim-window-maximize webim-window-minimize", "webim-window-" + className);
		this.trigger("displayStateChange", [state]);
	},
	active: function(){
		return hasClass( this.element, "webim-window-active" );
	},
	maximize: function(){
		var self = this;
		if( self.isMaximized() ) {
			self.window.unmaximize();
			self._changeState( "restore" );
		} else {
			self.window.maximize();
			self._changeState( "maximize" );
		}
	},
	restore: function(){
		var self = this, window = self.window;
		if ( self.isMaximized() ) {
			window.unmaximize();
		} else if ( self.isMinimized() ) {
			window.unminimize();
		}
		if(hasClass(self.element, "webim-window-normal"))return;
		self._changeState("restore");
	},
	minimize: function(){
		var self = this;
		if(self.isMinimized())return;
		self.window.minimize();
		self._changeState("minimize");
	},
	resize: function(){
	},
	close: function(){
		var self = this;
		self.trigger("close");
		self.window.close();
	},
	__initEvents: function(){
		var self = this, element = self.element, $ = self.$;
		var stop = function(e){
			stopPropagation(e);
			preventDefault(e);
		};
		//resize
		var minimize = function(e){
			self.minimize();
		};
		//addEvent($.header, "click", minimize);
		//

		each( children( $.actions ), function(n,el){
			hoverClass(el, "ui-state-hover");
		});

		each(["minimize", "maximize", "close", "resize"], function(n,v){
			addEvent($[v], "click", function(e){
				if(!this.disabled)self[v]();
				stop(e);
			});
			addEvent($[v],"mousedown",stop);
		});
		if ( window.Titanium ) {
			var screenX = 0, screenY = 0,
			dragging = false, _x = 0, _y = 0,
			resizing = false, width = 0, height = 0,
			win = self.window, doc = self.window.getWindow().document;
			addEvent( doc, "mousemove", function( event ) {
				if ( dragging ) {
					win.setX( _x + event.screenX - screenX );
					win.setY( _y + event.screenY - screenY );
				} else if ( resizing ) {
					win.setWidth( width + event.screenX - screenX );
					win.setHeight( height + event.screenY - screenY );
				}
			});

			addEvent( $.header, "mousedown", function( event ) {
				dragging = true;
				_x = win.getX();
				_y = win.getY();
				screenX = event.screenX;
				screenY = event.screenY;
			});

			addEvent( $.resize, "mousedown", function( event ) {
				resizing = true;
				width = win.getWidth();
				height = win.getHeight();
				screenX = event.screenX;
				screenY = event.screenY;
			});

			addEvent( doc, "mouseup", function( event ) {
				dragging = false;
				resizing = false;
			});
		}
	},
	height:function(){
		return this.window.getHeight();
	},
	isActive: function(){
		return this.window && this.window.isActive();
	},
	isMaximized: function(){
		return this.window && this.window.isMaximized();
	},
	isMinimized: function(){
		return this.window && this.window.isMinimized();
	}
});

