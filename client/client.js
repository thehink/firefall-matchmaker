if (typeof (window["Red5"]) == "undefined")
   Red5 = { in_browser: true };

client = {
	connected: false,
};

var init = function(){
	connect();
};

var connect = function(){
	if(!client.network.connected){
		var socket = client.network.socket = io.connect('http://'+window.location.hostname+'');
		
		//connection
		socket.on('connect', listeners.OnConnect);
		socket.on('disconnect', listeners.OnDisconnect);
	}
};


var listeners = {};

listeners.OnConnect = function(args){
	CallGame("OnConnect", args);
}

listeners.OnDisconnect = function(args){
	CallGame("OnDisconnect", args);
}


CallGame = function(func, arg1, arg2, callback){
	if (typeof (Red5[func]) == 'function')
		Red5[func](arg1, arg2, callback);
}

Red5Callbacks = {
	updateCords: function(coords){
	
	},
}