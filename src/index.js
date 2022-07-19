const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)



const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


//
//
// Goal: Render username for text messages
// 1. Setup the server to send username to client
// 2.Edit every call to "generateMessage" to include username
//      - Use "Admin" for sys messages like connnect/welcome/disconnect
// 3. Update client to render username in template
// 4. Test your work!



// C
// 
// Goal:Sendawelcome message to new users
// 1. Have server emit"message"when new client connects
//      -Send"Welcome!"as the event data
// 2. Have client listen for"message"event and print the message to console
// 3. Test your work!


// D
// Goal: Allow clients to send messages
// 1. Create a form with an input and button
//      - Similar to the weather form
// 2. Setup event listener for form submissions
//     - Emit "sendMessage" with input string as message data
// 3. Have server listen for "sendMessage"
//    - Send message to all connected clients
// 4. Test your work!








// server(emit)->client(receive)-countUpdated
// client(emit)→server(receive)-increment

//let count=0

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ( options , callback) => {
        
        const { error, user} = addUser({id: socket.id, ...options })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
    
        io.to(user.room). emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    })

    //
    // Goal: Send messages to correct room
    //
    // 1. Use getUser inside "sendMessage" event handler to get user data
    // 2. Emit the message to their current room
    // 3. Test your work!
    // 4. Repeat for "sendLocation"



    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })


    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords. latitude}, ${coords. longitude}`))
        callback()
    })

    //
    // Goal: Setup acknowledgment
    // 1. Setup the client acknowledgment function
    // 2. Setup the server to send back the acknowledgment
    // 3. Have the client print "Location shared!" when acknowledged
    // 4. Test your work!



    // socket.emit('countUpdated', count)
    // socket.on('increment',()=>{
    //     count ++
    //     //socket.emit("countUpdated",count)
    //     io.emit("countUpdated",count)
    // })
    socket.on('disconnect', () => {

        
        const user = removeUser (socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room). emit('roomData', {
                room: user.room,
                users: getUsersInRoom (user.room)
            })
        }

    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})


//  A          ^
//            |
// Goal:Create an Express web server
// 1. Initialize npm and install Express
// 2. Setupanew Express server
// -Serve up the public directory
//   -Listen on port 3000 
// 3. Create index.html and render"Chat App"to the screen.
// 4. Test your work!Start the server and view the page in the browser


//   B
// Goal:Setup scripts in package.json
// 1. Createa"start"script to start the app using node.
// 2. Install nodemon andadevelopment dependency
// 3. Createa"dev"script to start the app using nodemon
// 4. Run both scripts to test your work!