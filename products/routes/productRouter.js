const express = require('express');
const router = express.Router();
// const passport = require('passport');


const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewControllers')
const categoryController = require('../controllers/categoryController')
const authenticateMiddleware = require('../middleware');
//////////////////////////////////////////////////////////////////////

// GET /allProducts
router.route('/').get(authenticateMiddleware, productController.getAllProducts);

// GET /:id
router.route('/get-one-product/:id').get(authenticateMiddleware, productController.getOneProduct);
//////////////////////////////////////////////////////////////////////////////////////

// POST /addProduct
router.route('/add-product/:id').post(authenticateMiddleware, productController.upload, productController.addProduct);

// GET /published
router.route('/published').get(authenticateMiddleware, productController.getPublishedProduct);

// PUT /:id (to Updated)
router.route('/update-one/:id').put(authenticateMiddleware, productController.updateProduct);

// DELETE /:id
router.route('/delete-one/:id').delete(authenticateMiddleware, productController.deleteProduct);

// Category routes
router.route('/add-category').post(authenticateMiddleware, categoryController.addCategory);
router.route('/all-categories').get(authenticateMiddleware,categoryController.getAllCategories);
router.route('/update-category-one/:id').put(authenticateMiddleware, categoryController.updateCategory);


// GET /getProductReviews/:id
router.route('/get-product-reviews/:id').get(authenticateMiddleware, productController.getProductReviews);
router.route('/categories/:id').get(authenticateMiddleware, productController.getCategoryProduct);


router.route('/add-review/:id').post(authenticateMiddleware, reviewController.addReview)
router.route('/all-reviews').get(authenticateMiddleware, reviewController.getAllReviews)


// product-id is present or not in db
router.route('/check/:productId').get(productController.getProductById);

module.exports = router;
