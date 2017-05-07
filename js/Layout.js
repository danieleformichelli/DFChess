/**
*	@fileOverview Layout.js
*	@author <a href="mailto:danele.formichelli@gmail.com">Daniele Formichelli</a>
*/

/**
*	@class Gestisce gli aspetti grafici del gioco degli scacchi
*		@property {Number} winW Larghezza in pixel della finestra
*		@property {Number} winH Altezza in pixel della finestra
*		@property {HTMLDivElement} left div sinistro contenente i cronometri e le mosse effettuate
*		@property {HTMLDivElement} center div centrale contenente la scacchiera
*		@property {HTMLDivElement} right div destro contenente i pezzi mangiati, le impostazioni e le informazioni sulla partita
*		@property {Object} chessBoard Contiene informazioni riguardanti la scacchiera
*		@property {HTMLFieldSetElement} settings Fieldset contenente le impostazioni
*		@property {Object} moves Nodi di testo contenenti le mosse effettuate
*		@property {HTMLDivElement} selected div contenente il pezzo selezionato
*		@property {Object} eaten Contiene i div in cui sono presenti i pezzi mangiati
*		@property {Boolean} showHints true se le mosse consentite devono essere visualizzate
*		@property {Object} dad Contiene informazioni riguardanti il Drag&Drop
*		@property {Object} timer Contiene informazioni riguardanti i cronometri
*		@property {HTMLSpanElement} checkSpan Span che mostra quando un giocatore è sotto scacco
*		@property {HTMLSpanElement} turn Span che mostra il giocatore corrente
*		@property {HTMLDivElement []} hints Contiene i div evidenziati in quanto mosse consentite
*		@property {Boolean} animations true quando le animazioni devono essere mostrate
*		@property {Boolean} inputDisabled true quando non deve essere accettato nessun tipo di input
*/

function ChessLayout(){
	this.winW = document.body.clientWidth;;
	this.winH = document.body.clientHeight;
	this.left = document.getElementById('left');
	this.center = document.getElementById('center');
	this.right = document.getElementById('right');
	this.chessBoard = {div: null, cellSize: 0, x: 0, y: 0};
	this.settings = document.getElementById('fieldset');
	this.moves = {w: document.getElementById('wmoves').firstChild, b: document.getElementById('bmoves').firstChild};
	this.selected = null;
	this.eaten = {w: null, b: null};
	this.showHints = document.getElementById('hints').checked;
	this.dad = {on: document.getElementById('dad').checked, img: null, x: 0, y: 0};
	this.timer = {w: document.getElementById('wtimer').firstChild, b: document.getElementById('btimer').firstChild};
	this.checkSpan = document.getElementById('check');
	this.turn = document.getElementById('turn').firstChild.firstChild;
	this.hints = new Array();
	this.animations = document.getElementById('animations').checked;
	this.inputDisabled = false;
	this.transparent = document.getElementById('transparent');
	this.newLine = (navigator.appName == 'Microsoft Internet Explorer' ? '\r' : '\n');
	//creo gli elementi grafici adattandone le dimensioni alla risoluzione corrente
	this.resizeContainer();
	this.createBoard();
	this.createRight();
	this.resizeLeft();
	this.resizeRight();
}

/**
*	Crea una cella
*		@param {Object} parent div nel quale inserire la cella
*		@param {Boolean} color colore della cella
*		@param {Number} row riga della cella
*		@param {Number} col colonna della cella
*/

ChessLayout.prototype.createCell = function(parent, color, row, col){
	var cell = document.createElement('div');
	cell.id = 'c' + row + col;
	cell.className = 'cell ' + (color ? 'white' : 'black');
	if(row == -1 || col == -1){ //cella della prima riga o della prima colonna
		if(row == -1) cell.className += ' top';
		if(col == -1) cell.className += ' left';
		if(row != col){ //Se non è la prima cella Inserisco la lettera [numero] corrispondente alla colonna [riga]
			header = document.createElement('p');
			var text = document.createTextNode(row == -1 ? String.fromCharCode(65 + col) : (8-row).toString());
			header.appendChild(text);
			cell.appendChild(header);
		}
	}
	else{ //cella della scacchiera (non header)
		if(col == 7)
			cell.className += ' last';
		cell.className += ' selectable';
		cell.onclick = eventH.cellClick;
	}
	parent.appendChild(cell);
}

