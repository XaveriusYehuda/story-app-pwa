// login-page-views.js
import '../../../styles/login-page.css';
import LoginPagePresenter from '../../controllers/presenters/login-page-presenters'; // Import the Presenter
import AuthModel from '../../model/utils/login-model'; // Import AuthModel
import { sleep } from '../../model/utils/show-time'; // Import sleep utility

class LoginPageView {
  #presenter;

  getTemplate() {
    return `
      <main class="container">
        <h1>Login to Your Account</h1>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <section style="margin-top: 16px; text-align: center;">
          <span>Belum punya akun? </span>
          <a href="#/register" id="register-link">Daftar di sini</a>
        </section>
        <section id="message" class="message"></section>
        <section id="userInfo" class="user-info" style="display:none;">
          <h3>Login Successful</h3>
          <p><strong>User ID:</strong> <span id="userId"></span></p>
          <p><strong>Name:</strong> <span id="userName"></span></p>
          <p><strong>Token:</strong></p>
          <p class="token" id="userToken"></p>
        </section>
      </main>
    `;
  }

  getElements() {
    return {
      loginForm: document.getElementById('loginForm'),
      messageDiv: document.getElementById('message'),
      userInfoDiv: document.getElementById('userInfo'),
      emailInput: document.getElementById('email'),
      passwordInput: document.getElementById('password'),
    };
  }

  bindLoginFormSubmit(handler) {
    const { loginForm } = this.getElements();
    if (loginForm) {
      loginForm.addEventListener('submit', handler);
    }
  }

  displayMessage(message, type) {
    const { messageDiv } = this.getElements();
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `message ${type}`;
      messageDiv.style.display = 'block';
    }
  }

  hideMessages() {
    const { messageDiv, userInfoDiv } = this.getElements();
    if (messageDiv) messageDiv.style.display = 'none';
    if (userInfoDiv) userInfoDiv.style.display = 'none';
  }

  getLoginFormValues() {
    const { emailInput, passwordInput } = this.getElements();
    return {
      email: emailInput.value,
      password: passwordInput.value,
    };
  }

  // New render method for router interaction
  async render() {
    return this.getTemplate();
  }

  // New afterRender method for router interaction, where the presenter is initialized
  async afterRender() {
    const authModelInstance = new AuthModel(); // Instantiate AuthModel
    const sleepFunction = sleep; // Pass the sleep utility function

    this.#presenter = new LoginPagePresenter({
      view: this,
      authModel: authModelInstance,
      sleepFunction: sleepFunction,
    });
    await this.#presenter.initialize();
  }
}

export default LoginPageView;