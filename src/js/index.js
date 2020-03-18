import '../styles/styles.css';

class GameResults {
  constructor(gameStartedDate, dimensions, minesCount) {
    this.gameStartedDate = gameStartedDate;
    this.dimensions = dimensions;
    this.minesCount = minesCount;
  }

  setGameEndedDate(gameEndedDate) {
    this.gameEndedDate = gameEndedDate;
  }

  setDuration(duration) {
    this.duration = duration;
  }

  setStatus(status) {
    this.status = status;
  }

  get gameStats() {
    return this.gameStartedDate + ', Finished: ' + this.gameEndedDate + ', Duration: ' + this.duration + ', Dimensions: ' + this.dimensions + ', Mines Count: ' + this.minesCount + ', Status: ' + this.status + '.';
  }
}

let radioButtons = $('<input type="radio" id="radioButton_1" name="settings" value="1"/>\n' +
  '<label for="radioButton_1" name="settings" value="1"/><span></span>Novice</label>\n' +
  '<p></p>\n' + '<input type="radio" id="radioButton_2" name="settings" value="2"//>\n' +
  '<label for="radioButton_2"><span></span>Amateur</label>\n' +
  '<p></p>\n' + '<input type="radio" id="radioButton_3" name="settings" value="3"//>\n' +
  '<label for="radioButton_3"><span></span>Master</label>\n' +
  '<p></p>'),
  sliderX = $('<input type="range" min="4" max="30" value="10" class="slider" id="range_1">'),
  sliderY = $('<input type="range" min="4" max="30" value="10" class="slider" id="range_2">'),
  sliderMines = $('<input type="range" min="1" max="30" value="10" class="slider" id="range_3">'),
  valueX = $('<div>Rows: <span id="value_1"></span></div>'),
  valueY = $('<div>Columns: <span id="value_2"></span></div>'),
  valueMines = $('<div>Percentage of mines: <span id="value_3"></span></div>'),
  buttonApply = $('<div><button class="buttons__text" id="button_apply">OK</button></div>'),
  arrayForMinesNumbers = [],
  arrayForMinesOpened = [],
  arrayForMinesFlagged = [],
  rows, columns,
  minesPercentage,
  numberOfMines,
  numberOfFlags,
  countForOpenedCells,
  timer,
  seconds = 0,
  timerStarted = false,
  gamesResults = [],
  currentGameIndexInGamesResults = -1;

if ($(window).width() <= 425 || $(window).height() <= 425) {
  sliderX.prop('max', '16');
  sliderY.prop('max', '16');
}

radioButtons.appendTo('.main');
sliderX.appendTo('.main');
valueX.appendTo('.main');
sliderY.appendTo('.main');
valueY.appendTo('.main');
sliderMines.appendTo('.main');
valueMines.appendTo('.main');
buttonApply.appendTo('.main');

const slider1 = document.getElementById('range_1'),
  slider2 = document.getElementById('range_2'),
  slider3 = document.getElementById('range_3'),
  output1 = document.getElementById('value_1'),
  output2 = document.getElementById('value_2'),
  output3 = document.getElementById('value_3');

output1.innerHTML = slider1.value;
output2.innerHTML = slider2.value;
output3.innerHTML = slider3.value + '%';

slider1.oninput = function () {
  output1.innerHTML = this.value;
};

slider2.oninput = function () {
  output2.innerHTML = this.value;
};

slider3.oninput = function () {
  output3.innerHTML = this.value + '%';
};

$('#button_apply').click(function () {
  $('.main').hide();
  rows = parseInt(output1.innerHTML);
  columns = parseInt(output2.innerHTML);
  minesPercentage = parseInt(output3.innerHTML);
  numberOfMines = Math.round(rows * columns * minesPercentage / 100);
  numberOfFlags = numberOfMines;
  createField(rows, columns);
  createArrays(rows, columns);
  createMines(rows, columns);
  createNumberOfMinesMap(rows, columns);
});

