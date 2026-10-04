import { useEffect, useState } from "react";
import { Camera, Loader2, Save, Trash2, UserRound } from "lucide-react";
import { profileApi } from "../../api/profileApi.js";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../store/slices/authSlice.js";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  "Could not save your profile. Please try again.";

export default function Profile() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pictureBusy, setPictureBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    profileApi
      .get()
      .then(({ data }) => {
        if (!active) return;
        const account = data.data;
        setProfile(account);
        setForm({
          fullName: account.fullName || "",
          phone: account.phone || "",
        });
        dispatch(updateUserProfile(account));
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!picture) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(picture);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [picture]);

  const applyProfile = (account) => {
    setProfile(account);
    setForm({ fullName: account.fullName || "", phone: account.phone || "" });
    dispatch(updateUserProfile(account));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data } = await profileApi.update({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      applyProfile(data.data);
      setNotice("Your profile was updated.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const uploadPicture = async () => {
    if (!picture) return;
    setPictureBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await profileApi.uploadPicture(picture);
      applyProfile(data.data);
      setPicture(null);
      setNotice("Your profile picture was updated.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setPictureBusy(false);
    }
  };

  const removePicture = async () => {
    setPictureBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await profileApi.removePicture();
      applyProfile(data.data);
      setPicture(null);
      setNotice("Your profile picture was removed.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setPictureBusy(false);
    }
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setError("");
    setNotice("");
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Choose an image smaller than 2 MB.");
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Choose a PNG or JPEG image.");
      return;
    }
    setPicture(file);
  };

  if (loading) {
    return (
      <div className="page-container content-section" role="status">
        <Loader2 className="animate-spin" aria-label="Loading profile" />
      </div>
    );
  }

  return (
    <section className="page-container content-section">
      <header className="page-intro">
        <p className="eyebrow">ACCOUNT</p>
        <h1>Your profile</h1>
        <p>Manage the details shown on your CareerPath account.</p>
      </header>

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="notice notice-success" role="status">
          {notice}
        </p>
      )}

      {profile && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
          <form className="form-panel space-y-5" onSubmit={saveProfile}>
            <h2>Personal details</h2>
            <label className="field-label">
              Full name
              <input
                autoComplete="name"
                className="input"
                maxLength={100}
                required
                value={form.fullName}
                onChange={(event) =>
                  setForm({ ...form, fullName: event.target.value })
                }
              />
            </label>
            <label className="field-label">
              Email address
              <input className="input" value={profile.email} readOnly />
            </label>
            <label className="field-label">
              Phone number
              <input
                autoComplete="tel"
                className="input"
                maxLength={20}
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </label>
            <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-5 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {profile.role.replaceAll("ROLE_", "")}
              </span>
              <button
                className="button-primary"
                disabled={saving}
                type="submit"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Save size={17} />
                )}
                Save changes
              </button>
            </div>
          </form>

          <section
            className="form-panel h-fit space-y-5"
            aria-labelledby="picture-heading"
          >
            <div>
              <h2 id="picture-heading">Profile picture</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                PNG or JPEG, up to 2 MB.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                {preview || profile.profileImageUrl ? (
                  <img
                    alt="Profile"
                    className="h-full w-full object-cover"
                    src={preview || profile.profileImageUrl}
                  />
                ) : (
                  <UserRound
                    className="text-gray-400"
                    size={36}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label
                  className="button-outline cursor-pointer"
                  htmlFor="profile-picture-input"
                >
                  <Camera size={17} /> Choose image
                </label>
                <input
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  id="profile-picture-input"
                  onChange={handlePictureChange}
                  type="file"
                />
                {profile.profileImageUrl && !picture && (
                  <button
                    className="button-outline"
                    disabled={pictureBusy}
                    onClick={removePicture}
                    type="button"
                  >
                    <Trash2 size={17} /> Remove
                  </button>
                )}
                {picture && (
                  <button
                    className="button-primary"
                    disabled={pictureBusy}
                    onClick={uploadPicture}
                    type="button"
                  >
                    {pictureBusy ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <Save size={17} />
                    )}
                    Upload picture
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
