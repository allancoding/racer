Class(function SocketConnection() {
    Inherit(this, Events);
    var _this = this;
    var _socket;
    var _connected;
    var _pulse;
    var _pulseInter;
    var _lastResponse;
    var _fastestServer;
    var _callbacks = {};
    var _relays = {};
    var _waiting = [];
    var _secure = true;
    var _retest = 0;

    //*** Constructor
    (function() {
        Render.startRender(time);
    })();
    
    function initSocket(server) {
        if (server == _this.server) return false;
        if (!server) return Global.BAD_PERFORMANCE = 'latency';
        if (_socket) {
            _socket.onclose = null;
            _socket.close();
            _connected = false;
            _waiting = [];
        }

        _this.server = server;
        _socket = new WebSocket(server);
        _socket.onclose = socketClose;
        _socket.onmessage = socketMessage;
        _socket.onopen = socketOpen;
        _this.connected = true;
    }
    
    function connectionLost() {
        if (!Data.SOCKET.disconnected) {
            if (RacerDevice.mobile) _this.events.fire(HydraEvents.ERROR, {type: 'lostconnection'});
            _socket.onclose = null;
            _socket.close();
            clearInterval(_pulseInter);
        }
    }
    
    function time(t) {
        if (_lastResponse && RacerDevice.mobile) {
            if (t - _lastResponse > 15000) {
                _lastResponse = null;
                connectionLost(t);
            }
        }
    }

    //*** Event handlers
    function socketClose(e) {
        _this.server = '';
        if (RacerDevice.mobile) _this.events.fire(HydraEvents.ERROR, {type: 'lostconnection'});
    }
    
    function socketOpen() {
        _connected = true;
        for (var i = 0; i < _waiting.length; i++) {
            _socket.send(JSON.stringify(_waiting[i]));
        }
        _waiting = null;
    }
    
    function socketMessage(e) {
        if (e.data) {
            var d = JSON.parse(e.data);
            
            if (d._socketio_type == 'keep_alive_response') {
                _lastResponse = Date.now();
            } else {
                if (d._socketio_type && _callbacks[d._socketio_type]) {
                    _callbacks[d._socketio_type](d);
                }
            }
        }
    }

    //*** Public Methods
    this.emit = function(type, data) {
        data = data || {};
        data._socketio_type = type;
        
        if (_connected) {
            _socket.send(JSON.stringify(data));
        } else {
            _waiting.push(data);
        }
    }
    
    this.on = function(type, callback) {
        _callbacks[type] = callback;
    }
    
    this.testRelays = function() {
        var relays = _secure ? _relays.secure : _relays.relays;
        this.pickRelay(relays, function(server, time) {
            if (time > 100) {
                _retest++;
                if (_retest > 1 && time > 350) Global.BAD_PERFORMANCE = 'latency';
                if (_retest < 3) _this.testRelays();
            }
            
            if (server === null && time === null && _retest > 0) {
                Global.BAD_PERFORMANCE = 'latency';
            }
            
            if (_secure && !server) {
                _this.events.fire(HydraEvents.ERROR, {type: 'lostconnection'});
                Global.BAD_PERFORMANCE = 'latency';
            }
            
            if (!server) {
                _secure = true;
                _this.pickRelay(_relays.secure, complete);
            } else {
                complete(server, time);
            }
        });
        
        function complete(server, time) {
            if (RacerDevice.fallback_browser) return false;
            _fastestServer = server;
            initSocket(server);
            Data.SOCKET.syncTime();
            _this.fastestRelay = true;
            GATracker.trackEvent('latency_test', 'server', server);
            GATracker.trackEvent('latency_test', 'time', 'ms', time);
        }
    }
    
    this.exitLobby = function() {
        if (_this.server != _fastestServer) {
            initSocket(_fastestServer);
        }
    }
    
    this.connect = function(server) {
        if (_secure && server) server = server.replace(':80/socket', ':443/wss').replace('ws://', 'wss://');
        if (server) initSocket(server);
        clearInterval(_pulseInter);
        _pulseInter = setInterval(function() {
            _this.emit('keep_alive', {time: Date.now()});
        }, 5000);
    }
    
    this.buildingTrack = function(done) {
        _lastResponse = null;
        if (done) {
            Render.startRender(time);
        } else {
            Render.stopRender(time);
        }
    }
    
    this.storeRelays = function(relays, secureRelays) {
        if (!this.fastestRelay) {
            if (!relays) return _this.events.fire(HydraEvents.ERROR, {type: 'lostconnection'});
            _relays.relays = relays;
            _relays.secure = secureRelays;
            
            if (this.tested) this.testRelays();
        }
    }
    
    this.readyForTest = function() {
        if (!_this.tested) {
            _this.tested = true;
            _this.testRelays();
        }
    }
        
}, 'Static');

