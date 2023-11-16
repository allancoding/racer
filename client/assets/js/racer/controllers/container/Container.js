Class(function Container() {
    Inherit(this, Controller);
    var _this = this;
    var $container;
    var _menu, _lobby, _lineup, _track, _error;
    
    //*** Constructor
    (function() {
        initContainer();
        init();
        addListeners();
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%').css({ overflow: 'hidden', top: 0, left: 0, webkitBackfaceVisibility: 'hidden' }).setZ(2);
        Global.CONTAINER = $container;
        __body.addChild($container);     
    }
    
    function init() {
        $container.div.innerHTML = '';
        if (!Global.TABLE && !RacerDevice.mobile && !RacerDevice.fallback_browser) initLobby({ action: 'join' });
        initMenu();
    }
    
    function initMenu() {
        _menu = _this.initClass(Menu);
        if (!RacerDevice.mobile) __body.addChild(_menu);
        _menu.events.add(HydraEvents.COMPLETE, initLobby);
        _this.delayedCall(_menu.animateIn, 50);
    }
    
    function initLobby(e) {
        if (_menu) _menu.fadeOut();
        if (_lobby) _lobby = _lobby.destroy();
        _lobby = _this.initClass(Lobby, e.action);
        _lobby.events.add(RacerEvents.SYNCED, lobbySynced);
    }
    
    function lobbySynced() {
        if (_menu) _menu.animateOut(function() { RacerDevice.fullscreen(); if (_menu) _menu = _menu.destroy(); });
        _lobby.events.remove(RacerEvents.SYNCED);
        _lobby.events.add(HydraEvents.COMPLETE, initTrack);
    }
    
    function initTrack() {
        _this.events.unsubscribe(RacerEvents.TABLE_GAME_STARTING, initTrack);
        if (!_track) _track = _this.initClass(Track);
        
        if (RacerDevice.mobile && !Global.TABLE) {
            _lineup = _this.initClass(LineUp);
            _this.events.subscribe(RacerEvents.TRACKS_READY, showLineUp);
        } else {
            if (_lobby) _lobby.fadeOut(startGame);
            else _this.delayedCall(startGame, 400);
        }
    }
    
    function showLineUp(e) {
        _this.delayedCall(RacerDevice.fullscreen, e.delay+200);
        _this.events.unsubscribe(RacerEvents.TRACKS_READY, showLineUp);
        if (_track) _this.delayedCall(_track.hideInit, e.delay+2000);
        _this.delayedCall(_lineup.animateIn, e.delay);
        _lineup.events.add(HydraEvents.COMPLETE, startGame);
        _this.delayedCall(function(){ if (_lobby) { _lobby.container.hide(); _lobby = _lobby.destroy(); } }, e.delay+1000);
    }
    
    function startGame() {
        _this.delayedCall(RacerDevice.fullscreen, 800);
        if (_track && !Global.TABLE) _track.events.add(HydraEvents.COMPLETE, returnLobby);
        if (_track) _track.animateIn();
        if (_lineup) _lineup.animateOut(function() { if (_lineup) _lineup = _lineup.destroy(); });
        if (_lobby) _lobby.animateOut(function() { if (_lobby) _lobby = _lobby.destroy(); });
        if (_menu) _menu.animateOut(function() { if (_menu) _menu = _menu.destroy(); });
    }
    
    function returnLobby(e) {
        if (_lineup) _lineup = _lineup.destroy();
        if (_track && !e.animate) _track = _track.destroy();
        
        if (_lobby) {
            _lobby.fadeOut(function(){
                _lobby = _lobby.destroy();
                newLobby();
            });
        } else newLobby();
        
        function newLobby() {
            RacerDevice.fullscreen();
            _lobby = _this.initClass(Lobby, 'results');
            _lobby.events.add(HydraEvents.COMPLETE, initTrack);
            _this.delayedCall(function(){
                RacerDevice.fullscreen();
                if (_track && e.animate) _track.animateOut(function() { if (_track) _track = _track.destroy(); });
            }, 500);    
        }
    }
    
    //*** Event handlers
    function addListeners() {
        if (!RacerDevice.mobile) {
            _this.events.subscribe(HydraEvents.ERROR, desktopError);
            _this.events.subscribe(RacerEvents.END_SESSION, endSession);
        } else {
            _this.events.subscribe(HydraEvents.ERROR, showError);
        }
        
        _this.events.subscribe(RacerEvents.REFRESH_LOBBY, returnLobby);
    }
    
    function showError(e) {
        if (!_error) {
            _error = _this.initClass(ErrorOverlay, e);
            __body.addChild(_error);
            if (_track && !Global.BUILDING_TRACK) _track = _track.destroy();
            _error.events.add(HydraEvents.CLICK, function(e){
                _error = _error.destroy();
                switch (e.text) {
                    case 'RETURN TO LOBBY': returnLobby({ animate: false }); break;
                    case 'RETURN HOME': _this.refresh(); break;
                    case 'REFRESH': $container.hide(); window.location.reload(true); break;
                }
            });
        }
    }
    
    //*** Public Methods
    function reset(){
        if (_lobby) _lobby = _lobby.destroy();
        if (_lineup) _lineup = _lineup.destroy();
        if (_track) _track = _track.destroy();
        if (_error) _error = _error.destroy();
        
        Global.SYNC = null;
        Global.ISHOST = null;
        Global.COLOR = null;
        Global.COLOR_INDEX = null;
        Global.GRADIENT = null;       
        Global.RESULTS = null;
        Global.SINGLE_PLAYER = null;
        Global.PLACES_LOADED = null;
        
        Data.SOCKET.exitLobby();
        Data.reset();
    }
    
    function desktopError(e) {
        if (e.type == 'missing') _this.delayedCall(returnLobby, 1000, { animate: false });
    }
    
    function endSession() {
        if (_lobby) _lobby.fadeOut(refresh);
        else refresh();
        
        function refresh() {
            reset();
            _this.delayedCall(initLobby, 500, { action: 'join' });
        }
    }
    
    this.refresh = function() {
        if (_menu) _menu = _menu.destroy();
        RacerDevice.exitFullscreen();
        reset();

        _this.delayedCall(init, 500);
    }
    
    this.refreshDesktop = function() {
        reset();
        _this.delayedCall(initLobby, 500, { action: 'join' });
    }
    
}, 'Singleton');
