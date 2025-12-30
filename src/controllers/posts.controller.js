import prisma from "../config/database.js";

// CREATE //

export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        status: "DRAFT",
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

// UPDATE //
export async function updatePostStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const allowedStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid post status" });
    }

    const post = await prisma.post.findFirst({
      where: {
        id: id,
        authorId: userId,
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    const now = new Date();
    if (status === "PUBLISHED" && post.status !== "PUBLISHED") {
      post.publishedAt = now;
    } else if (status !== "PUBLISHED") {
      post.publishedAt = null;
    }

    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: { status, publishedAt: post.publishedAt },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error("Update Post Status Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
} 
export async function updatePostMedia(req, res) {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;
    const { media } = req.body;

    if (!Array.isArray(media)) {
      return res.status(400).json({ message: "Media array is required" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowedTypes = ["IMAGE", "VIDEO", "GIF"];
    const headerCount = media.filter(m => m.isHeader === true).length;

    if (headerCount > 1) {
      return res.status(400).json({
        message: "Only one header media allowed",
      });
    }

    for (const m of media) {
      if (!allowedTypes.includes(m.type)) {
        return res.status(400).json({
          message: `Invalid media type: ${m.type}`,
        });
      }

      if (m.isHeader && m.type !== "IMAGE") {
        return res.status(400).json({
          message: "Header must be an image",
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.media.deleteMany({
        where: { postId },
      });

      if (media.length > 0) {
        await tx.media.createMany({
          data: media.map((m) => ({
            postId,
            type: m.type,
            url: m.url,
            position: m.position ?? null,
            isHeader: m.isHeader ?? false,
          })),
        });
      }
    });

    res.json({ message: "Post media updated successfully" });
  } catch (error) {
    console.error("Update Post Media Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
export async function updatePostTags(req, res) {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "Tags array is required" });
    }

    const normalizedTags = [
      ...new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean)),
    ];

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({
        where: { postId },
      });

      for (const name of normalizedTags) {
        const tag = await tx.tag.upsert({
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

        await tx.postTag.create({
          data: {
            postId,
            tagId: tag.id,
          },
        });
      }
    });

    res.json({
      message: "Post tags updated successfully",
      tags: normalizedTags,
    });
  } catch (error) {
    console.error("Update Post Tags Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
export async function updatePost(req, res) {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// GETS //
// Get Posts List for Authenticated User
export async function getPostList(req, res) {
  try {
    const userId = req.user.id;

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(posts);
  } catch (error) {
    console.error("Get Post List Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
} 
export async function getPublishedPostsByUser(req, res) {
  try {
    const { userId } = req.params;

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        publishedAt: true,
      },
      where: {
        authorId: userId,
        status: "PUBLISHED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(posts);
  } catch (error) {
    console.error("Get Published Posts Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getPostById(req, res) {
  try {
    const { id } = req.params;

    const post = await prisma.post.findFirst({
      where: {
        id,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        content: true,
        publishedAt: true,
        media: {
          orderBy: { position: "asc" },
        },
        tags: {
          select: {
            tag: {
              select: { name: true },
            },
          },
        },
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      ...post,
      tags: post.tags.map(t => t.tag.name),
    });
  } catch (error) {
    console.error("Get Post Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

