Class(function Lobby(_action) {
    Inherit(this, Controller);
    var _this = this;
    var $container, $back;
    var _view, _scale;
    var _width, _height, _top, _left;
    var _code, _currentPlayers = null;
    var _time = 0, _timerInterval;
    
    _this.synced = false;
    _action = (Config.PRESENTATION && _action == 'join') ? 'watchcode' : _action;
    
    //_action = 'results';
    
    //*** Constructor
    (function() {
        initContainer();
        initView();
        addListeners();
        _this.delayedCall(resizeHandler, 50);
    })();

    function initContainer() {
        GATracker.trackPage("lobby");
        $container = _this.container;
        $container.size('100%').css({ webkitBackfaceVisibility: 'hidden' });
        $container.setZ(2);
    }
    
    function initView() {
        switch (_action) {
            case 'start':
                _view = _this.initClass(LobbyView, { input: false });
                Data.SOCKET.createGame(function(code){
                    Global.CODE = _code = code;
                    resizeHandler();
                    _this.events.fire(RacerEvents.SYNCED);
                    _this.delayedCall(_view.animateIn, 1250, _code);
                    _this.delayedCall(showLobby, 1250);
                });
            break;
            case 'join':
                GATracker.trackPage("enter_code");
                _view = _this.initClass(LobbyView, { input: true });
                _this.delayedCall(_view.animateIn, 600);
                _view.events.add(RacerEvents.SYNC_REQUEST, syncRequest); 
            break;
            case 'watchcode':
                _view = _this.initClass(LobbyView, { input: false });
                _this.delayedCall(syncRequest, 100, { code: 'RACER' });
            break;
            case 'random':
                _view = _this.initClass(LobbyView, { input: true });
                _this.delayedCall(syncRequest, 100, { code: null });
            break;
            case 'results':
                SCSound.send("result_out", 1000);
                _code = Global.CODE;
                Global.RESULTS = true;
                _this.synced = true;
                _view = _this.initClass(LobbyView, { input: false, code: _code, results: true });
                
                resizeHandler();
                _this.events.fire(RacerEvents.SYNCED);
                _this.events.subscribe(RacerEvents.START_MATCH, startMatch);
                
                var players = Data.LOBBY.getPlayers();
                if (players) {
                    _currentPlayers = players;
                    _this.delayedCall(_view.update, 50, { players: players, results: true });
                    _this.delayedCall(setPlayerPositions, 100, players);
                    _this.delayedCall(showLobby, 150, true);    
                } else {
                    _this.events.fire(RacerEvents.END_SESSION);
                }
            break;
        }
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.UPDATE_PLAYERS, updatePlayers);
        _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
        
        if (RacerDevice.mobile) {
            _this.events.subscribe(RacerEvents.GAME_STARTING, startMatch);
            _this.events.bubble(_view, HydraEvents.COMPLETE);
        }
    }

    function resizeHandler() {
        var scale = (!_this.synced && RacerDevice.width > 400 && _action == 'join') ? 380/RacerDevice.width : 1;
        if (scale < 0.8) scale = 0.8;
        if (scale > 1 || !RacerDevice.mobile) scale = 1;
        
        _this.y = _this.synced ? 0 : Math.round(RacerDevice.height*(_action == 'start' ? 0.2 : 0.22))+20 ;
        if (!RacerDevice.mobile && !_this.synced) _this.y = -RacerDevice.height/4;
        if (!_this.animating && _view) _view.element.transform({ y: _this.y, scale: scale });
        _view.resize();
    }
    
    function syncRequest(e) {
        if (RacerDevice.mobile) Data.SOCKET.joinGame(e.code, callback);
        else Data.SOCKET.watchGame(e.code, callback);
        
        function callback(e) {
            if (e.timeout) {
                var text = 'CONNECTION TIMED OUT';
                _view.codeError(text);
            } else if (e.success) {
                _this.events.fire(RacerEvents.SYNCED, e);
                Global.CODE = _code = e.code;
                Global.LOBBY_WAITING = false;
                
                if (e.playing) {
                    if (RacerDevice.mobile) {
                        _view.updatePositions(null);
                        _view.isWatcher();
                        Global.LOBBY_WAITING = true;
                        Global.RESULTS = true;
                        Data.SOCKET.bind('position_change', positionChange);
                        _this.events.subscribe(RacerEvents.PLAYER_FINISHED, playerFinished);
                        if (e.startTime) startTime(null, e.startTime);
                        else _this.events.subscribe(RacerEvents.START_MATCH, startTime);
                    } else {
                        _this.delayedCall(function(){
                            Data.LOBBY.setGamePlayers();
                            startMatch();
                        }, 300);
                    }
                    _this.delayedCall(showLobby, 500);
                } else {
                    if (!RacerDevice.mobile) {
                        _this.events.subscribe(RacerEvents.START_MATCH, startMatch);
                        _this.events.subscribe(RacerEvents.PLAYER_FINISHED, playerFinished);
                    }
                    Data.SOCKET.getLobbyPositions(function(places){
                        if (places) {
                            Global.RESULTS = true;
                            Global.PLACES_LOADED = true;
                            _view.setAsResult();
                            Data.LOBBY.setPlaces(places);
                            var players = Data.LOBBY.checkPlacement(e.players, true);
                            _this.delayedCall(updatePlayers, 300, { players: players });
                        }
                        showLobby();
                    });
                }
                
                _this.delayedCall(function(){
                    if (!_this.lobbyVisible) showLobby();
                }, 2000);
                
            } else {
                GATracker.trackPage("invalid_code");
                if (RacerDevice.mobile) GATracker.trackPage("mobile enter code error");
                else GATracker.trackPage("incorrect race code error");
                var text = e.noconnection ? 'NO INTERNET CONNECTION' : e.full ? 'LOBBY IS FULL' : 'INVALID RACE NAME';
                _view.codeError(text);
            }
        }
    }

    function updatePlayers(e) {
        if (e.players) {
            if (_currentPlayers !== e.players && !_this.start) {
                _view.update(e);
            }
            _currentPlayers = e.players;
        }
    }
    
    function startMatch() {
        Global.CODE = _code;
        //SCSound.send("result_in", 20+Global.ANIMATION_DELAY);
        _this.start = true;
        if (!RacerDevice.mobile && _currentPlayers.length < 2) return false;
        if (_currentPlayers) for (var i = 0; i < _currentPlayers.length; i++) {
            if (_currentPlayers[i].me) {
                var g1 = (_currentPlayers[i-1]) ? Config.COLORS[_currentPlayers[i-1].color] : null;
                var g2 = Config.COLORS[_currentPlayers[i].color];
                var g3 = (_currentPlayers[i+1]) ? Config.COLORS[_currentPlayers[i+1].color] : null;
                Global.GRADIENT = RacerUtil.gradient(g1, g2, g3);
                Global.COLOR = g2;
                Global.COLOR_INDEX = _currentPlayers[i].color;
            }
        }
        
        _this.events.fire(HydraEvents.COMPLETE);
    }
    
    function goBack() {
        _this.events.fire(HydraEvents.END);
    }
    
    function showLobby(noAnim) {
        _this.lobbyVisible = true;
        Global.SYNC = _code;
        
        _this.animating = true;
        if (_action == 'start') _view.showTitle();
        
        if (!noAnim) _view.element.tween({ y: 0, scale: 1 }, _this.y/2+500, 'easeInOutCubic', _action == 'start' ? 2000 : 0, showView);
        else showView();
        
        function showView() {
            _this.animating = false;
            _this.synced = true;
            _view.synced(_code, noAnim);
            _view.element.clearTransform();
        }
    }
    
    function updateTimer() {
        var text = _time > 0 ? RacerUtil.formatTime(_time) : '00:00';
        _view.updateTime(text);
        _time += 1;
    }
    
    function startTime(e, start) {
        _time = start > 0 ? Math.round((Date.now() - start)/1000) : -6;
        _timerInterval = setInterval(updateTimer, 1000);
    }
    
    function positionChange(e) {
        _view.updatePositions(e);
    }
    
    function playerFinished(e) {
        _view.setFinish(e.order);
        if (e.complete) {
            if (_timerInterval) clearInterval(_timerInterval);
            _this.delayedCall(function(){
                _this.events.fire(RacerEvents.REFRESH_LOBBY);
            }, 3500);
        }
    }

    function setPlayerPositions(players) {
        _view.setPositions(players);
    }

    //*** Public Methods
    this.animateOut = function(callback) {
        if (_timerInterval) clearInterval(_timerInterval);
        if (callback) setTimeout(callback, 100);
    }
    
    this.fadeOut = function(callback) {
        $container.tween({ opacity: 0 }, 300, 'easeOutSine', function(){
            if (callback) callback();
        });
    }
    
    this.destroy = function() {
        if (_timerInterval) clearInterval(_timerInterval);
        Data.SOCKET.unbind('position_change');
        return _this._destroy();
    }
});
