const mysql = require('mysql2/promise');

async function updateDb() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'u723633107_panzerit',
    password: 'v&6l6i;NVvED',
    database: 'u723633107_panzerit',
    port: 3306
  });

  const tables = [
    'solutions',
    'brands',
    'resources',
    'faqs',
    'solution_feature_cards',
    'solution_extra_cards',
    'brand_extra_cards'
  ];

  for (const table of tables) {
    try {
      console.log(`Updating ${table}.description to LONGTEXT...`);
      await connection.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`description\` LONGTEXT`);
      console.log(`Success for ${table}`);
    } catch (e) {
      console.log(`Error updating ${table}:`, e.message);
    }
  }

  // Also update author_bio if necessary
  try {
    await connection.query(`ALTER TABLE \`blog_posts\` MODIFY COLUMN \`author_bio\` LONGTEXT`);
  } catch (e) {}

  console.log("Database update complete!");
  process.exit(0);
}

updateDb();
