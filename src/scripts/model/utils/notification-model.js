// src/models/NotificationModel.js

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlfPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

class NotificationModel {
  constructor() {
    this._vapidPublicKey = VAPID_PUBLIC_KEY;
  }

  _getToken() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('Silahkan login dulu');
      window.location.hash = '/login';
    }
    return token;
  }

  async subscribeUserToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Service Worker or Push API not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(this._vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log('Push Subscription:', subscription);
      return await this._sendSubscriptionToBackend(subscription);
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
      throw error;
    }
  }

  async _sendSubscriptionToBackend(subscription) {
    const token = this._getToken();
    if (!token) return;

    const subscribeUrl = 'https://story-api.dicoding.dev/v1/notifications/subscribe';

    const body = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
      },
    };

    try {
      const response = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send subscription to backend');
      }
      console.log('Subscription sent to backend successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
      throw error;
    }
  }

  async unsubscribeUserFromPush() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        const didUnsubscribe = await subscription.unsubscribe();

        if (didUnsubscribe) {
          console.log('User unsubscribed successfully.');
          return await this._sendUnsubscriptionToBackend(endpoint);
        } else {
          throw new Error('Failed to unsubscribe the user from browser.');
        }
      } else {
        console.log('No active push subscription found.');
        return null;
      }
    } catch (error) {
      console.error('Failed to unsubscribe the user: ', error);
      throw error;
    }
  }

  async _sendUnsubscriptionToBackend(endpoint) {
    const token = this._getToken();
    if (!token) return;

    const unsubscribeUrl = 'https://story-api.dicoding.dev/v1/notifications/subscribe';

    const body = {
      endpoint: endpoint,
    };

    try {
      const response = await fetch(unsubscribeUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send unsubscription to backend');
      }
      console.log('Unsubscription sent to backend successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending unsubscription to backend:', error);
      throw error;
    }
  }
}

export default NotificationModel;