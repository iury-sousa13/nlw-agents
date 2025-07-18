import { reset, seed } from 'drizzle-seed';
import { db, sql } from './connection';
import { schema } from './schema';

await reset(db, schema);
await seed(db, schema).refine((func) => {
  return {
    rooms: {
      count: 5,
      columns: {
        name: func.companyName(),
        description: func.loremIpsum(),
      },
    },
    questions: {
      count: 20,
    },
  };
});

await sql.end();

// biome-ignore lint/suspicious/noConsole: <explanation> ignore console
console.log('database seeded!');
