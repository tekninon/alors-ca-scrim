import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/games";

export const gameService = {
  async fetchGames() {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des jeux :", error);
      throw error;
    }
  },
};
