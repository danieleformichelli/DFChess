/**
*	@fileOverview Timer.js
*	@author <a href="mailto:danele.formichelli@gmail.com">Daniele Formichelli</a>
*/

/**
*	@class Gestisce un cronometro
*		@property {Number} h Ore rimanenti
*		@property {Number} m Minuti rimanenti
*		@property {Number} s Secondi rimanenti
*		@property {Number} id Numero identificativo del timer
*		@property {Number} ms Numero di millisecondi a cui scatterà il prossimo secondo
*		@property {Number} remaining Numero di millisecondi che mancavano allo scatto del secondo successivo quando il cronometro è stato fermato
*/

function Timer(h, m, s, layout, color){
	this.h = h;
	this.m = m;
	this.s = s;
	this.id = null;
	this.ms = null;
	this.remaining = 1000;
	this.color = color;
	this.layout = layout;
	layout.setTimer(color, h, m, s);
}

/**
*	Avvia il cronometro
*/

Timer.prototype.start = function(){
	var currentms = (new Date()).getMilliseconds();
	this.id = setTimeout(this.everySecond.bind(this), this.remaining);
	//il prossimo secondo scatterà quando i millisecondi saranno ad un numero pari ai millisecondi correnti più il tempo rimanente
	this.ms = (currentms + this.remaining)%1000;
}

/**
*	Ferma il cronometro
*/

Timer.prototype.stop = function(){
	var currentms = (new Date()).getMilliseconds();
	clearTimeout(this.id); //disattivo il timeout
	//allo scattare del prossimo secondo mancano i millisecondi a cui sarebbe scattato il timer meno i millisecondi correnti
	this.remaining = (this.ms < currentms ? this.ms+1000 - currentms : this.ms - currentms);
}

/**
*	Gestisce l'aggiornamento del cronometro, chiamata allo scadere di ogni secondo
*/

Timer.prototype.everySecond = function(){
	if(this.s-- == 0){
		this.s = 59;
		if(this.m-- == 0){
			this.m = 59;
			if(this.h-- == 0){
				this.stop();
				chess.timeOver();
				return;
			}
		}
	}
	this.layout.setTimer(this.color, this.h, this.m, this.s);
	this.id = setTimeout(this.everySecond.bind(this), 1000);
}

/**
*	Reimposta il cronometro
*		@param {Number} h Ore
*		@param {Number} m Minuti
*		@param {Number} s Secondi
*/

Timer.prototype.setTime = function(h, m, s){
	this.stop();
	this.h = h;
	this.m = m;
	this.s = s;
	this.remaining = 1000;
	this.layout.setTimer(this.color, this.h, this.m, this.s);
}

/**
*	Restituisce il tempo corrente formattato come hhmmss
*		@return {String} Tempo corrente
*/

Timer.prototype.getTime = function(){
	return (this.h < 10 ? '0'+this.h : this.h) + (this.m < 10 ? '0'+this.m : this.m) + (this.s < 10 ? '0'+this.s : this.s);
}