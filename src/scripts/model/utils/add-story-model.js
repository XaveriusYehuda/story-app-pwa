import API_ENDPOINTS from './api-endpoints.js';

class AddStoryModel {
  constructor(baseUrl = API_ENDPOINTS.ADD_STORY || 'https://story-api.dicoding.dev/v1/stories') {
    this.baseUrl = baseUrl;
  }

  /**
   * Submit a new story
   * @param {FormData} formData - Form data containing description, photo, and optional coordinates
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} - Response from the API
   */
  async submitStory(formData, token) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();
      console.log('Raw response text:', text);
      const data = JSON.parse(text);


      if (response.status !== 201) {
        throw new Error(data.message || 'Failed to submit story');
      }

      if (response.status === 201) {
        return {
          success: true,
          data,
          error: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'An error occurred while submitting the story',
      };
    }
  }

  /**
   * Validate image file
   * @param {File} file - Image file to validate
   * @returns {boolean} - True if file is valid
   */
  static isValidImage(file) {
    if (!file) return false;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 1 * 1024 * 1024; // 1MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }
}

export default AddStoryModel;