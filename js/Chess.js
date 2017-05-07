/**
*	@fileOverview Chess.js
*	@author <a href="mailto:danele.formichelli@gmail.com">Daniele Formichelli</a>
*/

/**
*	@class Gestisce una partita di scacchi
*		@property {Boolean} turn Colore del giocatore che deve effettuare la prossima mossa, true se bianco
*		@property {Piece[8][8]} M Matrice che rappresenta i pezzi sulla scacchiera
*		@property {Object} selected coordinate del pezzo selezionato, null se nessun pezzo è selezionato
*		@property {Object} kings Coordinate delle posizioni correnti dei re, utilizzate per il controllo dello scacco
*		@property {Boolean} checked true se il giocatore corrente è sotto scacco
*		@property {Number} noEat Numero di mosse senza aver mangiato né aver mosso un pedone
*		@property {Number[4]} lastMove Coordinate dell'ultima mossa effettuata
*		@property {Timer[2]} timers Oggetti per la gestione dei cronometri
*		@property {ChessLayout} layout Oggetto che gestisce gli aspetti grafici
*		@property {Boolean} autosave true se il salvataggio automatico è attivo
*	@constructor Inizializza una partita o ne carica una salvata nei cookie
*/

function Chess(layout){
	this.turn = true;
	this.M = new Array(8);
	for(var i = 0; i < 8; i++)
		this.M[i] = new Array(8);
	this.kings = {w: {r: -1, c: -1}, b: {r: -1, c: -1}};
	this.lastMove = [-1, -1, -1, -1];
	this.timers = new Array(new Timer(1, 0, 0, layout, false), new Timer(1, 0, 0, layout, true));
	this.layout = layout;
	this.autosave = null;
}

/**
*	Controlla se un giocatore è sotto scacco
*		@param {Boolean} color Giocatore da controllare
*		@return {Boolean} true se il giocatore è sotto scacco, false altrimenti
*/

Chess.prototype.check = function(color){
	var kingRow = this.kings[color ? 'w' : 'b']['r']; var kingCol = this.kings[color ? 'w' : 'b']['c'];
	for(var i = 0; i < 8; i++)
		for(var j = 0; j < 8; j++)
			//per ogni pezzo avversario sulla scacchiera
			if(this.M[i][j] != null && this.M[i][j].color != color)
				//controllo se può attaccare il re
				if(this.M[i][j].validMove(i, j, kingRow, kingCol))
					return true;
	return false;
}

/**
*	Controlla se un giocatore non può muoversi
*		@param {Boolean} color Giocatore da controllare
*		@return {Boolean} true se il giocatore può muovere alcun pezzo, false altrimenti
*/

Chess.prototype.cantMove = function(color){
	for(var i = 0; i < 8; i++)
		for(var j = 0; j < 8; j++)
			//per ogni proprio pezzo sulla scacchiera
			if(this.M[i][j] != null && this.M[i][j].color == color)
				switch(this.M[i][j].type){
					case 0: //re, controllo che non si possano muovere sulle caselle adiacenti
						for(var k = -1; k <= 1; k++)
							for(var n = -1; n <= 1; n++)
								if(this.allowedMove(i, j, i+k, j+n))
									return false;
						break;
					case 1: //regina
						if(!this.towerMoves(i,j) || !this.bishopMoves(i,j))
							return false;
					case 2: //torre
						if(!this.towerMoves(i,j))
							return false;
						break;
					case 3: //alfiere
						if(!this.bishopMoves(i,j))
							return false;
						break;
					case 4: //cavallo, controllo le 8 possibili caselle di desinazione
						if(this.allowedMove(i, j, i+1, j+2) || this.allowedMove(i, j, i+1, j-2) || this.allowedMove(i, j, i+2, j+1) || this.allowedMove(i, j, i+2, j-1))
							return false;
						if(this.allowedMove(i, j, i-1, j+2) || this.allowedMove(i, j, i-1, j-2) || this.allowedMove(i, j, i-2, j+1) || this.allowedMove(i, j, i-2, j-1))
							return false;
						break;
					case 5: //pedone, controllo le 4 possibili caselle di destinazione
						var dir = (color ? -1 : 1);
						if(this.allowedMove(i, j, i+dir, j) || this.allowedMove(i, j, i+2*dir, j) || this.allowedMove(i, j, i+dir, j+1) || this.allowedMove(i, j, i+dir, j-1))
							return false;
				}
   return true;
}

