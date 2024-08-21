const express = require('express');
const bodyParser = require('body-parser');
// const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const helmet = require('helmet');
// const compression = require('compression');
// const morgan = require('morgan');


if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const { Stream } = require('stream');

const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@learnmongodb.ecnkz3s.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;



const app = express();
 
const filestorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        const fileExt = "." + file.mimetype.substring(file.mimetype.indexOf("/")+1);
        cb(null, uuidv4() + fileExt)
    }
});

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg'
    ){
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json()); //parsing for json
app.use(multer({ storage: filestorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use(cors());

app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(helmet());
// app.use(compression());
// app.use(morgan('combined', {Stream: accessLogStream}));

// console.log(accessLogStream);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message });
});



// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Authorization, X-Requested-With,socket.io"
//     );
//     next();
//   });

mongoose.connect(URI)
.then(result => {
    const server = app.listen(process.env.PORT || 3030); // we use http server
    const io = require('./socket').init(server);
     io.on("connection", (socket) => {
        console.log("client connected");
     });
})
.catch(err => console.log(err));
