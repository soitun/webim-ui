/* 
* ui.login:
*
*/
app("login", {
	init: function(options){
		options = options || {};
		var ui = this, im = ui.im;
		var loginUI = ui.login = new webimUI.login(null, options);
		options.container && options.container.appendChild( loginUI.element );
		loginUI.bind( "login", function( params ){
			im.online( params );
		});
	},
	go: function() {
		this.login.hide();
	},
	stop: function( type, msg ) {
		//type == "online" && this.login.showError( msg );
	}
});

widget("login", {
	questions: null,
	notice: "",
	template: '<div>  \
		<div id=":login" class="webim-login"> \
			<div class="webim-login-notice" id=":notice"></div>\
			<div class="ui-state-error webim-login-error ui-corner-all" style="display: none;" id=":error"></div>\
			<form id=":form">\
				<p><label for=":username"><%=username%></label><input name="username" id=":username" type="text" /></p>\
				<p><label for=":password"><%=password%></label><input name="password" id=":password" type="password" /></p>\
				<div id=":more">\
				<p><label for=":question"><%=question%></label><select name="question" id=":question" ></select></p>\
				<p><label for=":answer"><%=answer%></label><input name="answer" id=":answer" type="text" /></p>\
				</div>\
				<p><input name="submit" id=":submit" class="ui-state-default ui-corner-all webim-login-submit" value="<%=login%>" type="submit" /></p>\
			</form>\
		</div>'
},{
	_init: function() {
		var self = this, questions = self.options.questions, $ = self.$;
		if ( questions && questions.length ) {
			each( questions, function(n, v) {
				var option = document.createElement( "option" );
				option.value = v[0];
				option.innerHTML = v[1];
				$.question.appendChild( option );
			} );
		} else {
			hide( $.more );
		}
		$.notice.innerHTML = self.options.notice;
		
	},
	_initEvents: function() {
		var self = this, $ = self.$;
		hoverClass( $.submit, "ui-state-hover" );
		addEvent( $.form, "submit", function( e ) {
			self.trigger( "login", [{ username: $.username.value,  password: $.password.value, question: $.question.value, answer: $.answer.value }] );
			preventDefault( e );
		} );
	},
	hide: function() {
		hide( this.element );
	},
	show: function() {
		show( this.element );
	},
	hideError: function() {
		hide( this.$.error );
	},
	showError: function( msg ) {
		var er = this.$.error;
		er.innerHTML = i18n( msg );
		show( er );
	},
	destroy: function(){
	}
});

