const mongoose = require('mongoose');
const card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');

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
        res.status(400).send({ message: err });
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    return res.status(400).send({ message: 'Некорректный ID' });
  }
  return card
    .findById(req.params.cardId)
    .then((thisCard) => {
      if (!thisCard) {
        throw new NotFoundError('У Вас нет такой карточки');
      }
      if (!(thisCard.owner.toString() === req.user._id)) {
        return res.status(403).send({ message: 'Сожалеем, но удалять можно только свои карточки.' });
      }
      res.send({ data: thisCard, message: 'Карточка удалена' });
      return card.findByIdAndDelete(card._id);
    })
    .catch(next);
};
