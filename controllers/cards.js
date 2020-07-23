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

// module.exports.deleteCard = (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
//     throw new BadRequest('Некорректный ID');
//   }
//   return card
//     .findById(req.params.cardId)
//     .then((thisCard) => {
//       if (!thisCard) {
//         throw new NotFoundError('У Вас нет такой карточки');
//       }
//       if (!(thisCard.owner.toString() === req.user._id)) {
//         throw new RightsError('Сожалеем-c, но удалять можно только свои карточки.');
//       }
//       res.send({ data: thisCard, message: 'Карточка удалена' });
//       return card.findByIdAndDelete(card._id);
//     })
//     .catch(next);
// };

// module.exports.deleteCard = (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
//     throw new BadRequest('Некорректный ID');
//   }
//   return card
//     .findById(req.params.cardId)
//     .orFail(new NotFoundError('У Вас нет такой карточки'))
//     .then((thisCard) => {
//       if (!(thisCard.owner.toString() === req.user._id)) {
//         throw new RightsError('Сожалеем-c, но удалять можно только свои карточки.');
//       }
//       // res.send('ok');
//       return thisCard.findByIdAndDelete(card._id);
//     })
//     .catch(next);
// };

// module.exports.deleteCard = (req, res) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
//     return res.status(400).send({ message: 'Некорректный ID' });
//   }
//   return card
//     .findById(req.params.cardId)
//     .orFail(() => new Error('У Вас нет такой карточки.'))
//     .then((thisCard) => {
//       if (!(thisCard.owner.toString() === req.user._id)) {
//         return res.status(403).send({ message: 'Сожалеем, но удалять можно только свои карточки.' });
//       }
//       return card
//         .findByIdAndDelete(card._id)
//         .then(res.send({ data: thisCard, message: 'Карточка удалена' }))
//         .catch((err) => res.status(404).send({ message: err.message }));
//     })
//     .catch((err) => res.status(404).send({ message: err.message }));
// };

// module.exports.deleteCard = (req, res) => {
//   if (mongoose.Types.ObjectId.isValid(req.params.cardId)) {
//     return card
//       .findById(req.params.cardId)
//       .orFail(() => new Error(`Карточка с _id ${req.params.cardId} не найдена`))
//       .then((Card) => {
//         if (Card.owner.toString() === req.user._id) {
//           return card
//             .findByIdAndDelete(Card._id)
//             .orFail(() => new Error('С удалением что-то пошло не так'))
//             .then((deletedCard) => res.send({ data: deletedCard, message: 'Карточка успешно удалена' }))
//             .catch((err) => res.status(404).send({ error: err.message }));
//         }
//         return res.status(403).send({ error: 'Вы не можете удалять чужие карточки' });
//       })
//       .catch((err) => res.status(404).send({ error: err.message }));
//   }
//   return res.status(400).send({ error: 'Неверный формат id карточки' });
// };

module.exports.deleteCard = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    throw new BadRequest('Некорректный ID');
  }
  return card
    .findById(req.params.cardId)
    .orFail(new NotFoundError('Карточка не найдена'))
    .then((Card) => {
      if (!(Card.owner.toString() === req.user._id)) {
        throw new RightsError('Вы не можете удалять чужие карточки');
      }
      return card
        .findByIdAndDelete(Card._id)
        .then((delCard) => res.send({ data: delCard, message: 'Карточка  удалена' }))
        .catch(next);
    })
    .catch(next);
};
