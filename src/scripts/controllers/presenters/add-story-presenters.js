// add-story-presenter.js
// No direct imports for AddStoryModel here, it will be injected.
// Assuming AuthModel is accessed directly or also injected for token.
import AuthModel from '../../model/utils/login-model'; // Keep AuthModel import for token access if not injected

class AddStoryPagePresenter {
  #view;
  #addStoryModel;
  #authModel; // Private field for injected AuthModel (optional, if AuthModel is an instance)
  #token;

  constructor({ view, addStoryModel, authModel = AuthModel }) { // Inject AuthModel or default to the imported one
    this.#view = view;
    this.#addStoryModel = addStoryModel; // AddStoryModel (the class) injected
    this.#authModel = authModel; // AuthModel (the class or an instance) injected
    this.#token = localStorage.getItem('authToken');
    this._stream = null;
    this._map = null;
    this._marker = null;
  }

  async initialize() {
    if (!this.#token) {
      this.#view.displayMessage('You need to login first to share a story', 'error');
      this.#view.hideForm();
      setTimeout(() => window.location.href = '#/login', 2000);
      return;
    }

    // Initialize map
    const { map, marker } = this.#view.initMap(
      this._handleMapClick.bind(this),
      this._handleLatLonInputChange.bind(this)
    );
    this._map = map;
    this._marker = marker;

    this.#view.bindFormSubmit(this._handleSubmitStory.bind(this));
    this.#view.bindStartCameraButton(this._handleStartCamera.bind(this));
    this.#view.bindCaptureButton(this._handleCapturePhoto.bind(this));
    this.#view.bindPhotoInputChange(this._handlePhotoInputChange.bind(this));
    this.#view.bindLocationInputChanges(
      () => this._handleLatLonInputChange(
        this.#view.getElements().latInput,
        this.#view.getElements().lonInput,
        this._marker,
        this._map
      ),
      () => this._handleLatLonInputChange(
        this.#view.getElements().latInput,
        this.#view.getElements().lonInput,
        this._marker,
        this._map
      )
    );
  }

  _handleMapClick(lat, lng, currentMarker, currentMap) {
    this._marker = this.#view.updateMapMarker(lat, lng, currentMarker, currentMap);
  }

  _handleLatLonInputChange(latInput, lonInput, currentMarker, currentMap) {
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    if (isNaN(lat) || isNaN(lon)) return;
    this._marker = this.#view.updateMapMarker(lat, lon, currentMarker, currentMap);
    if (currentMap) { // Center map on new marker position
      currentMap.setView([lat, lon], currentMap.getZoom());
    }
  }

  async _handleStartCamera() {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.#view.showCameraPreview(this._stream);
    } catch (err) {
      alert('Unable to access camera: ' + err.message);
    }
  }

  _handleCapturePhoto() {
    if (!this._stream) return;

    const { snapshotCanvas, cameraPreview, photoInput } = this.#view.getElements();
    const context = snapshotCanvas.getContext('2d');
    snapshotCanvas.width = cameraPreview.videoWidth;
    snapshotCanvas.height = cameraPreview.videoHeight;
    context.drawImage(cameraPreview, 0, 0, snapshotCanvas.width, snapshotCanvas.height);

    snapshotCanvas.toBlob((blob) => {
      const file = new File([blob], 'captured.jpeg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      photoInput.files = dataTransfer.files;

      const objectURL = URL.createObjectURL(file);
      this.#view.displayPhotoPreview(objectURL);

      if (this._stream) {
        this._stream.getTracks().forEach(track => track.stop());
        this._stream = null;
      }
      this.#view.hideCameraPreview();
    }, 'image/jpeg', 0.95);
  }

  _handlePhotoInputChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      this.#view.displayPhotoPreview(url);
    }
  }

  async _handleSubmitStory(e) {
    e.preventDefault();
    this.#view.hideMessage();
    this.#view.disableSubmitButton(true);

    const { descriptionInput, photoInput, latInput, lonInput } = this.#view.getElements();

    const photoFile = photoInput.files[0];

    // Use the injected AddStoryModel (the class itself) to call its static method
    if (typeof this.#addStoryModel.isValidImage !== 'function' || !this.#addStoryModel.isValidImage(photoFile)) {
      this.#view.displayMessage('Please upload a valid image (JPEG/PNG/GIF, max 1MB)', 'error');
      this.#view.disableSubmitButton(false);
      return;
    }

    const formData = new FormData();
    formData.append('description', descriptionInput.value);
    formData.append('photo', photoFile);

    if (latInput.value && lonInput.value) {
      formData.append('lat', parseFloat(latInput.value));
      formData.append('lon', parseFloat(lonInput.value));
    }

    try {
      // Use the injected addStoryModel (an instance) to submit the story
      const result = await new this.#addStoryModel().submitStory(formData, this.#token);

      if (result.success) {
        this.#view.displayMessage('Story submitted successfully!', 'success');
        this.#view.resetForm();
        window.location.href = '#/'; // No need for e.preventDefault() here if already handled
      } else {
        this.#view.displayMessage(result.error || 'Failed to submit story', 'error');
      }
    } catch (err) {
      this.#view.displayMessage('An error occurred. Please try again.', 'error');
      console.error(err);
    } finally {
      this.#view.disableSubmitButton(false);
    }
  }
}

export default AddStoryPagePresenter;