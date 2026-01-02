import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface DraftsDB extends DBSchema {
  drafts: {
    key: string;
    value: {
      id: string;
      data: any;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'realtor-app-drafts';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

class DraftService {
  private dbPromise: Promise<IDBPDatabase<DraftsDB>>;

  constructor() {
    this.dbPromise = openDB<DraftsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      },
    });
  }

  async saveDraft(id: string, data: any): Promise<void> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, {
      id,
      data,
      updatedAt: Date.now(),
    });
  }

  async getDraft(id: string): Promise<any | null> {
    const db = await this.dbPromise;
    const result = await db.get(STORE_NAME, id);
    return result ? result.data : null;
  }

  async deleteDraft(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }
}

export const draftService = new DraftService();