/**
*	Crea la scacchiera
*/

ChessLayout.prototype.createBoard = function(){
	this.chessBoard.div = document.createElement('div');
	this.chessBoard.div.id = 'chessboard';
	//creo le celle
	var color = true;
	for(var i = 0; i <= 8; i++){
		for(var j = 0; j <= 8; j++){
			this.createCell(this.chessBoard.div, color, i-1, j-1);
			color = !color;
		}
	}
	//ridimensiono la scacchiera
	this.resizeBoard();
	document.getElementById('center').appendChild(this.chessBoard.div);
}

/**
*	Crea i contenitori per i pezzi mangiati
*/

ChessLayout.prototype.createRight = function(){
	this.eaten.b = document.createElement('div');
	this.eaten.b.id = 'beaten';
	this.eaten.b.className = 'container eaten';
	var color = true;
	for(var i = 0; i < 16; i++){
		var cell = document.createElement('div');
		cell.className = 'cell eaten '+ (color ? 'white' : 'black');
		this.eaten.b.appendChild(cell);
		if(i != 7) color = !color;
	}
	this.eaten.w = this.eaten.b.cloneNode(true);
	this.eaten.w.id = 'weaten';
	this.resizeRight();
	this.right.appendChild(this.eaten.b);
	this.right.appendChild(this.eaten.w);
}

/**
*	Crea un pezzo sulla scacchiera
*		@param {Boolean} eaten true se il pezzo deve essere creato tra i pezzi mangiati
*		@param {Number} type Tipo del pezzo da creare
*		@param {Boolean} color Colore del pezzo da creare
*		@param {Number} row Riga di destinazione
*		@param {Number} col Colonna di destinazione
*/

ChessLayout.prototype.createPiece = function(eaten, type, color, row, col){
	var piece = document.createElement('img');
	var cell;
	if(eaten){
		cell = this.eaten[color ? 'b' : 'w'].firstChild;
		while(cell.hasChildNodes())
			cell = cell.nextSibling;
	}
	else
		cell = this.chessBoard.div.childNodes[(row+1)*9 + col+1];
	color = color ? 'w' : 'b';
	piece.className = 'piece';
	piece.src = './img/pieces/' + color  + type + '.png';
	piece.alt = color + type;
	cell.appendChild(piece);
	//imposto l'handler per l'evento onmousedown
	if(!eaten)
		piece.onmousedown = eventH.pieceMouseDown;
	return piece;
}

/**
*	@event onresize
*	Handler dell'evento onresize, adatte il contenuto alla nuova dimensione della finestra
*/

ChessLayout.prototype.resize = function(){
	this.winW = document.body.clientWidth;
	this.winH = document.body.clientHeight;
	this.resizeContainer();
	this.resizeBoard();
	this.resizeLeft();
	this.resizeRight();
}

/**
*	Ridimensiona i 3 div contenitore left, center e right
*/

