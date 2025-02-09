import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL;

// Ajouter un tournoi
export const addTournament = async (tournamentData) => {
  return axios.post(`${API_URL}/tournaments/add`, tournamentData);
};

// Récupérer tous les tournois
export const fetchAllTournaments = async () => {
  return axios.get(`${API_URL}/tournaments/all`);
};

// Récupérer les détails d'un tournoi par ID
export const fetchTournamentById = async (tournamentId) => {
  if (!tournamentId) {
    console.warn("fetchTournamentById appelé avec un tournamentId undefined !");
    return null;
  }
  return axios.get(`${API_URL}/tournaments/${tournamentId}`);
};

// Mettre à jour un tournoi
export const updateTournament = async (tournamentId, updatedData) => {
  return axios.put(`${API_URL}/tournaments/update/${tournamentId}`, updatedData);
};

// Inscrire des joueurs à un tournoi
export const registerPlayersToTournament = async (tournamentId, playerIds) => {
  return axios.post(`${API_URL}/tournaments/register-players/${tournamentId}`, {
    playerIds,
  });
};

// Générer des équipes pour un tournoi
export const generateTournamentTeams = async (tournamentId, numberOfTeams = 2) => {
  return axios.post(`${API_URL}/tournaments/generate-teams/${tournamentId}`, {
    numberOfTeams,
  });
};
