module.exports = (function(se){
	
var Player = function(socket){
	this.name = "";
	this.connected = true;
	this.queues = [],
	this.lastUsersFound = 0;
	this.socket = socket;
	this.lobby = null;
	this.voted = false;
	this.queueTime = 0;
}

Player.prototype.OnVote = function(vote){
	if(this.lobby && !this.voted){
		this.voted = true;
		this.lobby.OnVoteForPop(this);
	}
}

Player.prototype.ReqVote = function(data){
	this.voted = false;
	this.Emit("OnVoteStart", data);
}


Player.prototype.OnJoinLobby = function(lobby){
	this.lobby = lobby;
}

Player.prototype.OnLeaveLobby = function(){
	this.lobby = null;
}

Player.prototype.LeaveLobby = function(){
	if(this.lobby){
		this.lobby.RemovePlayer(this);
	}
}

Player.prototype.OnAddToQueue = function(queue){
	this.queueTime = Date.now();
	this.queues.push(queue);
}

Player.prototype.OnRemoveFromQueue = function(queue){
	
}

Player.prototype.OnQueueUpdated = function(queue){
	var users = 0;
	for (var i = 0; i < this.queues.length; ++i){
		if(users < this.queues[i].size){
			users = this.queues[i].size;
		}
	}
	
	if(this.lastUsersFound != users && !this.lobby){
		this.lastUsersFound = users;
		this.Emit("OnQueueStatus", {status: "SEARCHING", msg: "Searching("+users+")..."});
	}
}

Player.prototype.RemoveFromQueue = function(queue){
	
}

Player.prototype.Queue = function(){
	this.lobby = null;
	se.Matchmaker.QueueForMap(this, this.queueInfo);
}

Player.prototype.UnQueue = function(){
	for (var i = 0; i < this.queues.length; ++i){
		this.queues[i].RemovePlayer(this);
	}
	this.inQueue = false;
	this.queueTime = 0;
	this.queues = [];
}

Player.prototype.SetInfo = function(args){
	if(args){
		this.name = args.name || "";
	}
}

Player.prototype.SetQueueInfo = function(args){
	this.queueInfo = {
		players: args.players || 1,
		maps: args.maps || {},
		region: args.region || "",
		preferred_regions: args.preferred_regions || [],
	};
}

Player.prototype.IsConnected = function(){
	return this.socket && this.connected;
}

Player.prototype.Emit = function(name, data){
	if(this.socket && this.connected)
		this.socket.emit(name, data);
}

Player.prototype.OnConnected = function(){
	this.connected = true;
}

Player.prototype.OnDisconnect = function(){
	console.log("Left: " + this.name);
	this.LeaveLobby();
	this.UnQueue();
	this.connected = false;
}

Player.prototype.Disconnect = function(){
	this.LeaveLobby();
	if(this.socket && this.connected)
		this.socket.disconnect();
}
 return Player;
});