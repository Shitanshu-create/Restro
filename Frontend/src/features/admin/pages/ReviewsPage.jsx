import React, { useState, useMemo } from "react";
import { useReviews } from "../hooks/useAdmin.js";
import DateRangeFilter, { getPresetRange } from "../components/DateRangeFilter.jsx";
import StatCard from "../components/StatCard.jsx";
import "../styles/ReviewsPage.css";

const STAR_TABS = ["All", "5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"];

const ReviewsPage = () => {
    const { reviews, loading, error, reload } = useReviews();
    const [activeStarTab, setActiveStarTab] = useState("All");
    const [dateRange, setDateRange] = useState(() => getPresetRange("today"));
    const [search, setSearch] = useState("");

    // Date range filter
    const dateFilteredReviews = useMemo(() => {
        return reviews.filter((r) => {
            if (!r.createdAt) return true;
            const reviewDate = new Date(r.createdAt);
            if (dateRange.from && reviewDate < dateRange.from) return false;
            if (dateRange.to && reviewDate > dateRange.to) return false;
            return true;
        });
    }, [reviews, dateRange]);

    // Star tab filter
    const starFilteredReviews = useMemo(() => {
        return dateFilteredReviews.filter((r) => {
            if (activeStarTab === "All") return true;
            const expectedRating = parseInt(activeStarTab.charAt(0));
            return r.rating === expectedRating;
        });
    }, [dateFilteredReviews, activeStarTab]);

    // Search filter (by name or comment)
    const finalReviews = useMemo(() => {
        const q = search.toLowerCase();
        return starFilteredReviews.filter((r) => {
            return (
                !q ||
                (r.customerName && r.customerName.toLowerCase().includes(q)) ||
                (r.comment && r.comment.toLowerCase().includes(q)) ||
                (r.tableNo && r.tableNo.toLowerCase().includes(q))
            );
        });
    }, [starFilteredReviews, search]);

    // Metrics computation
    const metrics = useMemo(() => {
        const total = dateFilteredReviews.length;
        if (total === 0) return { avg: "0.0", total: 0, fiveStarPct: "0%", positiveCount: 0 };

        const sum = dateFilteredReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / total).toFixed(1);
        const fiveStarCount = dateFilteredReviews.filter((r) => r.rating === 5).length;
        const fiveStarPct = ((fiveStarCount / total) * 100).toFixed(0) + "%";
        const positiveCount = dateFilteredReviews.filter((r) => r.rating >= 4).length;

        return { avg, total, fiveStarPct, positiveCount };
    }, [dateFilteredReviews]);

    const renderStars = (rating) => {
        return (
            <div className="review-stars-display" aria-label={`${rating} stars`}>
                {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`star-item ${s <= rating ? "filled" : ""}`}>★</span>
                ))}
            </div>
        );
    };

    return (
        <div className="reviews-page">
            {/* Header */}
            <div className="reviews-top-bar">
                <DateRangeFilter onChange={setDateRange} />
            </div>

            {error && <div className="reviews-error-alert" role="alert">{error}</div>}

            {/* Stat Cards */}
            <div className="reviews-stats-grid">
                <StatCard
                    title="Average Rating"
                    value={`★ ${metrics.avg}`}
                    subtext={`${metrics.positiveCount} positive reviews (4★+)`}
                    subtextColor="green"
                />
                <StatCard
                    title="Total Reviews"
                    value={metrics.total}
                    subtext="For selected date range"
                    subtextColor="muted"
                />
                <StatCard
                    title="5-Star Reviews"
                    value={metrics.fiveStarPct}
                    subtext="Ratio of perfect ratings"
                    subtextColor="orange"
                />
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="reviews-controls-row">
                <div className="reviews-star-tabs">
                    {STAR_TABS.map((tab) => (
                        <button
                            key={tab}
                            className={`review-tab-btn ${activeStarTab === tab ? "active" : ""}`}
                            onClick={() => setActiveStarTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="reviews-search-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="search-icon">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by customer name, comment, table..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="reviews-search-input"
                    />
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="reviews-loading">Loading reviews...</div>
            ) : finalReviews.length === 0 ? (
                <div className="reviews-empty">No reviews found matching the filters.</div>
            ) : (
                <div className="reviews-list-container">
                    {finalReviews.map((review) => {
                        const dateString = review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "Just now";

                        // Generate initials for avatar
                        const initials = review.customerName
                            ? review.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                            : "G";

                        return (
                            <div key={review._id} className="review-item-card">
                                <div className="review-card-header">
                                    <div className="review-user-info">
                                        <div className="review-user-avatar">{initials}</div>
                                        <div>
                                            <h3 className="review-user-name">{review.customerName || "Anonymous Customer"}</h3>
                                            <div className="review-user-meta">
                                                <span className="review-meta-table">Table {review.tableNo}</span>
                                                <span className="review-meta-dot">•</span>
                                                <span className="review-meta-time">{dateString}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                {review.comment ? (
                                    <p className="review-card-comment">"{review.comment}"</p>
                                ) : (
                                    <p className="review-card-comment no-comment">No written feedback provided.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReviewsPage;
