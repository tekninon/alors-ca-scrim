<template>
  <div class="ranking container">
    <h2>Sélectionnez un classement</h2>
    <select v-model="selectedTable" class="table-select">
      <option value="players">Classement général</option>
      <option value="games">Gagnant par tournoi</option>
      <option value="teams">Classement par tournoi par équipe</option>
      <option value="playersByGame">Classement par joueur par jeu</option>
    </select>

    <!-- Classement des joueurs -->
    <div v-if="selectedTable === 'players'">
      <h2>Classement général</h2>
      <div v-if="players.length">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>
                Position
                <button @click="sortPlayers('position')">
                  {{
                    sortPlayerColumn === "position" &&
                    sortPlayerDirection === "asc"
                      ? "▲"
                      : "▼"
                  }}
                </button>
              </th>
              <th>
                Nom
                <input
                  v-model="playerNameFilter"
                  placeholder="Filtrer par nom"
                />
              </th>
              <th>
                Score Total
                <button @click="sortPlayers('totalScore')">
                  {{
                    sortPlayerColumn === "totalScore" &&
                    sortPlayerDirection === "asc"
                      ? "▲"
                      : "▼"
                  }}
                </button>
              </th>
              <th>
                Nombre de Jeux
                <button @click="sortPlayers('gamesCount')">
                  {{
                    sortPlayerColumn === "gamesCount" &&
                    sortPlayerDirection === "asc"
                      ? "▲"
                      : "▼"
                  }}
                </button>
              </th>
              <th>
                Ratio de points par jeu
                <button @click="sortPlayers('ratio')">
                  {{
                    sortPlayerColumn === "ratio" &&
                    sortPlayerDirection === "asc"
                      ? "▲"
                      : "▼"
                  }}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(player, index) in sortedAndFilteredPlayers"
              :key="index"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ player.name }}</td>
              <td>{{ player.totalScore }}</td>
              <td>{{ player.gamesCount }}</td>
              <td>{{ player.ratio }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-data">
        <p>Aucun joueur trouvé.</p>
      </div>
    </div>

    <!-- Classement par jeu -->
    <div v-if="selectedTable === 'games'">
      <h2>Gagnant par tournoi</h2>
      <div v-if="finishedTournaments.length">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>
                Tournoi
                <input
                  v-model="tournamentNameFilter"
                  placeholder="Filtrer par tournoi"
                />
              </th>
              <th>
                Jeu
                <input v-model="gameNameFilter" placeholder="Filtrer par jeu" />
              </th>
              <th>
                Équipe gagnante
                <input
                  v-model="winningTeamFilter"
                  placeholder="Filtrer par équipe"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tournament in sortedAndFilteredTournaments"
              :key="tournament._id"
            >
              <td>{{ tournament.name }}</td>
              <td>{{ tournament.gameId?.name }}</td>
              <td>
                <span v-if="getWinningTeam(tournament)">
                  {{
                    getWinningTeam(tournament)
                      .players.map((player) => player.name)
                      .join(", ")
                  }}
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

    <!-- Classement par tournoi par équipe -->
    <div v-if="selectedTable === 'teams'">
      <h2>Classement par tournoi par équipe</h2>
      <div v-if="finishedTournaments.length">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>
                Tournoi
                <input
                  v-model="tournamentNameFilter"
                  placeholder="Filtrer par tournoi"
                />
              </th>
              <th>Équipe</th>
              <th>
                Score
                <button @click="sortTeams('score')">
                  {{
                    sortTeamColumn === "score" && sortTeamDirection === "asc"
                      ? "▲"
                      : "▼"
                  }}
                </button>
              </th>
              <th>Joueurs</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tournament in sortedAndFilteredTournaments"
              :key="tournament._id"
            >
              <td>{{ tournament.name }}</td>
              <td>
                <div
                  v-for="team in sortedAndFilteredTeams(tournament)"
                  :key="team.teamNumber"
                >
                  <span>Équipe {{ team.teamNumber }}</span>
                </div>
              </td>
              <td>
                <div
                  v-for="team in sortedAndFilteredTeams(tournament)"
                  :key="team.teamNumber"
                >
                  <span>{{ team.score }}</span>
                </div>
              </td>
              <td>
                <div
                  v-for="team in sortedAndFilteredTeams(tournament)"
                  :key="team.teamNumber"
                >
                  <span>{{
                    team.players.map((player) => player.name).join(", ")
                  }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-data">
        <p>Aucun tournoi terminé trouvé.</p>
      </div>
    </div>

    <!-- Classement par joueur par jeu -->
    <div v-if="selectedTable === 'playersByGame'">
      <h2>Classement par joueur par jeu</h2>
      <div>
        <label for="gameFilter">Filtrer par jeu :</label>
        <select v-model="selectedGameId" id="gameFilter">
          <option value="">Tous les jeux</option>
          <option v-for="game in games" :key="game._id" :value="game._id">
            {{ game.name }}
          </option>
        </select>
      </div>
      <div v-if="playersByGame.length">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Nom</th>
              <th>Score</th>
              <th>Jeu</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(player, index) in sortedPlayersByGame"
              :key="player._id"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ player.name }}</td>
              <td>{{ player.score }}</td>
              <td>{{ player.gameName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-data">
        <p>Aucun joueur trouvé pour ce jeu.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { playerService } from "@/services/playerService";
import { tournamentService } from "@/services/tournamentService";
import { gameService } from "@/services/gameService";

const players = ref([]);
const finishedTournaments = ref([]);
const games = ref([]);
const playersByGameRes = ref([]);

// Filtres et tris pour les joueurs
const playerNameFilter = ref("");
const sortPlayerColumn = ref("position");
const sortPlayerDirection = ref("asc");

// Filtres pour les tournois
const tournamentNameFilter = ref("");
const gameNameFilter = ref("");
const winningTeamFilter = ref("");

// Filtres et tris pour les équipes
const teamNameFilter = ref("");
const sortTeamColumn = ref("score");
const sortTeamDirection = ref("desc");

// Sélection du tableau à afficher
const selectedTable = ref("players");

// Filtre pour le classement par joueur par jeu
const selectedGameId = ref("");

onMounted(async () => {
  try {
    players.value = await playerService.fetchPlayerRanking();
    finishedTournaments.value =
      await tournamentService.fetchFinishedTournaments();
    games.value = await gameService.fetchGames();
    playersByGameRes.value = await playerService.fetchAllPlayers();
  } catch (error) {
    console.error("Erreur lors de la récupération des classements :", error);
  }
});

// Récupérer les joueurs par jeu
const playersByGame = computed(() => {
  const playersWithGame = playersByGameRes.value.map((player) => {
    const game = games.value.find((game) => game._id === player.gameId._id);
    return {
      ...player,
      gameName: game ? game.name : "Jeu inconnu",
      gameId: player.gameId._id, // Assurez-vous que gameId est une chaîne
    };
  });

  if (selectedGameId.value) {
    const filteredPlayers = playersWithGame.filter(
      (player) => player.gameId === selectedGameId.value
    );
    return filteredPlayers;
  }

  return playersWithGame;
});

const sortedPlayersByGame = computed(() => {
  return [...playersByGame.value].sort((a, b) => b.score - a.score);
});

const getWinningTeam = (tournament) => {
  if (!tournament.winnerTeamNumber || !tournament.teams) return null;
  return tournament.teams.find(
    (team) => team.teamNumber === tournament.winnerTeamNumber
  );
};

// Tri et filtrage des équipes
const sortedAndFilteredTeams = (tournament) => {
  let filtered = tournament.teams.filter((team) =>
    team.players.some((player) =>
      player.name.toLowerCase().includes(teamNameFilter.value.toLowerCase())
    )
  );

  if (sortTeamColumn.value === "score") {
    filtered.sort((a, b) =>
      sortTeamDirection.value === "asc" ? a.score - b.score : b.score - a.score
    );
  }

  return filtered;
};

// Tri et filtrage des joueurs
const sortedAndFilteredPlayers = computed(() => {
  let filtered = players.value.filter((player) =>
    player.name.toLowerCase().includes(playerNameFilter.value.toLowerCase())
  );

  if (sortPlayerColumn.value === "position") {
    filtered.sort((a, b) => {
      const indexA = filtered.indexOf(a);
      const indexB = filtered.indexOf(b);
      return sortPlayerDirection.value === "asc"
        ? indexA - indexB
        : indexB - indexA;
    });
  } else if (sortPlayerColumn.value === "totalScore") {
    filtered.sort((a, b) =>
      sortPlayerDirection.value === "asc"
        ? a.totalScore - b.totalScore
        : b.totalScore - a.totalScore
    );
  } else if (sortPlayerColumn.value === "gamesCount") {
    filtered.sort((a, b) =>
      sortPlayerDirection.value === "asc"
        ? a.gamesCount - b.gamesCount
        : b.gamesCount - a.gamesCount
    );
  } else if (sortPlayerColumn.value === "ratio") {
    filtered.sort((a, b) =>
      sortPlayerDirection.value === "asc"
        ? a.ratio - b.ratio
        : b.ratio - a.ratio
    );
  }

  return filtered;
});

// Filtrage des tournois
const sortedAndFilteredTournaments = computed(() => {
  return finishedTournaments.value.filter(
    (tournament) =>
      tournament.name
        .toLowerCase()
        .includes(tournamentNameFilter.value.toLowerCase()) &&
      tournament.gameId?.name
        .toLowerCase()
        .includes(gameNameFilter.value.toLowerCase()) &&
      (
        tournament.winningTeam?.players
          .map((player) => player.name)
          .join(", ") || ""
      )
        .toLowerCase()
        .includes(winningTeamFilter.value.toLowerCase())
  );
});

// Fonction pour trier les joueurs
function sortPlayers(column) {
  if (sortPlayerColumn.value === column) {
    sortPlayerDirection.value =
      sortPlayerDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortPlayerColumn.value = column;
    sortPlayerDirection.value = "asc";
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

/* Style pour la liste déroulante */
.table-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
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

/* Style pour le filtre de jeu */
label {
  margin-right: 0.5rem;
}

select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}
</style>
