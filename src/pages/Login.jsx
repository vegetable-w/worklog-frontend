/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const { Title } = Typography;

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form] = Form.useForm();

  const fillEmpolyeeAccount = () => {
    form.setFieldsValue({
      email: "employee@example.com",
      password: "pswd1234",
    });
  };

  const fillAdminAccount = () => {
    form.setFieldsValue({
      email: "admin@example.com",
      password: "pswd1234",
    });
  };

  const onSubmit = async (values) => {
    try {
      const response = await axios.post(
        "https://worklog-46a33507b1c1.herokuapp.com/api/v1/users/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      const { token, data } = response.data;

      login(token, data);

      message.success("ログインしました！");
      navigate("/dashboard");
    } catch (error) {
      message.error("ログインに失敗しました");
      console.error("Login error:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 350, padding: "20px", textAlign: "center" }}>
        <Title level={3}>ログイン</Title>
        <Form
          form={form}
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={onSubmit}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "メールアドレスを入力してください" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="メールアドレス" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "パスワードを入力してください" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="パスワード"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              ログイン
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="default" block onClick={fillEmpolyeeAccount}>
              従業員アカウント
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="default" block onClick={fillAdminAccount}>
              管理員アカウント
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
