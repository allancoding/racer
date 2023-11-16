Class(function TrackDesktopViewPlayer(_data) {
    Inherit(this, View);
    var _this = this;
    var $this, $time, $place, $name;
    var _name;

    //*** Constructor
    (function() {
        initHTML();
        if (_data) {
            initPlace();
            initName();
        }
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(80,62);
        $this.hide();
        
        $name = $('name');
        $name.size(80,36).css({ bottom: 0 }).bg('#444');
        $this.addChild($name);
    }
    
    function initPlace() {
        $place = $('.place');
        $place.fontStyle('AvantGarde', 14, '#fff');
        $place.css({ width: '100%', left: 0, letterSpacing: '2px', top: 2 }).setZ(11);
        $place.text('');
        $this.addChild($place);
    }
    
    function initName() {
        if (_data.gradient) {
            var gradient = RacerUtil.gradient(_data.gradient[0], _data.gradient[1], _data.gradient[2]);
            $name.css({ background: gradient });    
        } else {
            $name.css({ background: Config.COLORS[_data.color] });
        }
        
        _name = _this.initClass(LobbyCodeViewCode, { border: false, length: 3, name: true });
        _name.css({ left: 11 });
        $name.addChild(_name);
        _name.set(_data.name, null, true)
        _name.resize(36, 0);
        _name.singles[2].css({ borderRight: 'none' });
    }

    //*** Public Methods
    this.updateTime = function(time) {
        if ($time) $time.text(time);    
    }
    
    this.setPlace = function(place) {
        if ($place) $place.text(place);
    }
    
    this.animateIn = function() {
        $this.show();
        $this.css({ opacity: 0 }).transform({ y: 10 }).tween({ opacity: 1, y: 0 }, 300, 'easeOutCubic', $this.clearTransform);
    }
});
