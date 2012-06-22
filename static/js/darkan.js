var App = {
    currentView: undefined,
    updateView: function() {
        $("#contents").html(App.currentView.render());
    }
};

App.JST = {};

App.JST['autohost'] = _.template(''+
    '<div class="span4 well" data-host-id="<%= id %>">'+
      '<h2><%= hostname %></h2>'+
      '<h6>Added <%= added %></h6>'+
      '<p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>'+
      '<p>'+
        '<a class="btn btn-success btn-add-autohost" href="#">Add</a>&nbsp;'+
        '<a class="btn btn-danger btn-decline-autohost" href="#">Decline</a>'+
      '</p>'+
    '</div>'+
'');

App.JST['host'] = _.template(''+
    '<div class="span4 well" data-host-id="<%= id %>">'+
      '<h2><%= hostname %></h2>'+
      
      '<p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>'+
      '<p>'+
        '<a class="btn btn-primary" href="#host/<%= id %>">Details</a>'+
      '</p>'+
    '</div>'+
'');

App.JST['action'] = _.template(''+
    '<div class="span4 well" data-action-id="<%= id %>">'+
      '<h2><%= name %></h2>'+
      '<p><%= description %></p>'+
    '</div>'+
'');

App.JST['trigger'] = _.template(''+
    '<div class="span4 well" data-trigger-id="<%= id %>">'+
      '<h2><%= name %></h2>'+
      '<p><%= description %></p>'+
    '</div>'+
'');

App.JST['trigger-input'] = _.template(''+
    '<form class="form-inline">'+
    '<table class="table table-bordered table-condensed">'+
    '  <tbody>'+
    '    <tr>'+
    '      <td style="width: 150px;">Host</td>'+
    '      <td>'+
    '        <select name="host">'+
    '          <% App.hosts.each(function(host) { %>'+
    '          <option value="<%= host.get(\'id\') %>"><%= host.get(\'hostname\') %></option>'+
    '          <% }); %>'+
    '        </lsect>'+
    '      </td>'+
    '    </tr>'+
    '    <tr>'+
    '      <td>Name</td>'+
    '      <td><input type="text" maxlength="50" name="name" placeholder="Short descriptive name" /></td>'+
    '    </tr>'+
    '    <tr>'+
    '      <td>Description</td>'+
    '      <td><input type="text" maxlength="300" name="description" placeholder="Longer description" /></td>'+
    '    </tr>'+
    '    <tr>'+
    '      <td>Expression</td>'+
    '      <td><input type="text" maxlength="300" name="expression" placeholder="The expression to trigger on" /></td>'+
    '    </tr>'+
    '    <tr>'+
    '      <td>Action</td>'+
    '      <td>'+
    '        <select name="action">'+
    '          <% App.actions.each(function(action) { %>'+
    '          <option value="<%= action.get(\'name\') %>"><%= action.get(\'name\') %></option>'+
    '          <% }); %>'+
    '        </lsect>'+
    '      </td>'+
    '    </tr>'+
    '  </tbody>'+
    '</table>'+
    '<input class="btn btn-primary" type="button" id="save" value="Save" /><br /><br />'+
    '</form>'+
'');

App.DashboardView = Backbone.View.extend({
    render: function() {
        var $el = $('<div />').html('Dashboard');
        this.setElement($el);
        return $el;
    }
});

App.TriggersView = Backbone.View.extend({
    render: function() {
        var $el = $('<div />').html('<b>New trigger:</b><br />');
        $el.append(App.JST['trigger-input']);
        $el.append($('<div />').html('<b>Triggers:</b><br />'));
        App.triggers.each(function(trigger) {
            $el.append(new App.TriggerView({ model: trigger }).render());
        });
        this.setElement($el);

        $('input#save', $el).on('click', function() {
            var data = {};
            _($('form', $el).serializeArray()).each(function(el) {
                data[el['name']] = el['value'];
            });
            var trigger = new App.Trigger(data);
            trigger.save();
            App.triggers.add(trigger);
            App.currentView.update();
        });

        return $el;
    }
});

App.ActionsView = Backbone.View.extend({
    render: function() {
        var $el = $('<div />');
        App.actions.each(function(action) {
            $el.append(new App.ActionView({ model: action }).render());
        });
        this.setElement($el);
        return $el;
    }
});

App.Host = Backbone.Model.extend({   
    url: '/a/host'
});

App.Trigger = Backbone.Model.extend({
    url: '/a/trigger'
});

App.Action = Backbone.Model.extend({
});

App.TriggerCollection = Backbone.Collection.extend({
    model: App.Trigger,
    url: '/a/triggers',
    parse: function(response) {
        return response['models'];
    }
});

App.ActionCollection = Backbone.Collection.extend({
    model: App.Action,
    url: '/a/actions',
    parse: function(response) {
        return response['models'];
    }
});

