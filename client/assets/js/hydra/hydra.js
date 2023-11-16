//*** Create a global object
window.Global = new Object();

//*** Shortcut to open a link
window.getURL = function(url, target) {
    if (!target) target = '_blank';
    window.open(url, target);
}

//*** Nullify any hanging console.log calls
if(typeof(console) === 'undefined') {
    window.console = {}
    console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function() {};
}

//*** requestAnimationFrame Shim

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
    
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
            window.setTimeout( callback, 1000 / 60 );
        };
    
    } )();
}

//*** Date.now shim
Date.now = Date.now || function() { return +new Date; };

//*** Create a class
window.Class = function(_class, _type) {   
    var _name = _class.toString().match(/function ([^\(]+)/)[1];
    _type = (_type || '').toLowerCase();
        
    if (!_type) {
        this[_name] = _class;
    } else {
        if (_type == 'static') {
            this[_name] = new _class();
        } else if (_type == 'singleton') {
            this[_name] = (function() {
                var _this = new Object();
                var _instance;
                
                _this.instance = function() {
                    if (!_instance) _instance = new _class();
                    return _instance;
                }
                
                return _this;
            })();
        }
    }
}

//*** To be used in classes to inherit properties from "parent" object
window.Inherit = function(child, parent, param) {
    if (!param) param = child;
    var p = new parent(param);
    var save = new Object();
    for (var method in p) {    
        child[method] = p[method];
        save[method] = p[method];
    }
    
    if (child.__call) child.__call();

    setTimeout(function() {
        for (method in p) {
            if ((child[method] && save[method]) && child[method] !== save[method]) {
                child['_'+method] = save[method];
            }
        }
        
        p = save = null;
    }, 1);
}

//*** Interface
window.Interface = function(cl, intr) {
    setTimeout(function() {
        var intrface = new intr();
        for (var property in intrface) {
            if (typeof cl[property] === 'undefined') {
                throw 'Interface Error: Missing Property: '+property+' ::: '+intr;
            } else {
                var type = typeof intrface[property];
                if (typeof cl[property] != type) throw 'Interface Error: Property '+property+' is Incorrect Type ::: '+intr;
            }
        }
        intrface = null;
    }, 1);
}

Class(function HydraObject(_selector, _type, _exists) {
	var _this = this;
	this._events = {};
	this._children = [];
	var _fragment, _fragTimer;

	//*** Constructor
	(function() {
		initSelector();
		inheritFunctions();
	})();
	
	function initSelector() {
		if (_selector && typeof _selector !== 'string') {
			_this.div = _selector; 
		} else {
			var first = _selector ? _selector.charAt(0) : null;
			var name = _selector ? _selector.slice(1) : null;
			if (!_exists) {
				_this.type_ = _type || 'div';
				_this.div = document.createElement(_this.type_);
				if (first) {
				    if (first == '#') _this.div.id = name;
				    else _this.div.className = name;
				}
			} else {
				if (first != '#') throw 'Hydra Selectors Require #ID';
				_this.div = document.getElementById(name);
			}
		}
	}
	
	function inheritFunctions() {
		for (var i in $.fn) {
			_this[i] = $.fn[i];
		}
	}
	
	function checkChildMatch(div, name, type) {
		if (div[type == '.' ? 'className' : 'id'] == name) return div;
		return false;
	}
	
	function mergeFragment() {
        if (!_fragment) return false;
        _this.div.appendChild(_fragment);
        _fragment = _fragTimer = null;
    }

	//*** Event Handlers

	//*** Public methods
	this.addChild = function(child) {
	    var div = this.div;
        if (this.__useFragment) {
            if (!_fragment) _fragment = document.createDocumentFragment();
            clearTimeout(_fragTimer);
            _fragTimer = setTimeout(mergeFragment, 1);
            div = _fragment;
        }
        
	    if (child.element) {
	        div.appendChild(child.element.div);
	        this._children.push(child.element);
            child.element._parent = this;
	    } else if (child.container) {
	        div.appendChild(child.container.div);
	        this._children.push(child.container);
            child.container._parent = this;
		} else if (child.div) {
		    div.appendChild(child.div);
		    this._children.push(child);
            child._parent = this;
		} else {
		    div.appendChild(child);
		}
		return this;
	}
	
	this.clone = function() {
	    return $(this.div.cloneNode(true));
	}
	
	this.empty = function() {
	    for (var i = 0; i < this._children.length; i++) {
            var child = this._children[i];
            if (child && child.remove) child.remove();
			this._children = [];
        }
		this.div.innerHTML = '';
		return this;
	}
	
	this.text = function(text) {
	    if (typeof text !== 'undefined') {
    		this.div.innerHTML = text;
    		return this;
		} else {
		    return this.div.innerHTML;
		}
	}
	
	this.append = function(text) {
		var html = this.div.innerHTML + text;
		this.div.innerHTML = html;
		return this;
	}
	
	this.prepend = function(text) {
		var html = text + this.div.innerHTML;
		this.div.innerHTML = html;
		return this;
	}
	
	this.parent = function() {
		return this._parent;
	}
	
	this.removeChild = function(object) {
		try { this.div.removeChild(object.div); } catch(e) { };
		var len = this._children.length-1;
		for (var i = len; i > -1; i--) {
		    if (this._children[i] == object) {
		      this._children[i] = null;
		      this._children.splice(i, 1);
		    }
		}
	}

	this.remove = function(keepAlive) {
	    this.stopTween();
		var parent = this._parent;
		if (parent && parent.removeChild) parent.removeChild(this);
		if (!keepAlive) {
			var len = this._children.length-1;
	        for (var i = len; i > -1; i--) {
	        	var child = this._children[i];
	            if (child && child.remove) child.remove();
	        } 
	        try {
				for (i in this) {
	  				this[i] = null;
	   			}
			} catch(e) { }
		}
	}
	
	this.find = function(selector) {
        var first = selector.charAt(0);
        var name = selector.slice(1);
        for (var i = 0; i < this.div.children.length; i++) {
            var child = this.div.children[i];
            var match = checkChildMatch(child, name, first);
            if (match) {
                var len = this._children.length-1;
                for (var i = 0; i < this._children.length; i++) {
                    var c = this._children[i];
                    if (c.div == match) {
                        return c;
                    }
                }
                
                var $c = $(child);
                $c._parent = this;
                this._children.push($c);
                return $c;
            }
        }
        console.warn('Warning: HydraObject.find turned up no results.');
    }
	
	this.hide = function() {
		this.div.style.display = 'none';
		return this;
	}
	
	this.show = function() {
		this.div.style.display = 'block';
		return this;
	}
});

Class(function Hydra() {
	var _this = this;
	var _inter;
	var _readyCallbacks = new Array();
	
	(function() {
		initLoad();
	})();
	
	function initLoad() {
		if (!document || !window) return setTimeout(initLoad, 1);
		if (window.addEventListener) {
			_this.addEvent = 'addEventListener';
			_this.removeEvent = 'removeEventListener';
			window.addEventListener('load', loaded, false);
		} else {
			_this.addEvent = 'attachEvent';
			_this.removeEvent = 'detachEvent';
			window.attachEvent('onload', loaded);
		}
	}
	
	function loaded() {
		// Get audio working
		document.body.addEventListener('touchstart', (e) =>
			SCSound.Core.SoundController.context.resume()
		);

		if (window.removeEventListener) window.removeEventListener('load', loaded, false);
		for (var i = 0; i < _readyCallbacks.length; i++) {
			_readyCallbacks[i]();
		}
		_readyCallbacks = null;
		_this.READY = true;
		if (window.Main) Hydra.Main = new window.Main();
	}
	
	this.development = function(flag) {
		if (!flag) {
			clearInterval(_inter);
		} else {
			_inter = setInterval(function() {
				for (var prop in window) {
					var obj = window[prop];
					if (typeof obj !== 'function' && prop.length > 2) {
					    if (prop == '_gaq' || prop == '_gat') continue;
						var char1 = prop.charAt(0);
						var char2 = prop.charAt(1);
						if (char1 == '_' || char1 == '$') {
						    if (char2 !== char2.toUpperCase()) console.warn('Hydra Warning:: '+prop+' leaking into global scope');
						}
					}
				}
			}, 1000);
		}
	}
	
	this.preventClicks = function() {
    	_this._preventClicks = true;
		setTimeout(function() {
			_this._preventClicks = false;
		}, 500);
	}
	
	this.ready = function(callback) {
		if (this.READY) return callback();
		_readyCallbacks.push(callback);
	}
	
	this.$ = function(selector, type, exists) {
		return new HydraObject(selector, type, exists);
	}
	
	this.HTML = new Object();
	this.$.fn = new Object();
	window.$ = this.$;
}, 'Static');

Hydra.ready(function() {
    //*** Set global shortcut to window, document, and body.
    window.__window = $(window);
    window.__document = $(document);
    window.__body = $(document.getElementsByTagName('body')[0]);
    //window.__body.__useFragment = true;
    
    //*** Create a global event for when the tab loses focus
    setTimeout(function() {
        if (Device.detect(['msie'])) {
            document.onfocus = onfocus;
            document.onblur = onblur
        } else {
            window.onfocus = onfocus;
            window.onblur = onblur;
        }
    }, 250);
    
    function onfocus() {
        HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {type: 'focus'});
    }
    
    function onblur() {
        HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {type: 'blur'});
    }
    
    if (typeof window.innerWidth === 'undefined') {
        window.innerWidth = document.documentElement.offsetWidth;
        window.innerHeight = document.documentElement.offsetHeight;
        window.onresize = function() {
            window.innerWidth = document.documentElement.offsetWidth;
            window.innerHeight = document.documentElement.offsetHeight;
            HydraEvents._fireEvent(HydraEvents.RESIZE);
        };
    } else {
        window.onresize = function() {
            HydraEvents._fireEvent(HydraEvents.RESIZE);
        };
    }
});

Class(function MVC() {
    Inherit(this, Events);
    
    this.classes = {};
    
    this.delayedCall = function(callback, time, params) {
        var _this = this;
        return setTimeout(function() {
            if (_this.element && _this.element.show) callback.apply(_this, [params]);
        }, time || 0);
    }
    
    this.initClass = function(name, clss, param) {
        if (typeof name !== 'string') {
            param = clss;
            clss = name;
            name = Utils.timestamp();
        }
        
        this.classes[name] = new clss(param);
        this.classes[name].parent = this;
        this.classes[name].__id = name;
        if (typeof param !== 'boolean') this.element.addChild(this.classes[name]);
        return this.classes[name];
    }
    
    this.destroy = function() {
        if (this.container) Global[this.container.div.id.toUpperCase()] = null;    

        for (var i in this.classes) {
            if (this.classes[i] && this.classes[i].destroy && this.classes[i].element && typeof this.classes[i].element.remove !== 'null') {
                this.classes[i].destroy();
            }
        }
        
        this.classes = null;
        if (this.events) this.events = this.events.destroy();
        if (this.element && this.element.remove) this.element = this.container = this.element.remove();
        if (this.parent) {
            if (this.parent.__destroyChild) this.parent.__destroyChild(this.__id);
            this.parent = null;
        }
        
        return null;
    }
    
    this.__destroyChild = function(name) {
        this.classes[name] = null;
        delete this.classes[name];
    }
});

