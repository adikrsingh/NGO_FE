import { useState } from "react";
import axios from "axios";
import Card from "../components/common/Card";
import { Upload, Button, Select } from "antd";
import {
  UploadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

type Gender = "MALE" | "FEMALE" | "OTHER";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export default function AddStaff() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [pan, setPan] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender | undefined>();
  const [panError, setPanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // UI-only profile pic
  const [profilePic, setProfilePic] = useState<File | null>(null);

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

  const handleAddStaff = async () => {
    if (!name || !email || !designation || !pan || !phone || !gender) {
      alert("Please fill all required fields");
      return;
    }

    if (!PAN_REGEX.test(pan)) {
      setPanError("Invalid PAN format (ABCDE1234F)");
      return;
    }

    const payload = {
      name,
      email,
      designation,
      pan,
      phone,
      gender,
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/api/staff", payload);

      alert("Staff added successfully");

      // reset
      setName("");
      setEmail("");
      setDesignation("");
      setPan("");
      setPhone("");
      setGender(undefined);
      setProfilePic(null);
      setPanError(null);
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
        {/* LEFT: Form */}
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
                onChange={(e) =>
                  setDesignation(e.target.value)
                }
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
          <div className="staff-form-upload-title">
            Profile Picture
          </div>

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
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                Upload Profile Pic
              </Button>
            </Upload>
          </div>

          <div className="staff-form-hint">
            JPG / PNG only. Max size 5 MB.
          </div>
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
