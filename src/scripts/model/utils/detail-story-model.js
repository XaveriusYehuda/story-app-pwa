// src/model/detail-story-model.js
import StoryDatabase from './story-database.js'; // Import DetailStoryDatabase

class DetailStoryModel {
  constructor(baseUrl = 'https://story-api.dicoding.dev/v1') {
    this.baseUrl = baseUrl;
  }

  async getStoryDetail(token, storyId) {
    try {
      // Coba ambil dari jaringan terlebih dahulu
      const response = await fetch(`${this.baseUrl}/stories/${storyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika respons bukan ok, coba ambil dari IndexedDB
        console.warn('Network fetch for story detail failed, attempting to get from IndexedDB.');
        const cachedStory = await StoryDatabase.getStoryDetail(storyId);
        if (cachedStory) {
          return {
            success: true,
            data: cachedStory,
            error: null,
            source: 'indexeddb_fallback', // Indikator bahwa data dari IndexedDB
          };
        }
        throw new Error(data.message || 'Failed to fetch story detail from network or cache.');
      }

      // Jika berhasil dari jaringan, simpan ke IndexedDB
      // await StoryDatabase.putStoryDetail(data.story);
      return {
        success: true,
        data: data.story,
        error: null,
        source: 'network', // Indikator bahwa data dari jaringan
      };
    } catch (error) {
      console.error('Error fetching story detail:', error);

      // Jika ada error (termasuk offline), coba ambil dari IndexedDB
      console.warn('Network request for story detail failed, trying to retrieve from IndexedDB.');
      try {
        const cachedStory = await StoryDatabase.getStoryDetail(storyId);
        if (cachedStory) {
          return {
            success: true,
            data: cachedStory,
            error: null,
            source: 'indexeddb', // Indikator bahwa data dari IndexedDB
          };
        } else {
          return {
            success: false,
            data: null,
            error: error.message || 'An error occurred and no cached detail data available.',
            source: 'no_detail_data_available',
          };
        }
      } catch (dbError) {
        console.error('Error retrieving from IndexedDB for story detail:', dbError);
        return {
          success: false,
          data: null,
          error: `Network error and IndexedDB retrieval failed for detail: ${error.message || dbError.message}`,
          source: 'fetch_and_indexeddb_detail_failed',
        };
      }
    }
  }
}

export default DetailStoryModel;