$('.field').on("click", ".field__table-cell", function () {
  if (timerStarted === false) {
    let startedDate = new Date;
    let time = startedDate.getHours() + ":" + startedDate.getMinutes() + ":" + startedDate.getSeconds();
    let currentGameResult = new GameResults(time, rows + 'x' + columns, numberOfMines);
    gamesResults.push(currentGameResult);
    currentGameIndexInGamesResults++;
    startTimer();
    timerStarted = true;
  }

  let stringToArray = $(this).attr('id').split('_'),
    coordinateX = stringToArray[1],
    coordinateY = stringToArray[2];

  executeClickedCell(coordinateX, coordinateY);
  checkForVictory();
});

$('.field').on("contextmenu", ".field__table-cell", function () {
  if (timerStarted === false) {
    let startedDate = new Date;
    let time = startedDate.getHours() + ":" + startedDate.getMinutes() + ":" + startedDate.getSeconds();
    let currentGameResult = new GameResults(time, rows + 'x' + columns, numberOfMines);
    gamesResults.push(currentGameResult);
    currentGameIndexInGamesResults++;
    startTimer();
    timerStarted = true;
  }

  let stringToArray = $(this).attr('id').split('_'),
    coordinateX = stringToArray[1],
    coordinateY = stringToArray[2];

  if ($(this).text() !== 'F') {
    arrayForMinesFlagged[coordinateX][coordinateY] = true;
    numberOfFlags--;
    $('#flag_field').text('Flags: ' + numberOfFlags);
    $(this).text('F');
  } else {
    numberOfFlags++;
    $('#flag_field').text('Flags: ' + numberOfFlags);
    $(this).text('');
    arrayForMinesFlagged[coordinateX][coordinateY] = false;
  }

  checkForVictory();
  return false;
});

$('.field').on('click', '#button_reset', function () {
  if (timerStarted === true && $('#text_field').text() !== 'You Lost!' && $('#text_field').text() !== 'You Won!') {
    gamesResults.pop();
    currentGameIndexInGamesResults--;
  }

  $('.field').empty();
  numberOfMines = Math.round(rows * columns * minesPercentage / 100);
  numberOfFlags = numberOfMines;
  createField(rows, columns);
  createArrays(rows, columns);
  createMines(rows, columns);
  createNumberOfMinesMap(rows, columns);
  stopTimer();
  clearTimer();
  timerStarted = false;
});

$('.field').on('click', '#button_settings', function () {
  if (timerStarted === true && $('#text_field').text() !== 'You Lost!' && $('#text_field').text() !== 'You Won!') {
    gamesResults.pop();
    currentGameIndexInGamesResults--;
  }

  $('.field').empty();
  stopTimer();
  clearTimer();
  timerStarted = false;
  $('.main').show();
});

$('.field').on('click', '#button_history', function () {
  $('.field').hide();
  $('.history').show();
  $('#button_back_from_history').show();
  for (let i = 0; i < gamesResults.length; i++) {
    let currentElement = $('<div class="button__text">"Id: ' + (i + 1) + ', Started: ' + gamesResults[i].gameStats + '"</div>');
    currentElement.appendTo('.history');
  }

  let buttonBackFromHistory = $('<button class="buttons__text" id="button_back_from_history">Back</button>')
  buttonBackFromHistory.appendTo('.history');
});

$('.history').on('click', '#button_back_from_history', function () {
  $('.field').show();
  $('.history').empty();
});

$('input[name="settings"]').on('change', function () {
  if ($(this).val() == '1') {
    $('#range_1').val('8');
    $('#range_2').val('8');
    $('#range_3').val('15');
    $('#value_1').text('8');
    $('#value_2').text('8');
    $('#value_3').text('15%');
  } else if ($(this).val() == '2') {
    $('#range_1').val('16');
    $('#range_2').val('16');
    $('#range_3').val('15');
    $('#value_1').text('16');
    $('#value_2').text('16');
    $('#value_3').text('15%');
  } else if ($(this).val() == '3') {
    $('#range_1').val('16');
    $('#range_2').val('30');
    $('#range_3').val('20');
    $('#value_1').text('16');
    $('#value_2').text('30');
    $('#value_3').text('20%');
  }
});


