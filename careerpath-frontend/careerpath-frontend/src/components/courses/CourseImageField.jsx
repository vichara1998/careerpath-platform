import { useId, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { courseApi } from "../../api/courseApi.js";

export default function CourseImageField({ value, onChange }) {
  const fieldId = useId().replaceAll(":", "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setError("");
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Select a PNG or JPEG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Choose an image smaller than 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const { data } = await courseApi.uploadImage(file);
      onChange(data.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Image upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="course-image-field">
      <label className="field-label" htmlFor={`${fieldId}-url`}>
        Course image URL <span>optional · paste a direct image URL</span>
        <input
          autoComplete="url"
          id={`${fieldId}-url`}
          inputMode="url"
          maxLength={500}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://example.com/course-image.jpg"
          type="text"
          value={value}
        />
      </label>
      <div className="course-image-preview">
        {value ? (
          <img
            alt="Course image preview"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
            onLoad={(event) => {
              event.currentTarget.hidden = false;
            }}
            src={value}
          />
        ) : (
          <span>Choose an image or add a direct image URL</span>
        )}
      </div>
      <div className="course-image-actions">
        <label className="button-outline" htmlFor={`${fieldId}-file`}>
          {uploading ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <Camera size={17} />
          )}
          {uploading
            ? "Uploading image..."
            : value
              ? "Replace image"
              : "Upload image"}
        </label>
        <input
          accept="image/png,image/jpeg"
          className="sr-only"
          disabled={uploading}
          id={`${fieldId}-file`}
          onChange={uploadImage}
          type="file"
        />
        {value && (
          <button
            className="image-clear-button"
            disabled={uploading}
            onClick={() => onChange("")}
            type="button"
          >
            Remove image
          </button>
        )}
      </div>
      <p className="course-image-help">
        PNG or JPEG, up to 2 MB. Uploads are checked and re-encoded on the
        server.
      </p>
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
