import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/players";

export const playerService = {
  async addPlayer(playerData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/add`, playerData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du joueur :", error);
      throw error;
    }
  },

  async updatePlayer(playerId, playerData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/update/${playerId}`,
        playerData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du joueur :", error);
      throw error;
    }
  },

  async searchPlayersByName(name) {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { name },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la recherche des joueurs :", error);
      throw error;
    }
  },

  async fetchPlayersByGame(gameId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/by-game/${gameId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des joueurs :", error);
      throw error;
    }
  },
  async deletePlayer(playerId) {
    try {
      await axios.delete(`${API_BASE_URL}/delete/${playerId}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du joueur :", error);
      throw error;
    }
  },

  async fetchPlayerRanking() {
    try {
      const response = await axios.get(`${API_BASE_URL}/ranking`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du classement des joueurs :",
        error
      );
      throw error;
    }
  },

  async fetchAllPlayers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des joueurs :", error);
      throw error;
    }
  },

  async fetchPlayerDetails(playerId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${playerId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails du joueur :",
        error
      );
      throw error;
    }
  },

  async updatePlayerScore(playerId, scoreAdjustment) {
    try {
      await axios.post(`${API_BASE_URL}/update-score`, {
        playerId,
        scoreAdjustment,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du score :", error);
      throw error;
    }
  },
};
