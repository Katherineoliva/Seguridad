const pool = require('../lib/database.js');

async function authenticate(req, res, next) {
    const sessionId = req.headers.cookie?.split('sessionId=')[1];

    if (!sessionId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ msg: 'No autenticado' }));
        return;
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE session_id = ?', [sessionId]);
    const user = rows[0];

    if (!user) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ msg: 'Sesión inválida o expirada' }));
        return;
    }

    req.user = user; 
    next();
}

function authorize(roles = []) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ msg: 'No autorizado' }));
            return;
        }
        next();
    };
}

module.exports = { authenticate, authorize };
