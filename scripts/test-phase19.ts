import assert from "assert";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Dock } from "../src/models/Dock";
import { Vessel } from "../src/models/Vessel";
import { Booking } from "../src/models/Booking";
import { USER_ROLES, BOOKING_STATUSES, AUTH_COOKIE_NAME } from "../src/lib/constants";
import { signSessionToken } from "../src/lib/auth";
import { PATCH } from "../src/app/api/bookings/[id]/delay/route";
import { getOwnerBookings } from "../src/services/booking-lifecycle.service";

async function runPhase19Tests() {
  console.log("⚓ Running Phase 19 Delay Reporting & Owner Arrivals Verification...");

  await connectDB();

  const timestamp = Date.now();
  const boaterEmail = `phase19.boater.${timestamp}@anchordrop.test`;
  const otherBoaterEmail = `phase19.other.${timestamp}@anchordrop.test`;
  const ownerEmail = `phase19.owner.${timestamp}@anchordrop.test`;

  // 1. Setup test users
  const boater = await User.create({
    name: "Captain Dave Boater",
    email: boaterEmail,
    passwordHash: "dummy-hash-test",
    role: USER_ROLES.BOATER,
  });

  const otherBoater = await User.create({
    name: "Captain Unauthorized",
    email: otherBoaterEmail,
    passwordHash: "dummy-hash-test",
    role: USER_ROLES.BOATER,
  });

  const owner = await User.create({
    name: "Harbor Master Host",
    email: ownerEmail,
    passwordHash: "dummy-hash-test",
    role: USER_ROLES.DOCK_OWNER,
  });

  // 2. Setup test dock
  const dock = await Dock.create({
    ownerId: owner._id,
    title: "Phase 19 Verification Deepwater Slip",
    location: "Fort Lauderdale, FL",
    waterway: "New River",
    dockType: "Marina Slip",
    photos: ["/images/test-dock.jpg"],
    maxLengthFt: 55,
    maxBeamFt: 18,
    minDepthFt: 8,
    pricePerDay: 130,
    amenities: ["Power 50A", "Fresh Water"],
    availabilityNotes: "Available",
    arrivalInstructions: "Gate Code #7731. VHF Ch 68.",
    isActive: true,
  });

  // 3. Setup test vessel
  const vessel = await Vessel.create({
    userId: boater._id,
    name: "S/V Wave Dancer",
    type: "Cruiser",
    lengthFt: 40,
    beamFt: 13,
    draftFt: 5,
    registration: "FL-TEST-P19",
  });

  // 4. Setup test bookings (Accepted, Pending, Rejected)
  const acceptedBooking = await Booking.create({
    boaterId: boater._id,
    ownerId: owner._id,
    dockId: dock._id,
    vesselId: vessel._id,
    startDate: new Date(Date.now() + 3600000 * 2), // 2 hours from now
    endDate: new Date(Date.now() + 86400000 * 3),
    status: BOOKING_STATUSES.ACCEPTED,
    specialRequests: "Arriving before sunset.",
  });

  const pendingBooking = await Booking.create({
    boaterId: boater._id,
    ownerId: owner._id,
    dockId: dock._id,
    vesselId: vessel._id,
    startDate: new Date(Date.now() + 86400000),
    endDate: new Date(Date.now() + 86400000 * 2),
    status: BOOKING_STATUSES.PENDING,
    specialRequests: "Pending confirmation.",
  });

  const rejectedBooking = await Booking.create({
    boaterId: boater._id,
    ownerId: owner._id,
    dockId: dock._id,
    vesselId: vessel._id,
    startDate: new Date(Date.now() + 86400000 * 2),
    endDate: new Date(Date.now() + 86400000 * 4),
    status: BOOKING_STATUSES.REJECTED,
  });

  // Generate auth tokens
  const boaterToken = signSessionToken({
    userId: boater._id.toString(),
    email: boater.email,
    name: boater.name,
    role: USER_ROLES.BOATER,
  });

  const otherBoaterToken = signSessionToken({
    userId: otherBoater._id.toString(),
    email: otherBoater.email,
    name: otherBoater.name,
    role: USER_ROLES.BOATER,
  });

  const ownerToken = signSessionToken({
    userId: owner._id.toString(),
    email: owner.email,
    name: owner.name,
    role: USER_ROLES.DOCK_OWNER,
  });

  try {
    // -------------------------------------------------------------------------
    // Test 1: Sub-phase 19.1 & 19.2: Boater reports delay on accepted booking
    // -------------------------------------------------------------------------
    const delayEtaDate = new Date(Date.now() + 3600000 * 5); // 5 hours from now
    const delayNoteText = "Delayed by heavy current and low tide at inlet; waiting for flood tide.";

    const reqSuccess = new NextRequest(
      `http://localhost:3000/api/bookings/${acceptedBooking._id}/delay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `${AUTH_COOKIE_NAME}=${boaterToken}`,
        },
        body: JSON.stringify({
          delayEta: delayEtaDate.toISOString(),
          delayNote: delayNoteText,
        }),
      }
    );

    const resSuccess = await PATCH(reqSuccess, {
      params: Promise.resolve({ id: acceptedBooking._id.toString() }),
    });

    assert.strictEqual(resSuccess.status, 200, "PATCH delay should return 200 OK for valid boater request");
    const dataSuccess = await resSuccess.json();
    assert.strictEqual(dataSuccess.status, "ok");
    assert.strictEqual(dataSuccess.message, "Arrival delay reported successfully");
    assert.strictEqual(dataSuccess.booking.delayNote, delayNoteText);

    // Verify in MongoDB persistence
    const persistedBooking = await Booking.findById(acceptedBooking._id);
    assert(persistedBooking !== null, "Booking must exist in DB");
    assert.strictEqual(persistedBooking.delayNote, delayNoteText, "Persisted delayNote must match");
    assert.strictEqual(
      new Date(persistedBooking.delayEta!).getTime(),
      delayEtaDate.getTime(),
      "Persisted delayEta timestamp must match"
    );
    console.log("  ✓ Sub-phase 19.1 & 19.2: Boater successfully reported delay (delayEta & delayNote persisted in DB)");

    // -------------------------------------------------------------------------
    // Test 2: Authorization Checks (403 Forbidden & 401 Unauthorized)
    // -------------------------------------------------------------------------
    // 2a. Another boater cannot report delay on this booking (403)
    const reqOtherBoater = new NextRequest(
      `http://localhost:3000/api/bookings/${acceptedBooking._id}/delay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `${AUTH_COOKIE_NAME}=${otherBoaterToken}`,
        },
        body: JSON.stringify({
          delayEta: new Date(Date.now() + 3600000 * 6).toISOString(),
          delayNote: "Unauthorized delay attempt",
        }),
      }
    );

    const resOtherBoater = await PATCH(reqOtherBoater, {
      params: Promise.resolve({ id: acceptedBooking._id.toString() }),
    });
    assert.strictEqual(resOtherBoater.status, 403, "Other boater must be rejected with 403 Forbidden");
    const dataOtherBoater = await resOtherBoater.json();
    assert(
      dataOtherBoater.error.includes("Forbidden") || dataOtherBoater.error.includes("authorized"),
      "Error message must indicate forbidden access"
    );
    console.log("  ✓ Authorization: Non-assigned boater rejected with 403 Forbidden");

    // 2b. Non-boater role (e.g., dock owner) cannot call boater delay route (403)
    const reqOwner = new NextRequest(
      `http://localhost:3000/api/bookings/${acceptedBooking._id}/delay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `${AUTH_COOKIE_NAME}=${ownerToken}`,
        },
        body: JSON.stringify({
          delayEta: new Date(Date.now() + 3600000 * 6).toISOString(),
          delayNote: "Owner attempting boater action",
        }),
      }
    );

    const resOwner = await PATCH(reqOwner, {
      params: Promise.resolve({ id: acceptedBooking._id.toString() }),
    });
    assert.strictEqual(resOwner.status, 403, "Non-boater role must be rejected with 403 Forbidden");
    console.log("  ✓ Role Guard: Non-boater role rejected with 403 Forbidden");

    // 2c. Unauthenticated request rejected with 401
    const reqUnauth = new NextRequest(
      `http://localhost:3000/api/bookings/${acceptedBooking._id}/delay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delayEta: new Date(Date.now() + 3600000 * 6).toISOString(),
          delayNote: "No auth cookie",
        }),
      }
    );

    const resUnauth = await PATCH(reqUnauth, {
      params: Promise.resolve({ id: acceptedBooking._id.toString() }),
    });
    assert.strictEqual(resUnauth.status, 401, "Unauthenticated request must be rejected with 401 Unauthorized");
    console.log("  ✓ Auth Guard: Unauthenticated request rejected with 401 Unauthorized");

    // -------------------------------------------------------------------------
    // Test 3: Lifecycle State Machine Checks (409 Conflict)
    // -------------------------------------------------------------------------
    // 3a. Reporting delay on pending booking throws 409 Conflict
    const reqPending = new NextRequest(
      `http://localhost:3000/api/bookings/${pendingBooking._id}/delay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `${AUTH_COOKIE_NAME}=${boaterToken}`,
        },
        body: JSON.stringify({
          delayEta: new Date(Date.now() + 3600000 * 6).toISOString(),
          delayNote: "Attempt on pending booking",
        }),
      }
    );

    const resPending = await PATCH(reqPending, {
      params: Promise.resolve({ id: pendingBooking._id.toString() }),
    });
    assert.strictEqual(resPending.status, 409, "Reporting delay on pending booking must return 409 Conflict");
    const dataPending = await resPending.json();
    assert(
      dataPending.error.includes("Conflict") || dataPending.error.includes("accepted"),
      "Error must indicate delay can only be reported for accepted bookings"
    );
    console.log("  ✓ State Guard: Reporting delay on pending booking rejected with 409 Conflict");

    // 3b. Reporting delay on rejected booking throws 409 Conflict
    const reqRejected = new NextRequest(
      `http://localhost:3000/api/bookings/${rejectedBooking._id}/delay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `${AUTH_COOKIE_NAME}=${boaterToken}`,
        },
        body: JSON.stringify({
          delayEta: new Date(Date.now() + 3600000 * 6).toISOString(),
          delayNote: "Attempt on rejected booking",
        }),
      }
    );

    const resRejected = await PATCH(reqRejected, {
      params: Promise.resolve({ id: rejectedBooking._id.toString() }),
    });
    assert.strictEqual(resRejected.status, 409, "Reporting delay on rejected booking must return 409 Conflict");
    console.log("  ✓ State Guard: Reporting delay on rejected booking rejected with 409 Conflict");

    // -------------------------------------------------------------------------
    // Test 4: Validation Checks (400 Bad Request)
    // -------------------------------------------------------------------------
    // 4a. Missing or invalid delayEta
    const reqBadEta = new NextRequest(
      `http://localhost:3000/api/bookings/${acceptedBooking._id}/delay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `${AUTH_COOKIE_NAME}=${boaterToken}`,
        },
        body: JSON.stringify({
          delayEta: "invalid-date-string",
          delayNote: "Invalid date format test",
        }),
      }
    );

    const resBadEta = await PATCH(reqBadEta, {
      params: Promise.resolve({ id: acceptedBooking._id.toString() }),
    });
    assert.strictEqual(resBadEta.status, 400, "Invalid delayEta must return 400 Bad Request");

    // 4b. Delay note exceeding 300 characters
    const reqLongNote = new NextRequest(
      `http://localhost:3000/api/bookings/${acceptedBooking._id}/delay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `${AUTH_COOKIE_NAME}=${boaterToken}`,
        },
        body: JSON.stringify({
          delayEta: new Date(Date.now() + 3600000 * 6).toISOString(),
          delayNote: "A".repeat(301),
        }),
      }
    );

    const resLongNote = await PATCH(reqLongNote, {
      params: Promise.resolve({ id: acceptedBooking._id.toString() }),
    });
    assert.strictEqual(resLongNote.status, 400, "Delay note exceeding 300 characters must return 400 Bad Request");
    console.log("  ✓ Validation: Bad request payloads properly validated and rejected with 400");

    // -------------------------------------------------------------------------
    // Test 5: Sub-phase 19.4 & 19.5: Delay values returned in Owner Booking Queries
    // -------------------------------------------------------------------------
    const ownerBookings = await getOwnerBookings(owner._id.toString());
    assert(ownerBookings.length >= 1, "Owner must have at least one booking");

    const foundBooking = ownerBookings.find(
      (b) => b._id.toString() === acceptedBooking._id.toString()
    );
    assert(foundBooking !== undefined, "Accepted booking must be in owner bookings list");
    assert.strictEqual(foundBooking.delayNote, delayNoteText, "Owner query must include boater delayNote");
    assert(foundBooking.delayEta !== null && foundBooking.delayEta !== undefined, "Owner query must include delayEta");
    assert.strictEqual(
      new Date(foundBooking.delayEta!).getTime(),
      delayEtaDate.getTime(),
      "Owner query delayEta must match boater reported timestamp"
    );

    // Verify populated relations
    const populatedBoater = foundBooking.boaterId as unknown as { name: string; email: string };
    assert.strictEqual(populatedBoater.name, boater.name, "Boater relation must be populated with name");
    assert.strictEqual(populatedBoater.email, boater.email, "Boater relation must be populated with email");

    const populatedDock = foundBooking.dockId as unknown as { title: string };
    assert.strictEqual(populatedDock.title, dock.title, "Dock relation must be populated with title");

    console.log("  ✓ Sub-phase 19.4 & 19.5: Delay values & boater contact correctly returned in owner queries");

    console.log("🎉 All Phase 19 Delay Reporting & Owner Arrivals assertions PASSED!");
  } finally {
    // Teardown test documents
    await Booking.deleteMany({
      _id: { $in: [acceptedBooking._id, pendingBooking._id, rejectedBooking._id] },
    });
    await Vessel.findByIdAndDelete(vessel._id);
    await Dock.findByIdAndDelete(dock._id);
    await User.deleteMany({
      _id: { $in: [boater._id, otherBoater._id, owner._id] },
    });
  }

  process.exit(0);
}

runPhase19Tests().catch((err) => {
  console.error("❌ Phase 19 Test failed:", err);
  process.exit(1);
});
