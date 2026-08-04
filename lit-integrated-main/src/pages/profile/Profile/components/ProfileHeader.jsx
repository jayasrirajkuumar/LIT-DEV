import React, { useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import { getAvatarFallbackData } from "../../../../utils/avatarUtils";

const ProfileHeader = ({
  displayName,
  username,
  avatarUrl,
  onUploadAvatar,
  onRemoveAvatar,
}) => {
  const fileInputRef = useRef(null);
  const { initials, backgroundColor } = getAvatarFallbackData(
    displayName,
    username,
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUploadAvatar(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <section className="profile-main-info profile-production-header">
      <div className="profile-avatar-block">
        <div className="profile-avatar profile-avatar-editable">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="profile-avatar-image"
            />
          ) : (
            <div
              className="profile-avatar-fallback"
              style={{ backgroundColor }}
              aria-hidden="true"
            >
              {initials}
            </div>
          )}
        </div>

        <div className="profile-avatar-buttons">
          <button
            type="button"
            className="profile-secondary-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} />
            Upload Photo
          </button>
          {avatarUrl && (
            <button
              type="button"
              className="profile-danger-btn"
              onClick={onRemoveAvatar}
            >
              <Trash2 size={14} />
              Remove Photo
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </div>

      <div className="profile-user-info">
        <div className="profile-username-row">
          <h1 className="profile-username">{displayName}</h1>
        </div>
        <div className="profile-handle">{username}</div>
      </div>
    </section>
  );
};

export default ProfileHeader;
