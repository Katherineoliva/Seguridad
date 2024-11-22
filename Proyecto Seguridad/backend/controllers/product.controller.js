class ProductController {
    async addProduct(req, res) {
        const { name, price, image_url } = req.body
        const sellerId = req.user.id 

        if (!name || !price) {
            return res.writeHead(400, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Datos incompletos' }))
        }

        try {
            const [result] = await pool.execute(
                'INSERT INTO products (name, price, image_url, seller_id) VALUES (?, ?, ?, ?)',
                [name, price, image_url || null, sellerId]
            )
            res.writeHead(201, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Producto agregado', productId: result.insertId }))
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Error al agregar el producto' }))
        }
    }

    async updateProduct(req, res) {
        const { id } = req.params
        const { name, price, image_url } = req.body
        const sellerId = req.user.id

        try {
            const [result] = await pool.execute(
                'UPDATE products SET name = ?, price = ?, image_url = ? WHERE id = ? AND seller_id = ?',
                [name, price, image_url, id, sellerId]
            )
            if (result.affectedRows === 0) {
                return res.writeHead(404, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Producto no encontrado o no autorizado' }))
            }
            res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Producto actualizado' }))
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Error al actualizar el producto' }))
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.params
        const sellerId = req.user.id

        try {
            const [result] = await pool.execute('DELETE FROM products WHERE id = ? AND seller_id = ?', [id, sellerId])
            if (result.affectedRows === 0) {
                return res.writeHead(404, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Producto no encontrado o no autorizado' }))
            }
            res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Producto eliminado' }))
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Error al eliminar el producto' }))
        }
    }

    async getAllProducts(req, res) {
        const sellerId = req.user.id

        try {
            const [products] = await pool.execute('SELECT * FROM products WHERE seller_id = ?', [sellerId])
            res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify(products))
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'}).end(JSON.stringify({ msg: 'Error al obtener los productos' }))
        }
    }
}

const productController = new ProductController()
module.exports = { productController }
