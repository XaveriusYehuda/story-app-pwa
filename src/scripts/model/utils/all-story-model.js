// src/model/all-story-model.js
import API_ENDPOINTS from './api-endpoints.js';
import StoryDatabase from './story-database.js'; // Import StoryDatabase

class StoryModel {
  constructor(baseUrl = API_ENDPOINTS.GET_ALL_STORIES || 'https://story-api.dicoding.dev/v1/stories') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all stories with pagination and location filter.
   * Tries to fetch from network first, then falls back to IndexedDB if offline.
   * @param {string} token - Authentication token
   * @param {number} [page=1] - Page number
   * @param {number} [size=10] - Items per page
   * @param {number} [location=0] - Location filter (0 or 1)
   * @returns {Promise<Object>} Response object
   */
  async getAllStories(token, page = 1, size = 10, location = 0) {
    try {
      // Coba ambil dari jaringan terlebih dahulu
      const response = await fetch(
        `${this.baseUrl}?page=${page}&size=${size}&location=${location}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Jika respons bukan ok (misalnya, 4xx, 5xx), coba ambil dari IndexedDB
        // Ini bisa terjadi bahkan jika online, tapi API mengembalikan error
        console.warn('Network fetch failed, attempting to get from IndexedDB.');
        const cachedStories = await StoryDatabase.getAllStories();
        if (cachedStories && cachedStories.length > 0) {
          return {
            success: true,
            data: cachedStories,
            error: null,
            source: 'indexeddb_fallback', // Indikator bahwa data dari IndexedDB
          };
        }
        throw new Error(data.message || 'Failed to fetch stories from network or cache.');
      }

      // Jika berhasil dari jaringan, simpan ke IndexedDB untuk penggunaan offline berikutnya
      await StoryDatabase.putStories(data.listStory);
      return {
        success: true,
        data: data.listStory,
        error: null,
        source: 'network', // Indikator bahwa data dari jaringan
      };
    } catch (error) {
      console.error('Error fetching stories:', error);

      // Jika ada error (termasuk offline), coba ambil dari IndexedDB
      console.warn('Network request failed, trying to retrieve from IndexedDB.');
      try {
        const cachedStories = await StoryDatabase.getAllStories();
        if (cachedStories && cachedStories.length > 0) {
          return {
            success: true,
            data: cachedStories,
            error: null,
            source: 'indexeddb', // Indikator bahwa data dari IndexedDB
          };
        } else {
          return {
            success: false,
            data: null,
            error: error.message || 'An error occurred and no cached data available.',
            source: 'no_data_available',
          };
        }
      } catch (dbError) {
        console.error('Error retrieving from IndexedDB:', dbError);
        return {
          success: false,
          data: null,
          error: `Network error and IndexedDB retrieval failed: ${error.message || dbError.message}`,
          source: 'fetch_and_indexeddb_failed',
        };
      }
    }
  }
}

export default StoryModel;