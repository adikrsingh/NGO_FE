import { useNavigate } from "react-router-dom";
import { Button, Flex, Input, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { useDonars } from "./useDonar";
import { DonorType } from "./types";
import CustomTable from "../../components/Table";
import { ColumnsType } from "antd/es/table";
import { DonorService } from "../../api/donorApi";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_REGEX = /^\d{8,15}$/;

function DonorList() {
  const navigate = useNavigate();
  const { donars, isDonarsLoading } = useDonars();

  const {
    getDonorByPan,
    getDonorByPhone,
    searchDonorsByName,
  } = DonorService();

  const [searchValue, setSearchValue] = useState("");
  const [tableData, setTableData] = useState<DonorType[]>([]);

  /** Sync full list when cleared */
  useEffect(() => {
    if (!searchValue) {
      setTableData(donars ?? []);
    }
  }, [donars, searchValue]);

  /** Smart search logic */
  const performSearch = async () => {
    const value = searchValue.trim();

    if (!value) {
      setTableData(donars ?? []);
      return;
    }

    try {
      // PAN
      if (PAN_REGEX.test(value)) {
        const donor = await getDonorByPan(value);
        setTableData(donor ? [donor] : []);
        return;
      }

      // PHONE
      if (PHONE_REGEX.test(value)) {
        const donor = await getDonorByPhone(value);
        setTableData(donor ? [donor] : []);
        return;
      }

      // NAME (fallback)
      const donorsByName = await searchDonorsByName(value);
      setTableData(donorsByName ?? []);
    } catch (error) {
      message.warning("No donor found");
      setTableData([]);
    }
  };

  const columns: ColumnsType<DonorType> = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "PAN", dataIndex: "pan" },
    {
      title: "Tag",
      dataIndex: "donorTag",
      render: (tag: string) => (
        <Tag color="blue">{tag ?? "N/A"}</Tag>
      ),
    },
    {
      title: "PAN Verified",
      dataIndex: "panVerified",
      render: (verified: boolean | null) => (
        <Tag color={verified ? "green" : "default"}>
          {verified === null ? "N/A" : verified ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      render: (status: boolean | null) => (
        <Tag color={status ? "green" : "default"}>
          {status === null ? "N/A" : status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1>Donors</h1>

        <Flex gap="small" align="center">
          <Input
            placeholder="Search by PAN / Phone / Name"
            value={searchValue}
            onChange={(e) =>
              setSearchValue(e.target.value.toUpperCase())
            }
            onBlur={performSearch}
            onPressEnter={performSearch}
            allowClear
            style={{ width: 280 }}
          />

          <Button
            type="primary"
            onClick={() => navigate("/donors/new")}
          >
            Add Donor
          </Button>
        </Flex>
      </div>

      <CustomTable<DonorType>
        rowKey={(record) => record.id}
        columns={columns}
        data={tableData}
        loading={isDonarsLoading}
      />
    </>
  );
}

export default DonorList;
