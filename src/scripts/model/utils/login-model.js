// src/model/login-model.js
import API_ENDPOINTS from './api-endpoints.js';
import StoryDatabase from './story-database.js'; // Import StoryDatabase
import DetailStoryDatabase from './detail-story-database.js'; // Import DetailStoryDatabase
import { deleteDB } from 'idb'; // Import deleteDB dari idb untuk menghapus seluruh database

class AuthModel {
  constructor(baseUrl = API_ENDPOINTS.LOGIN) {
    this.baseUrl = baseUrl;
  }

  async _clearServiceWorkerCaches() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('Mengirim pesan ke service worker untuk membersihkan cache...');
      return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          if (event.data.status === 'success') {
            console.log('Cache service worker berhasil dikosongkan.');
            resolve();
          } else {
            console.error('Gagal mengosongkan cache service worker:', event.data.error);
            reject(new Error(event.data.error));
          }
        };

        // Mengirim pesan dengan port kedua ke service worker
        navigator.serviceWorker.controller.postMessage({ action: 'clearAllCaches' }, [messageChannel.port2]);
      });
    } else {
      console.warn('Service Worker tidak terdaftar atau tidak aktif. Tidak dapat membersihkan cache.');
      return Promise.resolve(); // Resolusi agar logout tetap berjalan
    }
  }

  // Fungsi baru untuk menghapus semua data di IndexedDB
  async _clearAllIndexedDBData() {
    console.log('Membersihkan semua data di IndexedDB...');
    try {
      // Cara 1: Menghapus setiap object store secara individual (lebih aman jika ingin selektif)
      await StoryDatabase.clearStories();
      await DetailStoryDatabase.clearDetailStories();
      console.log('Semua data IndexedDB (stories dan detail-stories) berhasil dikosongkan.');

      // Cara 2: Menghapus seluruh database (lebih agresif, tapi efektif jika hanya ada satu database untuk aplikasi)
      // await deleteDB('story-app-db'); // Nama database yang Anda gunakan di StoryDatabase dan DetailStoryDatabase
      // console.log('Seluruh IndexedDB database "story-app-db" berhasil dihapus.');

    } catch (error) {
      console.error('Gagal membersihkan data IndexedDB:', error);
      throw error; // Re-throw error agar bisa ditangani di pemanggil
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response object with success status, data, and error
   */
  async login(email, password) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return {
        success: true,
        data: {
          message: data.message,
          userId: data.loginResult.userId,
          name: data.loginResult.name,
          token: data.loginResult.token
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'An error occurred during login'
      };
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Store authentication data in localStorage
   * @param {string} token - Authentication token
   * @param {string} userId - User ID
   * @param {string} name - User's name
   */
  static storeAuthData(token, userId, name) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', name);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authentication token exists
   */
  static isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Clear authentication data and all application data (SW caches, IndexedDB)
   */
  static async clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');

    const authModelInstance = new AuthModel();
    await authModelInstance._clearServiceWorkerCaches();
    await authModelInstance._clearAllIndexedDBData(); // Panggil fungsi baru untuk membersihkan IndexedDB
  }
}

export default AuthModel;