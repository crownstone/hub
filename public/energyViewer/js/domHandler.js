let VIS_CONTAINER;
let STONE_SELECT_DROPDOWN;
let TOKEN;
let GRAPH_WRAPPER;
let TOKEN_INPUT_WRAPPER;
let TOKEN_INPUT;

let FROM_DATE;
let FROM_TIME;
let UNTIL_DATE;
let UNTIL_TIME;

let SAMPLE_COUNT;

let DATA_TYPE_E;
let DATA_TYPE_P;

let UNITS_WRAPPER;
let UNITS_TYPE_J;
let UNITS_TYPE_Wh;
let UNITS_TYPE_kWh;

let PRESENTATION_ENERGY_WRAPPER;
let PRESENTATION_ENERGY_TYPE_cumulative;
let PRESENTATION_ENERGY_TYPE_minute_block;
let PRESENTATION_ENERGY_TYPE_hour_block;
let PRESENTATION_ENERGY_TYPE_day_block;

let PRESENTATION_POWER_WRAPPER;
let PRESENTATION_POWER_TYPE_minute_block;
let PRESENTATION_POWER_TYPE_hour_block;

function initDOM() {
  STONE_SELECT_DROPDOWN = document.getElementById("stoneSelector");
  GRAPH_WRAPPER         = document.getElementById("graphWrapper");
  TOKEN_INPUT_WRAPPER   = document.getElementById("tokenInputWrapper");
  TOKEN_INPUT           = document.getElementById("tokenInput");
  FROM_DATE             = document.getElementById("fromDate");
  FROM_TIME             = document.getElementById("fromTime");
  UNTIL_DATE            = document.getElementById("untilDate");
  UNTIL_TIME            = document.getElementById("untilTime");
  SAMPLE_COUNT          = document.getElementById("sampleCount");
  DATA_TYPE_E           = document.getElementById("dataType1");
  DATA_TYPE_P           = document.getElementById("dataType2");
  UNITS_WRAPPER         = document.getElementById("unitsWrapper");
  UNITS_TYPE_J          = document.getElementById("unitType1");
  UNITS_TYPE_Wh         = document.getElementById("unitType2");
  UNITS_TYPE_kWh        = document.getElementById("unitType3");
  PRESENTATION_ENERGY_WRAPPER           = document.getElementById("presentationEnergyWrapper");
  PRESENTATION_ENERGY_TYPE_cumulative   = document.getElementById("presentationType1");
  PRESENTATION_ENERGY_TYPE_minute_block = document.getElementById("presentationType2");
  PRESENTATION_ENERGY_TYPE_hour_block   = document.getElementById("presentationType3");
  PRESENTATION_ENERGY_TYPE_day_block    = document.getElementById("presentationType4");
  PRESENTATION_POWER_WRAPPER            = document.getElementById("presentationPowerWrapper");
  PRESENTATION_POWER_TYPE_minute_block  = document.getElementById("presentationPowerType1");
  PRESENTATION_POWER_TYPE_hour_block    = document.getElementById("presentationPowerType2");

  FROM_DATE.value = new Date().toISOString().substr(0,10)
  UNTIL_DATE.value = new Date().toISOString().substr(0,10)

  const urlParams = new URLSearchParams(window.location.search);
  TOKEN = urlParams.get('access_token');

  VIS_CONTAINER = document.getElementById("visualization")

  if (TOKEN) {
    TOKEN_INPUT_WRAPPER.style.display = 'none';
    GRAPH_WRAPPER.style.display = 'block';
    initVis();
    getAvailableData();
  }

  determineDataType();


}

function getAvailableData() {
  // check the available data;
  getData(`../api/energyAvailability?access_token=${TOKEN}`, (data) => {
    let dataArr = JSON.parse(data);

    dataArr.sort((a,b) => {
      if (a.locationName == b.locationName) {
        if (a.name > b.name) { return 1;  }
        else                 { return -1; }
      }
      else if (a.locationName > b.locationName) {
        return 1;
      }
      else {
        return -1;
      }
    })
    dataArr.forEach((element) => {
      var el = document.createElement("option");
      el.textContent = `${element.locationName}: ${element.name} (${element.uid}) -- ${element.count} samples`;
      el.value = element.uid;
      STONE_SELECT_DROPDOWN.appendChild(el);
    })
  }, (err) => {
    console.log(err)
  })
}


function validateTokenInput() {
  let value = TOKEN_INPUT.value;
  if (value.length === 64) {
    window.location.href = window.location.href + "?access_token="+value;
    TOKEN = value;
    TOKEN_INPUT_WRAPPER.style.display = 'none';
    GRAPH_WRAPPER.style.display = 'block';
    initVis();
    getAvailableData();
  }
}

let USE_DATA_TYPE = "P";
let POWER_PRESENTATION = "MINUTE";
let ENERGY_PRESENTATION = "CUMULATIVE";
let ENERGY_UNITS = "J"

function determineDataType() {
  if (DATA_TYPE_E.checked) {
    USE_DATA_TYPE = "E"
    PRESENTATION_POWER_WRAPPER.style.display = 'none';
    PRESENTATION_ENERGY_WRAPPER.style.display = 'block';
    UNITS_WRAPPER.style.display = 'block';
  }
  else {
    USE_DATA_TYPE = "P";
    PRESENTATION_POWER_WRAPPER.style.display = 'block';
    PRESENTATION_ENERGY_WRAPPER.style.display = 'none';
    UNITS_WRAPPER.style.display = 'none';
  }
  drawData();
}

function determineUnitsType() {
  if (UNITS_TYPE_J.checked) {
    ENERGY_UNITS = 'J';
  }
  else if (UNITS_TYPE_Wh.checked) {
    ENERGY_UNITS = 'Wh';
  }
  else {
    ENERGY_UNITS = 'kWh';
  }
  drawData();
}

function determinePresentationType() {
  if (USE_DATA_TYPE === 'E') {
    if (PRESENTATION_ENERGY_TYPE_cumulative.checked) {
      ENERGY_PRESENTATION = 'CUMULATIVE';
    }
    else if (PRESENTATION_ENERGY_TYPE_minute_block.checked) {
      ENERGY_PRESENTATION = 'MINUTE';
    }
    else if (PRESENTATION_ENERGY_TYPE_hour_block.checked) {
      ENERGY_PRESENTATION = 'HOUR';
    }
    else {
      ENERGY_PRESENTATION = 'DAY';
    }
  }
  else {
    if (PRESENTATION_POWER_TYPE_hour_block.checked) {
      POWER_PRESENTATION = 'HOUR';
    }
    else {
      POWER_PRESENTATION = 'MINUTE';
    }
  }

  drawData();
}