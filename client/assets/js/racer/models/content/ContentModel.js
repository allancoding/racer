Class(function ContentModel(_data) {
    var _this = this;

    //*** Constructor
    (function() {

    })();

    //*** Public Methods
    this.getContent = function(perma) {
        for (var i = 0; i < _data.length; i++) {
            if (_data[i].perma == perma) return _data[i].content_text;
        }
    }
    
    this.getAll = function() {
        return _data;
    }
}); 