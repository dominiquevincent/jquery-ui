/*
 * jQuery UI Panel @VERSION
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Panel
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function($) {

$.widget("ui.panel", {
	
	options: {
		header: "> li > :first-child,> :not(li):even",
		icons: {
			header: "ui-icon-triangle-1-e",
			headerSelected: "ui-icon-triangle-1-s"
		}
	},
	
	_create: function() {
		this.element.addClass("ui-panel ui-widget ui-helper-reset");
		
		var o = this.options, self = this;
		this.headers = this.element
			.find(o.header)
			.addClass("ui-panel-header ui-helper-reset ui-state-default ui-corner-all")
			.bind("mouseenter.panel", function() {
				if (self.options.disabled) {
					return;
				}
				$(this).addClass('ui-state-hover');
			})
			.bind("mouseleave.panel", function() {
				$(this).removeClass('ui-state-hover');
			})
			.bind("focus.panel", function() {
				if ( self.element.attr( "tabIndex" ) && 
					self.element.attr( "tabIndex" ) != $(this).attr( "tabIndex" ) ) {
//					console.log("tabIndex"+$(this).attr( "tabIndex" ));
					$(this).attr( "tabIndex", self._tabIndex());
					// after a change of tabindex attribute we get the focus but we shouldn't
					// TODO go to next tabIndex element
					return;
				}
				$(this).addClass('ui-state-focus');
			})
			.bind("blur.panel", function() {
				$(this).removeClass('ui-state-focus');
			})
			.bind( "keydown.panel", function(e) { 
				return self._keydown( e ); 
			});
		this._createIcons();
		
		this.element.bind( "focus.panel", function(e) { 
			if ( self.element.attr( "tabIndex" ) ) {
//				console.log(self.tabIndex+"*"+self.headers.filter("[tabIndex="+self.tabIndex+"]").length);
				self.headers.filter("[tabIndex="+self.tabIndex+"]").attr("tabIndex",self._tabIndex());
				// after a change of tabindex attribute we get the focus but we shouldn't
				// TODO go to next tabIndex element
				return;
			}
		});
		//ARIA
		this.element.attr( "role","tablist" );

		this.headers
			.attr( "role","tab" )
			.attr( "aria-expanded","false" )
			.attr( "tabIndex", "-1" )
			.next()
			.attr( "role","tabpanel" )
			.addClass( "ui-panel-content ui-helper-reset ui-widget-content ui-corner-bottom" )
			.hide();
			
		this.headers.eq( 0 ).attr( "tabIndex",this._tabIndex() );

		// only need links in taborder for Safari
//		if ( !$.browser.safari )
			this.headers.find( "a" ).attr( "tabIndex","-1" );
			
		if (o.event) {
			this.headers.bind((o.event) + ".panel", function(event) {
				self._clickHandler.call( self,$(this) );
				event.preventDefault();
			});
		}
	},
	
	destroy: function() {
		$.Widget.prototype.destroy.apply(this, arguments);
		this.element
			.removeClass( "ui-panel ui-widget ui-helper-reset" )
			.removeAttr( "role" );
		if ( this.tabIndex ) {
			this.element.attr( "tabIndex",this.tabIndex );
		}

		this.headers
			.unbind( ".panel" )
			.removeClass( "ui-panel-header ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-corner-top ui-state-animation-running" )
			.removeAttr( "role" )
			.removeAttr( "aria-expanded" )
			.removeAttr( "tabindex" );

		this.headers
			.find( "a" )
			.removeAttr( "tabIndex" );
		this._destroyIcons();
		var contents = this.headers.next()
			.css( "display", "" )
			.removeAttr( "role" )
			.removeClass( "ui-helper-reset ui-widget-content ui-corner-bottom ui-panel-content ui-panel-content-active" );
	},
	
	_setOption: function(key, value) {
		$.Widget.prototype._setOption.apply(this, arguments);
			
		if (key == "icons") {
			this._destroyIcons();
			if (value) {
				this._createIcons();
			}
		}
		
	},
	
	_keydown: function(event) {

		var o = this.options, keyCode = $.ui.keyCode;

		if (o.disabled || event.altKey || event.ctrlKey)
			return;

		var length = this.headers.length;
		var currentIndex = this.headers.index( event.target );
		var toFocus = false;

		switch(event.keyCode) {
			case keyCode.RIGHT:
			case keyCode.DOWN:
				toFocus = this.headers[(currentIndex + 1) % length];
				break;
			case keyCode.LEFT:
			case keyCode.UP:
				toFocus = this.headers[(currentIndex - 1 + length) % length];
				break;
			case keyCode.SPACE:
			case keyCode.ENTER:
				this._clickHandler( $(event.target) );
				event.preventDefault();
		}

		if (toFocus) {
			$(event.target).attr( "tabIndex","-1" );
			$(toFocus).attr( "tabIndex",this._tabIndex() );
			toFocus.focus();
			return false;
		}

		return true;

	},

	_createIcons: function() {
		var o = this.options;
		if (o.icons) {
			$("<span/>").addClass("ui-icon " + o.icons.header).prependTo(this.headers);
			this.headers.filter(".ui-state-active").find(".ui-icon").removeClass(o.icons.header).addClass(o.icons.headerSelected);
			this.element.addClass("ui-panel-icons");
		}
	},
	
	_destroyIcons: function() {
		this.headers.children(".ui-icon").remove();
		this.element.removeClass("ui-panel-icons");
	},
	
	_clickHandler: function( header ) {
		var	panel = header.next(),
			self=this,
			o = this.options;

		if (self.options.disabled) {
			return;
		}
		if ( header.hasClass("ui-state-animation-running") ) {
			return;
		}		
		header.addClass("ui-state-animation-running")
			.toggleClass("ui-state-active ui-corner-top ui-corner-all")
			.find(".ui-icon")
			.toggleClass(this.options.icons.headerSelected)
			.toggleClass(this.options.icons.header);
		if (o.animated) {
			panel.toggleClass( "ui-panel-content-active" )
				.slideToggle( "fast",function() {
					self._animationComplete( header );
				}
			);
		} else {
			panel.toggleClass( "ui-panel-content-active" )
				.toggle();
			self._animationComplete( header );
		}
	},
	
	_animationComplete: function( header ) {
	
		if ( header.hasClass( "ui-state-active" ) ) {
			header.attr( "aria-expanded","true" )
				.attr( "tabIndex", this._tabIndex() );
		}
		header.removeClass("ui-state-animation-running");
	},
	
	_tabIndex: function() {
		var tabIndex = this.element.attr( "tabIndex" );
		if ( !tabIndex ) {
			tabIndex = this.tabIndex ? this.tabIndex : "0";
		} else {
			this.tabIndex = tabIndex; 
			this.element.removeAttr( "tabIndex" );
		}
		return tabIndex;
	}
});

}(jQuery));