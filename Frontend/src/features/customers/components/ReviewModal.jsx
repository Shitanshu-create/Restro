import { useState } from "react";
import { submitReview } from "../api/customer.api.js";
import "../styles/ReviewModal.css";

const ReviewModal = ({ isOpen, onClose, tableNo, customerName }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);
    setErrorMsg(null);

    const res = await submitReview({
      rating,
      comment,
      tableNo: tableNo || "N/A",
      customerName: customerName || "Guest"
    });

    setIsSubmitting(false);
    if (res.success) {
      setMsg("Thank you! Your review has been submitted.");
      setComment("");
      setTimeout(() => {
        setMsg(null);
        onClose();
      }, 3000);
    } else {
      setErrorMsg(res.message || "Failed to submit review. You may have already reviewed this session.");
    }
  };

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="review-header">
          <div className="review-title-group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h2>Leave a Review</h2>
          </div>
          <button className="review-close-btn" onClick={onClose} aria-label="Close review modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="review-body">
          {msg ? (
            <div className="review-success-state">{msg}</div>
          ) : (
            <form onSubmit={handleSubmit} className="review-form">
              {errorMsg && <div className="review-error-state">{errorMsg}</div>}
              
              <div className="rating-select-group">
                <span className="rating-label">How was your dining experience?</span>
                <div className="star-rating-row">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating);
                    return (
                      <button
                        type="button"
                        key={star}
                        className={`star-btn ${active ? "active" : ""}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Rate ${star} Stars`}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="comment-group">
                <label htmlFor="review-comment-input">Share your feedback</label>
                <textarea
                  id="review-comment-input"
                  placeholder="Tell us what you liked, or how we can improve..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="review-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
