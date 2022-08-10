const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

//https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
app.use(cors());
app.options('*', cors());

require('dotenv/config')
const api = process.env.API_URL;

//Routers
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Database connection is ready');
    })
    .catch((err) => {
        console.log(err);
    })

//For development
/**app.listen(3000, () => {
    //console.log(api);
    console.log('server is running http://localhost:3000');
})**/

//For production

var server = app.listen(process.env.PORT || 3000, function(){

	var port = server.address().PORT;

	console.log('Running on' + port);

});