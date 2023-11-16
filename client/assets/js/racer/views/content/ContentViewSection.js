Class(function ContentViewSection(_data) {
    Inherit(this, View);
    var _this = this;
    var $this, $wrapper, $title, $text;
    
    //*** Constructor
    (function() {
        initHTML();
        if (_data.title) initTitle();
        if (_data.content_text) initCopy();
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ display: 'block', position: 'relative', width: 600, marginTop: 130, marginBottom: window.innerHeight/4 });
        
        $wrapper = $('.wrapper');
        $wrapper.css({ width: '100%', display: 'block' });
        $this.addChild($wrapper);
        _this.wrapper = $wrapper;
    }
    
    function initTitle() {
        var fontSize = _data.title.length > 10 ? 48 : 66;
        $title = $('.title');
        $title.fontStyle('AvantGarde-BoldObl', fontSize, '#fdfdfd');
        $title.css({ display: 'block', marginTop: 30, width: '100%', lineHeight: fontSize*1.1, marginBottom: 5, whiteSpace: 'nowrap', textAlign: 'center', textShadow: fontSize*0.08+'px '+fontSize*0.08+'px #444', letterSpacing: '3px', position: 'relative' });
        $title.text(_data.title.toUpperCase());
        $wrapper.addChild($title);
    }
    
    function initCopy() {
        $text = $('.text');
        $text.fontStyle('AvantGarde', 13, '#999');
        $text.css({ displsay: 'block', width: '100%', textAlign: 'center', letterSpacing: '1px', lineHeight: 18, position: 'relative' });
        $text.text(_data.content_text);
        $wrapper.addChild($text);
        
        _this.delayedCall(function(){
            if (_data.perma == 'music' && !Config.DOWNLOAD_TRACK) {
                var download = document.getElementById('track_download');
                download.innerHTML = '<strong>RACER BY GIORGIO MORODER</strong>Music pioneer Giorgio Moroder scored the dynamic soundtrack for Racer. Listen to the single now on the YouTube.';
                
                var link = document.getElementById('track_download_link');
                link.className = 'youtube';
                link.setAttribute("href", "http://youtu.be/2N03GWn4Xok");
            }
        }, 100);
        
    }

    //*** Public Methods
    this.attach = function(){
        if (_data.perma == 'story') $text.text(_data.content_text);
    }
    
    this.detach = function() {
        if (_data.perma == 'story') $text.text('');
    }

});