/**
*	Muove un pezzo
*		@param {Number} srow Riga di partenza
*		@param {Number} scol Colonna di partenza
*		@param {Number} drow Riga di destinazione
*		@param {Number} dcol Colonna di destinazione
*/

Chess.prototype.movePiece = function(srow, scol, drow, dcol){
	//sposto l'oggetto nella posizione indicata
	this.M[drow][dcol] = this.M[srow][scol];
	this.M[srow][scol] = null;
	//se il pezzo era un re aggiorno la sua posizione
	if(this.M[drow][dcol].type == 0){
		var color = this.M[drow][dcol].color ? 'w' : 'b';
		this.kings[color].r = drow;
		this.kings[color].c = dcol;
	}
}

/**
*	Annulla una mossa effettuata con la simulateMove
*		@param {Number} srow Riga di partenza
*		@param {Number} scol Colonna di partenza
*		@param {Number} drow Riga di destinazione
*		@param {Number} dcol Colonna di destinazione
*		@param {Number} type Tipo di mossa (1: normale, 2: arrocco corto, 3: arrocco lungo, 4: presa en passant)
*		@param {Piece} Pezzo mangiato, null se non è stato mangiato nessun pezzo
*/

Chess.prototype.cancelMove = function(srow, scol, drow, dcol, type, eaten){
	var moved = this.M[drow][dcol];
	switch(type){
		case 2: //arrocco corto
			this.movePiece(drow, 5, srow, 7);
			break;
		case 3: //arrocco lungo
			this.movePiece(drow, 3, srow, 0);
			break;
		case 4: //presa en passant
			this.M[drow + (this.turn ? 1 : -1)][dcol] = eaten;
			eaten = null;
			break;
	}
	//rimetto il pezzo spostato e l'eventuale pezzo mangiato ai loro posti
	this.movePiece(drow, dcol, srow, scol);
	this.M[drow][dcol] = eaten;
}

/**
*	Crea un pezzo inserendone l'oggetto Piece nella matrice dei pezzi e la relativa immagine nella scacchiera
*		@param {Boolean} color Colore del pezzo
*		@param {Number} type Tipo del pezzo
*		@param {Number} row Riga di destinazione
*		@param {Number} col Colonna di destinazione
*/

Chess.prototype.createPiece = function(color, type, row, col){
	this.layout.createPiece(false, type, color, row, col);
	switch(type){
		case 0: this.M[row][col] = new King(color); break;
		case 1: this.M[row][col] = new Queen(color); break;
		case 2: this.M[row][col] = new Rook(color); break;
		case 3: this.M[row][col] = new Bishop(color); break;
		case 4: this.M[row][col] = new Knight(color); break;
		case 5: this.M[row][col] = new Pawn(color); break;
	}
}

/**
*
*/

Chess.prototype.newMatch = function(){
	this.createPiece(false, 0, 0, 4); this.createPiece(true, 0, 7, 4);
	this.createPiece(false, 1, 0, 3); this.createPiece(true, 1, 7, 3);
	this.createPiece(false, 2, 0, 0); this.createPiece(false, 2, 0, 7); this.createPiece(true, 2, 7, 0); this.createPiece(true, 2, 7, 7);
	this.createPiece(false, 3, 0, 2); this.createPiece(false, 3, 0, 5); this.createPiece(true, 3, 7, 2); this.createPiece(true, 3, 7, 5);
	this.createPiece(false, 4, 0, 1); this.createPiece(false, 4, 0, 6); this.createPiece(true, 4, 7, 1); this.createPiece(true, 4, 7, 6);
	for(i = 0; i < 8; i++){
		this.createPiece(false, 5, 1, i);
		this.createPiece(true, 5, 6, i);
	}
	//inizia il bianco
	this.turn = true;
	this.selected = null;
	this.kings.w.r = 7; this.kings.w.c = 4; this.kings.b.r = 0; this.kings.b.c = 4;
	this.checked = false;
	this.noEat = 0;
	this.lastMove = [-1, -1, -1 , -1];
	this.timers[0].setTime(1, 0, 0);
	this.timers[1].setTime(1, 0, 0);
	this.timers[1].start();
}

