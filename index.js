var zmq = require('zmq');
var zonar = require('zonar');
var nfc = require('nfc').nfc;

var port = 6000;
var helpPort = 6001;
var address = "tcp://0.0.0.0:" + port;
var helpAddress = "tcp://0.0.0.0:" + helpPort;

var broadcaster = zonar.create({
    net: "24hr", 
    name: "nfc.pub", 
    payload: JSON.stringify({
        port: port,
        help: helpPort
    })
});

var n = new nfc();

var socket = zmq.socket('pub');

var lastUid = "";
var clearRef = -1;

socket.bind(address, function(err) {

    if (err) throw err;

    console.log("NFC publishing service started");

    broadcaster.start(function() {
        console.log("Broadcasting about myself");        
    });

    n.on('uid', function(uid) {
        var uidString = uid.toString('hex');
        if (lastUid != uidString) {
            lastUid = uidString;
            socket.send("NFC " + uidString);
            clearTimeout(clearRef);
            clearRef = setTimeout(function() {
                lastUid = ""; 
            }, 1000);
        }
    });

    n.start();

});

// Greacefully quit
process.on('SIGINT', function() {
    broadcaster.stop(function() {
        socket.close(function() { });
        process.exit( );
    });
})


// Help part
// ---------
// This is just a request-response pattern to serve the help
var helpSocket = zmq.socket('rep');
helpSocket.bind(helpAddress, function(err) {

    if (err) throw err;

    helpSocket.on('message', function(data) {
        socket.send(
            ''
            + ''
        );
    });

});



