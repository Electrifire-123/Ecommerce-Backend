// const bodyParser = require('body-parser');
const express = require('express');
const helmet = require("helmet");
const cors = require('cors');
require('dotenv').config();
const app = express();


//middlewares
app.use(express.json())
app.use(helmet());   // helmet in our express framework and hide away sensitive information. like (X-Powered-By: Express).
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//set custom headers
app.use(function (req, res, next) {
    res.setHeader(
        "Access-Control-Allow-Headers", ["newrelic", "traceparent", "tracestate"]
    );
    return next();
});

app.use((req, res, next) => {
    console.log('User in session:', req.body);
    next();
});

//routers
const router = require('./routes/productRouter');
app.use('/api/v1/products', router)
// app.use('/api/v1/products', router)



app.use('/Images', express.static('./Images'))

const PORT = process.env.PORT || 7001

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})