/**
*	Carica la partita salvata nei cookie o ne crea una nuova
*		@param {String} [newMatch] nome della partita da caricare, se omesso si carica una nuova partita
* 		@return {Boolean} true se la partita è stata caricata, false altrimenti
*/

Chess.prototype.loadMatch = function(matchName){
	var code, color, last, fields = utilities.getCookie(matchName);
	if(fields) //divido i campi del cookie
		fields = fields.split('.');
	else
		return false;
	this.cancelMatch(); //elimino le tracce della partita in corso
	var current = 0; //questo campo contiene la disposizione della scacchiera e il turno del prossimo giocatore
	for(var i = 0; i < 8; i++)
		for(var j = 0; j < 8; j++){
			code = fields[current].charCodeAt(i*8 + j) - 65;
			if(code != 30){
				//casella non vuota
				color = code > 10; //il bianco ha lettere minuscole, il nero maiuscole
				if(color)
					code -= 32;
				//casella vuota
				if(code < 6)
					this.createPiece(color, code, i, j);
				else{ //code == 6 || code == 8, è un re o una torre che sono stati mossi
					code -= 6
					this.createPiece(color, code, i, j);
					this.M[i][j].moved = true;
				}
				if(code == 0){ //se è un re ne aggiorno la posizione
					this.kings[color ? 'w' : 'b'].r = i;
					this.kings[color ? 'w' : 'b'].c = j;
				}
			}
		}
	this.turn = (fields[current].charAt(64) == 1);
	this.layout.changeTurn(this.turn);
	this.checked = this.check();
	if(this.checked)
		layout.check();
	else
		layout.unCheck();
	current++; //questo campo contiene il numero di mosse senza mangiare né muovere pedoni
	this.noEat = parseInt(fields[current]);
	layout.showDraw(this.noEat >= 100);
	current++; //questo campo contiene l'ultima mossa effettuata
	this.lastMove = fields[current].split('');
	current++; //questo campo contiene il tempo rimanente al giocatore bianco
	this.timers[0].stop();
	this.timers[1].stop();
	this.timers[1].setTime(parseInt(fields[current].substring(0,2)), parseInt(fields[current].substring(2,4)), parseInt(fields[current].substring(4,6)));
	current++; //questo campo contiene il tempo rimanente al giocatore nero
	this.timers[0].setTime(parseInt(fields[current].substring(0,2)), parseInt(fields[current].substring(2,4)), parseInt(fields[current].substring(4,6)));
	this.timers[Number(this.turn)].start();
	current++; //questo campo contiene informazioni riguardanti aspetti grafici
	this.layout.setLayout(fields[current]);
	return true;
}

/**
*	Salva la partita nei cookie
*		@param {String} matchName Nome con cui salvare la partita
*/

Chess.prototype.saveMatch = function(matchName){
	if(matchName){
		var value = '';
		var piece;
		//scrivo lo stato della scacchiera
		for(var i = 0; i < 8; i++)
			for(var j = 0; j < 8; j++){
				if(this.M[i][j] == null)
					piece = 95; //_
				else{
					piece = 65 + this.M[i][j].type + this.M[i][j].color*32; //A+type o a+type in base al colore
					if(this.M[i][j].type == 0 || this.M[i][j].type == 2)
						piece += 6*this.M[i][j].moved; //+6 se è stato mosso

				}
				value += String.fromCharCode(piece);
			}
		value += Number(this.turn);
		value += '.' + this.noEat;
		value += '.' + this.lastMove[0] + this.lastMove[1] + this.lastMove[2] + this.lastMove[3];
		value += '.' + this.timers[1].getTime() + '.' + this.timers[0].getTime();
		value += '.' + layout.getLayout();
		utilities.setCookie(matchName, value);
	}
}

/**
*	Elimina le tracce della partita corrente
*/

Chess.prototype.cancelMatch = function(){
	for(var i = 0; i < 8; i++)
		for(var j = 0; j < 8; j++)
			delete this.M[i][j];
	this.timers[Number(this.turn)].stop();
	layout.cancelMatch();
}

