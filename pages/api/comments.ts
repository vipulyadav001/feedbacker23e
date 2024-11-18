import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const commentsFile = path.join(process.cwd(), 'data/comments.json');

// Helper to read comments
const readComments = () => {
  try {
    if (!fs.existsSync(commentsFile)) {
      fs.writeFileSync(commentsFile, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(commentsFile, 'utf8');
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing comments:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error reading comments:', error);
    return [];
  }
};

// Helper to write comments
const writeComments = (comments: any[]) => {
  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set JSON content type header
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'POST') {
    const { text, parentId } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comments = readComments();

    // If parentId is provided, add as a reply
    if (parentId) {
      const parentComment = comments.find(c => c.id === parentId);
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }

      const reply = {
        id: Date.now(),
        text,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      parentComment.replies = parentComment.replies || [];
      parentComment.replies.push(reply);
      writeComments(comments);
      return res.status(201).json(parentComment);
    }

    // Otherwise create a new top-level comment
    const newComment = {
      id: Date.now(),
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
      potentialRating: Math.floor(Math.random() * 100) + 1,
      userEmail: req.body.userEmail || null
    };

    comments.unshift(newComment);
    writeComments(comments);
    return res.status(201).json(newComment);
  }

  if (req.method === 'GET') {
    const comments = readComments();
    return res.status(200).json(comments);
  }

  if (req.method === 'PUT' && req.query.action === 'like') {
    const { id, unlike } = req.body;
    const comments = readComments();
    const comment = comments.find(c => c.id === id);
    if (comment) {
      comment.likes = (comment.likes || 0) + (unlike ? -1 : 1);
      writeComments(comments);
      return res.status(200).json(comment);
    }
    return res.status(404).json({ error: 'Comment not found' });
  }

  if (req.method === 'POST' && req.query.action === 'reply') {
    const { parentId, text } = req.body;
    const comments = readComments();
    const parentComment = comments.find(c => c.id === parentId);
    
    if (!parentComment) {
      return res.status(404).json({ error: 'Parent comment not found' });
    }

    const reply = {
      id: Date.now(),
      text,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    // Initialize replies array if it doesn't exist
    if (!parentComment.replies) {
      parentComment.replies = [];
    }
    
    parentComment.replies.push(reply);
    writeComments(comments);
    
    return res.status(201).json(reply);
  }

  if (req.method === 'DELETE') {
    try {
      // Handle reply deletion first
      if (req.query.action === 'deleteReply') {
        const parentId = Number(req.query.parentId);
        const replyId = Number(req.query.replyId);
 
        if (isNaN(parentId) || isNaN(replyId)) {
          return res.status(400).json({ error: 'Invalid parentId or replyId' });
        }

        const comments = readComments();
        const parentComment = comments.find(c => c.id === parentId);

        if (!parentComment) {
          return res.status(404).json({ error: 'Parent comment not found' });
        }

        if (!parentComment.replies) {
          return res.status(404).json({ error: 'Replies not found' });
        }
 
        const replyIndex = parentComment.replies.findIndex(r => r.id === replyId);
        if (replyIndex === -1) {
         return res.status(404).json({ error: 'Reply not found' });
        }

        parentComment.replies.splice(replyIndex, 1);
        writeComments(comments);

        return res.status(200).json({ success: true });
      }
    

      // Handle general comment deletion
      const { id } = req.query;
      const comments = readComments();
      const commentIndex = comments.findIndex(c => c.id === Number(id));

      if (commentIndex === -1) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      comments.splice(commentIndex, 1);
      writeComments(comments);
      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('Delete reply error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }


  if (req.method === 'PUT' && req.query.action === 'likeReply') {
    const { parentId, replyId } = req.query;
    const { unlike } = req.body;
    const comments = readComments();
    const parentComment = comments.find(c => c.id === Number(parentId));
    
    if (!parentComment || !parentComment.replies) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = parentComment.replies.find(r => r.id === Number(replyId));
    if (reply) {
      reply.likes = (reply.likes || 0) + (unlike ? -1 : 1);
      writeComments(comments);
      return res.status(200).json(parentComment);
    }
    return res.status(404).json({ error: 'Reply not found' });
  }



  return res.status(405).json({ error: 'Method not allowed' });
}
