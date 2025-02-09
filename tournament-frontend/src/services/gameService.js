import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL;

const gameService = {
  async createGame(gameData) {
    try {
      console.log(process.env); // Vérifiez les clés disponibles
      const response = await axios.post(`${API_URL}/games/add`, gameData);
      return response.data;
    } catch (error) {
      // Ajout d'un message personnalisé ou autre traitement
      throw new Error(error.response?.data?.message || 'Une erreur est survenue lors de la création du jeu.');
    }
  },

  async fetchGames() {
    try {
      const response = await axios.get(`${API_URL}/games/all`);
      return response.data;
    } catch (error) {
      // Ajout d'un message personnalisé ou autre traitement
      throw new Error(error.response?.data?.message || 'Une erreur est survenue lors de la récupération des jeux.');
    }
  }
};

export default gameService;
