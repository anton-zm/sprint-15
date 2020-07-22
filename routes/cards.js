const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCards, createCard, deleteCard } = require('../controllers/cards');

cardsRouter.get('/', getCards);
cardsRouter.post(
  '/',
  celebrate({
    body: Joi.object()
      .keys({
        name: Joi.string().required().min(2).max(30),
        link: Joi.string().required(),
      })
      .unknown(true),
  }),
  createCard // eslint-disable-line
);
cardsRouter.delete('/:cardId', deleteCard);

module.exports = cardsRouter;
