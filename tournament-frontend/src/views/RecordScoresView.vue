<template>
  <div class="record-scores container">
    <h2>Attribuer des scores</h2>

    <!-- Sélection du jeu -->
    <div class="form-group">
      <label>Choisir un jeu :</label>
      <select v-model="selectedGameId" @change="fetchTournamentsByGame">
        <option value="">-- Sélectionner un jeu --</option>
        <option v-for="game in games" :key="game._id" :value="game._id">
          {{ game.name }}
        </option>
      </select>
    </div>

    <!-- Sélection du tournoi (uniquement après avoir sélectionné un jeu) -->
    <div class="form-group" v-if="selectedGameId">
      <label>Choisir un tournoi en cours:</label>
      <select v-model="selectedTournamentId" @change="fetchTournamentDetails">
        <option value="">-- Sélectionner un tournoi --</option>
        <option v-for="t in filteredTournaments" :key="t._id" :value="t._id">
          {{ t.name }}
        </option>
      </select>
    </div>

    <!-- Affichage des équipes et de l'ajout de scores -->
    <div v-if="selectedTournament && selectedTournament.teams?.length">
      <h3>Tournoi : {{ selectedTournament.name }}</h3>
      <p>Jeu : {{ selectedTournament.gameId?.name }}</p>

      <h4>Équipes</h4>
      <div v-for="team in selectedTournament.teams" :key="team.teamNumber" class="team-score">
        <h5>Équipe {{ team.teamNumber }}</h5>
        <small>Joueurs :
          <span v-for="player in team.players" :key="player._id">
            {{ player.name }} |
          </span>
        </small>
        <input 
          type="number" 
          v-model.number="teamScores[team.teamNumber]" 
          class="score-input"
          placeholder="Score" 
        />
      </div>

      <button class="save-button" @click="recordScores">
        Enregistrer les scores
      </button>

      <h4>Modifier un score individuel</h4>
      <div class="individual-score">
        <label>Choisir un joueur :</label>
        <select v-model="selectedPlayerId" @change="fetchPlayerDetails">
          <option value="">-- Sélectionner un joueur --</option>
          <optgroup 
            v-for="team in selectedTournament.teams" 
            :key="team.teamNumber" 
            :label="'Équipe ' + team.teamNumber"
          >
            <option v-for="player in team.players" :key="player._id" :value="player._id">
              {{ player.name }} (Tier {{ player.tier }})
            </option>
          </optgroup>
        </select>

        <div v-if="selectedPlayerDetails">
          <p>Score actuel : <strong>{{ selectedPlayerDetails.score }}</strong></p>
        </div>

        <input 
          type="number" 
          v-model.number="individualScoreAdjustment" 
          placeholder="Ajustement du score" 
        />
        <button class="update-button" @click="updatePlayerScore">
          Mettre à jour le score
        </button>
      </div>
    </div>

    <div v-else-if="selectedTournamentId" class="no-data">
      <p>Aucune équipe pour ce tournoi, ou tournoi introuvable.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const games = ref([])
const tournaments = ref([])
const filteredTournaments = ref([])
const selectedGameId = ref("")
const selectedTournamentId = ref("")
const selectedTournament = ref(null)
const selectedPlayerId = ref("")
const individualScoreAdjustment = ref(0)
const selectedPlayerDetails = ref(null)

// Dictionnaire stockant les scores par équipe
const teamScores = ref({})

// Charger la liste des jeux au montage
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/games/all')
    games.value = res.data
  } catch (error) {
    console.error("Erreur lors du chargement des jeux :", error)
  }
})

// Charger les tournois en fonction du jeu sélectionné
async function fetchTournamentsByGame() {
  selectedTournamentId.value = ""
  selectedTournament.value = null
  teamScores.value = {}

  if (!selectedGameId.value) {
    filteredTournaments.value = []
    return
  }

  try {
    const res = await axios.get('http://localhost:5000/api/tournaments/all')
    tournaments.value = res.data
    filteredTournaments.value = tournaments.value.filter(t => t.gameId?._id === selectedGameId.value && !t.isFinished)
  } catch (error) {
    console.error("Erreur lors du chargement des tournois :", error)
  }
}

// Charger les détails du tournoi sélectionné
async function fetchTournamentDetails() {
  if (!selectedTournamentId.value) {
    selectedTournament.value = null
    return
  }

  try {
    const res = await axios.get('http://localhost:5000/api/tournaments/all')
    const found = res.data.find(t => t._id === selectedTournamentId.value)
    if (found) {
      selectedTournament.value = found
      teamScores.value = {}
      if (found.teams) {
        found.teams.forEach(team => {
          teamScores.value[team.teamNumber] = 0
        })
      }
    } else {
      selectedTournament.value = null
    }
  } catch (error) {
    console.error("Erreur lors du chargement du tournoi :", error)
  }
}

// Enregistrer les scores des équipes
async function recordScores() {
  if (!selectedTournament.value) return

  const scoresPayload = Object.keys(teamScores.value).map(teamNum => ({
    teamNumber: parseInt(teamNum),
    score: teamScores.value[teamNum]
  }))

  try {
    await axios.post('http://localhost:5000/api/tournaments/record-scores', {
      tournamentId: selectedTournament.value._id,
      teamScores: scoresPayload
    })
    alert('Scores enregistrés avec succès !')
  } catch (error) {
    console.error(error)
    alert("Erreur lors de l'enregistrement des scores")
  }
}

// Récupérer les détails d'un joueur
async function fetchPlayerDetails() {
  if (!selectedPlayerId.value) {
    selectedPlayerDetails.value = null
    return
  }

  try {
    const res = await axios.get(`http://localhost:5000/api/players/${selectedPlayerId.value}`)
    selectedPlayerDetails.value = res.data
  } catch (error) {
    console.error(error)
    alert("Erreur lors de la récupération des détails du joueur.")
  }
}

// Mettre à jour le score individuel d'un joueur
async function updatePlayerScore() {
  if (!selectedPlayerId.value || !individualScoreAdjustment.value) return

  try {
    await axios.post('http://localhost:5000/api/players/update-score', {
      playerId: selectedPlayerId.value,
      scoreAdjustment: individualScoreAdjustment.value
    })
    alert("Score du joueur mis à jour avec succès !")
    individualScoreAdjustment.value = 0
    await fetchPlayerDetails()
  } catch (error) {
    console.error(error)
    alert("Erreur lors de la mise à jour du score")
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
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

h4 {
  margin-bottom: 1rem;
  color: #34495e;
  font-size: 1.25rem;
}

h5 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 1.1rem;
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

select, input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

select:focus, input:focus {
  border-color: #3498db;
  outline: none;
}

.team-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.team-score h5 {
  margin: 0;
  flex: 1;
}

.team-score small {
  flex: 2;
  font-size: 0.9rem;
  color: #777;
}

.score-input {
  width: 100px;
  padding: 0.5rem;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.individual-score {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #ddd;
}

button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.save-button {
  background: #2ecc71;
  color: #fff;
}

.save-button:hover {
  background: #27ae60;
}

.update-button {
  background: #e74c3c;
  color: #fff;
}

.update-button:hover {
  background: #c0392b;
}

.no-data {
  text-align: center;
  padding: 1.5rem;
  color: #777;
  font-size: 1.1rem;
}

.no-data p {
  margin: 0;
}
</style>