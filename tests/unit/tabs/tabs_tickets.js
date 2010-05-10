/*
 * tabs_tickets.js
 */
(function($) {

module("tabs: tickets");

test('#2715 - id containing colon', function() {
	// http://dev.jqueryui.com/ticket/2715
	expect(4);

	el = $('#tabs2').tabs();
	ok( $('div.ui-tabs-panel:eq(0)', '#tabs2').is(':visible'), 'first panel should be visible' );
	ok( $('div.ui-tabs-panel:eq(1)', '#tabs2').is(':hidden'), 'second panel should be hidden' );

	el.tabs('select', 1).tabs('select', 0);
	ok( $('div.ui-tabs-panel:eq(0)', '#tabs2').is(':visible'), 'first panel should be visible' );
	ok( $('div.ui-tabs-panel:eq(1)', '#tabs2').is(':hidden'), 'second panel should be hidden' );

});

test('#???? - panel containing inline style', function() {
	expect(3);

	var inlineStyle = function(property) {
		return $('#inline-style')[0].style[property];
	};
	var expected = inlineStyle('height');

	el = $('#tabs2').tabs();
	equals(inlineStyle('height'), expected, 'init should not remove inline style');

	el.tabs('select', 1);
	equals(inlineStyle('height'), expected, 'show tab should not remove inline style');

	el.tabs('select', 0);
	equals(inlineStyle('height'), expected, 'hide tab should not remove inline style');

});

test('#3627 - Ajax tab with url containing a fragment identifier fails to load', function() {
	// http://dev.jqueryui.com/ticket/3627
	expect(1);

	el = $('#tabs2').tabs();
	
	ok(/test.html$/.test( $('a:eq(2)', el).data('load.tabs') ), 'should ignore fragment identifier');

});

test('#4033 - IE expands hash to full url and misinterprets tab as ajax', function() {
	// http://dev.jqueryui.com/ticket/4033
	expect(1);
	
	el = $('<div><ul><li><a href="#tab">Tab</a></li></ul><div id="tab"></div></div>')
			.appendTo('#main').tabs();
    
	equals($('a', el).data('load.tabs'), undefined, 'should not create ajax tab');
	
});

test('#5069 - ui.tabs.add creates two tab panels when using a full URL', function() {
	// http://dev.jqueryui.com/ticket/5069
	expect(2);
	
	el = $('#tabs2').tabs();
	equals(el.children('div').length, el.find('> ul > li').length, 'After creation, number of panels should be equal to number of tabs');
	el.tabs('add', '/ajax_html_echo', 'Test');
	equals(el.children('div').length, el.find('> ul > li').length, 'After add, number of panels should be equal to number of tabs');
	
});

test('#5485 - ajax tabs event (tabsshow and tabsload) order and trigger', function() {
	// http://dev.jqueryui.com/ticket/5485
	expect(2);
	var log = function(message) {
		$("#log").append(message + "-");
	}	
	$('<div id="log"></div>').appendTo("body");
	el = $('#tabs6')
			.bind("tabsshow", function (event, ui) {
				log("tabsshow " + ui.index);
			})
			.bind("tabsload", function (event, ui) {
				log("tabsload " + ui.index);
			})
			.tabs({
				load : function (event, ui) {
					log("load " + ui.index);
				},
				show : function (event, ui) {
					log("show " + ui.index);
				}
			});
	equals($("#log").text(), "tabsload 0-load 0-tabsshow 0-show 0-", 'When tabs is just created, the events order should be load then show');
	$("#log").html("");
	el.tabs('select', 1);
	equals($("#log").text(), "tabsload 1-load 1-tabsshow 1-show 1-", 'When select a tab, the events order should be load then show');
	$("#log").remove();
});

})(jQuery);
