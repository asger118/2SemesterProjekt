const socket = io(); //load socket.io-client and connect to the host that serves the page

/*-----------------Get and display sensor data-----------------*/
//Socket set up on string "UARTDATA"
socket.on("UARTDATA", function (data) {
  const dataString = JSON.parse(data); // Parse the received JSON string
  updateUartData(dataString);
});

//Function to calclulate fahrenheit equvalent
function celsiusStringToFahrenheitString(celsiusString) {
  // Extract the numerical value from the string
  // remove any characters from the celsiusString that are not digits (0-9), comma (,), or period (.).
  const celsius = parseFloat(celsiusString.replace(/[^0-9.,]/g, ""));

  // Convert Celsius to Fahrenheit
  const fahrenheit = (9 / 5) * celsius + 32;

  // Return the Fahrenheit temperature as a string with the unit
  return `${fahrenheit.toFixed(2)} F`;
}

//Function to update UART data on the webpage
function updateUartData(dataString) {
  //Set variable to control the table with the id "data-table"
  const table = document.getElementById("data-table");
  //Set variable to control the body of the table
  const tbody = table.getElementsByTagName("tbody")[0];
  // Clear the existing table body
  tbody.innerHTML = "";

  // Create a variable with the file names of the images
  const imageFilenames = ["Temp.svg", "CO2.svg", "Humidity.svg"];
  // Insert a row to the table body
  const row = tbody.insertRow();
  // Iterate over the data and create rows in the table
  dataString.forEach((dataItem, index) => {
    // Insert a single cell for each data item and its corresponding image
    const cell = row.insertCell();

    // Create an image element for the SVG image
    const img = document.createElement("img");
    // Set the source of the image to be the path to the Images folder and the filename stored in the variable
    img.src = `Images/${imageFilenames[index]}`;

    // Append the image element to the cell
    cell.appendChild(img);

    // Append a space to separate the image from the text
    cell.appendChild(document.createTextNode(" "));

    // Append text from the dataItem to the cell
    cell.appendChild(document.createTextNode(dataItem));
    // The first element is the temperatur element. Here we inster the Fahrenheit calculation
    if (index == 0) {
      // Insert spasing and backslash for seperation
      cell.appendChild(document.createTextNode(" C / "));
      // Insert the fahrenheit value
      cell.appendChild(
        document.createTextNode(celsiusStringToFahrenheitString(dataItem))
      );
    }
  });
}

/*-----------------GPIO control-----------------*/

//Update gpio feedback when server changes LED state
socket.on("GPIO17", function (data) {
  // parse the websocket data to a variable
  const myJSON = JSON.stringify(data);
  // Set the switch button to the state of the led (on or off)
  document.getElementById("GPIO17").checked = data;
});

//Update gpio feedback when server changes LED state
socket.on("GPIO22", function (data) {
  // parse the websocket data to a variable
  const myJSON = JSON.stringify(data);
  // Set the switch button to the state of the led (on or off)
  document.getElementById("GPIO22").checked = data;
});

//Update gpio feedback when server changes LED state
socket.on("GPIO27", function (data) {
  // parse the websocket data to a variable
  const myJSON = JSON.stringify(data);
  // Set the switch button to the state of the led (on or off)
  document.getElementById("GPIO27").checked = data;
});

//when page loads
window.addEventListener("load", function () {
  //Check what kind of device is connected
  if (isMobile.any()) {
    // alert('Mobile');
    document.addEventListener("touchstart", ReportTouchStart, false);
  } else {
    // alert('Desktop');
    document.addEventListener("mousedown", ReportMouseDown, false);
  }
});

function ReportMouseDown(e) {
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) {
    // Now we know that x is defined, we are good to go.
    if (x === "GPIO17") {
      socket.emit("GPIO17T"); // send GPIO button toggle to node.js server
    } else if (x === "GPIO22") {
      socket.emit("GPIO22T"); // send GPIO button toggle to node.js server
    } else if (x === "GPIO27") {
      socket.emit("GPIO27T"); // send GPIO button toggle to node.js server
    }
  }
}

function ReportTouchStart(e) {
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) {
    // Now we know that x is defined, we are good to go.
    if (x === "GPIO17") {
      socket.emit("GPIO17T"); // send GPIO button toggle to node.js server
    } else if (x === "GPIO22") {
      socket.emit("GPIO22T"); // send GPIO button toggle to node.js server
    } else if (x === "GPIO27") {
      socket.emit("GPIO27T"); // send GPIO button toggle to node.js server
    }
  }
}

var isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad/i);
  },
  Windows: function () {
    return (
      navigator.userAgent.match(/IEMobile/i) ||
      navigator.userAgent.match(/WPDesktop/i)
    );
  },
  any: function () {
    return isMobile.Android() || isMobile.iOS() || isMobile.Windows();
  },
};


// Listen for 'graphUpdate' event from the server
socket.on("updateGraph", (TimeStamp) => {
  // Update the graph image on the webpage
  const TempGraph = document.getElementById('TempGraph');
  const CO2Graph = document.getElementById('CO2Graph');
  const HumidityGraph = document.getElementById('HumidityGraph');
  TempGraph.src = "/Images/TempGraph.png?" + TimeStamp;
  CO2Graph.src = "/Images/CO2Graph.png?" + TimeStamp;
  HumidityGraph.src = "/Images/HumidityGraph.png?" + TimeStamp;
});
