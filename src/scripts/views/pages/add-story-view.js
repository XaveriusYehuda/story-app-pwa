// add-story-views.js
import '../../../styles/add-story.css';
import AddStoryPagePresenter from '../../controllers/presenters/add-story-presenters'; // Import the Presenter
import AddStoryModel from '../../model/utils/add-story-model'; // Import the AddStoryModel (class)
import AuthModel from '../../model/utils/login-model'; // Import AuthModel for injection

class AddStoryPageView {
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

      <main id="alien" class="story-container">
        <h1>Share Your Story</h1>
        <form id="storyForm" enctype="multipart/form-data">
          <section class="form-group">
            <label for="description">Story Description</label>
            <textarea id="description" name="description" rows="4" required></textarea>
          </section>

          <section class="form-group">
            <label>Take a Photo or Upload</label>
            <div class="camera-section">
              <video id="cameraPreview" autoplay playsinline style="display: none; width: 100%; max-height: 250px;"></video>
              <button type="button" id="startCameraBtn" class="captureBtn">Start Camera</button>
              <button type="button" id="captureBtn" class="captureBtn">Capture</button>
              <canvas id="snapshotCanvas" style="display: none;"></canvas>
            </div>

            <div id="asep2" class="form-group">
              <label for="photo">Or Upload Photo (Max 1MB)</label>
              <input type="file" id="photo" name="photo" accept="image/*">
              <div class="file-hint">Accepted formats: JPEG, PNG, GIF</div>
              <img id="photo-preview" style="max-width: 100%; margin-top: 10px; display: none;" />
            </div>
          </section>

          <section class="location-group">
            <h3>Location (Optional)</h3>
            <div class="form-row">
              <div class="form-group half-width">
                <label for="lat">Latitude</label>
                <input type="number" id="lat" name="lat" step="any" placeholder="e.g., -6.2088">
              </div>
              <div class="form-group half-width">
                <label for="lon">Longitude</label>
                <input type="number" id="lon" name="lon" step="any" placeholder="e.g., 106.8456">
              </div>
            </div>
            <div class="map-container" style="margin-top: 10px; margin-bottom: 10px; margin-right: 10px; margin-left: 10px;">
              <div id="map-picker"></div>
            </div>
          </section>

          <button type="submit" id="submitBtn">Submit Story</button>
        </form>

