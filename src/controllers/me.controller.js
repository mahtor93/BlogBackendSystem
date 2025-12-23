import bcrypt from 'bcrypt';
import prisma from '../config/database.js';


export async function getMe(req, res) {
    return res.json(req.user);
}

export async function updateMe(req, res) {
    try {
        const { name, email, bio } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name,
                email,
                bio
            }
        });
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

export async function updatePassword(req, res) {
    try{
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const valid = await bcrypt.compare(currentPassword, user.password);
        if(!valid){
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashed }
        });
        res.json({ message: 'Password updated successfully.' });
    }catch(error){
        console.error('Update Password Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}