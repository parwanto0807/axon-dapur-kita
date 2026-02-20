import prisma from '../config/db.js';
import { sendPushNotification } from '../config/firebase.js';

/**
 * Get all notifications for the logged-in user (latest 30)
 */
export const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });

        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Gagal memuat notifikasi' });
    }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure the notification belongs to the user
        const notification = await prisma.notification.findFirst({
            where: { id, userId: req.user.id },
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        res.json(updated);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Gagal memperbarui notifikasi' });
    }
};

/**
 * Mark all notifications as read for the logged-in user
 */
export const markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });

        res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Gagal memperbarui notifikasi' });
    }
};

/**
 * Update FCM Token for the logged-in user
 */
export const updateFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        
        if (!fcmToken) {
            return res.status(400).json({ message: 'Token FCM tidak boleh kosong' });
        }

        await prisma.user.update({
            where: { id: req.user.id },
            data: { fcmToken }
        });

        res.json({ message: 'Token FCM berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating FCM Token:', error);
        res.status(500).json({ message: 'Gagal memperbarui Token FCM' });
    }
};

/**
 * Helper: Create a notification for a user (called internally from other controllers)
 */
export const createNotification = async ({ userId, title, body, type, link }) => {
    try {
        // 1. Create persistent notification in DB
        const notification = await prisma.notification.create({
            data: { userId, title, body, type, link: link || null },
        });

        // 2. Fetch user's FCM token
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { fcmToken: true }
        });

        // 3. Send Push Notification if token exists
        if (user?.fcmToken) {
            await sendPushNotification(user.fcmToken, title, body, { type, link: link || '' });
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
