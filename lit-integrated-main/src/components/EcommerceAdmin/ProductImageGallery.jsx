import React, { useCallback, useRef, useState } from "react";
import { GripVertical, Star, Trash2, Upload, ZoomIn, Replace } from "lucide-react";
import { uploadAdminImage, deleteAdminImage } from "../../services/adminApiService";
import { normalizeMediaUrl } from "../../utils/mediaUrl";
import { AdminButton, AdminCheckbox, AdminInput, AdminModal } from "../admin-ui";

const ProductImageGallery = ({ entries = [], onChange, productName = "" }) => {
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const updateEntries = useCallback(
    (next) => {
      onChange(next.map((entry, index) => ({ ...entry, sortOrder: index })));
    },
    [onChange],
  );

  const setPrimary = (index) => {
    updateEntries(entries.map((entry, i) => ({ ...entry, isPrimary: i === index })));
  };

  const moveEntry = (from, to) => {
    if (to < 0 || to >= entries.length) return;
    const next = [...entries];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    updateEntries(next);
  };

  const removeEntry = async (index) => {
    const entry = entries[index];
    if (entry?.imageUrl?.startsWith("http")) {
      try {
        await deleteAdminImage(entry.imageUrl);
      } catch {
        // Continue removing from form even if blob delete fails
      }
    }
    const next = entries.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((e) => e.isPrimary)) next[0].isPrimary = true;
    updateEntries(next);
  };

  const addUploadedImage = (url, altText = "") => {
    const next = [
      ...entries,
      {
        imageUrl: url,
        altText: altText || productName,
        isPrimary: entries.length === 0,
        sortOrder: entries.length,
      },
    ];
    updateEntries(next);
  };

  const handleFiles = async (files, replaceAt = null) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    setUploadError("");
    for (const file of list) {
      try {
        setUploadProgress(0);
        const result = await uploadAdminImage(file, setUploadProgress);
        if (replaceAt !== null) {
          const next = entries.map((entry, i) =>
            i === replaceAt
              ? { ...entry, imageUrl: result.url, altText: entry.altText || productName }
              : entry,
          );
          updateEntries(next);
        } else {
          addUploadedImage(result.url);
        }
      } catch (err) {
        setUploadError(err.message || "Upload failed.");
      } finally {
        setUploadProgress(null);
      }
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="adm-gallery">
      <div
        className={`adm-gallery__dropzone${dragOver ? " adm-gallery__dropzone--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
      >
        <Upload size={24} />
        <p>Drag & drop images here, or click to upload</p>
        <span>JPEG, PNG, WebP, GIF — max 5 MB each</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (replaceIndex !== null) handleFiles(e.target.files, replaceIndex);
            setReplaceIndex(null);
          }}
        />
      </div>

      {uploadProgress !== null && (
        <div className="adm-gallery__progress" aria-live="polite">
          <div className="adm-gallery__progress-bar" style={{ width: `${uploadProgress}%` }} />
          <span>Uploading… {uploadProgress}%</span>
        </div>
      )}

      {uploadError && <div className="adm-alert">{uploadError}</div>}

      <div className="adm-gallery__grid">
        {entries.map((entry, index) => (
          <div key={`${entry.imageUrl}-${index}`} className="adm-gallery__item">
            <button
              type="button"
              className="adm-gallery__preview-btn"
              onClick={() => setPreviewUrl(entry.imageUrl)}
              aria-label="Preview fullscreen"
            >
              <img src={normalizeMediaUrl(entry.imageUrl)} alt={entry.altText || ""} loading="lazy" />
              <ZoomIn size={16} />
            </button>
            <div className="adm-gallery__item-meta">
              <span className="adm-gallery__drag-handle" aria-hidden="true">
                <GripVertical size={14} />
              </span>
              <AdminInput
                type="text"
                placeholder="Alt text"
                value={entry.altText || ""}
                onChange={(e) => {
                  const next = entries.map((item, i) =>
                    i === index ? { ...item, altText: e.target.value } : item,
                  );
                  onChange(next);
                }}
              />
              <AdminCheckbox
                label="Primary"
                checked={Boolean(entry.isPrimary)}
                onChange={() => setPrimary(index)}
              />
            </div>
            <div className="adm-gallery__item-actions">
              <AdminButton size="sm" variant="ghost" type="button" onClick={() => moveEntry(index, index - 1)}>
                ↑
              </AdminButton>
              <AdminButton size="sm" variant="ghost" type="button" onClick={() => moveEntry(index, index + 1)}>
                ↓
              </AdminButton>
              <AdminButton
                size="sm"
                variant="outline"
                type="button"
                icon={<Replace size={14} />}
                onClick={() => {
                  setReplaceIndex(index);
                  replaceInputRef.current?.click();
                }}
              >
                Replace
              </AdminButton>
              <AdminButton
                size="sm"
                variant="danger"
                type="button"
                icon={<Trash2 size={14} />}
                onClick={() => removeEntry(index)}
              >
                Delete
              </AdminButton>
              {entry.isPrimary && (
                <span className="adm-gallery__primary-badge">
                  <Star size={12} /> Primary
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        open={Boolean(previewUrl)}
        onClose={() => setPreviewUrl(null)}
        title="Image Preview"
        size="lg"
      >
        {previewUrl && (
          <img src={normalizeMediaUrl(previewUrl)} alt="Preview" className="adm-gallery__fullscreen" loading="lazy" />
        )}
      </AdminModal>
    </div>
  );
};

export default ProductImageGallery;
