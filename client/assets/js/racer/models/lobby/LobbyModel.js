Class(function LobbyModel() {
    Inherit(this, Model);
    var _this = this;
    var _allPlayers, _places, _gamePlayers, _me;
    var _disconnect;

    //*** Constructor
    (function() {
        addListeners();
    })();

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.UPDATE_PLAYERS, updatePlayers);
        _this.events.subscribe(RacerEvents.GAME_STARTING, gameStarting);
        _this.events.subscribe(RacerEvents.TABLE_GAME_STARTING, gameStarting);
        _this.events.subscribe(RacerEvents.GAME_ENDED, gameEnded);
        _this.events.subscribe(RacerEvents.PLAYER_FINISHED, playerFinished);
        _this.events.subscribe(HydraEvents.ERROR, gameDisconnect);
    }
    
    function playerFinished(e) {
        if (Global.TABLE) return false;
        if (!_gamePlayers) gameStarting(true);
        for (var i = 0; i < e.order.length; i++) {
            var order = e.order[i];
            if (order.player > -1 && _gamePlayers) {
                for (var j = 0; j < _gamePlayers.length; j++) {
                    var gamePlayer = _gamePlayers[j];
                    if (gamePlayer.color == order.color) gamePlayer.placement = {place: i, lap_time: order.lap_time};
                }
            }
        }

        _places = _gamePlayers;
        if (e.complete) setTimeout(gameEnded, 200);
    }
    
    function updatePlayers(e) {
        _allPlayers = e.players;
        if (_disconnect) {
            gameEnded();
            _disconnect = false;
        }
        
        if (_allPlayers) for (var i = 0; i < _allPlayers.length; i++) {
            if (_allPlayers[i].me) _me = _allPlayers[i];
        }
        
        if (_places) {
            for (var i = 0; i < _places.length; i++) {
                var removed = true;
                for (var j = 0; j < _allPlayers.length; j++) {
                    if (_places[i].id == _allPlayers[j].id) removed = false;
                }
                if (removed) _places[i].placement = null;
            }
        }
        
    }
    
    function gameEnded() {
        if (_gamePlayers && _allPlayers) {
            for (var i = 0; i < _gamePlayers.length; i++) {
                for (var j = 0; j < _allPlayers.length; j++) {
                    if (_gamePlayers[i].placement && _gamePlayers[i].color == _allPlayers[j].color) _allPlayers[j].placement = _gamePlayers[i].placement;
                }
            }
        }
        
        _gamePlayers = _allPlayers;
    }
    
    function gameDisconnect() {
        _disconnect = true;
    }
    
    function gameStarting(noTrack) {
        _gamePlayers = [];
        if (_allPlayers) {
            for (var i = 0; i < _allPlayers.length; i++) {
                delete _allPlayers[i].placement;
                _gamePlayers.push(_allPlayers[i]);
            }
        }
        
        if (Global.PLAYER_INDEX == 0 && !noTrack) GATracker.trackPage('race/players/'+_gamePlayers.length);
    }

    //*** Public Methods
    this.checkPlacement = function(players, checkMe) {
        if (!players || !_places) return players;
        
        for (var i = 0; i < players.length; i++) {
            for (var j = 0; j < _places.length; j++) {
                if (_places[j].id == players[i].id) players[i].placement = _places[j].placement;
            }
            if (checkMe && players[i].me) players[i] = _me;
        }
        
        return players;
    }
    
    this.setGamePlayers = function() {
        gameStarting(true);
    }
    
    this.getMyFinish = function(color) {
        if (!_gamePlayers) return 1;
        for (var i = 0; i < _gamePlayers.length; i++) {
            if (_gamePlayers[i].color == color) {
                return _gamePlayers[i].placement.place;
            }
        }
    }

    this.setPositions = function(positions) {
        //_positions = positions;
    }
    
    this.setPlaces = function(places) {
        _places = places;
    }
    
    this.getPositions = function() {
        return _places;
    }
    
    this.getPlayers = function() {
        if (!_gamePlayers) return false;
        var players = [];
        for (var i = 0; i < _gamePlayers.length; i++) {
            players.push(_gamePlayers[i]);
        }    
        return players;
    }
    
    this.getPlayer = function(index) {
        return _gamePlayers[index];
    }
    
    this.getNumPlayers = function(all) {
        if (!_gamePlayers) gameStarting(true);
        if (!Global.TABLE) {
            return all ? _allPlayers.length : _gamePlayers.length;
        } else {
            return 0;
        }
    }
    
    this.getDimensions = function() {
        if (!_gamePlayers && !RacerDevice.mobile) gameStarting(true);
        var response = {};
        response.width = 0;
        response.height = 99999;
        response.screens = [];
        
        for (var i = 0; i < _gamePlayers.length; i++) {
            var player = _gamePlayers[i];
            response.width += player.scrn.w;
            if (player.scrn.h < response.height) response.height = player.scrn.h;
            
            response.screens.push(player.scrn);
        }
        
        response.height = Math.round(response.height * .9);

        return response;
    }
    
    this.reset = function() { 
        _allPlayers = _places = _gamePlayers = _disconnect = null;
    }
});