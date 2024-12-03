// Keep global variables for compatibility with other files
let Users = [];
let MyTurn = false;
let TileSet = [];
let pastTurns = [];

// State management (internal use)
const GameState = {
    users: Users,  // Reference to global Users
    myTurn: false,
    tileSet: TileSet,  // Reference to global TileSet
    pastTurns: pastTurns,  // Reference to global pastTurns
    currentBoardState: null
};

function computeTurn() {
    if (!isSingleplayer) return;
}

function initGame(boardstates, tileset, myplayer, players) {
    // Update both global and GameState
    pastTurns.push(...boardstates);
    GameState.pastTurns = pastTurns;

    TileSet = tileset;
    GameState.tileSet = TileSet;
    
    GameState.currentBoardState = boardstates[boardstates.length - 1];

    const drawerStructure = myplayer.activetiles.map(tile => {
        const pointband = tile === '_' 
            ? { points: '_' }
            : tileset.find(band => band.letters.includes(tile));
        
        if (!pointband) {
            console.error(`Invalid tile found: ${tile}`);
            return null;
        }

        return {
            letter: tile,
            score: pointband.points
        };
    }).filter(piece => piece !== null);

    addPiecesToDrawer(drawerStructure);

    // Update both global Users and GameState users
    Users = players.map(player => ({
        uid: player.uid,
        name: player.name,
        score: player.score,
        me: myplayer.uid === player.uid,
        turn: false
    }));
    GameState.users = Users;

    Users[0].turn = true;
    MyTurn = Users[0].me;  // Update global MyTurn
    GameState.myTurn = MyTurn;

    initUI();
    setupUsersUI(Users, 0);
    return true;
}

function startMyTurn() {
    MyTurn = true;  // Update global
    GameState.myTurn = true;

    for (const user in Users) {
        Users[user].turn = Users[user].me;
    }
    GameState.users = Users;
    
    updateUsersUI(Users);
    startMyTurnUI();
}

function startOthersTurn(useruid) {
    MyTurn = false;  // Update global
    GameState.myTurn = false;

    for (const user in Users) {
        Users[user].turn = Users[user].uid === useruid;
    }
    GameState.users = Users;

    updateUsersUI(Users);
    stopMyTurnUI();
}

function playMyTurn(stagedpieces) {
    if (!MyTurn) return false;

    const currentBoard = GameState.currentBoardState.boardtiles;
    const oldboardtiles = [...currentBoard];
    const boardtiles = [...currentBoard];

    for (const piece of stagedpieces) {
        const pos = JSON.parse(piece.dataset.coords);
        boardtiles.push({
            pos: pos,
            modifier: BoardLocations[`${pos.x},${pos.y}`] || 'NONE',
            letter: piece.dataset.letter,
            score: -1
        });
    }

    const turn = {
        playeruid: Users.filter(e => e.me)[0].uid,
        turn: -1,
        turntype: 'PLACE',
        outcome: {},
        oldboardtiles: oldboardtiles,
        boardtiles: boardtiles
    };

    // Update current board state before network call
    GameState.currentBoardState = {
        ...GameState.currentBoardState,
        boardtiles
    };

    netPlayTurn(turn);
    return true;
}

function skipMyTurn() {
    if (!MyTurn) return false;
    netSkipTurn();
}

function processTurn(turn) {
    removeStagedPieces();
    renderBoardState(turn.boardtiles);

    // Update current board state
    GameState.currentBoardState = {
        ...GameState.currentBoardState,
        boardtiles: turn.boardtiles
    };
    pastTurns.push(GameState.currentBoardState);
    GameState.pastTurns = pastTurns;

    const outcome = turn.outcome;
    if (!outcome.valid) return;

    let lastuser = {};
    for (const user in Users) {
        if(Users[user].uid != turn.playeruid) continue;
        Users[user].score += turn.outcome.points;
        lastuser = Users[user];
    }
    GameState.users = Users;

    changePlayerScore(lastuser.uid, lastuser.score);

    for (const word of turn.outcome.words) {
        addTurnDesc(word.word, lastuser.name, word.points);
    }
}

function newPieces(pieces) {
    removePiecesFromDrawer('*');
    let drawerStructure = [];

    for (const tile of pieces) {
        let points = 0;
        for (const pointband of TileSet) {
            if (tile === '_') {
                points = '_';
                break;
            }
            if (pointband.letters.includes(tile)) {
                points = pointband.points;
                break;
            }
        }

        const piece = {
            letter: tile,
            score: points
        };
        drawerStructure.push(piece);
    }
    addPiecesToDrawer(drawerStructure);
}

function handleGameOver(data) {
    const message = `Game Over! Winner is ${data.winner} with ${data.score} points.`;
    alert(message); // Or update the UI with a more elegant display
}

// Assuming you have socket.io set up
socket.on('game-over', handleGameOver);
