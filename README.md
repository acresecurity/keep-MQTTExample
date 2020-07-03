# keep-MQTTExample
Example node application illustrating MQTT connections for Keep.

# Build
In order to build the application, make sure node/npm is installed and run from the root directory:

    npm install

# Run
Use node to run the file index.js, while providing the necessary command line options.

    --address, -a   URL of Keep API. Example: https://example.com         [string]
    --instance, -i  Instance name                                         [string]
    --username, -u  Username                                              [string]
    --password, -p  Password                                              [string]
    --help, -h      Show help

Example:
    node index.js -a https://example.com -i exampleInstance -u exampleUsername -p examplePassword