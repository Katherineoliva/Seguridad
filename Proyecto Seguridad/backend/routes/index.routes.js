const { authController } = require('../controllers/auth.controller');
const { userController } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { productController } = require('../controllers/product.controller')

class IndexRoutes {
    routes = [
        { method: 'post', path: '/register', controller: authController.register },
        { method: 'post', path: '/login', controller: authController.login },
        { method: 'get', path: '/user/data', controller: userController.getUserData, middlewares: [authenticate, authorize(['user', 'admin', 'superadmin'])] },
        { method: 'get', path: '/admin/data', controller: userController.getAdminData, middlewares: [authenticate, authorize(['admin', 'superadmin'])] },
        { method: 'get', path: '/superadmin/data', controller: userController.getSuperAdminData, middlewares: [authenticate, authorize(['superadmin'])] },
        { method: 'post', path: '/product', controller: productController.addProduct },
        { method: 'put', path: '/product/:id', controller: productController.updateProduct },
        { method: 'delete', path: '/product/:id', controller: productController.deleteProduct },
        { method: 'get', path: '/products', controller: productController.getAllProducts },
    ]
}

const indexRoutes = new IndexRoutes()
module.exports = { indexRoutes }
