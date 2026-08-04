import React from "react";
import { AdminEmptyState } from "../admin-ui";
import AdminSettingsView from "./AdminSettingsView";

export const Analytics = () => (
  <AdminEmptyState title="Analytics" description="Advanced analytics coming soon." compact />
);
export const Offers = () => (
  <AdminEmptyState title="Offers" description="Promotional offers management coming soon." compact />
);
export const Sales = () => (
  <AdminEmptyState title="Sales" description="Sales reporting coming soon." compact />
);
export const Newsletter = () => (
  <AdminEmptyState title="Newsletter" description="Newsletter admin coming soon." compact />
);
export const Settings = AdminSettingsView;
