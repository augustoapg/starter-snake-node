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
  var board = gameData['board'];

  var foods = board['food'];
  var mySnake = gameData['you'];

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
  var head = mySnake['head'];
  var minDistance = 100; // arbitrary initial value
  var closestFood = {};

  foods.forEach(food => {
    let distance = Math.abs(head['x'] - food['x']) + Math.abs(head['y'] - food['y']);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestFood = food;
    }
  });

  console.log('The nearest food is at {' + closestFood['x'] + ', ' + closestFood['y'] + '}')

  return closestFood;
}

function decideMovement(destination, board, mySnake) {
  var snakes = board['snakes'];

  if (mySnake['head']['x'] !== destination['x']) {
    console.log('my snake will move in the x axis. It is on ' + mySnake['head']['x'] + ' and needs to get to ' + destination['x']);
    if (mySnake['head']['x'] < destination['x']) {
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
    console.log('my snake will move in the y axis. It is on ' + mySnake['head']['y'] + ' and needs to get to ' + destination['y']);
    if (mySnake['head']['y'] < destination['y']) {
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
  var nextDestination = {'x': mySnake['head']['x'] + 1, 'y': mySnake['head']['y']};

  if (isDestinationOutOfBounds(nextDestination, board)) {
    return false;
  }

  return isSpaceEmpty(board['snakes'], nextDestination);
}

function canMoveLeft(board, mySnake) {
  var nextDestination = {'x': mySnake['head']['x'] -1, 'y': mySnake['head']['y']};
  
  if (isDestinationOutOfBounds(nextDestination, board)) {
    return false;
  }

  return isSpaceEmpty(board['snakes'], nextDestination);
}

function canMoveUp(board, mySnake) {
  var nextDestination = {'x': mySnake['head']['x'], 'y': mySnake['head']['y'] + 1};
  
  if (isDestinationOutOfBounds(nextDestination, board)) {
    return false;
  }

  return isSpaceEmpty(board['snakes'], nextDestination);
}

function canMoveDown(board, mySnake) {
  var nextDestination = {'x': mySnake['head']['x'], 'y': mySnake['head']['y'] - 1};
  
  if (isDestinationOutOfBounds(nextDestination, board)) {
    return false;
  }

  return isSpaceEmpty(board['snakes'], nextDestination);
}

function isDestinationOutOfBounds(nextDestination, board) {
  return nextDestination['x'] < 0 || nextDestination['y'] < 0 || nextDestination['x'] > board['width'] || nextDestination['y'] > board['height'];
}

function isSpaceEmpty(snakes, nextDestination) {
  console.log(`Next dest is {${nextDestination['x']}, ${nextDestination['y']}}`)
  var isDestEmpty = true;

  for (i = 0; i < snake['body'].length; i++) {
    var snake = snakes[i];
    for (j = 0; j < snake['body'].length; j++) {
      var segment = snake['body'][j];
      console.log(`segment is {${segment['x']}, ${segment['y']}}`);
      if (segment['x'] === nextDestination['x'] && segment['y'] === nextDestination['y']) {
        console.log('Space occupied!');
        isDestEmpty = false;
        break;
      }
    }
  }

  return isDestEmpty;
}
