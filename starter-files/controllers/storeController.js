const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid')

const multerOptions = {
  // where will the file be stored
  // what type of files are allowed
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true)
    } else {
      next({ message: 'That file type is not allowed.'}, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add store'})
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there's no new file to resize
  if (!req.file) {
    next(); // skip to next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`;

  // now resize
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`)
  // once we have written the photo to the file system keep going
  next();
}

exports.createStore = async (req, res) => {
  // 
  const store = await (new Store(req.body).save());
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`)
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // query DB for list of all stores
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores})
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug })
  if (!store) return next();
  res.render('store', { title: `${store.name}`, store})
}

exports.getStoresByTag = async (req, res, next) => {
  const tag = req.params.tag
  const tagQuery = tag || { $exists: true }; // either search for that tag or that store has a tag
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise])
  res.render('tag', { tags, title: 'Tags', tag, stores });
}

exports.editStore = async  (req, res) => {
  // find store with given id
  const store = await Store.findOne({ _id: req.params.id })
  // confirm the user is the owner of the store
  // render out the edit form so user can update the store
  res.render('editStore', {title: `Edit ${store.name}`, store})
}

exports.updateStore = async (req, res) => {
  // set location data to be a point
  if (req.body.location) {
    req.body.location.type = 'Point';
  }
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store._id}/edit`);
}