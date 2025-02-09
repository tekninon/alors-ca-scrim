<template>
  <div class="create-game container">
    <h2>Créer un jeu</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="game-name">Nom du jeu :</label>
        <input id="game-name" v-model="name" required placeholder="Entrez le nom du jeu" />
      </div>

      <div class="form-group">
        <label for="game-description">Description :</label>
        <textarea id="game-description" v-model="description" placeholder="Décrivez le jeu (facultatif)" rows="3"></textarea>
      </div>

      <button type="submit" class="submit-button" :disabled="isLoading">
        {{ isLoading ? 'Création en cours...' : 'Créer' }}
      </button>
    </form>

    <!-- Notification pour les messages -->
    <div v-if="message" class="notification" :class="{ 'success': isSuccess, 'error': !isSuccess }">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import gameService from '@/services/gameService';

const name = ref('');
const description = ref('');
const isLoading = ref(false);
const message = ref('');
const isSuccess = ref(false);

async function handleSubmit() {
  if (!name.value) {
    showMessage('Veuillez entrer un nom de jeu.', false);
    return;
  }

  isLoading.value = true;

  try {
    await gameService.createGame({ name: name.value, description: description.value });
    showMessage('Jeu créé avec succès !', true);
    name.value = '';
    description.value = '';
  } catch (error) {
    console.error(error);
    showMessage('Erreur lors de la création du jeu.', false);
  } finally {
    isLoading.value = false;
  }
}

function showMessage(msg, success) {
  message.value = msg;
  isSuccess.value = success;
  setTimeout(() => {
    message.value = '';
  }, 3000);
}
</script>

<style scoped>
/* Style identique à votre version originale */
.container {
  max-width: 500px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
  font-size: 1.75rem;
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
textarea {
  width: 100%;
  padding: 0.75rem;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  border-color: #3498db;
  outline: none;
}

textarea {
  resize: vertical;
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

.notification {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.success {
  background-color: #d4edda;
  color: #155724;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
