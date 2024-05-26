const socket = io(); //load socket.io-client and connect to the host that serves the page

//Socket set up on string "UARTDATA"
socket.on("UARTDATA", function (data) {
  const recivedData = JSON.parse(data);
  const dataToDisplay = recivedData.slice(0, 3); // Get first 3 elements of the array
  const people = recivedData.slice(-1)[0]; // Get last element of the array
  updateSensorData(dataToDisplay, people);
});

//Function to calclulate fahrenheit equvalent
function celsiusStringToFahrenheitString(celsiusString) {
  // Extract the numerical value from the string
  // remove any characters from the celsiusString that are not digits (0-9), comma (,), or period (.).
  const celsius = parseFloat(celsiusString.replace(/[^0-9.,]/g, ""));

  // Convert Celsius to Fahrenheit
  const fahrenheit = (9 / 5) * celsius + 32;

  // Return the Fahrenheit temperature as a string with the unit
  return `${fahrenheit.toFixed(2)} °F`;
}

function handleSensorCheck(data, people) {
  // stateArray shall control if the window should be open, if the radiotar should be on or if the lamp should be on
  // The format for the array is [windowState, radiatorState, lampState]
  var stateArray = [0, 0, 0];

<<<<<<< HEAD
  // Check if temperature is over 22°C or if CO2 concentration is over 1000ppm or if humidity is over 60%
  stateArray[0] = data[0] > 22 || data[1] > 1000 || data[2] > 60 ? 1 : 0;
  console.log(stateArray[0]);
  // Check if temperatur is under 20°C and window closed
  stateArray[1] = data[0] < 20 && stateArray[0] == 0 ? 1 : 0;
  // Check if there are any people in the room
  stateArray[2] = people > 0 ? 1 : 0;
=======
  stateArray[0] = data[0] > 22 || data[1] > 1000 || data[2] > 60 ? 1 : 0; // Check if temperature is over 22°C or if CO2 concentration is over 1000ppm or if humidity is over 60%
  stateArray[1] = data[0] < 20 && stateArray[0] == 0 ? 1 : 0; // Check if temperatur is under 20°C and window closed
  stateArray[2] = people > 0 ? 1 : 0; // Check if there are any people in the room
>>>>>>> 23a47223425844b4b499d9606b1a125817a6b74e

  // Send stateArray to backend
  socket.emit("SensorCheck", stateArray);
}

//Function to update UART data on the webpage
function updateSensorData(data, people) {
  handleSensorCheck(data, people);

  // Update website with the current amount of people in the room
  const amountOfPeople = document.getElementById("people");
  amountOfPeople.textContent = people;

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
  // Slice dataString to only contain the first three elements

  data.forEach((dataItem, index) => {
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
      cell.appendChild(document.createTextNode(" °C / "));
      // Insert the fahrenheit value
      cell.appendChild(
        document.createTextNode(celsiusStringToFahrenheitString(dataItem))
      );
    } else if (index == 1) {
      //Insert unit for CO2 concentration
      cell.appendChild(document.createTextNode(" ppm"));
    } else if (index == 2) {
      //Insert unit for Humidity concentration
      cell.appendChild(document.createTextNode(" %"));
    }
  });
}

// Listen for 'graphUpdate' event from the server
socket.on("updateGraph", (TimeStamp) => {
  // Update the graph image on the webpage
  const TempGraph = document.getElementById("TempGraph");
  const CO2Graph = document.getElementById("CO2Graph");
  const HumidityGraph = document.getElementById("HumidityGraph");
  TempGraph.src = "/Images/TempGraph.png?" + TimeStamp;
  CO2Graph.src = "/Images/CO2Graph.png?" + TimeStamp;
  HumidityGraph.src = "/Images/HumidityGraph.png?" + TimeStamp;
});

//Update gpio feedback when server changes LED state
socket.on("WindowControl", function (data) {
  // Set the switch button to the state of the led (on or off)
  document.getElementById("Window").checked = data;
});

//Update gpio feedback when server changes LED state
socket.on("RadiatorControl", function (data) {
  // Set the switch button to the state of the led (on or off)
  document.getElementById("Radiator").checked = data;
});

//Update gpio feedback when server changes LED state
socket.on("LightControl", function (data) {
  // Set the switch button to the state of the led (on or off)
  document.getElementById("Light").checked = data;
});

//Update gpio feedback when server changes LED state
socket.on("AutomaticControl", function (data) {
  // Set the switch button to the state of the led (on or off)
  document.getElementById("Automatic").checked = data;

  // If the automatic toggle is on, then we remove the manual toggle buttons for the external systems
  const windowContainer = document.getElementById("windowContainer");
  const radiatorContainer = document.getElementById("radiatorContainer");
  const lightContainer = document.getElementById("lightContainer");

  // We remove the buttons by adding a class that makes them invisible
  if (data === 0) {
    windowContainer.classList.remove("hideContainer"); // Show the container
    radiatorContainer.classList.remove("hideContainer"); // Show the container
    lightContainer.classList.remove("hideContainer"); // Show the container
  } else {
    windowContainer.classList.add("hideContainer"); // Hide the container
    radiatorContainer.classList.add("hideContainer"); // Hide the container
    lightContainer.classList.add("hideContainer"); // Hide the container
  }
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
    if (x === "Window") {
      socket.emit("WindowToggle"); // send GPIO button toggle to node.js server
    } else if (x === "Radiator") {
      socket.emit("RadiatorToggle"); // send GPIO button toggle to node.js server
    } else if (x === "Light") {
      socket.emit("LightToggle"); // send GPIO button toggle to node.js server
    } else if (x === "Automatic") {
      socket.emit("AutomaticToggle"); // send GPIO button toggle to node.js server
    }
  }
}

function ReportTouchStart(e) {
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) {
    // Now we know that x is defined, we are good to go.
    if (x === "Window") {
      socket.emit("WindowToggle"); // send GPIO button toggle to node.js server
    } else if (x === "Radiator") {
      socket.emit("RadiatorToggle"); // send GPIO button toggle to node.js server
    } else if (x === "Light") {
      socket.emit("LightToggle"); // send GPIO button toggle to node.js server
    } else if (x === "Automatic") {
      socket.emit("AutomaticToggle"); // send GPIO button toggle to node.js server
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
