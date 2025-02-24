<template>
  <div id="app">
    <header class="app-header">

      <nav class="main-nav">
        <router-link to="/add-game" title="Créer un jeu">
          <i class="fas fa-plus"></i> Créer un jeu
        </router-link>
        <router-link to="/add-player" title="Ajouter/Modifier un joueur">
          <i class="fas fa-user-edit"></i> Ajouter un joueur
        </router-link>
        <router-link to="/add-tournament" title="Créer un tournoi">
          <i class="fas fa-trophy"></i> Créer un tournoi
        </router-link>
        <div class="dropdown">
          <button class="dropbtn">
            <i class="fas fa-ellipsis-h"></i> Plus
          </button>
          <div class="dropdown-content">
            <router-link to="/view-players">
              <i class="fas fa-users"></i> Voir les joueurs
            </router-link>
            <router-link to="/tournaments">
              <i class="fas fa-list"></i> Liste des tournois
            </router-link>
            <router-link to="/record-scores">
              <i class="fas fa-pencil-alt"></i> Attribuer des scores
            </router-link>
            <router-link to="/ranking">
              <i class="fas fa-chart-line"></i> Classement
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
/* Pas de logique particulière ici */
</script>

<style scoped>

/* Réinitialisation des marges et paddings par défaut */
body, html {
  margin: 0;
  padding: 0;
}

/* Styles généraux de l’application */
#app {
  font-family: 'Poppins', sans-serif;
  background: #f0f0f0;
  min-height: 100vh;
}

/* En-tête (header) */
.app-header {
  background: linear-gradient(
      rgba(0, 0, 0, 0.6), /* Opacité du fond */
      rgba(0, 0, 0, 0.6) /* Opacité du fond */
    ),
    url('@/assets/images/tournoi_du_lundi.webp') center/cover no-repeat; /* Image de fond */
  color: white;
  
 padding-top:10rem;  /* Ajouter de l'espace au-dessus du titre */
  padding-bottom: 2rem; /* Ajouter un peu d'espace en bas */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-size: cover; /* L'image couvre tout le header */
}

.app-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

/* Barre de navigation principale */
.main-nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Style pour chaque lien du nav */
.main-nav a {
  color: #fff;
  text-decoration: none;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
}

.main-nav a i {
  margin-right: 0.5rem; /* Décalage de l'icône */
}

.main-nav a:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Styles pour le menu déroulant */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropbtn {
  background: none;
  color: #fff;
  font-size: 1.2rem;
  padding: 0.5rem;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
}

.dropbtn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-content {
  display: none;
  position: absolute;
  background: #3498db;
  min-width: 160px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 4px;
  right: 0; /* Aligner le menu déroulant à droite */
}

.dropdown-content a {
  color: #fff;
  padding: 0.5rem 1rem;
  text-decoration: none;
  display: block;
  transition: background 0.3s;
}

.dropdown-content a:hover {
  background: #2980b9;
}

.dropdown:hover .dropdown-content {
  display: block;
}

/* Contenu principal */
.app-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
}

</style>