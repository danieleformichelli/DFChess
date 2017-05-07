/**
*	@fileOverview Piece.js
*	@author <a href="mailto:danele.formichelli@gmail.com">Daniele Formichelli</a>
*/

/**
*	@class Rappresenta un pezzo degli scacchi
*		@property {Boolean} color Colore del pezzo
*		@property {HTMLImageElement} node Elemento immagine che rappresenta il pezzo
*		@property {Number} type Tipo del pezzo
*/

function Piece(color, type){
	this.color = color;
	this.type = type;
}

/**
*	@class Rappresenta un re
*		@property {Boolean} moved true se il pezzo è stato mosso, false altrimenti
*		@augments Piece
*/

function King(color){
	Piece.call(this, color, 0);
	this.moved = false;
}
King.prototype = new Piece;

/**
*	Controlla se una mossa è valida per un re
*		@param {Number} r1 Riga di partenza
*		@param {Number} c1 Riga di partenza
*		@param {Number} r2 Riga di destinazione
*		@param {Number} c2 Riga di destinazione
*		@return {Boolean} true se la mossa è valida, false altrimenti
*/

King.prototype.validMove = function(r1, c1, r2, c2){
	//controllo che le coordinate siano valide e che non mi stia muovendo su un mio pezzo
	if(Math.min(r1,c1,r2,c2) < 0 || Math.max(r1,c1,r2,c2) > 7 || (chess.M[r2][c2] != null && chess.M[r2][c2].color == this.color))
		return false;
	//una qualsiasi mossa in una casella vicina è valida
	if(r2 >= r1 - 1 && r2 <= r1 + 1 && c2 >= c1 -1 && c2 <= c1 + 1)
		return true;
	//arrocchi: devo essere nella riga 7 o 0, nella colonna 4 e devo andare nella colonna 2 o 6
	if(r2 == (this.color ? 7 : 0) && (c2 == 6 || c2 == 2)){ //r1 == r2 e c1 == 4 derivano da this.moved = false
		if(this.moved || chess.checked) //se il re è stato mosso o è sotto scacco non è possibile effettuare l'arrocco
			return false;
		if(c2 == 6){ //arrocco corto
			//controllo che la torre non si sia mossa
			if(chess.M[r2][7] != null && chess.M[r2][7].moved === false){
				//controllo che le caselle tra il re e la torre siano libere
				if(chess.M[r2][5] != null || chess.M[r2][6] != null)
					return false;
				//controllo che la prima casella non sia sotto attacco
				chess.movePiece(r2, 4, r2, 5);
				if(chess.check(this.color)){
					//ripristino le condizioni iniziali
					chess.movePiece(r2, 5, r2, 4);
					return false;
				}
				//controllo che la seconda casella non sia sotto attacco
				chess.movePiece(r2, 5, r2, 6);
				if(chess.check(this.color)){
					//ripristino le condizioni iniziali
					chess.movePiece(r2, 6, r2, 4);
					return false;
				}
				//ripristino le condizioni iniziali
				chess.movePiece(r2, 6, r2, 4);
				return 2;
			}
		}
		else{ //arrocco lungo
			//controllo che la torre non si sia mossa
			if(chess.M[r2][0] != null && chess.M[r2][0].moved === false){
				//controllo che le caselle tra il re e la torre siano libere
				if(chess.M[r2][1] != null || chess.M[r2][2] != null || chess.M[r2][3] != null)
					return false;
				//controllo che la prima casella non sia sotto attacco
				chess.movePiece(r2, 4, r2, 3);
				if(chess.check(this.color)){
					//ripristino le condizioni iniziali
					chess.movePiece(r2, 3, r2, 4);
					return false;
				}
				//controllo che la seconda casella non sia sotto attacco
				chess.movePiece(r2, 3, r2, 2);
				if(chess.check(this.color)){
					//ripristino le condizioni iniziali
					chess.movePiece(r2, 2, r2, 4);
					return false;
				}
				//ripristino le condizioni iniziali
				chess.movePiece(r2, 2, r2, 4);
				return 3;
			}
		}
	}
	return false;
}

