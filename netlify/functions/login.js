// Membutuhkan library `pg` dan `bcryptjs`
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  // Hanya menerima permintaan POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { username, password } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.DATABASE_URL, // Menggunakan variabel lingkungan dari Netlify
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    // Query SQL untuk mencari pengguna berdasarkan username
    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await client.query(query, [username]);

    if (result.rows.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Username atau password salah.' }) };
    }

    const user = result.rows[0];
    // Membandingkan password yang dimasukkan dengan yang di-hash di database
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Username atau password salah.' }) };
    }

    // Jika login berhasil
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login berhasil!', user: user.username }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Login gagal.' }),
    };
  } finally {
    await client.end();
  }
};
