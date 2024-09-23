const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const authRoutes = require("./routes/userRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Define routes before WebSocket connection setup
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use(gameRoutes);

// WebSocket setup
const io = socketIo(server, {
  cors: {
    origin: "*", // Replace '*' with your frontend's origin for better security
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  },
});

// WebSocket connection handler
require("./controllers/leaderboardController").handleWebSocketConnection(io);

// Base route to check API status
app.get("/", (req, res) => {
  res.send("API is working");
});

// MongoDB Connection

const mongoUri = process.env.MONGO_URI;
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process with failure if MongoDB connection fails
  }
};

// Start the server and connect to MongoDB
const PORT = 3000;

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectToMongo();
});
