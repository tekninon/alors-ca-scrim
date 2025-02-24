<template>
  <div class="tournament-list container">
    <h2>Liste des tournois</h2>

    <!-- Sélection du jeu pour filtrer -->
    <div class="filter-container">
      <label>Filtrer par jeu :</label>
      <select v-model="selectedGameId" @change="fetchTournaments">
        <option value="">Tous les jeux</option>
        <option v-for="game in games" :key="game._id" :value="game._id">
          {{ game.name }}
        </option>
      </select>
    </div>

    <!-- Case à cocher pour afficher les tournois terminés -->
    <div class="filter-container">
      <label>
        <input type="checkbox" v-model="showFinishedTournaments" />
        Afficher les tournois terminés
      </label>
    </div>

    <div v-for="tournament in filteredTournaments" :key="tournament._id" class="tournament">
      <div class="tournament-header">
        <div>
          <h3 @dblclick="editTournament(tournament)" v-if="!tournament.editing">
            {{ tournament.name }}
            <span class="edit-icon" @click="editTournament(tournament)">🖊️</span>
          </h3>
          <input
            v-if="tournament.editing"
            v-model="tournament.name"
            @blur="updateTournament(tournament)"
            @keyup.enter="updateTournament(tournament)"
            class="edit-input"
          />
          <p>Jeu : {{ tournament.gameId?.name }}</p>
          <p v-if="tournament.isFinished" class="status finished">
            ✅ Tournoi terminé | Équipe gagnante : Équipe {{ tournament.winnerTeamNumber }}
          </p>
        </div>

        <div class="teams-input">
          <label>Nombre d'équipes :</label>
          <input 
            type="number" 
            v-model="teamCounts[tournament._id]" 
            min="2" 
            :disabled="tournament.isFinished" 
          />
          <button 
            @click="generateTeams(tournament._id)" 
            :disabled="tournament.isFinished"
          >
            Générer
          </button>
          <span class="delete-icon" @click="deleteTournament(tournament._id)">🗑️</span>
        </div>
      </div>

      <div v-if="tournament.teams.length">
        <h4>Équipes :</h4>
        <div class="teams-wrapper">
          <div v-for="team in tournament.teams" :key="team.teamNumber" class="team-column" :class="{ 'winner-team': tournament.isFinished && team.teamNumber === tournament.winnerTeamNumber }">
            <h5>Équipe {{ team.teamNumber }}</h5>

            <ul v-if="tournament.isFinished" class="static-list">
              <li v-for="player in team.players" :key="player._id">
                {{ player.name }} (Tier {{ player.tier }})
              </li>
            </ul>

            <draggable
              v-else
              v-model="team.players"
              item-key="_id"
              :group="{ name: 'players-' + tournament._id }"
              @end="onDragEnd"
              class="draggable-list"
            >
              <template #item="{ element }">
                <div class="draggable-item">
                  {{ element.name }} (Tier {{ element.tier }})
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <button 
          class="save-btn" 
          @click="saveTournament(tournament._id)" 
          :disabled="tournament.isFinished"
        >
          Enregistrer la composition
        </button>

        <!-- Sélection de l'équipe gagnante + bouton "Terminer le tournoi" -->
        <div v-if="!tournament.isFinished" class="finish-tournament">
          <label>Choisir l'équipe gagnante :</label>
          <select v-model="winnerTeams[tournament._id]" class="winner-select">
            <option v-for="team in tournament.teams" :key="team.teamNumber" :value="team.teamNumber">
              Équipe {{ team.teamNumber }}
            </option>
          </select>
          <button class="finish-btn" @click="finishTournament(tournament._id)">
            Terminer le tournoi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'

const tournaments = ref([])
const games = ref([])
const selectedGameId = ref("")
const teamCounts = ref({})
const winnerTeams = ref({})
const showFinishedTournaments = ref(false)

onMounted(() => {
  fetchGames()
  fetchTournaments()
})

async function fetchGames() {
  const response = await axios.get('http://localhost:5000/api/games/all')
  games.value = response.data
}

async function fetchTournaments() {
  const response = await axios.get('http://localhost:5000/api/tournaments/all')
  tournaments.value = response.data.map(t => ({ ...t, editing: false }))
  response.data.forEach(t => {
    teamCounts.value[t._id] = 2
    winnerTeams.value[t._id] = null
  })
}

