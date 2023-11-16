Class(function TrackModel(_data, _hush) {
    Inherit(this, Model);
    var _this = this;
    var $svg;
    var _track, _type;
    var _tableTrack;
    var _trackPlayers;

    //*** Constructor
    (function() {
        Hydra.ready(initSVG);
    })();
    
    function initSVG() {
        $svg = $('.svg');
        $svg.invisible().css({top: -9999999999});
        __body.addChild($svg);
    }
    
    function findTrack() {
        var data = _data[_type];
        var players = Data.LOBBY.getPlayers().length;
        var screens = Data.LOBBY.getDimensions().screens;
       
        if (Config.PRESENTATION && players == 5) {
            return _data['presentation'][0];
        }
        
        if (!Global.TABLE) {
            _type = _type || 'easy';
            screens.sort(function(a, b) {
                return b.w - a.w;
            });
            var ratio = screens[0].w / screens[screens.length-1].w;
            if (ratio > 1.75) players++;
            if (players > 5) players = 5;
            
            _trackPlayers = players;
            
            for (var i = 0; i < data.length; i++) {
                if (Number(data[i].players) == players) return data[i];
            }
        } else {
            _tableTrack = 0;
            return _hush[_tableTrack];
        }
    }

    //*** Event handlers

    //*** Public Methods
    this.getTrack = function(index) {
        var data = findTrack();
        var path = data.code.split('<path')[index].split('/>')[0];
        var time = Utils.timestamp();
        var width = Number(data.code.split('width="')[1].split('"')[0].slice(0, -2));
        var height = Number(data.code.split('height="')[1].split('"')[0].slice(0, -2));

        $svg.empty();
        $svg.text('<svg version="1.1" id="track_'+time+'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path'+path+'/></g></svg>');
        
        var values = {};
        values.svg = document.getElementById('track_'+time);
        values.width = width;
        values.height = height;
        values.paddingX = Number(data.padding_x);
        values.paddingY = Number(data.padding_y);
        values.positionX = Number(data.position_x);
        values.positionY = Number(data.position_y);
        values.offset = Number(data.offset);
        
        $svg.empty();
        Config.GAME.laps = Config.PRESENTATION ? 2 : 4;// Number(data['number_laps']) || 4;
        
        _track = data;
        return values;
    }
    
    this.getTableDimensions = function() {
        return {width: Number(_hush[0].width), height: Number(_hush[0].height)};   
    }
    
    this.getDesktopAdjust = function() {
        return Number(_track.desktop_adjust) || 0;
    }
    
    this.getTraction = function(index) {
        var traction = Number(_track['player_'+(index+1)+'_traction']);
        if (isNaN(traction) || !traction) traction = 17;
        return traction;
    }
    
    this.setType = function(type) {
        switch (type) {
            case 'SIMPLE': _type = 'easy'; break;
            case 'EXCITING': _type = 'med'; break;
            case 'CRAZY': _type = 'hard'; break;
        }
    }
    
    this.setTableTrack = function(num) {
        _tableTrack = num;
    }
    
    this.getTrackPlayers = function() {
        return _trackPlayers;
    }
    
    this.getMaxVelocity = function() {
        var max = Number(_track['max_velocity']);
        if (isNaN(max) || !max) max = 30;
        return max;
    }
    
    this.getTrackAngle = function() {
        return Number(_track.crash_angle);
    }
}); 