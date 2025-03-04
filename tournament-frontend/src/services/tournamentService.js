import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/tournaments";

export const tournamentService = {
  async fetchTournaments() {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des tournois :", error);
      throw error;
    }
  },

  async fetchTournamentDetails(tournamentId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${tournamentId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails du tournoi :",
        error
      );
      throw error;
    }
  },
  async addTournament(tournamentData) {
    try {
      await axios.post(`${API_BASE_URL}/add`, tournamentData);
    } catch (error) {
      console.error("Erreur lors de la création du tournoi :", error);
      throw error;
    }
  },

  async updateTournament(tournamentId, data) {
    try {
      await axios.put(`${API_BASE_URL}/update/${tournamentId}`, data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du tournoi :", error);
      throw error;
    }
  },

  async deleteTournament(tournamentId) {
    try {
      await axios.delete(`${API_BASE_URL}/delete/${tournamentId}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du tournoi :", error);
      throw error;
    }
  },

  async generateTeams(tournamentId, numberOfTeams) {
    try {
      await axios.post(`${API_BASE_URL}/generate-teams/${tournamentId}`, {
        numberOfTeams,
      });
    } catch (error) {
      console.error("Erreur lors de la génération des équipes :", error);
      throw error;
    }
  },

  async saveTournamentTeams(tournamentId, teams) {
    try {
      await axios.post(`${API_BASE_URL}/update-teams/${tournamentId}`, {
        teams,
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des équipes :", error);
      throw error;
    }
  },

  async finishTournament(tournamentId, winnerTeamNumber) {
    try {
      await axios.post(`${API_BASE_URL}/finish/${tournamentId}`, {
        winnerTeamNumber,
      });
    } catch (error) {
      console.error("Erreur lors de la finalisation du tournoi :", error);
      throw error;
    }
  },
  async fetchFinishedTournaments() {
    try {
      const response = await axios.get(`${API_BASE_URL}/finished`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des tournois terminés :",
        error
      );
      throw error;
    }
  },
  async recordScores(tournamentId, teamScores) {
    try {
      await axios.post(`${API_BASE_URL}/record-scores`, {
        tournamentId,
        teamScores,
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des scores :", error);
      throw error;
    }
  },
};
