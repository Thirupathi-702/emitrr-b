const router = require("express").Router();
const fetchUser = require("../middlewares/fetchUser");

const {
  saveAction,
  loadOrCreateGame,
} = require("../controllers/gameController");

router.post("/game/saveAction", fetchUser, saveAction);
router.get("/game/loadGame", fetchUser, loadOrCreateGame);

module.exports = router;
