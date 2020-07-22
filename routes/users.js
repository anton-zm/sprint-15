const usersRouter = require('express').Router();

const { getUsers, getUser } = require('../controllers/users');

usersRouter.get('/', getUsers);

usersRouter.get('/:userId', getUser);

module.exports = usersRouter;
