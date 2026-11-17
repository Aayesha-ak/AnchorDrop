import assert from "assert";
import { connectDB } from "@/lib/db";
import { User, Vessel, Dock, Booking } from "@/models";
import { verifyPassword } from "@/lib/password";
import { USER_ROLES, BOOKING_STATUSES } from "@/lib/constants";
import { canUnlockArrivalInstructions } from "@/services/arrival.service";
import { seedDatabase } from "./seed";

async function runPhase21Tests() {
  console.log("⚓ Running Phase 21 Seed Data & Demo Readiness Verification...\n");

  await connectDB();

  // -------------------------------------------------------------------------
  // Test Step 1: Execute Seed Script
  // -------------------------------------------------------------------------
  console.log("▶ Step 1: Executing seedDatabase()...");
  const seedResult = await seedDatabase();
  assert.ok(seedResult, "seedDatabase should return seed results");

  // -------------------------------------------------------------------------
  // Test Step 2: Verify Users & Password Authentication
  // -------------------------------------------------------------------------
  console.log("▶ Step 2: Verifying seeded users and bcrypt passwords...");
  const alexUser = await User.findOne({ email: "boater@anchordrop.com" });
  assert.ok(alexUser, "Captain Alex user (boater@anchordrop.com) must exist");
  assert.strictEqual(alexUser.name, "Captain Alex Vance");
  assert.strictEqual(alexUser.role, USER_ROLES.BOATER);

  const marinaUser = await User.findOne({ email: "owner@anchordrop.com" });
  assert.ok(marinaUser, "Marina Del Sol user (owner@anchordrop.com) must exist");
  assert.strictEqual(marinaUser.name, "Marina Del Sol Harbor");
  assert.strictEqual(marinaUser.role, USER_ROLES.DOCK_OWNER);

  const sarahUser = await User.findOne({ email: "sarah@anchordrop.com" });
  assert.ok(sarahUser, "Sarah Jenkins user (sarah@anchordrop.com) must exist");
  assert.strictEqual(sarahUser.name, "Sarah Jenkins");
  assert.strictEqual(sarahUser.role, USER_ROLES.DOCK_OWNER);

  // Authenticate passwords with verifyPassword
  for (const user of [alexUser, marinaUser, sarahUser]) {
    const valid = await verifyPassword("password123", user.passwordHash);
    assert.strictEqual(valid, true, `Password "password123" must authenticate for ${user.email}`);

    const invalid = await verifyPassword("wrongPassword99", user.passwordHash);
    assert.strictEqual(invalid, false, `Invalid password must fail authentication for ${user.email}`);
  }
  console.log("  ✓ All 3 demo user accounts exist and authenticate via real bcrypt hash");

  // -------------------------------------------------------------------------
  // Test Step 3: Verify Captain Alex's Vessels
  // -------------------------------------------------------------------------
  console.log("▶ Step 3: Verifying Captain Alex's vessels...");
  const alexVessels = await Vessel.find({ userId: alexUser._id }).sort({ lengthFt: -1 });
  assert.strictEqual(alexVessels.length, 2, "Captain Alex must have exactly 2 vessels");

  const seaBreeze = alexVessels.find((v) => v.name === "Sea Breeze II");
  assert.ok(seaBreeze, "Sea Breeze II vessel must exist");
  assert.strictEqual(seaBreeze.type, "Motor Yacht");
  assert.strictEqual(seaBreeze.lengthFt, 42);
  assert.strictEqual(seaBreeze.beamFt, 13);
  assert.strictEqual(seaBreeze.draftFt, 4);
  assert.strictEqual(seaBreeze.registration, "FL-8821-AV");

  const islandRunner = alexVessels.find((v) => v.name === "Island Runner");
  assert.ok(islandRunner, "Island Runner vessel must exist");
  assert.strictEqual(islandRunner.type, "Center Console");
  assert.strictEqual(islandRunner.lengthFt, 28);
  assert.strictEqual(islandRunner.beamFt, 9);
  assert.strictEqual(islandRunner.draftFt, 2.5);
  assert.strictEqual(islandRunner.registration, "FL-3304-IR");
  console.log("  ✓ Captain Alex has 2 correctly dimensioned vessels");

  // -------------------------------------------------------------------------
  // Test Step 4: Verify Marina Del Sol's 3 Docks
  // -------------------------------------------------------------------------
  console.log("▶ Step 4: Verifying Marina Del Sol's docks...");
  const marinaDocks = await Dock.find({ ownerId: marinaUser._id });
  assert.strictEqual(marinaDocks.length, 3, "Marina Del Sol must have exactly 3 docks");

  const deepwater = marinaDocks.find((d) => d.title === "Marina Del Sol - Deepwater Basin 4B");
  assert.ok(deepwater, "Deepwater Basin 4B must exist");
  assert.strictEqual(deepwater.maxLengthFt, 60);
  assert.strictEqual(deepwater.maxBeamFt, 18);
  assert.strictEqual(deepwater.minDepthFt, 8);
  assert.strictEqual(deepwater.pricePerDay, 140);
  assert.strictEqual(deepwater.location, "Fort Lauderdale, FL");
  assert.strictEqual(deepwater.waterway, "Stranahan River");
  assert.strictEqual(deepwater.dockType, "Marina Slip");
  assert.ok(deepwater.arrivalInstructions.includes("Gate code: #4492"));
  assert.strictEqual(deepwater.isActive, true);

  const sunsetPier = marinaDocks.find((d) => d.title === "Marina Del Sol - Sunset Transient Pier");
  assert.ok(sunsetPier, "Sunset Transient Pier must exist");
  assert.strictEqual(sunsetPier.maxLengthFt, 45);
  assert.strictEqual(sunsetPier.maxBeamFt, 14);
  assert.strictEqual(sunsetPier.minDepthFt, 6);
  assert.strictEqual(sunsetPier.pricePerDay, 110);
  assert.strictEqual(sunsetPier.location, "Fort Lauderdale, FL");
  assert.strictEqual(sunsetPier.waterway, "Intracoastal Waterway");
  assert.strictEqual(sunsetPier.dockType, "Transient Pier");
  assert.ok(sunsetPier.arrivalInstructions.includes("*1280"));
  assert.strictEqual(sunsetPier.isActive, true);

  const northBasin = marinaDocks.find((d) => d.title === "Marina Del Sol - North Basin Slip");
  assert.ok(northBasin, "North Basin Slip must exist");
  assert.strictEqual(northBasin.maxLengthFt, 35);
  assert.strictEqual(northBasin.maxBeamFt, 12);
  assert.strictEqual(northBasin.minDepthFt, 5);
  assert.strictEqual(northBasin.pricePerDay, 85);
  assert.strictEqual(northBasin.location, "Fort Lauderdale, FL");
  assert.strictEqual(northBasin.waterway, "Middle River");
  assert.strictEqual(northBasin.dockType, "Residential Basin");
  assert.ok(northBasin.arrivalInstructions.includes("9912"));
  assert.strictEqual(northBasin.isActive, true);
  console.log("  ✓ Marina Del Sol has 3 active docks with full specifications and arrival instructions");

  // -------------------------------------------------------------------------
  // Test Step 5: Verify Sarah Jenkins' Dock
  // -------------------------------------------------------------------------
  console.log("▶ Step 5: Verifying Sarah Jenkins' dock...");
  const sarahDocks = await Dock.find({ ownerId: sarahUser._id });
  assert.strictEqual(sarahDocks.length, 1, "Sarah Jenkins must have exactly 1 dock");

  const sarahDock = sarahDocks[0];
  assert.strictEqual(sarahDock.title, "Sarah's Private Canal Slip");
  assert.strictEqual(sarahDock.maxLengthFt, 50);
  assert.strictEqual(sarahDock.maxBeamFt, 15);
  assert.strictEqual(sarahDock.minDepthFt, 6);
  assert.strictEqual(sarahDock.pricePerDay, 95);
  assert.strictEqual(sarahDock.location, "Fort Lauderdale, FL");
  assert.strictEqual(sarahDock.waterway, "New River Isles Canal");
  assert.strictEqual(sarahDock.dockType, "Private Residential Slip");
  assert.ok(sarahDock.arrivalInstructions.includes("7731"));
  assert.strictEqual(sarahDock.isActive, true);
  console.log("  ✓ Sarah Jenkins has 1 private residential dock");

  // -------------------------------------------------------------------------
  // Test Step 6: Verify Sample Bookings with Mixed Statuses
  // -------------------------------------------------------------------------
  console.log("▶ Step 6: Verifying sample bookings with mixed statuses...");
  const userIds = [alexUser._id, marinaUser._id, sarahUser._id];
  const bookings = await Booking.find({
    $or: [{ boaterId: { $in: userIds } }, { ownerId: { $in: userIds } }],
  });

  assert.strictEqual(bookings.length, 3, "Exactly 3 bookings should be seeded");

  // Check Pending Booking: Alex -> Sarah's Canal Slip (Sea Breeze II)
  const pendingBooking = bookings.find((b) => b.status === BOOKING_STATUSES.PENDING);
  assert.ok(pendingBooking, "A pending booking must exist");
  assert.strictEqual(String(pendingBooking.boaterId), String(alexUser._id));
  assert.strictEqual(String(pendingBooking.ownerId), String(sarahUser._id));
  assert.strictEqual(String(pendingBooking.dockId), String(sarahDock._id));
  assert.strictEqual(String(pendingBooking.vesselId), String(seaBreeze._id));

  // Check Accepted Booking: Alex -> Marina Del Sol Deepwater Basin 4B (Sea Breeze II)
  const acceptedBooking = bookings.find((b) => b.status === BOOKING_STATUSES.ACCEPTED);
  assert.ok(acceptedBooking, "An accepted booking must exist");
  assert.strictEqual(String(acceptedBooking.boaterId), String(alexUser._id));
  assert.strictEqual(String(acceptedBooking.ownerId), String(marinaUser._id));
  assert.strictEqual(String(acceptedBooking.dockId), String(deepwater._id));
  assert.strictEqual(String(acceptedBooking.vesselId), String(seaBreeze._id));

  // Check Completed Booking: Alex -> Marina Del Sol Sunset Transient Pier (Island Runner)
  const completedBooking = bookings.find((b) => b.status === BOOKING_STATUSES.COMPLETED);
  assert.ok(completedBooking, "A completed booking must exist");
  assert.strictEqual(String(completedBooking.boaterId), String(alexUser._id));
  assert.strictEqual(String(completedBooking.ownerId), String(marinaUser._id));
  assert.strictEqual(String(completedBooking.dockId), String(sunsetPier._id));
  assert.strictEqual(String(completedBooking.vesselId), String(islandRunner._id));

  console.log("  ✓ Sample bookings exist across pending, accepted, and completed statuses");

  // -------------------------------------------------------------------------
  // Test Step 7: Verify Arrival Instruction Privacy & Unlock Logic
  // -------------------------------------------------------------------------
  console.log("▶ Step 7: Verifying arrival instruction policy on seeded bookings...");
  const alexId = alexUser._id.toString();
  const thirdPartyId = "507f1f77bcf86cd799439011";

  // Pending booking: locked for boater
  assert.strictEqual(
    canUnlockArrivalInstructions(pendingBooking, alexId),
    false,
    "Pending booking must keep arrival instructions locked from boater"
  );

  // Accepted booking: unlocked for boater
  assert.strictEqual(
    canUnlockArrivalInstructions(acceptedBooking, alexId),
    true,
    "Accepted booking must unlock arrival instructions for boater"
  );

  // Completed booking: unlocked for boater
  assert.strictEqual(
    canUnlockArrivalInstructions(completedBooking, alexId),
    true,
    "Completed booking must unlock arrival instructions for boater"
  );

  // Third party: locked even if booking is accepted
  assert.strictEqual(
    canUnlockArrivalInstructions(acceptedBooking, thirdPartyId),
    false,
    "Accepted booking must remain locked for unassigned third-party user"
  );
  console.log("  ✓ Arrival instructions unlocked strictly according to acceptance policy");

  // -------------------------------------------------------------------------
  // Test Step 8: Idempotency Verification (Re-run seedDatabase)
  // -------------------------------------------------------------------------
  console.log("▶ Step 8: Verifying seed idempotency (re-running seedDatabase)...");
  await seedDatabase();

  const userCount = await User.countDocuments({
    email: { $in: ["boater@anchordrop.com", "owner@anchordrop.com", "sarah@anchordrop.com"] },
  });
  assert.strictEqual(userCount, 3, "Re-seeding should preserve exact user count of 3");

  const reAlex = await User.findOne({ email: "boater@anchordrop.com" });
  assert.ok(reAlex);
  const reAlexVessels = await Vessel.find({ userId: reAlex._id });
  assert.strictEqual(reAlexVessels.length, 2, "Re-seeding should preserve exact vessel count of 2");

  const reMarina = await User.findOne({ email: "owner@anchordrop.com" });
  assert.ok(reMarina);
  const reMarinaDocks = await Dock.find({ ownerId: reMarina._id });
  assert.strictEqual(reMarinaDocks.length, 3, "Re-seeding should preserve exact dock count of 3 for Marina Del Sol");

  const reSarah = await User.findOne({ email: "sarah@anchordrop.com" });
  assert.ok(reSarah);
  const reSarahDocks = await Dock.find({ ownerId: reSarah._id });
  assert.strictEqual(reSarahDocks.length, 1, "Re-seeding should preserve exact dock count of 1 for Sarah");

  const reBookings = await Booking.find({
    $or: [{ boaterId: reAlex._id }, { ownerId: { $in: [reMarina._id, reSarah._id] } }],
  });
  assert.strictEqual(reBookings.length, 3, "Re-seeding should preserve exact booking count of 3");
  console.log("  ✓ Seed script is completely idempotent: clean reset with no duplicates or orphaned records");

  console.log("\n🎉 All Phase 21 Seed Data & Walkthrough Readiness tests PASSED successfully!\n");
  process.exit(0);
}

runPhase21Tests().catch((err) => {
  console.error("❌ Phase 21 Test Suite Failed:", err);
  process.exit(1);
});