/**
*	@class Rappresenta una regina
*	@augments Piece
*/

function Queen(color){
	Piece.call(this, color, 1);
}
Queen.prototype = new Piece;

/**
*	Controlla se una mossa è valida per una regina
*		@param {Number} r1 Riga di partenza
*		@param {Number} c1 Riga di partenza
*		@param {Number} r2 Riga di destinazione
*		@param {Number} c2 Riga di destinazione
*		@return {Boolean} true se la mossa è valida, false altrimenti
*/

Queen.prototype.validMove = function(r1, c1, r2, c2){
	//controllo che le coordinate siano valide e che non mi stia muovendo su un mio pezzo
	if(Math.min(r1,c1,r2,c2) < 0 || Math.max(r1,c1,r2,c2) > 7 || (chess.M[r2][c2] != null && chess.M[r2][c2].color == this.color))
		return false;
	var Dr = r2 - r1; //spostamento di riga
	var Dc = c2 - c1; //spostamento di colonna
	var dr = (Dr > 0 ? 1 : (Dr == 0 ? 0 : -1)); //incremento di riga
	var dc = (Dc > 0 ? 1 : (Dc == 0 ? 0 : -1)); //incremento di colonna
	var D = Math.max(Dr*dr, Dc*dc); //massimo del valore assoluto dello spostamento
	if((Dr*dr != Dc*dc) && Dr != 0 && Dc != 0) return false; //movimento né diag né orizz
	//controllo che il cammino sia vuoto
	for(var i = 1; i != D; i ++)
	if(chess.M[r1 + i*dr][c1 + i*dc] != null)
		return false;
	return true;
}

/**
*	@class Rappresenta una torre
*		@param {Boolean} moved true se il pezzo è stato mosso, false altrimenti
*		@augments Piece
*/

function Rook(color){
	Piece.call(this, color, 2);
	this.moved = false;
}
Rook.prototype = new Piece;

/**
*	Controlla se una mossa è valida per una torre
*		@param {Number} r1 Riga di partenza
*		@param {Number} c1 Riga di partenza
*		@param {Number} r2 Riga di destinazione
*		@param {Number} c2 Riga di destinazione
*		@return {Boolean} true se la mossa è valida, false altrimenti
*/

Rook.prototype.validMove = function(r1, c1, r2, c2){
	//controllo che le coordinate siano valide e che non mi stia muovendo su un mio pezzo
	if(Math.min(r1,c1,r2,c2) < 0 || Math.max(r1,c1,r2,c2) > 7 || (chess.M[r2][c2] != null && chess.M[r2][c2].color == this.color))
		return false;
	var Dr = r2 - r1; //spostamento di riga
	var Dc = c2 - c1; //spostamento di colonna
	var dr = (Dr > 0 ? 1 : (Dr == 0 ? 0 : -1)); //incremento di riga
	var dc = (Dc > 0 ? 1 : (Dc == 0 ? 0 : -1)); //incremento di riga
	//controllo che almeno uno spostamento sia nullo
	if(dr != 0 && dc != 0)
		return false;
	var D = Dr*dr + Dc*dc; //valore assoluto dello spostamento non nullo
	//controllo che il cammino sia vuoto
	for(i = 1; i < D; i++){
		if(chess.M[r1 + i*dr][c1 + i*dc] != null)
			return false;
	}
	return true;
}

/**
*	@class Rappresenta un alfiere
*		@augments Piece
*/

function Bishop(color){
	Piece.call(this, color, 3);
}
Bishop.prototype = new Piece;

/**
*	Controlla se una mossa è valida per un alfiere
*		@param {Number} r1 Riga di partenza
*		@param {Number} c1 Riga di partenza
*		@param {Number} r2 Riga di destinazione
*		@param {Number} c2 Riga di destinazione
*		@return {Boolean} true se la mossa è valida, false altrimenti
*/