/**
*	Controlla se una mossa è consentita
*		@param {Number} srow Riga di partenza
*		@param {Number} scol Colonna di partenza
*		@param {Number} drow Riga di destinazione
*		@param {Number} dcol Colonna di destinazione
*		@return {Number} 0 se la mossa non è valida, 1 se è una mossa normale, >1 altrimenti
*/

Chess.prototype.allowedMove = function(srow, scol, drow, dcol){
	//controllo che sia una mossa valida per il pezzo
	var type = this.M[srow][scol].validMove(srow, scol, drow, dcol)
	if(!type)
		return false;
	var eaten = this.move(srow, scol, drow, dcol, type, true);
	//controllo che la mossa non mi metta sotto scacco
	ret = (this.check(this.turn) ? false : type);
	//annullo gli effetti della mossa
	this.cancelMove(srow, scol, drow, dcol, type, eaten);
	return ret;
}

/**
*	Interpreta la mossa inserita dal giocatore e, se è valida, la esegue
*		@param {Number} drow Riga di destinazione
*		@param {Number} dcol Colonna di destinazione
*		@return {Boolean} true se la mossa è valida ed è stata effettuata, false altrimenti
*/

Chess.prototype.tryMove = function(drow, dcol){
	var eaten, piece = this.M[this.selected.r][this.selected.c];
	var srow = this.selected.r; var scol = this.selected.c;
	var type = this.allowedMove(srow, scol, drow, dcol);
	var turn = this.turn;
	this.layout.dehighlight();
	this.selected = null;
	if(type){ //la mossa è valida
		this.switchTimer();
		//effettuo la mossa
		eaten = this.move(srow, scol, drow, dcol, type);
		//Se per 100 mosse non viene mangiato nessun pezzo né mosso alcun pedone il giocatore di turno può decidere di chiudere la partita in parità
		if(!eaten && piece.type != 5){
			this.noEat++;
			if(this.noEat == 100)
				this.layout.showDraw(true);
		}
		else{
			if(this.noEat >= 100)
				this.layout.hideDraw(false);
			this.noEat = 0;
			if(eaten && this.checkDraw()) //se ho mangiato qualcosa controllo che la partita non sia pareggiata
				layout.gameOver(2);
		}
		if(this.checked){ //se ero sotto scacco levo l'avviso
			this.checked = false;
			layout.unCheck(this.turn);
		}
		if(drow == (this.turn ? 0 : 7) && piece.type == 5){
			this.layout.pawnAtEnd(this.turn, dcol);
			this.layout.writeMove(this.turn, piece.type, srow, scol, drow, dcol, (eaten != 0), this.checked, type);
		}
		else{
			this.nextTurn();
			this.layout.writeMove(!this.turn, piece.type, srow, scol, drow, dcol, (eaten != 0), this.checked, type);
		}
		return true;
	}
	else
		return false;
}

/**
*	Effettua o simula una mossa
*		@param {Number} srow Riga di partenza
*		@param {Number} scol Colonna di partenza
*		@param {Number} drow Riga di destinazione
*		@param {Number} dcol Colonna di destinazione
*		@param {Number} type Tipo di mossa (1: mossa semplice, 2: arrocco corto, 3: arrocco lungo, 4: presa en passant)
*		@param {Boolean} simulate true se la mossa deve essere simulata al fine di controllare se è valida, false se deve essere effettuata
*		@return {Piece} Pezzo mangiato, null se non è stato mangiato nessun pezzo
*/

