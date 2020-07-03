const yargs = require('yargs');
const request = require('request');
const mqtt = require('mqtt');

let token: string = '';
let instanceKey: string = '';

const argv = yargs
  .option('address', {
    description: 'URL of Keep API. Example: https://example.com',
    alias: 'a',
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

const POST =
  'grant_type=password&' +
  'client_id=consoleApp&' +
  'client_secret=consoleSecret&' +
  'username=' + argv.u + '&' +
  'instance=' + argv.i + '&' +
  'password=' + argv.p;

const options = {
  method: 'POST',
  url: argv.a + '/token',
  headers: {
    'Content-type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  },
  body: POST
}

function connect() {
  if (argv.a && argv.i && argv.u && argv.p) {
    request(options, parseResponse);
  } else {
    console.error('Missing address, instance, username, or password');
  }
}

function parseResponse(error, response, body) {
  if (!error && response.statusCode === 200) {
    const parsedResponse = JSON.parse(body);
    token = parsedResponse.access_token;
    instanceKey = parsedResponse.instance;
    MQTTConnect();
  } else {
    console.error('error: ' + response.statusCode);
  }
}

function MQTTConnect() {
  const MQTTOptions = 
    {
      hostname: 'dev-events.feenicsdev.com',
      port: 443,
      path: '/mqtt',
      username: token,
      protocol: 'wss',
      connectOnCreate: true,
      keepalive: 0,
      client_id: 'mqttjs_' + Math.random().toString(16).substr(2, 8)
    }
  const client = mqtt.connect('dev-events.feenicsdev.com', MQTTOptions);

  client.on('connect', () => {
    client.subscribe('/' + instanceKey + '/$', (err) => {
      if (!err) {
        console.log('MQTT connected');
      } else {
        console.log('MQTT connection error: ', err);
      }
    })
  })

  client.on('message', (topic, message) => {
    console.log('MQTT topic: ', topic, message.toString());
  })

  client.on('disconnect', (packet) => {
    console.log('MQTT disconnect: ', packet);
  })

  client.on('error', (err) => {
    console.log('Connection error: ', err);
  })
}

connect();
