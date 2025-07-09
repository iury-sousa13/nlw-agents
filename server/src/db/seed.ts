import { reset, seed } from "drizzle-seed";
import { db, sql } from "./connection";
import { schema } from "./schema";

await reset(db, schema);
await seed(db, schema).refine((func) => {
	return {
		rooms: {
			count: 20,
			columns: {
				name: func.companyName(),
				description: func.loremIpsum(),
			},
		},
	};
});

await sql.end();

console.log("database seeded!");
