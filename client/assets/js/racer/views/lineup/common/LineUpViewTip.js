Class(function LineUpViewTip() {
    Inherit(this, View);
    var _this = this;
    var $this, $wrapper, $exclam, $heading, $text;
    var _interval;
    
    _this.width = 460;
    _this.height = 125;
    
    
    //*** Constructor
    (function() {
        initHTML();
        initExclamation();
        initText();
        resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(_this.width, _this.height).css({ bottom: '10%', left: '50%', marginLeft: -_this.width/2 });
        
        var $bg = $('.bg');
        $bg.size('100%').css({ opacity: 0.1, borderRadius: 2, background: Config.BG });
        $this.addChild($bg);
        
        $wrapper = $('.wrapper');
        $wrapper.size('100%');
        $this.addChild($wrapper);
    }
    
    function initExclamation() {
        $exclam = $('.exclam');
        $exclam.fontStyle('AvantGarde-BoldObl', 81, '#fff');
        $exclam.css({ top: 25, left: 41, width: 100, height: 70 });
        $exclam.text('!');
        $wrapper.addChild($exclam);
    }
    
    function initText() {
        $heading = $('.exclam');
        $heading.fontStyle('AvantGarde-BoldObl', 20, '#fff');
        $heading.css({ top: 31, left: 93, letterSpacing: '2px', height: 70, width: 400 });
        $heading.text('PRO-TIP');
        $wrapper.addChild($heading);
        
        $text = $('.text');
        $text.fontStyle('AvantGarde', 16, '#fff');
        $text.css({ top: 57, left: 93, lineHeight: 21, letterSpacing: '1.5px', height: 70, width: 400 });
        $text.text(Data.CONFIG.getProTip());
        $wrapper.addChild($text);
    }

    //*** Event handlers
    
    function resizeHandler() {
        if (RacerDevice.height < 600) $this.css({ bottom: 15 });
        else $this.css({ bottom: '5%', marginTop: 15 });
        
        if ((RacerDevice.width-20) < _this.width+20) {
            var scaleW = (RacerDevice.width-20)/(_this.width+20);
            var scaleH = window.innerHeight < 400 ? window.innerHeight/700 : 1;
            var scale = scaleW < scaleH ? scaleW : scaleH;
            $this.transformPoint(_this.width/2,_this.height).transform({ scale: scale });
        } else {
            $this.clearTransform();
        }
    }
    
    function rotateTips() {
        if (_this.visible && $text && $text.tween) {
            SCSound.send("protip_out");
            $text.tween({ x: 15, opacity: 0 }, 400, 'easeInSine', function() {
                if (_this.visible && $text && $text.tween) {
                    $text.div.innerHTML = Data.CONFIG.getProTip();
                    _this.delayedCall(function(){
                        SCSound.send("protip_in");
                        $text.transform({ x: -15 }).css({ opacity: 0 }).tween({ x: 0, opacity: 1 }, 400, 'easeOutSine', 200);
                    }, 200);
                }
            });
        }
    }

    //*** Public Methods
    this.resize = resizeHandler;
    
    this.stop = function() {
        if (_interval) clearInterval(_interval);
    }
    
    this.animateIn = function(){
        _this.visible = true;
        $wrapper.visible();
        _interval = setInterval(rotateTips, 4000);
    }
    
    this.animateOut = function(){
        _this.visible = false;
        if (_interval) clearInterval(_interval);
        $this.tween({ opacity: 0 }, 300, 'easeOutSine', $this.hide);
    }
});
