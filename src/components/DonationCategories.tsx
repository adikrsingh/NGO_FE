import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useApi } from "../api/useApi";

const { Title, Text } = Typography;

/* ================= TYPES ================= */

interface DonationCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

interface DonationCategoryRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

/* ================= COMPONENT ================= */

export default function DonationCategories() {
  const { baseApi } = useApi();

  const [categories, setCategories] = useState<DonationCategory[]>([]);
  const [loading, setLoading] = useState(false);

  /** Modal state */
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<DonationCategory | null>(null);

  const [form] = Form.useForm<DonationCategoryRequest>();

  /* ================= API ================= */

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await baseApi().get("/donation-categories");
      setCategories(res.data);
    } catch {
      message.error("Failed to load donation categories");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (values: DonationCategoryRequest) => {
    try {
      await baseApi().post("/donation-categories", values);
      message.success("Donation category created");
      closeModal();
      fetchCategories();
    } catch {
      message.error("Failed to create category");
    }
  };

  const updateCategory = async (
    id: number,
    values: DonationCategoryRequest
  ) => {
    try {
      await baseApi().put(`/donation-categories/${id}`, values);
      message.success("Donation category updated");
      closeModal();
      fetchCategories();
    } catch {
      message.error("Failed to update category");
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await baseApi().delete(`/donation-categories/${id}`);
      message.success("Donation category deleted");
      fetchCategories();
    } catch {
      message.error("Failed to delete category");
    }
  };

  const toggleStatus = async (category: DonationCategory) => {
    const payload: DonationCategoryRequest = {
      name: category.name,
      description: category.description,
      isActive: !category.isActive,
    };

    try {
      await baseApi().put(
        `/donation-categories/${category.id}`,
        payload
      );
      message.success("Status updated");
      fetchCategories();
    } catch {
      message.error("Failed to update status");
    }
  };

  /* ================= HELPERS ================= */

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (category: DonationCategory) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text: string) =>
        text ? text : <Text type="secondary">—</Text>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Actions",
      render: (_: any, record: DonationCategory) => (
        <Space>
          <Switch
            checked={record.isActive}
            onChange={() => toggleStatus(record)}
          />

          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />

          <Popconfirm
            title="Delete this category?"
            description="This action cannot be undone."
            onConfirm={() => deleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>
            Donation Categories
          </Title>
          <Text type="secondary">
            Manage categories used in donations
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Add Category
        </Button>
      </Space>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={categories}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* ================= MODAL ================= */}
      <Modal
        title={
          editingCategory ? "Edit Donation Category" : "Add Donation Category"
        }
        open={open}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingCategory ? "Update" : "Create"}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
          onFinish={(values) =>
            editingCategory
              ? updateCategory(editingCategory.id, values)
              : createCategory(values)
          }
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Active"
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
