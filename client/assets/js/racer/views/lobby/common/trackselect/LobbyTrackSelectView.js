Class(function LobbyTrackSelectView(_size) {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _tracks, _width, _height, _trackWidth, _trackHeight;
    var _data = [];
    
    //*** Constructor
    (function() {
        initHTML();
        initTracks();
        resizeHandler();
        _this.delayedCall(animateIn, 200);
    })();
    
    function initHTML() {
        $this = _this.element;
        $this.css({ width: '100%' }).setZ(30);
        $this.invisible();
    }
    
    function initTracks() {
        var modes = [
            'EASY',
            'MEDIUM',
            'RIDICULOUS'
        ]
        
        _tracks = new Array();
        for (var i = 0; i < 3; i++) {
            var track = _this.initClass(LobbyTrackSelectViewTrack, { text: modes[i], index: i });
            _this.events.bubble(track, HydraEvents.CLICK);
            _tracks.push(track);
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
        _trackHeight = Math.round(_height*0.33)+10;
        _trackWidth = (_width/_trackHeight > 12) ? _trackHeight*12 : _width;
        $this.css({ width: '100%', height: _height*1.02-2+_size+Math.round(_size/10)*2, top: _size*0.75+10 }); //, left: _width/2-_trackWidth/2
        for (var i = 0; i < _tracks.length; i++) {
            _tracks[i].css({ top: _trackHeight*i+i*6 }); //-_size*0.95+i*6
            _tracks[i].resize(Math.round(_trackWidth), Math.round(_trackHeight*0.9));
        }
    }
    
    function animateIn() {
        $this.visible();
        for (var i = 0; i < _tracks.length; i++) {
            _this.delayedCall(_tracks[i].animateIn, i*100);
        }
    }
    
    //*** Public Methods
    this.animateOut = function(callback) {
        $this.tween({ opacity: 0 }, 300, 'easeOutSine', callback);
    }
    
    this.resize = function(size, width) {
        _size = size;
        _width = width;
        resizeHandler();
    }
    
    this.select = function(index) {
        for (var i = 0; i < _tracks.length; i++) {
            if (i == index) _tracks[i].select();
            else _tracks[i].unselect();
        }
    }
});
