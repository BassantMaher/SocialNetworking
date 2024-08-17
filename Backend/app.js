const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');

const URI = 'mongodb+srv://bassantmaher:bassantmaher@learnmongodb.ecnkz3s.mongodb.net/socialNetwork';

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

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});

mongoose.connect(URI)
.then(result => {
    app.listen(8080);
})
.catch(err => console.log(err));