App.AutoHost = App.Host.extend({
    add: function(callback) {
        var model = this;
        $.ajax('/a/add-autohost/'+String(this.get('id')), {
            success: function() {
                model.collection.remove(model);
                App.hosts.add(model);
                callback();
            }
        });
    },
    decline: function(callback) {
        var model = this;
        $.ajax('/a/decline-autohost/'+String(this.get('id')), {
            success: function() {
                model.collection.remove(model);
                callback();
            }
        });
    }
});

App.HostList = Backbone.View.extend({
    render: function() {
        var that = this;
        var $el = $('<div />');
        var $row;

        this.setElement($el);
        this.options.collection.each(function(host, index, list) {

            if(!$row || index == 0 || !(index % 3))
                $row = $('<div class="row-fluid">');

            var hostview = new that.options.view({ model: host }).render();
            $row.append(hostview);

            if(index == list.length-1 || !((index+1) % 3))
                $el.append($row);

        });
        return $el;
    }
});

App.HostView = Backbone.View.extend({
    render: function() {
        var $el = App.JST['host'](this.model.toJSON());
        this.setElement($el);
        return $el;
    },
});

App.AutoHostView = Backbone.View.extend({
    render: function() {
        var $el = App.JST['autohost'](this.model.toJSON());
        this.setElement($el);
        return $el;
    },
});

App.ActionView = Backbone.View.extend({
    render: function() {
        var $el = App.JST['action'](this.model.toJSON());
        this.setElement($el);
        return $el;
    }
});

App.TriggerView = Backbone.View.extend({
    render: function() {
        var $el = App.JST['trigger'](this.model.toJSON());
        this.setElement($el);
        return $el;
    }
});

App.HostCollection = Backbone.Collection.extend({
    model: App.Host,
    url: '/a/hosts',
    parse: function(response) {
        return response['models'];
    }
});

App.AutohostCollection = App.HostCollection.extend({
    model: App.AutoHost,
    url: '/a/autohosts'
});

App.AutohostCounter = Backbone.View.extend({
    initialize: function() {
        _(this).bindAll('update_count');

        this.collection.bind('reset', this.update_count);
        this.collection.bind('remove', this.update_count);
    },
    update_count: function() {
        var $el = $("#autohost-count");
        var count = this.collection.length;
        $el.html(count);
        if(count > 0) {
            $el.removeClass('badge-information').addClass('badge-important');
        } else {
            $el.removeClass('badge-important').addClass('badge-information');
        }
    }
});

App.Router = Backbone.Router.extend({
    routes: {
        "": "showDashboard",
        "dashboard": "showDashboard",
        "hosts": "showHosts",
        "autohosts": "showAutohosts",
        "triggers": "showTriggers",
        "actions": "showActions",
        "host/:hostid": "showHost",
    },
    showDashboard: function() {
        App.currentView = new App.DashboardView();
        App.updateView();
    },
    showHosts: function() {
        App.currentView = new App.HostList({ view: App.HostView, collection: App.hosts });
        App.updateView();
    },
    showHost: function(hostid) {
        console.log('show host '+hostid);
    },
    showAutohosts: function() {
        App.currentView = new App.HostList({ view: App.AutoHostView, collection: App.autohosts });
        App.updateView();
    },
    showTriggers: function() {
        App.currentView = new App.TriggersView();
        App.updateView();
    },
    showActions: function() {
        App.currentView = new App.ActionsView();
        App.updateView();
    }
});

$(function() {

    var preload = 0;

    App.hosts = new App.HostCollection();
    App.hosts.fetch({ success: function() { preload = preload + 1; } });

    App.triggers = new App.TriggerCollection();
    App.triggers.fetch({ success: function() { preload = preload + 1; } });

    App.actions = new App.ActionCollection();
    App.actions.fetch({ success: function() { preload = preload + 1; } });

    App.autohosts = new App.AutohostCollection();
    App.ahostcounter = new App.AutohostCounter({ collection: App.autohosts });
    App.autohosts.fetch({ success: function() { preload = preload + 1; } });

    /* TODO: This is _REALLY_ ugly, and should be replaced by proper bootstrap */
    var preloadTimer = setInterval(function() {
        if(preload == 4) {
            App.router = new App.Router;
            Backbone.history.start();
            clearInterval(preloadTimer);
        }
    }, 100);

    $(document).on('click', '.btn-add-autohost', function() {
        var $box = $(this).closest('div');
        var ahost = App.autohosts.get($box.attr('data-host-id'));
        ahost.add(function() {
            App.updateView();
        });
        return false;
    });

    $(document).on('click', '.btn-decline-autohost', function() {
        var $box = $(this).closest('div');
        var ahost = App.autohosts.get($box.attr('data-host-id'));
        ahost.decline(function() {
            App.updateView();
        });
        return false;
    });

    $('#navbar a').on('click', function() {
        $("#navbar .active").removeClass('active');
        $(this).parent().addClass('active');
    });
});
