import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import {
  formatCurrency,
  getCourseTypeBadge,
  getModeBadge,
} from "../../utils/helpers.js";

const courseImages = {
  campus: [
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=960&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=960&q=80",
  ],
  students: [
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=960&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=960&q=80",
  ],
  technology: [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=960&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=960&q=80",
  ],
  books: [
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=960&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=960&q=80",
  ],
  science: [
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=960&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=960&q=80",
  ],
  healthcare: [
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=960&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=960&q=80",
  ],
};

function getCourseImage(course) {
  const subject =
    `${course.title || ""} ${course.careerFields || ""}`.toLowerCase();
  let imageSet = courseImages.campus;
  if (/medicine|medical|health|nurs|mbbs/.test(subject))
    imageSet = courseImages.healthcare;
  else if (
    /computer|software|cyber|data science|ict|network|artificial intelligence|\bai\b/.test(
      subject,
    )
  )
    imageSet = courseImages.technology;
  else if (/science|laboratory|biology|chemistry|agriculture/.test(subject))
    imageSet = courseImages.science;
  else if (/business|management|account|marketing|finance/.test(subject))
    imageSet = courseImages.books;
  else if (
    /student|education|teaching|degree|diploma|certificate/.test(subject)
  )
    imageSet = courseImages.students;

  const courseIndex = Number(course.id);
  return imageSet[
    Number.isFinite(courseIndex) ? Math.abs(courseIndex) % imageSet.length : 0
  ];
}

function getImageCaption(course) {
  const subject =
    `${course.title || ""} ${course.careerFields || ""}`.toLowerCase();
  if (/medicine|medical|health|nurs|mbbs/.test(subject))
    return "Health sciences";
  if (
    /computer|software|cyber|data science|ict|network|artificial intelligence|\bai\b/.test(
      subject,
    )
  )
    return "Computing & technology";
  if (/science|laboratory|biology|chemistry|agriculture/.test(subject))
    return "Science & research";
  if (/business|management|account|marketing|finance/.test(subject))
    return "Business studies";
  return "Campus life";
}

export default function CourseCard({ course }) {
  const typeBadge = getCourseTypeBadge(course.type);
  const modeBadge = getModeBadge(course.mode);
  const title = course.title
    ?.replace(/\?{2,}/g, "—")
    .replace(/\s{2,}/g, " ")
    .trim();
  const totalFee =
    course.totalFee == null
      ? "Fee not listed"
      : formatCurrency(course.totalFee);
  const artClass = `course-art--${(course.type || "degree").toLowerCase().replaceAll("_", "-")}`;
  const imageCaption = course.thumbnailUrl
    ? "Course preview"
    : getImageCaption(course);
  const fallbackImage = getCourseImage(course);
  const [imageSource, setImageSource] = useState(
    course.thumbnailUrl || fallbackImage,
  );
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageSource(course.thumbnailUrl || fallbackImage);
    setImageFailed(false);
  }, [course.thumbnailUrl, fallbackImage]);

  const handleImageError = () => {
    if (imageSource !== fallbackImage) {
      setImageSource(fallbackImage);
    } else {
      setImageFailed(true);
    }
  };

  return (
    <Link to={`/courses/${course.id}`} className="course-card card group">
      <div
        className={`course-card-art ${artClass}${imageSource ? " has-image" : ""}`}
      >
        {!imageFailed && imageSource && (
          <img
            className="course-card-image"
            src={imageSource}
            alt=""
            loading="lazy"
            onError={handleImageError}
          />
        )}
        <span className="course-art-label">{imageCaption}</span>
        <span className="course-art-mode">{modeBadge.label}</span>
      </div>
      <div className="course-card-heading">
        <span className="sr-only">
          {typeBadge.label}, {modeBadge.label}
        </span>
        <h3 className="course-card-title">
          {title || "Course title unavailable"}
        </h3>
      </div>

      <div className="course-provider">
        <span className="course-provider-mark" aria-hidden="true">
          {course.universityName?.trim()?.[0]?.toUpperCase() || "U"}
        </span>
        <p className="course-provider-name">{course.universityName}</p>
      </div>

      <div className="course-facts">
        {course.district && (
          <span className="course-fact">
            <MapPin aria-hidden="true" />
            {course.district}
          </span>
        )}
        {course.durationMonths && (
          <span className="course-fact">
            <Clock aria-hidden="true" />
            {course.durationMonths} months
          </span>
        )}
        {course.averageRating != null && course.averageRating > 0 && (
          <span className="course-fact course-rating">
            <Star aria-hidden="true" />
            {course.averageRating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="course-card-footer">
        <div className="course-fee">
          <span className="course-fee-label">Total fee</span>
          <strong>{totalFee}</strong>
          {course.feePerYear != null && (
            <span className="course-fee-year">
              {formatCurrency(course.feePerYear)} per year
            </span>
          )}
        </div>
        <span className="course-card-link">
          Course details <ArrowRight aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
