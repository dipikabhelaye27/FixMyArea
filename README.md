# FixMyArea — Civic Grievance Redressal & Resolution Tracking System

An end-to-end, real-time civic issue reporting, geospatial deduplication, and verified resolution tracking platform tailored for Alandi Nagar Parishad and the Pune Metropolitan Region.

FixMyArea moves civic grievance handling beyond passive complaint logging by turning fragmented citizen reports into a single, verified, actionable lifecycle.

---

## Core Capabilities

1. **Citizen Reporting & Automated Technical Triage**:
   - Frictionless photo capture and instant image upload without mandatory registration barriers.
   - Evaluated by computer vision for defect categorization, severity scoring (1–5), hazard detection, and department routing.

2. **Geospatial Deduplication Radar**:
   - Built on MongoDB Atlas GeoJSON `2dsphere` spatial indexing.
   - Identifies existing reports within a 100-meter radius. Citizens can endorse the existing complaint (+1 affected citizen) instead of creating redundant tickets.

3. **Dynamic Priority Scoring Engine**:
   - Computes urgency based on assessed severity, citizen endorsement counts, safety hazard level, and elapsed SLA time.
   - High-impact issues automatically elevate in the department queue.

4. **Department Operations & Field Dispatch**:
   - Department-based triage (Roads & Infrastructure, Solid Waste Management, Water & Sewerage, Electrical & Streetlighting).
   - Field crew dispatching with SLA countdown timers.
   - Master Incident clustering to resolve one physical defect once.

5. **Closing the Loop: "Was it Actually Fixed?"**:
   - Department officers submit an "After" resolution photo proof.
   - Independent visual verification compares Before and After photos to audit work completion.
   - Citizens verify on the ground and provide closure sign-off or reopen the issue if unresolved.

6. **Citizen Track Grievance Status**:
   - Direct lookup by Ticket Reference ID or street name to track real-time resolution progress.

---

## Running Locally

### 1. Backend Server
```bash
cd server
npm install
npm run seed   # Seeds authentic Alandi, Pune civic data
npm start      # Starts on http://localhost:5001
```

### 2. Frontend Web App
```bash
cd client
npm install
npm run dev    # Starts on http://localhost:5173
```

---

## Environment Configuration (`server/.env`)
- `PORT`: 5001
- `MONGO_URI`: MongoDB Atlas cluster connection string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Media storage
- `GEMINI_API_KEY`: Google Gemini API key for image perception and resolution verification
