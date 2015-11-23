module.exports = function(io) {
    io.on('connection', function (socket) {
        console.log('someone connected');
        io.emit('message', 'hello world');
    });
};
