class LocalStorage {
  public static set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public static get<T>(key: string): T | null {
    const result = localStorage.getItem(key);
    if (result) return JSON.parse(result) as T;
    else return null;
  }

  public static remove(key: string): void {
    localStorage.removeItem(key);
  }

  public static clear(): void {
    localStorage.clear();
  }
}

export default LocalStorage;
