/**
*	@fileOverview Main.js
*	@author <a href="mailto:danele.formichelli@gmail.com">Daniele Formichelli</a>
*/

var layout;
var chess;

window.onload = function(){
	layout = new ChessLayout();
	chess = new Chess(layout);
	chess.autosave = document.getElementById('autosave').checked;
	if(!(chess.autosave && utilities.getCookie('autosave') && chess.loadMatch('autosave')))
		chess.newMatch();
	window.onresize = layout.resize.bind(layout);
};

window.onunload = function(){
	if(chess.autosave && layout.transparent.style.visibility != 'visible')
		chess.saveMatch('autosave');
	else
		utilities.deleteCookie('autosave');
}

/**
*	Oggetto contenente gli handler degli eventi non direttamente collegati a nessuna delle altre classi
*/

var eventH = {};

/**
*	@event Handler dell'evento onclick su una casella della scacchiera
*	Seleziona la cella cliccata o esegue una mossa
*/

eventH.cellClick = function(){
	if(!layout.dad.on && !layout.inputDisabled){ //input attivato e drag&drop disattivato
		var row = Number(this.id.charAt(1)), col = Number(this.id.charAt(2));
		if(this.hasChildNodes() && chess.M[row][col].color == chess.turn) //il pezzo cliccato è del giocatore corrente
			if(chess.selected != null && chess.selected.r == row && chess.selected.c == col){
				layout.dehighlight();
				chess.selected = null;
			}
			else
				chess.select(row, col);
		else if(chess.selected != null) //un pezzo è già selezionato e si è cliccato un pezzo avversario o una cella vuota
			chess.tryMove(row, col);
	}
	return false;
}

/**
*	@event Handler dell'evento onmousedown su una cella della scacchiera
*	Avvia il Drag&Drop
*/

eventH.pieceMouseDown = function(){
	if(layout.dad.on && !layout.inputDisabled){
		var row = Number(this.parentNode.id.charAt(1)), col = Number(this.parentNode.id.charAt(2));
		if(chess.M[row][col].color == chess.turn){
			//avvio il drag se il d&d e gli input sono attivi ed è stato cliccato un pezzo del giocatore corrente
			layout.dad.now = true;
			chess.select(row, col);
			layout.dad.img = layout.selected.firstChild;
			layout.selected.className += ' onTop';
			//centro il pezzo rispetto alla posizione del mouse e attivo gli eveti per il Drag&Drop
			layout.dad.x = layout.chessBoard.x + layout.chessBoard.cellSize*(col + 0.5);
			layout.dad.y = layout.chessBoard.y + layout.chessBoard.cellSize*(row + 0.5);
			document.body.onmousemove = eventH.mouseMove;
			document.body.onmouseup = eventH.mouseUp;
		}
	}
	return false;
}

/**
*	@event Handler dell'evento onmousemove
*	Centra il pezzo in spostamente rispetto alla posizione del mouse
*		@param {Event} e oggetto associato all'evento
*/

eventH.mouseMove = function(e){
	e = e || event;
	//aggiorno la posizione dell'elemento trascinato
	layout.dad.img.style.top = (e.clientY - layout.dad.y) + 'px';
	layout.dad.img.style.left = (e.clientX - layout.dad.x) + 'px';
	return false;
}

/**
*	@event Handler dell'evento onmouseup
*		@param {Event} e oggetto associato all'evento
*/

eventH.mouseUp = function(e){
	if(layout.dad.img && !layout.inputDisabled){
		e = e || event;
		//calcolo la casella di destinazione
		var row = Math.floor((e.clientY - layout.chessBoard.y)/layout.chessBoard.cellSize);
		var col = Math.floor((e.clientX - layout.chessBoard.x)/layout.chessBoard.cellSize);
		//disattivo gli eventi per la gestione del D&D
		document.body.onmousemove = null;
		document.body.onmouseup = null;
		//rimetto il pezzo al suo posto
		layout.dad.img.style.top = layout.dad.img.style.left = '';
		utilities.removeClass(layout.selected, 'onTop');
		layout.dad.img = null;
		chess.tryMove(row, col);
	}
	return false;
}

