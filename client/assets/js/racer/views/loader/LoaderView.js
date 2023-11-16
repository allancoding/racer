Class(function LoaderView() {
    Inherit(this, View);
    var _this = this;
    var $this, $wrapper, $canvas, $text;
    var _circles, _canvas;
    var _text1, _text2, _text3, _text4, _text5;
    var _isRetina = RacerDevice.mobile && !RacerDevice.android;
    
    //_isRetina = false;
    _this.size = _isRetina ? 600 : 300; 
    _this.scale = _isRetina ? 0.5 : 1;
    _this.visible = true;
    _this.instructionComplete = false;
    
    //*** Constructor
    (function() {
        initHTML();
        initInstructions();
        initCircles();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%');
        $this.invisible();
        $this.mouseEnabled(false);
        
        $wrapper = $('.wrapper');
        $wrapper.size('100%');
        $this.addChild($wrapper);
    }
    
    function initInstructions() {
        _text1 = _this.initClass(LoaderViewInstruction, { color: Config.COLORS[0], text: 'GRAB SOME FRIENDS', index: 0 });
        _text2 = _this.initClass(LoaderViewInstruction, { color: Config.COLORS[1], text: 'ANY PHONE OR TABLET', index: 1 });
        _text3 = _this.initClass(LoaderViewInstruction, { color: Config.COLORS[2], text: 'THAT RUNS CHROME', index: 2 });
        _text4 = _this.initClass(LoaderViewInstruction, { color: Config.COLORS[3], text: 'AND GET READY TO RACE', index: 3 });
        _text5 = _this.initClass(LoaderViewInstruction, { color: Config.COLORS[4], text: 'ACROSS YOUR SCREENS', index: 4 });
    }
    
    function initCircles() {
        $canvas = $('.canvas');
        $canvas.size(_this.size,_this.size).css({ top: '50%', left: '50%', marginLeft: -_this.size/2, marginTop: -_this.size/2 });
        $canvas.transform({ scale: _this.scale });
        $wrapper.addChild($canvas);
        
        _canvas = _this.initClass(Canvas, { width: _this.size, height: _this.size, retina: false });
        $canvas.addChild(_canvas);
        
        var size = Math.round(_this.size-_this.size/2);
        var inc = Math.round(_this.size*0.13);
        
        _circles = new Array();
        
        for (var i = 0; i < 5; i++) {
            var circle = new Object();
            circle.value = 0;
            circle.size = size;
            circle.lineWidth = _isRetina ? 8 : 4;
            circle.direction = false;
            circle.show = false;
            circle.color = Config.LOGO_COLORS[i];
            circle.set = Utils.toRadians(-90);
            _circles.push(circle);
            size += inc;
        }
        
        var textSize = 26;
        $text = $('.text');
        $text.fontStyle('AvantGarde-BoldObl', textSize, '#fff');
        $text.css({ width: '100%', top: '50%', marginTop: -textSize/2, left: -textSize/10+1, textAlign: 'center' });
        $text.text('0');
        $text.invisible();
        $wrapper.addChild($text);
    }
    
    function loop(force) {
        if (_this.animate || force) {
            _canvas.clear();
            for (var i = _circles.length-1; i > -1; i--) {
                var circle = _circles[i];
                if (circle.value > 0.01 && circle.value <= 100 && circle.show) {
                    var val = circle.value/100;
                    var rad = Utils.toRadians(Math.round(val*360 - 90)*1000)/1000;
                    var size = Math.round(circle.size/3);
                    _canvas.context.beginPath();
                    _canvas.context.arc(_this.size/2, _this.size/2, size, circle.set, rad);
                    _canvas.context.lineWidth = circle.lineWidth;
                    _canvas.context.strokeStyle = circle.color;
                    _canvas.context.stroke();
                }
            }    
        }
    }
    
    function animateCircleIn(index) {
        if (index == 0) {
            $text.visible().css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 300);
            Render.startRender(loop); 
        }
        
        _circles[index].show = true;
        TweenManager.tween(_circles[index], { value: 100 }, 900, 'easeInOutQuart', 0, index == _circles.length-1 ? completeCircle : null);
    }

    function completeCircle() {
        _this.animate = false;
        for (var i = 0; i < _circles.length; i++) {
            _circles[i].value = 100;
        }
        loop(true);
    }

    //*** Event handlers
    function animateInstructions() {
        Utils.cookie('hideloader', true);
        $wrapper.css({ opacity: 0 });
        
        var seperation = 2000;
        var offset = 200;
        var readTime = 2000;
        
        _this.delayedCall(_text1.animateIn, offset);
        _this.delayedCall(_text1.fade, offset+readTime);
        _this.delayedCall(_text2.animateIn, seperation);
        _this.delayedCall(_text2.fade, seperation+readTime);
        _this.delayedCall(_text3.animateIn, seperation+offset);
        _this.delayedCall(_text3.fade, seperation+readTime+offset);
        _this.delayedCall(_text4.animateIn, seperation*2);
        _this.delayedCall(_text4.fade, seperation*2+readTime);
        _this.delayedCall(_text5.animateIn, seperation*2+offset);
        _this.delayedCall(_text5.fade, seperation*2+readTime+offset, animateOut);
        
        function animateOut() {
            _this.instructionComplete = true;
            _this.delayedCall(_text1.animateOut, 50);
            _this.delayedCall(_text2.animateOut, 100);
            _this.delayedCall(_text3.animateOut, 150);
            _this.delayedCall(_text4.animateOut, 200);
            _this.delayedCall(_text5.animateOut, 250, complete);
        }
        
        function complete() {
            _text1 = _text1.destroy();
            _text2 = _text2.destroy();
            _text3 = _text3.destroy();
            _text4 = _text4.destroy();
            _text5 = _text5.destroy();
            if (_this.perc < 100) $wrapper.tween({ opacity: 1 }, 200, 'easeOutSine');
            _this.events.fire(HydraEvents.COMPLETE);
        }
    }

    //*** Public Methods
    this.update = function(perc) {
        if (!$text.text) return false;
        if (perc <= 1 && _this.visible) {
            _this.perc = Math.round(perc * 100);
            $text.text(_this.perc);
            if (_this.perc > 0 && !_circles[0].show) animateCircleIn(0);
            if (_this.perc > 20 && !_circles[1].show && _circles[0].show) animateCircleIn(1);
            if (_this.perc > 40 && !_circles[2].show && _circles[1].show) animateCircleIn(2);
            if (_this.perc > 60 && !_circles[3].show && _circles[2].show) animateCircleIn(3);
            if (_this.perc > 80 && !_circles[4].show && _circles[3].show) animateCircleIn(4);    
        }
        
        if (perc == 1) _this.perc = 100;
    }
    
    this.animateIn = function() {
        $this.visible();
        _this.animate = true;
        if (RacerDevice.mobile && !Config.SKIP_INTRO && !Global.TABLE && !Utils.cookie('hideloader')) animateInstructions();
        else _this.instructionComplete = true;
    }
    
    this.animateOut = function(callback) {
        this.complete = true;
        _this.visible = false;
        _this.animate = true;
        _this.loaded = true;
        
        $text.text('100').tween({ opacity: 0 }, 500, 'easeOutSine', 200);
        
        if (_this.instructionComplete) {
            $canvas.transform({ rotationY: 180, scale: _this.scale, webkitBackfaceVisibility: 'visible' });
            for (var i = 0; i < _circles.length; i++) {
                _circles[i].value = 100;
                TweenManager.tween(_circles[i], { value: 0 }, 1000-(i*60), 'easeInOutCubic', i*100);
            }
        }
    
        setTimeout(function(){
            if (_this.instructionComplete) {
                Render.stopRender(loop); 
                callback();
            }
        }, 1500);
    }
});
