import API_ENDPOINTS from './api-endpoints.js';

class StoryModel {
  constructor(baseUrl = API_ENDPOINTS.GET_ALL_STORIES || 'https://story-api.dicoding.dev/v1/stories') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all stories with pagination and location filter by directly fetching from the API.
   * Service Worker will handle caching of this request.
   * @param {string} token - Authentication token
   * @param {number} [page=1] - Page number
   * @param {number} [size=10] - Items per page
   * @param {number} [location=0] - Location filter (0 or 1)
   * @returns {Promise<Object>} Response object
   */
  async getAllStories(token, page = 1, size = 10, location = 0) {
    try {
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
        throw new Error(data.message || 'Failed to fetch stories');
      }

      // Model hanya mengembalikan data yang berhasil diambil dari 'fetch'
      // Service Worker akan secara otomatis mencegat permintaan ini dan mengelola cache-nya.
      return {
        success: true,
        data: data.listStory,
        error: null,
        source: 'network_or_sw_cache' // Indikator abstrak, karena model tidak peduli dari mana asalnya
      };
    } catch (error) {
      console.error('Error fetching stories:', error);
      // Jika fetch gagal (misalnya, karena offline dan service worker tidak dapat melayani cache,
      // atau ada masalah jaringan lain), model hanya melaporkan kegagalan.
      // Service worker seharusnya sudah mencoba melayani dari cache jika ada.
      return {
        success: false,
        data: null,
        error: error.message || 'An error occurred while fetching stories. Check your internet connection.',
        source: 'fetch_failed'
      };
    }
  }
}

export default StoryModel;