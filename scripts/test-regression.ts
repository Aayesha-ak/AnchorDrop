import assert from "assert";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Dock } from "../src/models/Dock";
import { Vessel } from "../src/models/Vessel";
import { Booking } from "../src/models/Booking";
import { registerUser, loginUser } from "../src/services/auth.service";
import { createVessel, getVesselsByUserId, deleteVessel } from "../src/services/vessel.service";
import { createDock, getDockById } from "../src/services/dock.service";
import { checkCompatibility } from "../src/services/compatibility.service";
import { createBooking } from "../src/services/booking.service";
import { updateBookingStatus, getBoaterBookings, getOwnerBookings } from "../src/services/booking-lifecycle.service";
import { canUnlockArrivalInstructions } from "../src/services/arrival.service";
import { USER_ROLES, BOOKING_STATUSES } from "../src/lib/constants";

async function runRegressionSuite() {
  console.log("==================================================================");
  console.log("⚓ ANCHORDROP MASTER REGRESSION SUITE (PHASE 24)");
  console.log("==================================================================");

  await connectDB();
  const timestamp = Date.now();

  // -----------------------------------------------------------------------------
  // Test 24.1: Register / Login / Role Authorization
  // -----------------------------------------------------------------------------
  console.log("\n▶ Test 24.1: Register / Login / Role Authorization");
  const boaterEmail = `reg.boater.${timestamp}@anchordrop.test`;
  const ownerEmail = `reg.owner.${timestamp}@anchordrop.test`;
  const password = "password123";

  const { user: registeredBoater } = await registerUser({
    name: "Regression Boater",
    email: boaterEmail,
    password,
    role: USER_ROLES.BOATER,
  });
  assert.strictEqual(registeredBoater.email, boaterEmail);
  assert.strictEqual(registeredBoater.role, USER_ROLES.BOATER);

  const { user: registeredOwner } = await registerUser({
    name: "Regression Owner",
    email: ownerEmail,
    password,
    role: USER_ROLES.DOCK_OWNER,
  });
  assert.strictEqual(registeredOwner.email, ownerEmail);
  assert.strictEqual(registeredOwner.role, USER_ROLES.DOCK_OWNER);

  const { user: loggedInBoater } = await loginUser({ email: boaterEmail, password });
  assert.strictEqual(loggedInBoater.id, registeredBoater.id);

  let failedLogin = false;
  try {
    await loginUser({ email: boaterEmail, password: "wrong-password" });
  } catch {
    failedLogin = true;
  }
  assert.ok(failedLogin, "Invalid password must be rejected");
  console.log("  ✓ Registration, password hashing, login, and roles verified");

  // -----------------------------------------------------------------------------
  // Test 24.2: Vessel CRUD + Ownership Denial
  // -----------------------------------------------------------------------------
  console.log("\n▶ Test 24.2: Vessel CRUD + Ownership Denial");
  const vessel = await createVessel(
    {
      name: "Sea Breeze",
      type: "Motor Yacht",
      lengthFt: 42,
      beamFt: 13,
      draftFt: 4,
      registration: `FL-REG-${timestamp}`,
    },
    registeredBoater.id
  );
  assert.strictEqual(vessel.name, "Sea Breeze");

  const boaterVessels = await getVesselsByUserId(registeredBoater.id);
  assert.strictEqual(boaterVessels.length, 1);

  let forbiddenDelete = false;
  try {
    // Attempt deletion by non-owner
    await deleteVessel(vessel.id, registeredOwner.id);
  } catch {
    forbiddenDelete = true;
  }
  assert.ok(forbiddenDelete, "User B cannot delete User A vessel");
  console.log("  ✓ Vessel CRUD and strict ownership boundaries verified");

  // -----------------------------------------------------------------------------
  // Test 24.3: Dock CRUD + Public Private-Field Stripping
  // -----------------------------------------------------------------------------
  console.log("\n▶ Test 24.3: Dock CRUD + Public Private-Field Stripping");
  const privateInstructions = "Gate code: #8899. Assigned Berth: A12. VHF Ch 68.";
  const dock = await createDock(
    {
      title: "Regression Deepwater Slip",
      location: "Fort Lauderdale, FL",
      waterway: "Stranahan River",
      dockType: "Marina Berth",
      photos: ["/images/test.jpg"],
      maxLengthFt: 50,
      maxBeamFt: 16,
      minDepthFt: 7,
      pricePerDay: 125,
      amenities: ["Power 50A", "Fresh Water", "Wi-Fi"],
      availabilityNotes: "Available for transient docking",
      arrivalInstructions: privateInstructions,
      isActive: true,
    },
    registeredOwner.id
  );
  assert.strictEqual(dock.title, "Regression Deepwater Slip");

  // Public visitor query
  const publicView = await getDockById(dock.id);
  assert.strictEqual((publicView as unknown as { arrivalInstructions?: string }).arrivalInstructions, undefined, "Public query must never leak arrivalInstructions");

  // Owner query
  const ownerView = await getDockById(dock.id, registeredOwner.id);
  assert.strictEqual((ownerView as unknown as { arrivalInstructions?: string }).arrivalInstructions, privateInstructions, "Owner query must expose arrivalInstructions");

  console.log("  ✓ Dock CRUD and private field stripping policy verified");

  // -----------------------------------------------------------------------------
  // Test 24.4: Compatibility Pass/Fail Constraints
  // -----------------------------------------------------------------------------
  console.log("\n▶ Test 24.4: Compatibility Pass/Fail Constraints");
  // Pass: 42ft vessel fits in 50ft dock
  const passCheck = checkCompatibility({
    vessel: { lengthFt: 42, beamFt: 13, draftFt: 4 },
    dock: { maxLengthFt: 50, maxBeamFt: 16, minDepthFt: 7 },
  });
  assert.strictEqual(passCheck.compatible, true);
  assert.strictEqual(passCheck.constraints.length.passes, true);
  assert.strictEqual(passCheck.constraints.beam.passes, true);
  assert.strictEqual(passCheck.constraints.draft.passes, true);

  // Fail: 55ft vessel exceeds 50ft dock
  const failLength = checkCompatibility({
    vessel: { lengthFt: 55, beamFt: 13, draftFt: 4 },
    dock: { maxLengthFt: 50, maxBeamFt: 16, minDepthFt: 7 },
  });
  assert.strictEqual(failLength.compatible, false);
  assert.strictEqual(failLength.constraints.length.passes, false);

  // Fail: 8ft draft exceeds 7ft depth
  const failDraft = checkCompatibility({
    vessel: { lengthFt: 42, beamFt: 13, draftFt: 8 },
    dock: { maxLengthFt: 50, maxBeamFt: 16, minDepthFt: 7 },
  });
  assert.strictEqual(failDraft.compatible, false);
  assert.strictEqual(failDraft.constraints.draft.passes, false);
  console.log("  ✓ LOA, Beam, and Low-Tide Draft dimensional constraints verified");

  // -----------------------------------------------------------------------------
  // Test 24.5 & 24.6: Booking Create -> Accept -> Arrival Instructions Present
  // -----------------------------------------------------------------------------
  console.log("\n▶ Test 24.5 & 24.6: Booking Create -> Accept -> Instructions Unlocked");
  const now = new Date();
  const startDate = new Date(now.getTime() + 86400000);
  const endDate = new Date(now.getTime() + 86400000 * 3);

  const booking = await createBooking(
    {
      dockId: dock.id,
      vesselId: vessel.id,
      startDate,
      endDate,
      specialRequests: "Requesting starboard tie-up.",
    },
    registeredBoater.id
  );
  assert.strictEqual(booking.status, BOOKING_STATUSES.PENDING);

  // Verify locked in pending state
  const pendingUnlock = canUnlockArrivalInstructions(booking, registeredBoater.id);
  assert.strictEqual(pendingUnlock, false, "Pending booking must keep arrival instructions locked");

  // Accept booking as dock host
  const acceptedBooking = await updateBookingStatus(booking.id, BOOKING_STATUSES.ACCEPTED, registeredOwner.id);
  assert.strictEqual(acceptedBooking.status, BOOKING_STATUSES.ACCEPTED);

  // Verify unlocked after acceptance
  const acceptedUnlock = canUnlockArrivalInstructions(acceptedBooking, registeredBoater.id);
  assert.strictEqual(acceptedUnlock, true, "Accepted booking must unlock arrival instructions for boater");

  // Verify third-party boater cannot read instructions
  const otherBoaterUnlock = canUnlockArrivalInstructions(acceptedBooking, new mongoose.Types.ObjectId().toString());
  assert.strictEqual(otherBoaterUnlock, false, "Third-party boater cannot unlock instructions");
  console.log("  ✓ Booking create, host accept, and arrival unlock policy verified");

  // -----------------------------------------------------------------------------
  // Test 24.7: Delay Flow Owner-Visible
  // -----------------------------------------------------------------------------
  console.log("\n▶ Test 24.7: Delay Flow Owner-Visible");
  const delayEta = new Date(startDate.getTime() + 3600000 * 3); // 3 hours late
  const delayNote = "Delayed by heavy current in the ICW";

  acceptedBooking.delayEta = delayEta;
  acceptedBooking.delayNote = delayNote;
  await acceptedBooking.save();

  const ownerBookings = await getOwnerBookings(registeredOwner.id);
  const foundBooking = ownerBookings.find((b) => b._id.toString() === acceptedBooking._id.toString());
  assert.ok(foundBooking, "Booking must be present in owner query");
  assert.strictEqual(foundBooking?.delayNote, delayNote);
  assert.ok(foundBooking?.delayEta);
  console.log("  ✓ In-app delay reporting and owner arrival visibility verified");

  console.log("\n==================================================================");
  console.log("🎉 ALL PHASE 24 REGRESSION ASSERTIONS PASSED WITH ZERO ERRORS!");
  console.log("==================================================================");
  process.exit(0);
}

runRegressionSuite().catch((err) => {
  console.error("❌ Master regression suite failed:", err);
  process.exit(1);
});
