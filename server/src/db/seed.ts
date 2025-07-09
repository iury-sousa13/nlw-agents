import { reset, seed } from "drizzle-seed";
import { db, sql } from "./connection";
import { schema } from "./schema";

await reset(db, { schema });
await seed(db, { schema });

await sql.end();

console.log("database seeded!");