Class(function Model(name) {
    Inherit(this, Events);
    
    Global[name.constructor.toString().match(/function ([^\(]+)/)[1].toUpperCase()] = {};
});

Class(function View(name) {
	Inherit(this, MVC);
	
	this.element = $('.'+name.constructor.toString().match(/function ([^\(]+)/)[1]);
	
	this.css = function(obj) {
	   this.element.css(obj); 
	   return this;
	}
	
	this.transform = function(obj) {
	    this.element.transform(obj);
	    return this;
	}
	
	this.tween = function(props, time, ease, delay, callback, manual) {
	    return this.element.tween(props, time, ease, delay, callback, manual);
	}
	
	this.__call = function() {
        this.events.scope(this);
        delete this.__call;
    }
});

Class(function Controller(name) {
	Inherit(this, MVC);
	
	name = name.constructor.toString().match(/function ([^\(]+)/)[1];
		
    this.element = this.container = $('#'+name);
    
    Global[name.toUpperCase()] = {};    
    
    this.css = function(obj) {
        this.container.css(obj);
    }
    
    this.__call = function() {
        this.events.scope(this);
        delete this.__call;
    }
});

Class(function Utils() {
	var _this = this;
			
	//*** Properties
	
	//*** Private functions
	function toHex(n) {
		n = parseInt(n,10);
		if (isNaN(n)) return "00";
		n = Math.max(0,Math.min(n,255));
		return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
	}
	
	function rand(min, max) {
	    return lerp(Math.random(), min, max);
	}
	
	function lerp(ratio, start, end) {
	    return start + (end - start) * ratio;
	}
	
	//*** Public functions
	this.doRandom = function(min, max) {
		return Math.round(rand(min - 0.5, max + 0.5));
	}
	
	this.headsTails = function(heads, tails) {
		var rand = Utils.doRandom(0,1);
		if (!rand) return heads;
		else return tails;
	}
	
	this.toDegrees = function(rad) {
		return rad * (180/Math.PI);
	}

	this.toRadians = function(deg) {
		return deg * (Math.PI/180);
	}
	
	this.findDistance = function(p1, p2) {
		var dx = p2.x - p1.x;
		var dy = p2.y - p1.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	this.timestamp = function() {
		var date = new Date();
		return date.getMinutes() +''+ date.getSeconds() +''+ date.getMilliseconds() +''+ _this.doRandom(1,5000);
	}
	
	this.rgbToHex = function(R, G, B) {
		return toHex(R)+toHex(G)+toHex(B);
	}
	
	this.hexToRGB = function(str) {
		var ret = [];
	    str.replace(/(..)/g, function(str){
	    	ret.push(parseInt(str, 16));
	    });
	    return ret;
	}
	
	this.getBackground = function($obj) {
		var bg = $obj.css('backgroundImage');
		if (bg.length) {
			bg = bg.replace('("', '(');
			bg = bg.replace('")', ')');
			bg = bg.split('(');
			bg = bg[1].slice(0, -1);
		}
		return bg;
	}
	
	this.hitTestObject = function(obj1, obj2) {
		var x1 = obj1.x, y1 = obj1.y, w = obj1.width, h = obj1.height;
		var xp1 = obj2.x, yp1 = obj2.y, wp = obj2.width, hp = obj2.height;
		var x2 = x1+w, y2 = y1+h, xp2 = xp1+wp, yp2 = yp1+hp;
		if(xp1 >= x1 && xp1 <= x2 ) {
			if(yp1>=y1 && yp1<=y2) {
				return true;
			}
			else if(y1>=yp1 && y1<=yp2) {
				return true;
			}
		}
		else if(x1>=xp1 && x1<=xp2) {
			if(yp1>=y1 && yp1<=y2) {
				return true;
			}
			else if(y1>=yp1 && y1<=yp2) {
				return true;
			}
		}
		return false;
	}
	
	this.randomColor = function() {
		return '#'+Math.floor(Math.random()*16777215).toString(16);
	}
	
	this.touchEvent = function(e) {
		if (!e) return {x: 0, y: 0};
	    if (e.touches || e.changedTouches) {
	        if (e.changedTouches.length) return {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY};
	        else return {x: e.touches[0].pageX, y: e.touches[0].pageY};
	    } else {
	        return {x: e.pageX, y: e.pageY};
	    }
	}
		
	this.cookie = function (key, value, expires) {
		var options;
	    if (arguments.length > 1 && (value === null || typeof value !== "object")) {
			options = new Object();
			options.path = '/';
			options.expires = expires || 1;

	        if (value === null) {
	            options.expires = -1;
	        }

	        if (typeof options.expires === 'number') {
	            var days = options.expires, t = options.expires = new Date();
	            t.setDate(t.getDate() + days);
	        }

	        return (document.cookie = [
	            encodeURIComponent(key), '=',
	            options.raw ? String(value) : encodeURIComponent(String(value)),
	            options.expires ? '; expires=' + options.expires.toUTCString() : '',
	            options.path ? '; path=' + options.path : '',
	            options.domain ? '; domain=' + options.domain : '',
	            options.secure ? '; secure' : ''
	        ].join(''));
	    }

	    options = value || {};
	    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
	    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
	}
	
	String.prototype.strpos = function(str) {
        return this.indexOf(str) != -1;
    }
}, 'Static');

(function() {
	$.fn.visible = function() {
		this.div.style.visibility = 'visible';
		return this;
	}
	
	$.fn.invisible = function() {
		this.div.style.visibility = 'hidden';
		return this;
	}
		
	$.fn.setZ = function(z) {
		this.div.style.zIndex = z;
		return this;
	}
	
	$.fn.clearAlpha = function() {
        this.div.style.opacity = '';
		return this;
	}
	
	$.fn.size = function(w, h, noScale) {
		if (typeof w === 'string') {
		    if (typeof h === 'undefined') h = '100%';
		    else if (typeof h !== 'string') h = h+'px';
		    this.div.style.width = w;
		    this.div.style.height = h;
	    } else {
	        this.width = w;
	        this.height = h;
	    	this.div.style.width = w+'px';
	    	this.div.style.height = h+'px';
	    	if (!noScale) this.div.style.backgroundSize = w+'px '+h+'px';
		}
		return this;
	}
	
	$.fn.retinaSize = function(w, h) {
		if (typeof w === 'string') this.div.style.backgroundSize = w+' '+h;
		else this.div.style.backgroundSize = w+'px '+h+'px';
		return this;
	}
	
	$.fn.mouseEnabled = function(bool) {
		this.div.style.pointerEvents = bool ? 'auto' : 'none';
		return this;
	}
	
	$.fn.fontStyle = function(family, size, color, style) {
		var font = new Object();
		if (family) font.fontFamily = family;
		if (size) font.fontSize = size;
		if (color) font.color = color;
		if (style) font.fontStyle = style;
		this.css(font);
		return this;
	}
	
	$.fn.bg = function(src, x, y, repeat) {
	    if (src.charAt(0) == '#') this.div.style.backgroundColor = src;
	    else this.div.style.backgroundImage = 'url('+src+')';
	    
	    if (typeof x !== 'undefined') {
	        x = typeof x == 'number' ? x+'px' : x;
            y = typeof y == 'number' ? y+'px' : y;
            this.div.style.backgroundPosition = x+' '+y;
	    }
	    
	    if (repeat) this.div.style.backgroundRepeat = repeat;
		return this;
	}
    
    $.fn.css = function(obj, value) {
        if (typeof value == 'boolean') {
            skip = value;
            value = null;
        }
        
    	if (typeof obj !== 'object') {
    		if (!value) {
				var style = this.div.style[obj];
				if (typeof style !== 'number') {
				    if (style.strpos('px')) style = Number(style.slice(0, -2));
				    if (obj == 'opacity') style = 1;
				}
				if (!style) style = 0;
				return style;
			} else {
				this.div.style[obj] = value;
				return this;
			}
		}

		for (var type in obj) {
			var val = obj[type];
			if (!(typeof val === 'string' || typeof val === 'number')) continue;
			if (typeof val !== 'string' && type != 'opacity' && type != 'zIndex') val += 'px';
            this.div.style[type] = val;
		}
		
		return this;
    }
})();

Class(function CSS() {
    var _this = this;
    var _obj;
 
    //*** Constructor
    Hydra.ready(function() {
        _obj = document.createElement('style');
        _obj.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(_obj);   
    });
    
    function objToCSS(key) {
        var match = key.match(/[A-Z]/);
        var camelIndex = match ? match.index : null;
        if (camelIndex) {
            var start = key.slice(0, camelIndex);
            var end = key.slice(camelIndex);
            key = start+'-'+end.toLowerCase();
        }
        return key;
    }
    
    function cssToObj(key) {
        var match = key.match(/\-/);
        var camelIndex = match ? match.index : null;
        if (camelIndex) {
            var start = key.slice(0, camelIndex);
            var end = key.slice(camelIndex).slice(1);
            var letter = end.charAt(0);
            end = end.slice(1);
            end = letter.toUpperCase() + end;
            key = start + end;
        }
        return key;
    }
    
    this.style = function(selector, obj) {
        var s = selector + ' {';
        for (var key in obj) {
            var prop = objToCSS(key);
            var val = obj[key];
            if (typeof val !== 'string' && type != 'opacity') val += 'px';
            s += prop+':'+val+'!important;';
        }
        s += '}';
        _obj.innerHTML += s;
    }
    
    this.get = function(selector, prop) {
        var values = new Object();
        var string = _obj.innerHTML.split(selector+' {');
        for (var i = 0; i < string.length; i++) {
            var str = string[i];
            if (!str.length) continue;
            var split = str.split('!important;');
            for (var j in split) {
                if (split[j].strpos(':')) {
                    var fsplit = split[j].split(':');
                    if (fsplit[1].slice(-2) == 'px') {
                        fsplit[1] = Number(fsplit[1].slice(0, -2));
                    }
                    values[cssToObj(fsplit[0])] = fsplit[1];
                }
            }  
        }
        
        if (!prop) return values;
        else return values[prop];
    }

	this.textSize = function($obj) {
	    var $clone = $obj.clone();
	    $clone.css({position: 'relative', cssFloat: 'left', styleFloat: 'left', marginTop: -99999, width: '', height: ''});
	    __body.addChild($clone);

	    var width = $clone.div.offsetWidth;
	    var height = $clone.div.offsetHeight;

	    $clone.remove();
	    return {width: width, height: height};
	}
}, 'Static');

Class(function Device() {
    var _this = this;
    this.agent = navigator.userAgent.toLowerCase();
    
    function checkForTag(prop) {
        var div = document.createElement('div'),
        vendors = 'Khtml ms O Moz Webkit'.split(' '),
        len = vendors.length;

        if ( prop in div.style ) return true;
        prop = prop.replace(/^[a-z]/, function(val) {
            return val.toUpperCase();
        });
    
        while(len--) {
            if ( vendors[len] + prop in div.style ) {
                return true;
            }
        }
        return false;
    }

    this.detect = function(array) {
        if (typeof array === 'string') array = [array];
        for (var i = 0; i<array.length; i++) {
            if (this.agent.strpos(array[i])) return true;
        }
        return false;
    }
    
    //*** Mobile
    this.mobile = (!!('ontouchstart' in window) && this.detect(['ios', 'iphone', 'ipad', 'windows phone', 'android', 'blackberry'])) ? {} : false;
    if (this.mobile) {
        this.mobile.tablet = window.innerWidth > 1000 || window.innerHeight > 900;
        this.mobile.phone = !this.mobile.tablet;
    }
    
    //*** Browser
    this.browser = new Object();
    if (!this.mobile) {
        this.browser.chrome = this.detect('chrome');
        this.browser.safari = !this.browser.chrome && this.detect('safari');
        this.browser.firefox = this.detect('firefox');
        this.browser.ie = this.detect('msie');
        this.browser.version = (function() {
            if (_this.browser.chrome) return Number(_this.agent.split('chrome/')[1].split('.')[0]);
            if (_this.browser.firefox) return Number(_this.agent.split('firefox/')[1].split('.')[0]);
            if (_this.browser.safari) return Number(_this.agent.split('version/')[1].split('.')[0].charAt(0));
            if (_this.browser.ie) return Number(_this.agent.split('msie ')[1].split('.')[0]);
        })();
    }
    this.vendor = (function() {
        if (_this.browser.firefox) return 'moz';
        if (_this.browser.opera) return 'o';
        if (_this.browser.ie) return 'ms';
        return 'webkit';
    })();
    
    //*** System
    this.system = new Object();
    this.system.retina = window.devicePixelRatio > 1 ? true : false;
    this.system.webworker = typeof window.Worker !== 'undefined';
    this.system.offline = !!window.applicationCache;
    this.system.geolocation = 'geolocation' in navigator;
    this.system.pushstate = typeof window.history.pushState !== 'undefined';
    this.system.webcam = !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia);
    this.system.language = window.navigator.userLanguage || window.navigator.language;
    this.system.webaudio = typeof webkitAudioContext !== 'undefined';
    this.system.localStorage = typeof window.localStorage !== 'undefined';
    this.system.fullscreen = typeof document[_this.vendor+'CancelFullScreen'] !== 'undefined';
    this.system.os = (function() {
        if (_this.detect('mac os')) return 'mac';
        if (_this.detect('windows nt 6.2')) return 'windows8';
        if (_this.detect('windows nt 6.1')) return 'windows7';
        if (_this.detect('windows nt 6.0')) return 'windowsvista';
        if (_this.detect('windows nt 5.1')) return 'windowsxp';
        if (_this.detect('linux')) return 'linux';
        return 'undetected';
    })();
        
    //*** Media
    this.media = new Object();
    this.media.audio = (function() {
        if (!!document.createElement('audio').canPlayType) {
            return _this.detect(['firefox', 'opera']) ? 'ogg' : 'mp3';
        } else {
            return false;
        }
    })();
    this.media.video = (function() {
        var vid = document.createElement('video');
        if (!!vid.canPlayType) {
            if (Device.mobile) return 'mp4';
            if (_this.browser.chrome) return 'webm';
            if (_this.browser.firefox || _this.browser.opera) {
                if (vid.canPlayType('video/webm; codecs="vorbis,vp8"')) return 'webm';
                return 'ogv';
            }
            return 'mp4';
        } else {
            return false;
        }
    })();
    
    //*** Graphics
    this.graphics = new Object();
    this.graphics.webgl = typeof window.WebGLRenderingContext !== 'undefined';
    this.graphics.canvas = (function() {
        var canvas = document.createElement('canvas');
        return canvas.getContext ? true : false;
    })();
    
    //*** Style properties
    this.styles = new Object();
    this.styles.filter = checkForTag('filter') && !_this.browser.firefox;
    this.styles.shader = _this.browser.chrome;
    this.styles.vendor = (function() {
        if (_this.browser.firefox) return 'Moz';
        if (_this.browser.opera) return 'O';
        if (_this.browser.ie) return 'ms';
        return 'Webkit';
    })();
    
    //*** CSS3 Tweens
    this.tween = new Object();
    this.tween.transition = checkForTag('transition');
    this.tween.css2d = checkForTag('transform');
    this.tween.css3d = checkForTag('perspective');
    this.tween.complete = (function() {
        if (_this.browser.firefox || _this.detect('msie 10')) return 'transitionend';
        if (_this.browser.opera) return 'oTransitionEnd';
        if (_this.browser.ie) return 'msTransitionEnd';
        return 'webkitTransitionEnd';
    })();
    
    //*** Fullscreen
    this.openFullscreen = function() {
        if (__body && _this.system.fullscreen) {
            __body.css({top: 0});
            __body.div[_this.vendor+'RequestFullScreen']();
        }
    }
    
    this.closeFullscreen = function() {
        if (_this.system.fullscreen) document[_this.vendor+'CancelFullScreen']();
    }
    
    this.getFullscreen = function() {
        return document[_this.vendor+'IsFullScreen'];
    }
}, 'Static');

Class(function DynamicObject(_properties) {
	for (var key in _properties) {
        this[key] = _properties[key];
    }
	
    //*** Public methods
	this.tween = function(properties, time, ease, delay, update, complete) {
		if (typeof delay !== 'number') {
			complete = update;
			update = delay;
			delay = 0;
		}
		if (typeof complete !== 'function') complete = null;
		if (typeof update !== 'function') update = null;
		return new MathTween(this, properties, time, ease, delay, update, complete);
	}
	
	this.copy = function() {
		var c = new DynamicObject();
		for (var key in this) {
			if (typeof this[key] !== 'function') c[key] = this[key];
		}
		return c;
	}
});

Class(function HydraEvents() {
	var _events = new Array();
	
	this.BROWSER_FOCUS = 'hydra_focus';
    this.HASH_UPDATE = 'hydra_hash_update';
    this.COMPLETE = 'hydra_complete';
    this.PROGRESS = 'hydra_progress';
    this.UPDATE = 'hydra_update';
    this.LOADED = 'hydra_loaded';
    this.END = 'hydra_end';
    this.FAIL = 'hydra_fail';
    this.SELECT = 'hydra_select';
    this.ERROR = 'hydra_error';
    this.READY = 'hydra_ready';
    this.RESIZE = 'hydra_resize';
    this.CLICK = 'hydra_click';
    this.HOVER = 'hydra_hover';
    this.MESSAGE = 'hydra_message';
	
	this._checkDefinition = function(evt) {
	    if (typeof evt == 'undefined') {
            throw 'Undefined event';
        }
	}
		
	this._addEvent = function(e, callback, object) {
	    this._checkDefinition(e);
		var add = new Object();
		add.evt = e;
		add.object = object;
		add.callback = callback;
		_events.push(add);		
	}
	
	this._removeEvent = function(eventString, callback) {
	    this._checkDefinition(eventString);
		for (var i = _events.length-1; i > -1; i--) {
			if (_events[i].evt == eventString && _events[i].callback == callback) {
			    _events[i] = null;
				_events.splice(i, 1);
			}
		}
	}
	
	this._destroyEvents = function(object) {
	    for (var i = _events.length-1; i > -1; i--) {
            if (_events[i].object == object) {
                _events[i] = null;
                _events.splice(i, 1);
            }
        }
	}
	
	this._fireEvent = function(eventString, obj) {
	    this._checkDefinition(eventString);
		var fire = true;
		obj = obj || {};
		obj.cancel = function() {
			fire = false;
		};

		for (var i = 0; i < _events.length; i++) {
			if (_events[i].evt == eventString) {
				if (fire) _events[i].callback(obj);
				else return false;
			}
		}
	}
	
	this._consoleEvents = function() {
		console.log(_events);
	}
}, 'Static');

Class(function Events(_this) {
	this.events = new Object();
	var _events = new Object();
	
	this.events.subscribe = function(evt, callback) {
	    HydraEvents._addEvent(evt, callback, _this);
	}
	
	this.events.unsubscribe = function(evt, callback) {
	    HydraEvents._removeEvent(evt, callback);
	}
	
	this.events.fire = function(evt, obj, skip) {
		obj = obj || {};
	    HydraEvents._checkDefinition(evt);
		if (_events[evt]) {
		    obj.target = _this;
			_events[evt](obj);
		} else {
			if (!skip) HydraEvents._fireEvent(evt, obj);
		}
	}
	
	this.events.add = function(evt, callback) {
	    HydraEvents._checkDefinition(evt);
		_events[evt] = callback;
	}
	
	this.events.remove = function(evt) {
	    HydraEvents._checkDefinition(evt);
		if (_events[evt]) delete _events[evt];
	}
	
	this.events.bubble = function(object, evt) {
	    HydraEvents._checkDefinition(evt);
        var _this = this;
        object.events.add(evt, function eventBubble(e) {
           _this.fire(evt, e);
        });
    }
    
    this.events.scope = function(ref) {
        _this = ref;
    }
    
    this.events.destroy = function() {
        HydraEvents._destroyEvents(_this);
        return null;
    }
});

Class(function PushState(_force) {
	var _this = this;
	
	this.locked = false;
	this.dispatcher = new StateDispatcher(_force);

	this.getState = function() {
		return this.dispatcher.getState();
	}
	
	this.setState = function(hash) {
		this.dispatcher.setState(hash);
	}
	
	this.setTitle = function(title) {
		this.dispatcher.setTitle(title);
	}
	
	this.lock = function() {
		this.locked = true;
		this.dispatcher.lock();
	}
	
	this.unlock = function() {
		this.locked = false;
		this.dispatcher.unlock();
	}
	
	this.setPathRoot = function(root) {
	    this.dispatcher.setPathRoot(root);
	}
});

Class(function StateDispatcher(_forceHash) {
    Inherit(this, Events);
    var _this = this;
    var _initHash, _storeHash;
    var _root = '/';
    
    this.locked = false;
    
    (function() {
        createListener();
        _initHash = getHash();
        _storeHash = _initHash;
    })();

    function createListener() {
        if (!Device.system.pushstate || _forceHash) {
            if (Device.browser.old) {
                setInterval(function() {
                    var hash = getHash();
                    if (hash != _storeHash) handleHashChange(hash);
                }, 300);
            } else {
                window.addEventListener('hashchange', function() {
                    handleHashChange(getHash());
                }, false);
            }
        } else {
            window.onpopstate = history.onpushstate = handleStateChange;
        }
    }
    
    function getHash() {
        if (!Device.system.pushstate || _forceHash) {
            var value = window.location.hash;
            value = value.slice(3);
            return String(value);
        } else {
            var hash = location.pathname.toString();
            hash = _root != '/' ? hash.split(_root)[1] : hash.slice(1);
            return hash;
        }
    }
    
    function handleStateChange() {
        var hash = location.pathname;
        if (!_this.locked && hash != _storeHash) {
            hash = _root != '/' ? hash.split(_root)[1] : hash.slice(1);
            _storeHash = hash;
            _this.events.fire(HydraEvents.UPDATE, {value: hash, split: hash.split('/')});
        } else if (hash != _storeHash) {
            if (_storeHash) window.history.pushState(null, null, _root+hash);
        }
    }
    
    function handleHashChange(hash) {       
        if (!_this.locked && hash != _storeHash) {
            _storeHash = hash;
            _this.events.fire(HydraEvents.UPDATE, {value: hash, split: hash.split('/')});
        } else if (hash != _storeHash) {
            if (_storeHash) window.location.hash = '!/'+_storeHash;
        }
    }
    
    this.getState = function() {
        return getHash();
    }
    
    this.setPathRoot = function(root) {
        if (root.charAt(0) == '/') _root = root;
        else _root = '/'+root;
    }
    
    this.setState = function(hash) {
        if (!Device.system.pushstate || _forceHash) {
            if (hash != _storeHash) {
                window.location.hash = '!/'+hash;
                _storeHash = hash;
            }
        } else {
            if (hash != _storeHash) {
                window.history.pushState(null, null, _root+hash);
                _storeHash = hash;
            }
        }
    }
    
    this.setTitle = function(title) {
        document.title = title;
    }
    
    this.lock = function() {
        this.locked = true;
    }
    
    this.unlock = function() {
        this.locked = false;
    }
    
    this.forceHash = function() {
        _forceHash = true;
    }
});

Class(function AssetLoader(_assets) {
	Inherit(this, Events);
	var _this = this;
	var _total = 0;
	var _loaded = 0;
	var _queue, _qLoad;
	
	//*** Constructor
	(function() {
		_queue = new Array();
		prepareAssets();
		setTimeout(startLoading, 10);
	})();
	
	function prepareAssets() {
		for (var i in _assets) {
			if (typeof _assets[i] !== 'undefined') {
				_total++;
				_queue.push(_assets[i]);
			}
		}
	}
	
	function startLoading() {
		_qLoad = Math.round(_total * .5);
		for (var i = 0; i < _qLoad; i++) {
			loadAsset(_queue[i]);
		}
	}
	
	function loadAsset(asset) {
	    if (asset) {
    	   	var name = asset.split('/');
    		name = name[name.length-1];
            var split = name.split('.');
            var ext = split[1];
    	    switch (ext) {
    	        case 'html':
    	           XHR.get(asset, function(contents) {
    	               Hydra.HTML[split[0]] = contents;
    	               assetLoaded();
    	           }, 'text');
    	        break;
    	        
    	        case 'js':
				case 'php':
				case undefined:
				   var script = document.createElement('script');
                   script.type = 'text/javascript';
                   script.src = asset;
                   __body.addChild(script);
                   XHR.get(asset, assetLoaded, 'text');	        
    	        break;
    	        
    	        default:
    	           var image = new Image();
    		       image.onload = assetLoaded;
    		       image.src = asset;
    		    break;
    		}
		}
	}
	
	function checkQ() {
		if (_loaded == _qLoad && _loaded < _total) {
			var start = _qLoad;
			_qLoad *= 2;
			for (var i = start; i < _qLoad; i++) {
				if (_queue[i]) loadAsset(_queue[i]);
			}
		}
	}
	
	function assetLoaded() {
		if (_queue) {
			_loaded++;
			_this.events.fire(HydraEvents.PROGRESS, {percent: _loaded/_total});
		
			checkQ();
			if (_loaded == _total) {
				_this.complete = true;
				if (_this.events) _this.events.fire(HydraEvents.COMPLETE);
			}
		}
	}
	
	this.destroy = function() {
		_this.events = null;
		_assets = null;
		_loaded = null;
		_queue = null;
		_qLoad = null;
		return null;
	}
});

Class(function Render() {
    var _render;
    var _this = this;
    var _time, _sample, _rate, _threshold, _timer, _rendered;
        
    (function() {
        _render = new Array();
        
        //*** Kick off the chain
        requestAnimationFrame(render);
        Hydra.ready(function() {
            setTimeout(checkRender, 100);
        });
    })();
    
    function checkRender() {
        if (!_rendered) {
            window.requestAnimationFrame = function(callback) {
                setTimeout(callback, 1000 / 60);
            };
            requestAnimationFrame(render);
        }
    }
    
    function render() {
        if (!_rendered) _rendered = true;
        var time = Date.now();
        for (var i = _render.length-1; i > -1; i--) {
            if (_render[i]) _render[i](time);
        }
        
        if (_sample) {
            var newTime = Date.now();
            var difference = newTime - _time;
            _time = newTime;
            _rate = 1000 / difference;
            
            if (_threshold) {
                if (_rate < _threshold.rate) {
                    _threshold.callback();
                    clearInterval(_threshold.interval);
                    _threshold = null;
                    _this.stopSample(true);
                }
            }
        }
        
        requestAnimationFrame(render);
    }
    
    this.startRender = function(callback) {
        //*** Make sure this callback doesn't already exist
        var allowed = true;
        var count = _render.length-1;
        for (var i = count; i > -1; i--) {
            if (_render[i] == callback) allowed = false;
        }
        
        //*** If it doesn't, add it to the render array
        if (allowed) _render.push(callback);
    }
    
    this.stopRender = function(callback) {
        var count = _render.length-1;
        for (var i = count; i > -1; i--) {
            if (_render[i] == callback) _render.splice(i, 1);
        }
    }
    
    this.startSample = function() {
        _sample = true;
        _time = Date.now();
    }
    
    this.stopSample = function(silent) {
        if (!silent) console.log(_rate);
        _sample = _time = null;
    }
    
    this.startTimer = function() {
        _timer = Date.now();
    }
    
    this.stopTimer = function() {
        console.log(Date.now() - _timer);
        _timer = null;
    }
    
    this.threshold = function(callback, rate, time) {
        _threshold = new Object();
        _threshold.callback = callback;
        _threshold.rate = rate;
        this.startSample();
        _threshold.interval = setTimeout(function() {
            _threshold = null;
            _this.stopSample(true);
        }, time);
    }
}, 'Static');

Class(function Thread() {
	var _this = this;
	var _worker, _callbacks, _path;
	
	//*** Constructor
	(function() {
		init();
		addListeners();
	})();
	
	function init() {
		_path = (function() {
			if (typeof Config !== 'undefined') return Config.PATH || '';
			return '';
		})();
		_callbacks = new Object();
		_worker = new Worker(_path + 'assets/js/hydra/hydra-thread.js');
	}
	
	//*** Event Handlers
	function addListeners() {
		_worker.addEventListener('message', workerMessage);
	}
	
	function workerMessage(e) {
		if (e.data.console) {
			console.log(e.data.message);
		} else {
			if (e.data.id) {
				var callback = _callbacks[e.data.id];
				if (callback) callback(e.data.message);
				delete _callbacks[e.data.id];
			}
		}
	}

    //*** Public methods
	this.init = function(Class) {
		var string = Class.toString();
		string = string.slice(0, -1);
		string = string.replace('{', '!!!');
		string = string.split('!!!');
		string = string[1];
		_worker.postMessage({code: string});
	}
	
	this.sendCode = function(code) {
	    code = code.toString();
	    code = code.replace('(', '!!!');
	    var split = code.split('!!!');
	    var name = split[0].split(' ')[1];
	    code = 'self.'+name+' = function('+split[1];
	    _worker.postMessage({code: code, fn: name});
	}
	
	this.send = function(message, callback) {
		var id = Utils.timestamp();
		_callbacks[id] = callback;
		_worker.postMessage({message: message, id: id});
	}
	
	this.destroy = function() {
		_worker = null;
		return null;
	}
});

Class(function XHR() {
	var _this = this;
	var _serial;
	
	function serialize(key, data) {
	    if (typeof data === 'object') {
	        for (var i in data) {
	            var newKey = key+'['+i+']';
	            if (typeof data[i] === 'object') serialize(newKey, data[i]);
	            else _serial.push(newKey+'='+data[i]);
	        }
	    } else {
	        _serial.push(key+'='+data);
	    }
	}

	//*** Public methods
	this.get = function(url, data, callback, type) {
		if (typeof data === 'function') {
			type = callback;
			callback = data;
			data = null;
		} else if (typeof data === 'object') {
			var string = '?';
			for (var key in data) {
				string += key+'='+data[key]+'&';
			}
			string = string.slice(0, -1);
			url += string;
		}
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.send();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				if (callback) {
					var data = xhr.responseText;
					if (type == 'text') {
						callback(data);
					} else {
						callback(JSON.parse(data));
					}
				}
				xhr = null;
			}
		}
	}
	
	this.post = function(url, data, callback, type, header) {
		if (typeof data === 'function') {
			header = type;
			type = callback;
			callback = data;
			data = null;
		} else if (typeof data === 'object') {
		    _serial = new Array();
		    for (var key in data) serialize(key, data[key]);
		    data = _serial.join('&');
		    data = data.replace(/\[/g, '%5B');
		    data = data.replace(/\]/g, '%5D');
		    _serial = null;
		}
		
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		
		switch (header) {
			case 'upload': header = 'application/upload'; break;
			default: header = 'application/x-www-form-urlencoded'; break;
		}
		xhr.setRequestHeader('Content-type', header);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				if (callback) {
					var data = xhr.responseText;
					if (type == 'text') {
						callback(data);
					} else {
					    try {
						  callback(JSON.parse(data));
						} catch (e) {
						  console.error(data);
						}
					}
				}
				xhr = null;
			}
		}
		xhr.send(data);
	}
}, 'Static');


