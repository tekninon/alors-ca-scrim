<template>
  <div class="view-players-by-game container">
    <h2>Voir les joueurs par jeu</h2>

    <div class="form-group">
      <label for="gameSelect">Choisir un jeu :</label>
      <select id="gameSelect" v-model="selectedGameId" @change="fetchPlayers">
        <option value="">-- Sélectionner un jeu --</option>
        <option v-for="game in games" :key="game._id" :value="game._id">
          {{ game.name }}
        </option>
      </select>
    </div>

    <!-- Liste des joueurs ou message si aucun joueur -->
    <div v-if="players.length">
      <h3>Joueurs du jeu sélectionné</h3>
      <ul class="players-list">
        <li v-for="player in players" :key="player._id" class="player-item">
          {{ player.name }} (Tier {{ player.tier }})
          <span class="delete-icon" @click="deletePlayerByGame(player._id)">
            <font-awesome-icon :icon="['fas', 'trash']" />
          </span>
        </li>
      </ul>
    </div>

    <div v-else-if="selectedGameId" class="no-data">
      <p>Aucun joueur pour ce jeu.</p>
    </div>

    <!-- Message d'erreur -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gameService from '@/services/gameService'
import { fetchPlayersByGame , deletePlayer } from "@/services/playerService";


// États réactifs
const games = ref([])
const selectedGameId = ref("")
const players = ref([])
const errorMessage = ref("")

// Charger la liste des jeux au montage du composant
onMounted(async () => {
  try {
    games.value = await gameService.fetchGames()
  } catch (error) {
    errorMessage.value = "Erreur lors de la récupération des jeux."
    console.error(error)
  }
})

// Récupérer les joueurs selon le jeu sélectionné
async function fetchPlayers() {
  if (!selectedGameId.value) {
    players.value = []
    return
  }

  try {
    players.value = await fetchPlayersByGame(selectedGameId.value)
  } catch (error) {
    errorMessage.value = "Erreur lors de la récupération des joueurs."
    console.error(error)
  }
}

async function deletePlayerByGame(playerId) {
  try {
    await deletePlayer(playerId);
    players.value = players.value.filter(player => player._id !== playerId); // Met à jour la liste localement
    errorMessage.value = ""; // Réinitialise le message d'erreur s'il y en avait
  } catch (error) {
    errorMessage.value = "Erreur lors de la suppression du joueur.";
    console.error(error);
  }
}

</script>

<style scoped>
/* Conteneur global */
.container {
  max-width: 600px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #2c3e50;
  font-size: 1.75rem;
}

h3 {
  margin-bottom: 1rem;
  color: #34495e;
  font-size: 1.5rem;
}

/* Groupes de champs */
.form-group {
  margin-bottom: 1.5rem;
}

/* label + select en mode bloc */
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
}

select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

select:focus {
  border-color: #3498db;
  outline: none;
}

/* Liste des joueurs */
.players-list {
  margin-top: 1.5rem;
  padding-left: 1.5rem;
  list-style-type: none;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
  color: #333;
  transition: background 0.3s ease;
}

.player-item:hover {
  background: #f1f1f1;
}

/* Icône de suppression */
.delete-icon {
  cursor: pointer;
  color: #e74c3c;
  transition: color 0.3s ease;
}

.delete-icon:hover {
  color: #c0392b;
}

.no-data {
  text-align: center;
  padding: 1.5rem;
  color: #777;
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  color: red;
  font-weight: bold;
  margin-top: 1rem;
}
</style>
