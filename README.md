# FixMyArea: Intelligent Municipal Grievance Redressal and Field Operations Platform

Live Production URL: https://fixmyarea-mauve.vercel.app/

---

## Abstract and System Scope

FixMyArea is an enterprise-grade, distributed civic grievance redressal and municipal field operations platform designed for Urban Local Bodies (ULBs), smart cities, and municipal councils. Traditional civic complaint management systems function as passive, disconnected ticket logs where redundant complaints proliferate, field verification is unverifiable, and municipal accountability remains unmeasured.

FixMyArea transforms civic issue resolution into an end-to-end closed-loop state machine. By integrating multimodal computer vision, geospatial indexing, dynamic triage prioritization, and cryptographic citizen verification gating, the platform ensures that public infrastructure defects (such as road hazards, solid waste accumulation, water pipeline ruptures, and electrical faults) are accurately captured, deduplicated, dispatched, and verified prior to official docket closure.

The platform is designed in accordance with statutory citizen charter mandates, including the Maharashtra Municipal Councils, Nagar Panchayats and Industrial Townships Act, 1965, and the Maharashtra Right to Public Services Act, 2015.

---

## Architectural Distinctions and Technical Innovations

### 1. Multimodal AI Defect Triage and Hazard Extraction
* **Traditional Approach**: Manual category selection by users from long, ambiguous dropdown menus, leading to high misclassification rates and routing bottlenecks.
* **FixMyArea Engine**: Incorporates the Google Gemini Vision API to run automated zero-shot defect classification from photographic inputs. The model detects categorical taxonomy, assesses severity on a 1 to 5 scale, extracts acute safety hazards (e.g., exposed high-voltage wiring, structural collapse, barefoot pedestrian injury risks), and synthesizes standardized civic work orders.

### 2. Geospatial Proximity Deduplication Radar
* **Traditional Approach**: Independent tickets generated for every citizen reporting the same pothole or garbage heap, inundating municipal queues with duplicate entries.
* **FixMyArea Engine**: Employs MongoDB spherical geospatial geometry with `2dsphere` spatial indexing. When a complaint is initialized, a 100-meter radial proximity query (`$nearSphere`) scans active coordinate clusters. Citizens are prompted to endorse (+1 Affected Citizen) the existing master ticket rather than creating duplicate entries. This aggregates community sentiment while keeping municipal queues clean.

### 3. Dynamic Priority Scoring Algorithm
Priority scores (0 to 100) are dynamically evaluated through a weighted mathematical model:
* **Base Severity Weight (40%)**: Derived from computer vision assessment (1 to 5 scale).
* **Community Endorsement Velocity (25%)**: Scaled logarithmically based on verified affected citizen count.
* **Safety Hazard Multiplier (20%)**: Extracted safety indicators (e.g., traffic bottleneck, pedestrian slip, electrocution risk).
* **Statutory SLA Elapsed Ratio (15%)**: Time elapsed against mandated Right to Public Services turnaround targets.

### 4. Closed-Loop Verification and Completion Certificate Gating
* **Traditional Approach**: Municipal officers mark tickets as "Closed" administratively without physical verification or photographic proof.
* **FixMyArea Engine**:
  * Mandatory geocoded and timestamped "After" repair imagery uploaded by field crews.
  * Automated visual restoration confidence matching comparing "Before" defect imagery against "After" remediation imagery.
  * **Cryptographic Citizen Sign-Off Gate**: Statutory Civic Completion Certificates cannot be generated, rendered, or exported as PDF unless the physical remediation is verified by the citizen on the ground (`status === 'Citizen Confirmed'`).

### 5. Multi-Jurisdictional Isolation with Zero Data Leakage
* Supports multiple municipal councils (e.g., Alandi Municipal Council and Wardha Municipal Council) on a shared multi-tenant infrastructure.
* Strict Role-Based Access Control (RBAC) ensures department officers can only inspect and act upon grievances within their designated municipal ward and department boundaries.
* Dynamic statutory document generation produces localized Government Gazette audit dockets featuring official municipal seals, outward registration codes, and localized commissioner signatures.

### 6. Low-Latency Geospatial Dispatch Terminal
* Built on Leaflet and React-Leaflet with custom SVG status pins mapped directly to operational states: Urgent (Red), Needs Team (Amber), In Progress (Sky Blue), and Completed (Emerald Green).
* Provides municipal dispatchers with single-click route generation to Google Maps GPS coordinates for field crews.

---

## Technical Specifications and System Stack

### Client-Side Architecture
* **Core Framework**: React 18 with Vite build tooling.
* **Styling**: Tailwind CSS utility architecture with responsive interface layouts.
* **Geospatial Visualization**: Leaflet, React-Leaflet, OpenStreetMap vector tiles.
* **Vector Icons**: Lucide React.
* **Client Networking**: Axios with centralized environment resolution and Socket.IO client.
* **Document Printing Engine**: Native A4 CSS paged-media styling for PDF printing.

### Server-Side Architecture
* **Runtime**: Node.js with Express 5 REST API framework.
* **Real-Time Protocol**: Socket.IO for low-latency bidirectional state synchronization.
* **Media Processing**: Multer memory storage and Cloudinary CDN cloud media pipelines.
* **Artificial Intelligence**: Google Gemini Multimodal REST API.

### Database and Data Models
* **Persistence Layer**: MongoDB Atlas cloud cluster.
* **Object-Document Mapper**: Mongoose ODM.
* **Spatial Index**: GeoJSON Point format with spherical index (`location: { type: "Point", coordinates: [lng, lat] }`).
* **Connection Architecture**: Serverless-aware connection caching (`mongoose.connection.readyState >= 1`) optimized for Vercel execution environments.

