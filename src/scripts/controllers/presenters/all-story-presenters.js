// all-story-presenter.js
// No direct imports for StoryModel or AuthModel here
class AllStoryPresenter {
  #view;
  #storyModel;
  #authModel;

  constructor({ view, storyModel, authModel }) {
    this.#view = view;
    this.#storyModel = storyModel;
    this.#authModel = authModel; // AuthModel instance injected
  }

  async initialize() {
    this.#view.bindLogoutButton(this._handleLogout.bind(this));
    await this._loadStories();
    this.#view.focusMainContent();
    this.#view.handleSkipLinkAutoFocus();
  }

  _handleLogout(e) {
    e.preventDefault();
    this.#authModel.clearAuthData(); // Use injected authModel
    window.location.hash = '#/login';
  }

  async _loadStories() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.#view.displayLoginPrompt();
      return;
    }
    try {
      // Use injected storyModel
      const result = await this.#storyModel.getAllStories(token, 1, 10, 0);
      if (result.success) {
        this.#view.renderStories(result.data);
      } else {
        console.error('Error fetching stories:', result.error);
        this.#view.displayErrorMessage(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      this.#view.displayErrorMessage('Terjadi kesalahan saat mengambil data cerita.');
    }
  }
}

export default AllStoryPresenter;