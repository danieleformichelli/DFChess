/**
*	@fileOverview Utility.js
*	@author <a href="mailto:danele.formichelli@gmail.com">Daniele Formichelli</a>
*/

/**
*	Oggetto contenente funzioni di utilità
*/

var utilities = {}

/**
*	Rimuove una classe da un elemento
*		@param {HTMLElement} elem elemento da elaborare
*		@param {String} className classe da rimuovere
*/

utilities.removeClass = function(elem, className){
	var expr = new RegExp('\\b' + className + '\\b', 'g');
	elem.className = elem.className.replace(expr, ''); //elimino la classe dalla lista
	elem.className = elem.className.replace(/(^ +| +$)/g, ''); //elimino eventuali spazi in testa o in coda
	elem.className = elem.className.replace(/ {2,}/g, ' '); //elimino eventuali spazi multipli
}

/**
*	Controlla se un elemento appartiene a una classe
*		@param {HTMLElement} elem Elemento da elaborare
*		@param {String} className Classe da controllare
*		@return {Boolean} true se l'oggetto appartiene alla classe className
*/

utilities.hasClass = function(elem, className){
	return (new RegExp('\\b' + className + '\\b')).test(elem.className);
}

/**
*	Recupera un cookie
*		@param {String} name Nome del cookie
*		@returns {String} Contenuto del cookie
*/

utilities.getCookie = function(name) {
	var cookies = document.cookie.split(';');
	var cookie = '';
	var cookieName = '';
	var cookieValue = '';
	var b_cookie_found = false;
	for ( i = 0; i < cookies.length; i++ ){
		cookie = cookies[i].split('=');
		cookie[0] = cookie[0].replace(/^\s+|\s+$/g, '');
		if(cookie[0] == name){
			if(cookie.length > 1)
				cookie[1] = unescape(cookie[1].replace(/^\s+|\s+$/g, '') );
			return cookie[1];
			break;
		}
	}
	return null;
}

/**
*	Restituisce un array contenente i nomi di tutte le partite salvate
*		@returns {String[]} Partite salvate
*/

utilities.getSavedMatches = function(){
	var cookies = document.cookie.split(';');
	var cookie;
	var names = new Array();
	for(var i = 0; i < cookies.length; i++){
		cookie = cookies[i].split('=');
		cookie[0] = cookie[0].replace(/^\s+|\s+$/g, '');
		names[i] = cookie[0];
	}
	return names;
}

/**
*	Cancella un cookie
*		@param {String} name Nome del cookie da cancellare
*/

utilities.deleteCookie = function(name){
	document.cookie = name + '=' + ';expires=-Thu, 01-Jan-1970 00:00:01 GMT';
}

/**
*	Salva un nuovo cookie
*		@param {String} name Nome del cookie da salvare
*		@param {String} value Contenuto del cookie
*/

utilities.setCookie = function(name, value, path){
	document.cookie = name + '=' + escape(value) + ';expires=' + new Date((new Date()).getTime() + 7*1000*3600*24).toGMTString();
}

/**
*	Disabilita un evento
*/

utilities.disable = function(){
	return false;
}

/**
*	Elimina il nodo chiamante dal documento
*/

utilities.deleteNode = function(node){
	node.parentNode.removeChild(node);
}

/**
*	Restituisce la funzione su cui è chiamata associando come contesto il primo argomento passato alla bind e come argomenti i rimanenti argomenti
*		@param {Object} arguments[0] contesto da associare alla funzione
*		@param {Object[]} arguments[1..] argomenti da passare alla funzione
*		@return {Function} funzione associata al nuovo contesto
*/

Function.prototype.bind = function(){
	var func = this;
	var This = arguments[0];
	var args = Array.prototype.slice.call(arguments, 1);
	return function(){
		return func.apply(This, args);
	};
}