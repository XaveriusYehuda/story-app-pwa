// register-page-presenter.js
// No direct imports for AuthApiModel, AuthModel, or sleep here, they will be injected.

class RegisterPagePresenter {
  #view;
  #registerModel; // Will hold the AuthApiModel instance
  #loginModel;    // Will hold the AuthModel instance (from login-model.js)
  #sleepFunction;

  constructor({ view, registerModel, loginModel, sleepFunction }) {
    this.#view = view;
    this.#registerModel = registerModel;
    this.#loginModel = loginModel;
    this.#sleepFunction = sleepFunction;
  }

  async initialize() {
    this.#view.bindRegisterFormSubmit(this._handleRegistrationSubmit.bind(this));
    this.#view.bindGuestButtonClick(this._handleGuestAccountCreation.bind(this));
  }

  async _handleRegistrationSubmit(e) {
    e.preventDefault();

    this.#view.hideMessage();

    const { name, email, password } = this.#view.getRegistrationFormValues();

    // Use the injected registerModel (the class itself) to call static validation methods
    const isEmailValid = this.#registerModel.isValidEmail(email);
    const isPasswordValid = this.#registerModel.isValidPassword(password);

    if (!isEmailValid) {
      this.#view.displayMessage('Invalid email format.', 'error');
      return;
    }
    if (!isPasswordValid) {
      this.#view.displayMessage('Password must be at least 8 characters.', 'error');
      return;
    }

    try {
      // Use the injected registerModel instance for registration
      const result = await new this.#registerModel().register({ name, email, password });

      console.log("Result presenter:", result);
      if (!result.success) {
        this.#view.displayMessage(result.error || 'Registration failed. Please try again.', 'error');
        return;
      } else {
        this.#view.displayMessage('Registration successful! Please check your email to verify your account.', 'success');
        this.#view.resetRegistrationForm();
        await this.#sleepFunction(500);
        window.location.href = '#/login';
      }
    } catch (error) {
      this.#view.displayMessage('An error occurred. Please check your connection and try again.', 'error');
      console.error('Error:', error);
    }
  }

  async _handleGuestAccountCreation() {
    try {
      const guestName = `Guest_${Math.random().toString(36).substring(2, 8)}`;
      const guestEmail = `${guestName.toLowerCase()}.${Math.random().toString(36).substring(2, 8)}@gmail.com`;
      const guestPassword = Math.random().toString(36).substring(2, 10);

      // Use the injected registerModel instance for registration
      const result = await new this.#registerModel().register({
        name: guestName,
        email: guestEmail,
        password: guestPassword
      });

      if (!result.success) {
        this.#view.displayMessage('Failed to create guest account. Please try again.', 'error');
        return;
      } else {
        this.#view.displayMessage('Guest account created successfully!', 'success');

        localStorage.setItem('guestSession', JSON.stringify({
          email: guestEmail,
          password: guestPassword,
        }));

        const getGuestData = JSON.parse(localStorage.getItem('guestSession'));
        
        // Use the injected loginModel instance for login
        const loginResult = await new this.#loginModel().login(getGuestData.email, getGuestData.password);

        if (loginResult.success) {
          // Use the injected loginModel's static method
          this.#loginModel.storeAuthData(loginResult.data.token, loginResult.data.userId, loginResult.data.name);

          await this.#sleepFunction(2000);
          window.location.href = '/';
        } else {
          this.#view.displayMessage('Failed to log in with guest account.', 'error');
        }
      }
    } catch (error) {
      this.#view.displayMessage('Error creating guest account.', 'error');
      console.error('Guest account error:', error);
    }
  }
}

export default RegisterPagePresenter;