ChessLayout.prototype.resizeContainer = function(){
	//il center è largo quanto l'altezza della finestra fino a un massimo del 60% della larghezza (meno due margini dell'1%)
	var centerSize = Math.floor(0.98*Math.min(this.winW*0.6, this.winH) + 4);
	this.center.style.width = centerSize + 'px';
	//1/3 dello spazio rimanente va al left, 2/3 al right
	var leftSize = Math.floor((this.winW - centerSize)/3);
	this.left.style.width = leftSize + 'px';
	this.right.style.width = (this.winW - centerSize - leftSize - 1) + 'px';
	//l'altezza è la massima disponibile
	this.left.style.height = this.center.style.height = this.right.style.height = this.winH + 'px';
	//paragrafo che conterrà CheckMate, StaleMate o Draw
	var p = document.getElementById('gameover');
	//centrato verticalmente
	p.style.lineHeight = this.winH + 'px';
	p.style.fontSize = Math.floor(Math.min(this.winH/2, this.winW/7)) + 'px';
	var choice = document.getElementById('choice');
	//div che conterra la scelta del pedone promosso
	var contSize = Math.floor(Math.min(this.winH, this.winW)/2); //metà del minimo tra larghezza e altezza
	choice.style.top = (this.winH - contSize)/2 + 'px'; //centrato verticalmente
	choice.style.left = (this.winW - contSize)/2 + 'px'; //centrato orizzontalmente
	choice.style.width = contSize + 'px';
	choice.style.height = contSize + 'px';
}

/**
*	Ridimensiona la scacchiera
*/

ChessLayout.prototype.resizeBoard = function(){
	var centerWidth = parseInt(this.center.style.width);
	//prendo il massimo spazio disponibile in center meno 2 bordi da 2px
	var boardSize = Math.floor(Math.min(centerWidth, this.winH)) - 4;
	//il 12% della dimensione va ad ogni cella
	this.chessBoard.cellSize = Math.floor(0.12*boardSize);
	//quello che rimane va all'headerSize
	var headerSize = boardSize - 8*this.chessBoard.cellSize;
	this.chessBoard.div.style.width = this.chessBoard.div.style.height = boardSize + 'px';
	//centro verticalmente
	var top = Math.floor((this.winH - boardSize - 4)/2);
	this.chessBoard.div.style.top = top + 'px';
	this.chessBoard.div.style.fontSize = Math.floor(headerSize/2) + 'px';
	//divSinistro + colonnaHeader + bordo
	this.chessBoard.x = parseInt(this.left.style.width) + headerSize + 2;
	//margineSuperiore + rigaHeader + bordo
	this.chessBoard.y = top + headerSize + 2;
	for(var i = 0; i < 81; i++){
		if(i % 9 == 0){ //prima colonna
			this.chessBoard.div.childNodes[i].style.width = headerSize + 'px';
			this.chessBoard.div.childNodes[i].style.lineHeight = this.chessBoard.cellSize + 'px';
		}
		else
			this.chessBoard.div.childNodes[i].style.width = this.chessBoard.cellSize + 'px';
		if(i < 9){ //prima riga
			this.chessBoard.div.childNodes[i].style.height = headerSize + 'px';
			this.chessBoard.div.childNodes[i].style.lineHeight = headerSize + 'px';
		}
		else
			this.chessBoard.div.childNodes[i].style.height = this.chessBoard.cellSize + 'px';
	}
}

/**
*	Ridimensiona i contenuti del div right
*/

