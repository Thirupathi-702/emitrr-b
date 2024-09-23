const Leaderboard = require("../models/leaderboardModel");
const { v4 } = require("uuid");

// Array to store connected WebSocket clients
let clients = [];
console.log(clients);

// Function to broadcast leaderboard updates to connected clients
const broadcastLeaderboardUpdate = async () => {
  try {
    // Retrieve scores from the leaderboard
    const scores = await Leaderboard.find();
    // Sort scores
    scores.sort((a, b) => {
      // Sort by score in descending order
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      // If scores are equal, sort by time in ascending order
      return new Date(a.time) - new Date(b.time);
    });
    const leaderboard = scores.map((s) => {
      const { playerEmail, score, playerName } = s;
      return {
        playerEmail,
        score,
        playerName,
      };
    });

    // Broadcast leaderboard update to all connected clients
    clients.forEach((client) => {
      client.emit("leaderboardUpdate", leaderboard);
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.addScore = async (req, res) => {
  try {
    const { userId, username } = req.user;
    const player = await Leaderboard.findOne({ playerId: userId });
    if (player) {
      await Leaderboard.updateOne(
        { playerId: userId },
        {
          $set: {
            score: player.score + 1,
            time: new Date(),
          },
        }
      );
      res.status(200).json();
    } else {
      await Leaderboard.create({
        playerName: username,
        playerId: userId,
        time: new Date(),
        score: 1,
      });
      res.status(201).json();
    }

    // After updating the score, broadcast leaderboard update to all connected clients
    await broadcastLeaderboardUpdate();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


module.exports.getScores = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.aggregate([
      {
        // Project only the required fields
        $project: {
          playerId: 1,
          score: 1,
          playerName: 1,
          time: 1,
        },
      },
      {
        // Sort by score in descending order and time in ascending order
        $sort: {
          score: -1,
          time: 1,
        },
      },
    ]);

    // Send the sorted leaderboard data as response
    return res.status(200).json({ leaderboard });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// WebSocket connection handler
module.exports.handleWebSocketConnection = (io) => {
  io.on("connection", (socket) => {
    // Add the client to the clients array
    clients.push(socket);

    // Remove the client from the clients array on disconnect
    socket.on("disconnect", (c) => {
      const index = clients.indexOf(socket);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });
};
