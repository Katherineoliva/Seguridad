class Router {
    _routes = []
    _baseURL = 'http://localhost:' + (process.env.PORT || 5000)

    use(url, callback) {
        const _url = new URL(url, this._baseURL).pathname
        let basePath = _url.replace(/^\/+|\/$/g, '')
        
        callback.routes.forEach(route => {
            let method = route.method
            let controller = route.controller
            let path = '/' + basePath
            let params = []

            route.path.split('/').forEach((p, i) => {
                if (p) {
                    let key = p.split(':')[1]
                    if (key) {
                        params[i + 1] = key
                        path += '/([0-9a-zA-Z]+)' 
                    } else {
                        path += '/' + p
                    }
                }
            })
            path = new RegExp(path + '$')
            this._routes.push({ path, method, controller, params })
        })
    }

async route(req, res) {
    const url = new URL(req.url, this._baseURL);
    const method = req.method.toLowerCase();

    const route = await this._routes.find(_route => {
        const methodMatch = _route.method === method;
        const pathMatch = url.pathname.match(_route.path);
        return pathMatch && methodMatch;
    });

    if (route) {
        req.params = await this.getParams(url.pathname, route.params);
        req.query = await this.getQuery(url);
        req.body = "";
        
        req.on('data', chunk => req.body += chunk);
        req.on('end', async () => {
            req.body = req.body ? JSON.parse(req.body) : {};

            // Ejecutar middlewares si existen
            let allowed = true;
            if (route.middlewares) {
                for (const middleware of route.middlewares) {
                    const next = () => (allowed = true);
                    allowed = false;
                    await middleware(req, res, next);
                    if (!allowed) return;
                }
            }

            route.controller(req, res);
        });
    } else {
        this.notFound(res);
    }
}


    notFound(res) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Not Found' }))
    }

    getParams(pathname, params) {
        let objParams = {}
        pathname.split('/').forEach((part, i) => {
            if (params[i + 1]) {
                objParams[params[i + 1]] = part
            }
        })
        return objParams
    }

    getQuery(_url) {
        let query = {}
        for (const name of _url.searchParams.keys()) {
            query[name] = _url.searchParams.get(name)
        }
        return query
    }
}

const router = new Router()
module.exports = { router }
