const pool = require('../lib/database.js');
const bcrypt = require('bcrypt');

class AuthController {
    async register(req, res) {
        try {
            const { username, password, role = 'user' } = req.body; // Asigna 'user' como valor predeterminado para role

            if (!username || !password || !['user', 'admin', 'superadmin'].includes(role)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ msg: 'Datos incompletos o rol inválido' }));
                return;
            }

            const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
            if (rows.length > 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ msg: 'Usuario ya existe' }));
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ msg: 'Usuario registrado exitosamente' }));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ msg: 'Error en el servidor' }));
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ msg: 'Username y password son requeridos' }));
                return;
            }

            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            const user = rows[0];

            if (!user || !(await bcrypt.compare(password, user.password))) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ msg: 'Credenciales incorrectas' }));
                return;
            }

            const sessionId = Date.now() + user.id;
            await pool.query('UPDATE users SET session_id = ? WHERE id = ?', [sessionId, user.id]);

            res.writeHead(200, { 
                'Content-Type': 'application/json', 
                'Set-Cookie': `sessionId=${sessionId}; HttpOnly` 
            });
            res.end(JSON.stringify({ msg: 'Login exitoso', role: user.role }));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ msg: 'Error en el servidor' }));
        }
    }
}

const authController = new AuthController();
module.exports = { authController };