        <section id="message" class="message"></section>
      </main>
    `;
  }

  getElements() {
    return {
      storyForm: document.getElementById('storyForm'),
      descriptionInput: document.getElementById('description'),
      photoInput: document.getElementById('photo'),
      latInput: document.getElementById('lat'),
      lonInput: document.getElementById('lon'),
      messageDiv: document.getElementById('message'),
      submitBtn: document.getElementById('submitBtn'),
      mapPicker: document.getElementById('map-picker'),
      cameraPreview: document.getElementById('cameraPreview'),
      startCameraBtn: document.getElementById('startCameraBtn'),
      captureBtn: document.getElementById('captureBtn'),
      snapshotCanvas: document.getElementById('snapshotCanvas'),
      photoPreview: document.getElementById('photo-preview'),
    };
  }

  bindFormSubmit(handler) {
    const { storyForm } = this.getElements();
    if (storyForm) {
      storyForm.addEventListener('submit', handler);
    }
  }

  bindStartCameraButton(handler) {
    const { startCameraBtn } = this.getElements();
    if (startCameraBtn) {
      startCameraBtn.addEventListener('click', handler);
    }
  }

  bindCaptureButton(handler) {
    const { captureBtn } = this.getElements();
    if (captureBtn) {
      captureBtn.addEventListener('click', handler);
    }
  }

  bindPhotoInputChange(handler) {
    const { photoInput } = this.getElements();
    if (photoInput) {
      photoInput.addEventListener('change', handler);
    }
  }

  bindLocationInputChanges(latHandler, lonHandler) {
    const { latInput, lonInput } = this.getElements();
    if (latInput) latInput.addEventListener('change', latHandler);
    if (lonInput) lonInput.addEventListener('change', lonHandler);
  }

  displayMessage(message, type) {
    const { messageDiv } = this.getElements();
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `message ${type}`;
      messageDiv.style.display = 'block';
    }
  }

  hideMessage() {
    const { messageDiv } = this.getElements();
    if (messageDiv) {
      messageDiv.style.display = 'none';
    }
  }

  disableSubmitButton(disable) {
    const { submitBtn } = this.getElements();
    if (submitBtn) {
      submitBtn.disabled = disable;
      submitBtn.textContent = disable ? 'Submitting...' : 'Submit Story';
    }
  }

  hideForm() {
    const { storyForm } = this.getElements();
    if (storyForm) {
      storyForm.style.display = 'none';
    }
  }

  showCameraPreview(stream) {
    const { cameraPreview, captureBtn } = this.getElements();
    if (cameraPreview) {
      cameraPreview.srcObject = stream;
      cameraPreview.style.display = "";
    }
    if (captureBtn) {
      captureBtn.disabled = false;
    }
  }

  hideCameraPreview() {
    const { cameraPreview, captureBtn } = this.getElements();
    if (cameraPreview) {
      cameraPreview.srcObject = null;
      cameraPreview.style.display = 'none';
    }
    if (captureBtn) {
      captureBtn.disabled = true;
    }
  }

  displayPhotoPreview(url) {
    const { photoPreview } = this.getElements();
    if (photoPreview) {
      photoPreview.src = url;
      photoPreview.style.display = 'block';
    }
  }

  hidePhotoPreview() {
    const { photoPreview } = this.getElements();
    if (photoPreview) {
      photoPreview.src = '';
      photoPreview.style.display = 'none';
    }
  }

  resetForm() {
    const { storyForm } = this.getElements();
    if (storyForm) {
      storyForm.reset();
    }
    this.hidePhotoPreview();
    this.hideCameraPreview();
  }

  // Map related methods
  initMap(onMapClick, onLatLonInputChange) {
    const { mapPicker, latInput, lonInput } = this.getElements();
    let map, marker;

    if (window.L && mapPicker) {
      mapPicker.style.width = '100%';
      mapPicker.style.height = '400px';
      mapPicker.style.position = 'relative';

      const semarangCoor = [-7.12, 110.4225];

      map = L.map('map-picker', { // Assign to the 'map' variable here
        zoom: 12,
        center: semarangCoor,
      });

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 5,
        maxZoom: 10,
      }).addTo(map);

      if (!('geolocation' in navigator)) {
        console.error('Geolocation tidak didukung oleh browser ini.');
      }

      // Initialize marker here, without adding to map yet
      marker = L.marker(semarangCoor); // Start with a default marker position

      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        map.setView([latitude, longitude], 15);
        
        // Update marker position and add to map if not already
        this.updateMapMarker(latitude, longitude, marker, map);
        latInput.value = latitude.toFixed(5);
        lonInput.value = longitude.toFixed(5);

      }, (error) => {
        console.error('Error getting current position:', error);
        // If geolocation fails, still add the default marker
        marker.addTo(map);
        marker.bindPopup('Default Location (Semarang)').openPopup();
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        latInput.value = lat.toFixed(5);
        lonInput.value = lng.toFixed(5);
        onMapClick(lat, lng, marker, map); // Pass marker and map for direct manipulation in presenter
      });

      // Pass map and marker for update from input in presenter
      onLatLonInputChange(latInput, lonInput, marker, map);
    }
    return { map, marker };
  }

  updateMapMarker(lat, lon, marker, map) {
    const latlng = [lat, lon];
    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = window.L.marker(latlng); // Create marker if it doesn't exist
    }
    marker.addTo(map);
    marker.bindPopup(`Latitude: ${lat}, Longitude: ${lon}`).openPopup();
    return marker; // Return updated marker
  }

  // New render method for router interaction
  async render() {
    return this.getTemplate();
  }

  // New afterRender method for router interaction, where the presenter is initialized
  async afterRender() {
    // Pass AddStoryModel (the class itself) to the presenter, so it can call static methods like isValidImage
    this.#presenter = new AddStoryPagePresenter({
      view: this,
      addStoryModel: AddStoryModel, // Pass the class
      authModel: AuthModel // Pass the AuthModel class/utility
    });
    await this.#presenter.initialize();
  }
}

export default AddStoryPageView;