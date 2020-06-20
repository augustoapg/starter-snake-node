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
  var possibleMoves = ['up', 'down', 'left', 'right'];
  var whereTo = '';
  var attemptMoves = [];

  if (mySnake['head']['x'] !== destination['x']) {
    console.log('my snake will move in the x axis. It is on ' + mySnake['head']['x'] + ' and needs to get to ' + destination['x']);
    if (mySnake['head']['x'] < destination['x']) {
      whereTo = 'right';
      if (canMoveDirection(whereTo, board, mySnake)) {
        return whereTo;
      } else {
        // TODO: Recursive?
        removeFromArray(whereTo, possibleMoves);

        possibleMoves.forEach(attemptMove => {
          if (canMoveDirection(attemptMove, board, mySnake)) {
            return attemptMove;
          }
        });
        console.log('No moves were possible x.x');
      }

      attemptMoves.push('right');
      console.log('Needed to go right, but couldn\'t');
    } else {
      whereTo = 'left';
      if (canMoveDirection(whereTo, board, mySnake)) {
        return whereTo;
      } else {
        // TODO: Recursive?
        removeFromArray(whereTo, possibleMoves);

        possibleMoves.forEach(attemptMove => {
          if (canMoveDirection(attemptMove, board, mySnake)) {
            return attemptMove;
          }
        });
        console.log('No moves were possible x.x');
      }
    }
  } else {
    console.log('my snake will move in the y axis. It is on ' + mySnake['head']['y'] + ' and needs to get to ' + destination['y']);
    if (mySnake['head']['y'] < destination['y']) {
      whereTo = 'up';
      if (canMoveDirection(whereTo, board, mySnake)) {
        return whereTo;
      } else {
        // TODO: Recursive?
        removeFromArray(whereTo, possibleMoves);

        possibleMoves.forEach(attemptMove => {
          if (canMoveDirection(attemptMove, board, mySnake)) {
            return attemptMove;
          }
        });
        console.log('No moves were possible x.x');
      }
    } else {
      whereTo = 'down';
      if (canMoveDirection(whereTo, board, mySnake)) {
        return whereTo;
      } else {
        // TODO: Recursive?
        removeFromArray(whereTo, possibleMoves);

        possibleMoves.forEach(attemptMove => {
          if (canMoveDirection(attemptMove, board, mySnake)) {
            return attemptMove;
          }
        });
        console.log('No moves were possible x.x');
      }
    }
  }
}

function removeFromArray(element, oldArray) {
  var index = oldArray.indexOf(element);
  if (index !== -1) {
    oldArray.splice(index, 1);
  }
}

function canMoveHorizontal(destination, board, mySnake) {
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
}

function canMoveDirection(direction, board, mySnake) {
  var moveSpaces = {
    'right': {'x': 1, 'y': 0},
    'left': {'x': -1, 'y': 0},
    'up': {'x': 0, 'y': 1},
    'down': {'x': 0, 'y': -1},
  }

  var nextDestination = {
    'x': mySnake['head']['x'] + moveSpaces[direction]['x'], 
    'y': mySnake['head']['y'] + moveSpaces[direction]['y']
  };

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

  for (i = 0; i < snakes.length; i++) {
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
