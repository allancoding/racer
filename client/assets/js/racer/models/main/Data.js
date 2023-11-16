Class(function Data() {
    Inherit(this, Model);
    var _this = this;
    var _data;
    
    //*** Constructor
    (function() {
        if (!RacerDevice.fallback_browser) initSocket();
    })();

    function initSocket() {
        _this.SOCKET = new SocketModel();
    }
    
    function initData() {
        _data = __DATA__;
        _this.DATA = _data;
        delete window.__DATA__;
    }
    
    function initModels() {
        _this.TRACK = new TrackModel(_data.TRACKS, _data.HUSH_TRACKS);
        _this.LOBBY = new LobbyModel();
        _this.DEVICE = new DeviceModel(_data.DEVICES);
        _this.CONFIG = new ConfigModel(_data.CONFIG);
        _this.CONTENT = new ContentModel(_data.CONTENT);
    }

    //*** Event handlers

    //*** Public Methods
    this.init = function() {
        initData();
        initModels();
    }
    
    this.reset = function() {
        if (_this.LOBBY) _this.LOBBY.reset();
    }
    
}, 'Static'); 