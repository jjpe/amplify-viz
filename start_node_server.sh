#!/bin/sh

# Start the MongoDB daemon, if it wasn't already running
mongo --version &> /dev/null  ||  bash -c "mongod &" &> /dev/null

# Actually start the Node server
node server.js
