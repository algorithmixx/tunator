"use strict";

/*

	Utils.js : A collection of utility classes

		CmdLine: URL arg parsing
		RandomMulberry32: repeatable random numbers
	
*/
// ======================================================================================================== CmdLine

class CmdLine {

    constructor(search_string) {
        var parse = function(params, pairs) {
            var pair = pairs[0];
            var parts = pair.split('=');
            var key = decodeURIComponent(parts[0]);
            var value = decodeURIComponent(parts.slice(1).join('='));

            // Handle multiple parameters of the same name
            if (typeof params[key] === "undefined") {
                params[key] = value;
            } else {
                params[key] = [].concat(params[key], value);
            }
            return pairs.length == 1 ? params : parse(params, pairs.slice(1))
        }

        // Get rid of leading "?" and split into map of name/value pairs
        this.args = search_string.length == 0 ? {} : parse({}, search_string.substr(1).split('&'));
    }
	
	getInt(name, abbr, defaultValue,delta) {
        if (typeof this.args[name] != "undefined") return parseInt(this.args[name])+delta;
        if (typeof this.args[abbr] != "undefined") return parseInt(this.args[abbr])+delta;
        return defaultValue;
    }

    getBool(name, abbr, defaultValue) {
		// tri-state logic in case defaultValue == null
		var 						defValue = null;
		if (defaultValue==true)		defValue = 1;
		if (defaultValue==false)	defValue = 0;
		var value = this.getInt(name,abbr,defValue,0);
		if (value==0) 		return false;
		if (value==null) 	return null;
		else				return true;
    }

    getString(name,abbr, defaultValue) {
        if (typeof this.args[name] != "undefined") {
			return this.translatePlusSigns(this.args[name]);
		}
        if (typeof this.args[abbr] != "undefined") {
			return this.translatePlusSigns(this.args[abbr]);
		}
        return defaultValue;
    }

	translatePlusSigns(text) {
		return (""+text).replace(/\+/g," ");
	}

}

// ======================================================================================================== CmdLine

function RandomMulberry32(a) {
	// a simple random generator with repeatable results
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
