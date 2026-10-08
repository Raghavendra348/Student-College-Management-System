import { useEffect, useState } from "react";
import { getProfileApi, updateProfileApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./index.css";

const Profile = () => {
  const { currentUser, login, token } = useAuth();

  const [profileData, setProfileData] = useState({
    collegeName: "",
    email: "",
    contactNumber: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setProfileError("");

      const response = await getProfileApi();
      if (response && response.success && response.user) {
        const u = response.user;
        setProfileData({
          collegeName: u.collegeName || "",
          email: u.email || "",
          contactNumber: u.contactNumber || "",
          address: u.address || "",
        });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      if (currentUser) {
        setProfileData({
          collegeName: currentUser.collegeName || "",
          email: currentUser.email || "",
          contactNumber: currentUser.contactNumber || "",
          address: currentUser.address || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileData.collegeName.trim()) {
      setProfileError("College Name is required.");
      return;
    }

    try {
      setProfileSaving(true);
      const response = await updateProfileApi({
        collegeName: profileData.collegeName.trim(),
        contactNumber: profileData.contactNumber.trim(),
        address: profileData.address.trim(),
      });

      if (response && response.success) {
        setProfileSuccess("College profile updated successfully.");
        if (response.user) {
          login(token, response.user);
        }
      } else {
        setProfileError(response?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setProfileError(err.message || "Failed to update college profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      const response = await updateProfileApi({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response && response.success) {
        setPasswordSuccess("Password changed successfully.");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(response?.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading college profile...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">College Profile</h1>
          <p className="page-description">
            View and update college account information.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", maxWidth: "800px" }}>
        {/* College Profile Form */}
        <div className="card">
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
            College Information
          </h2>

          {profileError && <div className="alert alert-danger">{profileError}</div>}
          {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="collegeName">College Name *</label>
              <input
                id="collegeName"
                type="text"
                name="collegeName"
                className="form-control"
                value={profileData.collegeName}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">College Email</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-control"
                value={profileData.email}
                disabled
                style={{ backgroundColor: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                id="contactNumber"
                type="text"
                name="contactNumber"
                className="form-control"
                placeholder="e.g. +91 9876543210"
                value={profileData.contactNumber}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                rows="3"
                className="form-control"
                placeholder="College campus address..."
                value={profileData.address}
                onChange={handleProfileChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={profileSaving}
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
            Change Password
          </h2>

          {passwordError && <div className="alert alert-danger">{passwordError}</div>}
          {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password *</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                className="form-control"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={passwordSaving}
            >
              {passwordSaving ? "Updating Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
