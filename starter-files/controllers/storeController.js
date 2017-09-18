const mongoose = require('mongoose');
const Store = mongoose.model('Store')

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add store'})
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body).save());
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`)
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // query DB for list of all stores
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores})
}