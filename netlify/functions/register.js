// Membutuhkan library `pg` dan `bcryptjs`
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  // Hanya menerima permintaan POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { username, email, password } = JSON.parse(event.body);

  // Enkripsi password sebelum disimpan (wajib untuk keamanan)
  const hashedPassword = await bcrypt.hash(password, 10);

  const client = new Client({
    connectionString: process.env.DATABASE_URL, // Menggunakan variabel lingkungan dari Netlify
    ssl: { rejectUnauthorized: false } // Diperlukan untuk koneksi ke Neon
  });

  try {
    await client.connect();
    // Query SQL untuk menyimpan data pengguna baru ke tabel 'users'
    const query = `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)`;
    await client.query(query, [username, email, hashedPassword]);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Registrasi berhasil! Silakan login.' }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Registrasi gagal. Coba username atau email lain.' }),
    };
  } finally {
    await client.end();
  }
};
