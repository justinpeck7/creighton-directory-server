module.exports = function(io) {
    io.on('connection', function (socket) {

        socket.on('sentMsg', function(sent) {
            io.emit('message', sent);
        });

        console.log('someone connected');
        socket.emit('message', {name: 'Server', message: 'Welcome'});
    });
};
