Class(function TrackMobileViewBanner() {
    Inherit(this, View);
    var _this = this;
    var $this, $position, $timer, $laps;
    var _height = 10+(window.innerHeight/20);
    var _timerInterval, _time = 0, _place = null;
    _this.timeText = '0:00';
    
    _this.stoped = false;
    _this.set = false;
    
    //*** Constructor
    (function() {
        initHTML();
        initPosition();
        initTimer();
        initLaps();
        if (Config.DEVELOPMENT) _this.events.subscribe(RacerEvents.DEBUG_DUMP, function(){ console.log(_place); });
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%', _height).css({ top: 0, left: 0, background: Global.GRADIENT }).setZ(20);
        $this.mouseEnabled(false);
        $this.invisible();
    }
    
    function initPosition() {
        $position = $('.position');
        $position.fontStyle('AvantGarde-BoldObl', _height*0.5, '#fff');
        if (!Global.SINGLE_PLAYER) $position.text('WAITING');
        $position.css({ left: _height*0.5, width: _height*2, top: _height*0.3-1, textAlign: 'left', opacity: 0.6, letterSpacing: _height*0.02+'px' });
        $this.addChild($position);
    }
    
    function initLaps() {
        $laps = $('.laps');
        $laps.css({ right: _height*0.6+_height*1.6, width: _height*2, textAlign: 'center', height: '100%', opacity: 0.6, overflow: 'visible', borderLeft: '1px solid rgba(255,255,255,0.4)', borderRight: '1px solid rgba(255,255,255,0.4)' });
        $this.addChild($laps);
        
        $laps.inner = $('.laps-current');
        $laps.inner.fontStyle('AvantGarde', _height*0.5, '#fff');
        $laps.inner.css({ left: 0, top: _height*0.3-1, textAlign: 'center', width: '100%', letterSpacing: _height*0.04+'px' });
        $laps.inner.text('0/'+Config.GAME.laps);
        $laps.addChild($laps.inner);
    }
    
    function initTimer() {
        $timer = $('.timer');
        $timer.fontStyle('AvantGarde', _height*0.5, '#fff');
        $timer.text(_this.timeText);
        $timer.css({ right: _height*0.3, width: _height*1.5, top: _height*0.3-1, textAlign: 'center', opacity: 0.6, letterSpacing: _height*0.03+'px' });
        $this.addChild($timer);
    }

    //*** Event handlers
    function positionChange(positions) {
        if (positions && !_this.set && !_this.stoped) {
            for (var i = 0; i < positions.length; i++) {
                if (Global.COLOR_INDEX == positions[i]) {
                    _place = RacerUtil.formatPlaceWord(i);
                    if ($position && $position.text) $position.text(_place);
                }
            }
        }
    }
    
    function updateTimer() {
        _this.timeText = RacerUtil.formatTime(_time);
        $timer.text(_this.timeText);
        _time += 1;
    }
    
    function stopInterval() {
        clearInterval(_timerInterval);
        $position.tween({ opacity: 1 }, 200, 'easeOutSine');
        $timer.tween({ opacity: 1 }, 200, 'easeOutSine');
        $laps.tween({ opacity: 1 }, 200, 'easeOutSine');
    }

    //*** Public Methods
    this.updateLaps = function(laps) {
        $laps.inner.text(laps+'/'+Config.GAME.laps);
    }
    
    this.stopCounter = function() {
        _this.stoped = true;
        if (_timerInterval) stopInterval();
    }
    
    this.setText = function(place, time) {
        _this.set = true;
    }
    
    this.animateIn = function() {
        Data.SOCKET.bind('position_change', positionChange);
        $this.visible().transform({ y: -_height }).tween({ y: 0 }, 500, 'easeInOutCubic');
    }
    
    this.animateOut = function() {
        if (_timerInterval) clearInterval(_timerInterval);
        $this.tween({ y: -_height }, 500, 'easeInOutCubic', $this.invisible);
    }
    
    this.start = function() {
        _time = 1;
        if (!_this.stoped) _timerInterval = setInterval(updateTimer, 1000);
    }
    
    this.destroy = function() {
        if (_timerInterval) clearInterval(_timerInterval);
        return this._destroy();
    }
});
