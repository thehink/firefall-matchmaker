var modulesPath = "./nodejs/node_modules/";

var app = require('http'),
  io = require('socket.io'),
  fs = require('fs'),
  static = require('node-static');
  
 var se = {};
 	 se = require("./server/HashMap");
	 se.Player = require("./server/player")(se),
	 se.Queue = require("./server/queue")(se),
	 se.Matchmaker = require("./server/matchmaker")(se),
	 se.Lobby = require("./server/lobby")(se);

  
 se.regions = [
	  "eu-west",
	  "us-west",
	  "us-east"
 ];

 se.maps = require('./maps.json');
 se.flags = require('./flags.json');
 
 se.GetMapInfo = function(map){
	 return se.maps[map];
 }
  
function init(){
	var port = 80;
	var clientFiles = new static.Server('./client/');
	var httpServer = app.createServer(function (req, res) {
		var data = '';
		req.on('data', function(txt){
			data += txt.toString();
		});
		req.on('end', function(){
			if(req.url == '/maps') {
		  		res.writeHead(200, {
				 'Content-Type': 'application/json'
			 });
			 res.end(JSON.stringify(se.Matchmaker.GetInfo()));
			 }else
			 	clientFiles.serve(req, res);
		});
		
	});
	
	httpServer.listen(port);
	io = io.listen(httpServer);
	
	//if(!server.debug)
		io.set('log level', 1);
	
	io.sockets.on('connection', function (socket) {
	  var player = new se.Player(socket);
	  se.Matchmaker.AddPlayer(player);
	  socket.on('player', function(args) { player.SetInfo(args); });
	  socket.on('queue', function(args){ se.Matchmaker.QueueForMap(player, args); });
	  socket.on('vote', function(args){ player.OnVote(args); });
	  socket.on('disconnect', function() { se.Matchmaker.RemovePlayer(player); player.OnDisconnect(); });
	});
	
	se.Matchmaker.CheckForLongWaitTimes();
}

function OnMsgText(data){
  console.log(data);
}

function OnConnect(){
 
}

function OnDisconnect(){
 console.log("Disconnected");
}

init();