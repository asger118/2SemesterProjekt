const { SerialPort } = require("serialport"); //UART/Serial package
const { ReadlineParser } = require("@serialport/parser-readline"); //UART/Serial package
const express = require("express"); //Server package
const http = require("http"); //Server package
const Gpio = require("onoff").Gpio; //GPIO control package
const socketio = require("socket.io"); //Websocket package
const { spawn } = require("child_process");
const fs = require("fs");

// Create an HTTP server
const app = express();
const server = http.createServer(app);

//Assign variables to control GPIO ports
const LED1 = new Gpio(588, "out"); //GPIO17
const LED2 = new Gpio(593, "out"); //GPIO22
const LED3 = new Gpio(598, "out"); //GPIO27
//Led state variable
var GPIO17value = 0;
var GPIO22value = 0;
var GPIO27value = 0;

//Start UART/Serial port
const UartPort = "/dev/ttyAMA0";
var Serialport = new SerialPort({
  path: UartPort,
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
});

//Read UART/Serial data with linebreak (\r\n) as data seperator
const parser = Serialport.pipe(new ReadlineParser({ delimiter: "\r\n" }));

// Create a WebSocket server attached to the HTTP server
const io = socketio(server);

// Define the route to serve the HTML page
app.use(express.static(__dirname + "/public"));

let latestData; //need latestData to be global space
parser.on("data", (data) => {
  latestData = data.split(","); // Data from Arduino is seperated by commas
  io.emit("UARTDATA", JSON.stringify(latestData)); // Send the data to all connected clients
});

// Start the HTTP server
const serverPort = 3000;
server.listen(serverPort, function () {
  LED1.writeSync(GPIO17value); //turn LED on or off
  LED2.writeSync(GPIO22value); //turn LED on or off
  LED3.writeSync(GPIO27value); //turn LED on or off
});

// This code us run when server is shut down (ctrl+c on RPI)
process.on("SIGINT", function () {
  LED1.writeSync(0); // Turn LED off
  LED1.unexport(); // Unexport LED GPIO to free resources

  LED2.writeSync(0); // Turn LED off
  LED2.unexport(); // Unexport LED GPIO to free resources

  LED3.writeSync(0); // Turn LED off
  LED3.unexport(); // Unexport LED GPIO to free resources

  process.exit(); //exit completely
});

// This code is run when user connects to webpage
io.sockets.on("connection", function (socket) {
  // Emit state of all leds to websocket
  socket.emit("GPIO17", GPIO17value);
  socket.emit("GPIO22", GPIO22value);
  socket.emit("GPIO27", GPIO27value);

  // This gets called whenever client presses GPIO26 toggle light button
  socket.on("GPIO17T", function (data) {
    // If led on then turn of, and if led off turn on
    GPIO17value = GPIO17value ? 0 : 1;
    LED1.writeSync(GPIO17value); //turn LED on or off
    io.emit("GPIO17", GPIO17value); //send button status to ALL clients
  });

  // this gets called whenever client presses GPIO20 toggle light button
  socket.on("GPIO22T", function (data) {
    // If led on then turn of, and if led off turn on
    GPIO22value = GPIO22value ? 0 : 1;
    LED2.writeSync(GPIO22value); //turn LED on or off
    io.emit("GPIO22", GPIO22value); //send button status to ALL clients
  });

  // this gets called whenever client presses GPIO21 toggle light button
  socket.on("GPIO27T", function (data) {
    // If led on then turn of, and if led off turn on
    GPIO27value = GPIO27value ? 0 : 1;
    LED3.writeSync(GPIO27value); //turn LED on or off
    io.emit("GPIO27", GPIO27value); //send button status to ALL clients
  });
});

// Function to save recived data from UART to file
function saveDataToFile(data) {
  // Parse the data and split into temperature, CO2, and humidity
  const timestamp = new Date().toISOString();

  // Format data with timestamp
  const formattedData = `${timestamp},Temperature:${data[0]},CO2:${data[1]},Humidity:${data[2]}\n`;

  // Write formatted data to log file
  fs.appendFile("uartData.log", formattedData, (err) => {
    if (err) {
      console.error("Error writing data to file:", err);
    } else {
      //console.log('Data saved to file:', formattedData);
    }
  });
};

// Function to run Python script
function runPythonScript() {
  const pythonProcess = spawn("python", ["graph.py"]);

  // Handle script done
  pythonProcess.on("exit", (code) => {
    const TimeStamp = new Date().getTime();
    io.emit("updateGraph", TimeStamp); // Timpstamp to avoid webbrowser chaching issues
  });

  // Handle errors
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error from Python script: ${data}`);
  });
}

setInterval(function () {
  saveDataToFile(latestData);
  runPythonScript();
}, 60000); //Run every minute
