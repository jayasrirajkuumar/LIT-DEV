import React, { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { formatMemberSince } from "../../../../services/profileService";

const EMPTY_FORM = {
  name: "",
  username: "",
  phone: "",
  country: "",
  bio: "",
};

const AccountInformation = ({
  displayName,
  displayEmail,
  memberSince,
  extensions,
  onSave,
  saving = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm({
      name: displayName || "",
      username: extensions.username || "",
      phone: extensions.phone || "",
      country: extensions.country || "",
      bio: extensions.bio || "",
    });
  }, [displayName, extensions]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    try {
      await onSave({
        ...extensions,
        displayName: form.name.trim(),
        username: form.username.trim().startsWith("@")
          ? form.username.trim()
          : `@${form.username.trim().replace(/^@/, "")}`,
        phone: form.phone.trim(),
        country: form.country.trim(),
        bio: form.bio.trim(),
      });
      setIsEditing(false);
    } catch {
      // Parent shows toast; keep form open for retry.
    }
  };

  const handleCancel = () => {
    setForm({
      name: displayName || "",
      username: extensions.username || "",
      phone: extensions.phone || "",
      country: extensions.country || "",
      bio: extensions.bio || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="account-information-card">
      <div className="profile-card-header">
        <div className="profile-section-title">Account Information</div>
        {!isEditing ? (
          <button
            type="button"
            className="profile-edit-btn"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={14} />
            Edit
          </button>
        ) : (
          <div className="profile-edit-actions">
            <button type="button" className="profile-save-btn" onClick={handleSave} disabled={saving}>
              <Save size={14} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="profile-cancel-btn" onClick={handleCancel}>
              <X size={14} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <>
          <div className="profile-info-list profile-info-grid">
            <div className="profile-info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{displayName || "—"}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{displayEmail || "—"}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{extensions.phone || "—"}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Country</span>
              <span className="info-value">{extensions.country || "—"}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{formatMemberSince(memberSince)}</span>
            </div>
          </div>

          {extensions.bio && (
            <div className="profile-bio-block">
              <span className="info-label">Bio</span>
              <p className="profile-bio-text">{extensions.bio}</p>
            </div>
          )}
        </>
      ) : (
        <div className="profile-edit-form">
          <label>
            Name
            <input value={form.name} onChange={handleChange("name")} />
          </label>
          <label>
            Username
            <input value={form.username} onChange={handleChange("username")} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={handleChange("phone")} />
          </label>
          <label>
            Country
            <input value={form.country} onChange={handleChange("country")} />
          </label>
          <label>
            Bio
            <textarea value={form.bio} onChange={handleChange("bio")} rows={3} />
          </label>
        </div>
      )}
    </div>
  );
};

export default AccountInformation;
