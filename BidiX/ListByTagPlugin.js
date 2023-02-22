/***
|Source|https://github.com/YakovL/TiddlyWiki_BidiX_repo/blob/master/TiddlyHome/_th/admin/index.html#L2762|
|Source notes|That repo was exported from [[Google Code|https://code.google.com/archive/p/bidix/]]; the plugin as a tiddler can be found in [[Web Archive|http://web.archive.org/web/20131013184022/http://tiddlywiki.bidix.info/#ListByTag]]|
***/
//{{{
//thanks Simon!
Array.prototype.tiddlerList = function(listFormat,max) {
	var output = "";
	if (!listFormat) listFormat = "'[[' + tiddler.title + ']] - ' + tiddler.created.formatString('0DD/0MM/YY') + ' - ' + tiddler.modifier + '\\n'";
        if (!max) var max = this.length;
	if (this.length > 0 && this[0] instanceof Tiddler) {
		for (var i=0;i<max;i++) {
			var tiddler = this[i];
			output += eval(listFormat);
		}
	}
	return output;
}

// tag, sorted, listformat, max(0), noReverse(true)
config.macros.listByTag = {};
config.macros.listByTag.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
    	params[0]  = (params[0] ? params[0] : tiddler.title);
    	var tiddlers = store.getTaggedTiddlers(params[0],params[1]);
    	if (params[3] == 0) params[3] = null;
    	if (! params[4])
    	    	tiddlers = tiddlers.reverse();
 	wikify(tiddlers.tiddlerList(params[2],params[3]),place,null,tiddler);
};
//}}}