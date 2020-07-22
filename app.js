const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cardsRoute = require('./routes/cards');
const usersRoute = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.post('/api/signin', login);
app.post('/api/signup', createUser);

app.use(auth);

app.use('/api/cards', cardsRoute);
app.use('/api/users', usersRoute);

app.use('*', (req, res) => {
  res.status(404).send({
    message: 'Запрашиваемый ресурс не найден',
  });
});
/* eslint-disable*/
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
});

app.listen(PORT, () => {
  console.log(`Приложение запущено на port:${PORT}`);
});
