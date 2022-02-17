class Game {
    legalMovesArr = [];
    playerTurn = true; //red (white)
    captureMovesArr = [[],[]]; //index 0 for white(red), 1 for black
    redPieceCount = 12;
    blackPieceCount = 12;
    board = [];    /*
                    index = location, 
                    values : -1 = white suqre, 
                              0 = empty(black) square,  
                              1 = red piece, 
                              2 = red king, 
                              3 = black piece, 
                              4 = black king
                    */
    clickAudio = new Audio('click.mp3');
    lastClicked = -1;
    
    constructor(){
        for(let i = 0; i < 8; i++)
        {   
            let currentColor = i % 2 === 0 ? -1 : 1; //1 is placeholder 
            for(let j = 0; j < 8; j++){
                this.board[i * 8 + j] = currentColor;
                currentColor*=-1;
            }                        
        }
        
        for(let i = 0; i < 64; i ++){
            if(this.board[i] === 1 && i > 39)       
                this.board[i] = 3;   

            if(this.board[i] === 1 && i > 23 && i < 40)       
                this.board[i] = 0;   
        }
        this.startGame();
    }

    calculateLegalMoves(location){
        let result = [];
        let possibleDirections = [];
        let distanceModifier = (this.board[location] == 1 || this.board[location] == 2)? 0 : 16;
        let isKing = (this.board[location] === 2 || this.board[location] === 4) ? true : false;

        if(this.board[location] > 0){
            if(location % 8 != 0){
                possibleDirections.push(7 - distanceModifier);
                if (isKing)
                        possibleDirections.push(-9 + distanceModifier );
            }
            if((location - 7) % 8 != 0){
                possibleDirections.push(9 - distanceModifier);
                if (isKing)
                        possibleDirections.push(-7 + distanceModifier);
            }

            for(let direction of possibleDirections)
            {
                let outOfBounds = (location + direction > 64 || location + direction < 0)? true : false;
                let boardEdge = (location + direction * 2 > 64 || location + direction * 2 < 0)? true : false;
                let oppositeColor = (this.redPiece(location + direction) &&  this.blackPiece(location)) || (this.blackPiece(location + direction) &&  this.redPiece(location));
    
                if(!outOfBounds && this.board[location + direction] === 0 )
                    result.push(location + direction);
                    
                else if (!outOfBounds && oppositeColor  && !boardEdge) {
                    if(this.board[location + direction * 2] === 0){
                        result.push(location + direction * 2);
                    }
                }
            }
        }
        
        this.legalMovesArr[location] = result;
        if(result.length === 0)
            return false;
        else return true;
    }

    redPiece(location){
        return (this.board[location] === 1 || this.board[location] === 2);
    }

    blackPiece(location){
        return (this.board[location] === 3 || this.board[location] === 4);
    }

    promotePiece(location){
        if(this.board[location] != 2 && this.board[location] != 4){
            this.board[location] = this.board[location] === 1? 2 : 4;
        }
    }

    movePiece(location, destination){
        let consecutiveCapture = false;
        let color = (this.board[location] === 1 || this.board[location] === 2) ? 0 : 1;

        if(this.captureMovesArr[color].length != 0 && !this.captureMovesArr[color].includes(destination) || (this.captureMovesArr[color].includes(destination) && Math.abs(location - destination) < 10)){
            console.log("Illegal move, captures must be taken.");
            return;
        }
    
        if(this.legalMovesArr[location] != null && this.legalMovesArr[location].includes(destination)){   
            this.board[destination] = this.board[location];
            this.board[location] = 0;
            if(Math.abs(destination - location) > 9){
                this.board[(destination + location) / 2] = 0;
                if(color == 0)
                    this.blackPieceCount--;
                else 
                    this.redPieceCount--;
            }    
            if(destination > 55 || destination < 8)
                this.promotePiece(destination);
            
            this.calcCaptureDestinations();
            if(Math.abs(location - destination) > 9){
                for(let item of this.legalMovesArr[destination]){
                    if(this.captureMovesArr[color].includes(item))
                        consecutiveCapture = true;
                }
            }
            if(!consecutiveCapture){
                this.playerTurn = !this.playerTurn;
            }
        }
        this.updateBoardUi(location, destination);
        if(this.blackPieceCount === 0|| this.redPieceCount === 0){
                let winner =this.blackPieceCount === 0 ? 'red' : 'black';
                console.log("The game is over, the winner is " + winner);
        }
    }

    calcCaptureDestinations(){
        let color; //0 for red, 1 for black
        this.captureMovesArr = [[],[]];
        this.legalMovesArr = [];
        for(let i = 0; i < 64 ; i++)
            if(this.board[i] != -1)
                this.calculateLegalMoves(i); 
        for(let i = 0; i < 64; i++){
            if(this.legalMovesArr[i] != null){
                color = (this.board[i] === 1 || this.board[i] === 2) ? 0 : 1;
                for(let destination of this.legalMovesArr[i]){
                    if(Math.abs(destination - i) > 9){
                        this.captureMovesArr[color].push(destination);
                    }
                }
            }
        }   
    }

    drawBoard(){
        const gameBoard = document.getElementById('board');
        let color = 'white';

        for(let i = 0 ; i < 64 ; i++){
            const square = document.createElement('div');
            square.classList.add('box');
            square.classList.add(color);
            square.setAttribute('id' , i);

            if(color === 'black')
            {
                if(i < 24){
                    square.innerHTML = '<img class="redPiece" src="./red.jpg"></img>';
                }
                    
                if(i > 39){
                    square.innerHTML = '<img class="blackPiece" src="./black.jpg"></img>';
                }
            }
            gameBoard.appendChild(square);
            if(i % 8 != 7|| i === 0){
                color = color === 'white' ? 'black' : 'white';
            }
        }
    }

    clearSelectionColor(){
        let pieces = document.querySelectorAll('.box');
        for(let piece of pieces) {
            if(piece.classList.contains('selectionColor')){
                piece.classList.remove('selectionColor');
                piece.classList.add('black');
            }
            piece.style.border = '';
        }
        this.lastClicked = -1;
    }

     bindListeners(){
        let pieces = document.querySelectorAll('.box');
        for(let piece of pieces){
            let id = parseInt(piece.id);
            piece.addEventListener('click', ()=>{
                if(piece.children[0] != null){
                    let pieceColor = piece.children[0].classList.contains('rKing') || piece.children[0].classList.contains('redPiece') ? true : false;
                    if(pieceColor === this.playerTurn){
                        if(this.calculateLegalMoves(id))
                            this.clickAudio.play();
                        if(parseInt(id) != this.lastClicked){
                            this.clearSelectionColor();
                            for(let dest of this.legalMovesArr[parseInt(id)]){
                                pieces[dest].classList.remove('black');
                                pieces[dest].classList.add('selectionColor');
                                piece.style.border = '5px solid black';
                                this.lastClicked = parseInt(id);
                            }
                        }
                        else
                            this.clearSelectionColor();
                    }
                }
    
                if(piece.classList.contains('selectionColor')){
                    this.movePiece(this.lastClicked, id);
                    this.lastClicked = parseInt(id);
                    this.clearSelectionColor();
                }
            })           
        }
    }

    updateBoardUi(location, destination){
        let picString ="";
        let classString ="";
        let pieces = document.querySelectorAll('.box');

        if(this.board[destination] === 1){
            picString = "./red.jpg";
            classString = "redPiece";
        }
        if(this.board[destination] === 2){
            picString = "./rKing.jpg";
            classString = "rKing";
        }
        if(this.board[destination] === 3){
            picString = "./black.jpg";
            classString = "blackPiece";
        } 
        if(this.board[destination] === 4){
            picString = "./bKing.jpg";
            classString = "bKing";
        } 

        pieces[location].removeChild(pieces[location].children[0]);
        pieces[destination].innerHTML = `<img class=${classString} src="${picString}"></img>`;
        if(Math.abs(destination - location)  > 9)
            pieces[location + (destination - location) / 2].removeChild(pieces[location + (destination - location) / 2].children[0]);
    }

    startGame(){
        this.drawBoard();
        this.bindListeners();
    }
}

game = new Game();