Class(function Mobile() {
    var _this = this;
    if (Device.mobile) {
        this.phone = Device.mobile.phone;
        this.tablet = Device.mobile.tablet;
        
        this.os = (function() {
            if (Device.detect(['ipad', 'iphone'])) return 'iOS';
            if (Device.detect(['android', 'silk'])) return 'Android';
        })();
        
        this.version = (function() {
			if (_this.os == 'iOS') return Number(Device.agent.split('os ')[1].split('_')[0]);
			if (_this.os == 'Android') {
				var version = Device.agent.split('android ')[1].split(';')[0];
				if (version.length > 3) version = version.slice(0, -2);
				return Number(version);
			}
	    })();
        
        this.browser = (function() {
            if (_this.os == 'iOS') return Device.detect('crios') ? 'Chrome' : 'Safari';
            if (_this.os == 'Android') return Device.detect('chrome') ? 'Chrome' : 'Browser';
        })();        
    }
    
    this.Class = window.Class;
}, 'Static');


Class(function SplitTextfield($obj, _by) {
	var _array = new Array();
	
	this.array = _array;
	
	(function() {		
		switch (_by) {
			case 'word':
				splitWord();
				break;
				
			default:
				splitLetter();
				break;
		}		
	})();
	
	function splitLetter() {
		var text = $obj.div.innerHTML;
		var split = text.split('');
		$obj.div.innerHTML = '';
		
		for (var i = 0; i < split.length; i++) {
			if (split[i] == ' ') split[i] = '&nbsp;'
			var letter = $(null, 'span');
			letter.text(split[i]).css({display: 'block', position: 'relative', padding: 0, margin: 0, cssFloat: 'left', styleFloat: 'left'});
			_array.push(letter);
			$obj.addChild(letter);
		}
	}
	
	function splitWord() {
		var text = $obj.div.innerHTML;
		var split = text.split(' ');
		$obj.empty();
		for (var i = 0; i < split.length; i++) {
			var word = $(null, 'span');
			var empty = $(null, 'span');
			word.text(split[i]).css({display: 'block', position: 'relative', padding: 0, margin: 0, cssFloat: 'left', styleFloat: 'left'});
			empty.text('&nbsp').css({display: 'block', position: 'relative', padding: 0, margin: 0, cssFloat: 'left', styleFloat: 'left'});
			_array.push(word);
			_array.push(empty);
			$obj.addChild(word);
			$obj.addChild(empty);
		}
	}
});


