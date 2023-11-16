 Class(function TrackCarView(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $rotate, $car, $name, $text;
    var _noUpdate;
    var _time = Date.now();
    var _setName, _sparks, _color;
    var _offTrackInter, _offTrackData;
    var _lastPos;
    
    //NOTE: We ended up switching from the .tween() method to the verbose CSS transitions in this class because we wanted to avoid creating new objects during the render loop.
    
    _this.x = 0;
    _this.y = 0;
    _this.width = 15;
    _this.height = 15;
    _this.visible = false;
    _this.crashed = false;
    _config.scale = _config.scale || 0.65;
        
    //*** Constructor
    (function() {
        initColor();
        initHTML();
        initName();
        initCar();
    })();
    
    function initColor() {
        switch (Config.COLORS[_config.color]) {
            case '#14a8df': _color = 'blue'; break;
            case '#ec1f27': _color = 'red'; break;
            case '#dac620': _color = 'yellow'; break;
            case '#3bb54a': _color = 'green'; break;
            case '#f79221': _color = 'orange'; break;
        }
    }

    function initHTML() {
        $this = _this.element;
        $this.size(60*_config.scale, 40*_config.scale).css({ marginLeft: -30*_config.scale, marginTop: -20*_config.scale });
        $this.setZ(5);
        $this.hide();
        
        $rotate = $('.rotate');
        $rotate.size('100%').setZ(1);
        $rotate.hide();
        $this.addChild($rotate);
    }
    
    function getMatrix(){
        var rad = $rotate.rotation * (Math.PI * 2 / 360);
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);
        var a = parseFloat(cos).toFixed(8);
        var b = parseFloat(sin).toFixed(8);
        var c = parseFloat(-sin).toFixed(8);
        var d = a;
        return 'matrix('+a+', '+b+', '+c+', '+d+', '+$rotate.x+', '+$rotate.y+')';
    }
    
    function applyTransform() {
        if (RacerDevice.android) $rotate.div.style.webkitTransform = getMatrix();           
        else $rotate.div.style.webkitTransform = 'translate3d('+$rotate.x+'px, '+$rotate.y+'px, 0px)rotate('+$rotate.rotation+'deg)'; 
    }
    
    function initName() {
        $name = $('.name');
        $name.size(70*_config.scale, 40*_config.scale).css({ left: -2*_config.scale });
        $name.show();
        $this.addChild($name);
        
        var $nameBg = $('.name-bg');
        $nameBg.size(70*_config.scale, 40*_config.scale);
        $nameBg.bg(Config.PATH+'assets/images/track/name-bg.png').setZ(2);
        $name.addChild($nameBg);
        
        if (!Global.TABLE) {
            var player = Data.LOBBY.getPlayer(_config.index);
            var name = (player && player.name) ? player.name : '';
            $text = $('.text');
            $text.fontStyle('AvantGarde-BoldObl', 18*_config.scale, Config.COLORS[_config.color]);
            $text.css({ width: '100%', top: 13*_config.scale, left: -2*_config.scale, textAlign: 'center' }).setZ(3);
            $text.text(name);
            $name.addChild($text);
        }
    }
    
    function initCar() {       
        $car = $('.car');
        $car.size('100%');
        $car.transformPoint(0,0).setZ(5);
        $car.transform({ scale: _config.scale });
        $car.hide();
        $rotate.addChild($car);
        
        $car.wrapper = $('.wrapper');
        $car.wrapper.size('100%');
        $car.addChild($car.wrapper);
        
        $car.image = $('.car-image');
        $car.image.size(60,40);
        $car.image.bg(Config.PATH+'assets/images/track/cars/'+_color+'.png');
        $car.image.setZ(2);
        $car.wrapper.addChild($car.image);
        
        $car.crash = $('.car-crash-hide');
        $car.crash.css({ width: 300, height: 250, top: -94, left: -112 }).bg(Config.PATH+'assets/sprites/crash/'+_color+'.png');
        $car.crash.setZ(2);
        $car.crash.invisible();
        $car.wrapper.addChild($car.crash);
    }
    
    function initOutline() {
        $car.outline = $('.car-outline');
        $car.outline.size(80,60).css({ top: -10, left: -10 });
        $car.outline.bg(Config.PATH+'assets/images/track/win-outline.gif');
        $car.outline.setZ(4);
        $car.addChild($car.outline);
    }
    
    //*** Event handlers
    function animateIn() {
        $this.show().css({ opacity: 1 });
        $name.x = $rotate.x;
        $name.y = $rotate.y;
        $name.show().css({ opacity: 0 }).transform({ scale: 0.5, x: $name.x, y: $name.y }).tween({ opacity: 1, scale: 1 }, 200, 'easeOutCubic', function(){
            $name.tween({ opacity: 0, scale: 0.7}, 200, 'easeInCubic', 500, function(){
                $name.hide();
                $rotate.show();
                if (Global.PLAYER_INDEX == 0) SCSound.send("car_place");
                animateCarIn();
            });
        });
    }
    
    function animateCarIn() {
        $car.div.style[Device.styles.vendor+'Transition'] = ''; 
        $car.wrapper.div.className = 'car-bounce';
        
        $car.image.div.style[Device.styles.vendor+'Transform'] = '';
        $car.image.div.style[Device.styles.vendor+'Transition'] = ''; 
        $car.image.div.style.opacity = 0;
        
        _this.delayedCall(function() {
            $car.image.div.style[Device.styles.vendor+'TransitionProperty'] = 'opacity'; 
            $car.image.div.style[Device.styles.vendor+'TransitionDuration'] = 400+'ms';
            $car.image.div.style[Device.styles.vendor+'TransitionTimingFunction'] = TweenManager.getEase('easeOutSine');
            $car.image.div.style.opacity = 1;
        }, 10);
        
        _this.delayedCall(function() {
            $car.image.div.style[Device.styles.vendor+'Transform'] = '';
            $car.image.div.style[Device.styles.vendor+'Transition'] = ''; 
            $car.image.div.opacity = '';
            $car.div.style[Device.styles.vendor+'Transition'] = ''; 
            
            _this.crashed = false;
            _this.parent.onTrack();
            
            setTimeout(function() {
                _this.isOffTrack = false;
            }, 500);
        }, 600);
    }

    //*** Public Methods
    this.finish = function() {
        initOutline();
        if (Global.PLAYER_INDEX == 0 || !RacerDevice.mobile) {
            $name.show().css({ opacity: 0 }).transform({ scale: 0.5, x: $name.x, y: $name.y }).tween({ opacity: 1, scale: 1 }, 400, 'easeOutCubic');
        }
        
        _this.delayedCall(function(){
            $car.tween({ opacity: 0 }, 200, 'easeOutSine');
        }, 3000);
    }
    
    
    this.update = function(x, y, rotation, onScreen) {
        if (Global.TABLE) onScreen = true;
        if (!Global.TABLE && !_this._throttle) rotation = 90;

        $rotate.x = _this.x = x;
        $rotate.y = _this.y = y;
        $rotate.rotation = _this.rotation = rotation;
        
        if (Global.PLAYER_INDEX == -1) applyTransform();
                
        if (!_noUpdate && Global.PLAYER_INDEX > -1) {
            if (!_this.checkScreen) {
                applyTransform();
            } else {
                if (onScreen) {
                    _lastPos = $rotate.x;
                    applyTransform();
                } else {
                    if (_this.parent.isOnScreen(0, _lastPos)) {
                        applyTransform();
                    }
                }
            }
        }
    }
    
    this.animateIn = function() {
        _this.visible = true;
        $this.show();
        $car.show();
        animateIn();
    }

    this.offTrack = function(velocity, time) {
        _this.isOffTrack = true;
        time = time || 0;
        applyTransform();
        _noUpdate = true;
        var endX = $rotate.x + Math.cos(Utils.toRadians($rotate.rotation)) * (35*velocity);
        var endY = $rotate.y + Math.sin(Utils.toRadians($rotate.rotation)) * (35*velocity);
        
        var off = 100*velocity - time;
        
        _offTrackData = {endX: _this.x, endY: _this.y, duration: off};
        
        if (time && Global.PLAYER_INDEX != -1) $this.hide();
        
        $car.wrapper.div.className = 'car-wrapper';
        
        _this.delayedCall(function() {
            $car.image.div.style[Device.styles.vendor+'TransitionProperty'] = '-webkit-transform, opacity'; 
            $car.image.div.style[Device.styles.vendor+'TransitionDuration'] = off+'ms';
            $car.image.div.style[Device.styles.vendor+'TransitionTimingFunction'] = TweenManager.getEase('easeInOutSine');
            $car.image.div.style[Device.styles.vendor+'Transform'] = 'rotate('+Utils.doRandom(20,40)*-velocity+'deg)';
            $car.image.div.style.opacity = 0;
            
            $rotate.div.style[Device.styles.vendor+'TransitionProperty'] = '-webkit-transform'; 
            $rotate.div.style[Device.styles.vendor+'TransitionDuration'] = off+'ms';
            $rotate.div.style[Device.styles.vendor+'TransitionTimingFunction'] = TweenManager.getEase('easeOutQuad');
            $rotate.div.style[Device.styles.vendor+'Transform'] = 'translate3d('+endX+'px, '+endY+'px, '+'0px)';

            _offTrackInter = _this.delayedCall(function() {
                $car.image.div.style[Device.styles.vendor+'Transition'] = ''; 
                $rotate.div.style[Device.styles.vendor+'Transition'] = ''; 
                $this.show();
                _this.parent.resetCar();
                _noUpdate = false;
                $rotate.div.style.webkitTransform = getMatrix();
                $car.image.clearTransform();
                animateCarIn();
            }, off);
        }, 10);
    }
    
    this.cancelOffTrack = function() {
        clearInterval(_offTrackInter);
        $this.show();
        _this.parent.resetCar();
        _noUpdate = false;
        $rotate.div.style.webkitTransform = getMatrix();
        $car.image.clearTransform().clearAlpha();
        _this.crashed = false;
        _this.parent.onTrack();
        
        _this.delayedCall(function() {
            if ($car.image && $car.image.clearTransform) $car.image.clearTransform().clearAlpha();
        }, 100);
    }
    
    this.crash = function(time) {
        _noUpdate = true;
        time = time || 0;
        if (!_this.crashed && _this.visible) {
            _this.crashed = true;
            $rotate.div.style.webkitTransform = getMatrix();
            
            if (_this.parent.isOnScreen()) {
                $car.image.invisible();
                $car.crash.visible();
                $car.crash.div.className = 'car-crash';
            }
            
            setTimeout(function() {
                _this.parent.resetCar('crash');
                $car.image.visible();
                $car.crash.invisible();
                $car.crash.div.className = 'car-crash-hide';
                animateCarIn();
                _noUpdate = false;
                _this.parent.unCrash();
            }, 1500 - time);
        }
    }
    
    this.explode = function() {
        $car.image.invisible();
        $car.crash.visible();
        $car.crash.div.className = 'car-crash';
    }
    
    this.getValues = function() {
        return {x: $rotate.x, y: $rotate.y, rotation: $rotate.rotation};
    }
    
    this.updateDistance = function(distance, traction) {
        var perc = distance / traction;
            
        if (perc > .5) {
            if (!_sparks) {
                _sparks = true;
                RacerSound.skidStart(_this.parent.player);
            }
        } else {
            if (_sparks) {
                _sparks = false;
                RacerSound.skidStop(_this.parent.player);
            }
        }
    }
    
    this.delayedTransform = function() {
        _this.delayedCall(applyTransform, 100);
    }
    
    this.getOffTrackData = function() {
        return _offTrackData;
    }
});
