module.exports = (function(se){
	
var Lobby = function(info){
	this.name = info.name || "";
	this.players = [];
	this.mapInfo = info.mapInfo || 0;
	this.flag = info.flag || 0;
	this.votes = 0;
	this.votingActive = false;
	this.size = 0;
}

Lobby.prototype._AddPlayer = function(player){
	player.UnQueue();
	this.size += player.queueInfo.players;
	this.players.push(player);
	player.OnJoinLobby(this);
}

Lobby.prototype.AddPlayer = function(player){
	this._AddPlayer(player);
	this.UpdatePlayers();
}

Lobby.prototype.AddPlayers = function(players){
	for(var i = 0; i < players.length; ++i){
		this._AddPlayer(players[i]);
	}
	this.UpdatePlayers();
}

Lobby.prototype.RemovePlayer = function(player){
	for (var i = this.players.length - 1; i > -1; i--){
		if(this.players[i] == player){
			this.players.splice(i, 1);
		}
	}
	this.size -= player.queueInfo.players;
	player.OnLeaveLobby(this);
	this.UpdatePlayers();
}

Lobby.prototype.RemoveAllPlayers = function(){
	for (var i = this.players.length - 1; i > -1; i--){
		var player = this.players[i];
		this.size -= player.queueInfo.players;
		player.OnLeaveLobby(this);
	}
	this.players = [];
}


Lobby.prototype.Pop = function(){
	var leader = this.players[0];
	var playerNames = [];
	var flag = this.mapInfo.flags[this.flag];
	var name = this.mapInfo.name+' - ' + (flag ? flag.name : "");
	var desc = flag ? flag.desc : "";
	
	for (var i = 1;  i < this.players.length; i++){
		var player = this.players[i];
		playerNames.push(player.name);
		player.Emit("OnQueueStatus", {status: "FOUND", map:this.mapInfo.matchId, region:leader.queueInfo.region, msg: "Found match! Squading up...", name: name, desc: desc, wait_for_invite: leader.name});
		player.UnQueue();
		player.Disconnect();
	}
	
	leader.Emit("OnQueueStatus", {status: "FOUND", map:this.mapInfo.matchId, region:leader.queueInfo.region, msg: "Found match! Squading up...", name: name, desc: desc, leader: true, invite: playerNames});
	leader.UnQueue();
	leader.Disconnect();
	this.RemoveAllPlayers();
}

Lobby.prototype.UpdatePlayers = function(){
	for (var i = 0;  i < this.players.length; i++){
		var player = this.players[i];
		player.Emit("OnQueueStatus", {status: "SEARCHING", msg: "In Lobby("+this.size+")..."});
	}
}

Lobby.prototype.OnVoteForPop = function(player){
	this.votes += player.queueInfo.players;
	if(this.votes > this.size/2){
		this.votingActive = false;
		this.Pop();
	}
}

Lobby.prototype.VotePop = function(timeout){
	this.votes = 0;
	this.votingActive = true;
	timeout = timeout || 30;
	for (var i = 0;  i < this.players.length; i++){
		var player = this.players[i];
		player.ReqVote({
			timeout: timeout,
			players: this.size,
		});
	}
	var self = this;
	setTimeout(function() { self.Cancel(); }, timeout*1000);
}

Lobby.prototype.Cancel = function(){
	console.log("Voting canceled!!!");
	this.votingActive = false;
	se.Matchmaker.RemoveLobby(this);
	for (var i = 0;  i < this.players.length; i++){
		var player = this.players[i];
		player.Queue();
	}
	this.RemoveAllPlayers();
}


return Lobby;
});