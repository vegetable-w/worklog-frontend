import React, { useEffect, useState } from "react";
import { Collapse, Tag, message, Modal, Image } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Panel } = Collapse;

function AdminPunchRecords() {
  const [records, setRecords] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "https://worklog-46a33507b1c1.herokuapp.com/api/v1/punch"
        );
        const filtered = res.data.data.filter(
          (r) => !r.is_manual || (r.is_manual && r.approved === true)
        );

        const group = {};
        filtered.forEach((r) => {
          const empKey = `${r.employee_number} - ${r.name}`;
          const dateKey = dayjs(r.punch_date).format("YYYY-MM-DD");

          if (!group[empKey]) group[empKey] = {};
          if (!group[empKey][dateKey]) group[empKey][dateKey] = [];
          group[empKey][dateKey].push(r);
        });

        setGrouped(group);
        setRecords(filtered);
      } catch (err) {
        console.error("データの取得エラー", err);
        message.error("データの取得に失敗しました");
      }
    };

    fetchData();
  }, []);

  const handleRecordClick = (record) => {
    if (record.is_business_trip) {
      setSelectedRecord(record);
      setModalVisible(true);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>従業員打刻履歴</h2>
      <Collapse accordion>
        {Object.entries(grouped).map(([employee, dates]) => (
          <Panel header={employee} key={employee}>
            <Collapse>
              {Object.entries(dates).map(([date, punchList]) => (
                <Panel header={date} key={date}>
                  {punchList.map((record) => {
                    const clickable = record.is_business_trip;
                    return (
                      <div
                        key={record.id}
                        onClick={() => clickable && handleRecordClick(record)}
                        style={{
                          padding: "8px 12px",
                          marginBottom: 8,
                          border: "1px solid #eee",
                          borderRadius: 6,
                          cursor: clickable ? "pointer" : "default",
                          background: clickable ? "#fafafa" : "#f5f5f5",
                        }}
                      >
                        <strong>{record.type}</strong> -{" "}
                        {dayjs(record.punch_time).format("HH:mm:ss")}
                        {record.is_business_trip && (
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            出張打刻
                          </Tag>
                        )}
                      </div>
                    );
                  })}
                </Panel>
              ))}
            </Collapse>
          </Panel>
        ))}
      </Collapse>

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

export default AdminPunchRecords;
