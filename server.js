const express = require('express');
const connectDB = require('./config/db');
const app = express();

//connect Database

connectDB();

app.get('/', (req, res) => {
  res.send('API Running');
});

//define Routes

app.use('/users', require('./routes/api/users'));
app.use('/auth', require('./routes/api/auth'));
app.use('/profile', require('./routes/api/profile'));
app.use('/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
