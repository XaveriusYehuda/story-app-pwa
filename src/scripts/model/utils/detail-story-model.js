class DetailStoryModel {
  constructor(baseUrl = 'https://story-api.dicoding.dev/v1') {
    this.baseUrl = baseUrl;
  }

  async getStoryDetail(token, storyId) {
    try {
      const response = await fetch(`${this.baseUrl}/stories/${storyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch story');
      }

      return {
        success: true,
        data: data.story,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'An error occurred while fetching the story'
      };
    }
  }
}

export default DetailStoryModel;