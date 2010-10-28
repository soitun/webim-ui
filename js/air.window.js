/* webim air window 
*
* http://help.adobe.com/en_US/air/reference/html/flash/desktop/NativeApplication.html#event:activate
*
*/

widget( "window", {
	main: false,
	visible: true,
        maximizable: true,
        minimizable: true,
        closeable: true,
	resizable: true,
	closeToHide: false,
	layout: "app:/test/air.window.html",
        //count: 0, // notifyUser if count > 0
	//A box with position:absolute next to a float may disappear
	//http://www.brunildo.org/test/IE_raf3.html
	//here '<div><div id=":window"'
        template: '<div class="webim"><div id=":webim-window" class="webim-window ui-widget">\
                                            <div id=":window" class="webim-window-window webim-box">\
                                                    <div id=":header" class="webim-window-header ui-widget-header ui-corner-top">\
                                                    	<a id=":resize" title="<%=resize%>" class="webim-window-resize" href="#resize"><em class="ui-icon ui-icon-grip-diagonal-se"><%=resize%></em></a>\
                                                            <span id=":actions" class="webim-window-actions">\
                                                                    <a id=":maximize" title="<%=maximize%>" class="webim-window-maximize ui-state-default ui-corner-all" href="#maximize"><em class="ui-icon ui-icon-plus"><%=maximize%></em></a>\
                                                                    <a id=":minimize" title="<%=minimize%>" class="webim-window-minimize ui-state-default ui-corner-all" href="#minimize"><em class="ui-icon ui-icon-minus"><%=minimize%></em></a>\
                                                                    <a id=":close" title="<%=close%>" class="webim-window-close ui-state-default ui-corner-all" href="#close"><em class="ui-icon ui-icon-close"><%=close%></em></a>\
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
				loader.stage.nativeWindow.title = options.title;
				loader.load( new air.URLRequest( self.options.layout ) );
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

		options.subHeader && self.header( options.subHeader );
		!options.minimizable && hide( $.minimize );
		!options.maximizable && hide( $.maximize );
		!options.closeable && hide( $.close );
		!options.resizable && hide( $.resize );
	},
	__initEvents: function() {
		var self = this, element = self.element, $ = self.$;
		self.title( self.options.title );
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
				if ( os == 'mac' ) {
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
			} );

			if ( self.options.main ) {
				//Show window when activate the application.
			}

			//Bind events
			addEvent( win, air.NativeWindowBoundsEvent.RESIZE, function( e ) {
				self.d( "resize", e );
			} );

			addEvent( win, air.NativeWindowBoundsEvent.MOVE, function( e ) {
				self.d( "move", e );
			} );

			addEvent( win, air.Event.ACTIVATE, function( e ) {
				self.d( "activate", e );
			} );
			addEvent( win, air.Event.DEACTIVATE, function( e ) {
				self.d( "deactivate", e );
			} );
			addEvent( win, air.Event.CLOSING, function( e ) {
				if ( self.options.closeToHide ) {
					self.hide();
					e.preventDefault();
				}
			} );
			addEvent( win, air.Event.CLOSE, function( e ) {
				self.d( "close", e );
			} );
			addEvent( win, air.NativeWindowDisplayStateEvent.DISPLAY_STATE_CHANGE, function( e ) {
				replaceClass( el, "webim-window-normal webim-window-maximized webim-window-minimized", "webim-window-" + e.afterDisplayState );
				self.d( "displayStateChange", e );
			} );
		}
	},
	content: function( obj ) {
		obj ? this.$.content.appendChild( obj ) : this.$.content.innerHTML = "";
	},
	header: function( obj ) {
		obj ? this.$.subHeader.appendChild( obj ) : this.$.subHeader.innerHTML = "";
	},
	title: function( title ) {
		var self = this;
		self.$.headerTitle.innerHTML = title;
		self.options.title = title;
		//Set air window title
		self.window && ( self.window.nativeWindow.title = title );
	},
	icon: function( url ) {
		var self = this;
		self.options.title = title;
	},
	notifyUser: function( type ) {
		//air.NotificationType.INFORMATIONAL: informational
		//air.NotificationType.CRITICAL: critical
		var self = this;
		// Mac os is not support notification.
		window.runtime && air.NativeWindow.supportsNotification && self.window && self.window.nativeWindow.notifyUser( type );
	},
	show: function() {
		var win = this.win;
		if ( win ) {
			win.nativeWindow.visible = true;
			//Restore when window is minimized
			self.isMinimized() && win.nativeWindow.restore();
		}
	},
	hide: function() {
		this.window && ( this.window.nativeWindow.visible = false );
	},
	maximize: function() {
		var self = this;
		if( self.isMaximized() ) {
			self.restore();
		} else {
			self.window && self.window.nativeWindow && self.window.nativeWindow.maximize(); 
		}
	},
	restore: function() {
		var self = this;
		self.window && self.window.nativeWindow && self.window.nativeWindow.restore(); 
	},
	minimize: function() {
		var self = this;
		if( !self.isMinimized() ) {
			self.window && self.window.nativeWindow && self.window.nativeWindow.minimize(); 
		}
	},
	close: function() {
		var self = this;
		if ( self.options.closeToHide ) {
			self.hide();
		} else {
			self.window && self.window.nativeWindow && self.window.nativeWindow.close(); 
		}
	},
	activate: function() {
		var win = this.window && this.window.nativeWindow;
		win && win.activate();
/*
if ( win ) {
self.show();
win.restore();
win && win.activate();
win.orderToFront();
air.NativeApplication.nativeApplication.activate( win );
}
*/
	},
	isActive: function() {
		return this.window && this.window.nativeWindow.active;
	},
	isMaximized: function() {
		return this.window && this.window.nativeWindow.displayState == air.NativeWindowDisplayState.MAXIMIZED;
	},
	isMinimized: function() {
		return this.window && this.window.nativeWindow.displayState == air.NativeWindowDisplayState.MINIMIZED;
	}
} );

var os = window.runtime && air.Capabilities.os;
os = /Mac/i.test( os ) ? "mac" : ( /Windows/i.test( os ) ? "win" : (/Linux/i.test( os ) ? "linux" : "unknown" ) );
