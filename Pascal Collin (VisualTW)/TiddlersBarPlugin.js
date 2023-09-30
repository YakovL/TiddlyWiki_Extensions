/***
|Description    |A bar to switch between tiddlers through tabs (like browser tabs bar)|
|Version        |1.2.9|
|Source         |https://github.com/YakovL/TiddlyWiki_Extensions/blob/master/Pascal%20Collin%20(VisualTW)/TiddlersBarPlugin.js|
|Original Source|http://visualtw.ouvaton.org/VisualTW.html|
|Author         |Pascal Collin|
|License        |[[BSD open source license|http://web.archive.org/web/20160707100158/http://visualtw.ouvaton.org/VisualTW.html#License]]|
|~CoreVersion   |2.1.0|
!Demo
On [[homepage|http://visualtw.ouvaton.org/VisualTW.html]], open several tiddlers to use the tabs bar.
!Installation
# Copy or import this tiddler from [[homepage|http://visualtw.ouvaton.org/VisualTW.html]] (tagged as {{{systemConfig}}})
# save and reload
# ''if you're using a custom [[PageTemplate]]'', add {{{<div id='tiddlersBar' refresh='none' ondblclick='config.macros.tiddlersBar.onTiddlersBarAction(event)'></div>}}} before {{{<div id='tiddlerDisplay'></div>}}}
# optionally, adjust StyleSheetTiddlersBar.
!Usage
* Double-click on the tiddlers bar (where there is no tab) to create a new tiddler.
* Tabs include a button to close ({{{x}}}) or save ({{{!}}}) their tiddler.
* By default, clicking the current tab closes all other tiddlers.
!!Configuration options
<<option chkDisableTabsBar>> Disable the tabs bar (to print, for example)
<<option chkHideTabsBarWhenSingleTab >> Automatically hide the tabs bar when only one tiddler is displayed
<<option txtSelectedTiddlerTabButton>> ''selected'' tab command button
<<option txtPreviousTabKey>> previous tab access key
<<option txtNextTabKey>> next tab access key
!Code
***/
//{{{
config.options.chkDisableTabsBar           = config.options.chkDisableTabsBar || false;
config.options.chkHideTabsBarWhenSingleTab = config.options.chkHideTabsBarWhenSingleTab || false;
config.options.txtSelectedTiddlerTabButton = config.options.txtSelectedTiddlerTabButton || "closeOthers";
config.options.txtPreviousTabKey           = config.options.txtPreviousTabKey || "";
config.options.txtNextTabKey               = config.options.txtNextTabKey || "";

var bar = config.macros.tiddlersBar = {
	// lingo
	tooltip: "see ",
	tooltipClose: "click here to close this tab",
	tooltipSave: "click here to save this tab",

	currentTiddler:	"",
	previousState:	false,
	// use document.getElementById("tiddlerDisplay") if you need animation on tab switching.
	tabsAnimationSource: null,
	handler: function(place, macroName, params) {
		if(!this.isShown()) return;
		var previous = null;
		var prevKey = config.options.txtPreviousTabKey;
		var nextKey = config.options.txtNextTabKey;

		story.forEachTiddler(function(title, e) {
			if (title == bar.currentTiddler) {
				var d = createTiddlyElement(null, "span", null, "tab tabSelected");
				bar.createActiveTabButton(d, title);
				if (previous && nextKey) previous.setAttribute("accessKey", nextKey);
				previous = "active";
			} else {
				var d = createTiddlyElement(place, "span", null, "tab tabUnselected");
				var btn = createTiddlyButton(d, title, bar.tooltip + title, bar.onSelectTab);
				btn.setAttribute("tiddler", title);
				if (previous == "active" && prevKey) btn.setAttribute("accessKey", prevKey);
				previous = btn;
			}
			var isDirty = story.isDirty(title);
			var c = createTiddlyButton(d, isDirty ? "!" : "x",
				isDirty ? bar.tooltipSave : bar.tooltipClose,
				isDirty ? bar.onTabSave : bar.onTabClose,
				"tabButton");
			c.setAttribute("tiddler", title);
			if (place.childNodes) {
				// to allow break line here when many tiddlers are open
				place.insertBefore(document.createTextNode(" "), place.firstChild);
				place.insertBefore(d, place.firstChild);
			}
			else place.appendChild(d);
		})
	},
	refresh: function(place, params) {
		removeChildren(place);
		this.handler(place, "tiddlersBar", params);
		if (this.previousState != this.isShown()) {
			story.refreshAllTiddlers();
			if (this.previousState)
				story.forEachTiddler(function(t, e) { e.style.display = "" });
			this.previousState = !this.previousState;
		}
	},
	isShown: function() {
		if (config.options.chkDisableTabsBar) return false;
		if (!config.options.chkHideTabsBarWhenSingleTab) return true;

		var numberOfOpenTiddlers = 0;
		story.forEachTiddler(function() { numberOfOpenTiddlers++ });
		return numberOfOpenTiddlers > 1;
	},
	// used when the current tab is closed (to select another tab)
	selectNextTab: function() {
		var previous = "";
		story.forEachTiddler(function(title) {
			if (!bar.currentTiddler) {
				story.displayTiddler(null, title);
				return;
			}
			if (title == bar.currentTiddler) {
				if (previous) {
					story.displayTiddler(null, previous);
					return;
				}
				// next tab will be selected
				else bar.currentTiddler = "";
			}
			else previous = title;
		});
	},
	onSelectTab: function() {
		var t = this.getAttribute("tiddler");
		if (t) story.displayTiddler(null, t);
		return false;
	},
	onTabClose: function() {
		var t = this.getAttribute("tiddler");
		if (t) {
			if(story.hasChanges(t) && !readOnly) {
				if(!confirm(config.commands.cancelTiddler.warning.format([t])))
					return false;
			}
			story.closeTiddler(t);
		}
		return false;
	},
	onTabSave: function(event) {
		var t = this.getAttribute("tiddler");
		event = event || window.event;
		if (t) config.commands.saveTiddler.handler(event, null, t);
		return false;
	},
	onSelectedTabButtonClick: function(event, src, title) {
		var t = this.getAttribute("tiddler");
		event = event || window.event;
		if (t && config.options.txtSelectedTiddlerTabButton && config.commands[config.options.txtSelectedTiddlerTabButton])
			config.commands[config.options.txtSelectedTiddlerTabButton].handler(event, src, t);
		return false;
	},
	onTiddlersBarAction: function(event) {
		// IE used srcElement
		var source = event.target ? event.target.id : event.srcElement.id;
		if (source == "tiddlersBar") story.displayTiddler(null,
			'New Tiddler', DEFAULT_EDIT_TEMPLATE, false, null, null);
	},
	createActiveTabButton: function(place, title) {
		if (config.options.txtSelectedTiddlerTabButton && config.commands[config.options.txtSelectedTiddlerTabButton]) {
			var btn = createTiddlyButton(place, title,
				config.commands[config.options.txtSelectedTiddlerTabButton].tooltip, this.onSelectedTabButtonClick);
			btn.setAttribute("tiddler", title);
		}
		else
			createTiddlyText(place, title);
	}
}

