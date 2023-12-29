const Cart = require('../models/Cart');
const axios = require('axios');
const dotenv = require('dotenv').config()
 
const addToCart = async (req, res) => {
    console.log(req.headers.referer)
    try {
        const { userId, productId, quantity } = req.body;
 
        const parsedUserId = Number(userId);
        const parsedProductId = Number(productId);
        const parsedQuantity = Number(quantity);
 
        if (isNaN(parsedUserId) || isNaN(parsedProductId) || isNaN(parsedQuantity)) {
            return res.status(400).json({
                message: 'Invalid userId, productId, or quantity'
            });
        }
 
        const userResponse = await axios.get(`${process.env.USER_RESPONSE}/api/v1/${parsedUserId}`);
        const productResponse = await axios.get(`${process.env.PRODUCT_RESPONSE}/api/v1/products/check/${parsedProductId}`);
 
        const existingCartItem = await Cart.findOne({ where: { userId: parsedUserId, productId: parsedProductId } });
 
        if (existingCartItem) {
            const newQuantity = existingCartItem.quantity + parsedQuantity;
            await existingCartItem.update({ quantity: newQuantity });
 
            return res.status(200).json({
                cartItem: existingCartItem,
                message: `Quantity updated in the cart for product ${parsedProductId}`
            });
        }
 
        const newCartItem = await Cart.create({
            userId: parsedUserId,
            productId: parsedProductId,
            quantity: parsedQuantity,
        });
 
        res.status(201).json({
            cartItem: newCartItem,
            message: "Item Added To The Cart"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
 
const getCartItems = async (req, res) => {
    try {
        const { userId } = req.body;
 
        if (!userId) {
            return res.status(400).json({
                message: 'userId is required for fetching cart items'
            });
        }
 
        const userResponse = await axios.get(`${process.env.USER_RESPONSE}/api/v1/${userId}`);
 
        if (!userResponse.data) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
 
        const cartItems = await Cart.findAll({ where: { userId } });
 
        const cartItemsWithProductDetails = await Promise.all(
            cartItems.map(async (cartItem) => {
                const { productId, quantity } = cartItem;
 
                try {
                    const productResponse = await axios.get(`${process.env.PRODUCT_RESPONSE}/api/v1/products/check/${productId}`);
 
                    if (productResponse.data) {
                        const productDetails = {
                            productId: productId,
                            title: productResponse.data.title,
                            description: productResponse.data.description,
                            image: productResponse.data.image,
                            price: productResponse.data.price,
                            quantity: quantity,
                        };
 
                        return productDetails;
                    } else {
                        return null;
                    }
                } catch (error) {
                    console.error('Error fetching product details:', error);
                    return null;
                }
            })
        );
 
        const validCartItems = cartItemsWithProductDetails.filter((item) => item !== null);
 
        return res.status(200).json(validCartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
 
const deleteCartItem = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const userResponse = await axios.get(`${process.env.USER_RESPONSE}/api/v1/${userId}`);
 
        if (!userResponse.data) {
            return res.status(400).json({
                message: 'User not found'
            });
        }
 
        const existingCartItem = await Cart.findOne({ where: { userId, productId } });
 
        if (!existingCartItem) {
            return res.status(400).json({
                message: 'Product not found in the cart'
            });
        }
 
        await existingCartItem.destroy();
 
        return res.status(200).json({
            message: 'Product removed from the cart'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
 
 
 
 
const updateCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
 
        const userResponse = await axios.get(`${process.env.USER_RESPONSE}/api/v1/${userId}`);
        const productResponse = await axios.get(`${process.env.PRODUCT_RESPONSE}/api/v1/products/check/${productId}`);
 
        const existingCartItem = await Cart.findOne({ where: { userId, productId } });
 
        if (!existingCartItem) {
            return res.status(400).json({
                status: false,
                message: 'Product not found in the cart'
            });
        }
 
        if (Number(quantity) === 0) {
            await existingCartItem.destroy();
        } else {
            await existingCartItem.update({
                quantity: Number(quantity),
            });
        }
 
        return res.status(200).json({
            message: 'Cart item updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
 
 
 
const deleteAllCartItems = async (req, res) => {
    try {
        const { userId } = req.body;
 
        const userResponse = await axios.get(`${process.env.USER_RESPONSE}/api/v1/${userId}`);
 
        if (!userResponse.data) {
            return res.status(400).json({
                message: 'User not found',
            });
        }
 
        const deletedCount = await Cart.destroy({ where: { userId } });
 
        if (deletedCount > 0) {
            return res.status(200).json({
                message: 'All cart items removed',
            });
        } else {
            return res.status(400).json({
                message: 'Cart not found or there are no items to delete',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};
 
 
module.exports = {
    addToCart,
    deleteCartItem,
    getCartItems,
    updateCart,
    deleteAllCartItems
};