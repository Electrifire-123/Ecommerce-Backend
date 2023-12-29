const Order = require('../models/Order');
const axios = require('axios')
const env = require('dotenv').config()


const getOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'userId is required for fetching orders',
      });
    }

    const userResponse = await axios.get(`${process.env.USER_RESPONSE}/api/v1/${userId}`);

    if (!userResponse.data) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const orders = await Order.findAll({ where: { userId } });

    const ordersWithProductDetails = await Promise.all(
      orders.map(async (order) => {
        const products = order.products;

        try {
          const parsedProducts = JSON.parse(products);

          if (!Array.isArray(parsedProducts)) {
            console.error('Invalid products array:', parsedProducts);
            return null;
          }

          const productsWithDetails = await Promise.all(
            parsedProducts.map(async (product) => {
              try {
                const productResponse = await axios.get(
                  `${process.env.PRODUCT_RESPONSE}/api/v1/products/check/${product.productId}`
                );

                if (productResponse.data) {
                  return {
                    productId: product.productId,
                    title: productResponse.data.title,
                    description: productResponse.data.description,
                    image: productResponse.data.image,
                    quantity: product.quantity,
                    price: productResponse.data.price
                  };
                } else {
                  return null;
                }
              } catch (error) {
                console.error('Error fetching product details:', error);
                return {
                  title: 'Product Not Found',
                  description: 'Product details could not be retrieved',
                  image: null,
                  quantity: product.quantity,
                  price: null,
                };
              }
            })
          );

          const validProductDetails = productsWithDetails.filter((product) => product !== null);

          return {
            orderId: order.id,
            userId: order.userId,
            address: order.address,
            contactNo: order.contactNo,
            amount: order.price,
            date: order.date,
            products: validProductDetails,
          };
        } catch (parseError) {
          console.error('Error parsing products field:', parseError);
          return null;
        }
      })
    );

    return res.status(200).json(ordersWithProductDetails.filter((order) => order !== null));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};


// const createOrders = async (req, res) => {
//   try {
//     const { userId, products, address, contactNo } = req.body;

//     const userResponse = await axios.get(`${process.env.USER_RESPONSE}/api/v1/${userId}`);
//     if (!userResponse.data) {
//       return res.status(400).json({
//         message: 'Invalid user',
//         status: false,
//       });
//     }

//     const productValidationPromises = products.map(async (product) => {
//       const productResponse = await axios.get(`${process.env.PRODUCT_RESPONSE}/api/v1/products/check/${product.productId}`);
//       return productResponse.data ? null : product.productId;
//     });

//     const invalidProducts = (await Promise.all(productValidationPromises)).filter(Boolean);
//     if (invalidProducts.length > 0) {
//       return res.status(400).json({
//         message: `Invalid products: ${invalidProducts.join(', ')}`,
//         status: false,
//       });
//     }

//     const amountPromises = products.map(async (product) => {
//       try {
//         const productResponse = await axios.get(`${process.env.PRODUCT_RESPONSE}/api/v1/products/check/${product.productId}`);

//         if (productResponse.data) {
//           const productAmount = productResponse.data.price * product.quantity;
//           return productAmount;
//         } else {
//           return null;
//         }
//       } catch (error) {
//         console.error('Error fetching product amount:', error);
//         return null;
//       }
//     });

//     const productAmounts = await Promise.all(amountPromises);

//     if (productAmounts.includes(null)) {
//       return res.status(500).json({
//         message: 'Error fetching product amounts',
//         status: false,
//       });
//     }

//     const totalAmount = productAmounts.reduce((total, productAmount) => total + productAmount, 0);

//     const order = await Order.create({
//       userId,
//       products: JSON.stringify(products),
//       address,
//       contactNo,
//       amount: totalAmount,
//     });


//     await axios.post(`${process.env.EMPTY_CART}/api/v1/delete-all-cart`,{userId});

//     res.status(201).json({
//       order,
//       message: "Your Order Has Been Placed"
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Internal Server Error',
//       error,
//     });
//   }
// };

const createOrders = async (req, res) => {
  try {
      const { userId, products, address, contactNo } = req.body;

      const userResponse = await axios.get(`${process.env.USER_RESPONSE}/api/v1/${userId}`);
      if (!userResponse.data) {
          return res.status(400).json({
              message: 'Invalid user',
              status: false,
          });
      }

      const productValidationPromises = products.map(async (product) => {
          const productResponse = await axios.get(`${process.env.PRODUCT_RESPONSE}/api/v1/products/check/${product.productId}`);
          return productResponse.data ? null : product.productId;
      });

      const invalidProducts = (await Promise.all(productValidationPromises)).filter(Boolean);
      if (invalidProducts.length > 0) {
          return res.status(400).json({
              message: `Invalid products: ${invalidProducts.join(', ')}`,
              status: false,
          });
      }

      const amountPromises = products.map(async (product) => {
          try {
              const productResponse = await axios.get(`${process.env.PRODUCT_RESPONSE}/api/v1/products/check/${product.productId}`);

              if (productResponse.data) {
                  const productAmount = productResponse.data.price * product.quantity;
                  return productAmount;
              } else {
                  return null;
              }
          } catch (error) {
              console.error('Error fetching product amount:', error);
              return null;
          }
      });

      const productAmounts = await Promise.all(amountPromises);

      if (productAmounts.includes(null)) {
          return res.status(500).json({
              message: 'Error fetching product amounts',
              status: false,
          });
      }

      const totalAmount = productAmounts.reduce((total, productAmount) => total + productAmount, 0);

      const order = await Order.create({
          userId,
          products,
          address,
          contactNo,
          amount: totalAmount,
      });

      await axios.post(`${process.env.EMPTY_CART}/api/v1/delete-all-cart`, { userId });

      res.status(201).json({
          order: {
              id: order.id,
              userId: order.userId,
              address: order.address,
              contactNo: order.contactNo,
              amount: order.amount,
              date: order.date,
              products: order.products,
          },
          message: "Your Order Has Been Placed"
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: 'Internal Server Error',
          error,
      });
  }
};

module.exports = { getOrders, createOrders };