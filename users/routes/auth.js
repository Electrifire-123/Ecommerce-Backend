const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { createTokens } = require('../tokensFunc/createToken');
const { signUpValidation, loginValidation } = require('../validation');
const { validateToken } = require('../authMiddleware');
const { authenticateToken, ipAccessMiddleware } = require('../authMiddleware')

const axios = require('axios')

router.post('/signup',ipAccessMiddleware, async (req, res) => {
    console.log(req.headers)
    try {
        const { error } = signUpValidation(req.body);
        if (error) return res.status(400).json({
            error: true,
            message: error.details[0].message,
            status: false
        });

        const emailExist = await User.findOne({ where: { email: req.body.email } });
        if (emailExist) return res.status(400).send({
            message: "This Email Id already exists",
            status: false
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            contactNo: req.body.contactNo || " ",
        });

        res.status(201).send({
            message: "Success!",
            status: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: err.message,
            status: false
        });
    }
});

router.post('/login',ipAccessMiddleware, async (req, res) => {
    console.log(req.headers)
    try {
        const { error } = loginValidation(req.body);
        if (error) return res.status(400).send({
            message: error.details[0].message,
            status: false
        });

        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) return res.status(400).send({
            message: "email id does not exist",
            status: false
        });

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(500).send({
            message: "Invalid credentials",
            status: false
        });

        const { accessToken, refreshToken } = await createTokens(user);

        res.status(200).json({
            accessToken,
            refreshToken,
            message: "Logged in successfully",
            status: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: err.message,
            status: false
        });
    }
});

router.post('/validate-token', validateToken);


// userid is present or not in db
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findByPk(userId);

        if (user) {
            return res.status(200).json({
                user,
                status: true
            })
        } else {
            res.status(404).json({
                message: "User not found",
                status: false
            })
        }

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
})

router.get('/user/details', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }
        const userDetails = {
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            contactNo: user.contactNo
        };

        res.status(200).json({ userDetails, status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', status: false });
    }
});

router.put('/update-user/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;
    const updatedData = req.body;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.update(updatedData);
        res.status(200).json({ message: "Updated your details successfully!", status: true })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", status: false })
    }
})

module.exports = router;