ChessLayout.prototype.resizeRight = function(){
	var rWidth = parseInt(this.right.style.width);
	//almeno 16 caratteri per riga e almeno 10 righe
	var fontSize = Math.floor(Math.min(rWidth*0.03, this.winH*0.02));
	this.right.style.fontSize = fontSize + 'px';
	//l'utilizzo di legend senza riposizionamento crea differenze nella colorazione del background su IE
	document.getElementById('settings').style.paddingTop = fontSize + 'px';
	this.settings.firstChild.style.top = Math.floor(-fontSize/2) + 'px'
	//div contenente informazioni sullo scacco e il turno corrente
	var info = document.getElementById('info');
	info.style.height = info.style.lineHeight = 3*fontSize +'px';
	info.style.fontSize = 2*fontSize + 'px';
	//ridimensiono i bottoni
	var buttons = document.getElementById('buttons');
	var buttonSize = Math.floor(Math.min(rWidth*0.16, this.winH*0.1));
	var margin = Math.floor((rWidth*0.8 - buttonSize*4)/5);
	document.getElementById('settings').style.bottom = (3*fontSize + 1.5*buttonSize) + 'px';
	buttons.style.bottom = 3*fontSize + 'px';
	buttons.style.height = buttonSize +'px';
	for(var i = 0; i < buttons.childNodes.length; i++)
		if(buttons.childNodes[i].nodeValue == null){
			buttons.childNodes[i].style.width = buttons.childNodes[i].style.height = buttonSize + 'px';
			buttons.childNodes[i].style.marginLeft = margin + 'px';
		}
	//ridimensiono le aree per i pezzi mangiati
	//margine laterale min 5%=rWidth*0.1 => 1-0.1=0.9, margine verticale min 2.5% = 0.05*this.winH => 0.25-0.05=0.20, 4px bordo
	var eatenCellSize = Math.floor(Math.min((rWidth*0.9 - 4)/8, (0.20*this.winH - 4)/2));
	this.eaten.b.style.width = this.eaten.w.style.width = 8*eatenCellSize + 'px';
	this.eaten.b.style.height = this.eaten.w.style.height = 2*eatenCellSize + 'px';
	//imposto i margini
	this.eaten.b.style.left = this.eaten.w.style.left = Math.floor((rWidth - eatenCellSize*8)/2) + 'px';
	this.eaten.b.style.top = this.eaten.w.style.bottom = Math.floor((this.winH*0.25 - eatenCellSize*2)/2) + 'px';
	for(var i = 0; i < 16; i++)
		this.eaten.b.childNodes[i].style.height = this.eaten.b.childNodes[i].style.width = this.eaten.w.childNodes[i].style.height = this.eaten.w.childNodes[i].style.width = eatenCellSize + 'px';
}

/**
*	Ridimensiona i contenuti del div left
*/

ChessLayout.prototype.resizeLeft = function(){
	var lWidth = parseInt(this.left.style.width);
	document.getElementById('movesDiv').style.fontSize = Math.floor(0.45*lWidth/8) + 'px'; //0.45*lWidth = larghezza dei div mosse
	//margine verticale minimo = 1% (timer.height = winH*0.15)
	this.timer.b.parentNode.style.fontSize = this.timer.w.parentNode.style.fontSize = Math.floor(Math.min(this.winH*0.13, lWidth/5)) + 'px';
	this.timer.b.parentNode.style.lineHeight = this.timer.w.parentNode.style.lineHeight = Math.floor(this.winH*0.15) + 'px';
}

/**
*	Muove un pezzo sulla scacchiera
*		@param {Number} srow Riga di partenza
*		@param {Number} scol Colonna di partenza
*		@param {Number} drow Riga di destinazione
*		@param {Number} dcol Colonna di destinazione
*/

ChessLayout.prototype.movePiece = function(srow, scol, drow, dcol){
	if(this.animations){ //animazioni attivate
		this.inputDisabled = true;
		this.animate(srow, scol, drow, dcol);
	}
	else{ //animazioni disattivate
		var src = this.chessBoard.div.childNodes[(srow+1)*9 + scol+1].firstChild;
		var dst = this.chessBoard.div.childNodes[(drow+1)*9 + dcol+1];
		if(dst.hasChildNodes())
			this.eatPiece(drow, dcol);
		dst.appendChild(src);
	}
}

/*
*	Muove un pezzo sulla scacchiera animandolo
*		@param {Number} srow Riga di partenza
*		@param {Number} scol Colonna di partenza
*		@param {Number} drow Riga di destinazione
*		@param {Number} dcol Colonna di destinazione
*		@param {Number} [time] Tempo (indicativo) di durata dell'animazione
*		@param {Number} [zoom] Fattore moltiplicativo della dimensione del pezzo durante lo spostamento
*		@param {Number} [dPos] Spostamento minimo in pixel dell'animazione
*/

