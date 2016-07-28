 var host = process.env.PORT || 'localhost';
 var port = process.env.PORT || 3001;

var cors_proxy = require('./lib/cors-anywhere');
cors_proxy.createServer({
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});
