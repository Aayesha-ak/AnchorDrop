import assert from "assert";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { User, Dock, Vessel, Booking } from "../src/models";
import { updateBookingStatus, cancelBoaterBooking } from "../src/services/booking-lifecycle.service";
import { USER_ROLES, BOOKING_STATUSES } from "../src/lib/constants";

async function testNewEnhancements() {
  console.log("⚓ Running AnchorDrop Gap & Resilience Verification...");
  await connectDB();

  const timestamp = Date.now();
  const boater = await User.create({
    name: "Cancel Test Boater",
    email: `cancel.${timestamp}@test.com`,
    passwordHash: "hash123",
    role: USER_ROLES.BOATER,
  });

  const otherBoater = await User.create({
    name: "Other Boater",
    email: `other.${timestamp}@test.com`,
    passwordHash: "hash123",
    role: USER_ROLES.BOATER,
  });

  const owner = await User.create({
    name: "Host Marina",
    email: `host.${timestamp}@test.com`,
    passwordHash: "hash123",
    role: USER_ROLES.DOCK_OWNER,
  });

  const dock = await Dock.create({
    ownerId: owner._id,
    title: "Slip 1A - Test Basin",
    location: "Miami, FL",
    waterway: "Biscayne Bay",
    dockType: "Private Slip",
    maxLengthFt: 50,
    maxBeamFt: 15,
    minDepthFt: 6,
    pricePerDay: 100,
    arrivalInstructions: "Gate code #9999",
  });

  const vessel = await Vessel.create({
    userId: boater._id,
    name: "Wave Runner",
    type: "Yacht",
    lengthFt: 35,
    beamFt: 11,
    draftFt: 3.5,
    registration: `REG-${timestamp}`,
  });

  const now = new Date();
  const start = new Date(now.getTime() + 86400000);
  const end = new Date(now.getTime() + 86400000 * 3);

  // 1. Test cancelBoaterBooking
  const booking1 = await Booking.create({
    boaterId: boater._id,
    ownerId: owner._id,
    dockId: dock._id,
    vesselId: vessel._id,
    startDate: start,
    endDate: end,
    status: BOOKING_STATUSES.PENDING,
  });

  // Non-owner boater cannot cancel
  let failedOther = false;
  try {
    await cancelBoaterBooking(booking1._id.toString(), otherBoater._id.toString());
  } catch {
    failedOther = true;
  }
  assert.ok(failedOther, "Non-owner boater cannot cancel someone else's reservation");

  // Owner boater can cancel pending reservation
  const cancelled = await cancelBoaterBooking(booking1._id.toString(), boater._id.toString());
  assert.strictEqual(cancelled.status, BOOKING_STATUSES.REJECTED);
  console.log("  ✓ cancelBoaterBooking: Boater cancellation verified and restricted");

  // 2. Test overlap / double-booking prevention on berth acceptance
  const bookingA = await Booking.create({
    boaterId: boater._id,
    ownerId: owner._id,
    dockId: dock._id,
    vesselId: vessel._id,
    startDate: start,
    endDate: end,
    status: BOOKING_STATUSES.PENDING,
  });

  const acceptedA = await updateBookingStatus(bookingA._id.toString(), BOOKING_STATUSES.ACCEPTED, owner._id.toString());
  assert.strictEqual(acceptedA.status, BOOKING_STATUSES.ACCEPTED);

  // Second booking on overlapping dates for the exact same berth
  const bookingB = await Booking.create({
    boaterId: otherBoater._id,
    ownerId: owner._id,
    dockId: dock._id,
    vesselId: vessel._id,
    startDate: new Date(start.getTime() + 3600000), // 1 hour later
    endDate: new Date(end.getTime() + 3600000),
    status: BOOKING_STATUSES.PENDING,
  });

  let overlapBlocked = false;
  try {
    await updateBookingStatus(bookingB._id.toString(), BOOKING_STATUSES.ACCEPTED, owner._id.toString());
  } catch {
    overlapBlocked = true;
  }
  assert.ok(overlapBlocked, "Overlapping accepted booking on same dock slip must be blocked with ConflictError");
  console.log("  ✓ Berth double-booking / date overlap prevention verified");

  // Cleanup
  await Booking.deleteMany({ dockId: dock._id });
  await Dock.deleteOne({ _id: dock._id });
  await Vessel.deleteOne({ _id: vessel._id });
  await User.deleteMany({ _id: { $in: [boater._id, otherBoater._id, owner._id] } });

  console.log("🎉 All gap & resilience tests PASSED successfully!");
  process.exit(0);
}

testNewEnhancements().catch((err) => {
  console.error("❌ Enhancement tests failed:", err);
  process.exit(1);
});
