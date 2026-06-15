const mysql = require('mysql2/promise');

async function test() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'panzar'
    });

    console.log("Testing connection...");
    const connection = await pool.getConnection();
    console.log("Connected successfully!");

    console.log("Testing queries...");
    const [rows] = await connection.query('SELECT * FROM solutions');
    console.log("Solutions:", rows);

    connection.release();
    pool.end();
  } catch (err) {
    console.error("DB Error:", err);
  }
}

test();
