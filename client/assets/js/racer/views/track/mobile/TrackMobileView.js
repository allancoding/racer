Class(function TrackMobileView() {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _tracks, _order, _chrome, _ready, _banner, _result;
    var _finished;
    
    //*** Constructor
    (function() {
        initHTML();
        initTracks();
        initViews();
        addListeners();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').setZ(1);
        $this.mouseEnabled(false);
    }
    
    function initTracks() {
        var dimensions = Data.LOBBY.getDimensions();
        var players = Data.LOBBY.getPlayers();
        var scale = .67;
        
        _tracks = new Array();
        for (var i = 0; i < players.length; i++) {
            var data = {};
            data.player = players[i];
            data.screens = dimensions.screens;
            data.width = dimensions.width;
            data.height = dimensions.height;
            data.scale = scale;
            data.index = i;
            data.color = players[i].color;
            
            var track = _this.initClass(TrackPathView, data);
            _tracks.push(track);
        }
    }
    
    function initViews() {
        if (!Config.PRESENTATION) _chrome = _this.initClass(ChromeExperimentView, { show: true, noClick: true });
        _ready = _this.initClass(TrackMobileViewReady);
        _banner = _this.initClass(TrackMobileViewBanner);
    }

    //*** Event handlers
    function addListeners() {
        _ready.events.add(HydraEvents.COMPLETE, startGame);
        _this.events.bubble(_banner, HydraEvents.COMPLETE);
        _this.events.subscribe(RacerEvents.LAP_COUNTER, updateLaps);
        _this.events.subscribe(RacerEvents.FORCE_END, forceEnd);
        _this.events.subscribe(RacerEvents.GAME_DISCONNECT, disconnect);
        _this.events.subscribe(RacerEvents.READY_SET_GO, readySetGo);
    }
    
    function forceEnd() {
        for (var i = 0; i < _tracks.length; i++) {
            if (_tracks[i]) _tracks[i].forceEnd();
        }
    }
    
    function disconnect(e) {
        _this.disconnected = true;
        _banner.stopCounter();
        for (var i = 0; i < _tracks.length; i++) {
            _tracks[i].stopRender();
        }
    }

    function updateLaps(e) {
        if (e.laps <= Config.GAME.laps) {
            _banner.updateLaps(e.laps);
        }
        
        if (e.laps == Config.GAME.laps-1 && Config.GAME.canFinish) {
            SCSound.send("final_lap");
            var lastlap = _this.initClass(TrackTitleView, { text: 'FINAL LAP' });
            lastlap.animateIn(function(){
                lastlap.animateOut(function(){
                    lastlap = lastlap.destroy(); 
                });
            });
        }
        
        if (e.laps == Config.GAME.laps && Config.GAME.canFinish) {
            _finished = _this.initClass(TrackTitleView, { text: 'FINISHED' });
            _finished.animateIn(function(){
                _finished.tween({ opacity: 0.15 }, 300, 'easeOutSine', 300);
            });
            _banner.stopCounter();
            Data.SOCKET.playerFinished(e.player, _banner.timeText, e.color);
        }
    }
    
    function readySetGo(e) {
        if (Global.PLAYER_INDEX == 0) {
            Global.RACE_START_TIME = Date.now();
            GATracker.trackPage('race_begin');
            GATracker.trackEvent('race', 'session_played', Data.SOCKET.getCode(), 1);
        }
        
        _this.delayedCall(_ready.animateIn, e.delay);
    }
    
    function startGame() {
        _this.events.fire(HydraEvents.COMPLETE);
        _banner.start();
        _ready = _ready.destroy();
    }

    //*** Public Methods
    this.startRender = function() {
        for (var i = 0; i < _tracks.length; i++) {
            _tracks[i].ready();
        }
    }
    
    this.finish = function(e) {
        if (Global.PLAYER_INDEX == 0) {
            GATracker.trackPage('race_ends');
            GATracker.trackEvent('race', 'race_duration', Data.SOCKET.getCode(), Date.now() - Global.RACE_START_TIME);
        }
        
        _order = e.order;
        for (var i = 0; i < e.order.length; i++) {
            var order = e.order[i];
            if (_tracks[order.player] && !_tracks[order.player].finished) _tracks[order.player].finish();
            if (order.player == Global.PLAYER_INDEX && !_banner.set) {
                var text = RacerUtil.formatPlaceWord(e.place);
                _banner.setText(text, order.lap_time);
            }
        }
    }
    
    this.result = function(place) {
        _this.finished = true;
        _banner.animateOut();
        
        var winner = Data.LOBBY.getPlayer(_order[0].player);
        _result = _this.initClass(TrackMobileViewResult, { place: place, winner: _order[0].color, winner_name: winner.name });
        _result.animateIn(function(){
            _finished = _finished.destroy();
            _banner = _banner.destroy();
            _chrome = _chrome.destroy();
            for (var i = 0; i < _tracks.length; i++) {
                _tracks[i] = _tracks[i].destroy();
            }
        });
    }
    
    this.throttle = function(e) {
        if (_this.finished) return false;
        if (_tracks[e.player]) _tracks[e.player].throttle(e);
    }
    
    this.update = function(e) {
        if (_this.finished) return false;
        if (_tracks[e.player]) _tracks[e.player].update(e);
    }
    
    this.offTrack = function(e) {
        if (_tracks[e.player]) _tracks[e.player].offTrack(e);
    }
    
    this.crash = function(e) {
        if (_tracks[e.player]) _tracks[e.player].crash(e);
    }
    
    this.lap = function(e) {
        if (_tracks[e.player]) _tracks[e.player].lap(e);
    }
    
    this.animateIn = function() {
        for (var i = 0; i < _tracks.length; i++) {
            _this.delayedCall(_tracks[i].animateIn, i*600);
        }
        
        _this.delayedCall(Data.SOCKET.readySetGo, Data.LOBBY.getNumPlayers()*600+600);
        _banner.animateIn();
    }
    
    this.animateOut = function(callback) {
        _this.delayedCall(_result.animateOut, 200, callback);    
    }
});
