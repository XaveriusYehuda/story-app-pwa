// src/model/utils/detail-story-database.js
import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1; // Pastikan versi database sama atau lebih tinggi jika sudah ada
const OBJECT_STORE_NAME = 'stories'; // Nama object store baru untuk detail cerita

const DetailStoryDatabase = {
  async open() {
    return openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        }
        // Pastikan juga object store 'stories' ada jika belum
        if (!db.objectStoreNames.contains('stories')) {
          db.createObjectStore('stories', { keyPath: 'id' });
        }
      },
    });
  },

  

  async putStoryDetail(story) {
    const db = await this.open();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await store.put(story);
    return tx.done;
  },

  async clearDetailStories() {
    const db = await this.open();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await store.clear();
    return tx.done;
  },
};

export default DetailStoryDatabase;