// login-page-presenter.js
// No direct imports for AuthModel or sleep here, they will be injected.

class LoginPagePresenter {
  #view;
  #authModel;
  #sleepFunction; // Renamed to avoid conflict with actual 'sleep' import in view

  constructor({ view, authModel, sleepFunction }) {
    this.#view = view;
    this.#authModel = authModel; // AuthModel instance injected
    this.#sleepFunction = sleepFunction; // sleep utility function injected
  }

  async initialize() {
    this.#view.bindLoginFormSubmit(this._handleLoginSubmit.bind(this));

    // Optional: Check if user is already logged in
    // Access localStorage directly as it's a browser API, not a model responsibility
    const token = localStorage.getItem('authToken');
    if (token) {
      window.location.hash = '/';
    }
  }

  async _handleLoginSubmit(e) {
    e.preventDefault();

    this.#view.hideMessages();

    const { email, password } = this.#view.getLoginFormValues();

    try {
      // Use the injected authModel instance for login
      const result = await this.#authModel.login(email, password);

      if (result.success) {
        // Use the injected authModel's static methods
        this.#authModel.constructor.storeAuthData(result.data.token, result.data.userId, result.data.name);

        this.#view.displayMessage(result.data.message, 'success');

        await this.#sleepFunction(5000); // Use injected sleep function
        this.#view.displayMessage('Login successful! Redirecting to home page...', 'success');
        window.location.hash = '/';
      } else {
        this.#view.displayMessage(result.error || 'Login failed. Please try again.', 'error');
      }
    } catch (error) {
      this.#view.displayMessage('An error occurred. Please check your connection and try again.', 'error');
      console.error('Error:', error);
    }
  }
}

export default LoginPagePresenter;