Chess.prototype.move = function(srow, scol, drow, dcol, type, simulate){
	var piece = this.M[srow][scol];
	var eaten = null;
	switch(type){
		case 2: //arrocco corto
			this.movePiece(srow, 7, drow, 5);
			if(!simulate) this.layout.movePiece(srow, 7, drow, 5, true);
			break;
		case 3: //arrocco lungo
			this.movePiece(srow, 0, drow, 3);
			if(!simulate) this.layout.movePiece(srow, 0, drow, 3, true);
			break;
		case 4: //presa en passant
			eaten = this.M[drow + (this.turn ? 1 : -1)][dcol];
			this.M[drow + (this.turn ? 1 : -1)][dcol] = null;
			if(!simulate)
				this.layout.eatPiece(drow + (this.turn ? 1 : -1), dcol);
			break;
		default:
			eaten = this.M[drow][dcol];
	}
	if(!simulate)
		eaten = (eaten == null ? 0 : eaten.type);
	this.movePiece(srow, scol, drow, dcol);
	if(!simulate){
		this.layout.movePiece(srow, scol, drow, dcol, true);
		this.lastMove[0] = srow; this.lastMove[1] = scol;
		this.lastMove[2] = drow; this.lastMove[3] = dcol;
		if(piece.type == 0 || piece.type == 2) //se ho mosso un re o una torre non posso più farne l'arrocco
			piece.moved = true;
	}
	return eaten;
}

/**
*	Passa al turno successivo controllando se si è verificato uno scacco, uno scacco matto o uno stallo
*/

Chess.prototype.nextTurn = function(){
	this.turn = !this.turn;
	layout.changeTurn(this.turn);
	if(this.check(this.turn)){ //controllo lo scacco
		this.checked = true;
		if(this.cantMove(this.turn)){ //controllo lo scacco matto
			this.layout.gameOver(0);
			this.timers[Number(this.turn)].stop();
			this.checked = 2;
		}
		else
			this.layout.check(this.turn);
	}
	else if(this.cantMove(this.turn)){ //controllo lo stallo
		this.timers[Number(this.turn)].stop();
		this.layout.gameOver(1);
	}
}

/**
*	Mostra le mosse valide per il pezzo selezionato
*		@param {Number} r Riga del pezzo di cui mostrare le mosse consentite
*		@param {Number} c Riga del pezzo di cui mostrare le mosse consentite
*/

Chess.prototype.showHints = function(r, c){
	switch(this.M[r][c].type){
		case 0: //re
			//caselle vicine
			for(var i = -1; i <= 1; i++)
				for(var j = -1; j <= 1; j++)
					if(this.allowedMove(r, c, r+i, c+j))
						this.layout.highlight(r+i, c+j);
			//arrocchi
			if(this.M[r][c].moved == false)
				if(this.allowedMove(r, c, r, c+2))
					this.layout.highlight(r, c+2);
				if(this.allowedMove(r, c, r, c-2))
					this.layout.highlight(r, c-2);
			break;
		case 1: //regina = torre + alfiere
			this.bishopMoves(r, c, true);
			this.towerMoves(r, c, true);
			break;
		case 2: //torre
			this.towerMoves(r, c, true);
			break;
		case 3: //alfiere
			this.bishopMoves(r, c, true);
			break;
		case 4: //cavallo
			if(this.allowedMove(r, c, r+1, c+2)) this.layout.highlight(r+1, c+2); if(this.allowedMove(r, c, r+1, c-2)) this.layout.highlight(r+1, c-2);
			if(this.allowedMove(r, c, r+2, c+1)) this.layout.highlight(r+2, c+1); if(this.allowedMove(r, c, r+2, c-1)) this.layout.highlight(r+2, c-1);
			if(this.allowedMove(r, c, r-1, c+2)) this.layout.highlight(r-1, c+2); if(this.allowedMove(r, c, r-1, c-2)) this.layout.highlight(r-1, c-2);
			if(this.allowedMove(r, c, r-2, c+1)) this.layout.highlight(r-2, c+1); if(this.allowedMove(r, c, r-2, c-1)) this.layout.highlight(r-2, c-1);
			break;
		case 5: //pedone
			var dir = (this.M[r][c].color ? -1 : 1);
			if(this.allowedMove(r, c, r+dir, c))
				this.layout.highlight(r+dir, c);
			if(this.allowedMove(r, c, r+2*dir, c))
				this.layout.highlight(r+2*dir, c);
			if(this.allowedMove(r, c, r+dir, c+1))
				this.layout.highlight(r+dir, c+1);
			if(this.allowedMove(r, c, r+dir, c-1))
				this.layout.highlight(r+dir, c-1);
	}
}