SocketConnection.pickRelay = function () {

    // pickRelay connects to the provided relays, pings each simultaneously,
    // and invokes callback with the relay with the smallest latency and the
    // value of that latency in milliseconds.
    // Example arguments:
    //   relays: ["ws://localhost:9091/socket", "ws://localhost:9092/socket"]
    //   callback: function(relay, delta) {}
    function pickRelay(relays, callback) {
        if (RacerDevice.fallback_browser) return false;
        var done = false;
        var timeout = setTimeout(end, 2100);
        var deltas = [];
        var n = 0;

        function end() {
            if (done) {
                return;
            }
            done = true;
            if (deltas.length == 0) {
                callback(null, null);
                return;
            }
            deltas.sort(function (a, b) {
                if (a.delta < b.delta) {
                    return -1;
                }
                if (a.delta > b.delta) {
                    return 1;
                }
                return 0;
            });
            var d = deltas[0];
            console.log("Selected: " + d.relay + " " + d.delta);
            callback(d.relay, d.delta);
        }
        for (var i = 0; i < relays.length; i++) {
            pollRelay(relays[i], function (relay, delta) {
                
                //console.log("pollRelay:"+' '+relay+' '+delta); //please don't remove yet (it's useful debugging!)
                if (delta !== null) {
                    deltas.push({
                        "relay": relay,
                        "delta": delta
                    });
                }
                n++;
                if (n == relays.length) end();
            });
        }
    }

    // pollRelay connects to the provided relay, sends a few ping messages,
    // and then invokes callback with the relay address and the smallest latency.
    // If the connection cannot be made or the server takes too long, the 
    // Example arguments:
    //   relay: "ws://localhost:9091/socket"
    //   callback: function(relay, delta) {}
    function pollRelay(relay, callback) {
        var sock = new WebSocket(relay);
        var timeout = setTimeout(end, 2000);
        var nextPing;
        var done = false;
        var deltas = [];
        var numDeltas = 5;

        function end() {
            if (done) {
                return;
            }
            done = true;
            if (sock) {
                sock.close();
            }
            clearTimeout(timeout);
            clearTimeout(nextPing);
            if (deltas.length == 0) {
                callback(relay, null);
                return;
            }
            
            //AVERAGE
            
            /*var sum = 0
            console.log(deltas);
            for (var i = 0, len = numDeltas; i < len; i++) {
                if (typeof deltas[i] !== 'undefined') {
                    sum += deltas[i];
                } else {
                    sum += 1000; //skew results for dropped packets to 1000ms
                }
            }
            
            callback(relay, sum/deltas.length);*/
            
            //MEDIAN
            
            for (var i = 0, len = numDeltas; i < len; i++) {
                if (typeof deltas[i] === 'undefined') {
                    deltas.push(1000); //skew results for dropped packets to 1000ms
                }
            }
            
            deltas.sort();
            
            callback(relay, deltas[Math.floor(numDeltas/2)]); //pick the median (middle of numDeltas)
        };

        function ping() {
            if (done) {
                return;
            }
            var now = Date.now();
            var msg = {
                "_socketio_type": "time_sync",
                "time": now
            };
            sock.send(JSON.stringify(msg));
        };
        sock.onopen = ping;
        sock.onmessage = function (e) {
            if (done) {
                return;
            }
            var msg = JSON.parse(e.data);
            if (msg._socketio_type != "time_sync_response") {
                return;
            }
            var now = Date.now();
            var delta = now - msg.time;
            deltas.push(delta);
            if (deltas.length == numDeltas) {
                end();
                return;
            }
            nextPing = setTimeout(ping, 100);
        };
        sock.onclose = end;
    }

    return pickRelay;
}();
