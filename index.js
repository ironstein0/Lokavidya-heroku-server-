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

// Heroku dynamically assigns your app a port, so you can't set the port 
// to a fixed number. Heroku adds the port to the env, so you can pull it from there.
var port = process.env.PORT || 5000;
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
var cloudUri = process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js';
var appId = process.env.APP_ID || config.APP_ID;
var masterKey = process.env.masterKey || config.MASTER_KEY;
var serverUrl = process.env.SERVER_URL || 'http://localhost:' + port + '/parse';

if (!databaseUri) {
  throw new Error('DATABASE_URI not specified');
}

// generate parse-server middleware
var api = new ParseServer({
	databaseURI: databaseUri,
	cloud: cloudUri
	appId: appId,
	masterKey: masterKey,
	serverURL: serverUrl,
	liveQuery: {
		classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
	}
});

// initialize parse
var Parse = require('parse/node');
Parse.initialize('app', 'master');

// instantiate express
var app = express();
app.set('port', port);

// default route
app.get('/', (req, res) => {
	console.log('request on default route');
	res.sendFile(path.join(__dirname, 'index.html'));
});

// instantiate express route for parse
app.use('/parse', api);

// start http server
app.listen(port, function() {
  console.log('Node app is running on port' + port);
});
