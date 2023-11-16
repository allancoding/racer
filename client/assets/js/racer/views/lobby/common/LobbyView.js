Class(function LobbyView(_data) {
    Inherit(this, View);
    var _this = this;
    var $this, $logo, $players, $select, $text, $buttons, $results;
    var _logo, _code, _players, _exit, _select, _back, _trackSelect, _error;
    var _setCode, _data, _size;
    
    //*** Constructor
    (function() {
        initHTML();
        
        if (RacerDevice.mobile) {
            _this.delayedCall(initLogo, 20);
            initText();
            initCode();
            if (Global.RESULTS) initResults();
            initPlayers();
            initButtons();
        } else {
            initText();
            initPlayers();
            initResults();
            initCode();
        }
        
        addListeners();
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ position: 'relative', webkitBackfaceVisibility: 'hidden' }).setZ(5);
        $this.invisible();
    }
    
    function initLogo() {
        $logo = $('.logo');
        $logo.size(900,250).css({ left: '50%', top: 0, webkitBackfaceVisibility: 'hidden' }).bg(Config.PATH+'assets/images/common/logos/racer-large-mobile.png');
        $logo.invisible();
        $logo.transformPoint(472, -10);
        $this.parent().addChild($logo);
    }
    
    function initText() {
        $text = $('.text');
        $text.fontStyle('AvantGarde', 12, '#fff');
        $text.css({ opacity: 0, width: 300, height: 30, paddingTop: 2, overflow: 'visible', whiteSpace: 'nowrap', webkitBackfaceVisibility: 'hidden', textAlign: 'left', position: 'relative', margin: '2px auto 0 auto' });
        $text.text('FRIENDS CAN JOIN AT<br><strong>'+(window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname)+'/racer</strong><br/>BY ENTERING THIS RACE CODE:');
        $text.invisible();
        $this.addChild($text);
        
        if (RacerDevice.mobile) {
            $select = $('.select');
            $select.fontStyle('AvantGarde', 12, '#fff');
            $select.css({ opacity: 0, width: 300, height: 30, top: 0, paddingTop: 2, overflow: 'visible', whiteSpace: 'nowrap', webkitBackfaceVisibility: 'hidden', textAlign: 'left' });
            $select.text('<br/>SELECT A TRACK');
            $select.invisible();
            $this.addChild($select);    
        }
    }
    
    function initCode() {
        _code = _this.initClass(LobbyCodeView,{ input: _data.input, text: true, border: true, center: true });
    }
    
    function initResults() {
        if (!$this.addChild) return initResults = null;
        $results = $('.results');
        $results.fontStyle('AvantGarde', 12, '#fff');
        $results.css({ opacity: 0, width: 300, height: 30, whiteSpace: 'nowrap', webkitBackfaceVisibility: 'hidden', textAlign: 'left', position: 'relative', margin: '10px auto 0 auto' });
        $results.invisible();
        $this.addChild($results);
        
        if (RacerDevice.mobile) {
            $results.text('THE RESULTS');
            $text.text('NEW RACERS CAN JOIN AT<br><strong>'+(window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname)+'/racer</strong>');
        } else {
            $results.text('THE RACERS');
            $text.text('CHALLENGERS CAN JOIN AT<br><strong>'+(window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname)+'/racer</strong>');    
        }
    }
    
    function initPlayers() {
        _players = _this.initClass(LobbyPlayerView);
    }
    
    function initButtons() {
        $buttons = $('.buttons');
        $buttons.css({ width: '100%', height: 50, webkitBackfaceVisibility: 'hidden', position: 'relative' });
        $this.addChild($buttons);
        
        if (RacerDevice.mobile) {
            _select = _this.initClass(HorizontalButtonView, { text: Global.RESULTS ? 'RE-MATCH' : 'START THE RACE', width: 176, height: 50 });
            _select.css({ zIndex: 1, bottom: 0, marginLeft: 0, left: 0 });
            $buttons.addChild(_select);
            
            _back = _this.initClass(HorizontalButtonView, { text: 'BACK TO LOBBY', width: 176, height: 50 });
            _back.css({ zIndex: 1, bottom: 0, marginLeft: 0, left: 0 });
            $buttons.addChild(_back);
        }
        
        _exit = _this.initClass(HorizontalButtonView, { text: 'EXIT', width: 90, height: 50 });
        _exit.css({ zIndex: 2, bottom: 0, marginLeft: 0, left: 0 });
        $buttons.addChild(_exit);
    }

    //*** Event handlers
    function addListeners() {
        if ($logo) $logo.interact(null, exitClick);
        _code.events.add(HydraEvents.COMPLETE, codeEntered);
        if (_exit) _exit.events.add(HydraEvents.CLICK, exitClick);
        if (_select) _select.events.add(HydraEvents.CLICK, trackSelect);
        if (_back) _back.events.add(HydraEvents.CLICK, backToLobby);
    }
    
    function logoClick() {
        Data.SOCKET.exitLobby();
        _this.events.fire(RacerEvents.REFRESH);
    }
    
    function resizeHandler(noMove) {
        var ratio = RacerDevice.width/RacerDevice.height;
        var check = ratio < 0.7 ? RacerDevice.width : RacerDevice.height*0.6+50;
        var max = ratio < 0.7 ? Config.WIDTH.max : Config.HEIGHT.max;
        var width = check < 300 ? 300 : check < max ? check : max;
        width = width*0.75+40;
        if (width > 520) width = 520;
        if (!RacerDevice.mobile) width = 400;
        
        $this.transformPoint(width/2, '10%');
        
        _size = Math.floor(width/5.4);
        if (_code) _code.resize(_size, width);
        if (_trackSelect) _trackSelect.resize(_size, width);
        if (_players) _players.resize(width);
        
        var fontSize = RacerDevice.mobile ? ($results ? _size*0.24 : _size*0.26) : _size*0.22;
        $text.css({ width: _size*5.4, fontSize: fontSize, height: ((Global.RESULTS && !_trackSelect) || !RacerDevice.mobile) ? fontSize*1.55 : fontSize*3.1, letterSpacing: fontSize*0.08+'px', lineHeight: fontSize*1.35+'px'  });
        if ($select) $select.css({ width: _size*5.4, fontSize: fontSize, height: ((Global.RESULTS && !_trackSelect) || !RacerDevice.mobile) ? fontSize*1.55 : fontSize*3.1, letterSpacing: fontSize*0.08+'px', lineHeight: fontSize*1.35+'px'  });
        if ($results) $results.css({ width: _size*5.4, fontSize: fontSize, height: fontSize*1.55, marginTop: fontSize, letterSpacing: fontSize*0.08+'px', lineHeight: fontSize*1.35+'px' });
        
        if ($buttons) {
            var height = width*0.15+10;
            $buttons.css({ height: height, width: width, margin: '10px auto 0 auto' });
            if (_select) _select.resize(width*0.65, height);
            if (_select) _select.css({ left: width*0.335, marginLeft: 0 });
            if (_back) _back.resize(width*0.66, height);
            if (_back) _back.css({ left: width*0.335, marginLeft: 0 });
            if (_exit) _exit.resize(width*0.285,height);
            if (_exit) _exit.css({ left: RacerDevice.mobile ? 0 : width*0.39, marginLeft: 0 });
        }
                        
        if (!noMove) _this.delayedCall(function(){
            var height = $this.div.offsetHeight;
            var gap = (RacerDevice.height-height*0.9)/2;
            if ($logo) {
                $logo.scale = gap < 140 ? gap/140 : 1;
                $logo.transform({ scale: $logo.scale });
                if (width > 520) $logo.css({ left: '50%', marginLeft: -555 });
                else $logo.css({ marginLeft: 0, left: -472+(RacerDevice.width-width)/2 });
            }
            $this.css({ width: width, left: '50%', marginLeft: -width/2, top: RacerDevice.height*0.5-height*0.45 });
        }, 20);
    }

    function codeEntered(e) {
        _this.events.fire(RacerEvents.SYNC_REQUEST, e);
    }
    
    function backToLobby() {
        GATracker.trackEvent("clickable_link", "select_track", "Back_To_Lobby");
        _back.animateOut();
        if ($select) $select.tween({ opacity: 0 }, 300, 'easeOutSine', $select.invisible);
        _trackSelect.animateOut(function(){
            _trackSelect = _trackSelect.destroy();
            resizeHandler(true);
            _select.reset();
            _this.delayedCall(_code.animateIn, 100);
            _select.animateIn();
            _this.delayedCall(_players.animateIn, 200);
            $text.text($text.save).tween({ opacity: 1 }, 300, 'easeOutSine', $text.clearAlpha);
            if ($results) $results.show().tween({ opacity: 1 }, 300, 'easeOutSine', $results.clearAlpha);
        });
    }
    
    function trackSelect(e) {
        if (Global.RESULTS) GATracker.trackEvent("clickable_link", "lobby", "Re Match");
        else GATracker.trackEvent("clickable_link", "lobby", "Start The Race");
        
        if ((!_data || _data.players.length < 2) && !Utils.cookie('singleplayer')) {
            Utils.cookie('singleplayer', true);
            _error = _this.initClass(ErrorOverlay, { type: 'singleplayer' });
            __body.addChild(_error);
            _error.events.add(HydraEvents.CLICK, function(){
                GATracker.trackEvent("clickable_link", "race_with_friends", "Continue As One Player");
                if (_error) _error = _error.destroy();
                _select.animateOut();
                _code.animateOut();
                _players.animateOut();
                fadeText();
            });
            _error.events.add(HydraEvents.ERROR, returnToLobby);
        } else {
            _select.animateOut();
            _code.animateOut();
            _players.animateOut();
            fadeText();
        }
        
        function fadeText() {
            if ($results) $results.tween({ opacity: 0 }, 300, 'easeOutSine');
            $text.tween({ opacity: 0 }, 300, 'easeOutSine');
            $text.save = $text.div.innerHTML;
            _this.delayedCall(showTrackSelect, 300);
        }
        
        function showTrackSelect() {
            if ($results) $results.hide();
            $select.visible().tween({ opacity: 1 }, 300, 'easeOutSine', 200, $select.clearAlpha);
            _trackSelect = _this.initClass(LobbyTrackSelectView, _size);
            _back.reset();
            _back.animateIn();
            resizeHandler(true);
            _trackSelect.events.add(HydraEvents.CLICK, trackSelected);    
        }
        
        function returnToLobby() {
            GATracker.trackEvent("clickable_link", "race_with_friends", "Close");
            _select.reset();
            if (_error) _error = _error.destroy();
        }
    }
    
    function trackSelected(e) {
        switch (e.type) {
            case 'SIMPLE': GATracker.trackEvent("clickable_link", "select_track", "Easy"); break;
            case 'EXCITING': GATracker.trackEvent("clickable_link", "select_track", "Medium"); break;
            case 'CRAZY': GATracker.trackEvent("clickable_link", "select_track", "Ridiculous"); break;
        }
        
        SCSound.send("click");
        _trackSelect.select(e.index);
        _this.delayedCall(Data.SOCKET.startGame, 100, e.type);
    }

    function exitClick(e) {
        if (_trackSelect) GATracker.trackEvent("clickable_link", "select_track", "Exit");
        else GATracker.trackEvent("clickable_link", "lobby", "Exit");
        Data.SOCKET.exitLobby();
        _this.events.fire(RacerEvents.REFRESH);
    }

    //*** Public Methods
    this.resize = resizeHandler;
    
    this.codeError = function(text) {
        if (!$this.show) return false;
        SCSound.send("error");
        _code.reset(text);
    }
    
    this.showTitle = function() {
        if (!$this.show) return false;
        $text.isVisible = true;
        $text.visible().css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine');
    }
    
    this.setAsResult = function() {
        if (!$this.show) return false;
        if (!$results) initResults();
        if (_players) _players.showResults();
        if (RacerDevice.mobile) {
            if (_players) $this.addChild(_players);
            if ($buttons) $this.addChild($buttons);
        } else {
            $results.text('CHALLENGERS CAN JOIN AT<br><strong>'+(window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname)+'/racer</strong>');
            $text.text('THE RACERS');    
        }
        resizeHandler();
        $text.isVisible = true;
        $text.visible().css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 1200);    
        if ($results) $results.visible().css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 1200);
        
    }
    
    this.synced = function(code, noAnim) {
        if (!$this.show || _this.isSynced) return false;
        _this.isSynced = true;
        _setCode = code;
        $this.show();
        _code.set(_setCode, null, noAnim);
        _code.disable();
        //if (_logo) _this.delayedCall(_logo.animateIn, 400);
        if ($logo) {
            $logo.visible();
            if (RacerDevice.animate) $logo.transform({ y: 10, x: -40, scale: $logo.scale }).css({ opacity: 0 }).tween({ opacity: 1, y: 0, x: 0 }, 500, 'easeOutCubic', 400);
            else $logo.css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 400);    
        }
        
        if (!$text.isVisible) $text.visible().css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 500);    
        if ($results) $results.visible().css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 500); 
        
        _this.delayedCall(_players.animateIn, 400);
        if (_exit) _this.delayedCall(_exit.animateIn, 800);
        if (_select) _this.delayedCall(_select.animateIn, 800);
    }
    
    this.setFinish = function(order) {
        if (!$this.show) return false;
        _players.setFinish(order);
    }
    
    this.isWatcher = function() {
        if (!$this.show) return false;
        _this.watcher = true;
        if (RacerDevice.mobile) {
            if (!Global.RESULTS) $text.text('THE RACE HAS ALREADY STARTED!<br/>HANG TIGHT FOR THE NEXT RACE');
        } else {
            $text.text('THE RACERS');
        }
    }
    
    this.updateTime = function(time) {
        if (!$this.show) return false;
        _players.updateTime(time);
    }
    
    this.updatePositions = function(positions) {
        if (!$this.show) return false;
        _players.updatePositions(positions);
    }
    
    this.setPositions = function(players) {
        if (!$this.show) return false;
        _players.setPositions(players);
    }
    
    this.update = function(e) {
        if (!$this.show) return false;
        _data = e;
        if (!_players || Global.TABLE) return false;
        _players.update(e);
        
        if (RacerDevice.mobile) {
            if (_select) {
                if (e.players[0].me) {
                    _select.enable();
                    Global.ISHOST = e.players[0].me;
                } else {
                    _select.disable(null, 'WAITING FOR <strong>'+e.players[0].name+'</strong>');
                    Global.ISHOST = false;
                }
            }
            
            if (e.players.length > 1) {
                if (e.players.length == 5) {
                    if (!_this.watcher && !Global.RESULTS) $text.text('THE LOBBY IS NOW FULL<br/>GET '+e.players[0].name+' TO START THE GAME');
                } else {
                    var left = 5-e.players.length;
                    if (!_this.watcher && !Global.RESULTS) $text.text('FRIENDS CAN JOIN AT<br><strong>'+(window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname)+'/racer</strong><br/>BY ENTERING THIS RACE CODE:');
                }
            } else {
                if (_setCode && !_this.watcher && !Global.RESULTS) $text.text('FRIENDS CAN JOIN AT<br><strong>'+(window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname)+'/racer</strong><br/>BY ENTERING THIS RACE CODE:');
            }
        }
    }
    
    this.animateIn = function(set, noAnim) {
        if (!$this.show) return false;
        $this.visible();
        _code.enable();
        _code.animateIn(set, noAnim);
    }
    
    this.animateOut = function() {
        
    }
    
    this.destroy = function() {
        if ($logo) {
            $logo.remove();
            $logo = null;    
        }
        return _this._destroy();
    }
});
