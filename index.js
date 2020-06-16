const bodyParser = require('body-parser');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

app.get('/', handleIndex);
app.post('/start', handleStart);
app.post('/move', handleMove);
app.post('/end', handleEnd);

app.listen(PORT, () => console.log(`Example app listening at http://127.0.0.1:${PORT}`));

const mySnakeId = 'solid-venom-snake';


function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'Augusto Peres',
    color: '#b81307',
    head: 'fang',
    tail: 'hook'
  };
  response.status(200).json(battlesnakeInfo);
}

function handleStart(request, response) {
  var gameData = request.body;

  console.log('START');
  response.status(200).send('ok');
}

function handleMove(request, response) {
  var gameData = request.body;
  var board = gameData.board;
  
  var boardDimensions = {
    'x': board.width,
    'y': board.height
  };

  var foods = board.food;
  var snakes = board.snakes;
  var mySnake = gameData.you;

  var possibleMoves = ['up', 'down', 'left', 'right'];

  var destination = getDestination(mySnake, foods);
  var move = decideMovement(destination, board, mySnake);

  console.log('MOVE: ' + move);
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  var gameData = request.body;

  console.log('END');
  response.status(200).send('ok');
}

function getDestination(mySnake, foods) {
  var head = mySnake.head;
  var minDistance = 100; // arbitrary initial value
  var closestFood = {};

  foods.forEach(food => {
    let distance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestFood = food;
    }
  });

  return closestFood;
}

function decideMovement(destination, board, mySnake) {
  var snakes = board.snakes;

  if (mySnake.head.x !== destination.x) {
    if (mySnake.x < destination.x) {
      canMoveRight(board, mySnake)
    }
    moveHorizontal(board, mySnake)
  }
}

function canMoveRight(board, mySnake) {
  // if any obstacle to one point to your right
  if (mySnake.head.x + 1 > board.width) {
    return false;
  }
  var nextDestination = {'x': mySnake.head.x + 1, 'y': mySnake.head.y};

  board.snakes.forEach(snake => {
    snake.body.forEach(segment => {
      if (segment.x === nextDestination.x && segment.y === nextDestination.y) {
        return false;
      }
    })
  });

  return true;
}
