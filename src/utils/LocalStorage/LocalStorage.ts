class LocalStorage {
  private static storage = window.localStorage;

  public static set(key: string, value: unknown): void {
    LocalStorage.storage.setItem(key, JSON.stringify(value));
  }

  public static get<T>(key: string): T | null {
    const result = LocalStorage.storage.getItem(key);
    if (result) return JSON.parse(result) as T;
    else return null;
  }

  public static remove(key: string): void {
    LocalStorage.storage.removeItem(key);
  }

  public static clear(): void {
    LocalStorage.storage.clear();
  }
}

export default LocalStorage;
