Class(function LineUpViewTitle(_config) {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _size, _lines, _letters, _scale;
    var _text = _config.text.split('/');
    
    //*** Constructor
    (function() {
        initHTML();
        initLines();
        setTimeout(initLetters, 50);
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%', 200).css({ overflow: 'visible' });
        $this.fontStyle('AvantGarde-BoldObl', 30, '#fff');
    }
    
    function initLines() {
        _lines = new Array();
        for (var i = 0; i < _text.length; i++) {
            var $line = $('.line');
            $this.addChild($line);
            _lines.push($line);
        }
    }
    
    function initLetters() {
        _letters = new Array();
        for (var i = 0; i < _text.length; i++) {
            if (RacerDevice.animate) {
                var text = _text[i].split('');
                for (var j = 0; j < text.length; j++) {
                    var letter = _this.initClass(LineUpViewTitleLetter, { letter: text[j], index: _config.index });
                    letter.line = _lines[i];
                    letter.letter = text[j];
                    letter.endLine = j == text.length-1;
                    _lines[i].addChild(letter);
                    _letters.push(letter);
                }    
            } else {
                _lines[i].text(_text[i]).css({ width: '100%', textAlign: 'center' });
            }
        }
        
        _this.delayedCall(resizeHandler, 250);
    }
    
    function positionLetters() {
        for (var i = 0; i < _lines.length; i++) {
            _lines[i].width = 0;
        }
        
        for (var i in _letters) {
            var l = _letters[i];
            l.css({ fontSize: _size, left: l.line.width, zIndex: _letters.length-i });
            l.line.width += l.getWidth(_size);
        }
        
        $this.css({ height: _size*_lines.length*1.15, marginTop: -_size*0.7+20 });
        
        for (var i = 0; i < _lines.length; i++) {
            _lines[i].css({ width: _lines[i].width+5, height: _size, top: _size*i*1.15, left: '50%', marginLeft: -_lines[i].width*0.52 });
        }
    }

    //*** Event handlers    
    function resizeHandler() {
        _scale = RacerDevice.height < 450 ? RacerDevice.height/450 : 1;
        if (_scale < 1) {
            $this.transformPoint(RacerDevice.width/2,-50).transform({ scale: _scale });
        } else {
            $this.clearTransform();
        }
        
        var wSize = RacerDevice.width/11;
        var hSize = RacerDevice.height/12-7;
        _size = hSize > wSize ? hSize : wSize;
        if (_size > 70) _size = 70;
        _size = _size*0.95;
        
        if (RacerDevice.animate) {
            positionLetters();
        } else {
            $this.css({ fontSize: _size+'px', height: _size*_lines.length*1.15 });
            for (var i = 0; i < _lines.length; i++) {
                _lines[i].css({ top: _size*i*1.15 });
            }
        }
    }

    //*** Public Methods
    this.resize = resizeHandler;
    
    this.shine = function() {
        _this.visible = true;
        if (RacerDevice.animate) {
            var delay = 0;
            for (var i = 0; i < _letters.length; i++) {
                if (_letters[i].animate) {
                    _letters[i].shine(delay);
                    delay += _letters[i].endLine ? 200 : 20;
                }
            }
        }
    }
    
    this.animateOut = function() {
        $this.tween({ opacity: 0 }, 300, 'easeOutSine', $this.hide);
    }
});
