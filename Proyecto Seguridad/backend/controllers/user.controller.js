// controllers/user.controller.js
const pool = require('../lib/database.js');


class UserController {
    async getUserData(req, res) {
        try {
            const { userId } = req.user; // asumiendo que ya está autenticado y req.user contiene la información del usuario
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
            const userData = rows[0];

            if (!userData) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ msg: 'Usuario no encontrado' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data: userData }));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ msg: 'Error en el servidor' }));
        }
    }
}

const userController = new UserController();
module.exports = { userController };
