import { WebSocketServer } from 'ws';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


class Point {
    constructor(row,column) {
        this.row=row;
        this.column=column;
    }

    static randomPoint() {
        let p;
        do {
            p = new Point(getRandomInt(0, 30), getRandomInt(0, 50));
        } while(snake1.some(point => point.compareTo(p)) ||
                snake2.some(point => point.compareTo(p)) ||
                p.compareTo(apple)
        ); 
        return p;
    }

    compareTo(point) {
        return this.row === point.row && this.column === point.column;
    }

}

let directionS1 = 2, directionS2 = 2;
let lastDirectionS1 = 2, lastDirectionS2 = 2;
let apple = new Point(25, 25);
let snake1 = [new Point(10, 10), new Point(11, 10), new Point(12, 10)],
    snake2 = [new Point(10, 40), new Point(11, 40), new Point(12, 40)];

function changeSnake(snake, direction, lastDirection) {
    const head = snake[snake.length-1];
    switch (direction) {
        case 0: snake.push(new Point(head.row-1, head.column)); break;
        case 1: snake.push(new Point(head.row, head.column+1)); break;
        case 2: snake.push(new Point(head.row+1, head.column)); break;
        case 3: snake.push(new Point(head.row, head.column-1)); break;
    }
    const newhead = snake[snake.length-1];
    if (!newhead.compareTo(apple)) snake.shift();
    else apple = Point.randomPoint(); 

    if (lastDirection === 1) lastDirectionS1 = direction;
    else lastDirectionS2 = direction;

    return (newhead.row >= 30 ||
            newhead.row < 0 ||
            newhead.column >= 50 ||
            newhead.column < 0);
}

function mainGame() {
    let c1 = changeSnake(snake1, directionS1, 1);
    let c2 = changeSnake(snake2, directionS2, 2);
    if (c1 ||
        snake1.some(point => point.compareTo(snake2[snake2.length-1])) ||
        snake1.slice(0, -1).some(point => point.compareTo(snake1[snake1.length-1]))   
    ) {
        clearInterval(gameloop);
        player2.send(JSON.stringify({gameOver:"You won!"}));
        player1.send(JSON.stringify({gameOver:"You loose!"}));
        resetGlobalVariables();
    }
    else if (c2 ||
             snake2.some(point => point.compareTo(snake1[snake1.length-1])) ||
             snake2.slice(0, -1).some(point => point.compareTo(snake2[snake2.length-1]))
    ) {
        clearInterval(gameloop);
        player1.send(JSON.stringify({gameOver:"You won!"}));
        player2.send(JSON.stringify({gameOver:"You loose!"}));
        resetGlobalVariables();
    } 
    else {
        const stringifiedData = JSON.stringify({
            snake1: snake1,
            snake2: snake2,
            apple: apple
        });
        player1.send(stringifiedData);
        player2.send(stringifiedData);
    }
}

function resetGlobalVariables() {
    player1 = null;
    player2 = null;
    gameloop = null;
    gameStarted = false;
    directionS1 = 2, directionS2 = 2;
    lastDirectionS1 = 2, lastDirectionS2 = 2;
    apple = new Point(25, 25);
    snake1 = [new Point(10, 10), new Point(11, 10), new Point(12, 10)];
    snake2 = [new Point(10, 40), new Point(11, 40), new Point(12, 40)];
}

let player1 = null, player1IP = null, player2 = null;
const wss = new WebSocketServer({ port: 8080 });

let gameloop = null;
let gameStarted = false;
// TESTING
//gameloop = setInterval(mainGame, 1000);

function changeDirection(keyCode, direction) {
    switch(keyCode) {
        case 87: if (direction !== 2 && direction !== 0) return 0; break;
        case 68: if (direction !== 3 && direction !== 1) return 1; break;
        case 83: if (direction !== 0 && direction !== 2) return 2; break;
        case 65: if (direction !== 1 && direction !== 3) return 3; break;
    }
    return direction;
}

wss.on('connection', function connection(ws) {
    console.log("Someone connected!");
    if (!player1) {
        player1 = ws;
        player1IP = ws._socket.remoteAddress;
        player1.on('message', function message(data) {
            if (data.toString() === "EXIT")
                ws.terminate();
            if (gameStarted)
                directionS1 = changeDirection(parseInt(data.toString()), lastDirectionS1);
        });
    }
    else if (!player2) {
        if (ws._socket.remoteAddress !== player1IP) {
            player2 = ws;
            player2.on('message', function message(data) {
                if (data.toString() === "EXIT")
                    ws.terminate();
                if (gameStarted)
                    directionS2 = changeDirection(parseInt(data.toString()), lastDirectionS2);
            });
        }
    }
    else {
        ws.close();
    }
    if (player1 && player2) {
        gameStarted = true;
        gameloop = setInterval(mainGame, 100);
    }
});