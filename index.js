const bodyParser = require('body-parser');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

app.get('/', handleIndex);
app.post('/start', handleStart);
app.post('/move', handleMove);
app.post('/end', handleEnd);

const directionData = {
  'right': {'x': 1, 'y': 0, 'axis': 'horizontal', 'opositeTo': 'left'},
  'left': {'x': -1, 'y': 0, 'axis': 'horizontal', 'opositeTo': 'right'},
  'up': {'x': 0, 'y': 1, 'axis': 'vertical', 'opositeTo': 'down'},
  'down': {'x': 0, 'y': -1, 'axis': 'vertical', 'opositeTo': 'up'},
}

let lastMove = '';

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
  lastMove = move;

  console.log('MOVE: ' + move);
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  var gameData = request.body;
  lastMove = '';

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
  var whereTo = '';

  if (mySnake['head']['x'] !== destination['x']) {
    console.log('my snake will move in the x axis. It is on ' + mySnake['head']['x'] + ' and needs to get to ' + destination['x']);
    if (mySnake['head']['x'] < destination['x']) {
      whereTo = 'right';
      return getPossibleMove(whereTo, board, mySnake);
    } else {
      whereTo = 'left';
      return getPossibleMove(whereTo, board, mySnake);
    }
  } else {
    console.log('my snake will move in the y axis. It is on ' + mySnake['head']['y'] + ' and needs to get to ' + destination['y']);
    if (mySnake['head']['y'] < destination['y']) {
      whereTo = 'up';
      return getPossibleMove(whereTo, board, mySnake);
    } else {
      whereTo = 'down';
      return getPossibleMove(whereTo, board, mySnake);
    }
  }
}

function getPossibleMove(whereTo, board, mySnake) {
  console.log(`Best move is to: ${whereTo}`);
  if (canMoveDirection(whereTo, board, mySnake)) {
    return whereTo;
  } else {
    console.log(`Cannot move to: ${whereTo}`);
    return getAlternativeRoute(whereTo, board, mySnake);
  }
}

function getAlternativeRoute(whereTo, board, mySnake) {
  let possibleMoves = ['up', 'down', 'left', 'right'];
  let dists = {};
  removeFromArray(whereTo, possibleMoves);
  console.log(`since last move was ${lastMove}, do not move to its oposite direction ${directionData[lastMove]['opositeTo']}`);
  removeFromArray(directionData[lastMove]['opositeTo'], possibleMoves);
  console.log(possibleMoves);

  for (let i = 0; i < possibleMoves.length; i++) {
    const attemptMove = possibleMoves[i];

    if (directionData[attemptMove]['axis'] === 'vertical') {
      if (directionData[attemptMove]['y'] === -1) {
        dists[attemptMove] = mySnake['head']['y'];
      } else {
        dists[attemptMove] = board['height'] - mySnake['head']['y'];
      }
    } else {
      if (directionData[attemptMove]['x'] === -1) {
        dists[attemptMove] = mySnake['head']['x'];
      } else {
        dists[attemptMove] = board['width'] - mySnake['head']['x'];
      }
    }
  }

  lessOccupied = getLessOccupiedDirection(dists);

  if (canMoveDirection(lessOccupied, board, mySnake)) {
    return lessOccupied;
  } else {
    removeFromArray(lessOccupied, possibleMoves);
    console.log(`since I cannot go to less occupied, I will go to the last available: ${possibleMoves[0]}`);
    return possibleMoves[0];
  }
}

function getLessOccupiedDirection(dists) {
  let options = Object.values(dists);
  let keys = Object.keys(dists);
  let maxDist = Math.max(...options);
  
  for (let i = 0; i < keys.length; i++) {
    const dir = keys[i];
    if (dists[dir] === maxDist) {
      console.log(`The maximum the snake can go to ${dir} is ${maxDist}`);
      return dir;
    }
  }
}

function removeFromArray(element, oldArray) {
  var index = oldArray.indexOf(element);
  if (index !== -1) {
    oldArray.splice(index, 1);
  }
}

function canMoveDirection(direction, board, mySnake) {
  var nextDestination = {
    'x': mySnake['head']['x'] + directionData[direction]['x'], 
    'y': mySnake['head']['y'] + directionData[direction]['y']
  };

  if (isDestinationOutOfBounds(nextDestination, board)) {
    return false;
  }

  return isSpaceEmpty(board['snakes'], nextDestination);
}

function isDestinationOutOfBounds(nextDestination, board) {
  return nextDestination['x'] < 0 || nextDestination['y'] < 0 || nextDestination['x'] >= board['width'] || nextDestination['y'] >= board['height'];
}

function isSpaceEmpty(snakes, nextDestination) {
  console.log(`Next dest is {${nextDestination['x']}, ${nextDestination['y']}}`)
  var isDestEmpty = true;

  for (i = 0; i < snakes.length; i++) {
    var snake = snakes[i];
    for (j = 0; j < snake['body'].length; j++) {
      var segment = snake['body'][j];
      // console.log(`segment is {${segment['x']}, ${segment['y']}}`);
      if (segment['x'] === nextDestination['x'] && segment['y'] === nextDestination['y']) {
        console.log('Space occupied!');
        isDestEmpty = false;
        break;
      }
    }
  }

  if (isDestEmpty) {
    console.log('Space is free!');
  }
  return isDestEmpty;
}