function createField(x, y) {
  let flagField = $('<span class="buttons__text" id="flag_field">Flags: ' + numberOfFlags + '</span>');
  flagField.appendTo('.field');
  let timeField = $('<span class="buttons__text" id="time_field">Time: ' + seconds + "s" + '</span>');
  timeField.appendTo('.field');
  let main_table = $('<table class="field__table" id="table_1"></table>');
  main_table.appendTo('.field');
  let textField = $('<span class="buttons__text" id="text_field"></span>');
  textField.appendTo('.field');
  let enter1 = $('<div></div>');
  enter1.appendTo('.field');
  let buttonReset = $('<button class="buttons__text" id="button_reset">Reset</button>')
  buttonReset.appendTo('.field');
  let buttonSettings = $('<button class="buttons__text" id="button_settings">Settings</button>')
  buttonSettings.appendTo('.field');
  let enter2 = $('<div></div>');
  enter2.appendTo('.field');
  let buttonHistory = $('<button class="buttons__text" id="button_history">CheckHistory</button>')
  buttonHistory.css('width', '175px');
  buttonHistory.appendTo('.field');

  for (let i = 0; i < x + 2; i++) {
    for (let k = 0; k < y + 2; k++) {
      let table_cell = $('<td class="field__table-cell" id="cell_' + i + '_' + k + '"></td>');
      table_cell.appendTo('.field__table');
    }

    let table_row = $('<tr class="field__table-row"></tr>');
    table_row.appendTo('.field__table');
  }

  for (let i = 0; i <= x + 1; i++) {
    $('#cell_' + i + '_0')
      .css({'backgroundColor': '#575757', 'border': 'none', 'cursor': 'default', 'pointer-events': 'none'});
    $('#cell_' + i + '_' + (parseInt(y) + 1))
      .css({'backgroundColor': '#575757', 'border': 'none', 'cursor': 'default', 'pointer-events': 'none'});
  }

  for (let i = 0; i <= y + 1; i++) {
    $('#cell_0_' + i)
      .css({'backgroundColor': '#575757', 'border': 'none', 'cursor': 'default', 'pointer-events': 'none'});
    $('#cell_' + (parseInt(x) + 1) + '_' + i)
      .css({'backgroundColor': '#575757', 'border': 'none', 'cursor': 'default', 'pointer-events': 'none'});
  }


}

function timerHandler() {
  seconds++;
  $('#time_field').text('Time: ' + seconds + 's');
}

