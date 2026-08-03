import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Star,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import {
  formatCurrency,
  getCourseTypeBadge,
  getModeBadge,
} from "../../utils/helpers.js";
import { useState } from "react";
import { courseApi } from "../../api/courseApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";

export default function CourseCard({ course }) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const typeBadge = getCourseTypeBadge(course.type);
  const modeBadge = getModeBadge(course.mode);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Login to save courses");
      return;
    }
    try {
      if (saved) {
        await courseApi.unsaveCourse(course.id);
        setSaved(false);
        toast.success("Removed from saved");
      } else {
        await courseApi.saveCourse(course.id);
        setSaved(true);
        toast.success("Course saved!");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Link
      to={`/courses/${course.id}`}
      className="card p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={typeBadge.cls}>{typeBadge.label}</span>
            <span className={modeBadge.cls}>{modeBadge.label}</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-brand transition-colors line-clamp-2">
            {course.title}
          </h3>
        </div>
        <button
          onClick={handleSave}
          className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/10 transition-all shrink-0"
        >
          {saved ? (
            <BookmarkCheck className="w-4 h-4 text-brand" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* University */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand/20 to-purple-100 dark:to-purple-900/30 flex items-center justify-center text-brand font-bold text-xs shrink-0">
          {course.universityName?.[0] || "U"}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
          {course.universityName}
        </p>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
        {course.district && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {course.district}
          </span>
        )}
        {course.durationMonths && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.durationMonths}m
          </span>
        )}
        {course.averageRating && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {course.averageRating?.toFixed(1)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {formatCurrency(course.totalFee)}
          </p>
          {course.feePerYear && (
            <p className="text-xs text-gray-400">
              {formatCurrency(course.feePerYear)}/yr
            </p>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-brand">
          View <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
