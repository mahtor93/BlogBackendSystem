import prisma from "../config/database.js";

export async function createPost(req, res){
    try{
        const { title, content } = req.body;
        const userId = req.user.id;

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                authorId: userId
            }
        });
        res.status(201).json(newPost);

    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

