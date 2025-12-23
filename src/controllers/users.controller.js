import prisma from "../config/database.js";

export async function getUserByName(req, res) {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        name: true,
        bio: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Get User By Name Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}


export async function getPostsByUserName(req, res) {
    try {
        const { username } = req.params;

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                username: true,
                name: true,
                bio: true,
                posts: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        createdAt: true,
                        updatedAt: true,
                        media: {
                            where: { isHeader: true },
                            select: {
                                url: true,
                                type: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({
            user: {
                username: user.username,
                name: user.name,
                bio: user.bio
            },
            posts: user.posts
        });

    } catch (error) {
        console.error("Get Posts By User Name Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}
