const bodyParser = require('body-parser');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

app.get('/', handleIndex);
app.post('/start', handleStart);
app.post('/move', handleMove);
app.post('/end', handleEnd);

const axisDimension = {'x': 'width', 'y': 'height'};
const directionData = {
  'right': {'x': 1, 'y': 0, 'axis': 'x', 'opositeTo': 'left'},
  'left': {'x': -1, 'y': 0, 'axis': 'x', 'opositeTo': 'right'},
  'up': {'x': 0, 'y': 1, 'axis': 'y', 'opositeTo': 'down'},
  'down': {'x': 0, 'y': -1, 'axis': 'y', 'opositeTo': 'up'},
}


var lastMove = '';

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
  console.log(`my last move was ${lastMove}`);

  var gameData = request.body;
  var board = gameData['board'];

  var foods = board['food'];
  var mySnake = gameData['you'];

  var destination = getDestination(mySnake, foods);
  var move = decideMovement(destination, board, mySnake);
  lastMove = move;
  console.log(`saving last move as ${lastMove}`);

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
  if (lastMove !== '') {
    console.log(`since last move was ${lastMove}, do not move to its oposite direction ${directionData[lastMove]['opositeTo']}`);
    removeFromArray(directionData[lastMove]['opositeTo'], possibleMoves);
  }
  console.log(possibleMoves);

  for (let i = 0; i < possibleMoves.length; i++) {
    const attemptMove = possibleMoves[i];
    const axis = directionData[attemptMove]['axis'];
    const dimension = axisDimension[axis];

    if (directionData[attemptMove][axis] === -1) {
      dists[attemptMove] = mySnake['head'][axis];
    } else {
      dists[attemptMove] = board[dimension] - mySnake['head'][axis];
    }
  }

  lessOccupied = getLessOccupiedDirection(dists);

  if (canMoveDirection(lessOccupied, board, mySnake)) {
    return lessOccupied;
  } else {
    removeFromArray(lessOccupied, possibleMoves);
    console.log(`could not go to less occupied (${lessOccupied}). Will now try to go to ${possibleMoves[0]}`);
    console.log(possibleMoves);
    if (canMoveDirection(possibleMoves[0], board, mySnake)) {
      return possibleMoves[0];
    } else if (possibleMoves.length !== 0) {
      removeFromArray(possibleMoves[0], possibleMoves);
      console.log(`going to last space available: ${possibleMoves[0]}`);
      console.log(possibleMoves);
      return possibleMoves[0];
    }
    console.log('No possible moves x.x');
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
  let nextDestination = {
    'x': mySnake['head']['x'] + directionData[direction]['x'], 
    'y': mySnake['head']['y'] + directionData[direction]['y']
  };

  console.log(`Checking if I can go to ${nextDestination['x']}, ${nextDestination['y']}`)

  if (isDestinationOutOfBounds(nextDestination, board)) {
    console.log(`It will be out of bounds. Don't go there`)
    return false;
  }

  if (isSpaceEmpty(board['snakes'], nextDestination)) {
    console.log(`The space is empty. It is a possibility.`);
    // return true;
    return willSnakeBeFree(direction, board, mySnake);
  }

  return false;
}

// checks if moving to that direction will lock the snake
function willSnakeBeFree(direction, board, mySnake) {
  let possibleMoves = ['up', 'down', 'left', 'right'];
  removeFromArray(directionData[direction]['opositeTo'], possibleMoves);
  
  let possibleFutureDestination = {
    'x': mySnake['head']['x'] + directionData[direction]['x'], 
    'y': mySnake['head']['y'] + directionData[direction]['y']
  };
  console.log(`Checking if it is a good idea to move to {${possibleFutureDestination['x']}, ${possibleFutureDestination['y']}}`);

  for (let i = 0; i < possibleMoves.length; i++) {
    const dir = possibleMoves[i];
    let nextDest = {
      'x': possibleFutureDestination['x'] + directionData[dir]['x'], 
      'y': possibleFutureDestination['y'] + directionData[dir]['y']
    };
    if (isSpaceEmpty(board['snakes'], nextDest)) {
      console.log(`When I get to {${possibleFutureDestination['x']}, ${possibleFutureDestination['y']}}, I'll be able to go to {${nextDest['x']}, ${nextDest['y']}}`);
      return true;
    }
  }
  console.log(`If I get to {${possibleFutureDestination['x']}, ${possibleFutureDestination['y']}}, I'll be locked! Don't go there!!!`);

  return false;
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
