// src/model/utils/story-database.js
import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const StoryDatabase = {
  async open() {
    return openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  },

  async getAllStories() {
    const db = await this.open();
    return db.getAll(OBJECT_STORE_NAME);
  },

  async putStories(stories) {
    const db = await this.open();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await Promise.all(stories.map(story => store.put(story)));
    return tx.done;
  },

  async clearStories() {
    const db = await this.open();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await store.clear();
    return tx.done;
  },
};

export default StoryDatabase;