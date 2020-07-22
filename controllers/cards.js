const mongoose = require('mongoose');
const card = require('../models/card');

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

module.exports.deleteCard = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    return res.status(400).send({ message: 'Некорректный ID' });
  }
  return card
    .findById(req.params.cardId)
    .orFail(() => new Error('У Вас нет такой карточки.'))
    .then((thisCard) => {
      if (!(thisCard.owner.toString() === req.user._id)) {
        return res.status(403).send({ message: 'Сожалеем, но удалять можно только свои карточки.' });
      }
      return card
        .findByIdAndDelete(card._id)
        .then(res.send({ data: thisCard, message: 'Карточка удалена' }))
        .catch((err) => res.status(404).send({ message: err.message }));
    })
    .catch((err) => res.status(404).send({ message: err.message }));
};
