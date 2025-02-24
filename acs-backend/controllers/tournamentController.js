const Tournament = require("../models/Tournament");
const Player = require("../models/Player");

exports.createTournament = async (req, res) => {
  const { name, gameId, playerIds } = req.body;
  try {
    const newTournament = new Tournament({ name, gameId, players: playerIds });
    await newTournament.save();
    res.status(201).json({ message: "Tournoi créé avec succès !", tournament: newTournament });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du tournoi", error });
  }
};

exports.getTournamentById = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await Tournament.findById(tournamentId)
      .populate("gameId", "name") // Récupère les infos du jeu
      .populate("players", "name tier"); // Récupère les infos des joueurs

    if (!tournament) {
      return res.status(404).json({ message: "Tournoi introuvable" });
    }

    res.status(200).json(tournament);
  } catch (error) {
    console.error("Erreur lors de la récupération du tournoi :", error);
    res.status(500).json({ message: "Erreur lors de la récupération du tournoi", error });
  }
};


exports.getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("gameId", "name")
      .populate("teams.players", "name tier");
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des tournois", error });
  }
};

exports.registerPlayers = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { playerIds } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: "Tournoi introuvable" });
    tournament.players = playerIds;
    await tournament.save();
    res.status(200).json({ message: "Joueurs inscrits avec succès", tournament });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'inscription des joueurs", error });
  }
};

exports.generateTeams = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    let { numberOfTeams } = req.body;
    numberOfTeams = numberOfTeams && !isNaN(numberOfTeams) ? parseInt(numberOfTeams, 10) : 2;
    const tournament = await Tournament.findById(tournamentId).populate("players");
    if (!tournament) return res.status(404).json({ message: "Tournoi introuvable" });
    if (!tournament.players.length) return res.status(400).json({ message: "Aucun joueur inscrit" });
    
    const tierMap = {};
    tournament.players.forEach(player => {
      if (!tierMap[player.tier]) tierMap[player.tier] = [];
      tierMap[player.tier].push(player);
    });

    function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
    Object.keys(tierMap).forEach(tier => tierMap[tier] = shuffle(tierMap[tier]));

    const teamsArray = Array.from({ length: numberOfTeams }, () => []);
    const maxPlayersPerTeam = Math.ceil(tournament.players.length / numberOfTeams);
    
    const tiers = Object.keys(tierMap).sort((a, b) => a - b);
    let distributedCount = 0, totalPlayers = tournament.players.length;
    while (distributedCount < totalPlayers) {
      for (let i = 0; i < numberOfTeams; i++) {
        if (distributedCount >= totalPlayers) break;
        for (let t = 0; t < tiers.length / 2; t++) {
          if (tierMap[tiers[t]]?.length && teamsArray[i].length < maxPlayersPerTeam) {
            teamsArray[i].push(tierMap[tiers[t]].shift()._id);
            distributedCount++;
            break;
          }
        }
        for (let t = tiers.length - 1; t >= tiers.length / 2; t--) {
          if (tierMap[tiers[t]]?.length && teamsArray[i].length < maxPlayersPerTeam) {
            teamsArray[i].push(tierMap[tiers[t]].shift()._id);
            distributedCount++;
            break;
          }
        }
      }
    }

    tournament.teams = teamsArray.map((players, index) => ({ teamNumber: index + 1, players }));
    await tournament.save();
    const populatedTournament = await Tournament.findById(tournamentId).populate("teams.players", "name tier");
    res.status(200).json({ message: "Équipes générées", tournament: populatedTournament });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la génération des équipes", error });
  }
};

exports.updateTournament = async (req, res) => {
  const { tournamentId } = req.params;
  const { name, gameId, playerIds } = req.body;

  try {
    const updatedTournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      {
        name,
        gameId,
        players: playerIds,
      },
      { new: true, runValidators: true }
    ).populate("gameId", "name").populate("players", "name tier");

    if (!updatedTournament) {
      return res.status(404).json({ message: "Tournoi introuvable." });
    }

    res.status(200).json({ message: "Tournoi mis à jour avec succès.", tournament: updatedTournament });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tournoi :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du tournoi.", error });
  }
};

