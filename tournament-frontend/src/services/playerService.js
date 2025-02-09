import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL;

export const addPlayer = async (playerData) => {
  return axios.post(`${API_URL}/players/add`, playerData);
};

export const fetchPlayersByGame = async (gameId) => {
    if (!gameId) {
      console.warn("fetchPlayersByGame appelé avec un gameId undefined !");
      return [];
    }
  
    try {
      const response = await axios.get(`${API_URL}/players/by-game/${gameId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération des joueurs.");
    }
  };
  

export const updatePlayer = async (playerId, updates) => {
  return axios.put(`${API_URL}/players/update/${playerId}`, updates);
};

export const fetchRanking = async () => {
  return axios.get(`${API_URL}/players/ranking`);
};

export const deletePlayer = async (playerId) => {
  try {
    return await axios.delete(`${API_URL}/players/${playerId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la suppression du joueur.");
  }
};
