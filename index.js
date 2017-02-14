var fs = require('fs');
var path = require('path');
var ParseServer = require('parse-server').ParseServer;
var express = require('express');

var serverConfigDir = path.join(__dirname);
var data = fs.readFileSync(path.join(serverConfigDir, 'config.json'));
var config;

try {
	config = JSON.parse(data);
} catch (err) {
	console.log('config.json is corrputed')
	throw(err);
}

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var api = new ParseServer({
	databaseURI: config.MONGO_DB_URL,
	cloud: config.CLOUD_URL,
	appId: config.APP_ID,
	masterKey: config.MASTER_KEY,
	serverURL: config.SERVER_URL + '/' + config.HTTP_SERVER_PORT_NO + '/parse'
});

var Parse = require('parse/node');
Parse.initialize('app', 'master');

// instantiate express
var app = express();

// Heroku dynamically assigns your app a port, so you can't set the port 
// to a fixed number. Heroku adds the port to the env, so you can pull it from there.
app.set('port', (process.env.PORT || 5000));

// default route
app.get('/', (req, res) => {
	console.log('request on default route');
	res.sendFile(path.join(__dirname, 'index.html'));
});

// instantiate express route for parse
app.use('/parse', api);

// start http server
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', config.HTTP_SERVER_PORT_NO);
});
