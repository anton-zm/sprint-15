const mongoose = require('mongoose');
const card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const BadRequest = require('../errors/bad-req-err');
const RightsError = require('../errors/right-err');

module.exports.getCards = (req, res, next) => {
  card
    .find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  card
    .create({ name, link, owner: req.user._id })
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Что-то пошло не так...');
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    throw new BadRequest('Некорректный ID');
  }
  return card
    .findById(req.params.cardId)
    .then((thisCard) => {
      if (!thisCard) {
        throw new NotFoundError('У Вас нет такой карточки');
      }
      if (!(thisCard.owner.toString() === req.user._id)) {
        throw new RightsError('Сожалеем-c, но удалять можно только свои карточки.');
      }
      res.send({ data: thisCard, message: 'Карточка удалена' });
      return card.findByIdAndDelete(card._id);
    })
    .catch(next);
};
