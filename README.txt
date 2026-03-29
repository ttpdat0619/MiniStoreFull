FINAL PROJECT REPORT
Course: New Programming Language

---
1. COVER PAGE
---
University name: [Your University Name]
Faculty / Department: [Your Faculty/Department]
Course name: New Programming Language
Project title: Mini Store Management System
Instructor name: [Instructor Name]
Group members: 
1. [Student A Name] - [Student A ID]
2. [Student B Name] - [Student B ID]
3. [Student C Name] - [Student C ID]
Submission date: [Date]

---
2. TABLE OF CONTENTS
---
1. Introduction ........................................................... 3
2. System Overview ........................................................ 4
3. System Design .......................................................... 6
4. Implementation ......................................................... 10
5. Testing ................................................................ 15
6. Deployment ............................................................. 18
7. Conclusion ............................................................. 19
8. References ............................................................. 20

---
3. INTRODUCTION
---
Reason for choosing the topic: 
Managing inventory, branch transfers, item wastages, and staff activities across multiple store branches can be highly complex and prone to errors when done manually. We chose the "Mini Store Management System" to address these challenges by providing a centralized, efficient, and reliable platform that streamlines daily operations, tracks inventory precisely, and enhances overall management for mini-store chains.

Project objectives:
- Develop a robust backend system using Node.js, Express, and TypeORM capable of handling complex business logic such as internal inventory transfers, wastage requests, and role-based access control.
- Create an intuitive and responsive Vite/React frontend application with distinct dashboards for Admins, Managers, and Staff to interact with the system easily.
- Ensure data consistency and real-time tracking of item quantities across various branches using a MySQL database.
- Implement secure authentication and authorization mechanisms with JWT tokens.

Scope of the project:
The project encompasses a full-stack web application. The backend is responsible for API endpoints, database interactions, and business rule validation. The frontend provides the user interface for different roles. The system covers comprehensive modules including Authentication, User Management, Inventory Tracking, Internal Transfers, Import (Purchase) Requests, Wastage Requests, Food/Formula management, and precise Activity Logging.

---
4. SYSTEM OVERVIEW
---
Description of the system:
The Mini Store Management System is a web-based application designed to manage the internal operations of a retail network. 
What the system does: It allows staff to request inventory imports, report wastages, and initiate transfers between branches. Managers and Admins can approve these requests, manage catalogs (items, food, formulas), and monitor activity logs.
How it works at a high level: Users interact with a React SPA. HTTP requests are managed by an Axios custom client instance pointing to a Node.js API server. The server verifies the JWT token via middleware, processes the business logic using Services, queries the MySQL database via TypeORM Entities, and responds.

List features clearly:
1. Authentication (Login/Register)
   - Description: Sign-in mechanism using JWT via `/api/auth/login`.
   - Purpose: To restrict access, identifying if a user is Staff, Manager, or Admin.
2. Internal Transfers
   - Description: Staff/Managers create transfer requests (`/CreateRequestTransfer`). Managers respond (`/:transferId/respond`), Admins give final approval (`/:transferId/approve`).
   - Purpose: Balance inventory across the store network securely.
3. Import (Purchase) Requests & Wastage Tracking
   - Description: Staff creates requests to import new goods or write-off expired goods. Managers/Admins review and modify status.
   - Purpose: Maintain adequate stock and track monetary losses accurately.
4. Item, Food & Formula Management
   - Description: CRUD capabilities for standard items, and complex food items needing recipe formulas.
   - Purpose: Maintain central catalog for the MiniStore.
5. Activity Logging
   - Description: Every major transaction triggers a log creation (ActivityLogComponent mapped to `activityLog.api.js`).
   - Purpose: Provide a strict audit trail for system security.

Target users and Roles:
- Guest: Can only reach the Login page. 
- Staff (Registered User): Can access the Staff Dashboard, view Branch Inventory, create Wastage/Transfer/Import requests.
- Manager (Registered User): Has a distinct Manager Dashboard, can approve/reject basic requests within their branch, and respond to transfers targeting their branch.
- Admin: Has the Admin Dashboard, full access. Can manage users, create branches (`branch.routes.js`), and give final approval on critical stock movements.