/**
*	@event Handler dell'evento onclick sulla scelta del pezzo promosso
*		@param {Number} type pezzo scelto
*/

eventH.choiceClick = function(type){
	if(!layout.inputDisabled){
		var row = chess.lastMove[2], col = chess.lastMove[3];
		//cancello il vecchio pezzo e lo sostituisco col nuovo
		var cell = layout.chessBoard.div.childNodes[(row+1)*9 + col+1];
		cell.removeChild(cell.firstChild);
		delete chess.M[row][col];
		chess.createPiece(chess.turn, type, row, col);
		document.getElementById('transparent').style.visibility = 'hidden';
		document.getElementById('choice').style.visibility = 'hidden';
		//aggiorno il punteggio e passo al turno successivo
		if(chess.checkDraw())
			layout.gameOver(2);
		else
			chess.nextTurn();
	}
}

/**
*	@event Handler dell'evento onclick sulla modalità di input
*		@param {Number} type Tipo di input scelto (0: dad, 1:click);
*/

eventH.inputClick = function(type){
	if(type == 0 && !layout.dad.on){ //ho modificato in D&D
		//annullo eventuali selezioni e attivo D&D
		layout.dehighlight();
		chess.selected = null;
		layout.dad.on = true;
	}
	else if(type == 1 && layout.dad.on) //ho modificato in Click
		layout.dad.on = layout.dad.now = false;
	return true;
}

/**
*	@event Handler dell'evento onclick sui pulsanti di salvataggio/caricamento nel popup
*		@param {Number} type Identificativo del pulsante premuto
*/

eventH.loadClick = function(type){
	switch(type){
		case 0: //salvataggio nuova partita
			var name = prompt('Insert the name of the match');
			if(name == null)
				return;
			else
				chess.saveMatch(name);
			break;
		case 1: //salvataggio partita
			var select = document.getElementById('select');
			for(var i = 0; i < select.length; i++)
				if(select.options[i].selected && select.options[i].label){
					chess.saveMatch(select.options[i].label);
					break;
				}
			break;
		case 2: //caricamento nuova partita
			var select = document.getElementById('select');
			var i
			for(i = 0; i < select.length; i++)
				if(select.options[i].selected && select.options[i].label){
					chess.cancelMatch();
					chess.loadMatch(select.options[i].label);
					break;
				}
			break;
		case 4: //cancellazione di una partita salvata
			var select = document.getElementById('select');
			var option;
			for(var i = 0; i < select.length; i++)
				if(select.options[i].selected){
					option = select.options[i];
					break;
				}
			if(option){
				if(option.label)
					utilities.deleteCookie(option.label);
				utilities.deleteNode(option);
			}
			return;
		case 5: //cancellazione di tutte le partite salvate
			var select = document.getElementById('select');
			while(select.hasChildNodes() && select.options[0].label){
				utilities.deleteCookie(select.options[0].label);
				utilities.deleteNode(select.options[0]);
			}
			return;
	}
	layout.hideSavedMatches();
}

/**
	@event Handler dell'evento onclick dopo la fine di una partita
	Avvia una nuova partita
*/

eventH.newMatch = function(){
	if(confirm('Do you want to start a new match?')){
		layout.transparent.onclick = null;
		layout.transparent.style.visibility = 'hidden';
		document.getElementById('gameover').style.visibility = 'hidden';
		chess.cancelMatch();
		chess.newMatch();
	}
}

/**
	@event Handler dell'evento onclick sul pulsante di pareggio
	Fa pareggiare la partita o chiede il pareggio
*/

eventH.draw = function(){
	if(document.getElementById('draw').firstChild.nodeValue == 'Draw' || confirm('Do you want to draw?')){
		chess.timers[Number(chess.turn)].stop();
		layout.gameOver(2);
	}
}