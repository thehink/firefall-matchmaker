module.exports = (function(se){
	
var Queue = function(info){
	this.name = info.name || "";
	this.map = info.map;
	this.region = "";
	this.mapInfo = se.GetMapInfo(info.map);
	this.flag = info.flag;
	this.pop_min = 2;
	this.pop_size = 3;
	this.size = 0;
	this.players = [];
}

Queue.prototype._AddPlayer = function(player){
	this.size += player.queueInfo.players;
	this.players.push(player);
	player.OnAddToQueue(this);
}

Queue.prototype.AddPlayer = function(player){
	this._AddPlayer(player);
	this.QueueUpdate();
}

Queue.prototype.AddPlayers = function(players){
	for(var i = 0; i < players.length; ++i)
		this._AddPlayer(players[i]);
	this.QueueUpdate();
}

Queue.prototype._RemovePlayer = function(player){
	var removed = false;
	for (var i = this.players.length - 1; i > -1; i--){
		if(this.players[i] == player){
			this.players.splice(i, 1);
			removed = true;
			player.OnRemoveFromQueue(this);
			this.size -= player.queueInfo.players;
		}
	}
	return removed;
}

Queue.prototype.RemovePlayer = function(player){
	if(this._RemovePlayer(player))
		this.QueueUpdate();
}

Queue.prototype.PopQueue = function(players){
	var lobby = new se.Lobby({
		mapInfo: this.mapInfo,
		flag: this.flag,
	});
	lobby.AddPlayers(players);
	lobby.Pop();
	this.QueueUpdate();
}

Queue.prototype.GetPlayers = function(){
	return this.players;
}

Queue.prototype.GetPlayersCount = function(){
	return this.players.length;
}

Queue.prototype.GetNextPossiblePop = function(pl){
	var players = [];
	var numPlayers = 0;
	var foundLeader = false;
	var gotRegionLeader = false;
	
	if(pl && pl.queueInfo.players > 1){
		foundLeader = true;
		players.push(pl);
		numPlayers += pl.queueInfo.players;
	}else if(pl){
		players.push(pl);
		numPlayers += 1;
	}
	
	for(var i = 0; i < this.players.length; i++){
		var player = this.players[i];
		if(!player.connected){
			this._RemovePlayer(player);
			continue;
		}
		
		if(pl == player) continue;
		
		if(player.queueInfo.players > 1 && !foundLeader && this.region == player.queueInfo.region){
			numPlayers +=  player.queueInfo.players;
			players.unshift(player);
			foundLeader = true;
			gotRegionLeader = true;
		}else if(player.queueInfo.players > 1){
			continue;
		}else if((players.length < this.pop_size && players.length < this.players.length) || gotRegionLeader){
			if(!gotRegionLeader && this.region == player.queueInfo.region){
				players.unshift(player);
				gotRegionLeader = true;
			}else{
				players.push(player);
			}
			
			numPlayers +=  1;
		}else if(!gotRegionLeader && this.region == player.queueInfo.region){
			players.unshift(player);
			gotRegionLeader = true;
			numPlayers +=  1;
		}
		
		if(numPlayers == this.pop_size){
			console.log(numPlayers);
			for (var s in players)
				console.log(players[s].name);
			return players;
		}
	}
	return players;
}

Queue.prototype.QueueUpdate = function(){
	for(var i = 0; i < this.players.length; i += this.pop_size){
		var players = this.GetNextPossiblePop();
		if(players.length == this.pop_size){
			this.PopQueue(players);
		}
	}
	
	for (var i = 0; i < this.players.length; ++i){
		this.players[i].OnQueueUpdated(this);
	}
}

return Queue;
});