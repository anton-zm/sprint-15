const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const AuthError = require('../errors/auth-err');

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'Нужно ввести ссылку, а не вот это вот всё..',
    },
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Неверный адрес почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

usersSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthError('Нет пользователя с таким Email'));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new AuthError('Неправильный пароль'));
        }
        return user;
      });
    });
};

usersSchema.plugin(uniqueValidator, { message: 'Пользователь с таким E-Mail уже есть.' });
module.exports = mongoose.model('user', usersSchema);
