var express = require('express');
var http = require('http');
var path = require('path');
var websocket = require('ws');

var index_route = require('./routes/index');
var mouse = require("./mouse");
var control = require("./control");


var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
if ('development' == app.get('env')) {
    app.use(express.logger('dev'));
}
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/', index_route);

// Create HTTP server for serving statics.
var server = http.createServer(app);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


// Create WebSocket layer for receiving commands.
var wss = new websocket.Server({server: server});

wss.on('connection', function(ws) {
    console.log("Client connected.");
    ws.on("close", function() {
        console.log("Client disconnected");
    });

    // Pass messages from the client to dedicated handler.
    ws.on("message", control);
});


// Initialize mouse module (get access to X11).
mouse.init();

