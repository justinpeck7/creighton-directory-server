/*Set up Socket.io for live chat. Listens for a 'sentMsg' event from each individual socket.
When a client sends a message to the server it is then sent to all of the other connected sockets.
Whatever 'module.exports' is set to, that's what another file gets when it 'requires' this one*/
module.exports = function(io) {
    io.on('connection', function (socket) {

        socket.on('sentMsg', function(sent) {
            io.emit('message', sent);
        });

        console.log('someone connected');
        socket.emit('message', {name: 'Server', message: 'Welcome'});
    });
};
