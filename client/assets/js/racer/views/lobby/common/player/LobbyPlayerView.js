Class(function LobbyPlayerView() {
    Inherit(this, View);
    var _this = this;
    var $this, $overlay;
    var _players, _width, _height, _playerWidth, _playerHeight;
    var _data = [], _activePlayers = 0, _byPlace, _size;
    
    //*** Constructor
    (function() {
        initHTML();
        initPlayers();
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ width: '100%', position: 'relative', marginLeft: 'auto', marginRight: 'auto' });
        $this.invisible();
    }
    
    function initPlayers() {
        _players = new Array();
        for (var i = 0; i < 5; i++) {
            var player = _this.initClass(LobbyPlayerViewPlayer, i);
            player.index = i;
            player.events.add(RacerEvents.REMOVING_PLAYER, removingPlayer);
            player.events.add(RacerEvents.REMOVED_PLAYER, removedPlayer);
            _players.push(player);
        }
    }

    //*** Event handlers    
    function resizeHandler() {
        var dif = 200;
        var check = 50;
        var w = RacerDevice.width;
        var h = RacerDevice.height;
        _height = h < Config.HEIGHT.min ? Config.HEIGHT.min-dif-Config.HEIGHT.offset : h < Config.HEIGHT.max-check ? h-dif-Config.HEIGHT.offset : Config.HEIGHT.max-dif-check-Config.HEIGHT.offset;
        _height = _height*0.9+5;
        if (_height/_width > 0.8) _height = _width*0.8;
        if (_height > 420) _height = 420;
        _playerHeight = Math.round(_height*0.2);
        _playerWidth = (_width/_playerHeight > 12) ? _playerHeight*12 : _width;
        $this.css({ width: _width, height: _height*1.02-2 });
        for (var i = 0; i < _players.length; i++) {
            _players[i].css({ top: _playerHeight*i });
            _players[i].resize(Math.round(_playerWidth), Math.round(_playerHeight*0.9));
        }
    }
    
    function updatePlayers() {
        for (var i = 0; i < _players.length; i++) {
            _players[i].move = false;
            
            if (_data && _data[i] && _data[i].id) {
                _players[i].activate();
                var data = _data[i];
                _players[i].id = _data[i].id;
                _players[i].color = _data[i].color;
                _data[i].me = _data[i].me || false;
                var gradient1 = (_data[i-1] && !Global.RESULTS) ? Config.COLORS[_data[i-1].color] : null;
                var gradient2 = Config.COLORS[_data[i].color];
                var gradient3 = (_data[i+1] && !Global.RESULTS) ? Config.COLORS[_data[i+1].color] : null;
                _data[i].gradient = [gradient1, gradient2, gradient3];
                _players[i].update(_data[i]);
            } else {
                _players[i].deactivate();
                _players[i].id = null;
                _players[i].data = null;
            }
        }
    }
    
    function sortByPlace(array) {
        var sort = new Array();
        var remaining = new Array();
        for (var i = 0; i < array.length; i++) {
            if (array[i].placement) sort.push(array[i]);
            else remaining.push(array[i]);
        }
        
        sort.sort(function(a, b){ return a.placement.place-b.placement.place; });
        
        var join = sort.concat(remaining);
        for (var i = 0; i < join.length; i++) {
            if (!join[i]) join.splice(i, 1);
        }
        
        return join;
    }
    
    function removingPlayer(e) {
        for (var i = 0; i < _players.length; i++) {
            if (e.index !== i && _players[i].removing) _players[i].hideRemove();
        }
    }
    
    function removedPlayer() {
        for (var i = 0; i < _players.length; i++) {
            if (_players[i].removing) _players[i].hideRemove();
        }
    }

    //*** Public Methods
    this.resize = function(width) {
        _width = width;
        resizeHandler();
    }
    
    this.showResults = function() {
        for (var i = 0; i < _players.length; i++) {
            _players[i].element.show();
        }
    }
    
    this.animateIn = function() {
        $this.visible();
        if (_this.overlayed) {
            $this.tween({ opacity: 1 }, 300, 'easeOutSine', $this.clearAlpha);
        } else {
            for (var i = 0; i < _players.length; i++) {
                var delay = Global.RESULTS ? i*100 : i*60;
                if (Global.RESULTS && !Global.LOBBY_WAITING && !Global.PLACES_LOADED) delay += 900;
                if (Global.PLACES_LOADED) delay += 500;
                _this.delayedCall(_players[i].animateIn, delay);
            }
        }
    }
    
    this.animateOut = function(callback) {
        _this.overlayed = true;
        $this.tween({ opacity: 0 }, 300, 'easeOutSine', function(){
            if (callback) _this.delayedCall(callback, 250);
        });
    }
    
    this.setPositions = function(players) {
        if (Global.RESULTS) players = sortByPlace(players);
        for (var i = 0; i < players.length; i++) {
            if (players[i] && players[i].placement) {
                var time = players[i].placement.lap_time;
                var place = RacerUtil.formatPlaceWord(players[i].placement.place);
                _players[i].setText(time, place);    
            }
        }
    }
    
    this.setFinish = function(order) {
        // for (var i = 0; i < order.length; i++) {
            // var player = _players[order[i].player];
            // if (!player.isSet) {
                // var place = RacerUtil.formatPlace(i);
                // player.setText(order[i].lap_time, place);
            // }
        // }
    }
    
    this.updateTime = function(time) {
        if (_activePlayers) for (var i = 0; i < _activePlayers.length; i++) {
            if (!_activePlayers[i].isSet) _activePlayers[i].updateTime(time);
        }
    }
    
    this.updatePositions = function(order) {
        if (order) {
            _activePlayers = new Array();
            for (var i = 0; i < order.length; i++) {
                for (var j = 0; j < _players.length; j++) {
                    if (_players[j].color == order[i]) {
                        var place = RacerUtil.formatPlaceWord(i);
                        if (!_players[j].isSet) _players[j].updatePosition(place);
                        _activePlayers.push(_players[j]);
                    }
                }
            }
        } else {
            for (var i = 0; i < _players.length; i++) {
                _players[i].updatePosition('WAITING');
            }
        }
    }
    
    this.update = function(e) {
        for (var i = 0; i < e.players.length; i++) {
            if (e.players[i]) e.players[i].index = i;
        }
        
        var players = Global.RESULTS ? sortByPlace(e.players) : e.players;
        var changePosition = false;
        for (var i = 0; i < _data.length; i++) {
            if (players[i] && _data[i] && _data[i].id !== players.id) changePosition = true;
        }
        
        _data = players;
        
        if (!_this.animating) {
            if (changePosition) {
                _this.animating = true;
                var fill = [null, null, null, null, null];
                
                // Assign positions
                for (var i = 0; i < _data.length; i++) { 
                    for (var j = 0; j < _players.length; j++) {
                        if (_data && _data[i] && _data[i].id && _players[j] && _players[j].id && _data[i].id == _players[j].id) {
                            _players[j].move = true;
                            fill[i] = _players[j];
                        }
                    }
                }
                
                // Fill Empty
                for (var i = 0; i < _players.length; i++) {
                    if (_players[i] && !_players[i].move && fill[i]) {
                        for (var j = 0; j < fill.length; j++) {
                            if (!fill[j] && !_players[i].move) {
                                fill[j] = _players[i];
                                _players[i].move = true;
                            }
                        }
                    }
                }
                
                // Tweens to new Positions - Loops on loops
                for (var i = 0; i < fill.length; i++) {
                    if (fill[i] && fill[i].move) {
                        var dist = i-fill[i].index;
                        fill[i].tween({ y: dist*_playerHeight }, _playerHeight*4, 'easeInOutCubic');
                        if (!_data[i]) _this.delayedCall(fill[i].fadeOut, _playerHeight*3);
                    }
                }
                
                // Apply new styling
                _this.delayedCall(function(){
                    if (_players) updatePlayers();
                    _this.animating = false;
                }, _playerHeight*4+200);
                
            } else {
                if (_players) updatePlayers();
            }
        }
    }
});
