/* eslint-disable react/prop-types */
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

import { Layout, Menu, message, ConfigProvider } from "antd";
import {
  ClockCircleOutlined,
  ProfileOutlined,
  FormOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import jaJP from "antd/locale/ja_JP";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import PunchRecords from "./PunchRecords";
import PunchClock from "./PunchClock";
import BusinessTripForm from "./BusinessTripForm";
import BusinessTripPunchClock from "./BusinessTripPunchClock";
import AdminPunchRecords from "./AdminPunchRecords";
import TripApproval from "./TripApproval";
import AbnormalPunchHandler from "./AbnormalPunchHandler";

const { Sider, Content, Header } = Layout;

dayjs.extend(utc);

function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState("home");
  const today = dayjs().format("YYYY-MM-DD");

  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePunch = async (punchType) => {
    try {
      await axios.post(
        "https://worklog-46a33507b1c1.herokuapp.com/api/v1/punch",
        {
          id: user?.id,
          type: punchType,
          punch_time: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
          punch_date: today,
        }
      );

      message.success(`${punchType} 打刻しました！`);
    } catch (error) {
      console.error("打刻エラー:", error);
      message.error("打刻に失敗しました");
    }
  };

  return (
    <ConfigProvider locale={jaJP}>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            textAlign: "right",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontWeight: "bold", marginRight: 8 }}>
            {user?.name}
          </span>
          <span style={{ fontSize: "0.9em" }}>
            従業員番号: {user?.employee_number}
          </span>
          <span
            style={{ color: "#1890ff", cursor: "pointer" }}
            onClick={handleLogout}
          >
            ログアウト
          </span>
        </Header>

        <Layout>
          <Sider theme="light">
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[selectedMenu]}
              onClick={(e) => setSelectedMenu(e.key)}
            >
              {isAdmin ? (
                <>
                  <Menu.Item key="admin-records" icon={<ProfileOutlined />}>
                    従業員打刻履歴
                  </Menu.Item>
                  <Menu.Item key="trip-approval" icon={<FormOutlined />}>
                    出張申請承認
                  </Menu.Item>
                  <Menu.Item key="abnormal" icon={<ClockCircleOutlined />}>
                    異常打刻処理
                  </Menu.Item>
                </>
              ) : (
                <>
                  <Menu.Item key="home" icon={<ClockCircleOutlined />}>
                    打刻
                  </Menu.Item>
                  <Menu.Item key="records" icon={<ProfileOutlined />}>
                    打刻履歴
                  </Menu.Item>
                  <Menu.Item key="businessTrip" icon={<FormOutlined />}>
                    出張申請
                  </Menu.Item>
                  <Menu.Item
                    key="businessTripPunch"
                    icon={<CarryOutOutlined />}
                  >
                    出張打刻
                  </Menu.Item>
                </>
              )}
            </Menu>
          </Sider>
          <Content style={{ padding: "20px" }}>
            <Content style={{ padding: "20px" }}>
              {isAdmin ? (
                selectedMenu === "admin-records" ? (
                  <AdminPunchRecords />
                ) : selectedMenu === "trip-approval" ? (
                  <TripApproval />
                ) : (
                  <AbnormalPunchHandler />
                )
              ) : selectedMenu === "home" ? (
                <PunchClock onPunch={handlePunch} />
              ) : selectedMenu === "records" ? (
                <PunchRecords />
              ) : selectedMenu === "businessTrip" ? (
                <BusinessTripForm />
              ) : (
                <BusinessTripPunchClock />
              )}
            </Content>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default Dashboard;