Use Case Diagram Explanation:
(Include your Use Case diagram image here in the final PDF)
The diagram shows Admins interacting with overarching Branch/User management. Staff initiate Transfer, Wastage, and Import requests. Managers perform first-tier approvals. Admins perform final approvals.

---
5. SYSTEM DESIGN
---
System architecture:
- Client-Server Model with MVC-like routing on the backend.
- Frontend: Single Page Application built with React.js + Vite.
- Backend: REST API Server built with Node.js and Express.js.
- Database: MySQL handled by TypeORM (Object-Relational Mapping).
(Include your Architecture diagram here in the final PDF)

Database design:
(Include your ER Diagram here in the final PDF)
Main Tables (Based on TypeORM Entities):
1. user: id (UUID), username, password (bcrypt hashed), roleId, branchId
2. role / branch / category / item / unit: Essential definition dictionaries.
3. inventory: Maps branchId, itemId to quantity.
4. foodItem & formula: Defines products built from distinct raw items.
5. internalTransfer / transferDetail: Tracks fromBranch, toBranch, status, and line items.
6. purchaseRequest / purchaseDetail: Tracks requests to import new goods.
7. wastageRequest / wastageDetail: Tracks discarded items.
8. activityLog / activityLogBranch: Audit trailing mechanisms recording Timestamp, TargetName, Description.

API Design (RESTful APIs):
| Endpoint (Base: /api)             | Method | Access               | Purpose                                      |
|-----------------------------------|--------|----------------------|----------------------------------------------|
| /auth/login                       | POST   | Public               | Authenticate user & return JWT               |
| /internal-transfers/CreateRequestTransfer | POST | Manager, Admin | Create a transfer request                    |
| /internal-transfers/:transferId/approve   | PUT  | Admin          | Final approval, executes inventory movement  |
| /wastage/...                      | GET/PUT| Staff,Mgr,Admin      | Retrieve, Edit, or Approve wastage requests  |
| /purchaseRequest/...              | GET/PUT| Staff,Mgr,Admin      | Handle inventory import flows                |
| /activityLog/...                  | GET    | Admin, Manager       | Fetch system-wide or branch-specific logs    |

---
6. IMPLEMENTATION
---
Technologies used:
- Frontend: React 19 + Vite for optimal build speeds. Bootstrap 5 for UI consistency. Axios used in custom clients (e.g., `api/axiosClient.js`) to seamlessly attach Bearer tokens.
- Backend: Node.js (v20+) with Express 5. TypeORM to strictly map MySQL tables to JavaScript Object classes (`entities/*.entity.js`).
- Database: MySQL for robust relational data mapping, ensuring data integrity across complex transactions.

Detailed Packages / Dependencies:
1. Frontend Packages (MiniStoreClientReact-FE)
   - React (^19.2.0) & React-DOM: Library for building the user interface.
   - Vite (^7.2.4): Build tool and development server for fast HMR.
   - React-Router-DOM (^7.13.0): Handling SPA routing and navigation.
   - Axios (^1.13.4): For making HTTP requests to the backend API.
   - Bootstrap (^5.3.8): CSS framework for responsive design.
   - ESLint: For JavaScript code linting.
   *(Run `npm install` in the frontend directory to fetch all required packages)*

2. Backend Packages (Mini-StoreAPI-BE)
   - Node.js & Express.js (^5.2.1): Core runtime and web framework for the REST API.
   - TypeORM (^0.3.28): Object-Relational Mapper for interacting with the MySQL database.
   - MySQL2 (^3.16.3): MySQL client driver for Node.js.
   - JsonWebToken (JWT) (^9.0.3): For generating and verifying authentication tokens.
   - Bcryptjs (^3.0.3): For securely hashing user passwords.
   - Multer (^2.0.2): Middleware for handling multipart/form-data (file uploads).
   - Dotenv (^17.2.3): For loading environment variables from a `.env` file.
   - Cors (^2.8.6): Enabling Cross-Origin Resource Sharing.
   - Babel (@babel/core, @babel/node, @babel/preset-env): For compiling modern JS (ESModules) in Node.
   - Nodemon: Development utility to auto-restart the server on file changes.
   *(Run `npm install` in the backend directory to fetch all required packages)*

