import React, { useEffect, useState } from "react";
import { List, Modal, Button, message, Tag } from "antd";
import axios from "axios";
import dayjs from "dayjs";

function TripApproval() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTrips = async () => {
    try {
      const res = await axios.get(
        "https://worklog-46a33507b1c1.herokuapp.com/api/v1/business-trip"
      );
      const unapproved = res.data.data.filter(
        (trip) => trip.approved === false
      );
      setTrips(unapproved);
    } catch (err) {
      console.error("出張データ取得エラー:", err);
      message.error("出張申請の取得に失敗しました");
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleApprove = async () => {
    if (!selectedTrip) return;
    setLoading(true);
    try {
      await axios.patch(
        `http://localhost:3000/api/v1/business-trip/${selectedTrip.id}`,
        { approved: true }
      );
      message.success("出張申請が承認されました");
      setModalVisible(false);
      setSelectedTrip(null);
      fetchTrips();
    } catch (err) {
      console.error("承認失敗:", err);
      message.error("承認に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>出張申請承認</h2>
      <List
        bordered
        dataSource={trips}
        renderItem={(item) => (
          <List.Item
            onClick={() => {
              setSelectedTrip(item);
              setModalVisible(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <strong>
              {item.employee_number} - {item.name}
            </strong>
            ：{item.destination}（{dayjs(item.trip_start).format("YYYY-MM-DD")}
            〜{dayjs(item.trip_end).format("YYYY-MM-DD")})
            <Tag color="orange" style={{ marginLeft: 8 }}>
              未承認
            </Tag>
          </List.Item>
        )}
      />

      <Modal
        title="出張申請の詳細"
        open={modalVisible}
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
        {selectedTrip && (
          <div>
            <p>
              <strong>従業員番号：</strong>
              {selectedTrip.employee_number}
            </p>
            <p>
              <strong>氏名：</strong>
              {selectedTrip.name}
            </p>
            <p>
              <strong>目的地：</strong>
              {selectedTrip.destination}
            </p>
            <p>
              <strong>期間：</strong>
              {dayjs(selectedTrip.trip_start).format("YYYY-MM-DD")} 〜{" "}
              {dayjs(selectedTrip.trip_end).format("YYYY-MM-DD")}
            </p>
            <p>
              <strong>理由：</strong>
              {selectedTrip.reason}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TripApproval;
