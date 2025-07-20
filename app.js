const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path')

const items = require('./routes/item')
const users = require('./routes/user')
const order = require('./routes/order')
const review = require('./routes/review')
const reviewRoutes = require('./routes/review');
const chartRoutes = require('./routes/chart');

app.use(cors())
app.use(express.json())
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(express.static(path.join(__dirname, '/cup-jquery')));
app.use('/api/v1', reviewRoutes);

app.use('/api/v1/orders', order);
app.use('/api/v1', chartRoutes);
app.use('/api/v1/', items);
app.use('/api/v1', users);
app.use('/api/v1', order);
app.use('/api/v1', review);
module.exports = app