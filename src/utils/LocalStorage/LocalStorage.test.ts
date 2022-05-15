import LocalStorage from "./index";

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

    LocalStorage.remove("item");
    expect(LocalStorage.get<Item>("item")).toBeNull();
  });

  test("Should clear the localStorage", () => {
    LocalStorage.set("items", new Array(ARRAY_LENGTH).fill(item));
    const items = LocalStorage.get<Item>("items");
    expect(items).toHaveLength(ARRAY_LENGTH);

    LocalStorage.clear();
    expect(LocalStorage.get("items")).toBeNull();
  });
});
