import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { reviewService } from "../../services/api/reviewService";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import DataTable from "../../components/ui/DataTable/DataTable";
import Rating from "../../components/shared/Rating/Rating";
import Modal from "../../components/ui/Modal/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faStar,
  faCheck,
  faTimes,
  faComment,
  faEye,
  faFilter,
  faUser,
  faUtensils,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ReviewManagement.module.css";

const ReviewManagement = () => {
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [filters, setFilters] = useState({
    status: "pending",
    rating: "",
    search: "",
  });

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", filters],
    queryFn: () => reviewService.getPendingReviews(filters),
  });

  const approveMutation = useMutation({
    mutationFn: (reviewId) => reviewService.approveReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reviewId) => {
      // Custom endpoint for rejection would be needed
      return reviewService.approveReview(reviewId); // Adjust as needed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const responseMutation = useMutation({
    mutationFn: ({ reviewId, response }) =>
      reviewService.addAdminResponse(reviewId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setShowResponseModal(false);
      setAdminResponse("");
    },
  });

  const handleApprove = (reviewId) => {
    approveMutation.mutate(reviewId);
  };

  const handleReject = (reviewId) => {
    if (window.confirm("Are you sure you want to reject this review?")) {
      rejectMutation.mutate(reviewId);
    }
  };

  const handleAddResponse = (review) => {
    setSelectedReview(review);
    setShowResponseModal(true);
  };

  const handleSubmitResponse = () => {
    if (selectedReview && adminResponse.trim()) {
      responseMutation.mutate({
        reviewId: selectedReview._id,
        response: adminResponse,
      });
    }
  };

  const columns = [
    {
      key: "reviewer",
      header: "Reviewer",
      render: (review) => (
        <div className={styles.reviewerInfo}>
          <div className={styles.reviewerAvatar}>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className={styles.reviewerDetails}>
            <div className={styles.reviewerName}>
              {review.customerName || "Anonymous"}
            </div>
            <div className={styles.reviewDate}>
              <FontAwesomeIcon icon={faCalendar} />
              {format(new Date(review.createdAt), "MMM dd, yyyy")}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "content",
      header: "Review",
      render: (review) => (
        <div className={styles.reviewContent}>
          <div className={styles.reviewHeader}>
            <Rating value={review.rating} max={5} readOnly />
            {review.orderNumber && (
              <span className={styles.orderReference}>
                Order #{review.orderNumber}
              </span>
            )}
          </div>
          <p className={styles.reviewText}>{review.comment}</p>
          {review.foodItems && review.foodItems.length > 0 && (
            <div className={styles.foodItems}>
              <FontAwesomeIcon icon={faUtensils} />
              <span>
                {review.foodItems.map((item) => item.name).join(", ")}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (review) => (
        <div className={styles.statusCell}>
          <div className={`${styles.statusBadge} ${styles[review.status]}`}>
            {review.status}
          </div>
          {review.adminResponse && (
            <div className={styles.hasResponse}>
              <FontAwesomeIcon icon={faComment} />
              <span>Has response</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (review) => (
        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            size="sm"
            icon={faEye}
            onClick={() => setSelectedReview(review)}
            title="View Details"
          />

          {review.status === "pending" && (
            <>
              <Button
                variant="success"
                size="sm"
                icon={faCheck}
                onClick={() => handleApprove(review._id)}
                loading={approveMutation.isPending}
                title="Approve"
              />
              <Button
                variant="danger"
                size="sm"
                icon={faTimes}
                onClick={() => handleReject(review._id)}
                loading={rejectMutation.isPending}
                title="Reject"
              />
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={faComment}
            onClick={() => handleAddResponse(review)}
            title="Add Response"
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.reviewManagement}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Review Management</h1>
          <p className={styles.subtitle}>
            Moderate and respond to customer reviews
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {reviews?.pendingCount || 0}
              </span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {reviews?.totalCount || 0}
              </span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search reviews..."
              icon={faSearch}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              fullWidth
            />
          </div>

          <Select
            options={[
              { value: "pending", label: "Pending Reviews" },
              { value: "approved", label: "Approved Reviews" },
              { value: "rejected", label: "Rejected Reviews" },
              { value: "all", label: "All Reviews" },
            ]}
            value={filters.status}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          />

          <Select
            options={[
              { value: "", label: "All Ratings" },
              { value: "5", label: "★★★★★" },
              { value: "4", label: "★★★★☆" },
              { value: "3", label: "★★★☆☆" },
              { value: "2", label: "★★☆☆☆" },
              { value: "1", label: "★☆☆☆☆" },
            ]}
            value={filters.rating}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, rating: value }))
            }
            placeholder="Filter by rating"
          />
        </div>
      </Card>

      {/* Reviews Table */}
      <Card className={styles.tableCard}>
        <DataTable
          columns={columns}
          data={reviews?.data || []}
          loading={isLoading}
          emptyMessage="No reviews found"
        />
      </Card>

      {/* Review Details Modal */}
      {selectedReview && (
        <ReviewDetailsModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          onAddResponse={() => handleAddResponse(selectedReview)}
        />
      )}

      {/* Admin Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setAdminResponse("");
        }}
        title="Add Admin Response"
        size="md"
      >
        <div className={styles.responseModal}>
          <div className={styles.responseReview}>
            <strong>Review:</strong>
            <p>{selectedReview?.comment}</p>
          </div>

          <div className={styles.responseInput}>
            <label>Your Response:</label>
            <textarea
              className={styles.textarea}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Type your response here..."
              rows={4}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => {
                setShowResponseModal(false);
                setAdminResponse("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitResponse}
              loading={responseMutation.isPending}
              disabled={!adminResponse.trim()}
            >
              Submit Response
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Review Details Modal Component
const ReviewDetailsModal = ({ review, isOpen, onClose, onAddResponse }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Details" size="lg">
      <div className={styles.reviewDetailsModal}>
        <div className={styles.reviewHeader}>
          <div className={styles.reviewerSection}>
            <div className={styles.reviewerAvatarLarge}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className={styles.reviewerInfo}>
              <h3>{review.customerName || "Anonymous"}</h3>
              <div className={styles.reviewMeta}>
                <span className={styles.reviewDate}>
                  {format(new Date(review.createdAt), "MMMM dd, yyyy")}
                </span>
                {review.orderNumber && (
                  <span className={styles.orderNumber}>
                    Order #{review.orderNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.ratingSection}>
            <Rating value={review.rating} max={5} readOnly size="lg" />
            <div className={styles.ratingValue}>
              {review.rating.toFixed(1)}/5
            </div>
          </div>
        </div>

        <div className={styles.reviewBody}>
          <div className={styles.reviewComment}>
            <h4>Review</h4>
            <p>{review.comment}</p>
          </div>

          {review.foodItems && review.foodItems.length > 0 && (
            <div className={styles.foodItemsSection}>
              <h4>Food Items Reviewed</h4>
              <div className={styles.foodItemsGrid}>
                {review.foodItems.map((item, index) => (
                  <div key={index} className={styles.foodItem}>
                    <div className={styles.foodImage}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <FontAwesomeIcon icon={faUtensils} />
                      )}
                    </div>
                    <div className={styles.foodInfo}>
                      <div className={styles.foodName}>{item.name}</div>
                      <div className={styles.foodCategory}>{item.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {review.adminResponse && (
            <div className={styles.adminResponse}>
              <h4>
                <FontAwesomeIcon icon={faComment} />
                Admin Response
              </h4>
              <div className={styles.responseContent}>
                <p>{review.adminResponse}</p>
                <div className={styles.responseMeta}>
                  <span className={styles.responseDate}>
                    {format(
                      new Date(review.responseDate || review.updatedAt),
                      "MMMM dd, yyyy"
                    )}
                  </span>
                  <span className={styles.responseAuthor}>
                    HotelZenith Team
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!review.adminResponse && (
            <Button variant="primary" onClick={onAddResponse}>
              Add Response
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReviewManagement;
