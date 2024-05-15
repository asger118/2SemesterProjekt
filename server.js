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
//Command to see gpio naming on pi5: cat /sys/kernel/debug/gpio
const LED1 = new Gpio(597, "out"); //GPIO26
const LED2 = new Gpio(584, "out"); //GPIO13
const LED3 = new Gpio(576, "out"); //GPIO05

//Led state variable
let LED1State = 0;
let LED2State = 0;
let LED3State = 0;
let AutomaticState = 1;

//Start UART/Serial port
const UartPort = "/dev/ttyAMA0";
//minicom -b 9600 -o -D /dev/ttyAMA0
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
  LED1.writeSync(LED1State); //turn LED on or off
  LED2.writeSync(LED2State); //turn LED on or off
  LED3.writeSync(LED3State); //turn LED on or off
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
  socket.emit("WindowControl", LED1State);
  socket.emit("RadiatorControl", LED2State);
  socket.emit("LightControl", LED3State);
  socket.emit("AutomaticControl", AutomaticState);

  // This gets called whenever client presses GPIO26 toggle light button
  socket.on("WindowToggle", function () {
    // If led on then turn of, and if led off turn on
    LED1State = LED1State ? 0 : 1;
    LED1.writeSync(LED1State); //turn LED on or off
    io.emit("WindowControl", LED1State); //send button status to ALL clients
  });

  // this gets called whenever client presses GPIO20 toggle light button
  socket.on("RadiatorToggle", function () {
    // If led on then turn of, and if led off turn on
    LED2State = LED2State ? 0 : 1;
    LED2.writeSync(LED2State); //turn LED on or off
    io.emit("RadiatorControl", LED2State); //send button status to ALL clients
  });

  // this gets called whenever client presses GPIO21 toggle light button
  socket.on("LightToggle", function () {
    // If led on then turn of, and if led off turn on
    LED3State = LED3State ? 0 : 1;
    LED3.writeSync(LED3State); //turn LED on or off
    io.emit("LightControl", LED3State); //send button status to ALL clients
  });

  // this gets called whenever client presses GPIO20 toggle light button
  socket.on("AutomaticToggle", function () {
    // If led on then turn of, and if led off turn on
    AutomaticState = AutomaticState ? 0 : 1;
    io.emit("AutomaticControl", AutomaticState); //send button status to ALL clients
  });

  // Automatic control of external sources
  socket.on("SensorCheck", function (stateArray) {
    if (AutomaticState == 1) {
      LED1State = stateArray[0];
      LED2State = stateArray[1];
      LED3State = stateArray[2];

      LED1.writeSync(LED1State); //turn LED on or off
      LED2.writeSync(LED2State); //turn LED on or off
      LED3.writeSync(LED3State); //turn LED on or off

      io.emit("WindowControl", LED1State); //send button status to ALL clients
      io.emit("RadiatorControl", LED2State); //send button status to ALL clients
      io.emit("LightControl", LED3State); //send button status to ALL clients
    }
  });
});

// Function to save recived data from UART to file
function saveDataToFile(data) {
  // Parse the data and split into temperature, CO2, and humidity
  const timestamp = new Date().toISOString();

  // Format data with timestamp
  const formattedData = `${timestamp},Temperature:${data[0]},CO2:${data[1]},Humidity:${data[2]},People:${data[3]}\n`;

  // Write formatted data to log file
  fs.appendFile("uartData.log", formattedData, (err) => {
    if (err) {
      console.error("Error writing data to file:", err);
    } else {
      //console.log('Data saved to file:', formattedData);
    }
  });
}

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
  /*To prevent the server to crash in case the Arduino doesent send any data
    We check to see if latestData variable is empty or undefined*/
  if (latestData) {
    saveDataToFile(latestData);
    runPythonScript();
  } else {
    const timestamp = new Date().toLocaleString(); // Get current timestamp
    console.log(
      `[${timestamp}] : No new data available. Skipped saving data to file and creating new graphs`
    );
  }
}, 60000); //Run every minute
