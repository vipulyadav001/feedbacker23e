import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  likes: number;
  potentialRating: number;
  replies?: Array<any>;
}

export default function Trending() {
  const [comments, setComments] = useState<Comment[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments');
      if (response.ok) {
        const data = await response.json();
        // Sort by potential rating
        const sortedComments = data.sort((a: Comment, b: Comment) => 
          (b.potentialRating || 0) - (a.potentialRating || 0)
        );
        setComments(sortedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
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

      <h1>Trending Comments</h1>
      
      <div style={{ marginTop: '20px' }}>
        {comments.map((comment, index) => (
          <div 
            key={comment.id}
            onClick={() => router.push(`/comment/${comment.id}`)}
            style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              cursor: 'pointer',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd'
            }}
          >
            <div style={{ 
              marginRight: '15px', 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1a8cd8'
            }}>
              #{index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p>{comment.text}</p>
              <div style={{ 
                marginTop: '5px',
                fontSize: '12px',
                color: '#666'
              }}>
                Potential Rating: {comment.potentialRating || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
