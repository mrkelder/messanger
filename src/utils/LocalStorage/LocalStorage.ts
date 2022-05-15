class LocalStorage {
  private static storage = window.localStorage;

  public static set(key: string, value: unknown): void {
    LocalStorage.storage.setItem(key, String(value));
  }

  public static get<T>(key: string): T | null {
    return LocalStorage.storage.getItem(key) as T | null;
  }

  public static remove(key: string): void {
    LocalStorage.storage.removeItem(key);
  }

  public static clear(): void {
    LocalStorage.storage.clear();
  }
}

export default LocalStorage;
