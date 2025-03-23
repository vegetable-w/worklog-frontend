/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
  Table,
  Typography,
  Button,
  Modal,
  Form,
  Select,
  TimePicker,
  Tag,
  message,
  Input,
  Image,
} from "antd";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

function PunchRecords() {
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPunchRecords = async () => {
      if (!user?.id) return;

      try {
        const response = await axios.get(
          `https://worklog-46a33507b1c1.herokuapp.com/api/v1/punch/${user.id}`
        );
        setRecords(response.data.data);
      } catch (error) {
        console.error("打刻履歴の取得に失敗しました:", error);
        message.error("打刻履歴の取得に失敗しました");
      }
    };

    fetchPunchRecords();
  }, [user?.id]);

  const handleRecordClick = (record) => {
    if (record.is_business_trip) {
      setSelectedRecord(record);
      setModalVisible(true);
    }
  };

  const groupedRecords = Object.values(
    records.reduce((acc, record) => {
      if (!acc[dayjs(record.punch_date).format("YYYY-MM-DD")]) {
        acc[dayjs(record.punch_date).format("YYYY-MM-DD")] = {
          key: dayjs(record.punch_date).format("YYYY-MM-DD"),
          date: dayjs(record.punch_date).format("YYYY-MM-DD"),
          records: [],
        };
      }
      acc[dayjs(record.punch_date).format("YYYY-MM-DD")].records.push({
        ...record,
        time: dayjs(record.punch_time).format("HH:mm"),
      });
      return acc;
    }, {})
  );

  const handleOpenModal = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
    form.setFieldsValue({ date, type: "", time: null });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const date = dayjs(values.date);
      const time = dayjs(values.time);

      const punchDateTime = dayjs(
        `${date.format("YYYY-MM-DD")} ${time.format("HH:mm:ss")}`
      );

      const payload = {
        id: user?.id,
        type: values.type,
        punch_time: punchDateTime.toLocaleString(),
        punch_date: date.format("YYYY-MM-DD"),
        is_manual: true,
        approved: false,
        manual_reason: values.manual_reason,
      };

      const response = await axios.post(
        "https://worklog-46a33507b1c1.herokuapp.com/api/v1/punch",
        payload
      );

      const newRecord = response.data;

      setRecords([...records, newRecord]);
      setIsModalOpen(false);
      form.resetFields();
      message.success("打刻記録を追加しました");
    } catch (error) {
      console.error("追加エラー:", error);
      message.error("打刻記録の追加に失敗しました");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "確認",
      content: "この打刻記録を削除しますか？",
      okText: "削除",
      okType: "danger",
      cancelText: "キャンセル",
      onOk: async () => {
        try {
          await axios.delete(
            `https://worklog-46a33507b1c1.herokuapp.com/api/v1/punch/${user.id}/${id}`
          );

          setRecords((prev) => prev.filter((record) => record.id !== id));
          message.success("打刻記録を削除しました");
        } catch (err) {
          console.error("削除エラー", err);
          message.error("削除に失敗しました");
        }
      },
    });
  };

  const columns = [
    {
      title: "日時",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>打刻履歴</Title>
      <Table
        dataSource={groupedRecords}
        columns={columns}
        rowKey="key"
        expandable={{
          expandedRowRender: (record) => (
            <>
              <Table
                dataSource={record.records}
                columns={[
                  {
                    title: "打刻種類",
                    dataIndex: "type",
                    key: "type",
                    render: (text, record) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: record.is_business_trip
                            ? "pointer"
                            : "default",
                        }}
                        onClick={() =>
                          record.is_business_trip && handleRecordClick(record)
                        }
                      >
                        {text}
                        {record.is_manual && (
                          <Tag
                            color={record.approved ? "blue" : "red"}
                            style={{ marginLeft: 8 }}
                          >
                            {record.approved ? "承認済" : "要承認"}
                          </Tag>
                        )}
                        {record.is_business_trip && (
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            出張打刻
                          </Tag>
                        )}
                      </div>
                    ),
                  },
                  { title: "打刻時間", dataIndex: "time", key: "time" },
                  {
                    title: "操作",
                    render: (_, record) => (
                      <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record.id)}
                      >
                        削除
                      </Button>
                    ),
                  },
                ]}
                pagination={false}
                rowKey={(r) => r.id}
              />
              <Button
                type="dashed"
                onClick={() => handleOpenModal(record.date)}
                style={{ marginTop: 10 }}
              >
                + 追加打刻
              </Button>
            </>
          ),
          rowExpandable: (record) => record.records.length > 0,
        }}
      />

      <Modal
        title="追加打刻"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="日時">
            <span>{selectedDate}</span>
          </Form.Item>
          <Form.Item
            name="type"
            label="打刻種類"
            rules={[{ required: true, message: "種類を選択してください" }]}
          >
            <Select placeholder="選択してください">
              <Option value="出勤">出勤</Option>
              <Option value="退勤">退勤</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="time"
            label="打刻時間"
            rules={[{ required: true, message: "時間を入力してください" }]}
          >
            <TimePicker format="HH:mm" showNow={false} />
          </Form.Item>

          <Form.Item
            label="理由"
            name="manual_reason"
            rules={[{ required: true, message: "理由を入力してください" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={modalVisible}
        title="出張打刻詳細"
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedRecord?.image_url ? (
          <Image
            src={selectedRecord.image_url}
            alt="打刻写真"
            style={{ marginBottom: 12 }}
          />
        ) : (
          <p>画像なし</p>
        )}
        <p>
          <strong>メモ:</strong> {selectedRecord?.memo || "なし"}
        </p>
      </Modal>
    </div>
  );
}

export default PunchRecords;
