import React from "react";
import { useNavigate } from "react-router-dom";
import AddProductForm from "./AddProductForm";

const AdminAddProductPage = () => {
  const navigate = useNavigate();

  return (
    <AddProductForm
      isOpen
      onClose={() => navigate("/admin/ecomDashboard/products")}
      onProductAdd={() => navigate("/admin/ecomDashboard/products")}
    />
  );
};

export default AdminAddProductPage;
