<div align="center">
  <h1>CareerPath Sri Lanka</h1>
  <p><strong>Find a course that fits. Take a confident next step.</strong></p>
  <p>A career and education guidance platform connecting learners with courses and providers across Sri Lanka.</p>

  <img src="https://img.shields.io/badge/React-18-149eca?style=for-the-badge&logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-6db33f?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 3.2">
  <img src="https://img.shields.io/badge/Java-21-ed8b00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21">
  <img src="https://img.shields.io/badge/MySQL-8-4479a1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Education-Sri%20Lanka-7c3aed?style=for-the-badge" alt="Education in Sri Lanka">
</div>

<br>

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>🎓 Discover</strong><br>Explore courses from Sri Lankan education providers</td>
      <td align="center"><strong>🧭 Find direction</strong><br>Turn your interests and qualifications into a pathway</td>
      <td align="center"><strong>🤝 Connect</strong><br>Give learners, providers, and administrators a shared space</td>
    </tr>
  </table>
</div>

## The idea

Choosing what to study can feel overwhelming. Course information is spread across providers, and it can be difficult to compare cost, location, study mode, duration, and entry requirements in one place.

CareerPath Sri Lanka brings those choices together. Learners can explore approved courses, build a profile, and receive career guidance shaped around their goals. Education providers can submit course information, while administrators review listings and manage the platform.

The experience is designed to be clear on desktop and mobile, with a focused course directory and a guided path from exploration to a more informed decision.

## What you can do

| Area | Capabilities |
| --- | --- |
| Course discovery | Browse featured and approved courses, search the directory, and filter by course type, study mode, district, and fee |
| Course information | Compare provider, location, duration, qualification level, eligibility, fees, and application details |
| Career guidance | Create a learner profile and request course recommendations aligned with qualifications, interests, skills, and goals |
| Career assistant | Ask questions about education and career choices in Sri Lanka, with an optional Gemini-powered assistant |
| Learner account | Register, sign in, verify an email address, and manage profile details and a profile picture |
| Provider workspace | Submit course information and images, then manage provider course listings |
| Admin desk | Review and manage course listings, approve or reject submissions, and manage user accounts |
| Responsive experience | Use the application on desktop and mobile, with a selectable dark theme |

## A guided journey

<div align="center">
  <table>
    <tr>
      <td align="center"><strong><font color="#0ea5e9">01 · Explore</font></strong><br>Search courses and compare practical details</td>
      <td align="center"><strong><font color="#8b5cf6">02 · Reflect</font></strong><br>Share your background, strengths, and interests</td>
      <td align="center"><strong><font color="#10b981">03 · Plan</font></strong><br>Review suggested directions and matching courses</td>
      <td align="center"><strong><font color="#f59e0b">04 · Move forward</font></strong><br>Choose an option that fits your next step</td>
    </tr>
  </table>
</div>

## Built for distinct roles

| Role | Designed for |
| --- | --- |
| Learner | Discovering courses, maintaining a profile, and receiving personal guidance |
| Provider | Sharing course information and maintaining submitted listings |
| University | Representing an education provider and submitting its courses |
| Administrator | Reviewing courses, managing publication, and overseeing user accounts |

Access to provider and administrator features is protected by role-based authorization. Course browsing is available without signing in.

## How the system fits together

<div align="center">
  <table>
    <tr>
      <td align="center" bgcolor="#eff6ff"><strong>React web application</strong><br>Responsive pages, routing, Redux state, and API client</td>
      <td align="center"><strong>⇄</strong></td>
      <td align="center" bgcolor="#f0fdf4"><strong>Spring Boot REST API</strong><br>Validation, services, security, and business rules</td>
      <td align="center"><strong>⇄</strong></td>
      <td align="center" bgcolor="#fff7ed"><strong>MySQL database</strong><br>Accounts, providers, courses, and learner data</td>
    </tr>
  </table>
</div>

The frontend sends requests to the versioned API under `/api/v1`. The Vite development server forwards API and upload requests to the backend. Spring Security protects account-specific operations with stateless JWT authentication and role checks. Spring Data JPA connects application services to MySQL.

Career recommendations use the learner's submitted profile and course information. Gemini integration is optional. When no Gemini key is configured, the backend provides built-in fallback guidance. Email delivery can also be configured for account verification and password recovery.

