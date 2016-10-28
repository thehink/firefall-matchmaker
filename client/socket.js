(function () {
	
	var Ready = false;
	var Sockets = {};
	
	var numRef = 0;
	function GetUniqueReference(){
		return (++numRef).toString();
	}
	
	function CallClient(funcName, arg1, arg2, arg3, arg4){
		if (window.Red5 && window.Red5[funcName]) {
			window.Red5[funcName](arg1, arg2, arg3, arg4);
		}
	}
	
	function OnGetData(data, arg2){
		CallClient("OnGetData", name, data);
	}
	
	Red5Callbacks = {};
	
	Red5Callbacks.cb_Func = function(FuncName, id){
		if(Red5Callbacks[FuncName]){
			var ret = Red5Callbacks[FuncName].apply(this, Array.prototype.slice.call(arguments, 2));
			CallClient("OnWebCallback", id, ret);
		}
	}
	
	Red5Callbacks.Connect = function(url, test){
		var Socket = io.connect(url);
		Sockets[url] = Socket;
		return url;
	}
	
	Red5Callbacks.Disconnect = function(Ref){
		if(Sockets[Ref]){
			Sockets[Ref].disconnect();
		}
	}
	
	Red5Callbacks.On = function(Ref, key){
		if(Sockets[Ref]){
			Sockets[Ref].on(key, OnGetData);
		}
	}
	
	Red5Callbacks.Emit = function(Ref, arg1, arg2, arg3, arg4){
		if(Sockets[Ref]){
			Sockets[Ref].emit(arg1, arg2, arg3, arg4);
		}
	}
	
	Red5Callbacks.Send = function(Ref){
		if(Sockets[Ref]){
			Sockets[Ref].send.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}
	
	Red5Callbacks.OnReady = function(){
		if (!Ready && typeof (window["Red5"]) != "undefined"){
			Ready = true;
			CallClient("OnSocketReady");
		}
	}

}());