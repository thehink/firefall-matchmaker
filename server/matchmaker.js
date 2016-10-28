module.exports = (function(se){
var Matchmaker = {
	players: [],
	queues: {},
	lobbies: {},
};

Matchmaker.GetMapInfo = function(map){
	
};

Matchmaker.GetInfo = function(){
	var data = {
		maps: se.maps,
		flags: se.flags,
		connected: se.Matchmaker.players.length,
	};
	return se.maps;
};

Matchmaker.AddPlayer = function(player){
	Matchmaker.players.push(player);
}

Matchmaker.RemovePlayer = function(player){
	for (var i = Matchmaker.players.length - 1; i > -1; i--){
		if(this.players[i] == player){
			Matchmaker.players.splice(i, 1);
		}
	}
}

Matchmaker.RemoveLobby = function(lobby){
	if(se.Matchmaker.lobbies[lobby.name]){
		delete se.Matchmaker.lobbies[lobby.name];
	}
}

Matchmaker.CheckForLongWaitTimes = function(){
	var time = Date.now();
	for (var i = Matchmaker.players.length - 1; i > -1; i--){
		var player = Matchmaker.players[i];
		if(player.queueTime > 0){
			var deltaT = time - player.queueTime;
			if(deltaT > 1000 && !player.lobby){
				var maxPlayers = 0;
				var popPlayers = null;
				var queueMax = null;
				
				for (var j = 0; j < player.queues.length; ++j){
					var queue = player.queues[j];
					var players = queue.GetNextPossiblePop(player);
					if(!popPlayers || popPlayers.length < players.length){
						popPlayers = players;
						queueMax = queue;
					}
				}
				
				if(popPlayers && popPlayers.length > 1){
					var lobby = Matchmaker.lobbies[queueMax.name];
					if(!lobby){
						lobby = Matchmaker.lobbies[queueMax.name] = new se.Lobby({
							name: queueMax.name,
							mapInfo: queueMax.mapInfo,
							flag: queueMax.flag,
						});
					}
					lobby.AddPlayers(popPlayers);
					lobby.VotePop(30);
				}
				
			}
		}
		
	}
	setTimeout(Matchmaker.CheckForLongWaitTimes, 5000);
	//console.log("Check for wait times");
}

Matchmaker.UnQueue = function(player){
	se.Matchmaker.UpdateQueues(player.queues);
	player.UnQueue();
}

Matchmaker.UpdateQueues = function(queues){
	var added = {};
	for(var i = 0; i < queues.length; ++i){
		queues[i].QueueUpdate();
	}
}

Matchmaker.QueueForMap = function(player, options){
	if(!options || !options.maps || !options.players || !options.preferred_regions){
		player.Disconnect();
		return;
	};
	console.log("Queued: " + player.name, options.players);
	
	options.preferred_regions = options.preferred_regions || [];
	
	player.UnQueue();
	player.SetQueueInfo(options);
	player.inQueue = true;
	
	for(var h in options.preferred_regions){
		var region = options.preferred_regions[h];
		for (var i in options.maps){
			var map = options.maps[i];
			var mapInfo = se.GetMapInfo(map.map);
			if(!mapInfo){
				player.Disconnect();
				return;
			};
			
			if(map.flags.length == 0){
				map.flags[0] = 1;
			}
			for (var j in map.flags){
				var flag = map.flags[j];
				var queueId = region + '_' + map.map+'_'+flag;
				
				var addedToLobby = false;
				
				if(Matchmaker.lobbies[queueId] && Matchmaker.lobbies[queueId].size + options.players <= 5){
					console.log("Adding to existing lobby!");
					var lobby = Matchmaker.lobbies[queueId];
					
					if(lobby.size + options.players <= 3){
						addedToLobby = true;	
						lobby.AddPlayer(player);
						if(lobby.size == 3)
							lobby.Pop();
					}
				}
				if(!addedToLobby){
					if(!Matchmaker.queues[queueId]){
						Matchmaker.queues[queueId] = new se.Queue({
							name: queueId,
							map: map.map,
							region: region,
							flag: flag,
						});
					}
					Matchmaker.queues[queueId]._AddPlayer(player);
				}
			}
		}
	}
	Matchmaker.UpdateQueues(player.queues);
}
	
	
	return Matchmaker;
});