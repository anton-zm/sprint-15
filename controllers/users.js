const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const key = require('../jwtconfig');
const NotFoundError = require('./errors/not-found-err');

module.exports.getUsers = (req, res, next) => {
  user
    .find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body; // eslint-disable-line
  if (!password || password.length < 4) {
    return res.status(400).send({ message: 'Нужно задать пароль. Длина пароля не менее 4 символов.' });
  }
  return bcrypt.hash(password, 10).then((hash) => {
    user
      .create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
      .then((users) => res.send({ data: { name: users.name, about: users.about, avatar: users.avatar, email: users.email } })) // eslint-disable-line
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(400).send({ message: err });
        } else {
          next(err);
        }
      });
  });
};

module.exports.getUser = (req, res, next) => {
  user
    .findById(req.params.userId)
    .then((userr) => {
      if (!userr) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send(userr);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (password) {
    return user
      .findUserByCredentials(email, password)
      .then((userObj) => {
        const token = jwt.sign({ _id: userObj._id }, key, { expiresIn: '7d' });
        res.send({ token });
      })
      .catch(next);
  }
  return res.status(400).send({ message: 'Необходимо ввести пароль' });
};
