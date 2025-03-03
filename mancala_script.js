let pits = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
let context;
let board;
let HeaderLine;
let currentPlayer = 1; // 1 for player 1, 2 for player 2
let hoveredPit = -1; // Stores the currently hovered pit index
const pitRadius = 30;
const pitSpacing = 10;
const boardWidth = 600;
const boardHeight = 200;
// [0, 0, 0, 0, 0, 1, 0, 4, 4, 4, 4, 4, 4, 0]

window.onload = function() {
	board = document.getElementById("board");
	HeaderLine = document.getElementById("HeaderLine");
	board.height = boardHeight;
	board.width = boardWidth;
	context = board.getContext("2d");
	
	
	board.addEventListener("click", handleClick);
	board.addEventListener("mousemove", handleHover);
    board.addEventListener("mouseleave", () => {
        hoveredPit = -1;
        drawBoard();
    });
	
    drawBoard();
}

function drawBoard() {
    // Draw background
    context.fillStyle = "#C19A6B";
    context.fillRect(0, 0, board.width, board.height);

    for (let i = 0; i < pits.length; i++) {
        let x, y;
        if (i < 7) {
            x = ((i + 1) * (pitRadius * 2 + pitSpacing)) + 2*pitSpacing + pitRadius;
            y = boardHeight - pitRadius * 2;
        } else {
            x = ((13 - i) * (pitRadius * 2 + pitSpacing)) + 2*pitSpacing + pitRadius;
            y = pitRadius * 2;
        }

        let isHovered = i === hoveredPit;
        drawPit(x, y, pits[i], isHovered, i);
    }
}

function drawPit(x, y, count, isHovered, index) {
	//color the player's available stones
	if (isHovered) {
		if (currentPlayer === 1 && index > 0 && index < 6) {
			context.fillStyle = "#6bbdc1";
		} else if (currentPlayer === 2 && index > 6 && index < 13){
			context.fillStyle = "#92c16b";
		} else {
			context.fillStyle = "black";
		}
	} else {
		context.fillStyle = "black";
	}
	
    
    context.beginPath();
    context.arc(x, y, pitRadius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText(count, x - 5, y + 5);
}

function handleClick(event) {
    let rect = board.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    for (let i = 0; i < pits.length; i++) {
        let x, y;
        if (i < 7) {
            x = ((i + 1) * (pitRadius * 2 + pitSpacing)) + 2*pitSpacing + pitRadius;
            y = boardHeight - pitRadius * 2;
        } else {
            x = ((13 - i) * (pitRadius * 2 + pitSpacing)) + 2*pitSpacing + pitRadius;
            y = pitRadius * 2;
        }
		
		// Truth be told I have zero idea how I would attach these events to buttons in html code
		// So I did it all in javascript. There has to be a better way then this.
        let distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        if (distance <= pitRadius) {
            handleMove(i);
            break;
        }
    }
}

function handleMove(index) {
	//no stones on board, the game is over.
	stone_total_1 = pits[0] + pits[1] + pits[2] + pits[3] + pits[4] + pits[5];
	stone_total_2 = pits[7] + pits[8] + pits[9] + pits[10] + pits[11] + pits[12];
	
	if (stone_total_1 === 0 || stone_total_2 === 0) {
		// any remaining stones are moved to the nearest store
        pits[6] += stone_total_1;
        pits[13] += stone_total_2;
		
		// the winner is decided by total stones in the store
		let winner;
		if (pits[6] > pits[13]) {
            winner = 1;
        } else if (pits[13] > pits[6]) {
            winner = 2;
        } else {
            winner = 0;
        }
		
        drawBoard();
        showWinningScreen(winner);
		return;
	}
	
	// if an empty pit or your opponents pit has been clicked, ignore it
    if ((currentPlayer === 1 && index >= 7) || (currentPlayer === 2 && index < 7) || pits[index] === 0) {
        return;
    }

    let stones = pits[index];
    pits[index] = 0;
    let i = index;
	
	//move the stones counterclockwise
    while (stones > 0) {
        i = (i + 1) % 14;

        // Skip opponent's store
        if ((currentPlayer === 1 && i === 13) || (currentPlayer === 2 && i === 6)) {
            continue;
        }

        pits[i]++;
        stones--;
    }
	
	// capture rule: if the last stone landed in an empty pit on your side, steal the stones opposite it.
	if (currentPlayer === 1 && i < 6 && pits[i] === 1) {
        pits[i] += pits[12 - i]; //each row is opposite the other
		pits[12 - i] = 0;
    } else if ((currentPlayer === 2 && i > 6 && i !== 13 && pits[i] === 1)) {
		pits[i] += pits[-i + 12];
		pits[-i + 12] = 0;
	}
	

    // Change turn. If the last stone is in your store, you go again.
    if ((currentPlayer === 1 && i !== 6) || (currentPlayer === 2 && i !== 13)) {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
		if (currentPlayer === 1) {
			HeaderLine.style.color = "#6bbdc1";
		} else {
			HeaderLine.style.color = "#92c16b";
		}
		HeaderLine.innerHTML = "Mancala - player " + currentPlayer + "'s turn!";
    }

    drawBoard();
}


// WHY DOES THIS DISSAPEAR WHEN THE MOUSE SLIGHTLY MOVES???
function showWinningScreen(winner) {
	
	if (winner === 1) {
		HeaderLine.style.color = "#6bbdc1";
		HeaderLine.innerHTML = "Mancala - player " + winner + " wins!";
	} else if (winner === 2) {
		HeaderLine.style.color = "#92c16b";
		HeaderLine.innerHTML = "Mancala - player " + winner + " wins!";
	} else {
		HeaderLine.style.color = "black";
		winner = "Mancala - It's a Tie!";
	}
}

// not used, couldnt figure out the event listener
function restartGame() {
    pits = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]; // Reset board
    currentPlayer = 1;
    drawBoard();
}

//the same principles used in handle click are used here
function handleHover(event) {
    let rect = board.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    hoveredPit = -1;

    for (let i = 0; i < pits.length; i++) {
        let x, y;
        if (i < 7) {
            x = (i + 1) * (pitRadius * 2 + pitSpacing) + 2*pitSpacing + pitRadius;
            y = boardHeight - pitRadius * 2;
        } else {
            x = (13 - i) * (pitRadius * 2 + pitSpacing) + 2*pitSpacing + pitRadius;
            y = pitRadius * 2;
        }

        let distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        if (distance <= pitRadius) {
            hoveredPit = i;
            break;
        }
    }

    drawBoard(); // Redraw with updated hover state
}