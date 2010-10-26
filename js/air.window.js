/* webim ui window */

widget( "window", {
	main: false,
        isMinimized: false,
        minimizable: true,
        maximizable: false,
	layoutUrl: "app:/test/air.window.html",
	iconUrl: "app:/images/logo128.png",
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
	html: function( obj ) {
		return this.$.content.appendChild( obj );
	},
	subHeader: function( obj ){
		//this.$.subHeader.innerHTML = "";
		return this.$.subHeader.appendChild( obj );
	},
	_init: function( element, options ) {
		var self = this, options = self.options, $ = self.$;
		element = self.element;
		options.name && addClass( element, "webim-" + options.name + "-window" );
		if ( window.runtime ) {
			if ( !options.main ) {
				var visibleBounds = air.Screen.mainScreen.visibleBounds;
				var bounds = new air.Rectangle(
					/* left */ (visibleBounds.width - 480)/2, 
					/* top */ (visibleBounds.height - 480)/2, 
					/* width */ 480,
					/* height */ 480
				);
				var op = new air.NativeWindowInitOptions();
				op.transparent = true;
				//op.type = air.NativeWindowType.LIGHTWEIGHT;
				op.systemChrome = air.NativeWindowSystemChrome.NONE;
				var loader = air.HTMLLoader.createRootWindow(  true, op, false, bounds );
				//loader.placeLoadStringContentInApplicationSandbox = true;
				//loader.paintsDefaultBackground = false;
				loader.navigateInSystemBrowser = true;
				//loader.stage.nativeWindow.alwaysInFront = true;
				//loader.stage.nativeWindow.title = "sdfwe";
				loader.load( new air.URLRequest( self.options.layoutUrl ) );
				var ready = false;
				addEvent( loader, air.Event.COMPLETE, function() {
					if ( !ready ) {
						ready = true;
						self.window = loader.window;
						self.__initEvents();
						loader.window.document.body.appendChild( element );
					}
				} );
			} else {
				self.window = window;
				self.__initEvents();
			}
		} else {
			addClass( element, "webim-browser" );
			if ( !options.main ) {
				document.body.appendChild( element );
			}
			self.__initEvents();
		}

		options.subHeader && self.subHeader( options.subHeader );
		self.title( options.title, options.icon );
		!options.minimizable && hide( $.minimize );
		!options.maximizable && hide( $.maximize );
		!options.closeable && hide( $.close );
		options.count && self.notifyUser( "information", options.count );
	},
	notifyUser: function( type, count ) {
		var self = this, $ = self.$;
		if( type == "information" ) {
			if( self.isMinimized() ) {
				//Titanium.UI.setBadge( count ? count.toString() : null );
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
		replaceClass( el, "webim-window-normal webim-window-maximize webim-window-minimize", "webim-window-" + className );
		this.trigger( "displayStateChange", [state] );
	},
	maximize: function(){
		var self = this, win = self.window.nativeWindow;
		if( self.isMaximized() ) {
			self.restore();
		} else {
			win.maximize(); 
			self._changeState( "maximize" );
		}
	},
	restore: function() {
		var self = this, win = self.window.nativeWindow;
		win && win.restore();
		if(hasClass(self.element, "webim-window-normal"))return;
		self._changeState("restore");
	},
	minimize: function() {
		var self = this, win = self.window.nativeWindow;
		if( self.isMinimized() ) {
		} else {
			win.minimize(); 
			self._changeState( "minimize" );
		}
	},
	resize: function(){
	},
	close: function(){
		var self = this;
		if ( self.options.main ) {
			self.window.nativeWindow.visible = false;
		} else {
			self.window.nativeWindow.close();
		}
	},
	__initEvents: function() {
		var self = this, element = self.element, $ = self.$;
		var stop = function(e){
			stopPropagation(e);
			preventDefault(e);
		};

		each( children( $.actions ), function( n ,el ){
			hoverClass(el, "ui-state-hover");
		});

		each(["minimize", "maximize", "close", "resize"], function( n ,v ) {
			addEvent($[v], "click", function( e ){
				if(!this.disabled) self[v]();
				stop(e);
			});
			addEvent($[v],"mousedown",stop);
		});
		if ( window.runtime ) {
			var win = self.window.nativeWindow, doc = self.window.document,
			plat = "osx";
			//self.window.htmlLoader.filters = window.runtime.Array(
			//	new window.runtime.flash.filters.DropShadowFilter(6, 75, 0, .4, 12, 12)
			//);
			//addClass( doc.body, plat );

			addEvent( doc, "keydown", function( event ) {
				/* Close
				* osx: cmd+w metaKey+87
				* win32: alt+f4
				* Minmize
				* osx: cmd+m metaKey+77
				**/
				return;
				if ( event.metaKey && event.keyCode == 87 ) {
					self.close();
				} else if ( event.metaKey && event.keyCode == 77 ) {
					self.minimize();
				}
			} );

			addEvent( $.headerTitle, "dblclick", function() {
				if ( self._os.mac ) {
					self.minimize();
				} else {
					self.maximize();
				}
			} );

			addEvent( $.header, "mousedown", function( event ) {
				if( self.isMaximized() ) return false;
				win.startMove();
			});

			addEvent( $.resize, "mousedown", function( event ) {
				win.startResize( air.NativeWindowResize.BOTTOM_RIGHT );
			});

			if ( self.options.main ) {
				//Show window when activate the application.
				var active = function(){
					!win.visible && ( win.visible = true );
				};
				//addEvent( air.NativeApplication.nativeApplication, air.Event.ACTIVATE, active );
				addEvent( air.NativeApplication.nativeApplication, air.InvokeEvent.INVOKE, active );
				//Set application icon
				var loader = new air.Loader();
				addEvent(loader.contentLoaderInfo, air.Event.COMPLETE, function( e ){
					air.NativeApplication.nativeApplication.icon.bitmaps = new runtime.Array(e.target.content.bitmapData);
				});
				loader.load(new air.URLRequest( self.options.iconUrl ) );
			}
			//Bind events
			addEvent( win, air.NativeWindowBoundsEvent.RESIZE, function( e ) {
				self.trigger( "resize", e );
			});

			addEvent( win, air.NativeWindowBoundsEvent.MOVE, function( e ) {
				self.trigger( "move", e );
			});

			addEvent( win, air.Event.ACTIVATE, function( e ) {
				self.trigger( "activate", e );
			});
			addEvent( win, air.Event.DEACTIVATE, function( e ) {
				self.trigger( "deactivate", e );
			});
			addEvent( win, air.Event.CLOSE, function( e ) {
				self.trigger( "close", e );
			});
		}
	},
	activate: function() {
		return this.window && this.window.nativeWindow.activate();
	},
	isActive: function() {
		return this.window && this.window.nativeWindow.active;
	},
	isMaximized: function() {
		return this.window && this.window.nativeWindow.displayState == air.NativeWindowDisplayState.MAXIMIZED;
	},
	isMinimized: function() {
		return this.window && this.window.nativeWindow.displayState == air.NativeWindowDisplayState.MINIMIZED;
	},
	_os: ( function(){
		var s = window.runtime && air.Capabilities.os;
		return {
			mac: /Mac/i.test(s),
			win: /Windows/i.test(s),
			linux: /Linux/i.test(s)
		}
	} )()
});

