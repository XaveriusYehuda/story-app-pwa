// detail-story-views.js
import '../../../styles/story-detail.css';
import DetailStoryPagePresenter from '../../controllers/presenters/detail-story-presenters'; // Import the Presenter
import DetailStoryModel from '../../model/utils/detail-story-model'; // Import the Model
import AuthModel from '../../model/utils/login-model'; // Import AuthModel for injection (if needed by presenter)
import getIdFromRoutes from '../../controllers/routes/url-parser'; // Import getIdFromRoutes

class DetailStoryPageView {
  #presenter;

  getTemplate() {
    return `
      <header>
        <div class="header-content">
          <a href="/" class="back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Stories
          </a>
          <div id="userInfo"></div>
        </div>
      </header>

      <main id="asep">
        <div id="loading" class="loading">Loading story details...</div>
        <div id="error" class="error-message" style="display: none;"></div>

        <section id="storyContainer" class="story-container" style="display: none;">
          <img id="storyImage" class="story-image" src="" alt="Story Image">
          <div class="story-content">
            <div class="story-header">
              <h1 id="storyTitle" class="story-title"></h1>
              <div id="storyDate" class="story-date"></div>
            </div>
            <p id="storyDescription" class="story-description"></p>
            <div id="storyLocation" class="story-location" style="display: none;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span id="locationText"></span>
            </div>
            <div id="mapContainer" class="map-container" style="display: none;"></div>
          </div>
        </section>
      </main>
    `;
  }

  getElements() {
    return {
      loadingElement: document.getElementById('loading'),
      errorElement: document.getElementById('error'),
      storyContainer: document.getElementById('storyContainer'),
      storyImage: document.getElementById('storyImage'),
      storyTitle: document.getElementById('storyTitle'),
      storyDate: document.getElementById('storyDate'),
      storyDescription: document.getElementById('storyDescription'),
      storyLocation: document.getElementById('storyLocation'),
      locationText: document.getElementById('locationText'),
      mapContainer: document.getElementById('mapContainer'),
      userInfo: document.getElementById('userInfo'),
      backButton: document.querySelector('.back-button'),
    };
  }

  bindBackButton(handler) {
    const { backButton } = this.getElements();
    if (backButton) {
      backButton.addEventListener('click', handler);
    }
  }

  showLoading() {
    const { loadingElement, errorElement, storyContainer } = this.getElements();
    if (loadingElement) loadingElement.style.display = 'block';
    if (errorElement) errorElement.style.display = 'none';
    if (storyContainer) storyContainer.style.display = 'none';
  }

  hideLoading() {
    const { loadingElement } = this.getElements();
    if (loadingElement) loadingElement.style.display = 'none';
  }

  showError(message) {
    const { errorElement, storyContainer } = this.getElements();
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    if (storyContainer) storyContainer.style.display = 'none';
  }

  displayStory(story) {
    const {
      storyImage, storyTitle, storyDescription, storyDate,
      storyLocation, locationText, mapContainer, userInfo, storyContainer
    } = this.getElements();

    if (storyImage) {
      storyImage.src = story.photoUrl;
      storyImage.alt = `${story.name}'s story`;
    }
    if (storyTitle) storyTitle.textContent = story.name;
    if (storyDescription) storyDescription.textContent = story.description;

    const date = new Date(story.createdAt);
    if (storyDate) {
      storyDate.textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (story.lat && story.lon) {
      if (storyLocation) storyLocation.style.display = 'flex';
      if (locationText) locationText.textContent = `Lat: ${story.lat.toFixed(4)}, Lon: ${story.lon.toFixed(4)}`;
      this.initializeMap(story.lat, story.lon);
    } else {
      if (storyLocation) storyLocation.style.display = 'none';
      if (mapContainer) mapContainer.style.display = 'none';
    }

    const userName = localStorage.getItem('userName');
    if (userName && userInfo) {
      userInfo.textContent = `Hello, ${userName}`;
    }

    if (storyContainer) storyContainer.style.display = 'block';
  }

  initializeMap(lat, lon) {
    const { mapContainer } = this.getElements();
    if (!mapContainer || !window.L) {
      console.warn('Leaflet or container missing.');
      return;
    }

    mapContainer.style.display = 'block';
    mapContainer.innerHTML = `<div id="map" style="height: 400px; width: 100%; position: relative;"></div>`;

    const userLocation = [lat, lon];
    const map = L.map('map', {
      center: userLocation,
      zoom: 15,
      zoomControl: false, // Optional: hide zoom buttons for cleaner center
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      minZoom: 5,
      maxZoom: 18,
    }).addTo(map);

    // Tambahkan marker di tengah peta
    const marker = L.marker(map.getCenter()).addTo(map);
    marker.bindPopup(`Location of the story:<br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`).openPopup();

    // Responsif terhadap resize agar marker tetap di tengah kontainer
    setTimeout(() => {
      map.invalidateSize();
      map.setView(userLocation); // pastikan center tetap
    }, 200);

    // Tambahan interaktivitas klik map jika diperlukan (tidak wajib)
    const popup = L.popup();
    map.on('click', (e) => {
      popup
        .setLatLng(e.latlng)
        .setContent(`You clicked at Lat: ${e.latlng.lat.toFixed(4)}, Lon: ${e.latlng.lng.toFixed(4)}`)
        .openOn(map);
    });
  }


  // New render method for router interaction
  async render() {
    return this.getTemplate();
  }

  // New afterRender method for router interaction, where the presenter is initialized
  async afterRender() {
    const detailStoryModel = new DetailStoryModel(); // Instantiate the DetailStoryModel
    const authModel = AuthModel; // AuthModel class/utility
    const urlParser = getIdFromRoutes; // The function to parse URL for ID

    this.#presenter = new DetailStoryPagePresenter({
      view: this,
      detailStoryModel: detailStoryModel,
      authModel: authModel,
      urlParser: urlParser,
    });
    await this.#presenter.initialize();
  }
}

export default DetailStoryPageView;