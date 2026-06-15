const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'panzar'
  });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const id = `s${Date.now()}`;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const slug = 'test-solution-slug';

    await connection.query(
      `INSERT INTO solutions (id, title, subtitle, description, category, image, image_alt, logo, logo_alt, slug, sort_order, status, meta_title, meta_description, meta_keywords, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, 'Test Solution', 'Subtitle', 'Desc', 'Security', '', '', '', '', slug, 1, 'active', '', '', '', createdAt]
    );

    console.log("Successfully inserted into solutions.");

    // feature cards
    const fcId = `fc${Date.now()}`;
    await connection.query(
      `INSERT INTO solution_feature_cards (id, solution_id, icon, image, image_alt, title, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fcId, id, 'icon', '', '', 'FC Title', 'FC Desc']
    );

    console.log("Successfully inserted feature cards.");

    await connection.commit();
    console.log("Commit successful.");
  } catch (err) {
    await connection.rollback();
    console.error("SQL Error during insertion:", err);
  } finally {
    connection.release();
    pool.end();
  }
}

test();
