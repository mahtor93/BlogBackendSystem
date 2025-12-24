import e from "express";
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

export async function addPostMedia(req, res) {
    try{
        const postId = parseInt(req.params.id);
        const userId = req.user.id;
        const { mediaUrl } = req.body;

        if(!mediaUrl){
            return res.status(400).json({ message: "Media URL is required" });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });

        if(!post || post.authorId !== userId){
            return res.status(403).json({ message: "Forbidden" });
        }


        const headerCount = mediaUrl.filter(m=> m.isHeader).length;
        if(headerCount > 1){
            return res.status(400).json({ message: "Only one header media allowed" });
        }

        const newMedia = await prisma.mediaUrl.createMany({
            data: mediaUrl.map(m=>({
                postId,
                type:m.type,
                url: m.url,
                position: m.position ?? null,
                isHeader: m.isHeader ?? false
            }))
        });

        res.status(201).json({ message: "Media added successfully" });

    }catch (error) {
        console.error("Add Post Media Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

export async function addPostTags(req, res) {
    try{
        const postId = req.params.id;
        const userId = req.user.id;
        const { tags } = req.body;

        if(!Array.isArray(tags) || tags.length === 0){
            return res.status(400).json({ message: "Tags are required" });
        }

        const normalizedTags = [...new Set(
            tags.map(t=> t.trim().toLowerCase())
        )];

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });

        if(!post || post.authorId !== userId){
            return res.status(403).json({ message: "Forbidden" });
        }

        const createdTags= [];

    }catch (error) {
        console.error("Add Post Tags Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}