import React from "react";
import { AdminConfirmModal } from "../admin-ui/AdminModal";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
}) => (
  <AdminConfirmModal
    open={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete product"
    description={`Are you sure you want to archive "${productName}"? This will remove it from the active catalog.`}
    confirmLabel="Confirm Delete"
    cancelLabel="Cancel"
    danger
  />
);

export default DeleteConfirmationModal;
