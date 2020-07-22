const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const key = require('../jwtconfig');

module.exports.getUsers = (req, res) => {
  user
    .find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Что-то пошло не так' }));
};

module.exports.createUser = (req, res) => {
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
          res.status(500).send({ message: err });
        }
      });
  });
};

module.exports.getUser = async (req, res) => {
  try {
    const userObj = await user.findById(req.params.userId).orFail(new Error('ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН'));
    return res.json({ userObj });
  } catch (err) {
    return res.status(404).send({ message: 'Пользователь не найден' });
  }
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  if (password) {
    return user
      .findUserByCredentials(email, password)
      .then((userObj) => {
        const token = jwt.sign({ _id: userObj._id }, key, { expiresIn: '7d' });
        res.send({ token });
      })
      .catch((err) => {
        res.status(401).send({ message: err.message });
      });
  }
  return res.status(400).send({ message: 'Необходимо ввести пароль' });
};