Bishop.prototype.validMove = function(r1, c1, r2, c2){
	//controllo che le coordinate siano valide e che non mi stia muovendo su un mio pezzo
	if(Math.min(r1,c1,r2,c2) < 0 || Math.max(r1,c1,r2,c2) > 7 || (chess.M[r2][c2] != null && chess.M[r2][c2].color == this.color))
		return false;
	var Dr = r2 - r1; //spostamento di riga
	var Dc = c2 - c1; //spostamento di colonna
	var dr = (Dr > 0 ? 1 : -1); //incremento di riga
	var dc = (Dc > 0 ? 1 : -1); //incremento di riga
	//Controllo che lo spostamento sia diagonale
	if(Dr*dr != Dc*dc)
		return false;
	var D = Dr*dr; //valore assoluto dello spostamento
	//controllo che il cammino sia vuoto
	for(var i = 1; i != D; i++){
		if(chess.M[r1 + i*dr][c1 + i*dc] != null)
			return false;
	}
	return true;
}

/**
*	@class Rappresenta un cavallo
*	@augments Piece
*/

function Knight(color){
	Piece.call(this, color, 4);
}
Knight.prototype = new Piece;

/**
*	Controlla se una mossa è valida per un cavallo
*		@param {Number} r1 Riga di partenza
*		@param {Number} c1 Riga di partenza
*		@param {Number} r2 Riga di destinazione
*		@param {Number} c2 Riga di destinazione
*		@return {Boolean} true se la mossa è valida, false altrimenti
*/

Knight.prototype.validMove = function(r1, c1, r2, c2){
	//controllo che le coordinate siano valide e che non mi stia muovendo su un mio pezzo
	if(Math.min(r1,c1,r2,c2) < 0 || Math.max(r1,c1,r2,c2) > 7 || (chess.M[r2][c2] != null && chess.M[r2][c2].color == this.color))
		return false;
	Dr = Math.abs(r2 - r1);
	Dc = Math.abs(c2 - c1);
	if(!(Dr == 2 && Dc == 1) && !(Dr == 1 && Dc == 2))
		return false;
	return true;
}

/**
*	@class Rappresenta un pedone
*	@augments Piece
*/

function Pawn(color){
	Piece.call(this, color, 5);
}
Pawn.prototype = new Piece;

/**
*	Controlla se una mossa è valida per un pedone
*		@param {Number} r1 Riga di partenza
*		@param {Number} c1 Riga di partenza
*		@param {Number} r2 Riga di destinazione
*		@param {Number} c2 Riga di destinazione
*		@return {Boolean} true se la mossa è valida, false altrimenti
*/

Pawn.prototype.validMove = function(r1, c1, r2, c2){
	//controllo che le coordinate siano valide e che non mi stia muovendo su un mio pezzo
	if(Math.min(r1,c1,r2,c2) < 0 || Math.max(r1,c1,r2,c2) > 7 || (chess.M[r2][c2] != null && chess.M[r2][c2].color == this.color))
		return false;
	var dir = (this.color ? -1 : 1); //direzione consentita
	if(c2 == c1 && chess.M[r2][c2] == null){ //non cambio colonna e quindi non mangio
		if(r2 == r1 + dir)  //avanzamento di una casella
			return true;
		if((r1 == (this.color ? 6 : 1) && r2 == r1 + 2*dir) && chess.M[r1 + dir][c1] == null)  //avanzamento di due caselle
			return true;
	}
	if(r2 == r1 + dir && (c2 == c1 + 1 || c2 == c1 - 1)){ //spostamento diagonale
		//controllo che la casella di destinazione sia occupata (da un pezzo avversario)
		if(chess.M[r2][c2] != null)
			return true;
		else{ //presa en passant
			//controllo di essere a due righe di distanza dalla righe di partenza dei pedoni avversari, che l'ultima mossa sia stata di un pedone che si è mosso di due caselle dalla riga di partenza dei pedoni avversari e si trova nella mia colonna di destinazione.
			if(r1 == (this.color ? 3 : 4) && chess.lastMove[0] == r2+dir && chess.lastMove[2] == r2-dir && chess.lastMove[3] == c2 && chess.M[r2-dir][c2] instanceof Pawn)
				return 4;
		}
	}
	return false;
}