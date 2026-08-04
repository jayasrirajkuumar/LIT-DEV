import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUserAuth } from "../../../hooks/useUserAuth";
import { useToast } from "../../../context/ToastContext";
import {
  createUserAddress,
  fetchUserAddresses,
  removeUserAddress,
  updateUserAddress,
} from "../../../services/addressService";
import { logPersistence, logPersistenceError } from "../../../utils/persistenceLogger";
import ProfileHeader from "./components/ProfileHeader";
import BackNavigation from "../../../components/layout/BackNavigation";
import AccountInformation from "./components/AccountInformation";
import ShippingSection from "./components/ShippingSection";
import OrderDetailsSection from "./components/OrderDetailsSection";
import ProfileCouponsSection from "./components/ProfileCouponsSection";
import ProfileWalletSection from "./components/ProfileWalletSection";
import ComingSoonSection from "./components/ComingSoonSection";
import "./Profile.css";
import "./ProfileProduction.css";

const Profile = () => {
  const {
    user,
    userProfile,
    displayName,
    displayEmail,
    avatarUrl,
    profileExtensions,
    updateProfile,
    saveAvatar,
    removeAvatar,
  } = useUserAuth();
  const { showToast } = useToast();

  const azureUserId = user?.sub || userProfile?.azureUserId;
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

  const addressDefaults = useMemo(
    () => ({
      fullName: displayName,
      phone: profileExtensions.phone || userProfile?.phone || "",
    }),
    [displayName, profileExtensions.phone, userProfile?.phone],
  );

  const loadAddresses = useCallback(async () => {
    if (!azureUserId) return;

    try {
      setAddressesLoading(true);
      setAddressError("");
      const list = await fetchUserAddresses();
      setAddresses(list);
      logPersistence("addresses", "Profile page state refreshed", { count: list.length });
    } catch (error) {
      setAddressError(error.message || "Failed to load addresses.");
      logPersistenceError("addresses", "loadAddresses failed", { message: error.message });
    } finally {
      setAddressesLoading(false);
    }
  }, [azureUserId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const memberSince = useMemo(
    () => userProfile?.createdAt || null,
    [userProfile?.createdAt],
  );

  const handleSaveProfile = async (updatedExtensions) => {
    if (!azureUserId) return;

    const nextExtensions = {
      username: updatedExtensions.username,
      phone: updatedExtensions.phone,
      country: updatedExtensions.country,
      bio: updatedExtensions.bio,
    };

    try {
      setProfileSaving(true);
      await updateProfile({
        name: updatedExtensions.displayName?.trim() || displayName,
        extensions: nextExtensions,
      });
      showToast("Profile saved to your account.");
    } catch (error) {
      showToast(error.message || "Failed to save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = async (address) => {
    if (!azureUserId) return;

    try {
      setAddressSaving(true);
      await createUserAddress(address, addressDefaults);
      await loadAddresses();
      showToast("Address added.");
    } catch (error) {
      showToast(error.message || "Failed to add address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleUpdateAddress = async (addressId, updates) => {
    if (!azureUserId) return;

    try {
      setAddressSaving(true);
      await updateUserAddress(addressId, updates, addressDefaults);
      await loadAddresses();
      showToast("Address updated.");
    } catch (error) {
      showToast(error.message || "Failed to update address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!azureUserId) return;

    try {
      setAddressSaving(true);
      await removeUserAddress(addressId);
      await loadAddresses();
      showToast("Address removed.");
    } catch (error) {
      showToast(error.message || "Failed to delete address.");
    } finally {
      setAddressSaving(false);
    }
  };

  return (
    <div className="profile-page profile-page-production">
      <main className="profile-content profile-content-production">
        <BackNavigation label="Back to Home" fallbackTo="/" />
        <ProfileHeader
          displayName={displayName}
          username={profileExtensions.username}
          avatarUrl={avatarUrl}
          onUploadAvatar={saveAvatar}
          onRemoveAvatar={removeAvatar}
        />

        <section className="profile-info-row profile-info-row-production">
          <div className="profile-info-cards-wrapper">
            <AccountInformation
              displayName={displayName}
              displayEmail={displayEmail}
              memberSince={memberSince}
              extensions={profileExtensions}
              onSave={handleSaveProfile}
              saving={profileSaving}
            />
            <ShippingSection
              addresses={addresses}
              loading={addressesLoading}
              saving={addressSaving}
              error={addressError}
              onAdd={handleAddAddress}
              onUpdate={handleUpdateAddress}
              onDelete={handleDeleteAddress}
            />
          </div>
        </section>

        <OrderDetailsSection />
        <ProfileCouponsSection />
        <ProfileWalletSection />
        <ComingSoonSection />
      </main>
    </div>
  );
};

export default Profile;
