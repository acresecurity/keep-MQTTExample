var yargs = require('yargs');
var request = require('request');
var mqtt = require('mqtt');
var token = '';
var instanceKey = '';
var argv = yargs
    .option('address', {
    description: 'URL of Keep API. Example: https://example.com',
    alias: 'a',
    type: 'string'
})
    .option('publisher', {
    description: 'URL of Keep API. Example: example.com',
    alias: 'e',
    type: 'string'
})
    .option('instance', {
    alias: 'i',
    description: 'Instance name',
    type: 'string'
})
    .option('username', {
    alias: 'u',
    description: 'Username',
    type: 'string'
})
    .option('password', {
    alias: 'p',
    description: 'Password',
    type: 'string'
})
    .help()
    .alias('help', 'h')
    .argv;
var POST = 'grant_type=password&' +
    'client_id=consoleApp&' +
    'client_secret=consoleSecret&' +
    'username=' + argv.u + '&' +
    'instance=' + argv.i + '&' +
    'password=' + argv.p;
var options = {
    method: 'POST',
    url: argv.a + '/token',
    headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    },
    body: POST
};
function connect() {
    if (argv.a && argv.i && argv.u && argv.p) {
        request(options, parseResponse);
    }
    else {
        console.error('Missing address, instance, username, publisher address, or password');
    }
}
function parseResponse(error, response, body) {
    if (!error && response.statusCode === 200) {
        var parsedResponse = JSON.parse(body);
        token = parsedResponse.access_token;
        instanceKey = parsedResponse.instance;
        MQTTConnect();
    }
    else {
        console.error('error: ' + response.statusCode);
    }
}
function MQTTConnect() {
    var MQTTOptions = {
        hostname: argv.e,
        port: 443,
        path: '/mqtt',
        username: token,
        protocol: 'wss',
        connectOnCreate: true,
        keepalive: 0,
        client_id: 'mqttjs_' + Math.random().toString(16).substr(2, 8)
    };
    var client = mqtt.connect(argv.e, MQTTOptions);
    client.on('connect', function () {
        client.subscribe('/' + instanceKey + '/$', function (err) {
            if (!err) {
                console.log('MQTT connected');
            }
            else {
                console.log('MQTT connection error: ', err);
            }
        });
    });
    client.on('message', function (topic, message) {
        console.log('MQTT topic: ', topic, message.toString());
    });
    client.on('disconnect', function (packet) {
        console.log('MQTT disconnect: ', packet);
    });
    client.on('error', function (err) {
        console.log('Connection error: ', err);
    });
}
connect();
