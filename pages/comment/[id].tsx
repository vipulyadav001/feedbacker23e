import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  likes: number;
  replies?: Array<{
    id: number;
    text: string;
    createdAt: string;
    likes: number;
  }>;
}

export default function CommentDetail() {
  const [comment, setComment] = useState<Comment | null>(null);
  const [reply, setReply] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchComment();
    }
  }, [id]);

  const fetchComment = async () => {
    try {
      const response = await fetch('/api/comments');
      if (response.ok) {
        const comments = await response.json();
        const foundComment = comments.find(c => c.id === Number(id));
        if (foundComment) {
          setComment(foundComment);
        }
      }
    } catch (error) {
      console.error('Error fetching comment:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      const response = await fetch(`/api/comments?action=reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: comment?.id, text: reply })
      });

      if (response.ok) {
        setReply('');
        fetchComment();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleLikeReply = async (replyId: number, unlike: boolean) => {
    try {
      const response = await fetch(`/api/comments?action=likeReply&parentId=${comment?.id}&replyId=${replyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unlike })
      });
      if (response.ok) {
        localStorage.setItem(`liked_reply_${replyId}`, (!unlike).toString());
        fetchComment();
      }
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      const response = await fetch(`/api/comments?action=deleteReply&parentId=${comment?.id}&replyId=${replyId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Delete reply error:', error);
        return;
      }

      // Fetch updated comments after successful deletion
      fetchComment();
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  if (!comment) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', width: '39.7vw', margin: '0 auto' }}>
      <button 
        onClick={() => router.push('/')}
        style={{
          padding: '8px 16px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      <div style={{ 
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <p>{comment.text}</p>
        <small style={{ color: '#666' }}>
          {new Date(comment.createdAt).toLocaleString()}
        </small>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Replies</h3>
        {comment.replies?.map(reply => (
          <div key={reply.id} style={{ 
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            marginBottom: '10px',
            border: '1px solid #ddd'
          }}>
            <p>{reply.text}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small style={{ color: '#666' }}>
                {new Date(reply.createdAt).toLocaleString()}
              </small>
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const isLiked = localStorage.getItem(`liked_reply_${reply.id}`) === 'true';
                    handleLikeReply(reply.id, isLiked);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    marginRight: '10px',
                    color: localStorage.getItem(`liked_reply_${reply.id}`) === 'true' ? '#ff4b4b' : '#666'
                  }}
                >
                  {localStorage.getItem(`liked_reply_${reply.id}`) === 'true' ? '❤️' : '🖤'} {reply.likes || 0}
                </button>
                <button
                  onClick={() => handleDeleteReply(reply.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply}>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply..."
          style={{ 
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button 
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a8cd8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Post Reply
        </button>
      </form>
    </div>
  );
}
