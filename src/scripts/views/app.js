// app.js
import routes from '../controllers/routes/routes';
import { getActiveRoute } from '../controllers/routes/url-parser';

class App {
  constructor({ content }) {
    this._content = content;
  }

  async renderPage() {
    const token = localStorage.getItem('authToken');
    let url = getActiveRoute();
    console.log(url);

    // Logika pengalihan rute berdasarkan status autentikasi
    if (!url || !routes[url]) {
      url = '/login';
      window.location.hash = '/login';
    }

    if (!token && url !== '/register') {
      url = '/login';
      window.location.hash = '/login';
    }

    if (token && url === '/login') {
      url = '/';
      window.location.hash = '/';
    }

    const page = routes[url] || routes['/login'];

    if (!page) {
      // Fallback untuk halaman 404 jika tidak ada rute yang cocok
      if (document.startViewTransition) {
        document.startViewTransition(async () => {
          this._content.innerHTML = '<h2>404 - Halaman tidak ditemukan</h2>';
        });
      } else {
        this._content.innerHTML = '<h2>404 - Halaman tidak ditemukan</h2>';
      }
      return;
    }

    // Mengintegrasikan View Transitions API
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        // Lakukan perubahan DOM di dalam callback ini
        this._content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      // Fallback untuk browser yang tidak mendukung View Transitions
      this._content.innerHTML = await page.render();
      await page.afterRender();
    }
  }

  showNotificationPermissionPrompt() {
    return Notification.requestPermission();
  }

  showNotificationSupportWarning() {
    console.warn('Notifications not supported in this browser.');
  }

  showNotificationPermissionDeniedWarning() {
    console.warn('Notification permission denied.');
  }
}

export default App;