Class(function Sprite(_props) {
	Inherit(this, Events);
	var _this = this;
	var _row = 1;
	var _col = 1;
	var _labels, _label;
	
	this.current = 1;
	this.playing = false;
	
	(function() {
		var found = 0;
		var required = ['obj', 'rows', 'cols', 'fps'];
		for (var i in required) {
			for (var prop in _props) {
				if (required[i] == prop) found++;
			}
		}
		if (found != required.length) throw 'Sprite :: Missing properties. Required: obj, rows, cols, fps';
		_props.width = _props.width || _props.obj.css('width');
		_props.height = _props.height || _props.obj.css('height');
		if (!_props.frames) _props.frames = _props.cols * _props.rows;
		_this.loop = _props.loop;
		_this.fps = _props.fps;
		_labels = new Array();
	})();
	
	function goToFrame(frame) {
		_this.current = frame;
		var row = Math.ceil(frame / _props.rows) - 1;
		var col = (frame - (_props.rows*row))-1;
		if (_props.obj && _props.obj.div) _props.obj.div.style.backgroundPosition = -(col*_props.width)+'px '+ -(row*_props.height)+'px';
		else _this.destroy();
	}
	
	function getLabel(label) {
		for (var i in _labels) {
			if (_labels[i].label == label) return _labels[i];
		}
	}
	
	this.play = function() {
		if (!_this.playing) {
			_this.playing = true;
			_this.render();
		}
	}
	
	this.stop = function() {
		_label = null;
		_this.playing = false;
	}
	
	this.render = function() {
		goToFrame(_this.current);

		_this.current++;
		
		if (_label && _this.current == _label.end) {
			_this.events.fire(HydraEvents.END, {label: _label.label, frame: _this.current}, true);
			if (!_this.loop) _label = null;
		}
		
		if (!_props) return false;
		if (_this.current > _props.frames) {
			_this.current = _label ? _label.frame : 1;
		    if (!_this.loop) {
		    	_this.events.fire(HydraEvents.COMPLETE, null, true);
		        _this.playing = false;
		    }
		}
		
		if (_this.playing) setTimeout(_this.render, 1000 / _this.fps);
	}
	
	this.gotoAndStop = function(frame) {
		_label = null;
		_this.stop();
		goToFrame(frame);
	}
	
	this.gotoAndPlay = function(frame) {
		var num = frame;
		if (typeof frame == 'string') {
			var label = getLabel(frame);
			num = label.frame;
			_label = label;
			_label.end = label.frame + label.length;
			if (!num) throw 'Sprite::gotoAndPlay: Label '+frame+' not found';
		} else {
			_label = null;
		}

		_this.current = num;
		goToFrame(num);
		_this.playing = false;
		_this.play();
	}
	
	this.addLabel = function(label, frame, length) {
		var obj = new Object();
		obj.label = label;
		obj.frame = frame;
		obj.length = length || -1;
		_labels.push(obj);
	}
	
	this.removeLabel = function(label) {
		for (var i in _labels) {
			if (_labels[i].label == label) _labels.splice(i, 1);
		}
	}
	
	this.destroy = function() {
	    this.stop();
	    return _props = null;
	}
});

Class(function Canvas(_dimensions) {
    Inherit(this, Events);
	var _this = this;
	var _objects = new Array();
	
	this.offset = {x: 0, y: 0};
	
	(function() {
		_this.div = document.createElement('canvas');
		_this.context = _this.div.getContext('2d');
		_this.object = $(_this.div);
				
		if (_dimensions && _dimensions.width) _this.div.width = _dimensions.width;
		if (_dimensions && _dimensions.height) _this.div.height = _dimensions.height;	
		if (_dimensions && _dimensions.retina) resize(_dimensions.width, _dimensions.height, _dimensions.retina);	
	})();
	
	function resize(w, h, retina) {
		var ratio = (retina ? (window.devicePixelRatio || 1) : 1);
		_this.div.width = w * ratio;
		_this.div.height = h * ratio;
		
		if (Device.system.retina && retina) {
			_this.context.scale(ratio, ratio);
			_this.div.style.width = w+'px';
			_this.div.style.height = h+'px';
		}
	}
	
	function mouseMoved(e) {
        var mouse = {x: e.pageX - _this.offset.x, y: e.pageY - _this.offset.y, width: 1, height: 1};
	    checkHits(mouse, e);
	}
	
	function mouseClicked(e) {
	    var mouse = {x: e.pageX - _this.offset.x, y: e.pageY - _this.offset.y, width: 1, height: 1};
	    var hit = checkHits(mouse, e);
	    if (hit) _this.events.fire(HydraEvents.CLICK, {target: hit});
	}
	
	function touchClick(e) {
        var touch = {x: e.touchX - _this.offset.x, y: e.touchY - _this.offset.y, width: 1, height: 1};
        checkHits(touch, e);
    }
	
	function checkHits(mouse, e) {
	    var hit;
	    for (var i = _objects.length-1; i > -1; i--) {
            var object = _objects[i];
            var p = {x: object.x - object.anchor.x, y: object.y - object.anchor.y, width: object.width, height: object.height};
            if (Utils.hitTestObject(mouse, p)) {
                e.action = 'over';
                e.object = object;
                if (!object._hit) _this.events.fire(HydraEvents.HOVER, e);
                object._hit = true;
                hit = object;
            } else {
                e.action = 'out';
                e.object = object;
                if (object._hit) _this.events.fire(HydraEvents.HOVER, e);
                object._hit = false;
            }
        }
        return hit;
	}
	
	this.toDataURL = function() {
		return _this.div.toDataURL();
	}
	
	this.addChild = function(object) {
		for (var i = _objects.length-1; i > -1; i--) {
			if (_objects[i] == object) return false;
		}
		object.setContext(_this.context, _this.div, _this);
		_objects.push(object);
		_this.orderZ();
	}
	
	this.removeChild = function(object) {
		var len = _objects.length-1;
		for (var i = _objects.length-1; i > -1; i--) {
			if (_objects[i] == object) {
				_objects[i] = null;
				_objects.splice(i, 1);
			}
		}
	}
	
	this.orderZ = function() {
		_objects.sort(function(a, b) {
			return a.z - b.z;
		});
	}
	
	this.draw = function(noClear) {
		if (!noClear) _this.clear();
		var len = _objects.length;
		for (var i = 0; i < len; i++) {
			_objects[i].draw();
		}
	}
	
	this.captureEvents = function() {
	    if (!Device.mobile) {
	        _this.div.addEventListener('mousemove', mouseMoved, true);
	        _this.div.addEventListener('click', mouseClicked, true);
	    } else {
	        _this.object.touchClick(null, touchClick);
	    }
	}
	
	this.clear = function() {
		_this.context.clearRect(0, 0, _this.div.width, _this.div.height);
	}
	
	this.destroy = function() {
		_this.stopRender();
		if (_this.div) {
	    	_this.div.removeEventListener('mousemove', mouseMoved, true);
	    	_this.object.touchClick(null, true);
		}
	    
		if (_objects) {
			for (var i = _objects.length-1; i > -1; i--) {
		        for (var key in _objects[i]) _objects[i][key] = null;
		        _objects[i] = null;
			}
		}
		
		for (var key in this) this[key] = null;
		
		_objects = null;
		_this.div = _this.context = null;
		return null;
	}
	
	this.startRender = function() {
	    Render.startRender(_this.draw);
	}
	
	this.stopRender = function() {
	    Render.stopRender(_this.draw);
	}
	
	this.size = resize;
});

Class(function CanvasObject(_w, _h) {
	Inherit(this, DynamicObject);
	var _this = this;
	var _context, _canvas, _parent;
	var _draw;
	var _hold = new Object();
	
	this.width = _w;
	this.height = _h;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.rotation = 0;
	this.scale = 1;
	this.anchor = {x: _w/2, y: _h/2};
	
	function save(restore) {
		if (_this.rotation || _this.scale || _hold.rotation || _hold.scale) {
			if (!restore) {
				_context.save();
				_hold.x = _this.x;
				_hold.y = _this.y;
			} else {
				_context.restore();
				_this.x = _hold.x;
				_this.y = _hold.y;
			}
		}
	}
	
	function style() {
		if (_this.fillStyle) _context.fillStyle = _this.fillStyle;
		if (_this.shadowOffsetX > -1) _context.shadowOffsetX = _this.shadowOffsetX;
		if (_this.shadowOffsetY > -1) _context.shadowOffsetY = _this.shadowOffsetY;
		if (_this.shadowBlur > -1) _context.shadowBlur = _this.shadowBlur;
		if (_this.shadowColor) _context.shadowColor = _this.shadowColor;
		if (_this.alpha > -1) _context.globalAlpha = _this.alpha;
		if (_this.globalCompositeOperation) _context.globalCompositeOperation = _this.globalCompositeOperation;
	}
	
	function rotate() {
		if (_this.rotation || _hold.rotation) {
			var originX = _this.anchor.x;
			var originY = _this.anchor.y;
			_context.translate(_this.x+originX, _this.y+originY);
			_this.x = -originX;
			_this.y = -originY;
			_context.rotate(Utils.toRadians(_this.rotation));
			_hold.rotation = _this.rotation;
		}
	}
	
	function scale() {
		if (_this.scale || _hold.rotation) {
			_context.scale(_this.scale, _this.scale);
			_hold.scale = _this.scale;
		}
	}

	this.setContext = function(context, canvas, parent) {
		_context = context;
		_canvas = canvas;
		_parent = parent;
	}
	
	this.fillRect = function() {
		_draw = {type: 'fillRect'};
	}
	
	this.drawImage = function(image) {
		if (typeof image === 'string') {
			var src = image;
			image = new Image();
			image.src = src;
		}
		_draw = {type: 'drawImage', image: image};
	}
	
	this.arc = function(radius, endAngle) {
		_draw = {type: 'arc', radius: radius || this.width};
		if (!endAngle) {
			_draw.startAngle = Math.PI*2;
			_draw.endAngle = 0;
			_draw.anti = true;
		} else {
			_draw.startAngle = 0;
			_draw.endAngle = Utils.toRadians(endAngle);
			_draw.anti = false;
		}
			
		this.radius = _draw.radius;
	}
	
	this.points = function(points) {
		_draw = {type: 'points', points: points};
		this.drawPoints = _draw.points;
	}
	
	this.setZ = function(z) {
		this.z = z;
		_parent.orderZ();
	}
	
	this.draw = function() {
		save();
		rotate();
		style();
		scale();
		
		switch (_draw.type) {
			case 'fillRect': _context.fillRect(this.x, this.y, this.width, this.height); break;
			case 'drawImage': _context.drawImage(_draw.image, this.x, this.y); break;
			case 'arc': 
				_context.beginPath();
				_context.arc(this.x, this.y, _this.radius || _draw.radius, _draw.startAngle, _draw.endAngle, _draw.anti); 
				_context.closePath();
				_context.fill();
			break;
			case 'points':
				_context.beginPath();
				_context.moveTo(_draw.points[0].x + this.x, _draw.points[0].y + this.y);
				for (var i = 1; i < _draw.points.length; i++) {
					_context.lineTo(_draw.points[i].x + this.x, _draw.points[i].y + this.y);
				}
				_context.lineTo(_draw.points[0].x + this.x, _draw.points[0].y + this.y);
				_context.closePath();
				_context.fill();
			break;
		}
		
		save('restore');
	}
});

