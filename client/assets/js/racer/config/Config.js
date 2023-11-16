Class(function Config() {
  var _this = this;
  this.BG = "#000000";
  this.DEVELOPMENT = false;
  this.FORCE_MOBILE = false;
  this.FORCE_CODE = null;
  this.DISABLE_SOUNDS = false;
  this.USE_WEBSOCKETS = true;
  this.SKIP_INTRO = false;

  if (window.location.hash.strpos("forcemobile")) {
    this.DISABLE_SOUNDS = false;
    this.FORCE_MOBILE = true;
  }

  this.GAME = {
    laps: 10,
    canFinish: true,
    threshold: 20,
    overlap: 50,
    offTrack: true,
    canCrash: true,
  };

  this.HEIGHT = {
    min: 360,
    max: 720,
    offset: 36,
  };

  this.WIDTH = {
    min: 300,
    max: 700,
    offset: 40,
  };

  this.LOGO_COLORS = [
    "#ec1f27", //red
    "#f79221", //orange
    "#dac620", //yellow
    "#3bb54a", //green
    "#14a8df", //blue
  ];

  this.COLORS = [
    "#14a8df", //blue
    "#3bb54a", //green
    "#dac620", //yellow
    "#f79221", //orange
    "#ec1f27", //red
  ];

  this.ASSETS = [
    "assets/images/about/gradient-top.png",
    "assets/images/about/gradient-bottom.png",
    "assets/images/common/places/1.png",
    "assets/images/common/places/0.png",
    "assets/images/common/places/1.png",
    "assets/images/common/places/2.png",
    "assets/images/common/places/3.png",
    "assets/images/common/places/4.png",
    "assets/images/common/logos/appstore.png",
    "assets/images/track/touchglow/blue.png",
    "assets/images/track/cars/blue.png",
    "assets/images/common/logos/chrome-experiment.png",
    "assets/images/common/logos/chrome.png",
    "assets/images/common/close.png",
    "assets/images/lineup/dotted-line.png",
    "assets/images/common/devices/droid-razr.png",
    "assets/images/common/places/empty.png",
    "assets/images/lineup/fade-left.png",
    "assets/images/lineup/fade-right.png",
    "assets/images/common/devices/galaxy-nexus.png",
    "assets/images/track/loader/glow.png",
    "assets/images/track/touchglow/green.png",
    "assets/images/track/cars/green.png",
    "assets/images/common/devices/ipad-mini.png",
    "assets/images/common/devices/ipad.png",
    "assets/images/common/devices/iphone-4.png",
    "assets/images/common/devices/iphone-5.png",
    "assets/images/track/name-bg.png",
    "assets/images/common/devices/nexus-4.png",
    "assets/images/common/devices/nexus-7.png",
    "assets/images/common/devices/nexus-10.png",
    "assets/images/track/touchglow/orange.png",
    "assets/images/track/cars/orange.png",
    "assets/images/common/logos/play.png",
    "assets/images/common/logos/racer-large-mobile.png",
    "assets/images/common/logos/racer-large.png",
    "assets/images/common/logos/racer-small.png",
    "assets/images/common/logos/racer.png",
    "assets/images/common/spin-loader.png",
    "assets/images/track/touchglow/red.png",
    "assets/images/track/cars/red.png",
    "assets/images/common/devices/samsung-epic-4g.png",
    "assets/images/common/devices/samsung-galaxy-ace.png",
    "assets/images/common/devices/samsung-galaxy-note-2.png",
    "assets/images/common/devices/samsung-galaxy-s2.png",
    "assets/images/common/devices/samsung-galaxy-s3.png",
    "assets/images/common/devices/samsung-galaxy-tab-2.png",
    "assets/images/common/devices/samsung-galaxy-y.png",
    "assets/images/track/loader/scan.png",
    "assets/images/track/banner/shadow.png",
    "assets/images/common/logos/share.png",
    "assets/images/track/startline.png",
    "assets/images/lineup/tick.png",
    "assets/images/track/loader/track.png",
    "assets/images/track/win-outline.gif",
    "assets/images/track/touchglow/yellow.png",
    "assets/images/track/cars/yellow.png",
    "assets/images/lineup/you-triangle-dark.png",
    "assets/images/lineup/you-triangle.png",
  ];

  this.APP_ENGINE = window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname;
  this.PATH = "https://storage.googleapis.com/chrome-racer-static/";

  this.SOCKET_SERVER = window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname;

  this.PRESENTATION = (function () {
    if (window.location.href.strpos("_prezinstall")) {
      Utils.cookie("prez", 1);
    } else if (window.location.href.strpos("_prezdelete")) {
      Utils.cookie("prez", null);
    }

    if (window.location.href.strpos("_prez") || Utils.cookie("prez")) {
      _this.USE_WEBSOCKETS = false;
      _this.SOCKET_SERVER = "http://10.0.55.1:8089";
      return true;
    }
  })();

  this.WATCH_CODE = (function () {
    if (window.location.hash.strpos("race")) {
      var code = window.location.hash.split("race/");
      if (code[1] && code[1].length == 5) return code[1].toUpperCase();
    }
    return false;
  })();
}, "Static");
