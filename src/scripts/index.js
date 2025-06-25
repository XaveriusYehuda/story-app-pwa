// index.js
// CSS imports
import '../styles/styles.css';

import App from './views/app';

import NotificationModel from './model/utils/notification-model'; 
import NotificationPresenter from './controllers/presenters/notification-presenter';

document.addEventListener('DOMContentLoaded', async () => {

  const app = new App({
    content: document.querySelector('#main-content'),
  });

  const notificationModel = new NotificationModel(); // Buat instance NotificationModel
  const notificationPresenter = new NotificationPresenter({
    view: app,
    notificationModel: notificationModel, // Inject NotificationModel ke presenter
  });

  await notificationPresenter.initializeNotifications();

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
  
});