const filteredTournaments = computed(() => {
  let filtered = tournaments.value
  if (selectedGameId.value) {
    filtered = filtered.filter(t => t.gameId?._id === selectedGameId.value)
  }
  if (!showFinishedTournaments.value) {
    filtered = filtered.filter(t => !t.isFinished)
  }
  return filtered
})

function editTournament(tournament) {
  tournament.editing = true
}

async function updateTournament(tournament) {
  tournament.editing = false
  await axios.put(`http://localhost:5000/api/tournaments/update/${tournament._id}`, { name: tournament.name })
}

async function deleteTournament(tournamentId) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ?")) return
  await axios.delete(`http://localhost:5000/api/tournaments/delete/${tournamentId}`)
  fetchTournaments()
}

async function generateTeams(tournamentId) {
  const numberOfTeams = teamCounts.value[tournamentId] || 2
  await axios.post(`http://localhost:5000/api/tournaments/generate-teams/${tournamentId}`, { numberOfTeams })
  fetchTournaments()
}

async function saveTournament(tournamentId) {
  await axios.post(`http://localhost:5000/api/tournaments/update-teams/${tournamentId}`, { teams: tournaments.value.find(t => t._id === tournamentId).teams })
  fetchTournaments()
}

async function finishTournament(tournamentId) {
  const winnerTeam = winnerTeams.value[tournamentId]
  if (!winnerTeam) {
    alert("Veuillez sélectionner une équipe gagnante !")
    return
  }
  await axios.post(`http://localhost:5000/api/tournaments/finish/${tournamentId}`, { winnerTeamNumber: winnerTeam })
  alert("Tournoi terminé avec succès !")
  fetchTournaments()
}

function onDragEnd(evt) {
  console.log('Drag terminé !', evt)
}
</script>


<style scoped>
/* Conteneur global */
.container {
  max-width: 1200px;
  margin: 2rem auto;
  background: #f8f8f8;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 2rem;
  text-align: center;
}

/* Chaque tournoi */
.tournament {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tournament:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Tournoi terminé */
.status.finished {
  font-weight: bold;
  color: green;
  font-size: 1.2rem;
}

/* Entête d'un tournoi */
.tournament-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

/* Zone d'entrée du nb d'équipes */
.teams-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.teams-input input[type="number"] {
  width: 70px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
}

/* Équipes */
.teams-wrapper {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

/* Colonne d’équipe */
.team-column {
  flex: 1;
  min-width: 180px;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background: #fafafa;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.team-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Liste statique (lorsque le tournoi est terminé) */
.static-list {
  list-style: none;
  padding: 0;
}

.static-list li {
  background: #f5f5f5;
  border: 1px solid #ddd;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* Zone draggable */
.draggable-list {
  min-height: 80px;
  border: 1px dashed #aaa;
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: #fff;
  transition: background-color 0.2s ease;
}

.draggable-list:hover {
  background-color: #f9f9f9;
}

/* Joueur draggable */
.draggable-item {
  background: #f5f5f5;
  border: 1px solid #ddd;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  cursor: move;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.draggable-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Bouton "Enregistrer la composition" */
.save-btn {
  background: #27ae60;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.save-btn:hover {
  background: #219653;
  transform: translateY(-1px);
}

.save-btn:disabled {
  background: gray;
  cursor: not-allowed;
  transform: none;
}

/* Bouton "Générer" */
.teams-input button {
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.teams-input button:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.teams-input button:disabled {
  background: gray;
  cursor: not-allowed;
  transform: none;
}

/* Sélection de l'équipe gagnante + bouton "Terminer le tournoi" */
.finish-tournament {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.finish-tournament label {
  font-size: 0.9rem;
  color: #555;
}

.winner-select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}

.finish-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.finish-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

/* Filtre par jeu */
.filter-container {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-container label {
  font-size: 1rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-container select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  cursor: pointer;
}

.filter-container select:hover {
  border-color: #999;
}

.filter-container input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

/* Équipe gagnante */
.winner-team {
  background-color: #80aa92 !important; /* Vert */
  font-weight: bold;
  border: 2px solid #4eb378;
}

</style>