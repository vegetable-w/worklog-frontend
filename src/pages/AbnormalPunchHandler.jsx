import React, { useEffect, useState } from "react";
import { List, Tag, Modal, Button, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

function AbnormalPunchHandler() {
  const [abnormalRecords, setAbnormalRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAbnormalPunches = async () => {
    try {
      const res = await axios.get(
        "https://worklog-46a33507b1c1.herokuapp.com/api/v1/punch"
      );
      const filtered = res.data.data.filter(
        (p) => p.is_manual === true && p.approved === false
      );
      setAbnormalRecords(filtered);
    } catch (err) {
      console.error("データ取得エラー:", err);
      message.error("異常打刻の取得に失敗しました");
    }
  };

  useEffect(() => {
    fetchAbnormalPunches();
  }, []);

  const handleApprove = async () => {
    if (!selectedRecord) return;
    setLoading(true);
    try {
      await axios.patch(
        `https://worklog-46a33507b1c1.herokuapp.com/api/v1/punch/${selectedRecord.id}/approve`
      );
      message.success("打刻が承認されました!");
      setModalVisible(false);
      setSelectedRecord(null);
      fetchAbnormalPunches(); // 刷新列表
    } catch (err) {
      console.error("承認失敗:", err);
      message.error("承認に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>異常打刻の承認</h2>
      <List
        bordered
        dataSource={abnormalRecords}
        renderItem={(item) => (
          <List.Item
            onClick={() => {
              setSelectedRecord(item);
              setModalVisible(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <strong>
              {item.employee_number} - {item.name}
            </strong>{" "}
            / {item.type}（
            {dayjs(item.punch_time).format("YYYY-MM-DD HH:mm:ss")}）
            <Tag color="yellow" style={{ marginLeft: 10 }}>
              異常打刻
            </Tag>
          </List.Item>
        )}
      />

      <Modal
        open={modalVisible}
        title="異常打刻の詳細"
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            キャンセル
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={loading}
            onClick={handleApprove}
          >
            承認
          </Button>,
        ]}
      >
        {selectedRecord && (
          <div>
            <p>
              <strong>従業員番号：</strong>
              {selectedRecord.employee_number}
            </p>
            <p>
              <strong>氏名：</strong>
              {selectedRecord.name}
            </p>
            <p>
              <strong>打刻種類：</strong>
              {selectedRecord.type}
            </p>
            <p>
              <strong>打刻日時：</strong>
              {dayjs(selectedRecord.punch_time).format("YYYY-MM-DD HH:mm:ss")}
            </p>
            <p>
              <strong>理由：</strong>
              {selectedRecord.manual_reason}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AbnormalPunchHandler;
