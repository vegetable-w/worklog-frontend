/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from "react";
import dayjs from "dayjs";
import { Card, Space, Typography, Button, Radio } from "antd";
import { AuthContext } from "../context/AuthContext";

const { Title } = Typography;

function PunchClock({ onPunch }) {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [punchType, setPunchType] = useState("出勤");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = () => {
    onPunch(punchType);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Card
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "left",
          padding: "15px",
        }}
      >
        <Space>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user.name}
            </Title>
            <Typography.Text type="secondary">
              従業員番号: {user.employee_number}
            </Typography.Text>
          </div>
        </Space>
      </Card>

      <div style={{ marginTop: "20px" }}>
        <Radio.Group
          value={punchType}
          onChange={(e) => setPunchType(e.target.value)}
        >
          <Radio.Button value="出勤">出勤</Radio.Button>
          <Radio.Button value="退勤">退勤</Radio.Button>
        </Radio.Group>
      </div>

      <div
        style={{
          marginTop: "100px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          type="primary"
          size="large"
          shape="circle"
          onClick={handlePunch}
          style={{
            width: "200px",
            height: "200px",
            fontSize: "22px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            flexDirection: "column",
          }}
        >
          <div>{punchType}</div>
          <div style={{ fontSize: "16px", marginTop: "5px" }}>
            {currentTime.format("HH:mm:ss")}
          </div>
        </Button>
      </div>
    </div>
  );
}

export default PunchClock;
