Try AI directly in your favorite apps … Use Gemini to generate drafts and refine content, plus get Gemini Pro with access to Google's next-gen AI for ₫489,000 ₫0 for 1 month
SETUP_GUIDE.md
# HƯỚNG DẪN CÀI ĐẶT FINANCIAL SUPPORT SYSTEM

> **Lưu ý**: File này dành cho người mới clone project. Lưu file này riêng biệt, không commit vào repository.

## 📋 TỔNG QUAN HỆ THỐNG

Financial Support là hệ thống microservices gồm:
- **Frontend**: React + Vite (port 5173)
- **API Gateway**: Entry point chính (port 5000)
- **User Service**: Quản lý user & authentication (port 5002)
- **Email Service**: Gửi email thông báo (port 5003)
- **Chart Service**: Dữ liệu biểu đồ real-time (port 5004)
- **News Service**: Tin tức crypto (port 5005)
- **Backtest Service**: Backtest trading strategies (port 7206)
- **AI Service**: AI analysis (port 8000)

**Infrastructure**:
- PostgreSQL: Database chính (port 5432)
- Redis: Cache & session (port 6379)
- Kafka: Message broker (port 9092)
- Kafka UI: Quản lý Kafka (port 8080)

## 🛠️ YÊU CẦU HỆ THỐNG

### Bắt buộc:
- **Docker Desktop** (Windows/macOS) hoặc **Docker + Docker Compose** (Linux)
- **Git**
- **8GB RAM** trở lên (để chạy đầy đủ services)
- **10GB** dung lượng trống

### Tùy chọn:
- **Node.js 18+** (nếu muốn chạy Frontend riêng)
- **PowerShell** (Windows) hoặc **Bash** (macOS/Linux)

## 🚀 CÁC BƯỚC CÀI ĐẶT

### Bước 1: Clone Project
```bash
git clone https://github.com/<your-org>/FinancialSupport.git
cd FinancialSupport
```

### Bước 2: Cấu hình Environment
```bash
cd Microservices
cp docker.env.example docker.env
```

**Mở file `docker.env` và điều chỉnh các giá trị sau:**

#### 🔐 BẮT BUỘC PHẢI THAY ĐỔI:
```bash
# Mật khẩu database (thay đổi ngay)
POSTGRES_PASSWORD=your_strong_password_here

# JWT Secret (tạo chuỗi ngẫu nhiên dài)
JWT_SECRET=your_very_long_random_jwt_secret_string_here

# Email SMTP (nếu muốn gửi email)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_EMAIL=your-email@gmail.com
```

#### 🔑 API KEYS (Tùy chọn):
```bash
# Binance API (để lấy dữ liệu crypto)
BINANCE_API_KEY=your-binance-api-key
BINANCE_SECRET_KEY=your-binance-secret-key

# Hugging Face Token (cho AI service)
HF_TOKEN=your-huggingface-token

# Email Service API Key
EMAIL_SERVICE_API_KEY=your-email-service-api-key
```

#### 🌐 PORTS (nếu bị trùng):
```bash
# Thay đổi nếu port bị trùng trên máy bạn
API_GATEWAY_HTTP_PORT=5000
USER_SERVICE_HTTP_PORT=5002
EMAIL_SERVICE_HTTP_PORT=5003
CHART_SERVICE_HTTP_PORT=5004
NEWS_SERVICE_HTTP_PORT=5005
BACKTEST_SERVICE_HTTP_PORT=7206
```

### Bước 3: Khởi chạy Hệ thống

#### Lần đầu (build images):
```bash
docker compose --env-file docker.env up -d --build
```

#### Các lần sau:
```bash
docker compose --env-file docker.env up -d
```

#### Kiểm tra trạng thái:
```bash
docker compose ps
```

### Bước 4: Xác nhận Hệ thống hoạt động

Mở browser và kiểm tra:
- **API Gateway**: http://localhost:5000
- **Kafka UI**: http://localhost:8080
- **PostgreSQL**: localhost:5432 (dùng pgAdmin hoặc DBeaver)

## 📊 MONITORING & LOGS

### Xem logs:
```bash
# Tất cả services
docker compose logs -f

# Service cụ thể
docker compose logs -f api-gateway
docker compose logs -f user-service
docker compose logs -f postgres
```

### Kiểm tra health:
```bash
# Kiểm tra containers đang chạy
docker compose ps

# Kiểm tra resource usage
docker stats
```

## 🎯 FRONTEND (Tùy chọn)

Nếu muốn chạy Frontend riêng:
```bash
cd Frontend
npm install
npm run dev
```
Frontend sẽ chạy tại: http://localhost:5173

## ⚠️ TROUBLESHOOTING

### 1. Port đã được sử dụng
**Lỗi**: `Port 5000 is already in use`
**Giải pháp**: 
- Thay đổi port trong `docker.env`
- Hoặc dừng service đang dùng port đó

### 2. Database connection failed
**Lỗi**: `Connection to database failed`
**Giải pháp**:
```bash
# Chờ PostgreSQL khởi động hoàn toàn
docker compose logs -f postgres

# Restart services phụ thuộc database
docker compose restart user-service news-service
```

### 3. Out of memory
**Lỗi**: Containers bị kill do thiếu RAM
**Giải pháp**:
- Tăng RAM cho Docker Desktop (Settings > Resources)
- Hoặc chạy từng service một:
```bash
# Chỉ chạy infrastructure
docker compose up -d postgres redis kafka

# Sau đó chạy services
docker compose up -d api-gateway user-service
```

### 4. SSL Certificate issues
**Lỗi**: HTTPS không hoạt động
**Giải pháp**: Sử dụng HTTP cho development (đã cấu hình sẵn)

## 🔧 CÁC LỆNH HỮU ÍCH

### Dừng hệ thống:
```bash
docker compose down
```

### Dừng và xóa volumes (reset hoàn toàn):
```bash
docker compose down -v
```

### Rebuild một service:
```bash
docker compose up -d --build user-service
```

### Xem resource usage:
```bash
docker system df
docker system prune  # Dọn dẹp không gian
```

## 📝 GHI CHÚ QUAN TRỌNG

1. **File `docker.env`**: KHÔNG BAO GIỜ commit vào git
2. **Secrets**: Thay đổi tất cả mật khẩu mặc định
3. **Ports**: Có thể thay đổi tùy theo máy của bạn
4. **Database**: Dữ liệu được lưu trong Docker volumes
5. **Logs**: Luôn check logs khi có lỗi

## 🆘 HỖ TRỢ

Nếu gặp vấn đề:
1. Check logs: `docker compose logs -f`
2. Kiểm tra ports: `netstat -an | grep :5000`
3. Restart Docker Desktop
4. Xem tài liệu chi tiết: `Microservices/README.md`

---
**Lưu ý**: File này chỉ dành cho setup ban đầu. Để phát triển, xem thêm tài liệu trong thư mục `Microservices/`.