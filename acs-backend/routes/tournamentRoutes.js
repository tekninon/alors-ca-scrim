const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");

router.post("/add", tournamentController.createTournament);
router.get("/all", tournamentController.getAllTournaments);

// ✅ Déplacer cette route AVANT `/tournamentId`
router.get("/finished", tournamentController.getFinishedTournaments);

router.get("/:tournamentId", tournamentController.getTournamentById);
router.put("/update/:tournamentId", tournamentController.updateTournament);
router.delete("/delete/:tournamentId", tournamentController.deleteTournament);
router.post("/register-players/:tournamentId", tournamentController.registerPlayers);
router.post("/generate-teams/:tournamentId", tournamentController.generateTeams);
router.post("/record-scores", tournamentController.recordTournamentScores);
router.post("/update-teams/:tournamentId", tournamentController.updateTournamentTeams);
router.post("/finish/:tournamentId", tournamentController.finishTournament);
router.get("/by-game/:gameId", tournamentController.getTournamentsByGame);
module.exports = router;
