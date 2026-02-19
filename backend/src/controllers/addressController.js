import prisma from '../config/db.js';

export const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isMain: 'desc' } // Main address first
    });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { label, receiverName, phone, street, city, province, postalCode, isMain } = req.body;

    // If new address is set as main, unset other main addresses
    if (isMain) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isMain: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label,
        receiverName,
        phone,
        street,
        city,
        province,
        postalCode,
        isMain: isMain || false
      }
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, receiverName, phone, street, city, province, postalCode, isMain } = req.body;

    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress || existingAddress.userId !== req.user.id) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    if (isMain) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isMain: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        label,
        receiverName,
        phone,
        street,
        city,
        province,
        postalCode,
        isMain: isMain !== undefined ? isMain : existingAddress.isMain
      }
    });

    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress || existingAddress.userId !== req.user.id) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    await prisma.address.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
