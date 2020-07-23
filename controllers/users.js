const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const user = require('../models/user');
const BadRequest = require('../errors/bad-req-err');

const { JWT_SECRET, NODE_ENV } = process.env;
const NotFoundError = require('../errors/not-found-err');

module.exports.getUsers = (req, res, next) => {
  user
    .find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body; // eslint-disable-line
  if (!password || password.length < 8) {
    throw new BadRequest('Нужно задать пароль. Длина пароля не менее 8 символов.');
  }
  return bcrypt
    .hash(password, 10)
    .then((hash) => {
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
            next(new BadRequest('Пользователь с таким E-mail уже есть'));
          }
        });
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    throw new BadRequest('Некорректный ID');
  }
  user
    .findById(req.params.userId)
    .orFail(new NotFoundError('Нет пользователя с таким id'))
    .then((userr) => {
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
        const token = jwt.sign({ _id: userObj._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
        res.send({ token });
      })
      .catch(next);
  }
  return res.status(400).send({ message: 'Необходимо ввести пароль' });
};
