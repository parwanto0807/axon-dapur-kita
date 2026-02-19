import prisma from '../config/db.js';

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, whatsapp, gender, dateOfBirth, address } = req.body;
    let updateData = {
      name,
      whatsapp,
      gender,
      address,
      dateOfBirth: (dateOfBirth && dateOfBirth.trim() !== '') ? new Date(dateOfBirth) : null
    };

    if (req.file) {
      updateData.image = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};
