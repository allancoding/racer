Class(function TrackInitializingViewAnimation() {
    Inherit(this, View);
    var _this = this;
    var $this, $wrapper, $track, $glow, $scan;

    //*** Constructor
    (function() {
        initHTML();
        if (!Config.PRESENTATION) initAnimation();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(900,300).css({ top: '50%', left: '50%', marginTop: -150, marginLeft: -450, overflow: 'hidden' }).setZ(1);
        
        var $fadeLeft = $('.fade');
        $fadeLeft.size(100,300).css({ top: 0, left: -5 }).bg(Config.PATH+'assets/images/lineup/fade-left.png').setZ(10);
        $this.addChild($fadeLeft);
        
        var $fadeRight = $('.fade');
        $fadeRight.size(100,300).css({ top: 0, right: -5 }).bg(Config.PATH+'assets/images/lineup/fade-right.png').setZ(10);
        $this.addChild($fadeRight);
        
        $wrapper = $('.wrapper');
        $wrapper.size(698,298).css({ overflow: 'hidden', top: 1, left: 101 }).setZ(1);
        $this.addChild($wrapper);
        
        var $black = $('.black');
        $black.size(20, 300).css({ left: 90 }).bg(Config.BG).setZ(2);
        $this.addChild($black);
        
        var $black = $('.black');
        $black.size(20, 300).css({ right: 90 }).bg(Config.BG).setZ(2);
        $this.addChild($black);
        
        $track = $('.track');
        $track.size(700,300).css({ top: -2, left: -2 }).bg(Config.PATH+'assets/images/track/loader/track.png').setZ(1);
        $wrapper.addChild($track);
    }
    
    function initAnimation() {
        $glow = $('.glow');
        $glow.size(290, 290).css({ top: 5, left: 5 }).bg(Config.PATH+'assets/images/track/loader/glow.png').setZ(0);
        $wrapper.addChild($glow);
        
        $scan = $('.scan');
        $scan.size(8, 296).css({ top: 2, left: 302 }).setZ(5);
        $this.addChild($scan);
        
        $scan.inner = $('.scan-inner');
        $scan.inner.size('100%').css({ top: 0, left: 0, opacity: 0.5 }).bg('#fff');
        $scan.addChild($scan.inner);
    }

    //*** Event handlers

    //*** Public Methods
    this.animateIn = function() {
        $glow.div.className = 'wipe';
        $scan.div.className = 'wipe';
    }
    
    
});