### Deployment and Infrastructure
* **Hosting**: Vercel Multi-Service Architecture.
* **Routing Configuration**: Dedicated ingress routing defined in `vercel.json` mapping `/api/*`, `/uploads/*`, and `/issues/*` to backend micro-handlers while routing application navigation to the Vite client.

---

## System Architecture Flow

```
[ Citizen Web Client ]
       │
       ├── 1. Submits Geocoded Image + Audio
       ▼
[ Ingress Controller / vercel.json ]
       │
       ├── /api/* Routing
       ▼
[ Express 5 Micro-Service ]
       │
       ├── 2. Multimodal Perception (Google Gemini Vision API)
       │      └── Category, Severity (1-5), Hazard Matrix, Work Summary
       │
       ├── 3. Geospatial Query (MongoDB Atlas 2dsphere)
       │      └── 100m Radius Proximity Deduplication Radar
       │
       ├── 4. Cloud Storage (Cloudinary CDN)
       │      └── Photographic Asset Storage
       │
       └── 5. Real-Time Broadcast (Socket.IO)
              └── Live Dispatch Terminal Updates
```

---

## Functional Modules

### Public Citizen Portal
* **Voice and Audio Transcription**: Native voice recording with automated normalization into standardized municipal technical tickets.
* **Geospatial Radar Modal**: Prevents duplicate reports by showing active radius incidents.
* **Grievance Audit Tracker**: Track turnaround velocity, assigned field workers, and SLA countdowns using ticket references (`#FMA-XXXXXX`).
* **Ground Satisfaction Survey**: Citizens provide star ratings (1 to 5) and feedback comments to permanently close tickets.

### Municipal Command and Operations Terminal
* **Operational Overview Metrics**: Real-time KPI monitors displaying pending volume, high-priority counts, in-progress velocity, and resolution ratios.
* **Jurisdiction Map View**: Geospatial inspection terminal with interactive ward boundaries, filter chips, and assigned field crew attributes.
* **Work Order Drawer**: Assign designated municipal workers (e.g., Sanitation Squad, Road PWD Crew), log field inspection remarks, and submit repair proofs.
* **Statutory Gazette Audit Generator**: Outputs official municipal dockets compliant with the Right to Public Services Act, featuring SHA-256 digital verification hashes and administrative seals.

---

## Pre-Configured Municipal Audit Credentials

The platform includes seed data modeling realistic urban local body workflows across multiple administrative jurisdictions:

### 1. Alandi Municipal Council (Pune District, PMRDA Region)
* **Chief Municipal Commissioner (Admin)**: `admin@fixmyarea.gov` | `admin123`
* **Sanitation & Waste Inspector**: `waste@fixmyarea.gov` | `officer123`
* **Roads & PWD Engineer**: `roads@fixmyarea.gov` | `officer123`

### 2. Wardha Municipal Council (Wardha District, Vidarbha Region)
* **Chief Municipal Officer (CMO Admin)**: `wardha.admin@fixmyarea.gov` | `admin123`
* **Chief Sanitary Inspector (SWM)**: `wardha.waste@fixmyarea.gov` | `officer123`
* **Executive PWD Engineer (Roads)**: `wardha.roads@fixmyarea.gov` | `officer123`

### 3. Pan-India Apex Directorate
* **Director General of Municipal Administration**: `director@fixmyarea.gov` | `admin123`

---

## Local Development and Installation

### Prerequisites
* Node.js (v18.0.0 or higher)
* npm (v9.0.0 or higher)
* MongoDB Atlas connection URI or local MongoDB instance

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/dipikabhelaye27/FixMyArea.git
   cd FixMyArea
   ```

2. **Server Configuration**
   Create `server/.env` with the following variables:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_atlas_uri
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=http://localhost:5173
   ```

3. **Install Dependencies**
   ```bash
   # Install root and backend dependencies
   npm install

   # Install frontend dependencies
   cd client && npm install && cd ..
   ```

4. **Seed Database with Sample Incidents**
   ```bash
   npm run seed
   ```

5. **Start Application**
   ```bash
   # Terminal 1: Backend Server
   cd server && npm start

   # Terminal 2: Frontend Client
   cd client && npm run dev
   ```

---

## Production Deployment on Vercel

FixMyArea is configured for continuous deployment on Vercel via multi-service orchestration:
* Root configuration: `vercel.json`
* Frontend service: `client` (Vite SPA)
* Backend service: `server` (Express REST micro-service with `src/app.js` entrypoint)
* Static media routes: `/issues/*` and `/uploads/*`

To deploy updates:
```bash
git add .
git commit -m "chore: production update"
git push origin main
```
Vercel automatically triggers build and deployment pipelines to: https://fixmyarea-mauve.vercel.app/

---

## Search Engine Optimization Metadata and Keywords

* **Primary Keywords**: civic grievance redressal, municipal issue reporting platform, smart city operations software, urban local bodies technology, municipal complaint tracking system, public infrastructure defect management.
* **Secondary Keywords**: geospatial deduplication, MongoDB GeoJSON 2dsphere civic tech, Google Gemini civic artificial intelligence, computer vision road defect classification, Right to Public Services Act software, municipal work order management, verified pothole reporting app, open government platform India.
* **Target Users**: Municipal Commissioners, Chief Officers, Urban Development Departments, Smart City Mission Directorates, PWD Engineers, Civic Tech Researchers, Engaged Citizens.

---

## License and Governance

This project is distributed under the ISC License. Designed and architected for transparent, accountable, and measurable municipal governance.
