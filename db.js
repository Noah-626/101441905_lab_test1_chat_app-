const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://101441905:cOtvfZpfcAlUxdW7@loginpage.pnul9.mongodb.net/?retryWrites=true&w=majority&appName=LoginPage')
.then(()=>{
    console.log('connected to the database')
})
.catch(()=>{
    console.log('connection failed')
})

// 🔹 User Schema (already exists)
const loginSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    firstname: { type: String, required: true, trim: true, lowercase: true },
    lastname: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    created: { type: Date, default: Date.now() },
});

// 🔹 Group Chat Schema
const groupChatSchema = new mongoose.Schema({
    from_user: { type: String, required: true },
    room: { type: String, required: true },
    message: { type: String, required: true },
    date_sent: { type: Date, default: Date.now },
});

// 🔹 Private Chat Schema
const privateChatSchema = new mongoose.Schema({
    from_user: { type: String, required: true },
    to_user: { type: String, required: true },
    message: { type: String, required: true },
    date_sent: { type: Date, default: Date.now },
});

// 🔹 Create Models
const loginCollection = mongoose.model('loginCollection', loginSchema);
const GroupChat = mongoose.model('GroupChat', groupChatSchema);
const PrivateChat = mongoose.model('PrivateChat', privateChatSchema);

module.exports = { loginCollection, GroupChat, PrivateChat };
