Class(function TrackPathViewRenderer(_data) {
    Inherit(this, View);
    var _this = this;
    var $this, $track, $start, $canvas, $tableLine;
    var _canvas, _filter, _car, _path, _player;
    var _position, _rotation, _elapsed, _velocity, _throttle;
    var _values = {};
    var _decrement = 0;
    var _friction = .95;
    var _dimensions;
    var _pulse = 0;
    var _updated;
    var _updateTick = 3;
    var _lastLap = Date.now();
    var _offTrack, _crashed, _saveTime, _offTrackInter;
    var _offset, _screenStartX;
    
    var _traction = Data.TRACK.getTraction(_data.index);
    var _maxVelocity = Data.TRACK.getMaxVelocity();
    
    var THROTTLE = 0.15;
    
    this.laps = 0;
    this.position = 0;
    this.player = _data.index;
    this.color = _data.color;

    //*** Constructor
    (function() {
        initHTML();
        initTrack();
        initCanvas();
        if ((_data.index == 0 && Global.ISHOST) || (_data.index == 0 && !RacerDevice.mobile)) initStartLine();
        if (Config.DEVELOPMENT) _this.events.subscribe(RacerEvents.DEBUG_DUMP, debugDump);
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%');
    }

    function initTrack() {
        $track = $('.track');
        $track.setZ(2);
        $this.addChild($track);
        
        _car = _this.initClass(TrackCarView, { scale: 0.6, index: _data.index, color: _data.color });
        _this.car = _car;
        $track.addChild(_car);
                
        Global.TRACK.observer.register(_data.index, _this, _car);
    }
    
    function initStartLine() {
        $start = $('.start');
        var num = Data.LOBBY.getNumPlayers();
        var width = num*24+30;
        $start.size(12,18).css({ width: width }).transformPoint(0,0);
        $start.bg(Config.PATH+'assets/images/track/startline.png');
        $track.addChild($start);
    }
    
    function initCanvas() {
        $canvas = $('.canvas');
        $canvas.size('100%');
        $this.addChild($canvas);
        
        if (Global.TABLE && RacerDevice.mobile) {
            var config = Data.TABLE.getPlayerConfig();
            $tableLine = $('.table_line');
            $tableLine.css({width: '100%', height: config.lineWidth, top: config.startY + (config.offsetY * _data.index)});
            $tableLine.bg(Config.COLORS[_data.index]).setZ(1);
            $canvas.addChild($tableLine);

            $track.transformPoint(0, 0);            
            $track.transform({scale: config.trackScale, x: config.trackX*config.trackScale, y: config.trackY*config.trackScale});
        } else {
            _canvas = _this.initClass(Canvas, true);
            $canvas.addChild(_canvas);
        }
        
        if (!Global.TABLE) {
            $canvas.css({ opacity: 0.4 });
        }
    }
    
    function debugDump() {
        /*console.log(_data.index+' '+Global.PLAYER_INDEX);
        console.log({
            finished: _this.finished,
            offTrack: _offTrack,
            lastFrame: Date.now() - _saveTime,
            position: _position,
            velocity: _velocity.length,
            throttle: _throttle,
            crashed: _crashed,
        });
        console.log('-----------');*/
    }
    
    function checkOffTrack() {
        Global.OFF_TRACK = false;
    }
   
    //*** Event handlers
    function renderCar(point, setFinish, onScreen) {
        if (!point || !_position) return false;
        var velocityPoint = _position.add(_velocity.multiply(10));
        var difference = point.subtract(velocityPoint);
        if (!difference) return false;
        var preference = 0.1;
        var midpoint = difference.multiply(preference);
            
        _rotation = difference.angle;
        _rotation = parseFloat(_rotation.toFixed(20));
        _rotation = _rotation.toFixed(10);
        _position = _position.add(midpoint);
        _position.x = parseFloat(_position.x.toFixed(20));
        _position.y = parseFloat(_position.y.toFixed(20));
            
        if (setFinish && $start) $start.css({ left: _position.x-25, top: _position.y+18 });
        
        _car.update(_position.x, _position.y, _rotation, onScreen);
    }
    
    function sendUpdate() {
        _updateTick++;
        if (_updateTick == 4) {
            _updateTick = 0;
            _this.parent.pushUpdate();
        }
    }

    //*** Public Methods
    this.finish = function() {
        if ($canvas && !Global.TABLE) {
            $canvas.tween({ opacity: 0.4 }, 300, 'easeOutSine');
        }
        if (_car) _car.finish();

        _throttle = 0;
        _this.finished = true;
        _this.position *= 1 + (4 - Data.LOBBY.getMyFinish(_this.color));
    }
    
    this.disable = function() {
        $canvas.css({ opacity: 0.3 });
    }
    
    this.animateIn = function() {
        if (!_car.visible) _car.animateIn();
        _this.delayedCall(function(){
            if (_filter) _filter.clear();
            if ($canvas) {
                $canvas.tween({ opacity: 1 }, 300, 'easeOutSine', $canvas.clearAlpha);
            }
        }, 950);
    }
    
    this.setPath = function(path) {
        _position = path.getPointAt(path.length);
        if (!_position) {
            //sometimes paper.js gets weird and returns null once before it returns the actual value
            while (!_position) _position = path.getPointAt(path.length);
        }
        _rotation = 0;
        _elapsed = 0;
        _velocity = new Point(0, 0);
        _velocity.length = 0;
        _throttle = 0;

        _path = path;
        _this.path = path;
        _this.velocity = 0;
        
        renderCar(_path.getPointAt(0), true, true);
        
        _velocity.length = 0.15;
        _this.render();
        _velocity.length = 0;
    }
    
    this.render = function(makeUp) {
        if (Global.TABLE_DEBUG || _offTrack || _crashed) return false;
        var onScreen = _this.isOnScreen();
        var positionOld = _position;
        var rotationOld = _rotation;
        var time = Date.now();
        _saveTime = time;
        
        var trackOffset = _path.length - (_elapsed % _path.length);
        var trackPoint = _path.getPointAt(trackOffset);
        var trackAngle = _path.getTangentAt(trackOffset);
        
        if (!trackAngle) {
            while (!trackAngle) {
                trackAngle = _path.getTangentAt(trackOffset);
            }
        }
        
        trackAngle = trackAngle.angle;
        
        if (!this.finished) this.position = _elapsed / _path.length;
                
        if (!_throttle) _velocity.length *= _friction;
        
        _velocity.length += _throttle;
        
        if (_velocity.length > _maxVelocity) _velocity.length = _maxVelocity;
        _velocity.angle = trackAngle;
        
        trackOffset -= _velocity.length;
        _elapsed += _velocity.length;
        
        //see if a lap has completed
        if (trackOffset < 0 && !_this.finished) {
            if (time - _lastLap > 500) { //no cheating!
                _lastLap = time;
                
                while (trackOffset < 0) trackOffset += _path.length;
                trackPoint = _path.getPointAt(trackOffset);
                
                if (Global.TABLE_HEAD) {
                    _this.laps++;
                    _this.events.fire(RacerEvents.LAP_COUNTER, {laps: _this.laps, player: _data.index});
                } else {
                    if (Global.PLAYER_INDEX == 0) Data.SOCKET.lapCount(_data.index, _this.laps);
                }
            }
        }
        
        if (_velocity.length > 0.1) renderCar(trackPoint, null, _this.isOnScreen(40));
        
        //see if the car needs to fly off the track
        var distance = _position.getDistance(trackPoint);
        if (onScreen) _car.updateDistance(distance, _traction);
        if (distance > _traction && !_offTrack && Config.GAME.offTrack && !_this.finished && !_car.isOffTrack) {
            var offTrackAngle = Math.abs(_rotation);
            var canFlyOff = true;
            //make sure it's not flying off on a straightway
            if (_velocity.length < 3) canFlyOff = false;
            if (offTrackAngle > -6 && offTrackAngle < 6) canFlyOff = false;
            if (offTrackAngle > 88 && offTrackAngle < 92) canFlyOff = false;
            if (offTrackAngle > 174 && offTrackAngle < 186) canFlyOff = false;
            if (Global.TABLE && !Global.TABLE_HEAD) canFlyOff = false;
            
            if (canFlyOff) {
                _offTrack = true;
                if (!onScreen) _offTrackInter = _this.delayedCall(checkOffTrack, 300);
                if (Global.PLAYER_INDEX == _data.index) Global.OFF_TRACK = true;
                _throttle = 0;
                if (_data.index == Global.PLAYER_INDEX) GATracker.trackEvent('race', 'game_event', 'off_track');
                _car.offTrack(_velocity.length);
                _this.events.fire(RacerEvents.OFF_TRACK, {player: _data.index, type: 'offTrack', offTrackData: _car.getOffTrackData()});
                if (onScreen) Data.SOCKET.offTrack(_data.index, _this.getValues());
            }
        }
       
        //push updated to the other devices
        if (!makeUp && !_offTrack && !_crashed && onScreen) {
            sendUpdate();
        } else {
            _updateTick = 3;
        }
    }
    
    this.getValues = function() {
        _values.p = _position.clone();
        _values.r = _rotation;
        _values.e = _elapsed;
        _values.v = _velocity.length;
        _values.pos = _this.position;
        return _values;
    }
    
    this.setValues = function(val, time) {
        var canSet = true;

        if (_velocity.length < 0.1) _velocity.length = val.v;
        if (Global.PLAYER_INDEX > -1) {
            var jumpPosition = (val.pos - _this.position) > .025;
            if (_this.isOnScreen() && Global.PLAYER_INDEX != -1 && !jumpPosition && !Global.TABLE) canSet = false;
        } else {
            if (Utils.findDistance(val.p, _car) < 200) {
                canSet = false;
            }
        }
                
        if (!canSet) return false;
        _position.x = val.p.x;
        _position.y = val.p.y;
        _rotation = val.r;
        _elapsed = val.e;
        _velocity.length = val.v;
        
        var frames = (time / (1000 / 60));
        if (frames > 10) frames = 10;
        for (var i = 0; i < frames; i++) {
            _this.render(Global.PLAYER_INDEX != -1);
        }
    }
    
    this.throttle = function(time) {
        if (_this.finished) return false;
        _decrement = 0;
        _throttle = THROTTLE;
        _car._throttle = true;

        var frames = time / (1000 / 60);
        var onScreen = _this.isOnScreen() && time < 75;
        var offset = Global.PLAYER_INDEX == -1 ? .5 : .215;
        
        if (frames > 10) frames = 10;
        for (var i = 0; i < frames; i++) {
            if (onScreen) _velocity.length += _throttle * Math.round(frames*offset);
            else _this.render(true);
        }
    }
    
    this.killThrottle = function(time) {
        _throttle = 0;
        var frames = time / (1000 / 60);
        var onScreen = _this.isOnScreen();
        var offset = Global.PLAYER_INDEX == -1 ? .005 : .015;
        if (frames > 10) frames = 10;
        for (var i = 0; i < frames; i++) {
            if (onScreen) _velocity.length *= _friction - Math.round(frames*offset);
            else _velocity.length = 0;
        }
            
        _this.render(true);
        if (_this.isOnScreen()) _this.parent.pushUpdate();
    }
    
    this.isOnScreen = function(margin, x) {
        x = x || _car.x;
        margin = margin || 20;
        if (typeof _screenStartX == 'undefined') return false;
        if (Global.SINGLE_PLAYER || Global.TABLE) return true;
        return x > _screenStartX+_offset-margin && x < _screenStartX+_offset+RacerDevice.width+margin;
    }
    
    this.draw = function(canvas, screens, width, height, offsetX, offsetY) {
        var x = 0;
        if (screens) {
            var me = Global.PLAYER_INDEX;
            for (var i = 0; i < screens.length; i++) {
                if (i < me) {
                    x += screens[i].w;
                }
            }
        }
        
        _screenStartX = x;
        
        var overlap = Config.GAME.overlap * Global.PLAYER_INDEX;
        var canvasWidth = RacerDevice.mobile ? RacerDevice.width+overlap : width*1.5;
        if (Global.TABLE && RacerDevice.mobile) {
            canvasWidth = RacerDevice.width;
            height = RacerDevice.height*2;
        }
               
        $track.size(width, height, true);
        if (!Global.TABLE) {
            _canvas.size(canvasWidth, height, false);
            _canvas.context.drawImage(canvas, -x, 0);
            _canvas.object.css({top: '50%', marginTop: -height/2});
            $track.css({left: -x, top: '50%', marginTop: -height/2});
            
            if (Global.PLAYER_INDEX == 0) {
                if (!Global.SINGLE_PLAYER) {
                    $this.css({left: Config.GAME.overlap});
                    _offset = -Config.GAME.overlap;
                }
            } else {
                $this.css({left: -overlap});
                _offset = overlap;
            }
        } else {
            if (Global.TABLE_HEAD || (Global.TABLE_DEBUG && !RacerDevice.mobile)) {
                var tableX = offsetX || Number(Utils.cookie('table_x'));
                var tableY = offsetY || Number(Utils.cookie('table_y'));
                _canvas.size(canvasWidth, height, false);
                _canvas.context.clearRect(0, 0, canvasWidth, height);
                _canvas.context.drawImage(canvas, tableX || 0, tableY || 0);
                $track.css({left: tableX, top: tableY});
            }
        }
                        
        _this.render();
    }
    
    this.clear = function() {
        if (_canvas) _canvas.context.clearRect(0, 0, _canvas.div.width, _canvas.div.height);
    }
    
    this.resetCar = function(type) {
        if (type != 'crash') {
            _throttle = 0;
            _velocity.length = 0;
        }
    }
    
    this.crash = function(data) {
        var onScreen = _this.isOnScreen(1);
        if (!_crashed) {
            _this.crashed = true;
            _crashed = true;
            _throttle = 0;
            
            if (onScreen) {
                if (_velocity.length > 0.1) _velocity.length *= .3;
                else _velocity.length = 5;
            } else {
                _velocity.length = 0;
                _this.render();
                _offTrack = true;
            }
            
            setTimeout(function() {
                _offTrack = true;
            }, 400 - (data ? data.time : 0));
                   
            if (!data) {
                if (onScreen) Data.SOCKET.crashed(_data.index, _this.getValues());
                _car.crash(0);
            } else {
                _this.setValues(data.values, data.time);
                _car.crash(data.time);
            }
                        
            if (Global.PLAYER_INDEX == _data.index) {
                Global.OFF_TRACK = true;
                _this.events.fire(RacerEvents.OFF_TRACK, {player: _data.index, type: 'crash'});
            }
        }
    }
    
    this.unCrash = function() {
        if (this.isOnScreen()) _this.parent.pushUpdate();
        _offTrack = false;
        _crashed = false;
        if (Global.PLAYER_INDEX == _data.index) Global.OFF_TRACK = false;
        _this.delayedCall(function() {
            _this.crashed = false;
        }, 3000);
    }
    
    this.onTrack = function() {
        if (_offTrack) {
            if (Global.PLAYER_INDEX == _data.index) Global.OFF_TRACK = false;
            _this.events.fire(RacerEvents.OFF_TRACK, {player: _data.index, type: 'onTrack'});
            _offTrack = false;
        }
    }
    
    this.offTrack = function(data) {
        clearTimeout(_offTrackInter);
        if (!_offTrack) {
            _offTrack = true;
            _this.setValues(data.values, data.time);
            _car.offTrack(_velocity.length, data.time);
            _throttle = 0;
            _velocity.length = 0;
        }
    }
    
    this.explode = function() {
        _throttle = 0;
        _this.finished = true;
        _this.laps = Config.GAME.laps-1;
        _car.explode();
    }
    
    this.lap = function(e) {
        if (e.player == Global.PLAYER_INDEX) {
            _this.laps++;
            _this.events.fire(RacerEvents.LAP_COUNTER, {laps: _this.laps, player: _data.index, color: _data.color});
        }
    }

    this.getOffTrack = function() {
        return _offTrack;
    }    
    
    this.destroy = function() {
        if (_canvas) _canvas.destroy();
        return this._destroy();
    }
});