(function() {
    return;
    var _io = io.connect('http://cloud.activetheorylab.net:7777');
    if (Device.mobile || Device.browser.old || Device.browser.ie || window.location.hash.strpos('console')) {
        window.console = {
            log: function(c) {
                emit(c);
            },
            
            warn: function(c) {
                emit('WARNING: '+c);
            }
        };
        
        window.debug = {
            log: function(c) {
                emit(c);
            }
        };
        
        window.onerror = function(message, file, line) {
            emit('ERROR: '+message+' ::: '+file+' : '+line);
        };
    } else {
        _io.on('console_log', function(c) {
            console.log(c);
        });
        
        _io.on('console_clear', function() {
            //console.clear();
            console.log('------');
        });
        
        window.debug = {
            log: function(c) {
                console.log(c);
            }
        };
    }
    
    function emit(c) {
        _io.emit('console_log', c);
    }
})();


