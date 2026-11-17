import assert from "assert";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Dock } from "../src/models/Dock";
import { Vessel } from "../src/models/Vessel";
import { Booking } from "../src/models/Booking";
import { BOOKING_STATUSES, USER_ROLES } from "../src/lib/constants";
import {
  getBoaterBookings,
  getOwnerBookings,
  updateBookingStatus,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../src/services/booking-lifecycle.service";

async function runPhase17Tests() {
  console.log("⚓ Running Phase 17 Booking Lists & Status Machine Verification...");

  await connectDB();

  // Create mock IDs and entities for testing
  const boaterId = new mongoose.Types.ObjectId();
  const ownerId = new mongoose.Types.ObjectId();
  const strangerId = new mongoose.Types.ObjectId();

  // Create test user docs
  const boaterUser = await User.create({
    _id: boaterId,
    name: "Test Boater",
    email: `boater_${Date.now()}@example.com`,
    passwordHash: "dummyhash",
    role: USER_ROLES.BOATER,
  });

  const ownerUser = await User.create({
    _id: ownerId,
    name: "Test Host",
    email: `host_${Date.now()}@example.com`,
    passwordHash: "dummyhash",
    role: USER_ROLES.DOCK_OWNER,
  });

  // Create test dock
  const testDock = await Dock.create({
    ownerId,
    title: "Phase 17 Verification Slip",
    location: "Miami, FL",
    waterway: "Biscayne Bay",
    dockType: "Private Dock",
    photos: ["/images/dock.jpg"],
    maxLengthFt: 50,
    maxBeamFt: 15,
    minDepthFt: 8,
    pricePerDay: 120,
    amenities: ["Power", "Water"],
    availabilityNotes: "Available",
    arrivalInstructions: "Private gate code 9988",
    isActive: true,
  });

  // Create test vessel
  const testVessel = await Vessel.create({
    userId: boaterId,
    name: "Sea Breeze",
    type: "Cruiser",
    lengthFt: 38,
    beamFt: 12,
    draftFt: 4.5,
    registration: "FL-1234-AB",
  });

  console.log("  ✓ Setup: Test boater, owner, dock, and vessel created");

  try {
    // -------------------------------------------------------------------------
    // 1. Create a pending booking
    // -------------------------------------------------------------------------
    const booking1 = await Booking.create({
      boaterId,
      ownerId,
      dockId: testDock._id,
      vesselId: testVessel._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 3),
      status: BOOKING_STATUSES.PENDING,
      specialRequests: "Need late checkout if possible",
    });
    assert.strictEqual(booking1.status, BOOKING_STATUSES.PENDING);
    console.log("  ✓ Sub-phase 17.5: Initial booking created with 'pending' status");

    // -------------------------------------------------------------------------
    // 2. Test: pending -> accepted fails for non-owner (Forbidden)
    // -------------------------------------------------------------------------
    let forbiddenCaught = false;
    try {
      await updateBookingStatus(
        booking1._id.toString(),
        "accepted",
        strangerId.toString()
      );
    } catch (err: unknown) {
      forbiddenCaught = true;
      assert.ok(
        err instanceof ForbiddenError || (err as { statusCode?: number }).statusCode === 403,
        "Must throw ForbiddenError (403) when non-owner attempts status update"
      );
    }
    assert.ok(forbiddenCaught, "Forbidden check must reject non-owner");
    console.log("  ✓ Sub-phase 17.4: Non-owner status update correctly rejected (403 Forbidden)");

    // -------------------------------------------------------------------------
    // 3. Test: pending -> accepted succeeds for verified owner
    // -------------------------------------------------------------------------
    const acceptedBooking = await updateBookingStatus(
      booking1._id.toString(),
      "accepted",
      ownerId.toString()
    );
    assert.strictEqual(acceptedBooking.status, BOOKING_STATUSES.ACCEPTED);
    console.log("  ✓ Sub-phase 17.5: 'pending -> accepted' transition succeeds for owner");

    // -------------------------------------------------------------------------
    // 4. Test: accepted -> completed succeeds for verified owner
    // -------------------------------------------------------------------------
    const completedBooking = await updateBookingStatus(
      booking1._id.toString(),
      "completed",
      ownerId.toString()
    );
    assert.strictEqual(completedBooking.status, BOOKING_STATUSES.COMPLETED);
    console.log("  ✓ Sub-phase 17.5: 'accepted -> completed' transition succeeds for owner");

    // -------------------------------------------------------------------------
    // 5. Test: completed -> anything fails (Invalid transition)
    // -------------------------------------------------------------------------
    let completedTransitionCaught = false;
    try {
      await updateBookingStatus(
        booking1._id.toString(),
        "accepted",
        ownerId.toString()
      );
    } catch (err: unknown) {
      completedTransitionCaught = true;
      assert.ok(
        err instanceof ConflictError || (err as { statusCode?: number }).statusCode === 409,
        "Must throw ConflictError (409) when attempting invalid transition from completed"
      );
    }
    assert.ok(completedTransitionCaught, "Completed booking must not allow transition back to accepted");
    console.log("  ✓ Sub-phase 17.5: 'completed -> accepted' transition correctly blocked (409 Conflict)");

    // -------------------------------------------------------------------------
    // 6. Test: rejected -> accepted fails (Invalid transition)
    // -------------------------------------------------------------------------
    // Create a second booking to test rejection and transition from rejected
    const booking2 = await Booking.create({
      boaterId,
      ownerId,
      dockId: testDock._id,
      vesselId: testVessel._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 2),
      status: BOOKING_STATUSES.PENDING,
      specialRequests: "Weekend stay",
    });

    // pending -> rejected succeeds
    const rejectedBooking = await updateBookingStatus(
      booking2._id.toString(),
      "rejected",
      ownerId.toString()
    );
    assert.strictEqual(rejectedBooking.status, BOOKING_STATUSES.REJECTED);
    console.log("  ✓ Sub-phase 17.5: 'pending -> rejected' transition succeeds for owner");

    // rejected -> accepted must fail
    let rejectedTransitionCaught = false;
    try {
      await updateBookingStatus(
        booking2._id.toString(),
        "accepted",
        ownerId.toString()
      );
    } catch (err: unknown) {
      rejectedTransitionCaught = true;
      assert.ok(
        err instanceof ConflictError || (err as { statusCode?: number }).statusCode === 409,
        "Must throw ConflictError (409) when attempting invalid transition from rejected"
      );
    }
    assert.ok(rejectedTransitionCaught, "Rejected booking cannot transition to accepted");
    console.log("  ✓ Sub-phase 17.5: 'rejected -> accepted' transition correctly blocked (409 Conflict)");

    // -------------------------------------------------------------------------
    // 7. Test: NotFoundError on invalid or missing booking ID
    // -------------------------------------------------------------------------
    let notFoundCaught = false;
    try {
      await updateBookingStatus(
        new mongoose.Types.ObjectId().toString(),
        "accepted",
        ownerId.toString()
      );
    } catch (err: unknown) {
      notFoundCaught = true;
      assert.ok(
        err instanceof NotFoundError || (err as { statusCode?: number }).statusCode === 404,
        "Must throw NotFoundError (404) for non-existent booking"
      );
    }
    assert.ok(notFoundCaught, "Non-existent booking must throw NotFoundError (404)");
    console.log("  ✓ Sub-phase 17.4: Non-existent booking throws 404 NotFoundError");

    // -------------------------------------------------------------------------
    // 8. Test: getBoaterBookings returns populated bookings
    // -------------------------------------------------------------------------
    const boaterBookings = await getBoaterBookings(boaterId.toString());
    assert.ok(boaterBookings.length >= 2, "Must return at least 2 bookings for boater");
    assert.ok(boaterBookings[0].dockId, "dockId must be populated");
    assert.ok(boaterBookings[0].vesselId, "vesselId must be populated");
    assert.strictEqual(
      (boaterBookings[0].dockId as unknown as { title: string }).title,
      "Phase 17 Verification Slip"
    );
    console.log("  ✓ Sub-phase 17.1: getBoaterBookings returned populated dock & vessel records");

    // -------------------------------------------------------------------------
    // 9. Test: getOwnerBookings returns populated bookings with boater details
    // -------------------------------------------------------------------------
    const ownerBookings = await getOwnerBookings(ownerId.toString());
    assert.ok(ownerBookings.length >= 2, "Must return at least 2 bookings for owner");
    assert.ok(ownerBookings[0].dockId, "dockId must be populated");
    assert.ok(ownerBookings[0].vesselId, "vesselId must be populated");
    assert.ok(ownerBookings[0].boaterId, "boaterId must be populated");
    assert.strictEqual(
      (ownerBookings[0].boaterId as unknown as { name: string }).name,
      "Test Boater"
    );
    assert.ok(
      (ownerBookings[0].boaterId as unknown as { email: string }).email,
      "Boater email must be populated"
    );
    console.log("  ✓ Sub-phase 17.2: getOwnerBookings returned populated dock, vessel, and boater info");

  } finally {
    // Cleanup
    await Booking.deleteMany({ dockId: testDock._id });
    await Vessel.deleteMany({ _id: testVessel._id });
    await Dock.deleteMany({ _id: testDock._id });
    await User.deleteMany({ _id: { $in: [boaterId, ownerId] } });
    console.log("  ✓ Teardown: Test fixtures cleaned up");
  }

  console.log("🎉 All Phase 17 Booking Lists & Status Machine tests PASSED!");
  process.exit(0);
}

runPhase17Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
