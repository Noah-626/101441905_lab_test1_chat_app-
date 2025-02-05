const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const { loginCollection, GroupChat, PrivateChat } = require('./db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(express.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.render('index.ejs');
});
function isAuthenticated(req,res,next){
    if(req.isAuthenticated()){ // will return true if user is logged in
        next();
    } else{
        res.redirect("/login");
    }
  }
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', async (req, res) => {
    const data = new loginCollection({
        name: req.body.name,
        firstname: req.body.fname,
        lastname: req.body.lname,
        password: req.body.password,
        email: req.body.email
    });

    try {
        const existingUser = await loginCollection.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const existingUsername = await loginCollection.findOne({ name: req.body.name });
        if (existingUsername) return res.status(400).json({ error: 'Username already taken' });

        await data.save();
        res.redirect('/login');
    } catch (error) {
        res.status(500).json({ error: 'Try again' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await loginCollection.findOne({ name });

        if (!user || user.password !== password) {
            return res.status(400).json({ error: 'Incorrect username or password' });
        }

        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: 'An error occurred. Please try again' });
    }
});



const users = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);


    socket.on('joinRoom', async ({ username, room }) => {
        socket.join(room);
        users[socket.id] = { username, room };

        const chatHistory = await GroupChat.find({ room }).sort({ date_sent: 1 });
        socket.emit('loadMessages', chatHistory);
    });

    socket.on('groupMessage', async ({ username, room, message }) => {
        const chatMessage = new GroupChat({ from_user: username, room, message });
        await chatMessage.save();
        
        io.to(room).emit('newMessage', { from_user: username, message });
    });

    socket.on('privateMessage', async ({ from_user, to_user, message }) => {
        const chatMessage = new PrivateChat({ from_user, to_user, message });
        await chatMessage.save();
        
        socket.to(users[to_user]?.socketId).emit('newPrivateMessage', { from_user, message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000...');
});
