import mysql from 'mysql2/promise';

async function updateDb() {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "v&6l6i;NVvED",
    database: "panzarit",
    port: 3306,
  });

  try {
    await pool.query("ALTER TABLE blog_posts ADD COLUMN author_bio TEXT;");
    console.log("Successfully added author_bio column");
  } catch (err: any) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists");
    } else {
      console.error("Error:", err);
    }
  } finally {
    await pool.end();
  }
}

updateDb();
