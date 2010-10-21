
widget( "tabs", {
	template: '<div class="webim-tabs">\
		<ul id=":nav" class="webim-tabs-nav ui-helper-clearfix"></ul>\
			</div>',
	panel: false
}, {
	_init: function() {
		var self = this, 
		options = self.options;
		self.panels = {};
		self.navs = {};
	},
	add: function( panel, label, icon ) {
		var self = this, 
		nav = self.$.nav,
		el = self.navs[label] = createElement( '<li class="ui-corner-top ui-state-default"><a href="#">' + label + '</a></li>' ); 
		addClass( panel = $( panel ), "ui-helper-hidden-accessible" );
		self.panels[label] = panel; 
		nav.appendChild( el );
		self.options.panel && self.options.panel.appendChild( panel );
		self._tabEvent( el, label );
	},
	select: function( label ) {
		var el = this.navs[ label ];
		el && triggerEvent( children( el )[0], "click" );
	},
	_tabEvent: function( tab, label ) {
		var self = this, el = children( tab )[0];
		addEvent( el, "click", function( e ) {
			each( self.panels, function( k, v ) {
				addClass( v, "ui-helper-hidden-accessible" );
			} );
			each( self.navs, function( k, v ) {
				removeClass( v, "ui-state-active" );
			} );
			removeClass( self.panels[ label ], "ui-helper-hidden-accessible" );
			addClass( self.navs[ label ], "ui-state-active" );
			preventDefault( e );
		} );
	}
});
