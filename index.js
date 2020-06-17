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
  var gameData = JSON.parse(request.body);
  var board = gameData.board;

  console.log(board);
  
  var boardDimensions = {
    x: board.width,
    y: board.height
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
    console.log('my snake will move in the x axis. It is on ' + mySnake.head.x + ' and needs to get to ' + destination.x);
    if (mySnake.x < destination.x) {
      if (canMoveRight(board, mySnake)) {
        return 'right';
      }
      console.log('Needed to go right, but couldn\'t');
    } else {
      if (canMoveLeft(board, mySnake)) {
        return 'left';
      }
      console.log('Needed to go left, but couldn\'t');
    }
  } else {
    console.log('my snake will move in the y axis. It is on ' + mySnake.head.y + ' and needs to get to ' + destination.y);
    if (mySnake.y < destination.y) {
      if (canMoveUp(board, mySnake)) {
        return 'up';
      }
      console.log('Needed to go up, but couldn\'t');
    } else {
      if (canMoveDown(board, mySnake)) {
        return 'down';
      }
      console.log('Needed to go down, but couldn\'t');
    }
  }
}

function canMoveRight(board, mySnake) {
  var nextDestination = {x: mySnake.head.x + 1, y: mySnake.head.y};

  if (nextDestination.x > board.width) {
    return false;
  }

  return isSpaceEmpty(board.snakes, nextDestination);
}

function canMoveLeft(board, mySnake) {
  var nextDestination = {x: mySnake.head.x -1, y: mySnake.head.y};
  
  if (nextDestination.x < 0) {
    return false;
  }

  return isSpaceEmpty(board.snakes, nextDestination);
}

function canMoveUp(board, mySnake) {
  var nextDestination = {x: mySnake.head.x, y: mySnake.head.y + 1};
  
  if (nextDestination.y > board.height) {
    return false;
  }

  return isSpaceEmpty(board.snakes, nextDestination);
}

function canMoveDown(board, mySnake) {
  var nextDestination = {x: mySnake.head.x, y: mySnake.head.y - 1};
  
  if (nextDestination.y < 0) {
    return false;
  }

  return isSpaceEmpty(board.snakes, nextDestination);
}

function isSpaceEmpty(snakes, nextDestination) {
  snakes.forEach(snake => {
    snake.body.forEach(segment => {
      if (segment.x === nextDestination.x && segment.y === nextDestination.y) {
        return false;
      }
    })
  });

  return true;
}
