// all-story-views.js
import '../../../styles/all-story.css';
import { createStoryItemTemplate } from '../components/story-item';
import AllStoryPresenter from '../../controllers/presenters/all-story-presenters'; // Import the Presenter
import StoryModel from '../../model/utils/all-story-model'; // Import the Model
import AuthModel from '../../model/utils/login-model'; // Import AuthModel for injection

class AllStoryView {
  #presenter;

  getTemplate() {
    return `
      <a href="#mainContent" class="skip-link">Skip to main content</a>
      <header>
        <div class="header-content">
          <a href="#/login" id="logoutBtn" class="back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Logout
          </a>
          <div id="userInfo"></div>
        </div>
      </header>
      <main id='asep3' tabindex="-1"> <h1>Story List</h1>
        <h2>Bagikan Ceritamu!</h2>
        <p>Temukan cerita menarik dari pengguna Dicoding.</p>
        <a id="tambahBtn" href="#/add">Tambah Cerita</a>
        <div id="story-container"></div>
      </main>
    `;
  }

  getElements() {
    return {
      logoutBtn: document.getElementById('logoutBtn'),
      storyContainer: document.getElementById('story-container'),
      userInfoDiv: document.getElementById('userInfo'),
      mainContent: document.querySelector('#story-container'), // Seleksi elemen id="main-content" bisa disesuaikan kembali jika berbeda
      skipLink: document.querySelector('.skip-link'), // Seleksi elemen class="skip-link" bisa disesuaikan kembali jika berbeda
    };
  }

  // The view will delegate binding to the presenter, which will then handle the action
  bindLogoutButton(handler) {
    const { logoutBtn } = this.getElements();
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handler);
    }
  }

  renderStories(stories) {
    const { storyContainer } = this.getElements();
    if (storyContainer) {
      storyContainer.innerHTML = '';
      stories.forEach(story => {
        const storyEl = document.createElement('div');
        storyEl.classList.add('story');
        storyEl.innerHTML += createStoryItemTemplate(story);
        storyContainer.appendChild(storyEl);
      });
    }
  }

  handleSkipLinkAutoFocus() {
    const { skipLink } = this.getElements();
    if (!skipLink) return;

    // Fungsi untuk cek posisi scroll
    function checkScroll() {
      if (window.scrollY === 0) {
        skipLink.style.top = '80px';
        skipLink.style.left = '50px';
        skipLink.tabIndex = 0;
        skipLink.focus();
      } else {
        skipLink.style.top = '-100px';
        skipLink.tabIndex = -1;
        skipLink.blur();
      }
    }

    // Cek saat load dan saat scroll
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('load', checkScroll);
  }

  displayLoginPrompt() {
    const { storyContainer } = this.getElements();
    if (storyContainer) {
      storyContainer.innerHTML = `<p>Anda harus <a href="#/login">login</a> terlebih dahulu untuk melihat daftar cerita.</p>`;
    }
  }

  displayErrorMessage(message) {
    const { storyContainer } = this.getElements();
    if (storyContainer) {
      storyContainer.innerHTML = `<p>Error: ${message}</p>`;
    }
  }

  // Metode untuk menangani fokus setelah "skip to content"
  focusMainContent() {
    const { mainContent, skipLink } = this.getElements();
    if (!mainContent || !skipLink) return;

    if (!skipLink._focusHandlerAdded) {
      skipLink.addEventListener('click', function (event) {
        event.preventDefault();
        skipLink.blur();
        // Cari button pada story-item paling atas
        const firstButton = mainContent.querySelector('.story-item__view-on-map');
        if (firstButton) {
          firstButton.focus();
        } else {
          mainContent.focus();
        }
        mainContent.scrollIntoView();
      });
      skipLink._focusHandlerAdded = true;
    }
  }

  // The render method for the router to call
  async render() {
    return this.getTemplate();
  }

  // The afterRender method for the router to call, where the presenter is initialized
  async afterRender() {
    const storyModel = new StoryModel(); // Instantiate the StoryModel
    const authModel = AuthModel; // AuthModel is treated as a utility/static class or an instance if it were truly a class
    this.#presenter = new AllStoryPresenter({
      view: this,
      storyModel: storyModel,
      authModel: authModel,
    });
    await this.#presenter.initialize();
  }
}

export default AllStoryView;