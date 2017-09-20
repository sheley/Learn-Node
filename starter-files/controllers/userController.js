const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', {title: 'Login'});
}

exports.registerForm = (req, res) => {
  res.render('register', {title: 'register'});
}

// validate middleware
exports.validateRegister = (req, res, next) => {
  // expressValidator method. expressValidator adds all the methods to every request
  req.sanitizeBody('name')
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  next(); // there were no errors!
}

exports.register = async (req, res, next) => {
  const user = new User({email: req.body.email, name: req.body.name});

  // external lib's register doesn't return a promise
  // User.register(user, request.body.password, function(err, user) {});
  // so let's promisify it
  const register = promisify(User.register, User);
  // note, if you're passing a method to promisify that is on an object (ex: on the User model) then you have
  // to pass what to bind it to.

  await register(user, req.body.password);
  next(); // pass to authController.login
}