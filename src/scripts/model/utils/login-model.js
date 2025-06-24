import API_ENDPOINTS from './api-endpoints.js';
// import { deleteDB, openDB } from 'idb'; // Tidak diperlukan lagi untuk menghapus cache SW

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

  /**
   * Authenticate user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response object with success status, data, and error
   */
  async login(email, password) {
    // ... (kode login tidak berubah)
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
   * Clear authentication data and IndexedDB table
   */
  static async clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');

    const authModelInstance = new AuthModel();
    await authModelInstance._clearServiceWorkerCaches(); 
  }
}

export default AuthModel;