ChessLayout.prototype.animate = function(srow, scol, drow, dcol, time, zoom, dPos){
	time = time || 500;
	zoom = zoom || 2;
	dPos = dPos || 2;
	var elem = layout.chessBoard.div.childNodes[(srow+1)*9 + scol+1];
	//metto il div in movimento in primo piano
	elem.className += ' onTop';
	utilities.removeClass(elem, 'selectable');
	elem = elem.lastChild;
	//spostamento massimo in celle
	var max = Math.max(Math.abs(dcol-scol), Math.abs(drow-srow));
	//numero di chiamate = numeroCelle*dimensioneCelle / incrementoPerChiamata
	var count = Math.floor((max * layout.chessBoard.cellSize) / dPos);
	var count2 = Math.floor(count/2);
	//aumento di dimensione per chiamata = aumentoTotale / numeroChiamate
	var dSize = (zoom-1)*layout.chessBoard.cellSize / count2;
	//intervallo tra le chiamate = tempo / numeroChiamate
	time = Math.max(Math.floor(time / count), 1);
	//spostamento per chiamata = spostamentoTotale / numeroChiamate - variazioneDimensioni/2 (devo compensare l'aumento delle dimensioni per mantenere il pezzo centrato nella cella)
	var dc = (dcol - scol)*layout.chessBoard.cellSize / count - dSize/2;
	var dr = (drow - srow)*layout.chessBoard.cellSize / count - dSize/2;
	var size = layout.chessBoard.cellSize;
	var x = 0;
	var y = 0;
	var This = this;
	var move = function(){
		elem.style.left = (x += dc) + 'px';
		elem.style.top = (y += dr)  + 'px';
		elem.style.height = elem.style.width = (size += dSize) + 'px';
			if(!(--count)){
				clearInterval(id);
				var cell = elem.parentNode;
				elem.style.top = elem.style.left = elem.style.width = elem.style.height = '';
				utilities.removeClass(elem.parentNode, 'onTop');
				var dst = This.chessBoard.div.childNodes[(drow+1)*9 + dcol + 1];
				if(dst.hasChildNodes())
					This.eatPiece(drow, dcol);
				dst.appendChild(elem);
				This.inputDisabled = false;
				cell.className += ' selectable';
			}
			else if(count == count2){
				dr += dSize;
				dc += dSize;
				dSize = -dSize;
			}
	}
	var id = setInterval(move, time);
}

/**
*	Sposta un pezzo dalla scacchiera al contenitore dei pezzi mangiati
*		@param {Number} row Riga in cui si trova il pezzo
*		@param {Number} col Colonna in cui si trova il pezzo
*/

ChessLayout.prototype.eatPiece = function(row, col){
	var dst = this.chessBoard.div.childNodes[(row+1)*9 + col + 1];
	if(dst.firstChild == null)
		return false;
	//immagine mangiata
	var eaten = dst.removeChild(dst.firstChild);
	//seleziono il div di destinazione in base al colore del pezzo mangiato
	var div = this.eaten[eaten.alt.charAt(0) == 'w' ? 'b' : 'w'];
	//trovo la prima casella vuota
	var i = -1;
	do{} while(div.childNodes[++i].hasChildNodes());
	div.childNodes[i].appendChild(eaten);
	//disattivo l'evento onmousedown sull'immagine
	//eaten.onmousedown = utilities.disable;
}

/**
*	Evidenzia un pezzo della scacchiera
*		@param {Number} row Riga da evidenziare
*		@param {Number} col Colonna da evidenziare
*		@param {Boolean} scol true se la casella è selezionata, false se è una mossa consentita
*/

ChessLayout.prototype.highlight = function(row, col, type){
	var div = this.chessBoard.div.childNodes[(row+1)*9 + col + 1];
	if(type){ //evidenzio perché pezzo selezionato
		this.dehighlight();
		this.selected = div;
		div.className += ' selected';
	}
	else{ //evidenzio perché mossa consentita
		this.hints.push(div);
		div.className += ' hint';
	}
}

/**
*	Ripristina il colore originale delle celle evidenziate
*/

