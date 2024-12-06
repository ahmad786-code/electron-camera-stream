// const { io } = require("socket.io-client");
// const os = require("os");

// let socket;

// // Initialize socket connection
// function initializeSocket() {
//   socket = io("http://localhost:8000", {
//     reconnection: true, // Enable reconnection
//     reconnectionAttempts: 5, // Retry 5 times
//     reconnectionDelay: 1000, // 1-second delay between retries
//   });

//   const pcId = os.hostname(); // Unique PC identifier

//   // Handle socket connection
//   socket.on("connect", () => {
//     console.log("Socket connected:", socket.id);

//     // Register the PC with the server
//     socket.emit("register-pc", pcId, (ack) => {
//       if (ack.success) {
//         console.log(`PC registered successfully: ${pcId}`);
//         startCameraCapture(pcId);
//       } else {
//         console.error("Registration failed:", ack.message);
//       }
//     });
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("Socket disconnected. Reconnecting...");
//   });

//   // Handle connection errors
//   socket.on("connect_error", (error) => {
//     console.error("Socket connection error:", error);
//   });

//   // Camera capture
//   async function startCameraCapture(pcId) {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       const video = document.createElement("video");
//       video.srcObject = stream;
//       video.play();

//       const canvas = document.createElement("canvas");
//       const [track] = stream.getVideoTracks();
//       const { width, height } = track.getSettings();
//       canvas.width = width;
//       canvas.height = height;

//       const context = canvas.getContext("2d");

//       setInterval(() => {
//         context.drawImage(video, 0, 0, width, height);
//         const frame = canvas.toDataURL("image/jpeg");
//         socket.emit("camera-stream", { pcId, frame });
//       }, 100);
//     } catch (error) {
//       console.error("Error capturing video:", error);
//     }
//   }

//   // Notify server when the app is closed
//   window.addEventListener("beforeunload", () => {
//     socket.emit("disconnect-pc", pcId);
//   });
// }

// window.addEventListener("DOMContentLoaded", () => {
//   initializeSocket();
// });

/*  
const { io } = require("socket.io-client");
const os = require("os");

let socket;
const pcId = os.hostname(); // Unique identifier for the PC

function initializeSocket() {
  socket = io("http://localhost:8000", {
    reconnection: true, // Allow reconnection
    reconnectionAttempts: 10, // Retry up to 10 times
    reconnectionDelay: 1000, // Delay between retries
  });

  // Handle initial connection
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    registerPC(); // Register the PC
  });

  // Re-register the PC when requested
  socket.on("request-re-registration", () => {
    console.log("Re-registration requested by the server.");
    registerPC();
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Socket disconnected.");
  });

  // PC registration logic
  function registerPC() {
    socket.emit("register-pc", pcId, (ack) => {
      if (ack.success) {
        console.log(`PC registered successfully: ${pcId}`);
      } else {
        console.error("PC registration failed:", ack.message);
      }
    });
  }
}

initializeSocket();
 
 
/*  

const { io } = require("socket.io-client");
const os = require("os");

let socket;
const pcId = os.hostname(); // Unique identifier for the PC
let streamingInterval = null; // To track the streaming interval
let videoStream = null; // To hold the MediaStream object
function initializeSocket() {
  socket = io("http://localhost:8000", {
    reconnection: true, // Allow reconnection
    reconnectionAttempts: 10, // Retry up to 10 times
    reconnectionDelay: 1000, // Delay between retries
  });

  // Handle initial connection
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    registerPC(); // Register the PC
  });

  // Re-register the PC when requested
  socket.on("request-re-registration", () => {
    console.log("Re-registration requested by the server.");
    registerPC();
  });

  socket.on("close-camera", () => {
    console.log("Close camera command received.");
    stopCameraStreaming(); // Stop camera streaming
  });


  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Socket disconnected.");
  });

  // Function to register the PC
  function registerPC() {
    socket.emit("register-pc", pcId, (ack) => {
      if (ack.success) {
        console.log(`PC registered successfully: ${pcId}`);
        startCameraStreaming(); // Start camera streaming after registration
      } else {
        console.error("PC registration failed:", ack.message);
      }
    });
  }

  // Function to start capturing and streaming the camera feed
  async function startCameraStreaming() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const [track] = stream.getVideoTracks();
      const { width, height } = track.getSettings();
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      // Send a frame to the server every 100ms
      setInterval(() => {
        context.drawImage(video, 0, 0, width, height);
        const frame = canvas.toDataURL("image/jpeg");
        socket.emit("camera-stream", { pcId, frame }); // Send frame with PC ID
      }, 100);
    } catch (error) {
      console.error("Error capturing video:", error);
    }
   
  }

  function stopCameraStreaming() {
    if (streamingInterval) {
      clearInterval(streamingInterval); // Stop the interval
      streamingInterval = null;
      console.log("Camera streaming stopped.");
    }

  
  }
  if (videoStream) {
    const tracks = videoStream.getTracks();
    tracks.forEach((track) => track.stop()); // Stop all video tracks
    videoStream = null;
    console.log("Camera tracks stopped.");
  }
}

initializeSocket();
 */
  

const { io } = require("socket.io-client");
const os = require("os");

let socket;
const pcId = os.hostname(); // Unique identifier for the PC
let streamingInterval = null; // To track the streaming interval
let videoStream = null; // To hold the MediaStream object
let isCameraStreaming = false; // Track camera state locally

function initializeSocket() {
  socket = io("http://localhost:8000", {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    registerPC(); // Register the PC
  });

  socket.on("request-re-registration", () => {
    console.log("Re-registration requested by the server.");
    registerPC();
  });

  socket.on("start-camera", () => {
    console.log("Start camera command received.");
    if (!isCameraStreaming) {
      startCameraStreaming();
    }
  });

  socket.on("close-camera", () => {
    console.log("Close camera command received.");
    if (isCameraStreaming) {
      stopCameraStreaming();
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected.");
    stopCameraStreaming(); // Ensure the camera stops if the connection is lost
  });

  function registerPC() {
    socket.emit("register-pc", pcId, (ack) => {
      if (ack.success) {
        console.log(`PC registered successfully: ${pcId}`);
      } else {
        console.error("PC registration failed:", ack.message);
      }
    });
  }

  async function startCameraStreaming() {
    try {
      console.log("Starting camera streaming...");
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = videoStream;
      video.play();

      video.onloadedmetadata = () => {
        console.log("Camera stream loaded successfully.");

        const canvas = document.createElement("canvas");
        const [track] = videoStream.getVideoTracks();
        const { width, height } = track.getSettings();
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        isCameraStreaming = true; // Update camera state

        // Send a frame to the server every 100ms
        streamingInterval = setInterval(() => {
          context.drawImage(video, 0, 0, width, height);
          const frame = canvas.toDataURL("image/jpeg");
          socket.emit("camera-stream", { pcId, frame });
        }, 100);

        console.log("Camera streaming started.");
      };

      video.onerror = (err) => {
        console.error("Error loading video stream:", err);
        stopCameraStreaming();
      };
    } catch (error) {
      console.error("Error accessing camera:", error);
      stopCameraStreaming();
    }
  }

  function stopCameraStreaming() {
    console.log("Stopping camera streaming...");
    if (streamingInterval) {
      clearInterval(streamingInterval); // Stop the interval
      streamingInterval = null;
    }

    if (videoStream) {
      const tracks = videoStream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop all video tracks
      videoStream = null;
    }

    isCameraStreaming = false; // Update camera state
    console.log("Camera streaming stopped.");
  }
}

initializeSocket();
