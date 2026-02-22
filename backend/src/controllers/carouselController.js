import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

// @desc    Get all carousel items
// @route   GET /api/carousel
// @access  Public
export const getCarousels = async (req, res) => {
    try {
        const carousels = await prisma.carousel.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        res.json(carousels);
    } catch (error) {
        console.error('Error fetching carousels:', error);
        res.status(500).json({ message: 'Server error fetching carousels' });
    }
};

// @desc    Get all carousel items for admin (including inactive)
// @route   GET /api/carousel/admin
// @access  Private (Admin)
export const getAdminCarousels = async (req, res) => {
    try {
        const carousels = await prisma.carousel.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(carousels);
    } catch (error) {
        console.error('Error fetching admin carousels:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a carousel item
// @route   POST /api/carousel
// @access  Private (Admin)
export const createCarousel = async (req, res) => {
    try {
        const { title, subtitle, description, link, cta, order, isActive } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const uploadDir = path.join('public', 'hero');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `hero-${Date.now()}.webp`;
        const filePath = path.join(uploadDir, fileName);

        await sharp(req.file.buffer)
            .resize(1920, 1080, { fit: 'cover' })
            .toFormat('webp')
            .toFile(filePath);

        const imageUrl = `/hero/${fileName}`;

        const carousel = await prisma.carousel.create({
            data: {
                title,
                subtitle,
                description,
                imageUrl,
                link,
                cta,
                order: order ? parseInt(order) : 0,
                isActive: isActive === 'true' || isActive === true
            }
        });

        res.status(201).json(carousel);
    } catch (error) {
        console.error('Error creating carousel:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a carousel item
// @route   PUT /api/carousel/:id
// @access  Private (Admin)
export const updateCarousel = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, description, link, cta, order, isActive } = req.body;

        const existing = await prisma.carousel.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Carousel not found' });
        }

        let imageUrl = existing.imageUrl;

        if (req.file) {
            const uploadDir = path.join('public', 'hero');
            const fileName = `hero-${Date.now()}.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(req.file.buffer)
                .resize(1920, 1080, { fit: 'cover' })
                .toFormat('webp')
                .toFile(filePath);

            imageUrl = `/hero/${fileName}`;
            
            // Optionally delete old file
            const oldPath = path.join('public', existing.imageUrl);
            if (fs.existsSync(oldPath) && !existing.imageUrl.startsWith('http')) {
                fs.unlinkSync(oldPath);
            }
        }

        const carousel = await prisma.carousel.update({
            where: { id },
            data: {
                title: title !== undefined ? title : existing.title,
                subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
                description: description !== undefined ? description : existing.description,
                imageUrl,
                link: link !== undefined ? link : existing.link,
                cta: cta !== undefined ? cta : existing.cta,
                order: order !== undefined ? parseInt(order) : existing.order,
                isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.isActive
            }
        });

        res.json(carousel);
    } catch (error) {
        console.error('Error updating carousel:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a carousel item
// @route   DELETE /api/carousel/:id
// @access  Private (Admin)
export const deleteCarousel = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.carousel.findUnique({ where: { id } });
        
        if (!existing) {
            return res.status(404).json({ message: 'Carousel not found' });
        }

        // Delete image file
        const filePath = path.join('public', existing.imageUrl);
        if (fs.existsSync(filePath) && !existing.imageUrl.startsWith('http')) {
            fs.unlinkSync(filePath);
        }

        await prisma.carousel.delete({ where: { id } });
        res.json({ message: 'Carousel deleted' });
    } catch (error) {
        console.error('Error deleting carousel:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
