Class(function TrackMobileViewResult(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $overlay, $place, $placeText, $winner, $winnerText, $trophy;
    var _text, _fontSize;
    
    //*** Constructor
    (function() {
        initHTML();
        initPlace();
        initWinner();
        addListeners();
        resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').css({ background: Global.GRADIENT, overflow: 'hidden', top: 0, left: 0 }).setZ(1001);
        $this.mouseEnabled(false);
        $this.invisible();
        
        $overlay = $('.overlay');
        $overlay.size('100%').bg(Config.BG).setZ(2);
        $overlay.invisible();
        $this.addChild($overlay);
    }
    
    function initPlace() {
        $place = $('.place');
        $place.size('100%').setZ(1);
        $this.addChild($place);
        
        $placeText = $('.text');
        $placeText.bg(Config.PATH+'assets/images/common/places/'+_config.place+'.png');
        $place.addChild($placeText);
    }
    
    function initWinner() {
        $winner = $('.winner');
        $winner.size('100%').css({ overflow: 'hidden' }).setZ(3);
        $winner.bg(Config.COLORS[_config.winner]);
        $winner.invisible();
        $this.addChild($winner);
        
        $winner.inner = $('.winner-inner');
        $winner.inner.size('100%');
        $winner.addChild($winner.inner);
        
        $winnerText = $('.winner-text');
        $winnerText.fontStyle('AvantGarde-BoldObl', 20, '#fff');
        $winnerText.css({ width: '100%', textAlign: 'center', top: $trophy ? '45%' : '50%', whiteSpace: 'nowrap' });
        
        _text = _config.winner_name;
        switch (_config.winner_name) {
            case 'BLU': _text = 'BLUE'; break;
            case 'GRN': _text = 'GREEN'; break;
            case 'YLW': _text = 'YELLOW'; break;
            case 'ORG': _text = 'ORANGE'; break;
            case 'RED': _text = 'RED'; break;
        }
        
        $winnerText.text(_text+'<br/>WINS');
        $winner.inner.addChild($winnerText);
    }
    
    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
    }
    
    function resizeHandler() {
        var offset = RacerDevice.width*0.25+30;
        var width = RacerDevice.width < (600 + offset) ? RacerDevice.width-offset : 600;
        $placeText.size(width, width*0.66).css({ top: '50%', marginTop: -width*0.33, left: '50%', marginLeft: -width/2 });
        
        _fontSize = RacerDevice.width/(_text.length*0.5+3);
        if (_fontSize > 150) _fontSize = 150;
        $winnerText.css({ lineHeight: _fontSize*1.05, letterSpacing: _fontSize*0.03+'px', textShadow: _fontSize*0.055+'px '+_fontSize*0.06+'px rgba(255,255,255,0.25)', fontSize: _fontSize, marginTop: $trophy ? _fontSize*1.8 : -_fontSize, left: -_fontSize*0.1 });
        
        if ($trophy) {
            var scale = RacerDevice.height < 700 ? RacerDevice.height/700 : 1;
            $trophy.transform({ scale: scale }).css({ marginTop: -300+_fontSize*1.5 });
        }
    }
    
    //*** Public Methods
    this.animateIn = function(callback) {
        _this.visible = true;
        $place.transform({ y: -window.innerHeight*0.7 }).tween({ y: 0 }, 700, 'easeInOutCubic');
        $this.visible().transform({ y: window.innerHeight }).tween({ y: 0 }, 700, 'easeInOutCubic');
        
        if (callback) _this.delayedCall(callback, 1400);
        
        _this.delayedCall(function(){
            $overlay.visible().css({ opacity: 0 }).tween({ opacity: 0.6 }, 700, 'easeOutSine');
            $winner.visible().transform({ y: window.innerHeight }).tween({ y: 0 }, 700, 'easeInOutCubic');
            $winner.inner.transform({ y: -window.innerHeight*0.7 }).tween({ y: 0 }, 700, 'easeInOutCubic');
        }, 2800);
    }
    
    this.animateOut = function(callback) {
        _this.visible = false;
        $winner.inner.tween({ y: window.innerHeight*0.7 }, 700, 'easeInOutCubic');
        $this.tween({ y: -window.innerHeight }, 700, 'easeInOutCubic', function(){
            $this.hide();
            if (callback) _this.delayedCall(callback, 100);
        });
    }
});
