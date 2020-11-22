const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;
//listens to 5000 on local (if env variable is not defined)
app.get('/', (req, res) => {
  res.send('API Running');
});
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
