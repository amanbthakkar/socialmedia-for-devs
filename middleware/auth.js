const jwt = require('jsonwebtoken');
const config = require('config');
const secret = config.get('jwtSecret');

//middleware function has access to req and response object
module.exports = function (req, res, next) {
  //Get token from header
  const token = req.header('x-auth-token');

  //Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied!' });
  }
  //Verify token if present
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user; //now middleware has req.user storing the whole user object
    //visit jwt website to view what the user looks like (it is just an object with one 'id' field right now - the payload)
    console.log(req.user);
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
