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
        const permission = await this.#view.showNotificationPermissionPrompt();
        if (permission === 'granted') {
          // Langkah 1: Periksa dan hapus langganan yang ada jika applicationServerKey berbeda
          const registration = await navigator.serviceWorker.ready;
          const currentSubscription = await registration.pushManager.getSubscription();

          if (currentSubscription) {
            // Periksa apakah applicationServerKey saat ini cocok dengan yang diinginkan
            // Ini bisa agak tricky karena kita tidak bisa langsung membandingkan kunci
            // Jadi, pendekatan paling aman adalah selalu mencoba unsubscribe jika ada subscription.
            console.log('Existing push subscription found. Attempting to clear it for re-subscription.');
            try {
              await this.#notificationModel.unsubscribeUserFromPush(); // Panggil unsubscribe dari model
              console.log('Previous subscription successfully unsubscribed.');
            } catch (unsubscribeError) {
              console.warn('Failed to unsubscribe previous subscription, it might not exist on backend or other issue:', unsubscribeError);
              // Lanjutkan saja, mungkin masalahnya hanya di frontend
            }
          }

          // Langkah 2: Buat langganan baru
          await this.#notificationModel.subscribeUserToPush();
          console.log('Successfully subscribed for push notifications.');

        } else {
          this.#view.showNotificationPermissionDeniedWarning();
        }
      } catch (error) {
        console.error('Error during notification initialization:', error);
        // Anda mungkin ingin menampilkan pesan error ke pengguna melalui view di sini
      }
    } else {
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