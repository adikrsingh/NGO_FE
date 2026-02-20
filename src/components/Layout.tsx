import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role") || "STAFF";

  /** ================= ROLE-BASED SIDEBAR ================= */
    const menuItems: MenuProps["items"] = [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/donors", icon: <TeamOutlined />, label: "Donors" },
    { key: "/donations", icon: <DollarOutlined />, label: "Donations" },
    { key: "/analytics", icon: <BarChartOutlined />, label: "Analytics" },

    //  STAFF Reconciliation
    role === "STAFF"
      ? {
          key: "reconciliation",
          label: "Unclaimed List",
          icon: <BankOutlined />,
          children: [
            {
              key: "/reconcile",
              label: <Link to="/reconcile">Unclaimed</Link>,
            },
            {
              key: "/my-claims",
              label: <Link to="/my-claims">My Claims</Link>,
            },
          ],
        }
      : {
          key: "/reconcile",
          icon: <BankOutlined />,
          label: "Reconciliation",
        },

    //  Actions
    role === "STAFF"
      ? {
          key: "/actions",
          icon: <SettingOutlined />,
          label: "Actions",
        }
      : {
          key: "/actions",
          icon: <SettingOutlined />,
          label: "Action Monitoring",
        },

    //  Admin Settings (ADMIN only)
    role === "ADMIN" && {
      key: "admin",
      icon: <SettingOutlined />,
      label: "Admin / Settings",
      children: [
        {
          key: "/admin/donation-categories",
          icon: <TagsOutlined />,
          label: "Donation Categories",
        },
      ],
    },
  ].filter(Boolean);


  /** ================= ACTIVE MENU LOGIC ================= */
  const selectedKey =
    menuItems
      ?.flatMap((item: any) =>
        item.children
          ? item.children.map((c: any) => c.key)
          : item.key
      )
      .find(
        (key: string) =>
          location.pathname === key ||
          location.pathname.startsWith(`${key}/`)
      ) ?? "/";

  const handleLogout = async () => {
    try {
      await fetch(
        "https://auth-central-production.up.railway.app/authcentral/token",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tenantName: "testthree" }),
        }
      );

      window.location.href =
        "https://keycloak-production-5919.up.railway.app/realms/testthree/protocol/openid-connect/logout?redirect_uri=https://tesfngo.netlify.app";

      window.history.replaceState({}, document.title, "/");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            The Earth Saviours Foundation
          </Typography.Title>
          <Typography.Text type="secondary">
            Welcome back. Here's your operational snapshot for today.
          </Typography.Text>
        </div>

        {/* Right */}
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

          {role === "ADMIN" && (
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => navigate("/add-staff")}
            >
              Add Staff
            </Button>
          )}

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
