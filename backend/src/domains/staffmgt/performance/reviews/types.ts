export type ReviewStatus = "draft" | "in-progress" | "completed" | "cancelled";
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ReviewsType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  reviewer_id?: number;
  review_period_start?: Date;
  review_period_end?: Date;
  review_date?: Date;
  overall_rating?: ReviewRating;
  goals_achievement?: ReviewRating;
  teamwork?: ReviewRating;
  communication?: ReviewRating;
  professionalism?: ReviewRating;
  strengths?: string;
  areas_for_improvement?: string;
  comments?: string;
  recommendations?: string;
  status?: ReviewStatus;
  acknowledged_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateReviewsInput = Partial<ReviewsType>;
export type UpdateReviewsInput = Partial<ReviewsType>;