ChessLayout.prototype.dehighlight = function(){
	if(this.selected != null)
		utilities.removeClass(this.selected, 'selected');
	while(this.hints.length)
		utilities.removeClass(this.hints.pop(), 'hint');
	this.selected = null;
}

/**
*	Mostra la scelta quano un pedone ha raggiunto l'ultima riga
*		@param {Boolean} color Colore del pedone
*/

ChessLayout.prototype.pawnAtEnd = function(color){
	var cont = document.getElementById('choice');
	var i = 0, j = 1;
	color = color ? 'w' : 'b';
	var elem = cont.firstChild;
	for(j = 1; j <= 4; elem = elem.nextSibling){
		if(elem.nodeValue == null) //se è null è un immagine altrimenti è un nodo di testo
			elem.src = './img/pieces/' + color + j++ + '.png';
	}
	cont.style.visibility = 'visible';
	this.transparent.style.visibility = 'visible';
}

/**
*	Mostra al giocatore che è sotto scacco
*/

ChessLayout.prototype.check = function(){
	this.checkSpan.style.visibility = 'visible';
}

/**
*	Nasconde l'avviso che il giocatore è sotto scacco
*/

ChessLayout.prototype.unCheck = function(){
	this.checkSpan.style.visibility = 'hidden';
}

/**
*	Scrive una mossa nell'area apposita
*		@param {Boolean} color Colore del pezzo mosso
*		@param {Number} piece Tipo di pezzo
*		@param {Number} srow Riga di partenza
*		@param {Number} scol Colonna di partenza
*		@param {Number} drow Riga di destinazione
*		@param {Number} dcol Colonna di destinazione
*		@param {Boolean} eat true se è stato mangiato un pezzo
*		@param {Boolean} checked true se la mossa ha messo sotto scacco l'avversario
*		@param {Numeric} type Tipo di mossa
*/

ChessLayout.prototype.writeMove = function(color, piece, srow, scol, drow, dcol, eat, checked, type){
	var p = this.moves[color ? 'w' : 'b'], str = '';
	switch(type){
		case 2:
			str = ' 0-0';
			break;
		case 3:
			str = ' 0-0-0';
			break;
		case 4:
			str = ' ep';
			break;
	}
	switch(piece){
		case 0: piece = 'K'; break;
		case 1: piece = 'Q'; break;
		case 2: piece = 'R'; break;
		case 3: piece = 'B'; break;
		case 4: piece = 'N'; break;
		case 5: piece = 'P'; break;
	}
	//piece = String.fromCharCode(piece + (color ? 9812 : 9818)); i browser utilizzati non supportano i caratteri unicode degli scacchi
	p.nodeValue += this.newLine + piece + String.fromCharCode(97 + scol) + (8-srow) + (eat ? 'x' : '-') + String.fromCharCode(97 + dcol) + (8-drow) + (checked ? (checked == 2 ? '#'  : '+'): '') + str;
}

/**
*	Cambia il turno visualizzato
*		@param {Boolean} turn Turno da visualizzare
*/

ChessLayout.prototype.changeTurn = function(turn){
	this.turn.nodeValue = turn ? 'White' : 'Black';
}

/**
*	Ripristina i pezzi mangiati e le mosse effettuate di una partita salvata
*		@param {String} saved Stringa contenente il layout salvato
*/

ChessLayout.prototype.setLayout = function(saved){
	saved = saved.split('_');
	//ripristino i pezzi mangiati
	for(var i = 0; i < saved[0].length; i++)
		this.createPiece(true, saved[0].charAt(i), false);
	for(var i = 0; i < saved[1].length; i++)
		this.createPiece(true, saved[1].charAt(i), true);
	//ripristino le mosse effettuate
	this.setMoves(true, saved[2]);
	this.setMoves(false, saved[3]);
}

/**
*	Scrive nello spazio apposito le mosse contenute in una stringa
*		@param {Boolean} color Colore del giocatore a cui aggiungere le mosse
*		@param {String} moves Stringa contenente le mosse
*/

