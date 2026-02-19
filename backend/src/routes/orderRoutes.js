import express from 'express';
import { createOrder, getOrderDetails, getMyOrders, getShopOrders, updateOrderStatus, confirmPayment, receiveOrder } from '../controllers/orderController.js';

const router = express.Router();

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Anda harus login untuk melakukan transaksi' });
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post('/', isAuthenticated, createOrder);

// @desc    Get current user's order history
// @route   GET /api/orders/my
// @access  Private
router.get('/my', isAuthenticated, getMyOrders);

// @desc    Get orders for merchant's shop
// @route   GET /api/orders/shop
// @access  Private (Seller only)
router.get('/shop', isAuthenticated, getShopOrders);

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', isAuthenticated, getOrderDetails);

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Seller only)
router.patch('/:id/status', isAuthenticated, updateOrderStatus);

// @desc    Confirm payment (User)
// @route   PATCH /api/orders/:id/pay
// @access  Private (Owner only)
router.patch('/:id/pay', isAuthenticated, confirmPayment); // Need to import this

// @desc    Confirm order received (User)
// @route   PATCH /api/orders/:id/receive
// @access  Private (Owner only)
router.patch('/:id/receive', isAuthenticated, receiveOrder); // Need to import this

export default router;
