/**/
/*
  notification //
  attributes：
    data []所有信息 readonly 
  methods:
    handle(data) //handle data and distribute events
  events:
  data
*/
/*
 * {"from":"","text":"","link":""}
 */
var _grepNotiMsg = function(val, n){
        return val && val.text;
};
webim.notification = function(data, options){
        var self = this;
        self.data = [];
        self.options = extend({}, webim.notification.defaults, options);
};

extend(webim.notification.prototype, objectExtend, {
        handle: function(data){
                var self = this.self || this;
                data = grep(makeArray(data), _grepNotiMsg);
                if(data.length)self.trigger("data", [data]);
        },
        load: function(){
                var self = this, options = self.options;
                ajax({
                        url: options.url,
                        cache: false,
                        dataType: "json",
                        self: self,
                        success: self.handle
                });
        }
});
webim.notification.defaults = {
        url: "webim/notifications"
};