exports.deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const deletedTournament = await Tournament.findByIdAndDelete(tournamentId);

    if (!deletedTournament) {
      return res.status(404).json({ message: "Tournoi introuvable." });
    }

    res.status(200).json({ message: "Tournoi supprimé avec succès.", tournament: deletedTournament });
  } catch (error) {
    console.error("Erreur lors de la suppression du tournoi :", error);
    res.status(500).json({ message: "Erreur lors de la suppression du tournoi.", error });
  }
};


exports.getFinishedTournaments = async (req, res) => {
  try {
    const finishedTournaments = await Tournament.find({ isFinished: true })
      .populate("gameId", "name")
      .populate("teams.players", "name tier");

    res.status(200).json(finishedTournaments);
  } catch (error) {
    console.error("Erreur lors de la récupération des tournois terminés :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des tournois terminés.", error });
  }
};

exports.recordTournamentScores = async (req, res) => {
  try {
    const { tournamentId, teamScores } = req.body;

    // Récupérer le tournoi
    const tournament = await Tournament.findById(tournamentId).populate("teams.players");
    if (!tournament) return res.status(404).json({ message: "Tournoi introuvable" });

    // Mise à jour des scores des équipes et des joueurs
    for (const { teamNumber, score } of teamScores) {
      const team = tournament.teams.find(t => t.teamNumber === teamNumber);
      if (team) {
        team.score = score; // Mise à jour du score de l'équipe

        // Diviser le score de l'équipe par le nombre de joueurs
        const playerScore = score / team.players.length;

        // Mise à jour du score de chaque joueur
        for (const player of team.players) {
          await Player.findByIdAndUpdate(player._id, { $inc: { score: playerScore } });
        }
      }
    }

    await tournament.save();
    res.status(200).json({ message: "Scores enregistrés avec succès.", tournament });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des scores :", error);
    res.status(500).json({ message: "Erreur lors de l'enregistrement des scores.", error });
  }
};


exports.updateTournamentTeams = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teams } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournoi introuvable" });
    }

    // Mettre à jour les équipes
    tournament.teams = teams;

    await tournament.save();
    res.status(200).json({ message: "Composition des équipes mise à jour avec succès.", tournament });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des équipes :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour des équipes.", error });
  }
};

exports.finishTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { winnerTeamNumber } = req.body;

    // Vérifier que le tournoi existe
    const tournament = await Tournament.findById(tournamentId).populate("teams.players");
    if (!tournament) return res.status(404).json({ message: "Tournoi introuvable" });

    // Vérifier que l'équipe gagnante existe
    const winningTeam = tournament.teams.find(team => team.teamNumber === winnerTeamNumber);
    if (!winningTeam) {
      return res.status(400).json({ message: "L'équipe gagnante spécifiée est invalide." });
    }

    // Marquer le tournoi comme terminé et enregistrer l'équipe gagnante
    tournament.isFinished = true;
    tournament.winnerTeamNumber = winnerTeamNumber;

  

    await tournament.save();
    res.status(200).json({ message: "Tournoi terminé avec succès.", tournament });
  } catch (error) {
    console.error("Erreur lors de la clôture du tournoi :", error);
    res.status(500).json({ message: "Erreur lors de la clôture du tournoi.", error });
  }
};


// Récupérer les tournois par jeu
exports.getTournamentsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const tournaments = await Tournament.find({ gameId })
      .populate("gameId", "name")
      .populate("teams.players", "name tier");

    if (!tournaments.length) {
      return res.status(404).json({ message: "Aucun tournoi trouvé pour ce jeu." });
    }

    res.status(200).json(tournaments);
  } catch (error) {
    console.error("Erreur lors de la récupération des tournois par jeu :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des tournois par jeu", error });
  }
};
