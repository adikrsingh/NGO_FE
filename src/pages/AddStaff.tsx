import { useMemo, useState } from "react";
import { addStaff } from "../api/staffApi";
import Card from "../components/common/Card";
import { Upload, Button, Select } from "antd";
import { useApi } from "../api/useApi";
import { UploadOutlined, UserAddOutlined } from "@ant-design/icons";

type Gender = "MALE" | "FEMALE" | "OTHER";

// const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export default function AddStaff() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
//   const [pan, setPan] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender | undefined>();
//   const [panError, setPanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [savedProfilePicUrl, setSavedProfilePicUrl] = useState<string | null>(null);
  const { baseApi } = useApi();

  const handlePanChange = (value: string) => {
      const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setPan(formatted);
      setPanError(null);
    };

    const handlePanBlur = () => {
      if (!pan) {
        setPanError("PAN is required");
        return;
      }
      if (!PAN_REGEX.test(pan)) {
        setPanError("Invalid PAN format (ABCDE1234F)");
      }
    };

  const profilePreviewUrl = useMemo(
    () => (profilePic ? URL.createObjectURL(profilePic) : null),
    [profilePic]
  );

  const handleAddStaff = async () => {
    if (!name || !email || !designation || !phone || !gender) {
      alert("Please fill all required fields");
      return;
    }

//    if (!PAN_REGEX.test(pan)) {
//          setPanError("Invalid PAN format (ABCDE1234F)");
//          return;
//     }

    if (!profilePic) {
      alert("Please upload a profile picture");
      return;
    }

    const staffPayload = {
      name,
      email,
      designation,
      phone,
      gender,
      // pan intentionally removed as requested.
      // pan,
    };

    const formData = new FormData();
    formData.append(
      "staff",
      new Blob([JSON.stringify(staffPayload)], {
        type: "application/json",
      })
    );
    formData.append("profilePic", profilePic);

    try {
      setLoading(true);
      const response = await baseApi({
        "Content-Type": "multipart/form-data",
      }).post("/staff", formData);

      const createdStaffId = response?.data?.staffId;
      const baseUrl = baseApi().defaults.baseURL || "";
      if (createdStaffId) {
        setSavedProfilePicUrl(`${baseUrl}/staff/${createdStaffId}/profile-pic?ts=${Date.now()}`);
      }

      const authPayload = {
        username: name.replace(/\s+/g, "_").toLowerCase(),
        email,
        enabled: true,
        credentials: [
          {
            type: "password",
            value: "SecurePassword123!",
            temporary: false,
          },
        ],
      };

      try {
        await addStaff(authPayload, "mygroup");
      } catch (authErr) {
        console.error("Auth API failed", authErr);
        // Optionally show a warning, but don't block DB success
      }

      alert("Staff added successfully");
      setName("");
      setEmail("");
      setDesignation("");
//       setPan("");
      setPhone("");
      setGender(undefined);
      setProfilePic(null);
//       setPanError(null);
      setSavedProfilePicUrl(null);
    } catch (err) {
      console.error("Failed to add staff", err);
      alert("Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Add New Staff">
      <div className="staff-form-wrapper">
        <div className="staff-form-left">
          <div className="staff-form-grid">
            <div className="staff-form-group">
              <label>Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="staff-form-group">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email address"
              />
            </div>

            <div className="staff-form-group">
              <label>Phone *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Phone Number"
              />
            </div>

            {/* Comenting out PAN as client dont need currently */}

            {/* <div className="staff-form-group">
              <label>PAN *</label>
              <input
                value={pan}
                maxLength={10}
                placeholder="ABCDE1234F"
                onChange={(e) =>
                  handlePanChange(e.target.value)
                }
                onBlur={handlePanBlur}
                style={{
                  borderColor: panError ? "#dc2626" : undefined,
                }}
              />
              {panError && (
                <small className="staff-form-error">
                  {panError}
                </small>
              )}
            </div> */}

            <div className="staff-form-group">
              <label>Designation *</label>
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Enter Designation"
              />
            </div>

            <div className="staff-form-group">
              <label>Gender *</label>
              <Select
                value={gender}
                onChange={(v) => setGender(v)}
                style={{ width: "100%" }}
                options={[
                  { label: "Male", value: "MALE" },
                  { label: "Female", value: "FEMALE" },
                  { label: "Other", value: "OTHER" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Profile Pic (UI only) */}
        <div className="staff-form-right">
          <div className="staff-form-upload-title">Profile Picture</div>

          <div className="staff-form-upload-action">
            <Upload
              beforeUpload={(file) => {
                const isValidSize = file.size / 1024 / 1024 < 5;
                if (!isValidSize) {
                  alert("Profile picture must be less than 5 MB");
                  return Upload.LIST_IGNORE;
                }
                setProfilePic(file);
                return false;
              }}
              showUploadList={false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Profile Pic</Button>
            </Upload>
          </div>

          <div className="staff-form-hint">JPG / PNG only. Max size 5 MB.</div>

          {profilePreviewUrl && (
            <img
              src={profilePreviewUrl}
              alt="Selected profile"
              style={{ marginTop: 12, width: 140, height: 140, objectFit: "cover", borderRadius: 8 }}
            />
          )}

          {!profilePreviewUrl && savedProfilePicUrl && (
            <img
              src={savedProfilePicUrl}
              alt="Saved profile"
              style={{ marginTop: 12, width: 140, height: 140, objectFit: "cover", borderRadius: 8 }}
            />
          )}
        </div>
      </div>

      <Button
        type="primary"
        icon={<UserAddOutlined />}
        loading={loading}
        onClick={handleAddStaff}
        style={{ marginTop: 24 }}
      >
        Add Staff
      </Button>
    </Card>
  );
}
