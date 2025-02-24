<template>
  <div class="player-management container">
    <h2>Gestion des joueurs</h2>
    <div class="forms-container">
      <!-- Formulaire d'ajout de joueur -->
      <div class="form-section">
        <h3>Ajouter un joueur</h3>
        <form @submit.prevent="handleAdd">
          <div class="form-group">
            <label for="add-name">Nom :</label>
            <input
              id="add-name"
              v-model="addName"
              @input="searchPlayers"
              required
              placeholder="Entrez le nom du joueur"
            />
            <ul v-if="suggestions.length" class="autocomplete-suggestions">
              <li
                v-for="player in suggestions"
                :key="player._id"
                @click="selectSuggestion(player)"
              >
                {{ player.name }}
              </li>
            </ul>
          </div>

          <div class="form-group">
            <label for="add-tier">Tier :</label>
            <select id="add-tier" v-model="addTier">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div class="form-group">
            <label for="add-game">Jeu :</label>
            <select id="add-game" v-model="addGameId" required>
              <option value="">-- Choisir un jeu --</option>
              <option v-for="game in games" :key="game._id" :value="game._id">
                {{ game.name }}
              </option>
            </select>
          </div>

          <button type="submit" class="submit-button" :disabled="isLoading">
            {{ isLoading ? "Ajout en cours..." : "Ajouter" }}
          </button>
        </form>
      </div>

      <!-- Formulaire de modification de joueur -->
      <div class="form-section">
        <h3>Modifier un joueur</h3>
        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label for="select-game">Choisir un jeu :</label>
            <select
              id="select-game"
              v-model="selectedGameId"
              @change="fetchPlayersByGame(selectedGameId)"
            >
              <option value="">-- Sélectionner un jeu --</option>
              <option v-for="game in games" :key="game._id" :value="game._id">
                {{ game.name }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="selectedGameId">
            <label for="select-player">Choisir un joueur :</label>
            <select
              id="select-player"
              v-model="selectedPlayerId"
              @change="fetchPlayerDetails"
              required
            >
              <option value="">-- Sélectionner un joueur --</option>
              <option
                v-for="player in filteredPlayers"
                :key="player._id"
                :value="player._id"
              >
                {{ player.name }} (Tier {{ player.tier }})
              </option>
            </select>
          </div>

          <div v-if="selectedPlayer">
            <div class="form-group">
              <label for="update-name">Nouveau nom :</label>
              <input id="update-name" v-model="updatedName" placeholder="Nom du joueur" />
            </div>

            <div class="form-group">
              <label for="update-tier">Nouveau tier :</label>
              <select id="update-tier" v-model="updatedTier">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>

            <button type="submit" class="submit-button" :disabled="isLoading">
              {{ isLoading ? "Modification en cours..." : "Modifier" }}
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
import { ref, computed, onMounted } from "vue";
import { addPlayer, updatePlayer, searchPlayersByName, fetchPlayersByGame as fetchPlayersByGameAPI } from "@/services/playerService";
import gameService from "@/services/gameService";

// Données du formulaire d'ajout
const addName = ref("");
const addTier = ref(1);
const addGameId = ref("");
const games = ref([]);
const suggestions = ref([]);

// Données du formulaire de modification
const selectedGameId = ref("");
const selectedPlayerId = ref("");
const selectedPlayer = ref(null);
const updatedName = ref("");
const updatedTier = ref(null);
const players = ref([]);

// États
const isLoading = ref(false);
const message = ref("");
const isSuccess = ref(false);

// Filtrer les joueurs par jeu sélectionné
const filteredPlayers = computed(() => {
  if (!players.value) {
    console.warn("players.value est undefined !");
    return [];
  }
  return players.value.filter((player) => {
    return player.gameId === selectedGameId.value || player.gameId?._id === selectedGameId.value;
  });
});

// Charger les jeux disponibles
onMounted(async () => {
  try {
    games.value = await gameService.fetchGames();
  } catch (error) {
    console.error(error);
    showMessage("Erreur lors du chargement des jeux.", false);
  }
});

const searchPlayers = async () => {
  if (!addName.value.trim()) {
    suggestions.value = [];
    return;
  }
  try {
    const response = await searchPlayersByName(addName.value);
    suggestions.value = response;
  } catch (error) {
    console.error("Erreur lors de la recherche des joueurs :", error);
    // Vous pouvez décommenter la ligne suivante pour afficher une notification en cas d'erreur
    // showMessage("Erreur lors de la recherche des joueurs.", false);
  }
};

const selectSuggestion = (player) => {
  addName.value = player.name;
  suggestions.value = [];
};

async function fetchPlayersByGame(gameId) {
  if (!gameId) {
    console.warn("fetchPlayersByGame appelé avec gameId undefined !");
    return;
  }
  try {
    const response = await fetchPlayersByGameAPI(gameId);
    players.value = response;
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs :", error);
    const errorMsg = error.response?.data?.message || "Erreur lors du chargement des joueurs.";
    showMessage(errorMsg, false);
  }
}

async function fetchPlayerDetails() {
  if (!selectedPlayerId.value) {
    console.warn("fetchPlayerDetails appelé avec un playerId vide !");
    selectedPlayer.value = null;
    return;
  }
  selectedPlayer.value = players.value.find(player => player._id === selectedPlayerId.value);
  if (!selectedPlayer.value) {
    console.warn(`Aucun joueur trouvé avec l'ID: ${selectedPlayerId.value}`);
  } else {
    updatedName.value = selectedPlayer.value.name;
    updatedTier.value = selectedPlayer.value.tier;
  }
}

// Ajouter un joueur avec gestion d'erreur
async function handleAdd() {
  if (!addName.value || !addGameId.value) {
    showMessage("Veuillez remplir tous les champs obligatoires.", false);
    return;
  }
  isLoading.value = true;
  try {
    await addPlayer({
      name: addName.value,
      tier: Number(addTier.value),
      gameId: addGameId.value,
    });
    showMessage("Joueur ajouté avec succès !", true);
    // Réinitialisation des valeurs du formulaire
    addName.value = "";
    addTier.value = 1;
    addGameId.value = "";
    // Si un jeu est sélectionné dans le formulaire de modification, rafraîchir la liste
    if (selectedGameId.value) {
      await fetchPlayersByGame(selectedGameId.value);
    }
  } catch (error) {
    console.error(error);
    const errorMsg = error.response?.data?.message || "Erreur lors de l'ajout du joueur.";
    showMessage(errorMsg, false);
  } finally {
    isLoading.value = false;
  }
}

// Modifier un joueur avec gestion d'erreur
async function handleUpdate() {
  if (!selectedPlayerId.value) return;
  isLoading.value = true;
  try {
    await updatePlayer(selectedPlayerId.value, {
      name: updatedName.value,
      tier: updatedTier.value,
    });
    showMessage("Joueur modifié avec succès !", true);
    // Mettre à jour la liste locale des joueurs
    const playerIndex = players.value.findIndex(player => player._id === selectedPlayerId.value);
    if (playerIndex !== -1) {
      players.value[playerIndex].name = updatedName.value;
      players.value[playerIndex].tier = updatedTier.value;
    }
    // Rafraîchir la liste pour s'assurer que les données sont à jour
    await fetchPlayersByGame(selectedGameId.value);
    // Réinitialisation des valeurs du formulaire de modification
    selectedPlayerId.value = "";
    selectedPlayer.value = null;
    updatedName.value = "";
    updatedTier.value = null;
  } catch (error) {
    console.error(error);
    const errorMsg = error.response?.data?.message || "Erreur lors de la modification du joueur.";
    showMessage(errorMsg, false);
  } finally {
    isLoading.value = false;
  }
}

// Fonction d'affichage de message avec gestion de succès ou erreur
function showMessage(msg, success) {
  message.value = msg;
  isSuccess.value = success;
  setTimeout(() => (message.value = ""), 3000);
}
</script>

<style scoped>
.container {
  max-width: 1000px;
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
  display: flex;
  gap: 2rem;
}

.form-section {
  flex: 1;
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

.submit-button:active {
  background: #1c6ea4;
}

.autocomplete-suggestions {
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 5px;
}

.autocomplete-suggestions li {
  padding: 8px;
  cursor: pointer;
}

.autocomplete-suggestions li:hover {
  background-color: #f0f0f0;
}

.notification {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
