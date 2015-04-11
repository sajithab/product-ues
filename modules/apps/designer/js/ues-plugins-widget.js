(function () {

    var containerPrefix = 'ues-widget-';

    var containerId = function (id) {
        return containerPrefix + id;
    };

    var plugin = (ues.plugins['widget'] = {});

    plugin.create = function (sandbox, widget, hub, done) {
        var html = '<h2>' + widget.content.title + '</h2>';
        html += '<button class="ues-send btn btn-primary" type="button">Send</button>';
        sandbox.html(html);
        var id = containerId(widget.id);
        var container = new OpenAjax.hub.InlineContainer(ues.hub, id, {
                Container: {
                    onSecurityAlert: function (source, alertType) {
                        //Handle client-side security alerts
                    },
                    onConnect: function (container) {
                        //Called when client connects
                    },
                    onDisconnect: function (container) {
                        //Called when client disconnects
                    }
                }
            }
        );

        var client = new OpenAjax.hub.InlineHubClient({
            HubClient: {
                onSecurityAlert: function (source, alertType) {
                }
            },
            InlineHubClient: {
                container: container
            }
        });

        var Hub = function (client, options) {
            this.client = client;
            this.options = options;
        };

        Hub.prototype.on = function (event, done) {
            var hub = this;
            var channel = hub.options.id + '.' + event;
            hub.client.subscribe(channel, function (topic, data, subscription) {
                done(data);
            });
            console.log('subscribed for channel:%s by %s', channel, hub.options.id);
        };

        Hub.prototype.emit = function (event, data) {
            console.log('publishing event:%s, data:%s by notifier:%s', event, data, this.options.id);
            this.client.publish(event, data);
        };

        client.connect(function (client, success, error) {
            var hub = new Hub(client, widget);
            sandbox.on('click', '.ues-send', function () {
                hub.emit('user-country', 'LK');
                hub.emit('client-country', 'US');
                //hub.emit('country-code', {});
            });
            hub.on('state', function (state) {
                console.log(state);
            });
        });
        done(false, widget);
    };

    plugin.update = function (sandbox, widget, hub, done) {

    };

    plugin.destroy = function (sandbox, widget, hub, done) {
        $(sandbox).remove('iframe');
    };

}());