ChessLayout.prototype.setMoves = function(color, moves){
	var len = moves.length/6; //ogni mossa è composta da 6 caratteri
	var c = (color ? 'w' : 'b');
	for(var i = 0; i < len; i++)
		this.moves[c].nodeValue += this.newLine + this.unzipMove(moves.substring(i*6, i*6+6), color);
}

/**
*	Restituisce una stringa contenente le mosse effettuate e i pezzi mangiati
*		@return {String} Stringa contenente le mosse effettuate e i pezzi mangiati
*/

ChessLayout.prototype.getLayout = function(){
	var ret = '';
	var piece;
	for(var i = 0; (piece = this.eaten.w.childNodes[i].firstChild); i++)
		ret += piece.alt.charAt(1);
	ret += '_';
	for(var i = 0; (piece = this.eaten.b.childNodes[i].firstChild); i++)
		ret += piece.alt.charAt(1);
	ret += '_';
	var moves = this.moves.w.nodeValue.split(this.newLine);
	for(var i = 1; i < moves.length; i++)
		ret += this.zipMove(moves[i]);
	ret += '_';
	moves = this.moves.b.nodeValue.split(this.newLine);
	for(var i = 1; i < moves.length; i++)
		ret += this.zipMove(moves[i]);
	return ret;
}

/**
*	Restituisce una stringa che rappresenta una mossa in un formato uniforme per tutte le mosse:
*	Formato: psstdd; p: tipo di pezzo, ss: coordinate di origine, t: tipo mossa, dd: coordinate di destinazione
*		@param {String} move Mossa nel formato originale
*		@return {String} Mossa nel formato uniformato (tssmdd)
*/

ChessLayout.prototype.zipMove = function(move){
	var ret = move.substring(0, 3);
	//ret = move.charCodeAt(0) - 9812; i browser utilizzati non supportano i caratteri unicode degli scacchi
	//ret = (ret > 5 ? ret-6 : ret).toString();
	//ret += move.substring(1, 3);
	switch(move.length){
		case 7: //scacco semplice con o senza mangiare
			ret += (move.charAt(3) == 'x' ? '*' : '+');
			break;
		case 9: //presa en passant
			ret += 'p';
			break;
		case 10: //presa en passant + scacco o arrocco corto
			ret += (move.charAt(6) == '+' ? 'P' : 's');
			break;
		case 11: //arrocco corto + scacco
			ret += 'S';
			break;
		case 12: //arrocco lungo
			ret += 'l';
			break;
		case 13: //arrocco lungo + scacco
			ret += 'L';
		default: //mossa semplice
			ret += move.charAt(3);
	}
	ret += move.substring(4, 6); //coordinate di arrivo
	return ret;
}

/**
*	Restituisce una stringa che rappresenta una mossa nel formato visualizzato
*		@param {String} move Mossa nel formato uniformato
*		@param {Boolean} color Colore del giocatore che ha effettuato la mossa
*		@return {String} Mossa nel formato di visualizzazione
*/

ChessLayout.prototype.unzipMove = function(move, color){
	var ret = move.substring(0,3);
	//ret = String.fromCharCode(9812 + (!color)*6 + move.charCodeAt(0) - 48); i browser utilizzati non supportano i caratteri unicode degli scacchi
	//ret += move.substring(1,3);
	var type = move.charAt(3);
	if(type == 'x' || type == 'p' || type == 'P' || type == '*')
		ret += 'x';
	else
		ret += '-';
	ret += move.substring(4, 6);
	if((type.charCodeAt(0) < 97 && type.charAt(0) != '-') || type.charAt(0) == '*') //+,* o lettera maiuscola
		ret += '+';
	switch(type){
		case 's': case 'S':
			ret += ' 0-0';
			break;
		case 'l': case 'L':
			ret += ' 0-0-0';
			break;
		case 'p': case 'P':
			ret += ' ep';
			break;
	}
	return ret;
}

