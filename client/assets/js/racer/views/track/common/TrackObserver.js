Class(function TrackObserver() {
    Inherit(this, View);
    var _this = this;
    var _tracks = [];
    var _positions = [];
    var _crashAngle = 1000;
    var _forcePositions;
    var _holdPositions;

    //*** Constructor
    (function() {
        setTimeout(setCrashAngle, 500);
        addListeners();
        Render.startRender(loop);
        if (Config.DEVELOPMENT) _this.events.subscribe(RacerEvents.DEBUG_DUMP, debugDump);
    })();
    
    function setCrashAngle() {
        var track = Data.TRACK.getTrackPlayers();
        var players = Data.LOBBY.getNumPlayers();
        var angle = Data.TRACK.getTrackAngle();
                         
        if (track == 1) {
            _crashAngle = 500;
        }
        
        if (track == 2 && players == 2) {
            _crashAngle = 35;
        }
        
        if (track == 3 && players == 2) {
            _crashAngle = 30;
        }
        
        if (track == 3 && players == 3) {
            _crashAngle = 35;
        }
        
        if (track == 4 && players == 3) {
            _crashAngle = 28;
        }
        
        if (track == 4 && players == 4) {
            _crashAngle = 29;
        }
        
        if (track == 5 && players == 4) {
            _crashAngle = 32;
        }
        
        if (track == 5 && players == 5) {
            _crashAngle = 45;
        }
        
        if (Global.TABLE) {
            _crashAngle = 30;
        }
        
        if (angle) {
            _crashAngle = angle;
        }
    }
    
    function debugDump() {
        console.log(_positions);
        console.log(_holdPositions);
        console.log('---');
    }
    
    function loop() {
        var positions = [];
        Global.RENDERING_TRACKS = 0;
        
        for (var i = _tracks.length-1; i > -1; i--) {
            var track = _tracks[i];
            var renderer = track.renderer;
            var car = track.car;
            var onScreen = renderer.isOnScreen();
            
            //check race positions
            positions.push({player: renderer.color, position: renderer.position});
            
            //check if car is on screen
            if (onScreen) Global.RENDERING_TRACKS++;
            
            //collisions
            if (Config.GAME.canCrash) {
                if (!renderer.crashed && !renderer.getOffTrack() && !renderer.finished && onScreen && !car.isOffTrack) {
                    for (j = _tracks.length-1; j > -1; j--) {
                        var otherCar = _tracks[j];
                        if (j != i) {
                            if (Utils.hitTestObject(car, otherCar.car)) {
                                var car1Rot = Math.abs(car.rotation);
                                var car2Rot = Math.abs(otherCar.car.rotation);
                                var rot = Math.abs(car1Rot - car2Rot);
                                if (rot > _crashAngle && !otherCar.renderer.crashed && !otherCar.renderer.finished && !otherCar.car.isOffTrack) {
                                    if ((car1Rot == 90 && car2Rot == 180) || (car2Rot == 90 && car1Rot == 180)) continue;
                                    renderer.crash();
                                    otherCar.renderer.crash();
                                    tableCrash(track, otherCar);
                                    SCSound.send('collision');
                                    GATracker.trackEvent('race', 'game_event', 'crash');
                                }
                            }
                        }
                    }
                }
            }
        }
        
        checkPositions(positions);
    }
    
    function checkPositions(positions) {
        var changed = false;
        _holdPositions = positions;
        positions.sort(function(a, b) {
            return b.position - a.position;
        });
        
        for (var i = 0; i < positions.length; i++) {
            if (_positions[i] != positions[i].player) changed = true;
            _positions[i] = positions[i].player;
        }
        
        if (changed || _forcePositions) {
            if (Global.TABLE_HEAD) {
                var order = tablePlayerOrder();
                Data.SOCKET.hardwareUpdate({type: 'leaderboard_update', players: order});
            } else {
                Data.LOBBY.setPositions(_positions);
                _this.events.fire(RacerEvents.POSITIONS_CHANGE, {positions: _positions});
                if (Global.PLAYER_INDEX == 0) Data.SOCKET.positionsChange(_positions);
            }
        }
    }
    
    function tablePlayerOrder() {
        var players = Data.LOBBY.getPlayers();
        if (!players) return false;
        var order = [];
        
        for (var i = 0; i < _positions.length; i++) {
            var pl = getPlayer(players, _positions[i]);
            if (pl) order.push(pl);
        }
                
        return order;
    }
    
    function getPlayer(players, index) {
        for (var i = 0; i < players.length; i++) {
            if (index == players[i].index) return players[i];
        }
    }
    
    function tableCrash(player1, player2) {
        if (Global.TABLE_HEAD) {
            var x = (player1.car.x + player2.car.x) / 2;
            var y = (player1.car.y + player2.car.y) / 2;
            var players = Data.LOBBY.getPlayers();
            var crashPlayers = [];
            
            for (var i = 0; i < players.length; i++) {
                if (players[i].index == player1.renderer.player || players[i].index == player2.renderer.player) crashPlayers.push(players[i]);
            }
            
            Data.SOCKET.hardwareUpdate({type: 'crash', players: crashPlayers, coord: {x: x, y: y}});
        }
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.READY_SET_GO, forcePositions);
        if (Global.TABLE_HEAD) {
            _this.events.subscribe(RacerEvents.TABLE_GAME_ENDED, gameEnded);
            _this.events.subscribe(RacerEvents.OFF_TRACK, offTrack);
            _this.events.subscribe(RacerEvents.LAP_COUNTER, lapCounter);
        }
    }
    
    function forcePositions() {
        _this.events.unsubscribe(RacerEvents.READY_SET_GO, forcePositions);
        _this.delayedCall(function() {
            _forcePositions = true;
            loop();
            _forcePositions = false;
        }, 5000);
    }
    
    function lapCounter(e) {
        Data.SOCKET.hardwareUpdate({type: 'lap_complete', index: e.player, laps: e.laps});
        if (e.laps == Config.GAME.laps && Config.GAME.canFinish) {
            Data.SOCKET.playerFinished(e.player);
        }
    }
    
    function offTrack(e) {
        switch (e.type) {
            case 'offTrack': Data.SOCKET.hardwareUpdate({type: 'off_track', index: e.player, offTrackData: e.offTrackData}); break;
            case 'onTrack': Data.SOCKET.hardwareUpdate({type: 'return_track', index: e.player}); break;
        }
    }
    
    function gameEnded() {
        var order = tablePlayerOrder();
        Data.SOCKET.hardwareUpdate({type: 'game_ended', players: order});
    }

    //*** Public Methods
    this.register = function(index, renderer, car) {
        _tracks[index] = {renderer: renderer, car: car};
    }
    
    this.destroy = function() {
        Render.stopRender(loop);
        _tracks = null;
        return this._destroy();
    }
}); 