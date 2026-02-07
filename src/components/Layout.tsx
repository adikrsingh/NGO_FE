import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  PlusOutlined,
  LogoutOutlined,
  UserAddOutlined,
  BankOutlined,
  SettingOutlined,
  TagsOutlined, 
} from "@ant-design/icons";
import { Layout, Menu, Typography, Button, Space } from "antd";
import type { MenuProps } from "antd";
import dayjs from "dayjs";

const { Header, Content, Sider } = Layout;

/** ================= SIDEBAR MENU ================= */
const menuItems: MenuProps["items"] = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/donors", icon: <TeamOutlined />, label: "Donors" },
  { key: "/donations", icon: <DollarOutlined />, label: "Donations" },
  { key: "/analytics", icon: <BarChartOutlined />, label: "Analytics" },
  {key: "/reconcile",icon: <BankOutlined />,label: "Bank Reconciliation"},
  
  { key: "admin",icon: <SettingOutlined />, label: "Admin / Settings",
      children: [
      {
        key: "/admin/donation-categories",
        icon: <TagsOutlined />,
        label: "Donation Categories",
      },
    ],
  },
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /** ================= ACTIVE MENU LOGIC ================= */
  const selectedKey =
    menuItems
      .map((item) => String(item?.key))
      .find(
        (key) =>
          location.pathname === key ||
          location.pathname.startsWith(`${key}/`)
      ) ?? "/";

  const handleLogout = () => {
    console.log("Logout");
    // future:
    // localStorage.clear();
    // navigate("/login");
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {/* ================= HEADER ================= */}
      <Header
        style={{
          background: "#fff",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {/* Left section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            The Earth Saviours Foundation
          </Typography.Title>
          <Typography.Text type="secondary">
            Welcome back. Here's your operational snapshot for today.
          </Typography.Text>
        </div>

        {/* Right section */}
        <Space size="middle">
          <Typography.Text type="secondary">
            {dayjs().format("dddd, DD MMMM YYYY")}
          </Typography.Text>

          <Button
            icon={<UserAddOutlined />}
            onClick={() => navigate("/donors/new")}
          >
            Add Donor
          </Button>

          <Button
            type="primary"
            danger
            icon={<PlusOutlined />}
            onClick={() => navigate("/donations/new")}
          >
            Add Donation
          </Button>

          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={() => navigate("/add-staff")}
          >
            Add Staff
          </Button>

          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Log out
          </Button>
        </Space>
      </Header>

      {/* ================= BODY ================= */}
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          width={220}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => navigate(String(key))}
          />
        </Sider>

        <Layout>
          <Content style={{ margin: 16 }}>
            <div
              style={{
                padding: 24,
                height: "calc(100vh - 120px)",
                background: "#fff",
                borderRadius: 8,
                overflowY: "auto",
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
