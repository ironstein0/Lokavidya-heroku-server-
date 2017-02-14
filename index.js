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
	masterKey: config.MASTER_KEY
});

var Parse = require('parse/node');
Parse.initialize('app', 'master');

// instantiate express route for parse
var app = express();
app.use('/parse', api);

// start http server
var httpServer = require('http').createServer(app);
httpServer.listen(config.HTTP_SERVER_PORT_NO, function() {
	console.log('parse server running on port ' + config.HTTP_SERVER_PORT_NO);
});

// start parse liveQuery server
ParseServer.createLiveQueryServer(httpServer);