/**
*	Trasforma il bottone 'Ask for Draw' nel bottone 'Draw' o viceversa
*		@param {Boolean} bool true se setto a 'Draw', false se setto a 'Ask for Draw'
*/

ChessLayout.prototype.showDraw = function(bool){
	if(bool)
		document.getElementById('draw').firstChild.nodeValue = 'Draw';
	else
		document.getElementById('draw').firstChild.nodeValue = 'Ask for Draw';
}

/**
*	Aggiorna il valore di un cronometro
*		@param {Boolean} color Cronometro da aggiornare
*		@param {Number} h Ore
*		@param {Number} m Minuti
*		@param {Number} s Secondi
*/

ChessLayout.prototype.setTimer = function(color, h, m, s){
	this.timer[color ? 'w' : 'b'].nodeValue = (h < 10 ? '0'+h : h)+':'+(m < 10 ? '0'+m : m)+':'+(s < 10 ? '0'+s : s);
}

/**
*	Cancella la partita corrente
*/

ChessLayout.prototype.cancelMatch = function(){
	var deleteCells = function(container){
		var child;
		for(var i = 0; i < container.childNodes.length; i++)
			if((child = container.childNodes[i].firstChild) != null && child.nodeName == 'IMG')
				utilities.deleteNode(child);
	}
	this.dehighlight();
	deleteCells(this.chessBoard.div);
	deleteCells(this.eaten.w);
	deleteCells(this.eaten.b);
	this.moves.w.nodeValue = 'White:';
	this.moves.b.nodeValue = 'Black:';
	this.checkSpan.style.visibility = 'hidden';
}

/**
*	Mostra il popup per il salvataggio/caricamento delle partite
*		@param {Boolean} type true se si sta salvando, false se si sta caricando
*/

ChessLayout.prototype.showSavedMatches = function(type){
	//ottengo i nomi delle partite salvate e creo il menu
	var savedMatches = utilities.getSavedMatches();
	var select = document.createElement('select');
	select.id = 'select';
	for(var i = 0; i < savedMatches.length; i++){
		var opt = document.createElement('option');
		opt.label = savedMatches[i];
		opt.appendChild(document.createTextNode(savedMatches[i]));
		select.appendChild(opt);
	}
	//nascondo i puslanti inutilizzati
	if(type){
		document.getElementById('new').style.display = '';
		document.getElementById('save').style.display = '';
		document.getElementById('load').style.display = 'none';
	}
	else{
		document.getElementById('new').style.display = 'none';
		document.getElementById('save').style.display = 'none';
		document.getElementById('load').style.display = '';
	}
	var saved = document.getElementById('savedMatches');
	saved.firstChild.firstChild.nodeValue = (type ? 'Choose the match to be saved:' : 'Choose the match to be loaded:');
	saved.insertBefore(select, saved.childNodes[1]);
	this.transparent.style.visibility = 'visible';
	document.getElementById('savedMatches').style.visibility = 'visible';
}

/**
*	Elimino il menu contenente le partite salvate e chiudo il popup
*/

ChessLayout.prototype.hideSavedMatches = function(){
	var select = document.getElementById('select');
	utilities.deleteNode(select);
	this.transparent.style.visibility = 'hidden';
	document.getElementById('savedMatches').style.visibility = 'hidden';
}

/**
*	Mostra che la partita è finita (scacco matto, stallo o pareggio)
*		@param {Number} type Motivo della fine della partita
*/

ChessLayout.prototype.gameOver = function(type){
	this.dehighlight();
	var p = document.getElementById('gameover');
	switch(type){
		case 0: //scacco matto
			p.firstChild.nodeValue = 'CheckMate!';
			break;
		case 1: //stallo
			p.firstChild.nodeValue = 'StaleMate!';
			break;
		case 2: //pareggio
			p.firstChild.nodeValue = 'Draw';
			break;
	}
	this.transparent.onclick = eventH.newMatch;
	p.style.visibility = 'visible';
	this.transparent.style.visibility = 'visible';
}