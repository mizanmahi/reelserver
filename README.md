# ReelStream

# Endpoint Listing
---

## **🔐 Authentication Routes**
| Method | Endpoint         | Description              | Auth Required |
|--------|----------------|-------------------------|--------------|
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Login and get JWT token | ❌ No |
| `GET` | `/api/auth/profile` | Get logged-in user's profile | ✅ Yes |

---

## **📹 Video Management**
| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|--------------|
| `POST` | `/api/videos/upload` | Upload a video reel | ✅ Yes |
| `GET` | `/api/videos` | Get all public videos (paginated) | ❌ No |
| `GET` | `/api/videos/:id` | Get video details (with caching) | ❌ No |
| `DELETE` | `/api/videos/:id` | Delete user’s own video | ✅ Yes | 

---

## **👤 User Profile & Video List**
| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|--------------|
| `GET` | `/api/users/:id/videos` | Get all videos uploaded by a user | ❌ No |
| `GET` | `/api/users/:id` | Get user profile info | ❌ No |

---

## **📊 Analytics**
| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|--------------|
| `GET` | `/api/analytics/videos` | Get engagement analytics (views, likes, uploads) | ✅ Yes |


---

## **🚀 Features Covered**
✅ **Authentication** – JWT-based auth  
✅ **Video Upload** – MP4 validation, storage, and thumbnail generation  
✅ **Engagement Features** – Like, view tracking  
✅ **Caching & Rate Limiting** – Redis-based caching & request limiting  
✅ **Analytics** – Video & user engagement tracking  
✅ **Health & Monitoring** – API health check & metrics  

---

# important command

docker run \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=fahim" \
  -e "MINIO_ROOT_PASSWORD=fahim123" \
  quay.io/minio/minio server /data --console-address ":9001"
