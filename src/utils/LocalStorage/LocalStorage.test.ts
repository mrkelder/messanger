import LocalStorage from "./index";

class BrowserLocalStorage {
  private store: { [key: string]: string };

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

interface Item {
  type: string;
  name: string;
}

const ARRAY_LENGTH = 3;
const item: Item = { type: "tool", name: "pickaxe" };

describe("LocalStorage class", () => {
  test("Should set one item", () => {
    LocalStorage.set("item", item);
    expect(LocalStorage.get<Item>("item")).toEqual(item);
  });

  test("Should set a collection of items", () => {
    LocalStorage.set("items", new Array(ARRAY_LENGTH).fill(item));
    const items = LocalStorage.get<Item>("items");

    expect(items).toHaveLength(ARRAY_LENGTH);
    expect(items).toEqual([item, item, item]);
  });

  test("Should remove and return the item", () => {
    LocalStorage.set("item", item);
    expect(LocalStorage.get<Item>("item")).toEqual(item);

    const deletedItem = LocalStorage<Item>("item");
    expect(deletedItem).toEqual(item);
  });

  test("Should clear the localStorage", () => {
    LocalStorage.set("items", new Array(ARRAY_LENGTH).fill(item));
    const items = LocalStorage.get<Item>("items");
    expect(items).toHaveLength(ARRAY_LENGTH);

    LocalStorage.clear();
    expect(LocalStorage.get("items")).toBeNull();
  });
});
