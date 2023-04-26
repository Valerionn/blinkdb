import { randFirstName } from "@ngneat/falso";
import { createDB, createTable, insertMany, many } from "blinkdb";
import loki from "lokijs";
import { Bench } from "tinybench";

interface User {
  id: number;
  name: string;
  age?: number;
}

const blinkdb = createDB({ clone: false });
let blinkUserTable = createTable<User>(blinkdb, "users")();

const lokidb = new loki("users.db");
let lokiUserTable = lokidb.addCollection<User>("users", { unique: ["id"] });

let users: User[] = [];
for (let i = 0; i < 10000; i++) {
  users.push({
    id: i,
    name: randFirstName(),
    age: Math.random() > 0.2 ? Math.random() * 40 : undefined,
  });
}

lokiUserTable.insert(users);
insertMany(blinkUserTable, users);

export const bench = new Bench({ iterations: 1 })
  .add("lokijs", () => {
    lokiUserTable.chain().find().simplesort("age");
  })
  .add("blinkdb", async () => {
    await many(blinkUserTable, { sort: { key: "age", order: "desc" } });
  });
