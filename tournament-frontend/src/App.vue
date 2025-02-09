<template>
  <div id="app">
    <header class="app-header">
      <h1>Tournois du lundi</h1>

      <nav class="main-nav">
        <router-link to="/add-game">Créer un jeu</router-link>
        <router-link to="/add-player">Ajouter/Modifier un joueur</router-link>
        <router-link to="/add-tournament">Créer un tournoi</router-link>
        <router-link to="/view-players">Voir les joueurs</router-link>
        <router-link to="/tournaments">Liste des tournois</router-link>
        <router-link to="/record-scores">Attribuer des scores</router-link>
        <router-link to="/ranking">Classement</router-link>


      </nav>
    </header>

    <main class="app-content">
      <!-- Le composant qui va charger automatiquement la vue correspondant à la route -->
      <router-view />
    </main>
  </div>
</template>

<script setup>
/* Pas de logique particulière ici */
</script>

<style scoped>
/* Styles généraux de l’application */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background: #f0f0f0; /* fond clair général */
  min-height: 100vh;  /* pour remplir tout l'écran */
}

/* En-tête (header) */
.app-header {
  background: #3498db; /* un bleu */
  color: #fff;
  padding: 1rem;
  text-align: center;
}

.app-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

/* Barre de navigation principale */
.main-nav {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center; /* centre les liens horizontalement */
  gap: 1rem;
}

/* Style pour chaque lien du nav */
.main-nav a {
  color: #fff;           /* blanc sur fond bleu */
  text-decoration: none; /* supprime le soulignement */
  font-size: 1rem;
  font-weight: 500;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.main-nav a:hover {
  background: #2980b9; /* survol plus sombre */
}

/* Contenu principal */
.app-content {
  max-width: 1200px; /* largeur max du contenu */
  margin: 2rem auto;
  padding: 1rem;
}
</style>
