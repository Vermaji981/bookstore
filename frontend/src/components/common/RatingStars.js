import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ rating = 0, numReviews, size = 16, interactive = false, onRatingChange }) => {
  const stars = [];
  const validRating = Math.max(0, Math.min(5, Number(rating) || 0));

  for (let i = 1; i <= 5; i++) {
    if (interactive) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onRatingChange && onRatingChange(i)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: i <= validRating ? '#f59e0b' : '#cbd5e1',
          }}
        >
          <Star size={size} fill={i <= validRating ? '#f59e0b' : 'none'} />
        </button>
      );
    } else {
      if (validRating >= i) {
        stars.push(
          <Star key={i} size={size} color="#f59e0b" fill="#f59e0b" style={{ flexShrink: 0 }} />
        );
      } else if (validRating >= i - 0.5) {
        stars.push(
          <StarHalf key={i} size={size} color="#f59e0b" fill="#f59e0b" style={{ flexShrink: 0 }} />
        );
      } else {
        stars.push(
          <Star key={i} size={size} color="#cbd5e1" style={{ flexShrink: 0 }} />
        );
      }
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>
      {numReviews !== undefined && (
        <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>
          ({numReviews})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
