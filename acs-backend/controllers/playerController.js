const Player = require("../models/Player");

// Ajouter un joueur
exports.addPlayer = async (req, res) => {
  const { name, tier, gameId } = req.body;
  try {

    const existingPlayer = await Player.findOne({ name, gameId });
    if (existingPlayer) {
      return res.status(400).json({ message: "L'association joueur/jeu existe déjà" });
    }
    const newPlayer = new Player({ name, tier, gameId });
    await newPlayer.save();
    res.status(201).json({ message: "Player added!", player: newPlayer });
  } catch (error) {
    res.status(500).json({ message: "Error adding player", error });
  }
};

// Récupérer tous les joueurs
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate("gameId", "name");
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: "Error fetching players", error });
  }
};

// Récupérer les joueurs par jeu
exports.getPlayersByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const players = await Player.find({ gameId }).populate("gameId", "name").sort({ name: 1 }); 
    ;
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: "Error fetching players for game", error });
  }
};

// Mettre à jour un joueur
exports.updatePlayer = async (req, res) => {
  const { playerId } = req.params;
  const { name, tier } = req.body;
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      playerId,
      { name, tier },
      { new: true, runValidators: true }
    );
    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found." });
    }
    res.status(200).json({ message: "Player updated successfully.", player: updatedPlayer });
  } catch (error) {
    res.status(500).json({ message: "Error updating player", error });
  }
};
// Classement des joueurs
exports.getRanking = async (req, res) => {
  try {
    const ranking = await Player.aggregate([
      {
        $group: {
          _id: "$name",
          totalScore: { $sum: "$score" },
          gamesPlayed: { $addToSet: "$gameId" },
        },
      },
      {
        $project: {
          name: "$_id",
          totalScore: 1,
          gamesCount: { $size: "$gamesPlayed" },
        },
      },
      {
        $addFields: {
          ratio: {
            $cond: [
              { $eq: ["$gamesCount", 0] }, 
              0, 
              { $divide: ["$totalScore", "$gamesCount"] }
            ], // Calculer le ratio
          },
        },
      },
      {
        $project: {
          name: 1,
          totalScore: { $round: ["$totalScore", 2] },  // Arrondir totalScore à 2 décimales
          gamesCount: 1,
          ratio: { $round: ["$ratio", 2] },  // Arrondir le ratio à 2 décimales
        },
      },
      { $sort: { totalScore: -1 } },
    ]);
    res.status(200).json(ranking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ranking", error });
  }
};


// Supprimer un joueur
exports.deletePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const deletedPlayer = await Player.findByIdAndDelete(playerId);

    if (!deletedPlayer) {
      return res.status(404).json({ message: "Player not found." });
    }

    res.status(200).json({ message: "Player deleted successfully.", player: deletedPlayer });
  } catch (error) {
    res.status(500).json({ message: "Error deleting player", error });
  }
};

exports.updatePlayerScore = async (req, res) => {
  try {
    const { playerId, scoreAdjustment } = req.body;

    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ message: "Joueur introuvable" });

    // Mise à jour du score
    player.score = (player.score || 0) + scoreAdjustment;
    await player.save();

    res.status(200).json({ message: "Score mis à jour avec succès.", player });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du score :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du score.", error });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({ message: "Joueur introuvable" });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error("Erreur lors de la récupération du joueur :", error);
    res.status(500).json({ message: "Erreur lors de la récupération du joueur.", error });
  }
};

// Recherche par nom
exports.searchPlayersByName = async (req, res) => {

  try {
    const name = req.query.name; // Nom récupéré depuis la requête

    if (!name) {
      return res.status(400).json({ message: "Nom requis pour la recherche" });
    }

    // Recherche des joueurs dont le nom correspond (insensible à la casse)
    const players = await Player.find({
      name: { $regex: name, $options: "i" }, // Recherche insensible à la casse
    });

    // Supprimer les doublons basés sur le nom
    const uniquePlayers = Array.from(new Map(players.map(player => [player.name, player])).values());

    res.status(200).json(uniquePlayers);
  } catch (error) {
    console.error("Erreur lors de la recherche des joueurs:", error);
    res.status(500).json({ message: "Erreur lors de la recherche des joueurs", error });
  }
};
