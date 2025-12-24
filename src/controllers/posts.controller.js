import prisma from "../config/database.js";

export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
export async function addPostMedia(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { media } = req.body;

    if (!Array.isArray(media) || media.length === 0) {
      return res.status(400).json({ message: "Media array is required." });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== userId) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const allowedTypes = ["IMAGE", "VIDEO", "GIF"];

    for (const m of media) {
      if (!allowedTypes.includes(m.type)) {
        return res.status(400).json({
          message: `Invalid media type: ${m.type}`,
        });
      }

      if (m.isHeader === true && m.type !== "IMAGE") {
        return res.status(400).json({
          message: "Header must be an image",
        });
      }

      if (typeof m.url !== "string" || !m.url.startsWith("https://")) {
        return res.status(400).json({
          message: "Invalid media URL",
        });
      }
    }

    const headerCount = media.filter((m) => m.isHeader === true).length;
    if (headerCount > 1) {
      return res
        .status(400)
        .json({ message: "Only one header media allowed." });
    }

    await prisma.media.createMany({
      data: media.map((m) => ({
        postId,
        type: m.type,
        url: m.url,
        position: m.position ?? null,
        isHeader: m.isHeader ?? false,
      })),
    });

    res.status(201).json({ message: "Media added successfully." });
  } catch (error) {
    console.error("Add Post Media Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
export async function addPostTags(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { tags } = req.body;

    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: "Tags are required" });
    }

    const normalizedTags = [
      ...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean)),
    ];

    if (normalizedTags.length === 0) {
      return res.status(400).json({ message: "No valid tags provided" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const createdTags = [];
    for (const name of normalizedTags) {
      const tag = await prisma.tag.upsert({
        where: {
          userId_name: {
            userId,
            name,
          },
        },
        update: {},
        create: {
          name,
          userId,
        },
      });

      createdTags.push(tag);

      await prisma.postTag.upsert({
        where: {
          postId_tagId: {
            postId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          postId,
          tagId: tag.id,
        },
      });
    }

    res.status(201).json({
      message: "Tags added successfully.",
      tags: createdTags.map((t) => t.name),
    });
  } catch (error) {
    console.error("Add Post Tags Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
