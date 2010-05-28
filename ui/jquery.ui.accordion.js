/*
 * jQuery UI Accordion @VERSION
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.panel.js
 */
(function($) {
var panel = $.ui.panel;

$.widget( "ui.accordion", panel, {
	options: {
		active: 0,
		animated: "slide", 
		autoHeight: true,
		clearStyle: false,
		collapsible: false,
		event: "click",
		fillSpace: false,
		header: "> li > :first-child,> :not(li):even",
		icons: {
			header: "ui-icon-triangle-1-e",
			headerSelected: "ui-icon-triangle-1-s"
		},
		navigation: false,
		navigationFilter: function() {
			return this.href.toLowerCase() == location.href.toLowerCase();
		}
	},

	_create: function() {

		var o = this.options, 
			self = this,
			active;

		panel.prototype._create.call( this );
		this.element.addClass( "ui-accordion" );
		
		// in lack of child-selectors in CSS we need to mark top-LIs in a UL-accordion for some IE-fix
		if ( this.element[0].nodeName == "UL" ) {
			this.element.children( "li" ).addClass( "ui-accordion-li-fix" );
		}

		this.headers = this.element.find( o.header ).addClass( "ui-accordion-header" );

		this.headers.next().addClass( "ui-accordion-content" );

		if ( o.navigation ) {
			var current = this.element.find( "a" ).filter( o.navigationFilter );
			if ( current.length ) {
				var header = current.closest( ".ui-accordion-header" );
				if ( header.length ) {
					// anchor within header
					this.active = header;
				} else {
					// anchor within content
					this.active = current.closest( ".ui-accordion-content" ).prev();
				}
			}
		}

		this.resize();
		this.active = this._findActive( this.active || o.active );
		panel.prototype._clickHandler.call( this,this.active );
	},
	
	_createIcons: function() {
		var o = this.options;
		panel.prototype._createIcons.call( this );
		if (o.icons) {
			this.element.addClass("ui-accordion-icons");
		}
	},
	
	_destroyIcons: function() {
		panel.prototype._destroyIcons.call( this );
		this.element.removeClass("ui-accordion-icons");
	},

	destroy: function() {
	
		var o = this.options;

		this.element
			.removeClass( "ui-accordion" );

		var contents = this.headers.removeClass( "ui-accordion-header" )
			.next()
			.removeClass( "ui-accordion-content ui-accordion-content-active" );
		if (o.autoHeight || o.fillHeight) {
			contents.css( "height", "" );
		}

		panel.prototype.destroy.call( this );

		return this;
	},
	
	_setOption: function(key, value) {
		var o = this.options;
		panel.prototype._setOption.apply( this, arguments );
			
		if (key == "active") {
			this.activate( value );
		}
		if ( key == "animated" ) {
			o.proxied=undefined;
			o.proxiedDuration=undefined;
		}
	},

	resize: function() {

		var o = this.options, maxHeight;

		if (o.fillSpace) {
			
			if ($.browser.msie) { 
				var defOverflow = this.element.parent().css( "overflow" ); 
				this.element.parent().css( "overflow", "hidden" ); 
			}
			maxHeight = this.element.parent().height();
			if($.browser.msie) { 
				this.element.parent().css( "overflow", defOverflow ); 
			}
	
			this.headers.each(function() {
				maxHeight -= $(this).outerHeight(true);
			});

			this.headers.next().each(function() {
    		   $(this).height( Math.max( 0, maxHeight - $(this).innerHeight() + $(this).height()) );
			}).css( "overflow", "auto" );

		} else if ( o.autoHeight ) {
			// maxHeight calculation is 0 if the element is hidden (see Ticket #3905)
			if ( !this.element.is( ":hidden" ) ) {
				maxHeight = 0;
				this.headers.next().each(function() {
					maxHeight = Math.max( maxHeight, $(this).height() );
				}).height( maxHeight );
			}
		}

		return this;
	},

	activate: function(index) {
		// TODO this gets called on init, changing the option without an explicit call for that
		this.options.active = index;
		var active = this._findActive( index )[0];
		this._clickHandler.call( this,$(active) );

		return this;
	},

	_findActive: function(selector) {
		return selector
			? typeof selector == "number"
				? this.headers.filter( ":eq(" + selector + ")" )
				: this.headers.not( this.headers.not( selector ) )
			: selector === false
				? $([])
				: this.headers.filter( ":eq(0)" );
		
	},
	
	// TODO isn't event.target enough? why the seperate target argument?
//	_clickHandler: function(event, target) {
	_clickHandler: function(header) {
	
		var o = this.options;

		if (o.disabled)
			return;

		// called only when using activate(false) to close all parts programmatically
		if (header.length==0 /*!event.target*/) {
			if (!o.collapsible)
				return;
			this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all")
				.find(".ui-icon").removeClass(o.icons.headerSelected).addClass(o.icons.header);
			this.active.next().addClass('ui-accordion-content-active');
			var toHide = this.active.next(),
				data = {
					options: o,
					newHeader: $([]),
					oldHeader: o.active,
					newContent: $([]),
					oldContent: toHide
				},
				toShow = (this.active = $([]));
			this._toggle(toShow, toHide, data);
			return;
		}

		// get the click target
		var clicked = header /*$(event.currentTarget || target)*/;
		var clickedIsActive = clicked[0] == this.active[0];
		
		// TODO the option is changed, is that correct?
		// TODO if it is correct, shouldn't that happen after determining that the click is valid?
		o.active = o.collapsible && clickedIsActive ? false : $('.ui-accordion-header', this.element).index(clicked);

		// if animations are still active, or the active header is the target, ignore click
		if (this.running || (!o.collapsible && clickedIsActive)) {
			return;
		}

		// switch classes
		this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all")
			.find(".ui-icon").removeClass(o.icons.headerSelected).addClass(o.icons.header);
		if (!clickedIsActive) {
			clicked.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top")
				.find(".ui-icon").removeClass(o.icons.header).addClass(o.icons.headerSelected);
			clicked.next().addClass('ui-accordion-content-active');
		}

		// find elements to show and hide
		var toShow = clicked.next(),
			toHide = this.active.next(),
			data = {
				options: o,
				newHeader: clickedIsActive && o.collapsible ? $([]) : clicked,
				oldHeader: this.active,
				newContent: clickedIsActive && o.collapsible ? $([]) : toShow,
				oldContent: toHide
			},
			down = this.headers.index( this.active[0] ) > this.headers.index( clicked[0] );

		this.active = clickedIsActive ? $([]) : clicked;
		this._toggle(toShow, toHide, data, clickedIsActive, down);

		return;

	},

	_toggle: function(toShow, toHide, data, clickedIsActive, down) {

		var o = this.options, self = this;

		this.toShow = toShow;
		this.toHide = toHide;
		this.data = data;

		var complete = function() { if(!self) return; return self._completed.apply(self, arguments); };

		// trigger changestart event
		this._trigger("changestart", null, this.data);

		// count elements to animate
		this.running = toHide.size() === 0 ? toShow.size() : toHide.size();

		if (o.animated) {

			var animOptions = {};

			if ( o.collapsible && clickedIsActive ) {
				animOptions = {
					toShow: $([]),
					toHide: toHide,
					complete: complete,
					down: down,
					autoHeight: o.autoHeight || o.fillSpace
				};
			} else {
				animOptions = {
					toShow: toShow,
					toHide: toHide,
					complete: complete,
					down: down,
					autoHeight: o.autoHeight || o.fillSpace
				};
			}

			if (!o.proxied) {
				o.proxied = o.animated;
			}

			if (!o.proxiedDuration) {
				o.proxiedDuration = o.duration;
			}

			o.animated = $.isFunction(o.proxied) ?
				o.proxied(animOptions) : o.proxied;

			o.duration = $.isFunction(o.proxiedDuration) ?
				o.proxiedDuration(animOptions) : o.proxiedDuration;

			var animations = $.ui.accordion.animations,
				duration = o.duration,
				easing = o.animated;

			if (easing && !animations[easing] && !$.easing[easing]) {
				easing = 'slide';
			}
			if (!animations[easing]) {
				animations[easing] = function(options) {
					this.slide(options, {
						easing: easing,
						duration: duration || 700
					});
				};
			}

			animations[easing](animOptions);

		} else {

			if (o.collapsible && clickedIsActive) {
				toShow.toggle();
			} else {
				toHide.hide();
				toShow.show();
			}

			complete(true);

		}

		// TODO assert that the blur and focus triggers are really necessary, remove otherwise
		toHide.prev().attr('aria-expanded','false').attr("tabIndex", "-1").blur();
		toShow.prev().attr('aria-expanded','true').attr("tabIndex", this._tabIndex()).focus();

	},

	_completed: function(cancel) {

		var o = this.options;

		this.running = cancel ? 0 : --this.running;
		if (this.running) return;

		if (o.clearStyle) {
			this.toShow.add(this.toHide).css({
				height: "",
				overflow: ""
			});
		}
		
		// other classes are removed before the animation; this one needs to stay until completed
		this.toHide.removeClass("ui-accordion-content-active");

		this._trigger('change', null, this.data);
	}

});


$.extend($.ui.accordion, {
	version: "@VERSION",
	animations: {
		slide: function(options, additions) {
			options = $.extend({
				easing: "swing",
				duration: 300
			}, options, additions);
			if ( !options.toHide.size() ) {
				options.toShow.animate({height: "show"}, options);
				return;
			}
			if ( !options.toShow.size() ) {
				options.toHide.animate({height: "hide"}, options);
				return;
			}
			var overflow = options.toShow.css('overflow'),
				percentDone = 0,
				showProps = {},
				hideProps = {},
				fxAttrs = [ "height", "paddingTop", "paddingBottom" ],
				originalWidth;
			// fix width before calculating height of hidden element
			var s = options.toShow;
			originalWidth = s[0].style.width;
			s.width( parseInt(s.parent().width(),10) - parseInt(s.css("paddingLeft"),10) - parseInt(s.css("paddingRight"),10) - (parseInt(s.css("borderLeftWidth"),10) || 0) - (parseInt(s.css("borderRightWidth"),10) || 0) );
			
			$.each(fxAttrs, function(i, prop) {
				hideProps[prop] = 'hide';
				
				var parts = ('' + $.css(options.toShow[0], prop)).match(/^([\d+-.]+)(.*)$/);
				showProps[prop] = {
					value: parts[1],
					unit: parts[2] || 'px'
				};
			});
			options.toShow.css({ height: 0, overflow: 'hidden' }).show();
			options.toHide.filter(":hidden").each(options.complete).end().filter(":visible").animate(hideProps,{
				step: function(now, settings) {
					// only calculate the percent when animating height
					// IE gets very inconsistent results when animating elements
					// with small values, which is common for padding
					if (settings.prop == 'height') {
						percentDone = ( settings.end - settings.start === 0 ) ? 0 :
							(settings.now - settings.start) / (settings.end - settings.start);
					}
					
					options.toShow[0].style[settings.prop] =
						(percentDone * showProps[settings.prop].value) + showProps[settings.prop].unit;
				},
				duration: options.duration,
				easing: options.easing,
				complete: function() {
					if ( !options.autoHeight ) {
						options.toShow.css("height", "");
					}
					options.toShow.css("width", originalWidth);
					options.toShow.css({overflow: overflow});
					options.complete();
				}
			});
		},
		bounceslide: function(options) {
			this.slide(options, {
				easing: options.down ? "easeOutBounce" : "swing",
				duration: options.down ? 1000 : 200
			});
		}
	}
});

})(jQuery);