/**
*	Controlla e/o evidenzia le mosse valide per una torre
*		@param {Number} i Riga di partenza
*		@param {Number} j Colonna di partenza
*		@param {Boolean} hint Azione da svolgere (true: evidenziare le mosse possibili, false: restituire se il pezzo si può muovere o meno
*		@ignore
*/

Chess.prototype.towerMoves = function(i, j, hint){
	var k;
	for(k = 1; i+k < 9; k++)
		if(this.allowedMove(i, j, i+k, j))
			if(hint) this.layout.highlight(i+k, j);
			else 		return false;
	for(k = 1; i-k >= 0; k++)
		if(this.allowedMove(i, j, i-k, j))
			if(hint) this.layout.highlight(i-k, j);
			else		return false;
	for(k = 1; j+k < 9; k++)
		if(this.allowedMove(i, j, i, j+k))
			if(hint) this.layout.highlight(i, j+k);
			else		return false;
	for(k = 1; j-k >= 0; k++)
		if(this.allowedMove(i, j, i, j-k))
			if(hint) this.layout.highlight(i, j-k);
			else		return false;
	return true;
}

/**
*	Controlla e/o evidenzia le mosse valide per un alfiere
*		@param {Number} r Riga di partenza
*		@param {Number} c Colonna di partenza
*		@param {Boolean} hint Azione da svolgere (true: evidenziare le mosse possibili, false: restituire se il pezzo si può muovere o meno
*		@ignore
*/

Chess.prototype.bishopMoves = function(i, j, hint){
	for(var k = 1; i+k < 9 && j+k < 9; k++)
		if(this.allowedMove(i, j, i+k, j+k))
			if(hint) this.layout.highlight(i+k, j+k);
			else		return false;
	for(var k = 1; i-k >= 0 && j-k >= 0; k++)
		if(this.allowedMove(i, j, i-k, j-k))
			if(hint) this.layout.highlight(i-k, j-k);
			else		return false;
	for(var k = 1; i-k >= 0 && j+k < 9; k++)
		if(this.allowedMove(i, j, i-k, j+k))
			if(hint)	this.layout.highlight(i-k, j+k);
			else		return false;
	for(var k = 1; i+k < 9 && j-k >= 0; k++)
		if(this.allowedMove(i, j, i+k, j-k))
			if(hint) this.layout.highlight(i+k, j-k);
			else		return false;
	return true;
}

/**
*	Disattiva il cronometro in azione ed attiva quello in pausa
*/

Chess.prototype.switchTimer = function(){
	this.timers[Number(this.turn)].stop();
	this.timers[Number(!this.turn)].start();
}

/**
*	Gestisce lo scadere del tempo
*/

Chess.prototype.timeOver = function(){
	layout.gameOver(0);
}

/**
*	Seleziona un pezzo sulla scacchiera
*		@param {Number} row Riga in cui si trova il pezzo
*		@param {Number} col Colonna in cui si trova il pezzo
*/

Chess.prototype.select = function(row, col){
	this.selected = {r: row, c: col};
	this.layout.highlight(row, col, true);
	if(this.layout.showHints)
		this.showHints(row, col);
}

/**
*	Controlla che con i pezzi rimasti sia possibile dare scacco matto
*		@return {Boolean} true se con i pezzi rimasti non è possibile dare scacco matto, false altrimenti
*/

Chess.prototype.checkDraw = function(){
	var piece, color, horses = [false, false], bishops = [false, false];
	for(var i = 0; i < 8; i++)
		for(var j = 0; j < 8; j++){
			piece = this.M[i][j];
			if(piece != null)
				switch(piece.type){
					case 0:
						break;
					case 3:
						if(bishops[Number(piece.color)] || bishops[Number(!piece.color)] || horses[Number(!piece.color)])
							return false; //ho già un alfiere o il mio avversario ha già un cavallo o un alfiere
						bishops[Number(piece.color)] = true; //ho un alfiere
						break;
					case 4:
						if(horses[Number(piece.color)] || bishops[Number(!piece.color)] || horses[Number(!piece.color)])
							return false; //ho già un alfiere o il mio avversario ha già un cavallo o un alfiere
						horses[Number(piece.color)] = true; //ho un cavallo
						break;
					default:
						return false; //se ho una regina, una torre o un pedone posso sempre dare scacco matto
				}
		}
	return true;
}
