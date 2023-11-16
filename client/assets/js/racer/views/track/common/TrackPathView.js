Class(function TrackPathView(_data) {
    Inherit(this, View);
    var _this = this;
    var $this, $debug;
    var _width, _height;
    var _views, _path, _canvas, _renderer;
    var _paper = new paper.PaperScope();
    var _last = Date.now();
    var _overflow = 0;
    var _fps = 1000 / 60;
    var _framerate;

    //*** Constructor
    (function() {
        Data.TRACK.getTrack(_data.index + 1);
        initHTML();
        initViews();
        initCanvas();
        setTimeout(createTrack, 10);
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').css({ top: 18 });
        //$this.hide();
        
        if (Config.DEVELOPMENT) {
            $debug = $('.debug');
            $debug.fontStyle('Arial', 14, '#fff');
            $debug.css({bottom: RacerDevice.mobile ? 25 : 50, right: 10});
            $this.addChild($debug);
            if (_data.index == 0) setDebug();
        }
        
        _width = _data.width;
        _height = _data.height;
    }
    
    function setDebug() {
        $debug.text(Math.round(_framerate)+'fps / '+Global.LATENCY+'ms');
        _this.delayedCall(setDebug, 250);
    }
    
    function initViews() {
        _renderer = _this.initClass(TrackPathViewRenderer, _data);
    }
    
    function initCanvas() {
        _canvas = _this.initClass(Canvas);
        _canvas.size(_width*1.3, _height);
        _canvas.div.id = 'paper_canvas_'+Utils.timestamp();
    }
    
    function createTrack() {
        _paper.setup(_canvas.div.id);
        $this.div.removeChild(_canvas.div);
        
        var track = Data.TRACK.getTrack(_data.index + 1);
           
        var layer = new _paper.Layer();
        _path = layer.importSvg(track.svg).firstChild.firstChild;
        _path.strokeColor = Config.COLORS[_data.color];
        _path.strokeWidth = Global.TABLE ? 2 : 3;
           
        var scaleX = (_width*track.paddingX) / track.width;
        var scaleY = (_height*track.paddingY) / track.height;
        var players = Data.LOBBY.getNumPlayers();
        var trackSW = track.width * scaleX;
        var trackSY = track.height * scaleY;
        var single = Global.SINGLE_PLAYER || players == 1;
           
        if (!Global.TABLE && !(Config.PRESENTATION && players == 5)) {
            _path.position.x = (_width/2 - trackSW/2) * track.positionX;
            _path.position.y = (_height/2 - trackSY/2) * track.positionY;
            _path.position.x += (track.width*track.offset) * _data.index;
            
            if (!single) _path.scale(scaleX, scaleY);
            else _path.scale(scaleY);
        } else {
            if (Global.TABLE_HEAD) $this.css({left: track.positionX, top: track.positionY});
        }
        
        if (Global.PRESENTATION) {
            _path.position.y += 10;
        }
            
        _paper.view.draw();
            
        _renderer.setPath(_path);
        _renderer.draw(_canvas.context.canvas, _data.screens, _width, _height);
        if (!Global.TABLE_DEBUG) _canvas = _canvas.destroy();
    }
    
    function loop(t) {
        var diff = t - _last;
        var frames = ~~(diff / _fps);
        if (frames < 1) frames = 1;
        if (frames > 10) frames = 10;
        _last = t;
        _framerate = 1000 / diff;
        
        if (RacerDevice.MAKEUP_FRAMES) {
            for (var i = 0; i < frames; i++) {
                _renderer.render();
            }
        } else {
            _renderer.render();
        }
    }
    
    //*** Event handlers
    
    //*** Public Methods
    this.animateIn = function() {
        _renderer.animateIn();
    }
    
    this.disable = function() {
        _renderer.disable();
    }
    
    this.ready = function() {
        Render.startRender(loop);
        _renderer.car.checkScreen = true;
    }
    
    this.finish = function() {
        _this.finished = true;
        _renderer.finish();
    }
    
    this.throttle = function(data) {
        switch (data.type) {
            case 'on': 
                _renderer.throttle(data.time);
            break;
            case 'off': 
                _renderer.killThrottle(data.time); 
            break;
        }
        
        _this.pushUpdate();
    }
    
    this.update = function(data) {
        _renderer.setValues(data.values, data.time);
    }
    
    this.offTrack = function(data) {
        _renderer.offTrack(data);
        if (Global.PLAYER_INDEX == -1) {
            _renderer.setValues(data.values, data.time);
        }
    }
    
    this.crash = function(data) {
        _renderer.crash(data);
    }
    
    this.pushUpdate = function() {
        if (_renderer.isOnScreen() || Global.TABLE) {
            Data.SOCKET.update(_data.index, _renderer.getValues());
        }
    }
    
    this.debugDraw = function(x, y) {
        _renderer.draw(_canvas.context.canvas, null, _width, _height, x, y);
    }
    
    this.debugClear = function() {
        _renderer.clear();
    }
    
    this.stopRender = function() {
        Render.stopRender(loop);
    }
    
    this.forceEnd = function() {
        if (!_renderer.finished) {
            _renderer.explode();
            if (Global.PLAYER_INDEX == 0) Data.SOCKET.lapCount(_data.index, Config.GAME.laps);
        }
    }
    
    this.lap = function(e) {
        _renderer.lap(e);
    }
    
    this.destroy = function() {
        if (_canvas) _canvas = _canvas.destroy();
        _views = _path = _canvas = _renderer = _paper = null;
        Render.stopRender(loop);
        return _this._destroy();
    }
});
