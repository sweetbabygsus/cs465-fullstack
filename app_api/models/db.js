const mongoose = require('mongoose');
const readLine = require('readline');

let dbURL  = 'mongodb://127.0.0.1/travlr';
if (process.env.NODE_ENV === 'production') {
    dbURL = process.env.DB_HOST || process.env.MONGODB_URI;
}

const connect = () => {
    setTimeout(() => mongoose.connect(dbURL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }), 1000);
}

mongoose.connection.on('connected', () => {
    console.log('connected');
});

mongoose.connection.on('error', err => {
    console.log('error: ' + err);
    return connect();
});

mongoose.connection.on('disconnected', () => {
    console.log('disconnected');
});

if (process.platform === 'win32') {
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout  
    });
    rl.on ('SIGINT', () => {
        process.emit("SIGINT")
    });
}

const gracefulShutdown =(msg, callback) => {
    mongoose.connection.close( () => {
        console.log('Mongoose disconnected through ${msg}');
        callback();
    });
};

// For nodemon restars
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
    })
});
// For app termination
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
    })
});
// For Heroku app termination
process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app shutdown', () => {
    })
});

connect();

// bring in the Mongoose schema
require('./travlr');
require('./user')


