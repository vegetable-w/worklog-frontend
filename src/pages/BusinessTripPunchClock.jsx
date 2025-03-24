/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  message,
  Upload,
  Input,
  Form,
  Spin,
  Select,
  Modal,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { AuthContext } from "../context/AuthContext";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ALLOWED_RADIUS = 50000;

const BusinessTripPunchClock = () => {
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm:ss"));
  const [image, setImage] = useState(null);
  const [remark, setRemark] = useState("");
  const [punchType, setPunchType] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [trip, setTrip] = useState(null);
  const [tripStatus, setTripStatus] = useState("loading");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [targetLatLng, setTargetLatLng] = useState(null);

  const { Option } = Select;

  const { user } = useContext(AuthContext);

  const today = dayjs();

  useEffect(() => {
    const current = dayjs().format("YYYY年MM月DD日");
    setCurrentDay(current);
  }, []);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(
          `https://worklog-46a33507b1c1.herokuapp.com/api/v1/business-trip/${user.id}`
        );
        const trips = res.data.data;

        if (!trips || trips.length === 0) {
          setTripStatus("no-trip");
          setModalMessage("出張申請が見つかりません");
          setModalVisible(true);
          return;
        }

        dayjs.extend(isBetween);

        const approvedTrips = trips?.filter((trip) => trip.approved === true);

        if (approvedTrips.length === 0) {
          setTripStatus("not-approved");
          setModalMessage(
            "出張が申請されていない、または未承認のため打刻できません"
          );
          setModalVisible(true);
          return;
        }

        const activeTrip = approvedTrips.find((trip) => {
          const start = dayjs(trip.trip_start);
          const end = dayjs(trip.trip_end);
          return (
            today.isSame(start, "day") ||
            today.isSame(end, "day") ||
            today.isBetween(start, end, "day", "[]")
          );
        });

        if (activeTrip) {
          setTrip(activeTrip);
          setTripStatus("ok");
          fetchLatLngFromAddress(activeTrip.destination);
        } else {
          const nextTrip = approvedTrips.find((trip) =>
            dayjs(trip.trip_start).isAfter(today)
          );
          if (nextTrip) {
            setTripStatus("not-started");
            setModalMessage("まだ出張開始日ではありません");
          } else {
            setTripStatus("ended");
            setModalMessage("打刻期間が終了しました");
          }
          setModalVisible(true);
        }
      } catch (err) {
        console.error("出張情報取得エラー:", err);
        setTripStatus("no-trip");
        setModalMessage("出張申請の取得に失敗しました");
        setModalVisible(true);
      }
    };

    if (user?.id) {
      fetchTrip();
    }
  }, [user]);

  const fetchLatLngFromAddress = async (address) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await axios.get(url);
      const loc = res.data.results[0]?.geometry.location;
      if (loc) setTargetLatLng({ lat: loc.lat, lng: loc.lng });
    } catch (err) {
      console.error("経緯度取得エラー:", err);
    }
  };

  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const degToRad = (deg) => deg * (Math.PI / 180);
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(lat1)) *
        Math.cos(degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format("HH:mm:ss"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setLocation({ lat: latitude, lng: longitude });
          fetchAddress(latitude, longitude);

          if (targetLatLng) {
            const distance = getDistanceFromLatLonInMeters(
              latitude,
              longitude,
              targetLatLng.lat,
              targetLatLng.lng
            );
            setIsWithinRange(distance <= ALLOWED_RADIUS);
          }

          setLoading(false);
        },
        (error) => {
          console.error("位置情報取得エラー:", error);
          message.error("位置情報を取得できません。権限設定をご確認ください");
          setLoading(false);
        }
      );
    } else {
      message.error("お使いのブラウザは位置情報の取得に対応していません");
    }
  }, [targetLatLng]);

  const fetchAddress = async (lat, lng) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ja&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await axios.get(url);
      if (response.data.results.length > 0) {
        setAddress(response.data.results[0].formatted_address);
      } else {
        message.warning("住所を解析できません");
      }
    } catch (error) {
      console.error("逆地理编码失败:", error);
      message.error("逆ジオコーディングに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (info) => {
    const file = info.fileList[info.fileList.length - 1];
    if (!file || !file.originFileObj) {
      message.error("無効なファイルです。画像を再選択してください");
      setImage(null);
      return;
    }

    const originFile = file.originFileObj;

    if (!(originFile instanceof File)) {
      message.error("ファイル形式が正しくありません。再選択してください");
      setImage(null);
      return;
    }

    if (!originFile.type.startsWith("image/")) {
      message.error(" 画像ファイルを選択してください");
      setImage(null);
      return;
    }

    setImage(file);
  };

  const handleSubmit = async () => {
    if (!image || !image.originFileObj) {
      return message.warning("有効な画像をアップロードしてください");
    }

    const file = image.originFileObj;

    if (
      !(file instanceof File) ||
      !file.type.startsWith("image/") ||
      file.size === 0
    ) {
      return message.error("アップロードエラー：無効な画像ファイル");
    }

    try {
      const fileName = `${user.id}_${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("cabin-images")
        .upload(fileName, file);

      if (error) throw error;

      const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/cabin-images/${fileName}`;

      await axios.post(
        "https://worklog-46a33507b1c1.herokuapp.com/api/v1/punch",
        {
          id: user.id,
          type: punchType,
          punch_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          punch_date: dayjs().format("YYYY-MM-DD"),
          is_business_trip: true,
          image_url: imageUrl,
          memo: remark,
        }
      );

      message.success("出張打刻しました!");
      setImage(null);
      setRemark("");
      setPunchType("");
    } catch (err) {
      console.error("打刻エラー:", err);
      message.error("打刻エラー，再打刻してください");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h2>出張打刻</h2>

      {loading ? (
        <Spin tip="位置情報取得中..." />
      ) : (
        <>
          <p>
            <strong>現在の所在地：</strong> {address}
          </p>
          <p>
            <strong>出張先の所在地：</strong> {trip?.destination}
          </p>
          <p>
            <strong>期間：</strong>
            {dayjs(trip?.trip_start).format("YYYY年MM月DD日")} ~
            {dayjs(trip?.trip_end).format("YYYY年MM月DD日")}
          </p>
          <p>
            <strong>今日の日付：</strong> {currentDay}
          </p>
          <p>
            <strong>出張先との距離（打刻可能範囲内）：</strong>
            {isWithinRange ? "範囲内 ✅" : "範囲外 ❌"}
          </p>
        </>
      )}

      <Form.Item label="打刻種類">
        <Select
          value={punchType}
          onChange={(value) => setPunchType(value)}
          placeholder="選択してください"
        >
          <Option value="出勤">出勤</Option>
          <Option value="退勤">退勤</Option>
        </Select>
      </Form.Item>

      <Form.Item label="写真アップロード">
        <Upload
          beforeUpload={() => false}
          onChange={handleFileChange}
          showUploadList={{ showRemoveIcon: true }}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>画像を選択</Button>
        </Upload>
      </Form.Item>

      <Form.Item label="メモ">
        <Input.TextArea
          rows={3}
          placeholder="メモを入力してください"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </Form.Item>

      <Button
        type="primary"
        onClick={handleSubmit}
        style={{
          width: "100%",
          height: 50,
          fontSize: 16,
          fontWeight: "bold",
          marginTop: 10,
        }}
        disabled={!isWithinRange || tripStatus !== "ok"}
      >
        出張打刻 ({currentTime})
      </Button>
      <Modal
        title="打刻不可"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setModalVisible(false)}
          >
            閉じる
          </Button>,
        ]}
        centered
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default BusinessTripPunchClock;
