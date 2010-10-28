app( "layout", function( options ) {
	options = options || {};
	var ui = this, im = ui.im;
	layoutUI = new webimUI.layout( options.layout, options.layoutOptions );
	ui.addApp( "login", extend( { container: layoutUI.element }, options.loginOptions ) );
	ui.addApp( "user", extend( { container: layoutUI.window.$.subHeader }, options.userOptions ) );
	im.a( "online", function(){
		layoutUI.showContent();
	});
	layoutUI.window.header( layoutUI.tabs.element );
	return layoutUI;
} );

widget("layout", {
	template: '<div id=":layout" class="webim-layout webim-flex webim-box">\
		<div id=":widgets" class="webim-widgets webim-flex webim-box webim-hide"></div>\
		<div id=":shortcut" class="webim-shortcut ui-widget-header webim-hide"></div>\
	</div>'
}, {
	_init: function( element, options ){
		var self = this, 
		options = self.options;
		extend( self, {
			window: new webimUI.window( null, {
				main: true,
				closeToHide: true,
				name: "layout",
				title: "webim",
				maximizable: true,
				icon: ""
			} ),
			widgets : {},
			chats: {},
			tabs: new webimUI.tabs( null, {
				panel: self.$.widgets
			} ),
			chatWindows : {}
		} );
		addClass( self.tabs.element, "webim-hide" );
		self.window.content( self.element );
		if ( window.runtime ) {
			//Get icons
			var supportIcon = false,
			na = air.NativeApplication,
			nan = na.nativeApplication,
			winIcon = nan.icon,
			iconUrl,
			xmlobject = ( new DOMParser() ).parseFromString( nan.applicationDescriptor, "text/xml" ),
			showWin = function() {
				self.window.show();
			};
			addEvent( nan, air.Event.EXITING, function( e ) {
				self.window.options.closeToHide = false;
			} );
			if( na.supportsSystemTrayIcon ) {
				supportIcon = true;
				iconUrl = xmlobject.getElementsByTagName("image16x16")[0].textContent;
				addEvent( winIcon, 'click', showWin );
				winIcon.tooltip = self.window.options.title;
			} else if ( na.supportsDockIcon ) { //Mac
				supportIcon = true;
				iconUrl = xmlobject.getElementsByTagName("image128x128")[0].textContent;
				addEvent( nan, air.InvokeEvent.INVOKE, showWin );
				self._badge = window.runtime.de && window.runtime.de.mattesgroeger.air.icon.AirIconBadge;
			}
			if ( supportIcon ) {
				var loader = new air.Loader();
				addEvent( loader.contentLoaderInfo, air.Event.COMPLETE, function( e ){
					var d = e.target.content.bitmapData;
					winIcon.bitmaps = new runtime.Array( d );
					try {
						self._badge && ( self._badge.customIcon =  new runtime.flash.display.Bitmap( d ) );
					} catch(e){
					}
				} );
				loader.load( new air.URLRequest( "app:/" + iconUrl ) );
				if ( !na.supportsDockIcon ) {
					var menu = new air.NativeMenu(),
					logout = new air.NativeMenuItem( i18n("logout") );
					addEvent( logout, air.Event.SELECT, function( e ) {
						nan.exit();
					} );
					menu.addItem( logout );
					winIcon.menu = menu;
				}
			}
		}
	},
	_initEvents: function(){
		var self = this, win = self.window, $ = self.$;
		//Ie will call resize events after onload.
		return;
		var c = false;
		addEvent(win,"resize", function(){
			if(c){
				c = true;
				self.buildUI();
			}
		});
		addEvent($.next,"mousedown", function(){self._slide(-1);});
		addEvent($.next,"mouseup", function(){self._slideUp();});
		disableSelection($.next);
		addEvent($.prev,"mousedown", function(){self._slide(1);});
		addEvent($.prev,"mouseup", function(){self._slideUp();});
		disableSelection($.prev);
		addEvent($.expand, "click", function(){
			if(!self.isMinimize()) return false;
			self.expand();
			self.d("expand");
			return false;
		});
		addEvent($.collapse, "click", function(){
			if(self.isMinimize()) return false;
			self.collapse();
			self.d("collapse");
			return false;
		});
		hoverClass($.collapse, "ui-state-hover", "ui-state-default");
		hoverClass($.expand, "ui-state-hover", "ui-state-default");
	},
	render: function() {
		document.body.appendChild( this.window.element );
	},
	widget:function(name){
		return this.widgets[name];
	},
	addWidget: function( widget, options ) {
		var self = this, 
		$ = self.$,
		container = options.container,
		winOptions = extend( options, { main: false, closeable: false, subHeader: widget.header } ),
		win, el = widget.element;
		self.widgets[widget.name] = widget;
		widget.widget_title = options.title;
		if ( container == "window" ) {
			win = new webimUI.window(null, winOptions);
			win.content( el );
			widget.container = win;
		} else if ( container == "tab" ) {
			self.tabs.add( widget.element, options.title, options.icon );
			self.tabs.select( options.title );
		}
		//self.$[container ? container : "widgets"].insertBefore(win.element, before && self.widgets[before] ? self.widgets[before].window.element : null);
		//win.a("displayStateChange", function(state){ self._widgetStateChange(this, state);});
	},
	showWidget: function( widget_name ) {
		var self = this;
		self.tabs.select( self.widgets[ widget_name ].widget_title );
	},
	focusChat: function( type, id ) {
		id = _id_with_type( type, id );
		var self = this, win = self.chatWindows[id], chat = self.chats[id];
		win && win.activate();
		//win && win.isMinimize() && win.restore();
		chat && chat.focus();
	},
	chat:function( type, id ){
		return this.chats[_id_with_type(type, id)];
	},
	updateChat: function( type, data ){
		data = makeArray(data);
		var self = this, info, l = data.length, chat;
		for(var i = 0; i < l; i++){
			info = data[i];
			chat = self.chats[_id_with_type( type, info.id )];
			chat && chat.update( info );
		}
	},
	updateAllChat: function() {
		each( this.chats, function( k,v ) {
			v.update();
		} );
	},
	addChat: function( type, id, chatUI ) {
		var self = this, chats = self.chats;
		id = _id_with_type( type, id );
		if( !chats[ id ] ) {
			var win = self.chatWindows[id] = new webimUI.window( null, {
				main: false,
				name: "chat",
				title: "webim",
				maximizable: true,
				icon: ""
			} ).a( "close", function() {
				delete self.chatWindows[ id ];
				delete self.chats[ id ];
			} );
			chatUI.setWindow( win );
			chats[id] = chatUI;
		}
	},
	removeChat: function( type, id ) {
		//ids = idsArray(ids);
		//var self = this, id, l = ids.length, win;
		//for(var i = 0; i < l; i++){
		//win = this.chatWindows[ids[i]];
		var win = this.chatWindows[_id_with_type(type, id)];
		win && win.close();
		//}
	},
	removeAllChat: function() {
		each(this.chatWindows, function(n, win){
			win.close();
		});
	},
	showContent: function() {
		removeClass( this.$.widgets, "webim-hide" );
		removeClass( this.tabs.element, "webim-hide" );
		removeClass( this.$.shortcut, "webim-hide" );
	},
	setBadge: function( num ) {
		try {
			this._badge.label = num.toString();
		} catch (e) {}
	},
	notifyUser: function( type ) {
		window.runtime && air.NativeApplication.supportsDockIcon && air.NativeApplication.nativeApplication.icon.bounce( type );
	}
} );

function _id_with_type(type, id){
	return id ? (type == "b" || type == "buddy" || type == "unicast" ? ("b_" + id) : ("r_" + id)) : type;
}
