<template>
  <div class="tournament-management container">
    <h2>Gestion des tournois</h2>
    <div class="forms-container">
      <!-- Formulaire d'ajout de tournoi -->
      <div class="form-section">
        <h3>Créer un tournoi</h3>
        <form @submit.prevent="handleAdd">
          <div class="form-group">
            <label for="tournament-name">Nom :</label>
            <input id="tournament-name" v-model="addName" required placeholder="Entrez le nom du tournoi" />
          </div>

          <div class="form-group">
            <label for="tournament-game">Jeu :</label>
            <select id="tournament-game" v-model="addGameId" required @change="fetchAvailablePlayersForAdd">
              <option value="">-- Choisir un jeu --</option>
              <option v-for="game in games" :key="game._id" :value="game._id">
                {{ game.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Joueurs disponibles :</label>
            <div class="select-all">
              <input type="checkbox" id="select-all-add" v-model="selectAllAdd" @change="toggleSelectAllAdd" />
              <label for="select-all-add">Tout sélectionner</label>
            </div>
            <div class="player-list">
              <div v-for="player in availablePlayersForAdd" :key="player._id" class="player-item">
                <input
                  type="checkbox"
                  :value="player._id.toString()"
                  v-model="selectedPlayers"
                  :id="`player-${player._id}`"
                />
                <label :for="`player-${player._id}`">{{ player.name }} (Tier {{ player.tier }})</label>
              </div>
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="isLoadingAdd">
            {{ isLoadingAdd ? "Création en cours..." : "Créer et inscrire les joueurs" }}
          </button>
        </form>
      </div>

      <!-- Formulaire de modification de tournoi -->
      <div class="form-section">
        <h3>Modifier un tournoi (non terminés)</h3>
        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label for="select-tournament">Choisir un tournoi :</label>
            <select id="select-tournament" v-model="selectedTournamentId" @change="fetchTournamentDetails">
              <option value="">-- Sélectionner un tournoi --</option>
              <option v-for="tournament in tournaments" :key="tournament._id" :value="tournament._id">
                {{ tournament.name }} ({{ tournament.gameId?.name }})
              </option>
            </select>
          </div>

          <div v-if="selectedTournament">
            <div class="form-group">
              <label for="update-name">Nouveau nom :</label>
              <input id="update-name" v-model="updatedName" placeholder="Nom du tournoi" />
            </div>

            <div class="form-group">
              <label for="update-game">Nouveau jeu :</label>
              <select id="update-game" v-model="updatedGameId" @change="fetchAvailablePlayersForUpdate">
                <option v-for="game in games" :key="game._id" :value="game._id">
                  {{ game.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Modifier les joueurs inscrits :</label>
              <div class="select-all">
                <input
                  type="checkbox"
                  id="select-all-update"
                  v-model="selectAllUpdate"
                  @change="toggleSelectAllUpdate"
                />
                <label for="select-all-update">Tout sélectionner</label>
              </div>
              <div class="player-list">
                <div v-for="player in availablePlayersForUpdate" :key="player._id" class="player-item">
                  <input
                    type="checkbox"
                    :value="player._id.toString()"
                    v-model="updatedPlayers"
                    :id="`update-player-${player._id}`"
                  />
                  <label :for="`update-player-${player._id}`">{{ player.name }} (Tier {{ player.tier }})</label>
                </div>
              </div>
            </div>

            <button type="submit" class="submit-button" :disabled="isLoadingUpdate">
              {{ isLoadingUpdate ? "Modification en cours..." : "Modifier" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="message" class="notification" :class="{ success: isSuccess, error: !isSuccess }">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Données du formulaire d'ajout
const addName = ref("");
const addGameId = ref("");
const selectedPlayers = ref([]);
const availablePlayersForAdd = ref([]);
const selectAllAdd = ref(false);
const isLoadingAdd = ref(false);

// Données du formulaire de modification
const selectedTournamentId = ref("");
const selectedTournament = ref(null);
const updatedName = ref("");
const updatedGameId = ref("");
const updatedPlayers = ref([]);
const availablePlayersForUpdate = ref([]);
const selectAllUpdate = ref(false);
const isLoadingUpdate = ref(false);

// Données globales
const games = ref([]);
const tournaments = ref([]);
const message = ref("");
const isSuccess = ref(false);

// Charger les jeux et tournois disponibles
onMounted(async () => {
  try {
    const gamesRes = await axios.get("http://localhost:5000/api/games/all");
    games.value = gamesRes.data;

    const tournamentsRes = await axios.get("http://localhost:5000/api/tournaments/all");
    tournaments.value = tournamentsRes.data.filter((tournament) => !tournament.isFinished);
  } catch (error) {
    showMessage("Erreur lors du chargement des données.", false);
  }
});

// Récupérer les joueurs disponibles pour l'ajout
async function fetchAvailablePlayersForAdd() {
  if (!addGameId.value) {
    availablePlayersForAdd.value = [];
    return;
  }
  try {
    const playersRes = await axios.get(`http://localhost:5000/api/players/by-game/${addGameId.value}`);
    availablePlayersForAdd.value = playersRes.data;
  } catch (error) {
    showMessage("Erreur lors du chargement des joueurs.", false);
  }
}

// Récupérer les joueurs disponibles pour la modification
async function fetchAvailablePlayersForUpdate() {
  if (!updatedGameId.value) {
    availablePlayersForUpdate.value = [];
    return;
  }
  try {
    const playersRes = await axios.get(`http://localhost:5000/api/players/by-game/${updatedGameId.value}`);
    availablePlayersForUpdate.value = playersRes.data;
  } catch (error) {
    showMessage("Erreur lors du chargement des joueurs.", false);
  }
}

// Tout sélectionner/désélectionner pour l'ajout
function toggleSelectAllAdd() {
  if (selectAllAdd.value) {
    selectedPlayers.value = availablePlayersForAdd.value.map((player) => player._id.toString());
  } else {
    selectedPlayers.value = [];
  }
}

// Tout sélectionner/désélectionner pour la modification
function toggleSelectAllUpdate() {
  if (selectAllUpdate.value) {
    updatedPlayers.value = availablePlayersForUpdate.value.map((player) => player._id.toString());
  } else {
    updatedPlayers.value = [];
  }
}

// Ajouter un tournoi
async function handleAdd() {
  if (!addName.value || !addGameId.value || selectedPlayers.value.length === 0) {
    showMessage("Veuillez remplir tous les champs obligatoires.", false);
    return;
  }

  isLoadingAdd.value = true;
  try {
    await axios.post("http://localhost:5000/api/tournaments/add", {
      name: addName.value,
      gameId: addGameId.value,
      playerIds: selectedPlayers.value,
    });
    showMessage("Tournoi créé avec succès !", true);
    addName.value = "";
    addGameId.value = "";
    selectedPlayers.value = [];
    selectAllAdd.value = false;
    fetchTournaments();
  } catch (error) {
    showMessage("Erreur lors de la création du tournoi.", false);
  } finally {
    isLoadingAdd.value = false;
  }
}

// Charger les détails du tournoi sélectionné
async function fetchTournamentDetails() {
  if (!selectedTournamentId.value) {
    selectedTournament.value = null;
    updatedName.value = "";
    updatedGameId.value = "";
    updatedPlayers.value = [];
    selectAllUpdate.value = false;
    return;
  }

  try {
    const res = await axios.get(`http://localhost:5000/api/tournaments/${selectedTournamentId.value}`);
    selectedTournament.value = res.data;

    // Mise à jour des champs pour le formulaire
    updatedName.value = res.data.name;
    updatedGameId.value = res.data.gameId?._id || "";
    updatedPlayers.value = res.data.players?.map((player) => player.toString()) || [];
    await fetchAvailablePlayersForUpdate();
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du tournoi :", error);
    showMessage("Erreur lors du chargement du tournoi.", false);
  }
}


// Modifier un tournoi
async function handleUpdate() {
  if (!selectedTournamentId.value) return;

  isLoadingUpdate.value = true;
  try {
    await axios.put(`http://localhost:5000/api/tournaments/update/${selectedTournamentId.value}`, {
      name: updatedName.value,
      gameId: updatedGameId.value,
      playerIds: updatedPlayers.value,
    });

    showMessage("Tournoi modifié avec succès !", true);
    selectedTournamentId.value = "";
    selectedTournament.value = null;
    updatedName.value = "";
    updatedGameId.value = "";
    updatedPlayers.value = [];
    selectAllUpdate.value = false;
    fetchTournaments();
  } catch (error) {
    console.error("Erreur lors de la modification du tournoi :", error);
    showMessage("Erreur lors de la modification du tournoi.", false);
  } finally {
    isLoadingUpdate.value = false;
  }
}


// Rafraîchir la liste des tournois
async function fetchTournaments() {
  try {
    const tournamentsRes = await axios.get("http://localhost:5000/api/tournaments/all");
    tournaments.value = tournamentsRes.data.filter((tournament) => !tournament.isFinished);
  } catch (error) {
    showMessage("Erreur lors du chargement des tournois.", false);
  }
}

// Afficher un message
function showMessage(msg, success) {
  message.value = msg;
  isSuccess.value = success;
  setTimeout(() => (message.value = ""), 3000);
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.forms-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.form-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}

h3 {
  margin-bottom: 1.5rem;
  color: #34495e;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus,
select:focus {
  border-color: #3498db;
  outline: none;
}

.submit-button {
  width: 100%;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-button:hover {
  background: #2980b9;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-item input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
  transform: scale(1.2);
}

.player-item label {
  font-size: 1rem;
  color: #333;
  cursor: pointer;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.select-all input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
  transform: scale(1.2);
}

.select-all label {
  font-size: 1rem;
  color: #333;
  cursor: pointer;
}
</style>