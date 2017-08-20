/* jshint esversion: 6 */

var express = require('express');
var _ = require('lodash');
var mongoose = require('mongoose');
var q = require('q');


function log(msg) {
    console.log(`[SERVER] ${msg}`);
}

/* ************************************************************************** */
/*               Server definition                                            */
/* ************************************************************************** */
const SERVER_NAME = 'Amplify Viz NodeJS server';
const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;
const SERVER_URI = `http://${SERVER_HOST}:${SERVER_PORT}`;

var server = express();

/* ************************************************************************** */
/*               MongoDB                                                      */
/* ************************************************************************** */
const MONGODB_HOST = 'localhost';
const MONGODB_PORT = 27017;
const MONGODB_URI = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}`;
const DB_NAME = 'Collector';
const COLLECTION_NAME = 'Msg';


mongoose.Promise = global.Promise;
var Msg = mongoose.model('Msg', {
    process: String,
    revision: Number, // request_number
    kind: String,
    origin: String,
    contents: [],
    regions: [],
    language: String,
    ast: Object,
    sent_at_ns: Number,
    received_at_ns: String,
    transmission_duration_ns: Number
}, COLLECTION_NAME);


/* ************************************************************************** */
/*               Routing                                                      */
/*                                                                            */
/* NOTE: Don't touch the definition order, these routes are oddly             */
/*       sensitive it when requests are matched.                              */
/* ************************************************************************** */
server.use(express.static('./')); // Serve the client by serving ./index.html
// server.use(express.static('./dist')); // Serve the client
// server.use(express.static('./node_modules'));

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
               "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// // Return to the client a JSON object containing *ALL* msgs
// server.get('/', function(req, res) {
//     server.use(express.static('./'));
//     server.use(express.static('./index.html'));
//     // Msg.find().exec(function(err, msgs) {
//     //     log(`${req.url} => Found ${msgs.length} msgs`);
//     //     res.json(msgs);
//     // });
// });

// Return to the client a JSON object containing *ALL* msgs
server.get('/msgs', function(req, res) {
    let excluded_fields = {
        // The contents of these fields can be pretty huge.  In addition, the
        // client does not use them at all, so let's just not fetch them.
        contents: 0,
        ast: 0
    };
    Msg.find({}, excluded_fields).exec(function(err, msgs) {
        if (msgs === null) {
            log(`${req.url} => Found no msgs:  msgs === null`);
            return;
        }
        if (msgs === undefined) {
            log(`${req.url} => Found no msgs:  msgs is undefined`);
            return;
        }
        if (!msgs.length) {
            log(`${req.url} => Found no msgs:  msgs has no length`);
            return;
        }

        log(`${req.url} => Found ${msgs.length} msgs`);
        res.json(msgs);
    });
});

// Return to the client a JSON object containing all
// msgs with a revision in the range [:start, :end]
server.get('/msgs/revisions/:start-:end', function(req, res) {
    const predicate = { revision: {
        $gte: req.params['start'],
        $lte: req.params['end']
    }};
    Msg.find(predicate).exec(function(err, msgs) {
        log(`${req.url} => Found ${msgs.length} msgs`);
        res.json(msgs);
    });
});

// Return to the client a JSON object containing all msgs for some revision
server.get('/msgs/revisions/:revision', function(req, res) {
    const predicate = { revision: { $eq: req.params['revision'] } };
    Msg.find(predicate).exec(function(err, msgs) {
        log(`${req.url} => Found ${msgs.length} msgs`);
        res.json(msgs);
    });
});

/* ************************************************************************** */
/*               Server loop                                                  */
/* ************************************************************************** */
server.listen(SERVER_PORT, function() {
    log(`${SERVER_NAME} bound @ ${SERVER_URI}`);
    const DB_LOCATION = `${MONGODB_URI}/${DB_NAME}`;
    q.fcall(function () {
        mongoose.connect(DB_LOCATION, {
            useMongoClient: true
        });
    }).then(function() {
        log(`Connected to MongoDB @ ${DB_LOCATION}`);
    });
});

//  LocalWords:  perf RESTful mongodb PerfViz
