//
/* ui.chat:
 *
 options:

 methods:
 add(ids)
 remove(ids)
 online(ids)
 offline(ids)
 disable()
 enable()
 destroy()

 events: 
 select

 */
 webim.widget("chatlink",{
        _init: function(){
                var self = this, element = self.element, ids = {}, options = self.options, filterId = options.filterId, links = {}, offline = options.offline;

                var tpl = $('<span class="webim-chatlink-disable webim-chatlink'+(options.offline ? '' : ' webim-chatlink-no-offline')+'"><span class="webim-chatlink-off-i"></span><span class="webim-chatlink-on-i"></span></span>').click(function(e){
                        self.trigger("select", this.id);
                        e.stopPropagation();
                        return false;
                });

                var a = element ? element.find("a") : $("a"), b;
                a.filter(function(e){
                        var id = filterId(this.href), text = this.innerHTML;
                        if(id && $(this).children().length == 0 && text){
                                ids[id] = true;
                                b = tpl.clone(true).attr({id: id, title: i18n('chat with',{name: text})}).insertAfter(this);
                                links[id] = links[id] ? links[id].add(b) : b;
                                return true;
                        }
                        return false;
                });
                ids = idsArray(ids);
                var id = filterId(window.location.href);
                if(id){
                        ids.push(id);
                        b = $("<li class='webim-chatlink-disable'>").append(tpl.removeClass("webim-chatlink-disable").clone(true).attr("id",id)).appendTo($(".spacemenu_list:first,.line_list:first"));
                        b.find("span").not(b.children("span")).html("<a href='javascript:void 0'>"+i18n('chat with me')+"</a>");
                        links[id] = links[id] ? links[id].add(b) : b;
                }
                self.ids = ids;
                self.links = links;
        },
        disable: function(){
                var self = this, ids = self.ids, l = ids.length;
                for(var i = 0; i < l; i++){
                        var li = self.links[ids[i]];
                        li && li.addClass("webim-chatlink-disable");
                }
        },
        enable: function(){
                var self = this, ids = self.ids, l = ids.length;
                for(var i = 0; i < l; i++){
                        var li = self.links[ids[i]];
                        li && li.removeClass("webim-chatlink-disable");
                }
        },
        remove: function(ids){
                ids = idsArray(ids);
                var self = this, l = ids.length, id;
                for(var i = 0; i < l; i++){
                        id = ids[i];
                        var li = self.links[id];
                        if(li){
                                li.remove();
                                delete self.links[id];
                                self.ids = $.grep(self.ids, function(v, i){
                                        return v != id;
                                });
                        }
                }
        },
        online: function(ids){
                ids = idsArray(ids);
                var self = this, l = ids.length;
                for(var i = 0; i < l; i++){
                        var li = self.links[ids[i]];
                        li && li.addClass("webim-chatlink-on");
                }
        },
        offline: function(ids){
                ids = idsArray(ids);
                var self = this, l = ids.length;
                for(var i = 0; i < l; i++){
                        var li = self.links[ids[i]];
                        li && li.removeClass("webim-chatlink-on");
                }
        }

});
webim.ui.chatlink.defaults = {
        filterId: function(link){
                if(!link)return false;
                var ex = /space\.php\?uid=(\d+)$|space\-(\d+)\.html$/i.exec(link);
                return ex && (ex[1] || ex[2]);
        },
        offline: true
};