story.coreCloseTiddler = story.coreCloseTiddler ? story.coreCloseTiddler : story.closeTiddler;
story.coreDisplayTiddler = story.coreDisplayTiddler ? story.coreDisplayTiddler : story.displayTiddler;

story.closeTiddler = function(title, animate, unused) {
	if (title == bar.currentTiddler)
		bar.selectNextTab();
	// disable animation to get it closed before calling tiddlersBar.refresh
	story.coreCloseTiddler(title, false, unused);
	var e = document.getElementById("tiddlersBar");
	if (e) bar.refresh(e, null);
}

story.displayTiddler = function(srcElement, tiddler, template, animate, unused, customFields, toggle) {
	story.coreDisplayTiddler(bar.tabsAnimationSource, tiddler, template, animate, unused, customFields, toggle);
	var title = (tiddler instanceof Tiddler) ? tiddler.title : tiddler;
	if (bar.isShown()) {
		story.forEachTiddler(function(t, e) {
			e.style.display = t == title ? "" : "none";
		})
		bar.currentTiddler = title;
	}
	var e = document.getElementById("tiddlersBar");
	if (e) bar.refresh(e, null);
}

var coreRefreshPageTemplate = coreRefreshPageTemplate ? coreRefreshPageTemplate : refreshPageTemplate;
refreshPageTemplate = function(title) {
	coreRefreshPageTemplate(title);
	if (config.macros.tiddlersBar) config.macros.tiddlersBar.refresh(document.getElementById("tiddlersBar"));
}

ensureVisible = function(e) { return 0 } // disable bottom scrolling (not useful now)

config.shadowTiddlers.StyleSheetTiddlersBar =
	"/*{{{*/\n" +
	"#tiddlersBar .button {border:0}\n" +
	"#tiddlersBar .tab {white-space:nowrap}\n" +
	"#tiddlersBar {padding : 1em 0.5em 2px 0.5em}\n" +
	".tabUnselected .tabButton, .tabSelected .tabButton {padding : 0 2px 0 2px; margin: 0 0 0 4px;}\n" +
	".tiddler, .tabContents {border:1px [[ColorPalette::TertiaryPale]] solid;}\n" +
	"/*}}}*/";
store.addNotification("StyleSheetTiddlersBar", refreshStyles);

config.refreshers.none = function() { return true };
config.shadowTiddlers.PageTemplate = config.shadowTiddlers.PageTemplate.replace(/<div id='tiddlerDisplay'><\/div>/m, "<div id='tiddlersBar' refresh='none' ondblclick='config.macros.tiddlersBar.onTiddlersBarAction(event)'></div>\n<div id='tiddlerDisplay'></div>");

//}}}