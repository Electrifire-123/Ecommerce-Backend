const db = require('../models')

const Review = db.reviews

//1. Add Review

const addReview = async (req, res) => {
    try {
        const id = req.params.id;

        let data = {
            product_id: id,
            rating: req.body.rating,
            description: req.body.description
        };

        const review = await Review.create(data);
        res.status(200).send(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: 'Internal Server Error'
        });
    }
};


// 2. Get All Reviews

const getAllReviews = async (req, res) => {

    const reviews = await Review.findAll({})
    res.status(200).send(reviews)

}

module.exports = {
    addReview,
    getAllReviews
}