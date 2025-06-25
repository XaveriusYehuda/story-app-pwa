// detail-story-presenter.js
// No direct imports for DetailStoryModel or getIdFromRoutes here.
import AuthModel from '../../model/utils/login-model'; // Assuming AuthModel is needed for token

class DetailStoryPagePresenter {
  #view;
  #detailStoryModel;
  #authModel;
  #urlParser; // Will be the getIdFromRoutes function

  constructor({ view, detailStoryModel, authModel = AuthModel, urlParser }) {
    this.#view = view;
    this.#detailStoryModel = detailStoryModel; // Instance of DetailStoryModel
    this.#authModel = authModel; // AuthModel class/utility
    this.#urlParser = urlParser; // getIdFromRoutes function
  }

  async initialize() {
    this.#view.bindBackButton(this._handleBackButtonClick.bind(this));
    await this._loadStoryDetail();
  }

  _handleBackButtonClick(e) {
    e.preventDefault();
    window.history.back();
  }

  async _loadStoryDetail() {
    const url = window.location.href;
    const storyId = this.#urlParser(url); // Use injected urlParser
    console.log('DEBUG: Story ID =', storyId);

    const token = localStorage.getItem('authToken'); // Access token via localStorage, or through AuthModel if it provides a getter

    if (!token) {
      this.#view.showError('Please login first');
      setTimeout(() => window.location.href = '/login', 2000); // Redirect to login
      return;
    }

    this.#view.showLoading();

    try {
      const result = await this.#detailStoryModel.getStoryDetail(token, storyId); // Use injected detailStoryModel

      setTimeout(() => {
        this.#view.hideLoading();
        if (result.success) {
          this.#view.displayStory(result.data);
        } else {
          this.#view.showError(result.error || 'Failed to load story details.');
        }
      }, 500); // Added a small delay for loading animation
    } catch (error) {
      console.error('Error fetching story detail:', error);
      this.#view.hideLoading();
      this.#view.showError('An unexpected error occurred while fetching story details.');
    }
  }
}

export default DetailStoryPagePresenter;