const express = require('express');
const helmet = require("helmet");
const port = process.env.PORT || 8000;
const dotenv = require('dotenv').config();
const cors = require('cors');
const sequelize = require('./config');

// import routes
const authRoutes = require('./routes/auth');
const refreshTokenRoutes = require('./routes/refreshToken');

// create an express app
const app = express();
app.use(helmet());   // helmet in our express framework and hide away sensitive information. like (X-Powered-By: Express).

app.use(cors());

//set custom headers
app.use(function (req, res, next) {
    res.setHeader(
        "Access-Control-Allow-Headers", ["newrelic", "traceparent", "tracestate"]
    );
    return next();
});

sequelize.sync()
    .then(() => console.log('Connected to the database!'))
    .catch((error) => console.error('Error connecting to the database:', error));

app.use(express.json());
app.use('/api/v1', authRoutes);
app.use('/api/v1', refreshTokenRoutes);

// listen to the port 
app.listen(port, (error) => {
    if (error) {
        console.log(`Problem in running the server, ${error}`)
    }

    console.log(`Server is listening on port : ${port}`)
})