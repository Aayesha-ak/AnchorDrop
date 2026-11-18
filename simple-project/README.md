# ⚓ AnchorDrop — Simple HTML/CSS/JS Project

**Tagline:** Discover. Dock. Unwind.  
**Concept:** A two-sided marketplace connecting Boaters with private waterfront dock owners and marina berths.  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (No React, Next.js, or complex frameworks).

---

## 🚀 How to Run the Project

1. Open the folder: `simple-project`
2. Double-click **`index.html`** in any web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
3. **No server, no installation, and no build steps are required!** It runs 100% offline and locally.

---

## 🎓 2-Minute Viva / Professor Demonstration Script

Follow this simple flow to demonstrate every feature cleanly to your professor:

### Step 1: Public Homepage (`index.html`)
- Point out the **Brand Identity**: Deep Navy (`#0B1F33`), Champagne Gold (`#C6A56B`), Warm Cream (`#F5F1E8`).
- Show the **Hero Section** with the preserved marina image and tagline *"Discover. Dock. Unwind."*.
- Scroll down to show **Featured Berths** and the clear distinction between **Boaters** and **Dock Owners**.
- Mention the **1-Click Class Presentation Logins** at the bottom of the page.

### Step 2: Explore Docks & Real-Time Filtering (`explore.html`)
- Open **Explore Docks** from the navbar.
- Type *"Miami"* or select *"Floating Dock"* in the filter bar and click **Apply Filters**.
- Show how the listings update immediately without refreshing the page.

### Step 3: Instant Vessel Compatibility Engine (The Key Feature!)
- On any berth card (e.g., *Harbor Point Slip A4*), click **"Check Fit & Book"**.
- The modal opens:
  - If you select **"Sea Breeze" (38 ft)**: It displays a **Green Box** saying *"Vessel is Dimensionally Compatible"* (Length, Beam, and Draft are all within safe limits).
  - Explain the 3 constraints to your professor:
    1. `Vessel Length ≤ Dock Max Length`
    2. `Vessel Beam ≤ Dock Max Beam`
    3. `Vessel Draft ≤ Dock Minimum Water Depth` (prevents low-tide grounding).
- Click **"Submit Booking Request"**. A new booking is created with status **Pending**.

### Step 4: Boater Dashboard (`boater-dashboard.html`)
- View **My Vessels**: Show the fleet table and click **"+ Add New Vessel"** to show working CRUD operations.
- Switch to **My Bookings & Arrivals**: Show the newly submitted booking in **Pending** status. Explain that gate codes remain locked until the owner accepts.

### Step 5: Dock Owner Dashboard (`owner-dashboard.html`)
- Click **"Switch to Dock Owner View"** at the top.
- Tab 1 (**My Berths**): Show active listings with dimensions, pricing, and CRUD controls.
- Tab 2 (**Booking Requests**): Show the incoming request from Captain Sarah with her vessel specs.
- Click **"✓ Accept Request"**! (Point out that AnchorDrop checks for overlapping dates to prevent double-booking).

### Step 6: Arrival Coordination & Real-Time Delay Reporting
- Switch back to **Boater Dashboard**:
  - The booking status has now changed to **ACCEPTED**!
  - The **Arrival Instructions & Gate PIN** are now unlocked.
  - Click **"⏱️ Report Arrival Delay"**, set a new ETA (e.g., 18:30) and a reason (e.g., *"Waiting for tide at drawbridge"*), then submit.
- Switch back to **Dock Owner Dashboard** → Tab 3 (**Arrivals & Live Delays**):
  - Point to the live yellow banner: **"🚨 INCOMING VESSEL DELAY REPORTED — NEW ETA: 18:30"** with the captain's note!

---

## 📁 File Structure

```text
simple-project/
├── index.html              # Public homepage (Hero, brand story, featured slips)
├── explore.html            # Marketplace with filters & live compatibility modal
├── how-it-works.html       # Clear step-by-step guide explaining the math & rules
├── login.html              # Sign In / Register with 1-click demo logins
├── boater-dashboard.html   # Boater fleet management, bookings, arrival PINs, delay reports
├── owner-dashboard.html    # Dock owner berth CRUD, request review, live arrivals tracker
├── css/
│   └── style.css           # Single clean, responsive stylesheet (Marina luxury aesthetic)
├── js/
│   └── app.js              # LocalStorage database, demo auth, compatibility calculation
├── images/
│   └── hero-marina.jpeg    # Preserved marina hero photograph
└── README.md               # Presentation guide & student viva talking points
```

---

## 💡 MCA Viva Questions & Answers (Non-Technical Friendly)

**Q1: How does the application store data without a backend server or database?**  
> *"We utilize browser `localStorage`. It acts as a client-side key-value database, saving docks, vessels, and bookings as JSON strings. Both the boater and dock owner dashboards read from the same `localStorage`, so any status update made by the owner is instantly visible to the boater."*

**Q2: What is the core business logic or algorithm in this project?**  
> *"The core logic is the Vessel-to-Berth Compatibility Engine in `js/app.js`. It performs a 3-point dimensional calculation: verifying vessel length, beam, and underwater draft against berth limits and minimum depth to prevent grounding at low tide."*

**Q3: How are overlapping bookings prevented?**  
> *"When a dock owner clicks 'Accept Request', our JavaScript checks if another booking for that same berth is already accepted on overlapping dates. If an overlap is detected, the system alerts the owner and prevents the conflict."*

**Q4: What will be the next step (Stage 2)?**  
> *"In Stage 2, we will migrate the `localStorage` logic into a Node.js + Express REST API backed by an SQLite/PostgreSQL database with JWT authentication."*
