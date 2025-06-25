// src/presenters/NotificationPresenter.js

// Tidak ada import langsung untuk NotificationModel lagi
class NotificationPresenter {
  #view;
  #notificationModel; // Tambahkan private field untuk model

  constructor({ view, notificationModel }) { // Terima notificationModel sebagai argumen
    this.#view = view;
    this.#notificationModel = notificationModel; // Inisialisasi model
  }

  async initializeNotifications() {
    if ('Notification' in window) {
      try {
        console.log('Requesting notification permission...');
        const permission = await this.#view.showNotificationPermissionPrompt();
        
        if (permission === 'granted') {
          console.log('Permission granted, checking existing subscription...');
          const registration = await navigator.serviceWorker.ready;
          const currentSubscription = await registration.pushManager.getSubscription();

          if (currentSubscription) {
            console.log('Existing subscription found:', currentSubscription);
            try {
              await this.#notificationModel.unsubscribeUserFromPush();
              console.log('Successfully unsubscribed from previous subscription');
            } catch (unsubscribeError) {
              console.warn('Unsubscription error:', unsubscribeError);
            }
          }

          console.log('Attempting to subscribe...');
          const newSubscription = await this.#notificationModel.subscribeUserToPush();
          console.log('New subscription created:', newSubscription);
        } else {
          console.log('Permission denied:', permission);
          this.#view.showNotificationPermissionDeniedWarning();
        }
      } catch (error) {
        console.error('Notification initialization error:', error);
      }
    } else {
      console.log('Notifications not supported');
      this.#view.showNotificationSupportWarning();
    }
  }

  async handleUnsubscribeClick() {
    try {
      await this.#notificationModel.unsubscribeUserFromPush(); // Gunakan model yang di-inject
    } catch (error) {
      console.error('Error during unsubscription:', error);
    }
  }

  async checkSubscriptionStatus() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }
}

export default NotificationPresenter;