# Gym Management Platform Architecture

## Technology Stack

**Frontend**
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript (TSX)
*   **UI Library:** React 19
*   **Styling:** Tailwind CSS v4 (Glassmorphism, Dark Theme)
*   **Icons:** Lucide React
*   **QR Processing:** `react-qr-code` (Generator), `@yudiel/react-qr-scanner` (Scanner)

**Backend**
*   **Environment:** Node.js Runtime
*   **Architecture:** Next.js Server Actions
*   **Authentication:** Clerk
*   **Websockets/Real-time:** Pusher
*   **Tokens:** `jsonwebtoken` (JWT)

**Database & Storage**
*   **Database:** PostgreSQL (Hosted on Neon)
*   **ORM:** Prisma
*   **Media:** Cloudinary

**Deployment**
*   **Hosting:** Vercel

---

## Core Workflows

### 1. Customer Flow
*   **Onboarding:** Users authenticate via Clerk securely.
*   **Discovery:** Users browse a public directory of available gyms and select one.
*   **Conversion:** Users select a pricing plan and formally "Request to Join".
*   **Pending State:** Access to the gym's private community and physical QR entry is entirely locked on the server side until the gym owner manually approves the request.
*   **Active State:** Upon approval, community access unlocks. If the membership plan is currently active (not expired), the customer can use the "Scan Gym QR" feature on their dashboard.
*   **Physical Entry:**
    *   The gym owner has a physical/digital QR code prominently displayed at the desk.
    *   The customer opens their dashboard, clicks "Scan QR", and points their phone camera at the desk QR code.
    *   The sever validates the scan. If successful, attendance is logged and the admin dashboard updates instantly via Pusher.

### 2. Gym Owner / Admin Flow
*   **Management:** Admins manage their gym profile, pricing plans, and member lists.
*   **Request Handling:** Admins review incoming "Join Requests". Approving a request instantly updates the customer's permissions and sends a Pusher notification.
*   **Live Monitoring:** A dedicated tab showing real-time entry logs (powered by Pusher) as customers scan in at the front desk.
*   **Access Control:** Rejecting a user or marking a plan as expired immediately blocks physical QR entry and revokes private community access.

---

## Database Architecture (Prisma)

The database necessitates complex relational mapping to handle multi-tenant isolation safely.

**Key Models:**

*   `User`: Global platform users mapped by Clerk ID.
*   `Gym`: The central entity representing a physical location.
*   `GymAdmin`: Access control list (ACL) linking Users as owners/managers of a Gym.
*   `MembershipPlan`: The tiers (e.g., "1 Month Pack", "Annual") a Gym offers.
*   `Membership`: The active subscription linking a User, a Gym, and a Plan. Contains `startDate`, `endDate`, and `status`.
*   `JoinRequest`: Tracks the approval pipeline (`PENDING`, `ACCEPTED`, `REJECTED`).
*   `AttendanceLog`: Immutable ledger of successful QR scans.
*   `GymQrToken`: Secure management of the gym's rotating secret key.

---

## QR & Security Implementation

**QR Flow Security:**
1.  Unlike traditional "show your barcode" systems, the *Customer* acts as the scanner.
2.  The Gym desk displays a QR code consisting of a URL or encrypted payload containing the Gym ID and a rotating JWT payload.
3.  The Customer scans this code using `@yudiel/react-qr-scanner`.
4.  A Server Action fires carrying the payload.
5.  **Strict Server Checks:** The server verifies:
    *   The currently authenticated Clerk user making the request.
    *   A database lookup confirming `JoinRequest == ACCEPTED` for that specific Gym.
    *   A database lookup confirming `Membership == ACTIVE` (and `endDate > now()`).
    *   The signature of the JWT token inside the QR code (preventing spoofing).
    *   Rate limiting / TTL to prevent replay attacks (someone taking a picture of the QR code and scanning it from home 2 hours later).

**General Security Rules Enforced:**
*   All endpoints validate the user via Clerk `auth()`.
*   Data access layers query using `where: { gymId: userContext.gymId }` to strictly isolate admin views and prevent horizontal privilege escalation.
*   Environment configurations (`DATABASE_URL`, `PUSHER_SECRET`, `CLOUDINARY_URL`) remain strictly `.env.local` and never exposed via `NEXT_PUBLIC_` unless required by the client SDK.
