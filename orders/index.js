const express = require('express');
const helmet = require("helmet");
const port = process.env.PORT || 8002;
const sequelize = require('./config');
const cors = require('cors');

const orderRoutes = require('./routes/orders');

const app = express();

app.use(helmet());   // helmet in our express framework and hide away sensitive information. like (X-Powered-By: Express).
app.use(cors());
app.use(express.json());

//set custom headers
app.use(function (req, res, next) {
    res.setHeader(
        "Access-Control-Allow-Headers", ["newrelic", "traceparent", "tracestate"]
    );
    return next();
});

sequelize.sync()
    .then(() => console.log("Connected to database!"))
    .catch((error) => console.log(`Error in connecting to database ${error}`))

app.use('/api/v1/orders', orderRoutes);

app.listen(port, (error) => {
    if (error) {
        console.log(`Problem in running the server ${error}`)
    }
    console.log(`Server is running on port : ${port}`)
})