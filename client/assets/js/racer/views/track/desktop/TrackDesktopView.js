Class(function TrackDesktopView() {
    Inherit(this, View);
    var _this = this;
    var $this, $wrapper, $info, $meta;
    var _tracks, _code, _width, _height;
    var _players;
    var _scale = 1;
    var _update = 0;
    var _time = 0, _timerInterval;
    
    //*** Constructor
    (function() {
        initHTML();
        initTracks();
        initInfo();
        initCode();
        initPlayers();
        addListeners();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').invisible().setZ(1);
    }
    
    function initTracks() {
        $wrapper = $('.wrapper');
        $wrapper.size('100%');
        $this.addChild($wrapper);
        
        var dimensions = Data.LOBBY.getDimensions();
        var players = Data.LOBBY.getPlayers();
        var scale = .7;
        
        _width = dimensions.width;
        _height = dimensions.height;
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
            _this.delayedCall(track.ready, 2000);
            $wrapper.addChild(track);
            _tracks.push(track);
        }
        
        _this.delayedCall(resizeHandler, 2000);
    }
    
    function initCode() {
        _code = _this.initClass(LobbyCodeView,{ input: false, text: true, border: true, center: true });
        _code.css({ position: 'absolute', bottom: 40, left: 150, margin: 0 });
        _code.resize(60);
    }
    
    function initInfo() {
        $info = $('.info');
        $info.fontStyle('AvantGarde', 12, '#fff');
        $info.css({ bottom: 125, left: 150, fontWeight: 'bold', letterSpacing: '1px' });
        $this.addChild($info);
        
        var time = new Date().toTimeString();
        var isPm = Number(time.split(':')[0]) > 11;
        var hours = time.split(':')[0];
        if (isPm) hours = Number(hours)-12;
        if (hours == 0) hours = 12;
        var minutes = time.split(':')[1];
        var formatTime = hours+':'+minutes;
        formatTime += isPm ? 'PM' : 'AM';
        $info.text('<span>LIVE RACE &nbsp;/&nbsp;</span> '+formatTime+'');
    }
    
    function initPlayers() {
        _players = new Array();
        var players = Data.LOBBY.getPlayers();
        for (var i = 0; i < players.length; i++) {
            var player = _this.initClass(TrackDesktopViewPlayer, players[i]);
            player.color = players[i].color;
            player.css({ bottom: 52, left: i*100+500 });
            _players.push(player);
        }
    }
   
    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
        _this.events.subscribe(RacerEvents.GAME_DISCONNECT, disconnect);
        _this.events.subscribe(RacerEvents.READY_SET_GO, startGame);
    }
    
    function disconnect(e) {
        for (var i = 0; i < _tracks.length; i++) {
            _tracks[i].stopRender();
        }        
    }
    
    function resizeHandler(e) {
        if (_width > RacerDevice.width*.92) {
            _scale = (RacerDevice.width*.92) / _width;
            _scale = Math.round(_scale*100) / 100;
        } else {
            _scale = 1;
        }
        
        var left = RacerDevice.width/2 - _width/2 + -75;//Data.TRACK.getDesktopAdjust();
        var top = RacerDevice.height/2 - _height/2 - 50;
        $wrapper.size(_width, _height).css({left: left, top: top}).transform({scale: _scale});
    }
    
    function positionChange(order) {
        for (var i = 0; i < order.length; i++) {
            for (var j = 0; j < _players.length; j++) {
                if (_players[j].color == order[i]) {
                    var place = RacerUtil.formatPlaceWord(i);
                    _players[j].setPlace(place);
                }
            }
        }
    }
    
    function startGame(e) {
        Data.SOCKET.bind('position_change', positionChange);
        setTimeout(startTime, e.delay);
    }
    
    function startTime() {
        _time = 1;
        _timerInterval = setInterval(updateTimer, 1000);
    }
    
    function updateTimer() {
        var text = _time > 0 ? RacerUtil.formatTime(_time) : '00:00';
        for (var i = 0; i < _players.length; i++) {
            _players[i].updateTime(text);
        }
        _time += 1;
    }

    //*** Public Methods
    this.startRender = function() {
        for (var i = 0; i < _tracks.length; i++) {
            _tracks[i].ready();
        }
    }

    this.throttle = function(e) {
        if (_tracks[e.player]) _tracks[e.player].throttle(e);
    }
    
    this.update = function(e) {
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
    
    this.finish = function(e) {
        for (var i = 0; i < e.order.length; i++) {
            var order = e.order[i];
            if (_tracks[order.player] && !_tracks[order.player].finished) _tracks[order.player].finish();
        }
    }
    
    this.result = function() {
        $this.tween({ opacity: 0, scale: 0.92 }, 500, 'easeInCubic', 2500);
    }
    
    this.animateIn = function() {
        resizeHandler();
        $this.visible().transform({ scale: 0.85 }).css({ opacity: 0 }).tween({ opacity: 1, scale: 1 }, 500, 'easeOutCubic', 500, function(){
            $this.clearTransform();
            _code.animateIn(Global.CODE);
            _this.delayedCall(_code.set, 1500, Global.CODE);
            
            for (var i = 0; i < _players.length; i++) {
                _this.delayedCall(_players[i].animateIn, i*600+400);
            }
            
            for (var i = 0; i < _tracks.length; i++) {
                _this.delayedCall(_tracks[i].animateIn, i*600);
            }
            
            _this.events.fire(HydraEvents.COMPLETE);
        });
    }
    
    this.animateOut = function(callback) {
        if (callback) callback();
    }
    
    this.destroy = function() {
        if (_timerInterval) clearInterval(_timerInterval);
        Data.SOCKET.unbind('position_change');
        return _this._destroy();
    }
});
