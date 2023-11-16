Class(function Track() {
    Inherit(this, Controller);
    var _this = this;
    var $container, $start;
    var _init, _view, _glow, _observer, _killThrottle, _endInter;
    var _pressed;
    var _time = Date.now();
    
    _this.finished = false;
    
    //*** Constructor
    (function() {
        initContainer();
        if (RacerDevice.mobile && !Global.TABLE) initInitializing();
        else initClasses();
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%').setZ(5);
    }
    
    function initInitializing() {
        GATracker.trackPage("building_track");
        _init = _this.initClass(TrackInitializingView);
        _init.events.add(HydraEvents.COMPLETE, initClasses);
    }
    
    function initClasses() {
        Global.BUILDING_TRACK = true;
        if (RacerDevice.mobile) _glow = _this.initClass(TrackGlowView);
        Global.TRACK.observer = _this.initClass(TrackObserver, true);
        
        var track = Global.TABLE ? TrackTableView : RacerDevice.mobile ? TrackMobileView : TrackDesktopView;
        _view = _this.initClass(track);
        _view.events.add(HydraEvents.COMPLETE, addListeners);
        
        _this.delayedCall(checkSound, 1000);
    }
    
    function checkSound() {
        if (Global.TABLE || Config.DISABLE_SOUNDS) return trackReady();
        if (!RacerSound.checkReady()) {
            _this.delayedCall(checkSound, 20);
        } else {
            trackReady();
        }
    }

    function trackReady() {
        if (!Global.TABLE) {
            //_init.animateOut();
            Data.SOCKET.trackReady();
        }
    }
    
    //*** Event handlers
    function addListeners() {
        if (!Device.mobile) {
            $container.bind('mousedown', throttleOn);
            $container.bind('mouseup', throttleOff);
        } else {
            $container.bind('touchstart', throttleOn);
            $container.bind('touchend', throttleOff);
        }
        
        Data.SOCKET.bind('throttle', _view.throttle);
        Data.SOCKET.bind('update', updateEvent);
        Data.SOCKET.bind('offTrack', _view.offTrack);
        Data.SOCKET.bind('crash', _view.crash);
        Data.SOCKET.bind('lapCount', _view.lap);
        
        _this.events.subscribe(RacerEvents.OFF_TRACK, offTrack);
        _this.events.subscribe(RacerEvents.PLAYER_FINISHED, playerFinished);
        
        if (Global.TABLE) _this.events.subscribe(RacerEvents.TABLE_GAME_ENDED, tableGameEnded);
        
        Global.OFF_TRACK = false;
        _this.finished = false;
        _killThrottle = false;
    }
    
    function updateEvent(e) {
        _view.update(e);
        Global.BUILDING_TRACK = false;
    }
    
    function offTrack(e) {
        if (e.type == 'offTrack') {
            if (e.player == Global.PLAYER_INDEX) {
                if (_glow) _glow.animateOut();
            }
        }
    }
       
    function throttleOn(e) {
        if (RacerDevice.mobile && !Global.OFF_TRACK && !_this.finished && !_killThrottle) {
            if (Global.TABLE && !Global.PLAYING_TABLE) return false;
            var lastThrottle = Date.now() - _time;
            if (lastThrottle > 250) {
                Data.SOCKET.throttle('on');
                _time = Date.now();
                var touch = Utils.touchEvent(e);
                var x = touch.x;
                var y = touch.y;

                if (_glow) _glow.animateIn(x,y);
                if (Global.TABLE) Data.SOCKET.hardwareUpdate({type: 'throttle_on', index: Global.PLAYER_INDEX});
                else RacerSound.throttle('on');
            } else {
                _pressed = true;
                //setTimeout(throttleOn, 250 - lastThrottle);
            }
        }
    }
    
    function throttleOff() {
        if (RacerDevice.mobile) {
            if (Global.TABLE && !Global.PLAYING_TABLE) return false;
            _pressed = false;
            Data.SOCKET.throttle('off');
            if (_glow) _glow.animateOut();
            if (Global.TABLE) Data.SOCKET.hardwareUpdate({type: 'throttle_off', index: Global.PLAYER_INDEX});
            else RacerSound.throttle('off');
        }
    }
    
    function playerFinished(e) {
        if (!_this.finished) {
            if (!Global.TABLE) _this.delayedCall(_view.finish, e.delay, e);
            else _view.finish(e);
            
            if (e.complete) {
                SCSound.send('final_car_finished');
                _this.delayedCall(showResults, e.delay+1000, e.place);
            }
            
            var finishedPlayer = Global.TABLE ? e.order[e.order.length-1] : e.order[e.order.length-1].player;
            if (RacerDevice.mobile && finishedPlayer === Global.PLAYER_INDEX) {
                _killThrottle = true;
                if (_glow) _glow.animateOut();
                SCSound.send('finished');
            }
            
            if (Data.LOBBY.getNumPlayers() - e.order.length == 1) {
                _endInter = setTimeout(function(){
                    endGame();
                }, Global.TABLE ? 5000 : 30000);
            }
        }
    }
    
    function endGame() {
        if (_this && _this.events) _this.events.fire(RacerEvents.FORCE_END);
    }
    
    function tableGameEnded(e) {
        if (Global.TABLE_MOBILE) _view.result(Number(e.winner));
    }
    
    function showResults(place) {
        _this.finished = true;
        _view.result(place);
        _this.delayedCall(returnLobby, 4400);
        //SCSound.send("fanfare_"+place);
        _this.events.fire(RacerEvents.RESULT_SHOW);
    }
    
    function returnLobby() {
        _this.events.fire(HydraEvents.COMPLETE, { animate: true });
    }

    //*** Public Methods
    this.hideInit = function() {
        _view.startRender();
        if (_init) _init = _init.destroy();
    }
    
    this.animateIn = function() {
        Global.GAME_PLAYING = true;
        if (_init) _init = _init.destroy();
        _this.delayedCall(_view.animateIn, 1500+Data.SOCKET.delay);
    }
    
    this.animateOut = function(callback) {
        Global.GAME_PLAYING = false;
        $container.setZ(5);
        _view.animateOut(callback);
    }
    
    this.destroy = function() {
        clearInterval(_endInter);
        Data.SOCKET.unbind('throttle');
        Data.SOCKET.unbind('update');
        Data.SOCKET.unbind('offTrack');
        Data.SOCKET.unbind('crash');
        Data.SOCKET.unbind('lapCount');
        return this._destroy();
    }
});
