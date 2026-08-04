import React, { useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminFormSection,
  AdminFormField,
  AdminInput,
  AdminTextarea,
  AdminSwitch,
  AdminButton,
  AdminSkeletonForm,
} from "../admin-ui";
import { fetchStoreSettings, updateStoreSettings } from "../../services/adminApiService";

const SECTIONS = [
  { key: "general", title: "General", fields: ["storeName", "storeTagline", "supportEmail", "supportPhone", "timezone"] },
  { key: "welcomeCoupon", title: "Welcome Coupon", fields: ["enabled", "amount", "expiryDays", "prefix"] },
  { key: "branding", title: "Branding", fields: ["logoUrl", "faviconUrl", "primaryColor", "accentColor"] },
  { key: "currency", title: "Currency", fields: ["code", "symbol", "decimalPlaces", "position"] },
  { key: "taxes", title: "Taxes", fields: ["enabled", "defaultRate", "taxInclusive", "gstNumber"] },
  { key: "shipping", title: "Shipping", fields: ["standardRate", "expressRate", "freeShippingThreshold", "estimatedDaysStandard", "estimatedDaysExpress"] },
  { key: "email", title: "Email", fields: ["fromName", "fromEmail", "orderConfirmation", "shippingUpdates", "marketingEmails"] },
  { key: "payment", title: "Payment", fields: ["provider", "razorpayEnabled", "stripeEnabled", "note"] },
  { key: "returnPolicy", title: "Return Policy", fields: ["enabled", "windowDays", "content"] },
  { key: "terms", title: "Terms", fields: ["content"] },
  { key: "privacy", title: "Privacy", fields: ["content"] },
  { key: "contact", title: "Contact", fields: ["address", "city", "state", "postalCode", "country", "businessHours"] },
];

const AdminSettingsView = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStoreSettings()
      .then(setSettings)
      .catch((err) => setError(err.message || "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateStoreSettings(settings);
      setSettings(updated);
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-page">
        <AdminSkeletonForm fields={8} />
      </div>
    );
  }

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Marketplace Settings"
        subtitle="Configure general, welcome coupons, taxes, shipping, and policies"
        actions={
          <AdminButton loading={saving} onClick={handleSave}>
            Save Settings
          </AdminButton>
        }
      />

      {error && <div className="adm-alert">{error}</div>}
      {success && <div className="adm-alert adm-alert--success">{success}</div>}

      <div className="adm-settings">
        {SECTIONS.map(({ key, title, fields }) => (
          <AdminFormSection key={key} title={title}>
            {fields.map((field) => {
              const value = settings?.[key]?.[field];
              if (typeof value === "boolean") {
                return (
                  <AdminFormField key={field} label={field}>
                    <AdminSwitch
                      checked={value}
                      onChange={(e) => updateField(key, field, e.target.checked)}
                    />
                  </AdminFormField>
                );
              }
              if (field === "content" || field === "note") {
                return (
                  <AdminFormField key={field} label={field}>
                    <AdminTextarea
                      rows={4}
                      value={value ?? ""}
                      onChange={(e) => updateField(key, field, e.target.value)}
                    />
                  </AdminFormField>
                );
              }
              return (
                <AdminFormField key={field} label={field.replace(/([A-Z])/g, " $1")}>
                  <AdminInput
                    type={typeof value === "number" ? "number" : "text"}
                    value={value ?? ""}
                    onChange={(e) =>
                      updateField(
                        key,
                        field,
                        typeof value === "number" ? Number(e.target.value) : e.target.value,
                      )
                    }
                  />
                </AdminFormField>
              );
            })}
          </AdminFormSection>
        ))}
      </div>
    </div>
  );
};

export default AdminSettingsView;
