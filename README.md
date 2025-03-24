# 勤怠管理アプリケーション（出張打刻機能付き）

## 概要

本アプリケーションは、ポップアップストアやフードフェスティバル、出張などの一時的かつ遠隔な勤務環境に対応するために設計された **勤怠管理システム** です。

従来の「店舗常駐での打刻」という前提ではカバーしきれなかった **出張勤務時の勤怠記録** に対応する「出張打刻機能」を実装し、正確かつ効率的な労働時間管理を実現します。

---

## デプロイ情報・アカウント情報

- **デプロイ先 URL**：<https://worklog-rho.vercel.app/>
- **バックエンドリポジトリ**：<https://github.com/vegetable-w/worklog-backend>

### ログイン方法

ログイン画面で「従業員アカウント」または「管理員アカウント」のボタンをクリックすると、**自動的にログイン情報が入力されてログイン**できます。

---

## 背景と課題

| 番号 | 課題内容                   |
| ---- | -------------------------- |
| ①    | 出張時の勤怠記録の不正確さ |
| ②    | 管理者の負担増加           |
| ③    | 従業員の手続きの煩雑さ     |
| ④    | 打刻漏れの発生             |

---

## 各機能の詳細

### 1. 出張申請と承認（課題 ③）

- 出張前に従業員がアプリで申請
- 入力項目：出張先住所・出張期間・出張原因
- 管理者が内容を確認・承認
- 承認後、出張期間中に「出張打刻」機能が有効化

---

### 2. 通常打刻（課題 ②）

- 通常勤務時に出勤・退勤の打刻が可能
- 出張打刻と統一されたデータとして扱える

---

### 3. 出張打刻（課題 ①）

- 出張期間中、有効な申請がある場合のみ利用可
- **Geolocation API** による現在地の取得 + **Google Maps API** による住所変換
- 撮影した写真・メモとともに打刻を行う
- アップロードされた画像は **Supabase Storage** に保存
- 不正防止と記録の正確性を両立

---

### 4. 打刻履歴の表示（課題 ②）

- 従業員：自分の打刻履歴を確認可能
- 管理者：全従業員の履歴を一覧管理
- 出張と通常の打刻を明確に区別して表示

---

### 5. 追加打刻（課題 ④）

- 打刻忘れ時に、理由付きで打刻追加可能
- 管理者の承認後、正式な勤怠記録として登録

---

## 工夫ポイント

- **Geolocation API による現在地の取得 & Google Maps API による住所変換**  
  出張打刻時にブラウザの Geolocation API を用いて現在地の緯度・経度を取得し、Google Maps API により住所情報に変換。打刻範囲内かどうかを判定することで、不正な打刻を防ぎつつ、記録の信頼性を向上。

- **Supabase Storage による画像管理**  
  出張打刻の際にアップロードされた写真を安全に保存・確認可能。

- **申請 → 承認 → 打刻**  
  出張申請と打刻機能が密に連携しており、手続きの煩雑さを排除。

- **従業員 / 管理者ビューの分離**  
  ユーザーごとに画面や機能を最適化し、ユーザー体験向上を実現。

---

## ゴールインパクト

- **勤怠管理の正確性向上**  
  出張時の打刻データが、位置情報の取得、写真のアップロード、およびメモの記入とともに記録されることにより、勤務状況を正しく把握でき、勤怠情報の信頼性が向上する。

- **管理負担の軽減**  
  出張申請・承認・打刻がシームレスに連携し、管理者の負担が減る。さらに、通常の勤怠管理とも統合されており、出張と通常勤務の打刻情報を一元的に確認できるため、全体的な管理効率が向上する。

- **従業員の利便性向上**  
  出張時の勤怠報告や手続きをアプリ内で簡単に行えるため、報告の手間が軽減され、業務効率が改善される。

- **打刻漏れ対応による柔軟性**  
  従業員が打刻を忘れた場合でも、理由を添えて手動で打刻を追加申請できる機能により、勤怠管理の柔軟性が向上する。

---

## 使用技術

- **フロントエンド**：React + Vite
- **バックエンド**：Node.js（Express）
- **データベース**：PostgreSQL（via Supabase）
- **ストレージ**：Supabase Storage（打刻写真の保存に使用）
- **API**：Google Maps API（出張打刻時の現在地住所取得）

---
