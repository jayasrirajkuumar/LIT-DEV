import React from "react";
import { GripVertical } from "lucide-react";
import { AdminButton, AdminInput, AdminCheckbox } from "../admin-ui";

const ProductImageUrlEditor = ({ entries = [], onChange }) => {
  const updateEntry = (index, field, value) => {
    onChange(
      entries.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)),
    );
  };

  const setPrimary = (index) => {
    onChange(entries.map((entry, i) => ({ ...entry, isPrimary: i === index })));
  };

  const moveEntry = (from, to) => {
    if (to < 0 || to >= entries.length) return;
    const next = [...entries];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((entry, index) => ({ ...entry, sortOrder: index })));
  };

  const addEntry = () => {
    onChange([
      ...entries,
      { imageUrl: "", altText: "", isPrimary: entries.length === 0, sortOrder: entries.length },
    ]);
  };

  const removeEntry = (index) => {
    const next = entries.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((e) => e.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  };

  return (
    <div className="adm-image-editor">
      {entries.map((entry, index) => (
        <div key={`image-${index}`} className="adm-image-editor__row">
          <span className="adm-image-editor__drag" aria-hidden="true">
            <GripVertical size={16} />
          </span>
          <AdminInput
            type="url"
            placeholder="https://example.com/image.jpg"
            value={entry.imageUrl}
            onChange={(e) => updateEntry(index, "imageUrl", e.target.value)}
            aria-label={`Image URL ${index + 1}`}
          />
          <AdminInput
            type="text"
            placeholder="Alt text"
            value={entry.altText || ""}
            onChange={(e) => updateEntry(index, "altText", e.target.value)}
            aria-label={`Alt text ${index + 1}`}
          />
          <AdminCheckbox
            label="Primary"
            checked={Boolean(entry.isPrimary)}
            onChange={() => setPrimary(index)}
          />
          <div style={{ display: "flex", gap: 4 }}>
            <AdminButton size="sm" variant="ghost" type="button" onClick={() => moveEntry(index, index - 1)} aria-label="Move up">
              ↑
            </AdminButton>
            <AdminButton size="sm" variant="ghost" type="button" onClick={() => moveEntry(index, index + 1)} aria-label="Move down">
              ↓
            </AdminButton>
            <AdminButton size="sm" variant="danger" type="button" onClick={() => removeEntry(index)}>
              Remove
            </AdminButton>
          </div>
        </div>
      ))}
      <AdminButton variant="outline" type="button" onClick={addEntry}>
        Add Image URL
      </AdminButton>
    </div>
  );
};

export default ProductImageUrlEditor;
