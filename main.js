 const { app, BrowserWindow } = require('electron');
const { io } = require("socket.io-client");
const path = require('path');

let win;
let cameraStream;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  const socket = io('http://localhost:8000');

    // Confirm connection to the server
    socket.on("connect", () => {
        console.log("Electron connected to server:", socket.id);
      });
    
      // Listen for camera commands
      socket.on("camera-command", (command) => {
        console.log(`Command received in Electron: ${command}`);
        if (command === "open") {
          win.webContents.send("camera-control", "open");
        } else if (command === "close") {
          win.webContents.send("camera-control", "close");
        }
      });
  
});
