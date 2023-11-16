Class(function LobbyCodeViewInput(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $title, $input, $form, $submit, $text, $error, $lineTop, $lineBottom;
    var _height = 40, _timeout, _keyCode;
    var _titleSize = 66;
    var _lineWidth = 500;
    _this.enabled = true;
    _this.code = '';
    
    //*** Constructor
    (function() {
        initHTML();
        if (!RacerDevice.mobile) initTitle();
        if (_config.text) initText();
        initForm();
        addListeners();
        resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').css({ top: 0, left: 0 }).setZ(100);
    }
    
    function initTitle() {
        $title = $('.text');
        $title.fontStyle('AvantGarde-BoldObl', _titleSize, '#fff');
        $title.css({ width: '100%', whiteSpace: 'nowrap', width: 600, left: '50%', marginLeft: -305, textAlign: 'center', letterSpacing: '1px', lineHeight: _titleSize*1.1, top: -130, textShadow: _titleSize*0.08+'px '+_titleSize*0.08+'px rgba(255,255,255,0.2)', textAlign: 'center' });
        $title.text('RACER LIVE');
        $this.addChild($title);
        
        $lineTop = $('.line');
        $lineTop.css({ width: _lineWidth, height: 1, background: 'rgba(255,255,255,0.2)', left: '50%', marginLeft: -_lineWidth/2, top: -160 });
        $this.addChild($lineTop);
        
        $lineBottom = $('.line');
        $lineBottom.css({ width: _lineWidth, height: 1, background: 'rgba(255,255,255,0.2)', left: '50%', marginLeft: -_lineWidth/2, top: 200 });
        $this.addChild($lineBottom);
    }
    
    function initText() {
        $text = $('.text');
        $text.fontStyle('AvantGarde', 15, '#fff');
        $text.css({ width: '100%', lineHeight: 21, fontWeight: 'bold', textAlign: (_config.table || !RacerDevice.mobile) ? 'center' : 'left', whiteSpace: 'nowrap', letterSpacing: '1px', top: -25 });
        if (_config.table) $text.text('ENTER YOUR RACE NAME');
        else $text.text('GET THE RACE CODE FROM YOUR<br/>FRIEND AND ENTER IT TO JOIN');
        $this.addChild($text);
        
        $error = $('.error');
        $error.fontStyle('AvantGarde', 15, '#fff');
        $error.css({ fontWeight: 'bold', width: '100%', textAlign: _config.table ? 'center' : 'left', letterSpacing: '1px', top: -25 });
        $this.addChild($error);
        
        if (!RacerDevice.mobile) {
            $text.text('Racer is made for mobile, but you can watch<br/>a live race by entering a race code below.');
            $text.css({ width: 600, lineHeight: 21, color: '#999', left: '50%', fontSize: 17, marginLeft: -300, top: -60, textAlign: 'center' });
            $error.css({ width: 600, lineHeight: 21, color: '#999', left: '50%', fontSize: 17, marginLeft: -300, top: -30, textAlign: 'center' });           
        }
    }
    
    function initForm() {
        $form = $('.form', 'form');
        $form.css({ width: '100%', top: 0, left: 0, overflow: 'hidden' }).setZ(1000);
        $form.div.tabIndex = -1;
        $form.hide();
        $this.addChild($form);
        
        $submit = $('.submit', 'submit');
        $form.addChild($submit);
        
        $input = $('.input', 'input');
        $input.fontStyle('AvantGarde-BoldObl', 1, '#fff');
        $input.size('100%').css({ top: 0, bottom: 0, height: RacerDevice.android && _config.text ? 250 : '100%', left: '-50%', width: '150%', textIndent: -9999});
        $input.div.maxLength = _config.length;
        $input.div.value = '';
        $input.div.required = true;
        $input.div.tabIndex = -1;
        $input.div.autofocus = true;
        $input.div.setAttribute('autocorrect', 'off');
        $input.div.setAttribute('autocapitalize', 'off');
        $form.addChild($input);
    }

    //*** Event handlers
    function addListeners() {
        $input.div.addEventListener('keyup', keyup, false);
        $input.div.onblur = onblur;
        $form.div.addEventListener('submit', submit, false);
        if (!RacerDevice.mobile) _this.events.subscribe(RacerEvents.INPUT_FOCUS, forceFocus);
        if (RacerDevice.mobile) $form.touchClick(null, click);
        else $form.click(click);
    }
    
    function keyup(e) {
        _keyCode = e.keyCode || 0;
        if (RacerDevice.android) {
            if (_timeout) clearTimeout(_timeout);
            _timeout = setTimeout(checkValue, 20);    
        } else {
            checkValue();
        }
        
    }
    
    function checkValue() {
        var last = $input.div.value.toUpperCase().split('')[$input.div.value.length-1];
        var isLetter = /^[a-zA-Z]*$/.test(last);
        if (_this.enabled && isLetter && $input.div.value.length < _config.length+1) {
            var code = $input.div.value.toUpperCase();
            if (_this.code !== code && _keyCode !== 8) SCSound.send("type");
            _this.code = code;
            update();
        } else {
            $input.div.value = _this.code.toUpperCase();
        }
    }
    
    function forceFocus() {
        $input.div.focus();
    }
    
    function click() {
        _this.events.fire(HydraEvents.CLICK);
        if (_this.enabled) {
            if (Mobile.os == 'Android') Device.closeFullscreen();
            $input.div.focus();
            reset();    
        }
    }
    
    function reset() {
        if (_this.enabled) {
            _this.code = '';
            update();
        }
    }
    
    function update() {
        _this.events.fire(HydraEvents.UPDATE, { code: _this.code, blink: true });
        $input.div.value = _this.code;
    }
    
    function submit(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (_this.enabled) _this.events.fire(HydraEvents.COMPLETE, { code: _this.code });
    }
    
    function onblur(e) {
        
    }
   
    function resizeHandler() {
        if ($form && $form.css) $form.css({ height: _height });
        if (_config.table) {
            if ($error) $error.css({ fontSize: _height*0.2, top: -_height*0.38, letterSpacing: _height*0.025+'px' });
            if ($text) $text.css({ fontSize: _height*0.2, top: -_height*0.38, letterSpacing: _height*0.025+'px' });
        } else if (RacerDevice.mobile) {
            if ($error) $error.css({ fontSize: _height*0.27, top: RacerDevice.mobile ? -_height*0.55 : -_height, letterSpacing: _height*0.025+'px' });
            if ($text) $text.css({ fontSize: RacerDevice.mobile ? _height*0.24 : _height*0.22, lineHeight: _height*0.33, top: RacerDevice.mobile ? -_height*0.8 : -_height, letterSpacing: _height*0.02+'px' });
        }
    }

    //*** Public Methods
    this.set = function(code) {
        _this.code = $input.div.value = code;
        if ($input && $input.div) $input.div.blur();
        if ($text) $text.tween({ opacity: 0 }, 200, 'easeOutSine');
        if ($title) $title.tween({ opacity: 0 }, 200, 'easeOutSine');
        if ($lineTop) $lineTop.tween({ opacity: 0 }, 200, 'easeOutSine');
        if ($lineBottom) $lineBottom.tween({ opacity: 0 }, 200, 'easeOutSine');
    }
    
    this.focus = function() {
        if ($input && $input.div) $input.div.focus();
    }
    
    this.blur = function() {
        if ($input && $input.div) $input.div.blur();
    }
    
    this.resize = function(height) {
        _height = height;
        resizeHandler();
    }
    
    this.reset = function() {
        reset();
    }
    
    this.enable = function() {
        $form.show();
        _this.enabled = true;
    }
    
    this.disable = function() {
        $form.hide();
        _this.enabled = false;
    }
    
    this.showError = function(text) {
        $text.tween({ opacity: 0 }, 300, 'easeOutSine');
        $error.text(text).css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 200, function(){
            $text.tween({ opacity: 1 }, 300, 'easeOutSine', 1000);
            $error.tween({ opacity: 0 }, 300, 'easeOutSine', 800);    
        });
    }
    
    this.animateIn = function() {
        if ($text) {
            if (RacerDevice.animate) $text.transform({ y: 5 }).css({ opacity: 0 }).tween({ y: 0, opacity: 1 }, 300, 'easeOutCubic');
            else $text.css({ opacity: 0 }).tween({ opacity: 1 }, 200, 'easeOutSine');
            if ($title) $title.transform({ y: 5 }).css({ opacity: 0 }).tween({ opacity: 1, y: 0 }, 300, 'easeOutSine');
        }
    }
    
    this.destroy = function() {
        return this._destroy();
    }
});
