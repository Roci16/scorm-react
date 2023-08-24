const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000', // servidor de Nest 
      changeOrigin: true,
      //Agregar encabezados para permitir CORS y cookies
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000', //  URL de la aplicación React
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  );

//Proxy para las rutas que comienzan con /cursos_files
  app.use(
    '/cursos_files',
    createProxyMiddleware({
      target: 'http://localhost:5000', 
      changeOrigin: true,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  );
};

