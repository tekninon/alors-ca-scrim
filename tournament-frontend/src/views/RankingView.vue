<template>
  <div class="ranking container">
    <h2>Classement des joueurs</h2>

    <div v-if="players.length">
      <table class="ranking-table">
        <thead>
          <tr>
            <th>
              Position
              <button @click="sortPlayers('position')">
                {{ sortPlayerColumn === 'position' && sortPlayerDirection === 'asc' ? '▲' : '▼' }}
              </button>
            </th>
            <th>
              Nom
              <input v-model="playerNameFilter" placeholder="Filtrer par nom" />
            </th>
            <th>
              Score Total
              <button @click="sortPlayers('totalScore')">
                {{ sortPlayerColumn === 'totalScore' && sortPlayerDirection === 'asc' ? '▲' : '▼' }}
              </button>
            </th>
            <th>
              Nombre de Jeux
              <button @click="sortPlayers('gamesCount')">
                {{ sortPlayerColumn === 'gamesCount' && sortPlayerDirection === 'asc' ? '▲' : '▼' }}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in sortedAndFilteredPlayers" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ player.name }}</td>
            <td>{{ player.totalScore }}</td>
            <td>{{ player.gamesCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="no-data">
      <p>Aucun joueur trouvé.</p>
    </div>
  </div>

  <div class="ranking container">
    <h2>Classement par jeu</h2>

    <div v-if="finishedTournaments.length">
      <table class="ranking-table">
        <thead>
          <tr>
            <th>
              Tournoi
              <input v-model="tournamentNameFilter" placeholder="Filtrer par tournoi" />
            </th>
            <th>
              Jeu
              <input v-model="gameNameFilter" placeholder="Filtrer par jeu" />
            </th>
            <th>
              Équipe gagnante
              <input v-model="winningTeamFilter" placeholder="Filtrer par équipe" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tournament in sortedAndFilteredTournaments" :key="tournament._id">
            <td>{{ tournament.name }}</td>
            <td>{{ tournament.gameId?.name }}</td>
            <td>
              <span v-if="tournament.winningTeam">
                {{ tournament.winningTeam.players.map(player => player.name).join(", ") }}
              </span>
              <span v-else>Aucune équipe gagnante</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="no-data">
      <p>Aucun tournoi terminé trouvé.</p>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const players = ref([])
const finishedTournaments = ref([])

// Filtres et tris pour les joueurs
const playerNameFilter = ref('')
const sortPlayerColumn = ref('position')
const sortPlayerDirection = ref('asc')

// Filtres pour les tournois
const tournamentNameFilter = ref('')
const gameNameFilter = ref('')
const winningTeamFilter = ref('')

onMounted(async () => {
  try {
    // Récupère la liste des joueurs triés par score
    const playersRes = await axios.get("http://localhost:5000/api/players/ranking");
    players.value = playersRes.data;

    // Récupère la liste des tournois terminés
    const tournamentsRes = await axios.get('http://localhost:5000/api/tournaments/finished')
    finishedTournaments.value = tournamentsRes.data
  } catch (error) {
    console.error('Erreur lors de la récupération des classements :', error)
  }
})

// Tri et filtrage des joueurs
const sortedAndFilteredPlayers = computed(() => {
  let filtered = players.value.filter(player =>
    player.name.toLowerCase().includes(playerNameFilter.value.toLowerCase())
  )

  if (sortPlayerColumn.value === 'position') {
  filtered.sort((a, b) => {
    const indexA = filtered.indexOf(a)
    const indexB = filtered.indexOf(b)
    return sortPlayerDirection.value === 'asc' ? indexA - indexB : indexB - indexA
  })
} else if (sortPlayerColumn.value === 'totalScore') {
    filtered.sort((a, b) =>
      sortPlayerDirection.value === 'asc'
        ? a.totalScore - b.totalScore
        : b.totalScore - a.totalScore
    )
  } else if (sortPlayerColumn.value === 'gamesCount') {
    filtered.sort((a, b) =>
      sortPlayerDirection.value === 'asc'
        ? a.gamesCount - b.gamesCount
        : b.gamesCount - a.gamesCount
    )
  }

  return filtered
})

// Filtrage des tournois
const sortedAndFilteredTournaments = computed(() => {
  return finishedTournaments.value.filter(tournament =>
    tournament.name.toLowerCase().includes(tournamentNameFilter.value.toLowerCase()) &&
    tournament.gameId?.name.toLowerCase().includes(gameNameFilter.value.toLowerCase()) &&
    (tournament.winningTeam?.players.map(player => player.name).join(", ") || '')
      .toLowerCase()
      .includes(winningTeamFilter.value.toLowerCase())
  )
})

// Fonction pour trier les joueurs
function sortPlayers(column) {
  if (sortPlayerColumn.value === column) {
    sortPlayerDirection.value = sortPlayerDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortPlayerColumn.value = column
    sortPlayerDirection.value = 'asc'
  }
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
  margin-bottom: 1.5rem;
  text-align: center;
  color: #2c3e50;
  font-size: 1.75rem;
}

/* Tableau du classement */
.ranking-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-table thead {
  background: #3498db;
  color: #fff;
}

.ranking-table th,
.ranking-table td {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.ranking-table th {
  font-weight: 600;
}

.ranking-table tbody tr:nth-child(even) {
  background: #f9f9f9;
}

.ranking-table tbody tr:hover {
  background: #f1f1f1;
  transition: background 0.2s ease;
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

/* Boutons de tri */
button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #fff;
}

/* Champs de filtre */
input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}
</style>