Class(function CSSFilter($object) {
    var _this = this;
    var _filters = ['grayscale', 'sepia', 'saturate', 'hue', 'invert', 'opacity', 'brightness', 'contrast', 'blur'];
	var _tw;
    
    //*** Constructor
    (function() {
        
    })();
    
    function applyFilters() {
        var str = '';
        var len = _filters.length-1;
        for (var i = len; i > -1; i--) {
            var filter = _filters[i];
            var value = _this[filter];
            if (typeof value === 'number') {
                filter = filter == 'hue' ? 'hue-rotate' : filter;
                value = filter == 'hue-rotate' ? value + 'deg' : value;
                value = filter == 'blur' ? value + 'px' : value;
                str += filter+'('+value+') ';
            }
        }
        $object.div.style[Device.styles.vendor+'Filter'] = str;
    }

    //*** Event Handlers

    //*** Public methods
    this.tween = function(properties, time, ease, delay, complete) {
		if (_tw && _tw.stop) _tw.stop();
        if (typeof delay !== 'number') {
            complete = delay;
            delay = 0;
        }
        if (typeof complete !== 'function') complete = null;
        return _tw = new MathTween(this, properties, time, ease, delay, applyFilters, complete);
    }
    
    this.clear = function() {
        if (_tw && _tw.stop) _tw.stop();
        for (var i in _filters) {
            _this[_filters[i]] = null;
        }
        applyFilters();
    }
    
    this.apply = function() {
        if (_tw && _tw.stop) _tw.stop();
        applyFilters();
    }
});

