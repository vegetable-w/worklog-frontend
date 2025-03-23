/* eslint-disable react/prop-types */
import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Form, Input, DatePicker, Button, message } from "antd";

const BusinessTripForm = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);

  const handleSubmit = async (values) => {
    if (!user) return;

    try {
      const payload = {
        id: user.id,
        name: user.name,
        destination: values.destination,
        trip_start: values.tripDates[0].format("YYYY-MM-DD"),
        trip_end: values.tripDates[1].format("YYYY-MM-DD"),
        reason: values.reason,
      };

      await axios.post(
        "https://worklog-46a33507b1c1.herokuapp.com/api/v1/business-trip",
        payload
      );

      message.success("出張申請が送信されました!");
      form.resetFields();
      onSubmit?.(payload);
    } catch (error) {
      console.error("出張申請送信エラー:", error);
      message.error("出張申請の送信に失敗しました");
    }
  };

  return (
    <div>
      <h2>出張申請</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="出張先の住所（詳細）"
          name="destination"
          rules={[{ required: true, message: "出張先を入力してください" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="出張日時"
          name="tripDates"
          rules={[{ required: true, message: "出張日時を選択してください" }]}
        >
          <DatePicker.RangePicker />
        </Form.Item>

        <Form.Item
          label="出張原因"
          name="reason"
          rules={[{ required: true, message: "出張原因を入力してください" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            提出
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BusinessTripForm;
