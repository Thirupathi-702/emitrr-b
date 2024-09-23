// controllers/gameController.js
const GameAction = require("../models/gameModel");

const saveAction = async (req, res) => {
  const { cardCount, defuseCards, status } = req.body;
  const { userId } = req.user; // Assuming JWT authentication adds `user` object to `req`.

  try {
    const gameAction = new GameAction({
      userId,
      cardCount,
      defuseCards,
      status,
    });
    await gameAction.save();

    res.status(200).json({ message: "Action saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const loadOrCreateGame = async (req, res) => {
  const { userId } = req.user; // Assuming JWT authentication adds `user` object to `req`.

  try {
    // Check for the last game state of the user
    const lastGame = await GameAction.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (lastGame && lastGame.status === "playing") {
      // If an existing game state is found, return it
      return res.status(200).json({
        gameState: {
          cardCount: lastGame.cardCount,
          defuseCards: lastGame.defuseCards,
          status: lastGame.status,
        },
      });
    } else {
      // If no existing game state is found, initialize a new game state
      return res.status(200).json({
        gameState: {
          cardCount: 5,
          defuseCards: 0,
          status: "playing",
        },
      });
    }
  } catch (error) {
    c;
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveAction, loadOrCreateGame };
