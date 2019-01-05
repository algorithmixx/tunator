"use strict";

class Lang {
/*

	Lang.js : minimalistic multi language support, based on
				class="trh" for html contents
				class="trt" for html element titles (hover texts)

			The texts are defined in LangDef.js in three groups:
				trh (for html content of an HTML tag)
				trt (for the title attribute of an HTML tag)
				trx (for arbitary texts whioch are programmatocally accessed)
*/

	constructor() {
		this.lang="en";
	}

	load(lang) {
		// load the texts defined in LangDef.js
		// class="trt" is used to classify html tags where the title shall be translated
		// class="trh" is used to classify html tags where the html content shall be translated

		if (lang!="") this.lang=lang;

		$(".trt").each(function(index,elm) {
			var id=elm.id;
			if (id=="") {
				elm.title="error: cannot assign title to this tag; missing 'id'";
			}
			else {
				if (typeof LangDef.trt[id] == "undefined") {
					elm.title="no translation found for this tag; id='"+elm.id+"'";
				}
				else {
					var lang=theLang.lang;
					if (typeof LangDef.trt[id][lang] == "undefined") lang="en";		// fallback to English
					elm.title=LangDef.trt[id][lang];
				}
			}
		});

		$(".trh").each(function(index,elm) {
			var id=elm.id;
			if (id=="") {
				elm.title="error: cannot assign html text to this tag; missing 'id'";
			}
			else {
				id=elm.id;
				if (typeof LangDef.trh[id] == "undefined") {
					elm.title="no translation found for this tag; id='"+elm.id+"'";
				}
				else {
					var lang=theLang.lang;
					if (typeof LangDef.trh[id][lang] == "undefined") lang="en";		// fallback to English
					elm.innerHTML=LangDef.trh[id][lang];
				}
			}
		});

	}

	tr(id) {
		// return the language specific text for an item listed in the "trx" group

		if (typeof LangDef.trx[id] == "undefined") {
			return "no translation found for text with id='"+id+"'\n";
		}
		else {
			var lang=this.lang;
			if (typeof LangDef.trx[id][lang] == "undefined") lang="en";		// fallback to English
			if (LangDef.trx[id][lang].trim()=="") {
				return "<small><span style='color:red'>For translation to ["+theLang.lang+
					"] you may want to use <a target='deepl' href='https://deepl.com'>deepl.com</a>"+
					"</span></small><br/>\n"+LangDef.trx[id].en.trim();
			}
			return LangDef.trx[id][lang].trim();
		}
	}
}
