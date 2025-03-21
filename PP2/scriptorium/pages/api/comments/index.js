import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "../../../utils/account/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { blogPostId, sortBy } = req.query;
  
      if (!blogPostId || isNaN(parseInt(blogPostId))) {
        return res.status(400).json({ error: "Invalid or missing blogPostId" });
      }
  
      const parsedBlogPostId = parseInt(blogPostId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Fetch top-level comments with pagination
      const comments = await prisma.comment.findMany({
        where: {
          blogPostId: parsedBlogPostId,
          parentId: null,
          hidden: false // Fetch only top-level comments
        },
        orderBy:
          sortBy === "ratinghigh"
            ? { ratingScore: "desc" } // Highest to lowest rating
            : sortBy === "ratingLow"
            ? { ratingScore: "asc" } // Lowest to highest rating
            : { createdAt: "desc" }, // Default: Newest to oldest
        include: {
          author: {
            select: {
              username: true, // Include author's username
            },
          },
          replies: {
            orderBy: { createdAt: "desc" }, // Replies ordered by newest
            include: {
              author: {
                select: {
                  username: true, // Include reply author's username
                },
              },
              replies: {
                // Fetch nested replies recursively
                orderBy: { createdAt: "desc" },
                include: {
                  author: {
                    select: {
                      username: true, // Include nested reply author's username
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limit,
      });

      // Count total top-level comments for pagination metadata
      const totalComments = await prisma.comment.count({
        where: {
          blogPostId: parsedBlogPostId,
          parentId: null, // Only top-level comments
        },
      });
      
  
      // Return comments with metadata
      return res.status(200).json({
        comments,
        pagination: {
          total: totalComments,
          page,
          limit,
          totalPages: Math.ceil(totalComments / limit),
        },
      });
    } else if (req.method === "POST") {
      console.log("POST Request Body:", req.body);
      const authHeader = req.headers.authorization;
      const user = verifyAccessToken(authHeader);

      if (!user) {
        return res
          .status(401)
          .json({ error: "Please log in to post a comment" });
      }

      const { content, blogId, parentId } = req.body;

      if (!content || typeof content !== "string" || content.trim() === "") {
        return res.status(400).json({ error: "Content cannot be empty" });
      }

      // Validate `authorId`
      const authorExists = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (!authorExists) {
        return res.status(400).json({ error: "Author does not exist." });
      }

      // Validate `blogPostId`
      const blogPostExists = await prisma.blogPost.findUnique({
        where: { id: parseInt(blogId) },
      });
      if (!blogPostExists) {
        return res.status(400).json({ error: "Blog post does not exist." });
      }

      // Validate `parentId` (if provided)
      if (parentId) {
        const parentCommentExists = await prisma.comment.findUnique({
          where: { id: parseInt(parentId) },
        });
        if (!parentCommentExists) {
          return res
            .status(400)
            .json({ error: "Parent comment does not exist." });
        }
      }

      // when you create the comment -> check if you can send the username when creating one to fix the submit issue?
      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          authorId: user.id,
          blogPostId: parseInt(blogId),
          parentId: parentId ? parseInt(parentId) : null,
        },
        include: {
          author: {
            select: {
              username: true,
            },
          },
        },
      });
      console.log(comment);
      return res.status(201).json(comment);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