Class(function TweenManager() {
    var _this = this;
    var _math = new Array();

    //*** Constructor
    (function() {
        Render.startRender(updateMathTweens);
    })();
    
    function updateMathTweens() {
        if (_math.length) {
            var i = 0;
            var len = _math.length-1;
            var time = Date.now();
            
            for (var i = len; i > -1; i--) {
            	_math[i].update(time);
            }
        }
    }

    //*** Event Handlers

    //*** Public methods
    this.addMathTween = function(tween) {
        _math.push(tween);
    }
    
    this.removeMathTween = function(tween) {
        for (var i = _math.length-1; i > -1; i--) {
        	if (tween == _math[i]) {
	            _math.splice(i, 1);
        	}
        }
    }
    
    this.tween = function(obj, properties, time, ease, delay, complete, update) {
        if (typeof delay !== 'number') {
            update = complete;
            complete = delay;
            delay = 0;
        }
        
        return new MathTween(obj, properties, time, ease, delay, update, complete);
    }

	this.clearTween = function(obj) {
		if (obj.mathTween_ && obj.mathTween_.stop) obj.mathTween_.stop();
	}
    
   	this.checkTransform = function(key) {
   		for (var i = _this.Transforms.length-1; i > -1; i--) {
   			if (key == _this.Transforms[i]) return true;
   		}
   		return false;
   	}
   	
   	this.setCustomEase = function(ease) {
   	    var add = true;
   	    if (typeof ease !== 'object' || !ease.name || !ease.curve) throw 'TweenManager :: setCustomEase requires {name, curve}';
   	    for (var i = _this.CSSEases.length-1; i > -1; i--) {
   	        if (ease.name == _this.CSSEases[i].name) {
   	            add = false;
   	        }
   	    }
   	    if (add) _this.CSSEases.push(ease);
   	}

	this.getEase = function(name) {
	    var eases = _this.CSSEases;
	    for (var i = eases.length-1; i > -1; i--) {
	        if (eases[i].name == name) return eases[i].curve;
	    }
	    return false;
	}
	
	this.getAllTransforms = function(object) {
	    var obj = new Object();
	    for (var i = 0; i < _this.Transforms.length; i++) {
	        var tf = _this.Transforms[i];
	        var val = _this.getTransform(object, tf);
	        if (val !== 0 && !isNaN(val)) {
	            obj[tf] = val;
	        }
	    }
	    return obj;
	}
	
	this.getTransformProperty = function() {
	    switch (Device.styles.vendor) {
            case 'Moz': return '-moz-transform'; break;
            case 'Webkit': return '-webkit-transform'; break;
            case 'O': return '-o-transform'; break;
            case 'ms': return '-ms-transform'; break;
        }
	}
	
	this.getTransform = function(object, key) {
		if (Device.tween.css2d) {
			try {
	   			var transform = object.div.style[Device.styles.vendor+'Transform'];
	   			var preg;
	   			if (!transform.length) return 0;
	   			if (key == 'x' || key == 'y' || key == 'z') {
	   			    if (!transform.strpos('translate')) return 0;
                    if (Device.tween.css3d) preg = transform.match(/translate3d\(((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px\)/);
                    else preg = transform.match(/translate\(((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px\)/);
                    switch (key) {
                        case 'x': return Number(preg[1]); break;
                        case 'y': return Number(preg[3]); break;
                        case 'z': return Number(preg[5]); break;
                    }
	   			} else if (key == 'rotation' || key == 'rotationX' || key == 'rotationY' || key == 'rotationZ') {
	   			    if (!transform.strpos('rotat')) return 0;
	   			    switch (key) {
	   			        case 'rotation': preg = transform.match(/rotate\(((?:[+\-]=)?([\-\d\.]+))deg\)/); break;
	   			        case 'rotationX': preg = transform.match(/rotateX\(((?:[+\-]=)?([\-\d\.]+))deg\)/); break;
	   			        case 'rotationY': preg = transform.match(/rotateY\(((?:[+\-]=)?([\-\d\.]+))deg\)/); break;
	   			        case 'rotationZ': preg = transform.match(/rotateZ\(((?:[+\-]=)?([\-\d\.]+))deg\)/); break;
	   			    }
	   				return Number(preg[1]);
	   			} else if (key == 'scale') {
	   			    if (!transform.strpos('scale')) return 0;
	   				preg = transform.match(/scale\(((?:[+\-]=)?([\d\.]+))\)/);
	   				return Number(preg[1]);
	   			} else if (key == 'skewX' || key == 'skewY') {
	   			    if (!transform.strpos('skew')) return 0;
                    switch (key) {
                        case 'skewX': preg = transform.match(/skewX\(((?:[+\-]=)?([\-\d\.]+))deg\)/); break;
                        case 'skewY': preg = transform.match(/skewY\(((?:[+\-]=)?([\-\d\.]+))deg\)/); break;
                    }
                    return Number(preg[1]);
                }
   			} catch (e) {
   				return 0;
   			}
   		} else {
   			return 0;
   		}
	}
}, 'Static');

Class(function MathTween(_object, _properties, _duration, _ease, _delay, _update, _complete) {
    var _this = this; 
    var _startTime, _startValues, _endValues;
    var _fired;

    //*** Constructor
    (function() {
        start();
    })();
    
    function start() {
        if (_object.mathTween_ && _object.mathTween_.stop) _object.mathTween_.stop();
        _object.mathTween_ = _this;
        TweenManager.addMathTween(_this);
        _ease = TweenManager.MathEasing.convertEase(_ease);
        _startTime = Date.now();
        _startTime += _delay;
        _endValues = _properties;
        _startValues = new Object();
        
        for (var prop in _endValues) {
            if (_object[prop] === null) continue;
            _startValues[prop] = _object[prop];
        }
    }
    
    function clear() {
        _startTime = _startValues = _endValues = _fired = null;
        _object = _properties = _duration = _ease = _delay = _update = _complete = null;
        TweenManager.removeMathTween(_this);
    }

    //*** Event Handlers

    //*** Public methods
    this.update = function(time) {
        if (time < _startTime) {
            return true;
        }
        var elapsed = (time - _startTime) / _duration;
        elapsed = elapsed > 1 ? 1 : elapsed;
        
        var value = _ease(elapsed);
        for (var prop in _startValues) {
            var start = _startValues[prop];
            var end = _endValues[prop];
            _object[prop] = start + (end - start) * value;
        }

        if (_update) _update();
        if (elapsed == 1) {
            if (!_fired) {
                _fired = true;
                if (_complete) _complete();
                _startTime = _startValues = _endValues = start = null;
                clear();
            }
            return false;
        }
        return true;
    }
    
    this.stop = function() {
        if (_object) _object.mathTween_ = null;
        clear();
        return null;
    }
});

(function() {
    TweenManager.MathEasing = new Object();
    TweenManager.MathEasing.convertEase = function(ease) {
        switch (ease) {
            case 'easeInQuad': return TweenManager.MathEasing.Quad.In; break;
            case 'easeInCubic': return TweenManager.MathEasing.Cubic.In; break;
            case 'easeInQuart': return TweenManager.MathEasing.Quart.In; break;
            case 'easeInQuint': return TweenManager.MathEasing.Quint.In; break;
            case 'easeInSine': return TweenManager.MathEasing.Sine.In; break;
            case 'easeInExpo': return TweenManager.MathEasing.Expo.In; break;
            case 'easeInCirc': return TweenManager.MathEasing.Circ.In; break;
            case 'easeInElastic': return TweenManager.MathEasing.Elastic.In; break;
            case 'easeInBack': return TweenManager.MathEasing.Back.In; break;
            case 'easeInBounce': return TweenManager.MathEasing.Bounce.In; break;
            
            case 'easeOutQuad': return TweenManager.MathEasing.Quad.Out; break;
            case 'easeOutCubic': return TweenManager.MathEasing.Cubic.Out; break;
            case 'easeOutQuart': return TweenManager.MathEasing.Quart.Out; break;
            case 'easeOutQuint': return TweenManager.MathEasing.Quint.Out; break;
            case 'easeOutSine': return TweenManager.MathEasing.Sine.Out; break;
            case 'easeOutExpo': return TweenManager.MathEasing.Expo.Out; break;
            case 'easeOutCirc': return TweenManager.MathEasing.Circ.Out; break;
            case 'easeOutElastic': return TweenManager.MathEasing.Elastic.Out; break;
            case 'easeOutBack': return TweenManager.MathEasing.Back.Out; break;
            case 'easeOutBounce': return TweenManager.MathEasing.Bounce.Out; break;
            
            case 'easeInOutQuad': return TweenManager.MathEasing.Quad.InOut; break;
            case 'easeInOutCubic': return TweenManager.MathEasing.Cubic.InOut; break;
            case 'easeInOutQuart': return TweenManager.MathEasing.Quart.InOut; break;
            case 'easeInOutQuint': return TweenManager.MathEasing.Quint.InOut; break;
            case 'easeInOutSine': return TweenManager.MathEasing.Sine.InOut; break;
            case 'easeInOutExpo': return TweenManager.MathEasing.Expo.InOut; break;
            case 'easeInOutCirc': return TweenManager.MathEasing.Circ.InOut; break;
            case 'easeInOutElastic': return TweenManager.MathEasing.Elastic.InOut; break;
            case 'easeInOutBack': return TweenManager.MathEasing.Back.InOut; break;
            case 'easeInOutBounce': return TweenManager.MathEasing.Bounce.InOut; break;
            
            case 'linear': return TweenManager.MathEasing.Linear.None; break;
            
            default: return TweenManager.MathEasing.Cubic.Out; break;
        }
    }
    
    TweenManager.MathEasing.Linear = {
      None: function(k) {
          return k;
      }  
    }
    TweenManager.MathEasing.Quad = {
      In: function(k) {
          return k*k;
      },
      Out: function(k) {
          return k * (2 - k);
      },
      InOut: function(k) {
          if ((k *= 2) < 1) return 0.5 * k * k;
          return - 0.5 * (--k * (k - 2) - 1);
      }
    }
    TweenManager.MathEasing.Cubic = {
      In: function(k) {
          return k * k * k;
      },
      Out: function(k) {
          return --k * k * k + 1;
      },
      InOut: function(k) {
          if ((k *= 2) < 1) return 0.5 * k * k * k;
          return 0.5 * ((k -= 2) * k * k + 2 );
      }
    }
    TweenManager.MathEasing.Quart = {
      In: function(k) {
          return k * k * k * k;
      },
      Out: function(k) {
          return 1 - --k * k * k * k;
      },
      InOut: function(k) {
          if ((k *= 2) < 1) return 0.5 * k * k * k * k;
          return - 0.5 * ((k -= 2) * k * k * k - 2);
      }
    }
    TweenManager.MathEasing.Quint = {
      In: function(k) {
          return k * k * k * k * k;
      },
      Out: function(k) {
          return --k * k * k * k * k + 1;
      },
      InOut: function(k) {
          if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
          return 0.5 * ((k -= 2) * k * k * k * k + 2);
      }
    }
    TweenManager.MathEasing.Sine = {
      In: function(k) {
          return 1 - Math.cos(k * Math.PI / 2);
      },
      Out: function(k) {
          return Math.sin(k * Math.PI / 2);
      },
      InOut: function(k) {
          return 0.5 * (1 - Math.cos(Math.PI * k));
      }
    }
    TweenManager.MathEasing.Expo = {
      In: function(k) {
          return k === 0 ? 0 : Math.pow(1024, k - 1);
      },
      Out: function(k) {
          return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      },
      InOut: function(k) {
          if (k === 0) return 0;
          if (k === 1) return 1;
          if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
          return 0.5 * (-Math.pow(2, - 10 * (k - 1)) + 2);
      }
    }
    TweenManager.MathEasing.Circ = {
      In: function(k) {
        return 1 - Math.sqrt(1 - k * k);  
      },
      Out: function(k) {
        return Math.sqrt(1 - --k * k);  
      },
      InOut: function(k) {
          if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
          return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
      }
    }
    TweenManager.MathEasing.Elastic = {
      In: function(k) {
          var s, a = 0.1, p = 0.4;
          if ( k === 0 ) return 0;
          if ( k === 1 ) return 1;
          if ( !a || a < 1 ) { a = 1; s = p / 4; }
          else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
          return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
      },
      Out: function(k) {
          var s, a = 0.1, p = 0.4;
          if ( k === 0 ) return 0;
          if ( k === 1 ) return 1;
          if ( !a || a < 1 ) { a = 1; s = p / 4; }
          else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
          return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
      },
      InOut: function(k) {
          var s, a = 0.1, p = 0.4;
          if ( k === 0 ) return 0;
          if ( k === 1 ) return 1;
          if ( !a || a < 1 ) { a = 1; s = p / 4; }
          else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
          if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
          return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
      } 
    }
    TweenManager.MathEasing.Back = {
      In: function(k) {
          var s = 1.70158;
          return k * k * ( ( s + 1 ) * k - s );
      },
      Out: function(k) {
          var s = 1.70158;
          return --k * k * ( ( s + 1 ) * k + s ) + 1;
      },
      InOut: function(k) {
          var s = 1.70158 * 1.525;
          if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
          return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
      }
    }
    TweenManager.MathEasing.Bounce = {
      In: function(k) {
          return 1 - TweenManager.MathEasing.Bounce.Out( 1 - k );
      },
      Out: function(k) {
          if ( k < ( 1 / 2.75 ) ) {
              return 7.5625 * k * k;
          } else if ( k < ( 2 / 2.75 ) ) {
              return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
          } else if ( k < ( 2.5 / 2.75 ) ) {
              return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
          } else {
              return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
          }
      },
      InOut: function(k) {
          if ( k < 0.5 ) return TweenManager.MathEasing.Bounce.In( k * 2 ) * 0.5;
          return TweenManager.MathEasing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;
      }
    }
})();


Class(function CSSTween(_object, _props, _time, _ease, _delay, _callback, _manual) {
	var _this = this;
	var _useMath, _mathTween, _startValues, _endValues, _holder;
	var _chain, _transformStart, _transformEnd, _transformProps, _transformTween;
	var _transitionProps, _isTransform, _isCSS, _completeInter;
	
	//*** Constructor
	(function() {
	    start();
	})();
	
	function start() {
        if (checkForMathTween()) {
            initMathValues();
            if (!_manual) initMathTween();
        } else {
            if (!_manual) {
                clearCSSTween();
                initProperties();
                _object.__tweenInterval = setTimeout(initCSSTween, _delay);
            }
        }
	}
	
	function initProperties() {
	    var transform = TweenManager.getAllTransforms(_object);
	    var properties = '';
	    for (var key in _props) {
	        if (TweenManager.checkTransform(key)) {
	            transform.use = true;
	            transform[key] = _props[key];
	            delete _props[key];
	        } else {
	            properties += key+', ';
	        }
	    }
	    properties = properties.slice(0, -2);
	    if (transform.use) {
	        properties += (properties.length ? ', ' : '') + TweenManager.getTransformProperty();
	    }
	    _transformProps = transform;
	    _transitionProps = properties;
	}
	
	function initMathValues() {
	    var transform = TweenManager.getAllTransforms(_object);
		_endValues = {};
		_transformEnd = {};
		_transformStart = new DynamicObject();
		_startValues = new DynamicObject();
		for (var key in transform) {
		    _transformStart[key] = transform[key];
		    _transformEnd[key] = transform[key];
		}
		for (key in _props) {
			if (TweenManager.checkTransform(key)) {
			    _isTransform = true;
				_transformStart[key] = TweenManager.getTransform(_object, key);
				_transformEnd[key] = _props[key];
			} else {
			    _isCSS = true;
				if (typeof _props[key] === 'string') {
					_object.div.style[key] = _props[key];
				} else {
					_startValues[key] = Number(_object.css(key));
					_endValues[key] = _props[key];
				}
			}
		}
	}
	
	function checkForMathTween() {
	    if (_props.math) {
	        delete _props.math;
	        return _useMath = true;
	    }
	    if (!Device.tween.transition) return _useMath = true;
	    if (_ease.strpos('Elastic') || _ease.strpos('Bounce')) return _useMath = true;
		return _useMath = false;
	}
	
	function initMathTween() {
	    _object.tween_ = _this;
		_this.playing = true;
		_props = _startValues.copy();
		_transformProps = _transformStart.copy();
		if (_isCSS) _mathTween = TweenManager.tween(_props, _endValues, _time, _ease, _delay, tweenComplete, updateMathTween);
		if (_isTransform) _transformTween = TweenManager.tween(_transformProps, _transformEnd, _time, _ease, _delay, (!_isCSS ? tweenComplete : null), (!_isCSS ? updateMathTween : null));
	}
	
	function initCSSTween() {
		if (!_this.kill && _object.div) {
			delete _object.__tweenInterval;
	    	_object.div.style[Device.styles.vendor+'TransitionProperty'] = _transitionProps; 
	        _object.div.style[Device.styles.vendor+'TransitionDuration'] = _time+'ms';
	        _object.div.style[Device.styles.vendor+'TransitionTimingFunction'] = TweenManager.getEase(_ease);
	    	_object.css(_props);
	    	_object.transform(_transformProps);
	    	_this.playing = true;
	    	_object.tween_ = _this;
	    	
	    	_object.__tweenCompleteInterval = setTimeout(function() {
				if (_this.kill || !_object || !_object.div) return false
	    	    tweenComplete();
	    	}, _time);
		}
	}
	
	function updateMathTween() { 
	    if (!_this.kill && _object && _object.div) {
		  _object.css(_props);
		  _object.transform(_transformProps);
		}
	}
	
	function clearCSSTween(end) {
	    clearTimeout(_object.__tweenCompleteInterval);
	    clearTimeout(_object.__tweenInterval);
		delete _object.__tweenInterval;
		delete _object.__tweenCompleteInterval;
	    _this.playing = false;
	    
	    if (end) {
    	    setTimeout(function() {
    	        if (_object && _object.div && !_object.tween_) _object.div.style[Device.styles.vendor+'Transition'] = '';
    	        _object = null;
    	    }, _time*.5);
	    } else {
	        _object.div.style[Device.styles.vendor+'Transition'] = '';
	    }
	}
	
	function destroy() {
	    _useMath = _mathTween = _startValues = _endValues = _holder = null;
        _chain = _transformStart = _transformEnd = _transformProps = _transformTween = null;
        _transitionProps = _isTransform = _isCSS = null;
        _props = _time = _ease = _delay = _callback = _manual = null;
	}

	//*** Event Handlers
	function tweenComplete() {
	    if (_this.playing) {
	        _object.tween_ = null;
    	    if (!_useMath) clearCSSTween(true);
            _this.playing = false;
            if (_chain) _chain.play();
            else if (_callback) _callback.apply(_object);
			destroy();
        }
    }

	//*** Public methods
	this.stop = function() {
		if (_this.playing) {
		    _this.kill = true;
		    _object.tween_ = null;
			if (_chain) _chain.stop();
			if (_useMath && _mathTween && _mathTween.stop) _mathTween.stop();
			else clearCSSTween();
			destroy();
		}
	}
	
	this.play = function(reset) {
		if (!_this.playing) {
			if (_useMath) {
				if (!reset) initMathValues();
				initMathTween();
			} else {
			    initProperties();
			    setTimeout(initCSSTween, 10);
			}
		}
	}
	
	this.chain = function(tween) {
		_chain = tween;
		return _chain;
	}
});

(function() {
	$.fn.transform = function(props) {
		if (Device.tween.css2d) {
		    if (!props) props = this;
			var transforms = '';
			var translate = '';
			if (typeof props.x !== 'undefined' || typeof props.y !== 'undefined' || typeof props.z !== 'undefined') {
			    translate += (props.x || 0) + 'px, ';
			    translate += (props.y || 0) + 'px';
			    if (Device.tween.css3d) {
			        translate += ', ' + (props.z || 0) + 'px';
			        transforms += 'translate3d('+translate+')';
			    } else {
			        transforms += 'translate('+translate+')';
			    }
			}
			if (typeof props.rotation !== 'undefined') transforms += 'rotate('+props.rotation+'deg)';
			if (typeof props.scale !== 'undefined') transforms += 'scale('+props.scale+')';
			if (typeof props.rotationX !== 'undefined') transforms += 'rotateX('+props.rotationX+'deg)';
			if (typeof props.rotationY !== 'undefined') transforms += 'rotateY('+props.rotationY+'deg)';
			if (typeof props.rotationZ !== 'undefined') transforms += 'rotateZ('+props.rotationZ+'deg)';
			if (typeof props.skewX !== 'undefined') transforms += 'skewX('+props.skewX+'deg)';
			if (typeof props.skewY !== 'undefined') transforms += 'skewY('+props.skewY+'deg)';
			this.div.style[Device.styles.vendor+'Transform'] = transforms;
		}
		return this;
	}
	
	$.fn.enable3D = function() {
		this.div.style[Device.styles.vendor+'TransformStyle'] = 'preserve-3d';
		this.div.style[Device.styles.vendor+'Perspective'] = '500px';
		return this;
	}
	
	$.fn.disable3D = function() {
		this.div.style[Device.styles.vendor+'TransformStyle'] = '';
		this.div.style[Device.styles.vendor+'Perspective'] = '0';
		return this;
	}
	
	$.fn.transformPoint = function(x, y, z) {
		var origin = '';
		if (typeof x !== 'undefined') origin += x+'px ';
		if (typeof y !== 'undefined') origin += y+'px ';
		if (typeof z !== 'undefined') origin += z+'px ';
		this.div.style[Device.styles.vendor+'TransformOrigin'] = origin;
		return this;
	}
	
	$.fn.tween = function(props, time, ease, delay, callback, manual) {
		if (typeof delay === 'boolean') {
            manual = delay;
            delay = 0;
            callback = null;
        } else if (typeof delay === 'function') {
            callback = delay;
            delay = 0;
        }
        if (typeof callback === 'boolean') {
            manual = callback;
            callback = null;
        }
        if (!delay) delay = 10;
		
		return new CSSTween(this, props, time, ease, delay, callback, manual);
	}
	
	$.fn.clearTransform = function() {
	    this.div.style[Device.styles.vendor+'Transform'] = '';
	    return this;
	}
	
	$.fn.stopTween = function() {
	    if (this.tween_) this.tween_.stop();
		if (this.mathTween_) this.mathTween_.stop();
		this.div.style[Device.styles.vendor+'Transition'] = '';
	    return this;
	}
})();


(function() {
	TweenManager.Transforms = [
		'scale',
		'x',
		'y',
		'z',
		'rotation',
		'rotationX',
		'rotationY',
		'rotationZ',
		'skewX',
		'skewY',
	];
	
	TweenManager.CSSEases = [
	    {name: 'easeOutCubic', curve: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'},
	    {name: 'easeOutQuad', curve: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)'},
        {name: 'easeOutQuart', curve: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'},
        {name: 'easeOutQuint', curve: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)'},
        {name: 'easeOutSine', curve: 'cubic-bezier(0.390, 0.575, 0.565, 1.000)'},
        {name: 'easeOutExpo', curve: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)'},
        {name: 'easeOutCirc', curve: 'cubic-bezier(0.075, 0.820, 0.165, 1.000)'},
        {name: 'easeOutBack', curve: 'cubic-bezier(0.175, 0.885, 0.320, 1.275)'},
        
        {name: 'easeInCubic', curve: 'cubic-bezier(0.550, 0.055, 0.675, 0.190)'},
		{name: 'easeInQuad', curve: 'cubic-bezier(0.550, 0.085, 0.680, 0.530)'},
		{name: 'easeInQuart', curve: 'cubic-bezier(0.895, 0.030, 0.685, 0.220)'},
		{name: 'easeInQuint', curve: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)'},
		{name: 'easeInSine', curve: 'cubic-bezier(0.470, 0.000, 0.745, 0.715)'},
		{name: 'easeInCirc', curve: 'cubic-bezier(0.600, 0.040, 0.980, 0.335)'},
		{name: 'easeInBack', curve: 'cubic-bezier(0.600, -0.280, 0.735, 0.045)'},
		
		{name: 'easeInOutCubic', curve: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)'},
		{name: 'easeInOutQuad', curve: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)'},
		{name: 'easeInOutQuart', curve: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)'},
		{name: 'easeInOutQuint', curve: 'cubic-bezier(0.860, 0.000, 0.070, 1.000)'},
		{name: 'easeInOutSine', curve: 'cubic-bezier(0.445, 0.050, 0.550, 0.950)'},
		{name: 'easeInOutExpo', curve: 'cubic-bezier(1.000, 0.000, 0.000, 1.000)'},
		{name: 'easeInOutCirc', curve: 'cubic-bezier(0.785, 0.135, 0.150, 0.860)'},
		{name: 'easeInOutBack', curve: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'},
		
		{name: 'linear', curve: 'linear'}
	];
})();

Class(function Viewport3D(_width, _height) {
    Inherit(this, View);
    var _this = this;
    var _containers = new Array();
	var _perspective = 2000;
	    
    (function() {
        createElements();
    })();
    
    function createElements() {
        _this.element.css({width: _width, height: _height, position: 'absolute'});
        _this.element.div.style[Device.styles.vendor+'TransformStyle'] = 'preserve-3d';
        _this.element.div.style[Device.styles.vendor+'Perspective'] = '2000px';
    }
    
    this.perspective = function(num) {
		_perspective = num;
        if (!num) _this.element.div.style[Device.styles.vendor+'Perspective'] = '';
        else _this.element.div.style[Device.styles.vendor+'Perspective'] = num+'px';
    }

	this.perspectiveOrigin = function(x, y) {
		_this.element.div.style[Device.styles.vendor+'PerspectiveOrigin'] = x+'px '+y+'px';
	}
    
    this.addChild = function($obj) {
        if ($obj.element) $obj = $obj.element;
        $obj.div.style[Device.styles.vendor+'TransformStyle'] = 'preserve-3d';
        _this.element.addChild($obj);
        _containers.push($obj);
    }
    
    this.removeChild = function($obj) {
        var len = _containers.length-1;
        for (var i = len; i > -1; i--) {
            if (_containers[i] == $obj) {
                _containers[i].remove();
                _containers.splice(i, 1);
            }
        }
    }

	this.enable3D = function() {
		_this.element.div.style[Device.styles.vendor+'TransformStyle'] = 'preserve-3d';
        if (_perspective) _this.element.div.style[Device.styles.vendor+'Perspective'] = _perspective + 'px';
        
        for (var i = _containers.length-1; i > -1; i--) {
            _containers[i].div.style[Device.styles.vendor+'TransformStyle'] = 'preserve-3d';
        }
	}
	
	this.disable3D = function() {
		_this.element.div.style[Device.styles.vendor+'TransformStyle'] = '';
        _this.element.div.style[Device.styles.vendor+'Perspective'] = '';
        
        for (var i = _containers.length-1; i > -1; i--) {
            _containers[i].div.style[Device.styles.vendor+'TransformStyle'] = '';
        }
	}
    
    this.destroy = function() {
        var len = _containers.length-1;
        for (var i = len; i > -1; i--) {
			if (_containers[i].destroy) _containers[i].destroy();
            else if (_containers[i].remove) _containers[i].remove();
        }
        _containers = null;
		_this.element.remove();
		_this.events.destroy();
    }
        
    this.transformPoint = function(x, y, z) {
        this.element.transformPoint(x, y, z);
        return this;
    }
    
    this.transform = function(obj) {
        this.element.transform(obj || this);
        return this;
    }

	this.size = function(w, h) {
		this.element.size(w, h);
		return this;
	}
    
    this.tween = function(props, time, ease, delay, callback, manual) {
        return this.element.tween(props, time, ease, delay, callback, manual);
    }
});

Class(function Mouse() {
	var _this = this;
	_this.mouseX = _this.mouseY = 0;
	
	function mouseMoved(e) {
	    _this.ready = true;
	    if (e.pageX) {
		    _this.x = e.pageX;
		    _this.y = e.pageY;
		} else {
		    _this.x = e.clientX;
		    _this.y = e.clientY;
		}
	}
	
	this.capture = function(x, y) {
	    _this.x = x || 0;
	    _this.y = y || 0;
		window[Hydra.addEvent](Hydra.translateEvent('mousemove'), mouseMoved, true);
	}
	
	this.stop = function() {
		window[Hydra.removeEvent](Hydra.translateEvent('mousemove'), mouseMoved, true);
	}
}, 'Static');

(function() {
	$.fn.click = function(callback, remove) {
		var _this = this;
		function click(e) {
		    if (!_this.div) return false;
		    if (Hydra._preventClicks) return false;
			e.object = _this.div.className == 'hit' ? _this.parent() : _this;
			e.action = 'click';
			if (!e.pageX) {
				e.pageX = e.clientX;
				e.pageY = e.clientY;
			}
			if (callback) callback.apply(_this, [e]);
			
			if (Hydra.autoPreventClicks) {
			    Hydra.preventClicks();
			}
		}
		
		if (remove) {
			if (this._events.click) {
				this.div[Hydra.removeEvent](Hydra.translateEvent('click'), this._events.click, true);
				this.div.style.cursor = 'auto';
				this._events.click = null;
			}
		} else {
			if (this._events.click) this.click(null, true);
			this.div[Hydra.addEvent](Hydra.translateEvent('click'), click, true);
			this.div.style.cursor = 'pointer';
		}
		
		this._events.click = click;
		return this;
	}
	
	$.fn.hover = function(callback, remove) {
		var _this = this;
		var _over = false;
		var _time;
		
		function hover(e) {
		    if (!_this.div) return false;
		    var time = Date.now();
		    var original = e.toElement || e.relatedTarget;
		    if (_time && (time - _time) < 5) {
		        _time = time;
		        return false;
		    }
		    _time = time;
		    
			e.object = _this.div.className == 'hit' ? _this.parent() : _this;
			switch (e.type) {
				case 'mouseout': e.action = 'out'; break;
				case 'mouseleave': e.action = 'out'; break;
				default: e.action = 'over'; break;
			}
		    
		    if (_over) {
		        if (Hydra._preventClicks) return false;
		        if (e.action == 'over') return false;
		        if (e.action == 'out') {
		            if (isAChild(_this.div, original)) return false;
		        }
		        _over = false;
		    } else {
		        if (e.action == 'out') return false;
		        _over = true;
		    }
			
			if (!e.pageX) {
				e.pageX = e.clientX;
				e.pageY = e.clientY;
			}
			if (callback) callback.apply(_this, [e]);
		}
		
		function isAChild(div, object) {
		    var len = div.children.length-1;
		    for (var i = len; i > -1; i--) {
		        if (object == div.children[i]) return true;
		    }
		    
		    for (i = len; i > -1; i--) {
		        if (isAChild(div.children[i], object)) return true;
		    }
		}

		if (remove) {
			if (this._events.hover) {
				this.div[Hydra.removeEvent](Hydra.translateEvent('mouseover'), this._events.hover, true);
				this.div[Hydra.removeEvent](Hydra.translateEvent('mouseout'), this._events.hover, true);
				this._events.hover = null;
			}
		} else {
			if (this._events.hover) this.hover(null, true);
			this.div[Hydra.addEvent](Hydra.translateEvent('mouseover'), hover, true);
			this.div[Hydra.addEvent](Hydra.translateEvent('mouseout'), hover, true);
		}

		this._events.hover = hover;
		return this;
	}
	
	$.fn.press = function(callback, remove) {
		var _this = this;
		function press(e) {
		    if (!_this.div) return false;
			e.object = _this.div.className == 'hit' ? _this.parent() : _this;
			switch (e.type) {
				case 'mousedown': e.action = 'down'; break;
				default: e.action = 'up'; break;
			}
			if (!e.pageX) {
				e.pageX = e.clientX;
				e.pageY = e.clientY;
			}
			if (callback) callback.apply(_this, [e]);
		}
		
		if (remove) {
			if (this._events.press) {
				this.div[Hydra.removeEvent](Hydra.translateEvent('mousedown'), this._events.press, true);
				this.div[Hydra.removeEvent](Hydra.translateEvent('mouseup'), this._events.press, true);
				this._events.press = null;
			}
		} else {
			if (this._events.press) this.press(null, true);
			this.div[Hydra.addEvent](Hydra.translateEvent('mousedown'), press, true);
			this.div[Hydra.addEvent](Hydra.translateEvent('mouseup'), press, true);
		}
		
		this._events.press = press;
		return this;
	}
	
	$.fn.bind = function(evt, callback) {
	    this.div[Hydra.addEvent](Hydra.translateEvent(evt), callback, true);
	    return this;
	}
	
	$.fn.unbind = function(evt, callback) {
	    this.div[Hydra.removeEvent](Hydra.translateEvent(evt), callback, true);
        return this;
	}
	
	$.fn.interact = function(overCallback, clickCallback, skipOver) {
		if (!this.hit) {
			this.hit = $('.hit');
			this.hit.css({width: '100%', height: '100%', zIndex: 99999, top: 0, left: 0, background: 'rgba(255, 255, 255, 0)'});
			this.addChild(this.hit);
		}
		
		if (!Device.mobile) this.hit.hover(overCallback).click(clickCallback);
		else this.hit.touchClick(!skipOver ? overCallback : null, clickCallback);
	}
	
	Hydra.eventTypes = ['hover', 'press', 'click', 'touchClick', 'touchSwipe'];
	Hydra.translateEvent = function(evt) {
		if (Hydra.addEvent == 'attachEvent') {
			switch (evt) {
				case 'click': return 'onclick'; break;
				case 'mouseover': return 'onmouseover'; break;
				case 'mouseout': return 'onmouseleave'; break;
				case 'mousedown': return 'onmousedown'; break;
				case 'mouseup': return 'onmouseup'; break;
				case 'mousemove': return 'onmousemove'; break;
			}
		}
		return evt;
	}
})();

(function() {
	$.fn.attr = function(attr, value) {
		if (attr && value) {
			if (value == '') this.div.removeAttribute(attr);
			else this.div.setAttribute(attr, value);
		} else if (attr) {
			return this.div.getAttribute(attr);
		}
		return this;
	}
	
	$.fn.val = function(value) {
		if (this.type_ != 'select') {
			if (!value) {
				return this.attr('value');
			} else {
				this.attr('value', value);
			}
		} else {
			if (!value) {
				return this.div.value || '';
			}
		}
		return this;
	}
	
	$.fn.change = function(callback) {
		var _this = this;
		if (this.type_ == 'select') {
			this.div.onchange = function() {
				callback({object: _this, value: _this.div.value || ''});
			}
		}
	}
})();


(function() {
	$.fn.keypress = function(callback) {
		this.div.onkeypress = function(e) {
			e = e || window.event;
			e.code = e.keyCode ? e.keyCode : e.charCode;
			callback(e);
		}
	}
	
	$.fn.keydown = function(callback) {
		this.div.onkeydown = function(e) {
			e = e || window.event;
			e.code = e.keyCode;
			callback(e);
		}
	}
	
	$.fn.keyup = function(callback) {
		this.div.onkeyup = function(e) {
			e = e || window.event;
			e.code = e.keyCode;
			callback(e);
		}
	}
})();


Class(function Swipe() {
    var _this;
    var _y, _disable;
    
    this.max = 0;
    this.width = 100;
    this.currentSlide = 0;
    this.saveX = 0;
    this.currentX = 0;
    this.threshold = 0.1;
    this.minDist = 10;
    this.disableY = false;
    this._values = new Object();
    
    this.__slide = function(dir) {
        var last = _this.currentSlide;
        _this.currentSlide += dir;
        var x = -_this.currentSlide * _this.slideWidth;
        _this.swipeContainer.tween({x: x}, 500, 'easeOutCubic');
        _this.currentX = x;
        if (last != _this.currentSlide && _this.slideComplete) _this.slideComplete(_this.currentSlide);
    }

    //*** Event Handlers
    this.__start = function(e) {
        if ((!Device.mobile || e.touches.length == 1) && !_disable) {
            _this.swiping = true;
            _this.swipeContainer.stopTween();
            _this._values.x = Utils.touchEvent(e).x;
            _this._values.time = Date.now();
            if (Device.mobile) __window.bind('touchmove', _this.__move);
            else __window.bind('mousemove', _this.__move);
            
            if (_this.disableY) {
                _y = e.touches[0].pageY;
            }
        }
    }
    
    this.__move = function(e) {
        if ((!Device.mobile || e.touches.length == 1) && !_disable) {
            if (_this.disableY) {
                var y = Utils.touchEvent(e).y;
                if (Math.abs(y - _y) > 25) {
                    _disable = true;
                    if (Device.mobile) __window.unbind('touchmove', _this.__move);
                    else __window.unbind('mousemove', _this.__move);
                }
            }
            
            var pX = Utils.touchEvent(e).x;
            var diff = pX - _this._values.x;
            var test = _this.saveX + diff;
            if (test > 0) {
                diff /= 2;
                _this._values.snap = 'left';
            } else if (test < _this.max) {
                diff /= 2;
                _this._values.snap = 'right';
            } else {
                _this._values.snap = null;
            }

            _this.currentX = _this.saveX + diff;
            _this.swipeContainer.stopTween().transform({x: _this.currentX});
        }
    }
    
    this.__end = function(e) {
        _this.swiping = false;
        if (Device.mobile) __window.unbind('touchmove', _this.__move);
        else __window.unbind('mousemove', _this.__move);
        _disable = false;
                
        if (_disable) {
            _this.__slide(0);
        } else if (_this._values.snap) {
            var x = 0;
            if (_this._values.snap == 'right') x = _this.max;
            _this.swipeContainer.tween({x: x}, 500, 'easeOutCubic');
            _this.currentX = x;
            _this._values.snap = null;
        } else {
            var slide = -(_this.slideWidth*_this.currentSlide + _this.slideWidth/2);
            var slideLeft = slide + _this.slideWidth;
            if (_this.currentX < slide) {
                _this.__slide(1);
            } else if (_this.currentX > slideLeft) {
                _this.__slide(-1);
            } else {
                var time = Date.now();
                var xDiff = Utils.touchEvent(e).x - _this._values.x;
                var timeDiff = time - _this._values.time;
                var velocity = xDiff/timeDiff;
                if (Math.abs(xDiff) >= _this.minDist && Math.abs(velocity) > _this.threshold) {
                    if (velocity < 0) _this.__slide(1);
                    else _this.__slide(-1);
                } else {
                    _this.__slide(0);
                }
            }
        }
        _this._values.x = _this._values.time = null;
        _this.saveX = _this.currentX;
    }

    //*** Public methods
    this.addListeners = function(container) {
        _this = this;
        _this.slideWidth = _this.width/_this.slides;
        _this.max = -_this.width+_this.slideWidth;
        _this.swipeContainer = container;
        container.transform({x: 0});
        
        if (Device.mobile) {
            container.bind('touchstart', _this.__start);
            __window.bind('touchend', _this.__end);
            __window.bind('touchcancel', _this.__touchCancel);
        } else {
            container.bind('mousedown', _this.__start);
            __window.bind('mouseup', _this.__end);
        }
    }
    
    this.removeListeners = function() {
        var container = _this.swipeContainer;
        if (Device.mobile) {
            container.unbind('touchstart', _this.__start);
            __window.unbind('touchend', _this.__end);
            __window.unbind('touchcancel', _this.__touchCancel);
        } else {
            container.unbind('mousedown', _this.__start);
            __window.unbind('mouseup', _this.__end);
        }
    }
});

(function() {
	$.fn.touchSwipe = function(callback, remove) {
		if (!window.addEventListener) return this;
		var _this = this;
		var _distance = 75;
		var _startX, _startY;
		var _moving = false;
		var _mobile = Device.mobile;
		
		if (_mobile) {
			if (!remove) {
				if (this._events.touchswipe) this.touchSwipe(null, true);
				this.div.addEventListener('touchstart', touchStart);
				this.div.addEventListener('touchend', touchEnd);
				this.div.addEventListener('touchcancel', touchEnd);
				this._events.touchswipe = true;
			} else {
				this.div.removeEventListener('touchstart', touchStart);
				this.div.removeEventListener('touchend', touchEnd);
				this.div.removeEventListener('touchcancel', touchEnd);
				this._events.touchswipe = false;
			}
		}
		
		function touchStart(e) {
		    if (!_this.div) return false;
			if (e.touches.length == 1) {
				_startX = e.touches[0].pageX;
				_startY = e.touches[0].pageY;
				_moving = true;
				_this.div.addEventListener('touchmove', touchMove);
			}
		}
		
		function touchMove(e) {
		    if (!_this.div) return false;
			e.preventDefault();
			if (_moving) {
				var dx = _startX - e.touches[0].pageX;
				var dy = _startY - e.touches[0].pageY;
				if (Math.abs(dx) >= _distance) {
					touchEnd();
					if (dx > 0) {
						if (callback) callback.apply(_this, [{direction: 'left'}]);
					} else {
						if (callback) callback.apply(_this, [{direction: 'right'}]);
					}
				} else if (Math.abs(dy) >= _distance) {
				    touchEnd();
				    if (dy > 0) {
                        if (callback) callback.apply(_this, [{direction: 'up'}]);
                    } else {
                        if (callback) callback.apply(_this, [{direction: 'down'}]);
                    }
				} else {
				    if (callback) callback.apply(_this, [{moving: true, x: dx, y: dy}]);
				}
			}
		}
			
		function touchEnd(e) {
		    if (!_this.div) return false;
			_startX = _startY = _moving = false;
			_this.div.removeEventListener('touchmove', touchMove);
		}
		return this;
	}
	
	$.fn.touchClick = function(hover, click, remove) {
		if (!window.addEventListener) return this;     
        var _this = this;
        var _time, _move;
        var _mobile = Device.mobile;
        var $this = this;
        var _start = {};
        
        if (hover === null && click === true) remove = true;
        
        if (!remove) {
            if (this._events.touchclick) this.touchClick(null, null, true);
            this._events.touchclick = true;
            if (_mobile) {
                this.div.addEventListener('touchmove', touchMove, false);
                this.div.addEventListener('touchstart', touchStart, false);
                this.div.addEventListener('touchend', touchEnd, false);
            } else {
                this.div.addEventListener('mousedown', touchStart, false);
                this.div.addEventListener('mouseup', touchEnd, false);
            }
        } else {
            if (_mobile) {
                this.div.removeEventListener('touchmove', touchMove, false);
                this.div.removeEventListener('touchstart', touchStart, false);
                this.div.removeEventListener('touchend', touchEnd, false);
            } else {
                this.div.removeEventListener('mousedown', touchStart, false);
                this.div.removeEventListener('mouseup', touchEnd, false)
            }
            this._events.touchclick = false;
        }
        
        function touchMove(e) {
            if (!_this.div) return false;
            var touch = {x: e.touches[0].pageX, y: e.touches[0].pageY};
            if (Utils.findDistance(_start, touch) > 20) {
                _move = true;
            } else {
                _move = false;
            }
        }

        function setTouch(e) {
            if (!_mobile) {
                e.touchX = e.pageX;
                e.touchY = e.pageY;
            } else {
                e.touchX = e.touches.length ? e.touches[0].pageX : e.changedTouches[0].pageX;
				e.touchY = e.touches.length ? e.touches[0].pageY : e.changedTouches[0].pageY;
            }
            
            _start.x = e.touchX;
            _start.y = e.touchY;
        }

        function touchStart(e) {
            if (!_this.div) return false;
            _time = Date.now();
            e.action = 'over';
            e.object = _this.div.className == 'hit' ? _this.parent() : _this;
            setTouch(e);
            if (hover) hover.apply(_this, [e]);
        }

        function touchEnd(e) {
            if (!_this.div) return false;
            var time = Date.now();
            var clicked = false;
            e.object = _this.div.className == 'hit' ? _this.parent() : _this;
            setTouch(e);          
            
            if (_time && time - _time < 750) {
                if (Hydra._preventClicks) return false;
                if (click && !_move) {
                    clicked = true;
                    e.action = 'click';
                    if (click && !_move) click.apply(_this, [e]);
                    
                    if (Hydra.autoPreventClicks) {
                        Hydra.preventClicks();
                    }
                }
            }
            
            if (!clicked && hover) {
                e.action = 'out';
                hover(e);
            }
            
            _move = false;
        }
        return this;
    }
})();

Mobile.Class(function Accelerometer() {
    var _this = this;
    
    this.x = 0;
    this.y = 0;
    this.z = 0;

    //*** Event Handlers
    function updateAccel(e) {
        _this.x = e.accelerationIncludingGravity.x;
        _this.y = e.accelerationIncludingGravity.y;
        _this.z = e.accelerationIncludingGravity.z;
    }

    //*** Public methods
    this.capture = function() {
        window.ondevicemotion = updateAccel;
    }
    
    this.stop = function() {
        window.ondevicemotion = null;
        _this.x = _this.y = _this.z = 0;
    }
}, 'Static');

Class(function AlphaVideo(_params) {
    Inherit(this, Events);
    var _this = this;
    var _video, _output, _buffer;
    var _oContext, _bContext, _vContext;
    
    this.playing = false;
    
    (function() {
        _output = new Canvas({width: _params.width, height: _params.height});
        _buffer = new Canvas({width: _params.width, height: _params.height*2});
        
        _params.height *= 2;
        _video = new Video(_params);
        _video.events.add(HydraEvents.UPDATE, videoUpdate);
        _video.events.add(HydraEvents.COMPLETE, videoComplete);
        _params.height /= 2;
        
        _oContext = _output.context;
        _bContext = _buffer.context;
        _vContext = _video.div;
        
        _this.div = _output.div;
    })();
    
    function videoComplete() {
        _this.stop();
        _this.events.fire(HydraEvents.COMPLETE, null, true);
    }
    
    function videoUpdate(e) {
        _this.events.fire(HydraEvents.UPDATE, e, true);
    }
    
    function tick() {
        _bContext.drawImage(_vContext, 0, 0);

        var draw = false;
        var image = _bContext.getImageData(0, 0, _params.width, _params.height);
        var imageData = image.data;
        var alphaData = _bContext.getImageData(0, _params.height, _params.width, _params.height).data;
        
        for (var i = 3, len = imageData.length; i < len; i = i + 4) {
            imageData[i] = alphaData[i-1];
            if (alphaData[i-1] > 0) draw = true;
        }

        if (draw) _oContext.putImageData(image, 0, 0, 0, 0, _params.width, _params.height);
    }
    
    this.play = function() {
        _this.playing = true;
        _video.play();
        setTimeout(Render.startRender, 100, tick);
    }
    
    this.pause = function() {
        _this.playing = false;
        _video.pause();
        Render.stopRender(tick);
    }
    
    this.render = function() {
        _video.play();
        tick();
        _video.pause();
    }
    
    this.stop = function() {
        _this.playing = false;
        _video.stop();
        Render.stopRender(tick);
    }
    
    this.loop = function(loop) {
        _video.loop = loop;
    }
    
    this.seek = function(time) {
        _video.seek(time);
    }
    
    this.ready = function() {
        return _video.ready();
    }
    
    this.destroy = function() {
        _video = _video.destroy();
        _oContext = _oContext.destroy();
        _bContext = _bContext.destroy();
        _vContext = _vContext.destroy();
        Render.stopRender(tick);
        return null;
    }
});

Class(function Sound(_params) {
	Inherit(this, Events);
	var _this = this;
	var _volume = 1;
	var _audio, _inter, _time, _currentAudio, _gc;
	var _saveTime;
	
	this.playing = false;
	
	(function() {
		_audio = new Array();
		createElem();
		_saveTime = new Object();
		_saveTime.tick = 0;
		_saveTime.last = 0;
	})();
	
	function createElem() {
		var audio = document.createElement('audio');
		audio.setAttribute('src', _params.src + '.' + Device.media.audio);
		_audio.push(audio);
		_currentAudio = _audio[_audio.length-1];
		_currentAudio.volume = _volume;
		_this.div = _currentAudio;
	}
	
	function garbageCollect() {
		var count = _audio.length-1;
		for (var i = count; i > -1; i--) {
			var audio = _audio[i];
			if (count > 1 && audio.currentTime >= audio.duration) {
				_audio[i] = null;
				_audio.splice(i, 1);
			}
		}
		_currentAudio = _audio[_audio.length-1];
	}
	
	function tick() {
		if (_currentAudio.currentTime >= _currentAudio.duration) {
			if (!_params.manualGC && _gc) garbageCollect();
			
			if (_params.loop) {
				_this.play(true);
			} else {
				this.playing = false;
				_this.events.fire(HydraEvents.COMPLETE, null, true);
				Render.stopRender(tick);
			}
		}
		
		if (_currentAudio.currentTime != _saveTime.last) {
		    _saveTime.tick = 0;
		    if (!_this.playing) {
		        _this.playing = true;
		        if (_this.events) _this.events.fire(HydraEvents.READY, null, true);
		    }
		} else if (_this.playing) {
		    _saveTime.tick++;
		    if (_saveTime.tick > 60) {
		        _this.playing = false;
		        if (_this.events) _this.events.fire(HydraEvents.ERROR, null, true);
		    }
		}
	    _saveTime.last = _currentAudio.currentTime;
		if (_currentAudio) _this.events.fire(HydraEvents.UPDATE, {time: _currentAudio.currentTime, duration: _currentAudio.duration}, true);
	}
	
	function clearChannels() {
		for (var i = _audio.length-1; i > -1; i--) {
			_audio[i].pause();
			_audio[i] = null;
			_audio.splice(i, 1);
		}
	}
	
	function checkReady() {
        if (!Device.mobile) {
            _this.buffered = _this.div.readyState == _this.div.HAVE_ENOUGH_DATA;
        } else {
            if (_this.div.readyState != _this.div.HAVE_ENOUGH_DATA) {
                _this.div.play();
                _this.buffered = false;
                setTimeout(function() {
                    _this.div.pause();
                }, 1);
            } else {
                _this.buffered = true;
            }
        }
    }
	
	this.channel = function() {
		_gc = true;
		createElem();
		_this.play();
	}
	
	this.play = function() {
		_currentAudio.play();
		Render.startRender(tick);
	}
	
	this.pause = function() {
		this.playing = false;
		_currentAudio.pause();
		Render.stopRender(tick);
	}
	
	this.stop = function() {
		this.playing = false;
		_currentAudio.pause();
		_currentAudio.currentTime = 0;
		Render.stopRender(tick);
		clearChannels();
	}
	
	this.volume = function(v) {
		_volume = v;
		_currentAudio.volume = v;
	}
	
	this.seek = function(t) {
		_currentAudio.currentTime = t;
	}
	
	this.duration = function() {
		return _currentAudio.duration;
	}
	
	this.destroy = function() {
	    this.events = null;
	    clearChannels();
	    Render.stopRender(tick);
	    return null;
	}
	
	this.ready = function() {
	    if (!this.buffered) checkReady();
        return this.buffered;
	}
	
	this.garbageCollect = garbageCollect;
});

Class(function Video(_params) {
    Inherit(this, Events);
    var _this = this;
    var _inter, _time, _lastTime, _buffering;
    var _tick = 0;
    
    this.loop = false;
    this.playing = false;
    
    (function() {
        _this.div = document.createElement('video');
        _this.div.src = _params.src + '.' + Device.media.video;
        _this.div.controls = _params.controls;
        _this.div.id = _params.id || '';
        _this.div.width = _params.width;
        _this.div.height = _params.height;
        _this.loop = _params.loop;
        _this.div.preload = true;

        if (!Device.mobile && !Device.browser.ie) {
            _this.div.play();
            setTimeout(function() {
                _this.div.pause();
            }, 1);
        }
    })();
    
    function tick() {
        if (_this.div) {
			_this.duration = _this.div.duration;
			_this.time = _this.div.currentTime;
			
            if (_this.div.currentTime == _lastTime) {
                _tick++;
                if (_tick > 60 && !_buffering) {
                    _buffering = true;
                    _this.events.fire(HydraEvents.ERROR, {target: _this}, true);
                }
            } else {
                _tick = 0;
                if (_buffering) {
                    _this.events.fire(HydraEvents.READY, {target: _this}, true);
                    _buffering = false;
                }
            }
            
            _lastTime = _this.div.currentTime;
            
            if (_this.div.currentTime >= _this.div.duration-0.001) {
                if (_this.loop) {
                    _this.seek(0);
                    _this.play();
                } else {
                    Render.stopRender(tick);
                    _this.events.fire(HydraEvents.COMPLETE, {target: _this}, true);
                }
            }
                    
            if (_this.events) _this.events.fire(HydraEvents.UPDATE, {time: _this.div.currentTime, duration: _this.div.duration}, true);
        }
    }
    
    function checkReady() {
        if (!Device.mobile) {
            _this.buffered = _this.div.readyState == _this.div.HAVE_ENOUGH_DATA;
        } else {
            _this.buffered = true;
        }
    }
    
    this.play = function() {
		if (!_this.div) return false;
        if (!Device.mobile) {
            if (_this.ready()) {
               _this.playing = true;
               _this.div.play();
               Render.startRender(tick);
            } else {
               setTimeout(_this.play, 10);
            }
        } else {
            _this.playing = true;
            _this.div.play();
            Render.startRender(tick);
        }
    }
    
    this.pause = function() {
		if (!_this.div) return false;
        _this.playing = false;
        _this.div.pause();
        Render.stopRender(tick);
    }
    
    this.stop = function() {
	_this.playing = false;
		Render.stopRender(tick);
		if (!_this.div) return false;
        _this.div.pause();
        _this.div.currentTime = 0;
    }
    
    this.volume = function(v) {
		if (!_this.div) return false;
        _this.div.volume = v;
    }
    
    this.seek = function(t) {
		if (!_this.div) return false;
		if (_this.ready()) {
        	_this.div.currentTime = t;
			tick();
		} else {
			setTimeout(_this.seek, 10);
		}
    }
    
    this.ready = function() {
		if (!_this.div) return false;
        if (!_this.buffered) checkReady();
        return this.buffered;
    }
    
    this.destroy = function() {
        this.stop();
        this.events = null;
        this.div = null;
        return null;
    }
});

Class(function GATracker() {
	this.trackPage = function(page) {
		if (typeof _gaq !== 'undefined') _gaq.push(['_trackPageview', page]);
	}
	
	this.trackEvent = function(category, action, label, value) {
		if (typeof _gaq !== 'undefined') _gaq.push(['_trackEvent', category, action, label, (value || 0)]);
	}
	
	this.customVar = function(name, descr) {
		if (typeof _gaq !== 'undefined') _gaq.push(['_setCustomVar', 1, name, descr]);
	}
}, 'Static');



