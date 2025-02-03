## **System Design Decisions**

### 1. **Monolithic Architecture**

-  **Decision**: ReelServer uses a **monolithic architecture** instead of a microservices-based approach.
-  **Reasoning**: The decision to use a monolithic architecture was made due to the scope and scale of the project. Given that the core functionality revolves around video uploading, compression, user authentication, and storage, these related services are handled within a single backend application. A monolithic structure reduces complexity and the overhead of managing multiple services. Additionally, it simplifies the development, testing, and deployment processes, which is crucial for maintaining focus on delivering core features.
-  **Future Considerations**: As the project grows, we might consider breaking it into smaller services (microservices) to handle scaling more effectively and introduce independent deployment and scaling for specific services like video processing, user management, and analytics.

### 2. **TypeScript**

-  **Decision**: TypeScript was chosen for the backend application.
-  **Reasoning**: TypeScript provides strong static typing, reducing runtime errors, and enhancing developer productivity by providing better tooling, code completion, and error checking during development. This makes the application more maintainable as the project scales.

### 3. **JWT for Authentication**

-  **Decision**: **JSON Web Tokens (JWT)** is used for user authentication.
-  **Reasoning**: JWT allows for a stateless, scalable authentication system that doesn't require storing session information on the server. This approach simplifies managing authentication across multiple instances and services, especially when deploying in cloud environments like AWS EC2.

### 4. **PostgreSQL for Database**

-  **Decision**: **PostgreSQL** is selected as the primary database system.
-  **Reasoning**: PostgreSQL is a reliable, relational database system known for its robustness and scalability, which is ideal for handling structured data, such as user information, video metadata, and analytics. It also provides advanced features like indexing and transaction handling, ensuring the integrity of the application’s data.

### 5. **Redis for Caching**

-  **Decision**: **Redis** is used for caching.
-  **Reasoning**: Redis is a high-performance, in-memory data store that reduces the load on the PostgreSQL database by caching frequently accessed data (such as user profiles, video metadata, and thumbnails). This improves response times and overall application performance, particularly under high traffic.

### 6. **MinIO for Object Storage**

-  **Decision**: **MinIO** is used for video storage.
-  **Reasoning**: MinIO is an S3-compatible object storage solution, ideal for storing large video files. It offers cost-effective storage with easy integration into the application, making it well-suited for handling video uploads and providing fast retrieval of video files.

### 7. **FFmpeg for Video Processing**

-  **Decision**: **FFmpeg** is used for video compression and thumbnail extraction.
-  **Reasoning**: FFmpeg is a powerful, open-source tool capable of handling various video formats and codecs. It provides excellent support for on-the-fly video compression and thumbnail generation, making it an ideal choice for managing video processing tasks in ReelServer.

### 8. **Rate Limiting**

-  **Decision**: **Rate limiting** is implemented to prevent abuse and protect the application from DDoS attacks.
-  **Reasoning**: By setting limits on the number of requests per user or IP address within a certain timeframe, we can prevent server overloads and ensure fair usage of the application’s resources.

### 9. **Logging and Monitoring**

-  **Decision**: **Logging** and **monitoring** are integrated using log rotation and monitoring tools (Prometheus and Grafana).
-  **Reasoning**: Efficient log management prevents disk space issues, while Prometheus and Grafana allow for real-time monitoring and visualization of application performance. This enables us to quickly detect and address performance bottlenecks or failures.

### 10. **Video Compression and Optimization**

-  **Decision**: **Video compression** is performed on the server to optimize storage and bandwidth.
-  **Reasoning**: Compressing videos during upload reduces storage requirements and saves bandwidth when serving video content. This ensures the application can handle large video files efficiently without overwhelming the system’s resources.

### 11. **Docker for Containerization**

-  **Decision**: **Docker** and **Docker Compose** are used for containerization and deployment.
-  **Reasoning**: Docker allows the application to be packaged along with all its dependencies into containers, ensuring consistent environments across development, testing, and production. Docker Compose helps manage multi-container setups (PostgreSQL, Redis, MinIO, etc.), simplifying deployment and scaling.

### 12. **CI/CD Pipeline with GitHub Actions**

-  **Decision**: **GitHub Actions** is used for continuous integration and continuous deployment (CI/CD).
-  **Reasoning**: GitHub Actions enables seamless integration and deployment workflows. It automates the process of testing, building, and deploying the application to EC2, reducing manual effort and ensuring faster releases.

### 13. **Scalability and High Availability Considerations**

-  **Decision**: The current monolithic design is sufficient for handling the expected load and scale. However, as traffic increases, horizontal scaling will be achieved by replicating the PostgreSQL database and deploying multiple application instances.
-  **Reasoning**: As the application grows, scaling PostgreSQL with replication ensures high availability, while adding additional application instances behind a load balancer can help distribute traffic effectively. Moving towards microservices architecture can be explored in the future if necessary for further scaling.
