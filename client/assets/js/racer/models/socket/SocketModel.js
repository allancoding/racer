Class(function SocketModel() {
    Inherit(this, Model);
    var _this = this;
    var _socket;
    var _code;
    var _highPing = 0;
    var _me = Utils.timestamp(); 
    var _offset;
    var _pollOffset = [];
    var _pollFail = 0;
    var _callbacks = {};
    var _bindings = {};
    var _update = [];
    var _newPlayerIndex, _joinTimeout;
    
    //*** Constructor
    (function() {
        connect();
        checkTable();
        addListeners();
    })();
    
    function connect() {
		if (Config.USE_WEBSOCKETS) {
			_socket = SocketConnection;
			getCode();
		} else {
		    _code = Config.FORCE_CODE;
			_socket = io.connect(Config.SOCKET_SERVER);
		}
    }
    
    function getCode() {
        if (!Config.USE_WEBSOCKETS) return false;
        XHR.get(Config.APP_ENGINE+'/control/start', function(data) {
            _code = data.gameId;
            _socket.storeRelays(data.relays, data.secureRelays);
            _socket.readyForTest();
        });
    }
    
    function checkTable() {
        if (Global.TABLE) {
            Global.PLAYER_INDEX = Number(Utils.cookie('table_player') || 0) - 1;
            if (!Global.TABLE_DEBUG) {
                syncTime();
                if (RacerDevice.mobile) {
                    _socket.emit('connect_player');
                } else {
                    Global.PLAYER_INDEX = 9;
                    Global.TABLE_HEAD = true;
                    _socket.emit('connect_table');
                }
            }
        }
    }
    
    function callback(str, data) {
        if (_callbacks[str]) _callbacks[str](data);
        delete _callbacks[str];
    }
    
    function syncTime() {
        _socket.emit('time_sync', {time: Date.now()});
    }
    
    function calculateLatency(e) {
        if (!e.serverTime) return 0;
        var diff = Date.now() - e.serverTime;
        return Math.abs(Math.abs(diff) - Math.abs(_offset));
    }
    
    function calculateDelay(e) {
        _this.delay = 400 - e.time;
        if (_this.delay < 0) _this.delay = 0;
    }
    
    function resetPlayerIndex() {
        if (typeof _newPlayerIndex === 'number') Global.PLAYER_INDEX = _newPlayerIndex;
        _newPlayerIndex = null;
    }
    
    function checkPlayersForMe(players) {
        if (!players) return players;
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == _me) {
                players[i].me = true;
                RacerSound.setPlayer(i);
                if (!Global.PLAYER_LOCKED) Global.PLAYER_INDEX = i;
                else _newPlayerIndex = i;
            }
        }
        return players;
    }
    
    function latencyDisconnect() {
        if (!_this.disconnected && !Global.SINGLE_PLAYER && !Config.PRESENTATION) {
            _this.events.fire(HydraEvents.ERROR, { type: 'latency-you' });
            _socket.emit('force_disconnect');
            _this.disconnected = true;
        }
    }
    
    //*** Event handlers
    function addListeners() {
        _socket.on('all_tracks_ready', tracksReady);
		_socket.on('match_ready', matchReady);
		_socket.on('time_sync_response', timeSyncResponse);
		_socket.on('match_update_received', matchUpdate);
		_socket.on('sound_update_received', soundUpdate);
		_socket.on('ready_set_go_begin', readySetGoBegin);
		_socket.on('create_game_response', createGameResponse);
		_socket.on('join_game_response', joinGameResponse);
		_socket.on('join_game_update', joinGameUpdate);
		_socket.on('game_starting', gameStarting);
		_socket.on('table_game_starting', tableGameStarting);
		_socket.on('game_ended', gameEnded);
		_socket.on('player_removed', playerRemoved);
		_socket.on('watch_game_response', watchGameResponse);
		_socket.on('player_finished_response', playerFinishedResponse);
		_socket.on('force_restart_all', forceRestart);
		_socket.on('end_session', endSession);
    }
    
    function endSession() {
        _this.events.fire(RacerEvents.END_SESSION);
    }
    
    function timeSyncResponse(e) {
        if (!_pollOffset) return false;
        var currentTime = Date.now();
        var latency = Math.round((currentTime - e.time) * .5);
        var serverTime = e.serverTime;
        currentTime -= latency;
        var difference = currentTime - serverTime;

        _this.events.fire(RacerEvents.SYNC_RESPONSE, {latency: latency, offset: difference});
        
        if (latency < 100) {
            _pollFail--;
            if (_pollFail < 0) _pollFail = 0;
            _pollOffset.push(difference);
        } else {
            if (latency > 250) _pollFail += 10;
            _pollFail++;
            if (_pollFail > 33) {
                Global.BAD_PERFORMANCE = 'latency';
            }
        }

        if (_pollOffset.length == 11) {
            _pollOffset.sort(function(a, b) {
                return a - b;
            });
            _offset = _pollOffset[5];
            _pollOffset = null;
            _pollFail = 0;
            _this.events.fire(RacerEvents.SYNC_COMPLETED, _offset);
        } else {
            syncTime();
        }
    }
    
    function forceRestart() {
        window.location.reload(true);
    }
    
    function tracksReady(e) {
        e.time = calculateLatency(e);
        calculateDelay(e)
        _this.events.fire(RacerEvents.TRACKS_READY, {delay: _this.delay});
        if (Global.USE_WEBSOCKETS) _socket.buildingTrack(false);
    }
    
    function gameEnded(e) {
        Global.GAME_STARTED = false;
        Global.PLAYER_LOCKED = false;

        if (!Global.TABLE) {
            if (!e.disconnect) {
                _this.events.fire(RacerEvents.GAME_ENDED);
            } else {
                _this.events.fire(HydraEvents.ERROR, { type: 'missing' });
                setTimeout(resetPlayerIndex, 1000);
            }
        } else {
            _this.events.fire(RacerEvents.TABLE_GAME_ENDED, e);
            setTimeout(function(){
                window.location.reload(true);
            }, 10000);
        }
    }
    
    function gameStarting(e) {
        if (Global.USE_WEBSOCKETS) _socket.buildingTrack(false);
        Data.TRACK.setType(e.track);
        Config.GAME.overlap = (function() {
            switch (Data.LOBBY.getNumPlayers(true)) {
                case 1: return 50; break;
                case 2: return 50; break;
                case 3: return 75; break;
                case 4: return 75; break;
                case 5: return 75; break;
            }
        })();
        
        _this.events.fire(RacerEvents.GAME_STARTING, {track: e.track});
        Global.PLAYER_LOCKED = true;
        _highPing = 0;
    }
    
    function tableGameStarting(e) {
        _this.events.fire(RacerEvents.TABLE_GAME_STARTING);
    }
    
    function joinGameUpdate(e) {
        var players = checkPlayersForMe(e.players);
        
        if (Global.RESULTS) players = Data.LOBBY.checkPlacement(players);
        
        _this.events.fire(RacerEvents.UPDATE_PLAYERS, {players: players});
        
        if (e.trackNumber > -1) {
            Data.TRACK.setTableTrack(e.trackNumber);
        }
    }
    
    function playerFinishedResponse(e) {
        e.time = calculateLatency(e);
        calculateDelay(e);
        
        var place = null;
        for (var i = 0; i < e.finished.length; i++) {
            if (e.finished[i].player == Global.PLAYER_INDEX) place = i;
        }

        _this.events.fire(RacerEvents.PLAYER_FINISHED, {order: e.finished, delay: _this.delay, complete: e.complete, place: place});
        
        if (e.complete) {
            Global.BAD_PERFORMANCE = null;
            Global.PLAYER_LOCKED = false;
            Global.SINGLE_PLAYER = false;
            Global.GAME_PLAYING = false;
            Global.GAME_STARTED = false;
            resetPlayerIndex();
        }
    }
    
    function watchGameResponse(e) {
        if (e.code) _code = e.code;
        if (e.track) Data.TRACK.setType(e.track);
        Global.PLAYER_INDEX = -1;
        _this.events.fire(RacerEvents.UPDATE_PLAYERS, {players: e.players});
        callback('watch_game', e);
        syncTime();
    }
    
    function createGameResponse(e) {
        _code = e.code;
        Global.PLAYER_INDEX = 0;
        callback('create_game', e.code);
        syncTime();
    }
    
    function joinGameResponse(e) {
        XHR.post(Config.APP_ENGINE+'/debug/relayResponse', {gameId: _code, response: JSON.stringify(e), id: _me});
        RacerSound.gameAlreadyPlaying(e.playing);
        e.players = checkPlayersForMe(e.players);
        e.code = _code;
        callback('join_game', e);
        _pollOffset = [];
        syncTime();
    }
    
    function readySetGoBegin(e) {
        e.time = calculateLatency(e);
        calculateDelay(e);
        _this.events.fire(RacerEvents.READY_SET_GO, {delay: _this.delay});
    }
    
    function matchUpdate(e) {
        e.time = calculateLatency(e);
        if (!e.time || _this.disconnected) return false;
        Global.LATENCY = e.time;
        
        if (!Config.PRESENTATION) {
            if (e.time > 350 && Global.GAME_PLAYING && !Global.BUILDING_TRACK && (typeof Global.PLAYER_INDEX === 'number')) {
                if (Global.HOLD_FRAMERATE > 25 && Global.LAST_FRAME < 100) {
                    _highPing++;
                    if (_highPing >= 50) {
                        latencyDisconnect();
                    }
                }
            } else if (e.time < 100 && _highPing > 0) {
                _highPing--;
                if (_highPing < 0) _highPing = 0;
            }
        }
        
        switch (e._type) {
            case 'throttle': 
                handleThrottle(e); 
            break;
            case 'update':
                Global.GAME_PLAYING = true;
                handleUpdate(e); 
            break;
            case 'offTrack': handleOffTrack(e); break;
            case 'crash': handleCrash(e); break;
            case 'position_change': handlePositionChange(e); break;
            case 'lap_count': handleLapCount(e); break;
            case 'get_lobby_positions': getLobbyPositions(e); break;
            case 'send_lobby_positions': sendLobbyPositions(e); break;
        }
    }
    
    function soundUpdate(e) {
        e.time = calculateLatency(e);
        e.me = e.id == _me;
        _this.events.fire(RacerEvents.SOUND_UPDATE, e);
    }
    
    function getLobbyPositions(e) {
        setTimeout(function(){
            _socket.emit('match_update', {_type: 'send_lobby_positions', code: _code, time: Date.now(), positions: Data.LOBBY.getPositions()});
        }, 1000);
    }
    
    function sendLobbyPositions(e) {
        callback('get_lobby_positions', e.positions);
    }
    
    function handlePositionChange(e) {
        var change = _bindings['position_change'];
        if (change) {
            for (var i = 0; i < change.length; i++) {
                change[i](e.positions);
            }
        }
    }
    
    function handleOffTrack(e) {
        if (e.id == _me) return false;
        e.time = Math.round(e.time * 2);
        
        var offTrack = _bindings['offTrack'];
        if (offTrack) {
            for (var i = 0; i < offTrack.length; i++) {
                offTrack[i](e);
            }
        }
    }
    
    function handleLapCount(e) {
        var lapCount = _bindings['lapCount'];
        if (lapCount) {
            for (var i = 0; i < lapCount.length; i++) {
                lapCount[i](e);
            }
        }
    }
    
    function handleCrash(e) {
        if (e.id == _me) return false;
        e.time = Math.round(e.time * 2);
                
        var crash = _bindings['crash'] ;
        if (crash) {
            for (var i = 0; i < crash.length; i++) {
                crash[i](e);
            }
        }
    }
    
    function handleUpdate(e) {
        if (Global.TABLE_HEAD) return false;
        var update = _bindings['update'];
        e.time = Math.round(e.time * 2);
                
        if (update) {
            for (var i = e.values.length-1; i > -1; i--) {
                if (e.values[i].id != _me) {
                    e.values[i].time = e.time;
                    
                    for (var j = 0; j < update.length; j++) {
                        update[j](e.values[i]);
                    }
                }
            }
        }
    }
    
    function handleThrottle(e) {
        if (typeof Global.PLAYER_INDEX !== 'number') return false;
        var throttle = _bindings['throttle'];

        if (throttle) {
            for (var i = 0; i < throttle.length; i++) {
                throttle[i](e);
            }
        }
    }

    function matchReady(e) {
        Global.GAME_STARTED = true;
        Global.BAD_PERFORMANCE = false;
        e.time = calculateLatency(e);
        calculateDelay(e);
        _this.events.fire(RacerEvents.START_MATCH, { delay: _this.delay });
    }
    
    function playerRemoved(e) {
        _this.events.fire(HydraEvents.ERROR, { type: 'removed', home: true });
        _socket.emit('player_removed_response');
    }

    //*** Public Methods    
    this.createGame = function(callback) {
        if (Config.USE_WEBSOCKETS) {
            if (!_socket.server) _this.events.fire(HydraEvents.ERROR, {type: 'lostconnection'});
            
            _socket.connect();
            XHR.post(Config.APP_ENGINE+'/control/register', {relay: _socket.server, gameId: _code});
        }

        _socket.emit('create_game', {scrn: RacerDevice.getScreen(), agent: Data.DEVICE.getDevice(), name: Utils.cookie('player_name'), id: _me, webaudio: Device.system.webaudio, code: _code});
        _callbacks['create_game'] = callback;
    }
    
    this.joinGame = function(code, callback) {
        _code = code;
        _callbacks['join_game'] = callback;
        clearTimeout(_joinTimeout);
        
        if (Config.USE_WEBSOCKETS) {
            if (!_socket.server) _this.events.fire(HydraEvents.ERROR, {type: 'lostconnection'});
            XHR.post(Config.APP_ENGINE+'/debug/join', {gameId: code, id: _me});
            XHR.get(Config.APP_ENGINE+'/control/join', {gameId: code}, function(data) {
                XHR.post(Config.APP_ENGINE+'/debug/joinResponse', {gameId: code, response: JSON.stringify(data), id: _me});
                if (data.relay) {
                    _socket.connect(data.relay);
                    _socket.emit('join_game', {code: code, scrn: RacerDevice.getScreen(), agent: Data.DEVICE.getDevice(), name: Utils.cookie('player_name'), id: _me, webaudio: Device.system.webaudio});
                    
                    _joinTimeout = setTimeout(function() {
                        XHR.post(Config.APP_ENGINE+'/debug/relayResponse', {gameId: code, response: 'timeout'});
                        if (_callbacks['join_game']) joinGameResponse({success: false, timeout: true});
                    }, 10000);
                } else {
                    joinGameResponse({success: false});
                }
            });
        } else {
            _socket.emit('join_game', {code: code, scrn: RacerDevice.getScreen(), agent: Data.DEVICE.getDevice(), name: Utils.cookie('player_name'), id: _me, webaudio: Device.system.webaudio});
        }
    }
    
    this.joinTable = function(name) {
        _socket.emit('join_game', {name: name, id: _me, player: Global.PLAYER_INDEX});
        Global.PLAYING_TABLE = true;
    }
    
    this.watchGame = function(code, callback) {
        _code = code;
        _callbacks['watch_game'] = callback;
        clearTimeout(_joinTimeout);
        
        if (Config.USE_WEBSOCKETS) {
            XHR.get(Config.APP_ENGINE+'/control/join', {gameId: code}, function(data) {
                if (data.relay) {
                    _socket.connect(data.relay);
                    _socket.emit('watch_game', {code: code, id: _me});
                    
                    _joinTimeout = setTimeout(function() {
                        if (_callbacks['watch_game']) watchGameResponse({success: false, timeout: true});
                    }, 10000);
                } else {
                    watchGameResponse({success: false});
                }
            });
        } else {
            _socket.emit('watch_game', {code: code, id: _me});
        }
    }
    
    this.exitLobby = function() {
        RacerSound.exitLobby();
        _socket.emit('exit_lobby', {code: _code});
        getCode();
        resetPlayerIndex();
        
        if (Config.USE_WEBSOCKETS) _socket.exitLobby();
    }
    
    this.startGame = function(type) {
        _socket.emit('start_game', {code: _code, track: type});
                
        if (Data.LOBBY.getNumPlayers(true) == 1) {
            Global.SINGLE_PLAYER = true;
        }
    }
    
    this.readySetGo = function() {
        _socket.emit('ready_set_go', {code: _code});
    }
    
    this.playerReady = function() {
        _socket.emit('player_ready', {code: _code});
    }
    
    this.trackReady = function() {
        _socket.emit('track_ready', {code: _code});
    }
    
    this.throttle = function(type) {
        if (!Global.SINGLE_PLAYER) {
            _socket.emit('match_update', {player: Global.PLAYER_INDEX, _type: 'throttle', time: Date.now(), type: type, id: _me, code: _code});
        } else {
            handleThrottle({player: Global.PLAYER_INDEX, type: type});
        }
    }
    
    this.offTrack = function(player, values) {
        if (Global.PLAYER_INDEX < 0) return false;
        _socket.emit('match_update', {player: player, _type: 'offTrack', time: Date.now(), id: _me, code: _code, values: values});
    }
    
    this.crashed = function(player, values) {
        if (Global.PLAYER_INDEX < 0) return false;
        _socket.emit('match_update', {player: player, _type: 'crash', time: Date.now(), id: _me, code: _code, values: values});
    }
    
    this.update = function(player, values) {
        if (Global.PLAYER_INDEX < 0) return false;
        if (Global.TABLE && RacerDevice.mobile) return false;
        _update.push({player: player, values: values});
        
        if (_update.length >= Global.RENDERING_TRACKS) {
            var obj = {_type: 'update', time: Date.now(), vol: true, values: _update, id: _me, code: _code};
            if (Global.TABLE) obj.player = 9;
            if (!Global.SINGLE_PLAYER) _socket.emit('match_update', obj);
            else matchUpdate(obj);
            _update = [];
        }
    }
    
    this.editPlayer = function(name) {
        _socket.emit('edit_player', {name: name, code: _code, player: Global.PLAYER_INDEX});
        
        if (name != 'RED' && name != 'GRN' && name != 'BLU' && name != 'YLW' && name != 'ORG') Utils.cookie('player_name', name);
        else Utils.cookie('player_name', null);
    }
    
    this.removePlayer = function(index) {
        _socket.emit('remove_player', {code: _code, player: index});
    }
    
    this.sendSound = function(name, data) {
        data.code = _code;
        data.type = name;
        data.id = _me;
        
        if (Global.SOUND_DEBUG || Global.SINGLE_PLAYER) {
            soundUpdate(data);
        } else {
            _socket.emit('sound_update', data);
        }
    }

    this.syncTime = function () {
        _pollFail = 0;
        _pollOffset = [];
        syncTime();
    }
    
    this.playerFinished = function(player, time, color) {
        if (typeof color !== 'number') color = -1;
        _socket.emit('player_finished', {time: Date.now(), color: color, id: _me, code: _code, player: player, lap_time: time });
    }
    
    this.positionsChange = function(positions) {
        _socket.emit('match_update', {_type: 'position_change', time: Date.now(), id: _me, code: _code, positions: positions});
    }
    
    this.lapCount = function(player, laps) {
        _socket.emit('match_update', {_type: 'lap_count', time: Date.now(), code: _code, player: player, laps: laps});
    }
    
    this.getLobbyPositions = function(callback) {
        _callbacks['get_lobby_positions'] = callback;
        _socket.emit('match_update', {_type: 'get_lobby_positions', time: Date.now(), code: _code});
    }
    
    this.hardwareUpdate = function(data) {
        _socket.emit('hardware_update', data);
    }
    
    this.forceRestart = function() {
        _socket.emit('force_restart');
    }
    
    this.getCode = function() {
        return _code;
    }
    
    this.bind = function(type, callback) {
        if (!_bindings[type]) _bindings[type] = [];
        _bindings[type].push(callback);
    }
        
    this.unbind = function(type) {
        _bindings[type] = null;
        delete _bindings[type];
    }
}); 