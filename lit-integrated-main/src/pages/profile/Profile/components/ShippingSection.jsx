import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { formatAddress } from "../../../../services/profileService";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  addressType: "HOME",
  isDefault: false,
};

const ShippingSection = ({
  addresses,
  loading = false,
  saving = false,
  error = "",
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
    setIsFormOpen(true);
  };

  const openEditForm = (address) => {
    setEditingId(address.id);
    setForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
      addressType: address.addressType || "HOME",
      isDefault: Boolean(address.isDefault),
    });
    setIsFormOpen(true);
  };

  const handleChange = (field) => (event) => {
    const value =
      field === "isDefault" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onAdd(form);
    }
    setIsFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
  };

  return (
    <div className="shipping-address-card">
      <div className="profile-card-header">
        <div className="profile-section-title">Shipping Information</div>
        {addresses.length > 0 && !isFormOpen && (
          <button
            type="button"
            className="profile-edit-btn"
            onClick={openAddForm}
            disabled={saving}
          >
            <Plus size={14} />
            Add Address
          </button>
        )}
      </div>

      {error && <p className="profile-inline-error">{error}</p>}

      {loading ? (
        <div className="profile-empty-state">
          <p>Loading addresses...</p>
        </div>
      ) : addresses.length === 0 && !isFormOpen ? (
        <div className="profile-empty-state">
          <h3>No saved addresses</h3>
          <p>You haven&apos;t added a shipping address yet.</p>
          <button type="button" className="profile-primary-btn" onClick={openAddForm}>
            Add Address
          </button>
        </div>
      ) : (
        <div className="profile-address-list">
          {addresses.map((address) => (
            <div className="profile-address-item" key={address.id}>
              <div className="profile-address-meta">
                {address.fullName && <strong>{address.fullName}</strong>}
                {address.isDefault && <span className="profile-default-badge">Default</span>}
              </div>
              <pre className="profile-address">{formatAddress(address)}</pre>
              <div className="profile-address-actions">
                <button
                  type="button"
                  className="profile-secondary-btn"
                  onClick={() => openEditForm(address)}
                  disabled={saving}
                >
                  <Pencil size={14} />
                  Edit Address
                </button>
                <button
                  type="button"
                  className="profile-danger-btn"
                  onClick={() => onDelete(address.id)}
                  disabled={saving}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <form className="profile-address-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input value={form.fullName} onChange={handleChange("fullName")} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={handleChange("phone")} required />
          </label>
          <label>
            Address Line 1
            <input value={form.line1} onChange={handleChange("line1")} required />
          </label>
          <label>
            Address Line 2
            <input value={form.line2} onChange={handleChange("line2")} />
          </label>
          <label>
            City
            <input value={form.city} onChange={handleChange("city")} required />
          </label>
          <label>
            State
            <input value={form.state} onChange={handleChange("state")} />
          </label>
          <label>
            Postal Code
            <input value={form.postalCode} onChange={handleChange("postalCode")} />
          </label>
          <label>
            Country
            <input value={form.country} onChange={handleChange("country")} required />
          </label>
          <label>
            Address Type
            <select value={form.addressType} onChange={handleChange("addressType")}>
              <option value="HOME">Home</option>
              <option value="OFFICE">Office</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label className="profile-checkbox-label">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={handleChange("isDefault")}
            />
            Set as default address
          </label>
          <div className="profile-form-actions">
            <button type="submit" className="profile-primary-btn" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Address" : "Add Address"}
            </button>
            <button
              type="button"
              className="profile-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ShippingSection;