function startTimer() {
  timer = setInterval(timerHandler, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function clearTimer() {
  seconds = 0;
  $('#time_field').text('Time: ' + seconds + 's');
}

function createArrays(x, y) {
  for (let i = 0; i < x + 2; i++) {
    if (!arrayForMinesNumbers[i]) arrayForMinesNumbers[i] = [];
    if (!arrayForMinesFlagged[i]) arrayForMinesFlagged[i] = [];
    if (!arrayForMinesOpened[i]) arrayForMinesOpened[i] = [];
    for (let j = 0; j < y + 2; j++) {
      arrayForMinesNumbers[i][j] = 0;
      arrayForMinesFlagged[i][j] = false;
      arrayForMinesOpened[i][j] = false;
    }
  }
}

function checkForVictory() {
  countForOpenedCells = 0;

  for (let i = 1; i < rows + 2; i++) {
    for (let j = 1; j < columns + 2; j++) {
      if (arrayForMinesOpened[i][j] === true) {
        countForOpenedCells++;
      }
    }
  }

  if (countForOpenedCells === (rows * columns - numberOfMines)) {
    $('.field__table-cell').css({'cursor': 'default', 'pointer-events': 'none'});
    $('.field__table-cell_mine').css('background-color', 'red').text('M');
    $('#text_field').text('You Won!');
    stopTimer();
    let endedDate = new Date();
    let time = endedDate.getHours() + ":" + endedDate.getMinutes() + ":" + endedDate.getSeconds();
    gamesResults[currentGameIndexInGamesResults].setGameEndedDate(time);
    gamesResults[currentGameIndexInGamesResults].setDuration($('#time_field').text().substring(6));
    gamesResults[currentGameIndexInGamesResults].setStatus('Won');
  }
}

function createMines(x, y) {
  let i = 0,
    randomValueX,
    randomValueY,
    selector;

  while (i < numberOfMines) {
    selector = '#cell_';
    randomValueX = parseInt(Math.floor(Math.random() * (x)) + 1);
    randomValueY = parseInt(Math.floor(Math.random() * (y)) + 1);
    selector = selector + randomValueX + '_' + randomValueY;

    if (arrayForMinesNumbers[randomValueX][randomValueY] !== 9) {
      arrayForMinesNumbers[randomValueX][randomValueY] = 9;
      $(selector).addClass('field__table-cell_mine');
      i++;
    }
  }
}

function createNumberOfMinesMap(x, y) {
  for (let i = 1; i < x + 1; i++) {
    for (let j = 1; j < y + 1; j++) {
      if (arrayForMinesNumbers[i][j] !== 9) {
        for (let m = i - 1; m <= i + 1; m++) {
          for (let n = j - 1; n <= j + 1; n++) {
            if (m !== i || n !== j) {
              if (arrayForMinesNumbers[m][n] === 9) {
                arrayForMinesNumbers[i][j]++;
              }
            }
          }
        }
      }
    }
  }

  $('.field__table-cell_mine').css('background-color', 'lightgrey');
}

function executeClickedCell(x, y) {
  if (arrayForMinesNumbers[x][y] === 9 && arrayForMinesOpened[x][y] === false && arrayForMinesFlagged[x][y] === false) {
    $('.field__table-cell').css({'cursor': 'default', 'pointer-events': 'none'});
    $('.field__table-cell_mine').css('background-color', 'red').text('M');
    $('#text_field').text('You Lost!');
    stopTimer();

    if (timerStarted === false) {
      let startedDate = new Date;
      let time = startedDate.getHours() + ":" + startedDate.getMinutes() + ":" + startedDate.getSeconds();
      let currentGameResult = new GameResults(time, rows + 'x' + columns, numberOfMines);
      gamesResults.push(currentGameResult);
      currentGameIndexInGamesResults++;
    }

    let endedDate = new Date();
    let time = endedDate.getHours() + ":" + endedDate.getMinutes() + ":" + endedDate.getSeconds();
    gamesResults[currentGameIndexInGamesResults].setGameEndedDate(time);
    gamesResults[currentGameIndexInGamesResults].setDuration($('#time_field').text().substring(6));
    gamesResults[currentGameIndexInGamesResults].setStatus('Lost');
    timerStarted = false;
  } else if (arrayForMinesNumbers[x][y] !== 0 && arrayForMinesOpened[x][y] === false && arrayForMinesFlagged[x][y] === false) {
    $('#cell_' + x + '_' + y)
      .css({'background-color': 'darkblue', 'cursor': 'default', 'pointer-events': 'none', 'color': 'white'})
      .text(arrayForMinesNumbers[x][y]);
    arrayForMinesOpened[x][y] = true;
  } else if (arrayForMinesOpened[x][y] === false && arrayForMinesFlagged[x][y] === false) {
    $('#cell_' + x + '_' + y).css({'background-color': 'darkgrey', 'cursor': 'default', 'pointer-events': 'none'});
    arrayForMinesOpened[x][y] = true;

    for (let m = x - 1; m <= parseInt(x) + 1; m++) {
      for (let n = y - 1; n <= parseInt(y) + 1; n++) {
        if (m > 0 && m <= rows && n > 0 && n <= columns && arrayForMinesOpened[m][n] === false && arrayForMinesNumbers[m][n] !== 9 && arrayForMinesFlagged[x][y] === false) {
          executeClickedCell(m, n);
        }
      }
    }
  }
}
