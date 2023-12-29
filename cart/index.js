const express = require('express');
const helmet = require("helmet");
const port = process.env.PORT || 8001;
const dotenv = require('dotenv').config();
const cors = require('cors');

const sequelize = require('./config');

// import routes
const cartRoutes = require('./routes/cart');
const app = express();

//set custom headers
app.use(function (req, res, next) {
    res.setHeader(
        "Access-Control-Allow-Headers", ["newrelic", "traceparent", "tracestate"]
    );
    return next();
});

app.use(helmet());   // helmet in our express framework and hide away sensitive information. like (X-Powered-By: Express).
app.use(cors());
app.use(express.json());

app.use('/api/v1', cartRoutes,);

sequelize.sync()
    .then(() => console.log("Connected to the database!"))
    .catch((error) => console.log(`Error in connecting to database: ${error}`))

app.listen(port, (err) => {
    if (err) {
        console.log(`Problem in running the server ${err}`)
    }

    console.log(`Server is running on port : ${port}`)
})