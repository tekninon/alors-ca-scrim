import { createRouter, createWebHistory } from 'vue-router'
import ViewPlayersView from '../views/player/ViewPlayersView.vue'
import AddGameView from '../views/game/AddGameView.vue'
import AddTournamentView from '../views/tournament/AddTournamentView.vue'
import TournamentListView from '../views/tournament/TournamentListView.vue'
import AddPlayerView from '@/views/player/AddPlayerView.vue'
import RecordScoresView from '../views/RecordScoresView.vue'
import RankingView from '../views/RankingView.vue'


const routes = [
  { path: '/view-players', name: 'ViewPlayers', component: ViewPlayersView },
  { path: '/add-game', name: 'AddGame', component: AddGameView },
  { path: '/add-tournament', name: 'AddTournament', component: AddTournamentView },
  { path: '/tournaments', name: 'TournamentList', component: TournamentListView },
  { path: '/record-scores', name: 'RecordScores', component: RecordScoresView },
  { path: '/ranking', name: 'Ranking', component: RankingView },
  {
    path: '/add-player',
    name: 'AddPlayer',
    component: AddPlayerView
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
