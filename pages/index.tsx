import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Home: React.FC = () => {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [comments, setComments] = useState<
    Array<{
      id: number;
      text: string;
      createdAt: string;
      likes: number;
      replies?: Array<any>;
    }>
  >([]);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const avatar = localStorage.getItem('userAvatar');
    if (avatar) {
      setUserAvatar(avatar);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments');
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments(); // Refresh the comments list
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLike = async (id: number, unlike: boolean) => {
    try {
      const response = await fetch(`/api/comments?action=like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, unlike }),
      });

      if (response.ok) {
        localStorage.setItem(`liked_${id}`, (!unlike).toString());
        fetchComments(); // Refresh the comments list
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: comment,
          userEmail: localStorage.getItem('userEmail'),
        }),
      });

      if (response.ok) {
        setComment('');
        alert('Comment posted successfully!');
        fetchComments(); // Refresh comments after posting
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div
        onClick={() => router.push('/trending')}
        style={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '200px',
          padding: '15px',
          backgroundColor: '#1a8cd8',
          color: 'white',
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        🔥 Trending
      </div>

      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          cursor: 'pointer',
        }}
        onClick={() => (window.location.href = '/login')}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#1a8cd8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
          }}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt="User"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
              }}
            />
          ) : (
            '👤'
          )}
        </div>
      </div>

      <h1
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontSize: '24px',
          fontWeight: '500',
          margin: '0',
          padding: '20px',
        }}
      >
        Feedbacker
      </h1>

      <div
        style={{
          width: '39.7vw',
          margin: '20px auto',
          position: 'relative',
          height: 'calc(100vh - 100px)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'auto',
            paddingRight: '20px',
            marginRight: '-20px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#333 transparent',
          }}
        >
          <div style={{ direction: 'ltr', paddingRight: '8px' }}>
            {/* Display comments */}
            {comments.map((comment) => (
              <div
                key={comment.id}
                onClick={() => router.push(`/comment/${comment.id}`)}
                style={{
                  padding: '15px',
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '10px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: '1px solid #e1e8ed'
                }}
              >
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1a8cd8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  👤
                </div>
                <div style={{ width: '100%' }}>
                  <p style={{ margin: '0 0 10px 0' }}>{comment.text}</p>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const isLiked = localStorage.getItem(`liked_${comment.id}`) === 'true';
                        handleLike(comment.id, isLiked);
                      }}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        marginRight: '10px',
                        color: localStorage.getItem(`liked_${comment.id}`) === 'true' ? '#ff4b4b' : '#666'
                      }}
                    >
                      {localStorage.getItem(`liked_${comment.id}`) === 'true' ? '❤️' : '🖤'} {comment.likes}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(comment.id);
                      }}
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
              </div>
            ))}
            
            {!showPostForm ? (
              <button
                onClick={() => setShowPostForm(true)}
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  left: '20px',
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#1a8cd8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            ) : (
              <div
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  left: '20px',
                  background: 'white',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  zIndex: 1000,
                  width: '39.7vw',
                }}
              >
                <button
                  onClick={() => setShowPostForm(false)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    border: 'none',
                    background: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '5px',
                  }}
                >
                  ✕
                </button>
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment here..."
                    style={{
                      width: '100%',
                      height: '100px',
                      margin: '10px 0',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor: '#fff',
                      color: '#000',
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
                      cursor: 'pointer',
                    }}
                  >
                    Post Comment
                  </button>
                </form>
              </div>
            )}
            {/* Rest of your comments rendering */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
