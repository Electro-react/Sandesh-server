const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
const PORT = 5001;

app.get('/', (req, res) => {
  res.send('Running');
});
var id = {};
io.on('connection', (socket) => {
  socket.on('sendId', ({ username, identity }) => {
    id[identity] = username;
  });
  setInterval(() => socket.emit('recievedId', id), 3000);
  socket.on('disconnect', () => {
    delete id[socket.id];
    socket.emit('recievedId', id);
    socket.broadcast.emit('callEnded');
  });

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    socket.to(userToCall).emit('callUser', { signal: signalData, from, name });
  });
  socket.on('send', ({ userId, name, mge }) => {
    // edited
    io.to(userId).emit('received', { somedata: mge, senderName: name });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
});
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
