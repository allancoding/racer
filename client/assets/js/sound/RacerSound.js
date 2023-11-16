Class(function RacerSound() {
	var _this = this; //use _this throughout the class.. prevents scope issues
	Inherit(this, Events); 

	var SYNC_INTERVAL = 5000; // ms between sync time against server
	var BUFFER = 0.2; // global scheduling buffer, delay in ms when sounds play
	var OFFSET_AVG_HISTORY = 5; // # latest offset samples to average
	
	var TOTAL_LAYERS = 5; // # stem tracks in music
	var LAYER_KICKBASE = 0;
	var LAYER_ARP4 = 1;
	var LAYER_COWBELL = 2;
	var LAYER_ARP1 = 3;
	var LAYER_HIHAT = 4;

	var _offset = 0;
	var _offsetHistory = [];
	var _startTime = null;
	var _playing = false;
	var _lowestLatencySync = [];
	var _hasSync = false;
	var _hasLoaded = true;
	var _knowsWebAudioCapabilities = false; // discovered on UPDATE_PLAYERS event
	var _throttle = 0;
	var _throttleVal = 0;

	var _syncTimeout = null;
	var _totalWebAudioDevices = 0;
	var _totalNonWebAudioDevices = 0;		
	var _myWebAudioIndex = -1;
	var _myOldWebAudioIndex = -1;
	var _numberOfPlayers = 0;
	var _lastPlayers = [];
	var _myLayers = [];
	var _myOldLayer;
	var _loadedLayers = ["loaded", "", "", "", "", ""];
	var _isFirstWebAudioPlayer = false;
	var _gameAlreadyPlaying = undefined;
	var _isRacing;
	var _raceStarted = false;
	var _devicePlayingRaceMusic = false;
	var _allAndroidRace = false;

	
	//*** Constructor
	(function() {
		Hydra.ready(function() {
				if (!this.DISABLE_SOUNDS && !isWatcher()) {
			    addListeners();
		    	if (!Global.TABLE) __window.bind('touchstart', initSoundTouch);
		  	}
		});
	})();

	function nowSync() {
		return (Date.now() - _offset) * 0.001;
	}

	function calculatePlayDelta() {
		if (!SCSound.webaudio) return 0;
		return nowSync() - _startTime - SCSound.Core.SoundController.context.currentTime - BUFFER;
	}


	function startSong(force) {
		if (_gameAlreadyPlaying) {
			return;
		}

		if (!force && (_playing || !_startTime || !Device.system.webaudio)) {
			return;
		}
		
		_playing = true;
		if (isPlayerDevice()) {
			// start song only playing one layer
			SCSound.send("lobby", [_myLayers[0]], calculatePlayDelta());
		} 
		else {
			// table & viewers play all layers
			SCSound.send("lobby", _myLayers, calculatePlayDelta());
		}		
	}

	function playArrFromBeginning(arrangement, msDelay) {
		if (Device.system.webaudio && _myWebAudioIndex === 0) {
			_playing = true; // flag song as started incase solid sync hasnt been achieved yet. 
			var delay = msDelay * 0.001 || 0.5;
			var newStartTime = nowSync() + delay;
			Data.SOCKET.sendSound('playArrFromBeginning', {startTime: newStartTime, arrangement: arrangement});
		}
	}

	function onPlayArrFromBeginning(e) {
		_startTime = e.startTime;
		SCSound.send(e.arrangement, _myLayers, calculatePlayDelta());
	}

	/* is a mobile device (not watcher or the table) */
	function isPlayerDevice() {
		return !isWatcher() && !isTableHead();
	}

	/* is a watcher */
	function isWatcher() {
		return Global.PLAYER_INDEX === -1;
	}

	/* is the actual table (not a player device on the table) */
	function isTableHead() {
		return Global.TABLE_HEAD;
	}

	/* is a player device on the table (not the actual table) */
	function isTableDevice() {
		return Global.TABLE && !isTableHead();
	}

	function gameHasStarted() {
		return _gameAlreadyPlaying !== false && _numberOfPlayers > 1;
	}


	function checkIfReadyToPlay() {

		if (_myWebAudioIndex === 0 && _totalWebAudioDevices === 1) {
			_isFirstWebAudioPlayer = true;
		}

		if (gameHasStarted() || _playing || !_hasLoaded || !_hasSync || !_knowsWebAudioCapabilities) {
			return;
		}
		// first webAudio device starts song right away (unless a device on the table)
		if (_isFirstWebAudioPlayer && !isWatcher() && !isTableDevice()) {
			_startTime = nowSync();
			startSong();
		}

		// tell other clients we are ready
		if (isPlayerDevice() || isWatcher()) {
			Data.SOCKET.sendSound('readyToPlay', {player: Global.PLAYER_INDEX});
		}
	}
	
	function getNumberOfWebAudioDevices(players) {
		var i = 0,
		    l = 0,
		    count = 0;

		if (!players) {
			return 0;
		}

		l = players.length;
		for (i; i < l; i++) {
			if (players[i].webaudio === true) {
				count++;
			}
		}
		return count;
	}

	function getMyWebAudioIndex(players) {
		var i = 0,
		    l = 0,
		    index = -1;

		if (!players) {
			return -1;
		}

		l = players.length;
		for (i; i < l; i++) {
			if (players[i].webaudio === true) {
				index++;
				if (players[i].me === true) {
					return index;
				}
			}
		}
		return -1;
	}

	function addListeners() {
	    if (!Global.TABLE) {
    		if (Device.system.webaudio) {
    			_this.events.subscribe(RacerEvents.SYNC_COMPLETED, onSyncCompleted);
    			_this.events.subscribe(RacerEvents.SYNC_RESPONSE, onSyncResponse);
    		}else {
    			_hasSync = true;
    		}
    		_this.events.subscribe(RacerEvents.GAME_STARTING, onGameStarting);
    		_this.events.subscribe(RacerEvents.READY_SET_GO, onStartMatch);
    		_this.events.subscribe(RacerEvents.OFF_TRACK, onOffTrack);
    		_this.events.subscribe(RacerEvents.GAME_ENDED, onGameEnded);
    		_this.events.subscribe(RacerEvents.LAP_COUNTER, onLapCounter);	
    		_this.events.subscribe(RacerEvents.UPDATE_PLAYERS, onUpdatePlayers);
    		_this.events.subscribe(RacerEvents.RESULT_SHOW, onResultShow);
    		_this.events.subscribe(RacerEvents.REFRESH, onRefresh);
    		_this.events.subscribe(HydraEvents.ERROR, onHydraError);
    		_this.events.subscribe(RacerEvents.PLAYER_FINISHED, onPlayerFinished);
    		_this.events.subscribe(RacerEvents.SOUND_UPDATE, handleSoundUpdate);
		}
	}
	
	function initSoundTouch(e) {
	    if (SCSound.isInited) {
	    	__window.unbind('touchstart', initSoundTouch);
	    	SCSound.onLibLoaded = onLibLoaded;
	    	SCSound.send("test");
		}
	}

	/* gather lowest latency samples in list and calculate average offset */
	function onSyncResponse(sample) {
		if (!_lowestLatencySync.length || sample.latency < _lowestLatencySync[0].latency) {
			_lowestLatencySync = [sample];
		}
		// add all samples with same latency
		else if (sample.latency === _lowestLatencySync[0].latency) {
			_lowestLatencySync.push(sample);
		}

		// average lowest latency samples
		var sum = 0,
		    i = _lowestLatencySync.length;
		while (i--) {
			sum += _lowestLatencySync[i].offset;
		}
		_offset = sum / _lowestLatencySync.length;
	}

	/* gets average offset based on history to avoid big jumps in music */
	function calculateAverageOffsetHistory() {
		// keep latest offsets in history - add to begining, remove last
		_offsetHistory.unshift(_offset);
		if (_offsetHistory.length > OFFSET_AVG_HISTORY) {
			_offsetHistory.pop();
		}

		var sum = 0,
		    i = _offsetHistory.length;

		while (i--) {
			sum += _offsetHistory[i];
		}

		return sum / _offsetHistory.length;
	}

	function onSyncCompleted(hydraOffset) {		
		_offset = calculateAverageOffsetHistory();
		_hasSync = true;
		
		if (_playing) {
			SCSound.send("update_delta", null, calculatePlayDelta());
		} 
		else {
			checkIfReadyToPlay();
		}

		// re-sync to prevent device clocks from drifting apart
		if (!Global.TABLE) {
			clearTimeout(_syncTimeout);
			_syncTimeout = setTimeout(_this.sync, SYNC_INTERVAL);
		}
	}

	function onPlayerFinished(e) {
		if (e.order[e.order.length-1].player === Global.PLAYER_INDEX) {
			_isRacing = false;
			if (Device.system.webaudio) {
				SCSound.send("throttle_off_wa");
			}
		}
	}

	function onHydraError(e) {
		_isRacing = false;
		SCSound.send("throttle_off");
		SCSound.send("final_car_finished");
		SCSound.send("stop_bridge_loop");
		
		startSong(true); // start from beginning
		
		_devicePlayingRaceMusic = false;
		_gameAlreadyPlaying = false;
		
		if (SCSound.audioSprite) {
			SCSound.audioSprite.pause();
		}
	}

	function onRefresh(e) {
		//Stops lobby track if this player exits lobby.
		_isRacing = false;
		SCSound.send("stop_lobby");
		_startTime = null;
		_myWebAudioIndex = -1;
		_myOldWebAudioIndex = -1;
		_myLayers = [];
		_lastPlayers = [];
		_playing = false;
		_hasSync = false;
		SCSound.send("stop_bridge_loop");
		_devicePlayingRaceMusic = false;
		if (SCSound.audioSprite) {
			setTimeout(function() {
				SCSound.audioSprite.pause();
			}, 150);
		}
	}

	function onPlayerJoined(e) {
		SCSound.send("join");
	}
	function onPlayerRemoved(e) {
		SCSound.send("leave");
	}
	function onNameChanged(e) {
		SCSound.send("change_name");
	}


	function getPlayerUpdates(e) {
		var updates = {
			playerJoined: false,
			playerRemoved: false,
			nameChange: false
		};

		if (!_lastPlayers || _lastPlayers.length  < _numberOfPlayers) {
			updates.playerJoined = true;
		}
		else if (_lastPlayers && _lastPlayers.length > _numberOfPlayers) {
			updates.playerRemoved = true;
		}
		else {
			// compare names against old player list
			var i = e.players.length;
			while (i-- && !updates.nameChange) {
				// check player against old players
				var j = _lastPlayers.length;
				while (j--) {
					if (e.players[i].id === _lastPlayers[j].id) {
						// found player in old array
						if (e.players[i].name !== _lastPlayers[j].name) {
							// name change for this player, break out of loop
							updates.nameChange = true;
							break;
						}
						// no name change for id - skip rest of old players
						continue;
					}
					
				}
			}
		}

		_lastPlayers = e.players;
		return updates;
	}

	function updatePlayerLayers(updates) {
		if (updates.playerJoined) {
			if (!_myLayers.length) {
				// this player joined, start playing next free layer
				_myLayers.push(_totalWebAudioDevices-1);
			}
			// fist player should stop playing extra layers if more players join
			else if (_myLayers.length > 1) {
				_myLayers.pop();
			}
		}
		else if (updates.playerRemoved) { 
			_myLayers[0] = _myWebAudioIndex;
		}

		// play extra layers
		if (_totalWebAudioDevices === 1 && _myLayers.length === 1) {
			_myLayers.push(LAYER_ARP4);
		}
	}

	function updateWatcherLayers() {
		if (!_myLayers.length) {
			_myLayers.push(LAYER_KICKBASE);
			_myLayers.push(LAYER_ARP4);
		}
	}

	function onUpdatePlayers(e) { 
		if (!e || !e.players) return false;

		var oldTotalWebAudioDevices = _totalWebAudioDevices;
		_myOldWebAudioIndex = _myWebAudioIndex;
		_myOldLayer = _myLayers[0] || -1;
		_totalWebAudioDevices = getNumberOfWebAudioDevices(e.players);
		_totalNonWebAudioDevices = e.players.length - _totalWebAudioDevices;
		_myWebAudioIndex = getMyWebAudioIndex(e.players);
		_numberOfPlayers = e.players.length;

		var updates = getPlayerUpdates(e);

		if (updates.playerJoined) {
			onPlayerJoined();
		}
		else if (updates.playerRemoved) {
			onPlayerRemoved();
		}
		else if (updates.nameChange) {
			onNameChanged();
		}

		if (isPlayerDevice()) {
			updatePlayerLayers(updates);
		}
		else if (isWatcher) {
			updateWatcherLayers(e.players);
		}
		
		_knowsWebAudioCapabilities = true;

		if (Device.system.webaudio) {
			if (_loadedLayers[5] === "") {
				_loadedLayers[5] = "loading";
				SCSound.send("load_5");
			}
		}

		// android only should always stop music when webaudio joins
		if (oldTotalWebAudioDevices === 0 && _totalWebAudioDevices > 0) {
			if (_raceStarted) {
				//web audio device joined
			}else {
				SCSound.send('stop_bridge_loop');
				_devicePlayingRaceMusic = false;
			}		
		}

		if (!_playing) {
			checkIfReadyToPlay();
		}
		else if (_myLayers.length && (_myLayers[0] !== _myOldLayer)) {
			if (!_gameAlreadyPlaying) {
				startSong(true); //force play of intro arrangement
			}
		}
	}

	function onResultShow(e) {
		_isRacing = false;
		_raceStarted = false;
		setTimeout(function() {
			SCSound.send("stop_race_loop");
		}, 200)

		// if only androids or watcher - first player playes all fanfares as one sound
		if (_allAndroidRace) {
			if (_totalNonWebAudioDevices > 1) {
				if (Global.PLAYER_INDEX === 1) {
					SCSound.send("fanfare_all");
				}else if (!Device.system.webaudio) {
					SCSound.send("result_in");
				}
			}else if (_devicePlayingRaceMusic) {
				SCSound.send("fanfare_all");
			}
			
		} else if (!Device.system.webaudio) {
			SCSound.send("result_in");
		}
		// split it up between the webaudio devices
		else if (Device.system.webaudio && _myWebAudioIndex > -1) {
			//first fanfares are played on each device...
			SCSound.send("result_in");
			var myFanfare = _myWebAudioIndex;
			SCSound.send("fanfare_"+ myFanfare);
			var playerIndex = _myWebAudioIndex + _totalWebAudioDevices;
			while(_totalWebAudioDevices > 0 && playerIndex <= 4) {	
				SCSound.send("fanfare_"+playerIndex);				
				playerIndex += _totalWebAudioDevices;
			}
		}		

		//_devicePlayingRaceMusic = false;
	}

	//Returns true if all soundlibs needed for the race is loaded.
	//you should check this before starting the lineup.
	this.checkReady = function() {
		var ready = true;
		if (!Device.system.webaudio) {
			return ready;
		}
		for (var i= 0; i<_loadedLayers.length; i++) {
			if (_loadedLayers[i] === "loading") {
				ready = false;
			}
		}
		return ready;
	}
	function onLibLoaded(lib) {
		_loadedLayers[lib] = "loaded";
	}
	function onGameStarting(e) {
		var layerToPlay = _myLayers[0];
		if (Device.system.webaudio) {
			if (_loadedLayers[layerToPlay] !== "loaded") {
				_loadedLayers[layerToPlay] = "loading";
				SCSound.send("load_"+layerToPlay);		
			}
			if (_myLayers[1] === 1 && _loadedLayers[1] !== "loaded") {
				_loadedLayers[1] = "loading";
				SCSound.send("load_1");		
			}
		}
		// flag first nonAudio device to play music if only android game
		if (_totalWebAudioDevices === 0 && Global.PLAYER_INDEX === 0) {
			_devicePlayingRaceMusic = true;
		}
		if (_totalWebAudioDevices === 0) {
			_allAndroidRace = true;
		}
		// lonely webaudio watcher should start playing here
		if (_totalWebAudioDevices === 0 && isWatcher()) {
			_startTime = nowSync();
			startSong();
		}
	}

	function onGameEnded(e) {
		if (_gameAlreadyPlaying === true) {
			_gameAlreadyPlaying = false;
			setTimeout(checkIfReadyToPlay, 5000);
			return;
		}

		Render.stopRender(doThrottle);
		SCSound.send("game_end");
		playArrFromBeginning("bridge", 4000);
		var BRIDGE_START_TIME = 4000;
		if (_allAndroidRace && _totalNonWebAudioDevices === 1) {
			BRIDGE_START_TIME += 2000;
		}
		setTimeout(function() {
			if (_devicePlayingRaceMusic) {
				if (_totalWebAudioDevices === 0) {
					SCSound.send("bridge_android");
				}else {
					_devicePlayingRaceMusic = false;
				}
			}
		}, BRIDGE_START_TIME);
	}

	function onStartMatch(e) {
		if (_gameAlreadyPlaying === true) {
			return;
		}
		_raceStarted = true;
		if (_devicePlayingRaceMusic) {
			SCSound.audioTag.src = SCSound.soundPath+ "Race_"+_totalNonWebAudioDevices+ ".mp3";
			SCSound.audioTag.pause();
			
		}
		// play ready-set-go
		var syncDelay = e.delay || 0;
		var READY_DELAY = syncDelay; // ms until "ready" appears
		var SET_GO_DELAY = 250 + 400 + 500 + 400; // ms between each word
		var RACE_MUSIC_START = READY_DELAY + 3700;

		if (Device.system.webaudio) {
			SCSound.send("ready", READY_DELAY + 200);
			SCSound.send("ready", READY_DELAY + SET_GO_DELAY);
			SCSound.send("go", READY_DELAY + 3000);
		}else if (_allAndroidRace) {
			if (_totalNonWebAudioDevices > 1) {
				if (Global.PLAYER_INDEX === 1) {
					SCSound.send("ready_set_go", READY_DELAY + 200);
				}
			}else if (_devicePlayingRaceMusic) {
				SCSound.send("ready_set_go", READY_DELAY + 200);
				RACE_MUSIC_START -= 0;
			}
			
		}

		// start engine sounds
		if (Device.system.webaudio) {
			if (isWatcher()) {
				SCSound.send("new_engine1", Global.PLAYER_INDEX);
			} else {
				SCSound.send("new_engine", 0);
			}
			Render.startRender(doThrottle);
			playArrFromBeginning("race", RACE_MUSIC_START);
		}
		else if (_devicePlayingRaceMusic) {
			setTimeout(function () {
				SCSound.send("race_loop_" + _totalNonWebAudioDevices);
			}, RACE_MUSIC_START);
		}

		if (isWatcher()) {
			Data.SOCKET.bind('throttle', onThrottleChangeWatcher);
		}

		_isRacing = true;
	}
	
	function onThrottleChangeWatcher(e) {
		if (e.type === "on") {
			SCSound.send("throttle_on_wa", e.player);
		}
		else if (e.type === "off") {
			SCSound.send("throttle_off_wa", e.player);
		}
	}

	function onOffTrack(e) {
		if (e.type === "offTrack" && e.player === Global.PLAYER_INDEX) {
			_isRacing = false;
			throttleCrash(e.player);
		}
		else if (e.type === "onTrack") {
			if (e.player === Global.PLAYER_INDEX) {
				_isRacing = true;
			}
			SCSound.send("car_place");
		}
		if (isWatcher() && e.type === "offTrack") {
			SCSound.send("throttle_off_wa", e.player);
		}
	}

	function onLapCounter(e) {
		// play lap completed sound on player device (except final lap)
		if (e.player === Global.PLAYER_INDEX && e.laps < Config.GAME.laps - 1) {
			SCSound.send("lap");
		}
	}

	function throttleOn() {
		_throttleVal = 0.02;
		if (!Device.system.webaudio && !_devicePlayingRaceMusic) {
			// only play android engine sound if not the one playing the music
			SCSound.audioSprite.play(4.8, 10.8);
		} 
		else if (Device.system.webaudio) {
			if (!isWatcher()) {
				SCSound.send("throttle_on_wa", 0, _throttle);
				SCSound.send("vol_up");
			}
		}
	}
	function throttleOff() {
		_throttleVal = -0.02;
		if (!Device.system.webaudio && _isRacing) {
			if (!SCSound.audioSprite.audio.paused) {
				SCSound.audioSprite.play(14, 1.5);
			}
		}
		else if (Device.system.webaudio) {
			if (!isWatcher()) {
				SCSound.send("throttle_off_wa");
				SCSound.send("vol_down");
			}
		}
	}
	function throttleCrash(player) {
		_throttleVal = -0.1;
		if (!Device.system.webaudio) {
			SCSound.audioSprite.pause();
			SCSound.send("skid_crash");
		} 
		else if (Device.system.webaudio) {
			if (!isWatcher()) {
				SCSound.send("throttle_off_wa");
				SCSound.send("vol_down");
				SCSound.send("skid");
				SCSound.send("collision", 1000);
			}
			else {
				SCSound.send("throttle_off_wa", player);
			}
		}
	}
	function doThrottle() {
		var t = _throttle + _throttleVal;	
		_throttle = Math.min(Math.max(t, 0), 1);
	}

	
	function handleSoundUpdate(e) {
		switch (e.type) {
			case 'readyToPlay': onReadyToPlay(e); break;
			case 'songStarted': onSongStarted(e); break;
			case 'skidStart': onSkidStart(e); break;
			case 'skidStop': onSkidStop(e); break;
			case 'playArrFromBeginning': onPlayArrFromBeginning(e); break;
		}
	}

	function onReadyToPlay(e) {
		if (Device.system.webaudio && (_myWebAudioIndex === 0 || _myOldWebAudioIndex === 0)) {
			Data.SOCKET.sendSound('songStarted', {startTime: _startTime});
		}
	}

	function onSongStarted(e) {
		if (!_playing && Device.system.webaudio) {
			_startTime = e.startTime;
			startSong();
		}
	}

	function onSkidStart(e) {
		if (e.player === Global.PLAYER_INDEX) {
			SCSound.send('skid_start', e.player);
		}
	}

	function onSkidStop(e) {
		if (e.player === Global.PLAYER_INDEX) {
			SCSound.send('skid_stop', e.player);
		}
	}


	/////////////////////////////////////////////////////////////////////////////
	// GLOBAL
	/////////////////////////////////////////////////////////////////////////////

	this.skidStart = function (playerIndex) {
		Data.SOCKET.sendSound('skidStart', {player: playerIndex});
	}

	this.skidStop = function (playerIndex) {
		Data.SOCKET.sendSound('skidStop', {player: playerIndex});	
	}
	
	//public method
	this.setPlayer = function(index) {
		// this method should exist so we can tell your engine which player you are between 0 - 4
	};

	this.sync = function () {
		_lowestLatencySync = [];
		Data.SOCKET.syncTime();
	}
	
	this.gameAlreadyPlaying = function(bool) {
	  _gameAlreadyPlaying = bool;
	  checkIfReadyToPlay();
	}
	
	this.exitLobby = function () {
		_myWebAudioIndex = -1;
		_myOldWebAudioIndex = -1;
		_isFirstWebAudioPlayer = false;
		_knowsWebAudioCapabilities = false;
		_gameAlreadyPlaying = undefined;
		if (SCSound.audioSprite) {
			setTimeout(function() {
				SCSound.audioSprite.pause();
			}, 150);
		}
	}
	
	this.throttle = function(type) {
		if (!_isRacing) {
			return;
		}

	  if (type === 'on') {
	  	throttleOn();
	  } else if (type === 'off') {
			throttleOff();
		}
	}

}, 'Static');