Reason for choosing: 
Using JavaScript across the stack minimizes context switching and allows for seamless integration. TypeORM ensures database schema consistency matching the object-oriented logic in `services/`. Vite offers incredibly fast development builds for React.

System Structure:
Folder structure:
- frontend/ (MiniStoreClientReact-FE)
  - src/api/: Modularized API callers (e.g., `wastage.api.js`, `import.api.js`).
  - src/components/: Shared layout/login elements.
  - src/pages/: Route-specific views grouped by feature domains (`admin`, `manager`, `staff` dashboards, `transfer`, `wastage`, `import`, `inventory`, `activityLog`).
- backend/ (Mini-StoreAPI-BE)
  - src/controllers/: Extracts request bodies and params, delegating to services.
  - src/services/: Contains actual business logic (e.g., `internalTransfer.service.js` which verifies stock limits).
  - src/entities/: Schema mappings for TypeORM.
  - src/routes/: Defintion of paths tied to controllers and protected by `[verifyToken, authorize(["Role"])]` middlewares.

Description of main functions:
1. Authorization Middleware: Route handlers employ `verifyToken` to decode the JWT, then `authorize([...roles])` intercepts requests if the user's role lacks permissions (e.g. Staff hitting an Admin endpoint).
2. Complex Transfer Protocol: An Internal Transfer isn't just a database update; it undergoes a state machine flow (Created -> Responded by Target Manager -> Final Approved by Admin). The `internalTransfer.service.js` handles these transitions securely.
3. Frontend Routing & Dashboards: React-Router maps URLs to specific page components. Components conditionally render UI elements (like Approve buttons) based on the globally stored user role context.

---
7. TESTING
---
How you tested the system:
- API Testing: Extensively utilized tools (e.g. Insomnia) to hit Post/Put routes directly, verifying JWT rejection without headers.
- End-to-End flow: Simulated the complete lifecycle: Staff creates Request -> Manager Responds -> Admin Approves, tracking UI state changes.
- Boundary Testing: Tested inventory limits, attempting to transfer or waste more quantity than available in a branch's `inventory` table.

Some test cases:
1. TC01 - Role Restriction: 
   - Expected: Staff accessing `PUT /api/internal-transfers/:id/approve` returns 403 Forbidden.
   - Result: Passed.
2. TC02 - Inventory Deduction Integrity: 
   - Expected: Admin approving a transfer correctly decreases stock in the source branch and increases stock in the destination branch in one atomic database transaction.
   - Result: Passed.

---
8. DEPLOYMENT
---
How to run the project locally:
1. Backend Configuration:
   - Ensure MySQL is running locally.
   - In `Mini-StoreAPI-BE`, run `npm install`.
   - Setup `.env` (DB_HOST, DB_USER, DB_PASS, JWT_SECRET).
   - Run `npm run start` (triggering nodemon/babel-node).
2. Frontend Configuration:
   - In `MiniStoreClientReact-FE`, run `npm install`.
   - Setup `.env` pointing VITE_API_URL to the backend.
   - Run `npm run dev`. Navigate to `http://localhost:5173`.

---
9. CONCLUSION
---
Summarize:
The Mini Store Management System successfully standardizes inventory control mechanisms. We implemented a secure, role-based architecture capable of managing items, formulas, and complex branch-to-branch transfers. The modular React frontend perfectly aligns with the detailed API routes developed in Node.js/Express, fulfilling all initial objectives.

Future Work & Improvements:
- Performance optimization: Implement database indexing on high-traffic queries like the Activity Log.
- More features: Add graphical reporting (Charts) in the Admin Dashboard for quick financial overviews.
- AI enhancements: Predict out-of-stock scenarios using machine learning on historical `purchaseRequest` and `wastageRequest` data.

---
TEAM CONTRIBUTION
---
No. | Full Name       | Student ID | Responsibilities                               | Completion (%)
1   | [Student A Name]| 123456     | React Frontend, Pages Routing, API Integration | 100%
2   | [Student B Name]| 123457     | Node.js Server, Logic Services, Middlewares    | 100%
3   | [Student C Name]| 123458     | Database design, TypeORM Entities, Testing     | 100%