## Technology

### Frontend

- React 18 and Vite
- React Router for application navigation
- Redux Toolkit for shared application state
- Axios for API communication
- Tailwind CSS and application styles for the responsive interface
- Lucide React for interface icons
- Recharts and Framer Motion for visual and interactive elements

### Backend

- Java 21 and Spring Boot 3
- Spring Web for REST endpoints
- Spring Security with JWT authentication and role-based access
- Spring Data JPA and Hibernate
- MySQL 8
- Jakarta validation, Spring Mail, and springdoc OpenAPI
- Optional Google Gemini integration for career guidance

## Repository layout

```text
careerpath-platform/
├── careerpath-backend/
│   ├── src/main/java/          Application, API, security, services, and data access
│   ├── src/main/resources/     Application configuration and resources
│   ├── src/test/               Backend tests
│   ├── Path.sql                Development schema and sample data
│   └── pom.xml                 Maven dependencies and build
└── careerpath-frontend/
    └── careerpath-frontend/
        ├── src/api/            Frontend API clients
        ├── src/components/     Shared interface and feature components
        ├── src/store/          Redux store and slices
        ├── src/App.jsx         Application pages and routes
        └── package.json        Frontend scripts and dependencies
```

## Run it locally

### You will need

- Java 21
- MySQL 8
- Node.js and npm
- The optional Gemini API key for AI-powered responses
- SMTP credentials if you want outbound verification or recovery email

### 1. Prepare MySQL

Create a local MySQL database named `careerpath_db`. The backend uses Hibernate schema updates for local development. Database connection details are read by the backend from its Spring configuration. Set your own local database username and password before starting the API.

`careerpath-backend/Path.sql` contains a development schema and sample data. Review it before running it against any database. It includes statements that drop and recreate tables.

### 2. Configure the backend

Review `careerpath-backend/src/main/resources/application.properties` and provide local values for the database connection and JWT secret. Keep private credentials outside public source control.

Email and Gemini integration are optional. Configure SMTP settings and enable mail delivery only when you want the application to send email. Set a Gemini API key to enable generated AI guidance. Without that key, the built-in career guidance fallback remains available.

### 3. Start the backend

From the backend folder, build the application and start the generated JAR.

```powershell
cd careerpath-backend
.\mvnw.cmd clean package
java -jar target\careerpath-backend-1.0.0.jar
```

The API listens on port `8081` by default.

### 4. Start the frontend

Open a second terminal from the repository root.

```powershell
cd careerpath-frontend\careerpath-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The Vite configuration proxies API and uploaded-file requests to the backend on port `8081`.

## API and security

The REST API is versioned under `/api/v1`. Main areas include:

| API area | Purpose |
| --- | --- |
| `/api/v1/auth` | Registration, sign-in, email verification, and password recovery |
| `/api/v1/courses/public` | Public course search, featured courses, and course details |
| `/api/v1/provider/courses` | Provider course submission and listing management |
| `/api/v1/admin/courses` | Course review, approval, rejection, and administration |
| `/api/v1/admin/users` | Administrative user management |
| `/api/v1/profile` | Learner profile and profile picture management |
| `/api/v1/recommendations` | Personalized pathways and career assistant conversations |

The backend publishes OpenAPI documentation through Swagger UI when the application is running. Visit `http://localhost:8081/swagger-ui.html`.

## Testing

Run backend tests from the backend folder.

```powershell
cd careerpath-backend
.\mvnw.cmd test
```

Create a production frontend bundle from the frontend folder.

```powershell
cd careerpath-frontend\careerpath-frontend
npm run build
```

## Screenshots

Full-page desktop and mobile screenshots are collected locally in `portfolio-screenshots`. They are intended for portfolio and social media use and are excluded from Git by the root ignore rules.

## Configuration notes

- Never commit production secrets, signing keys, database passwords, or third-party API keys.
- Use a strong JWT secret outside local development.
- Restrict CORS origins to the domains used by your deployment.
- Review the sample SQL before use because it recreates database tables.
- Local uploads and environment files are excluded from version control.

<div align="center">
  <br>
  <strong>CareerPath Sri Lanka</strong><br>
  <sub>Make your next step a considered one.</sub>
</div>
