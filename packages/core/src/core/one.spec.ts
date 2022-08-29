import { create } from "./create";
import { createDB, SyncDB } from "./createDB";
import { SyncTable, table } from "./table";
import { one } from "./one";

interface User {
  id: number;
}

let db: SyncDB;
let userTable: SyncTable<User, "id">;

beforeEach(async () => {
  db = createDB();
  userTable = table<User>(db, "users")();

  await create(userTable, { id: 0 });
  await create(userTable, { id: 1 });
  await create(userTable, { id: 2 });
});

it("should throw if no items have been found", async () => {
  expect(one(userTable, { where: { id: 5 } })).rejects.toThrow(/No items found/);
});

it("should throw if more than one item has been found", async () => {
  expect(one(userTable, { where: { id: { $gt: 0 } } })).rejects.toThrow(/More than one item found/);
});

it("should return the item if found", async () => {
  expect(await one(userTable, { where: { id: 2 } })).toStrictEqual({ id: 2 });
});

it("should return the exact item if db.clone is set to false", async () => {
  db = createDB({
    clone: false
  });
  userTable = table<User>(db, "users")();
  const user = { id: 0 };
  await create(userTable, user);
  const item = await one(userTable, { where: { id: 0 } });

  expect(item).toBe(user);
});
