import assert from "assert";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Dock } from "../src/models/Dock";
import { Booking } from "../src/models/Booking";
import { Vessel } from "../src/models/Vessel";
import {
  createDock,
  getDockById,
  getOwnerBerths,
  updateDock,
  deleteDock,
  listDocks,
} from "../src/services/dock.service";
import { createDockSchema, updateDockSchema } from "../src/validations/dock.schema";
import { USER_ROLES, BOOKING_STATUSES } from "../src/lib/constants";
import { AppError } from "../src/lib/errors";

async function runPhase20Tests() {
  console.log("⚓ Running Phase 20 Owner Berths Frontend & Service Verification...");

  await connectDB();

  const timestamp = Date.now();
  const ownerEmail = `host.phase20.${timestamp}@anchordrop.test`;
  const otherOwnerEmail = `otherhost.phase20.${timestamp}@anchordrop.test`;
  const boaterEmail = `boater.phase20.${timestamp}@anchordrop.test`;

  // 1. Create test users
  const hostUser = await User.create({
    name: "Commodore Harrison",
    email: ownerEmail,
    passwordHash: "dummy-hash-phase20",
    role: USER_ROLES.DOCK_OWNER,
  });

  const otherHostUser = await User.create({
    name: "Marina Manager Dave",
    email: otherOwnerEmail,
    passwordHash: "dummy-hash-phase20",
    role: USER_ROLES.DOCK_OWNER,
  });

  const boaterUser = await User.create({
    name: "Captain Sarah",
    email: boaterEmail,
    passwordHash: "dummy-hash-phase20",
    role: USER_ROLES.BOATER,
  });

  const hostId = hostUser._id.toString();
  const otherHostId = otherHostUser._id.toString();
  const boaterId = boaterUser._id.toString();

  console.log("  ✓ Test users created (Host, Other Host, Boater)");

  try {
    // 2. Validate and create dock using createDockSchema matching BerthForm
    const rawDockInput = {
      title: "Harbor Point Deepwater Slip 14",
      location: "Fort Lauderdale, FL",
      waterway: "New River Cut",
      dockType: "Marina Berth",
      photos: ["/images/hero-marina.jpeg"],
      maxLengthFt: 65,
      maxBeamFt: 22,
      minDepthFt: 8.5,
      pricePerDay: 135,
      amenities: ["Power 50A", "Fresh Water", "Wi-Fi", "Pump-out", "Security Gate"],
      availabilityNotes: "24-hour advance reservation required. Check-in between 12:00 and 18:00.",
      arrivalInstructions: "Slip 14 on Pier C. Pedestrian gate code: #7821. VHF monitor Ch 68. Night lockbox code: 9912.",
      isActive: true,
    };

    const validatedInput = createDockSchema.parse(rawDockInput);
    const createdDock = await createDock(validatedInput, hostId);

    assert.ok(createdDock.id, "Dock ID should be present on created dock");
    assert.strictEqual(createdDock.title, "Harbor Point Deepwater Slip 14");
    assert.strictEqual(createdDock.maxLengthFt, 65);
    assert.strictEqual(createdDock.maxBeamFt, 22);
    assert.strictEqual(createdDock.minDepthFt, 8.5);
    assert.strictEqual(createdDock.pricePerDay, 135);
    assert.strictEqual(
      createdDock.arrivalInstructions,
      rawDockInput.arrivalInstructions,
      "Owner must receive private arrival instructions upon creation"
    );
    console.log("  ✓ Sub-phase 20.3: Dock creation with private arrival instructions verified");

    // 3. Verify privacy: public boater vs owner detail
    const publicDetail = await getDockById(createdDock.id, boaterId);
    assert.strictEqual(
      (publicDetail as unknown as Record<string, unknown>).arrivalInstructions,
      undefined,
      "Public boater MUST NOT see arrivalInstructions"
    );

    const ownerDetail = await getDockById(createdDock.id, hostId);
    assert.strictEqual(
      (ownerDetail as unknown as Record<string, unknown>).arrivalInstructions,
      rawDockInput.arrivalInstructions,
      "Owner detail MUST include arrivalInstructions"
    );
    console.log("  ✓ Sub-phase 20.6: Privacy boundary enforced for arrival instructions");

    // 4. Verify owner berth inventory fetch (?mine=true backing service: getOwnerBerths)
    const ownerBerths = await getOwnerBerths(hostId);
    assert.ok(ownerBerths.length >= 1, "Owner berths list must contain the newly created dock");
    const foundBerth = ownerBerths.find((b) => b.id === createdDock.id);
    assert.ok(foundBerth, "Owner berths list must include created dock");
    assert.strictEqual(foundBerth?.title, "Harbor Point Deepwater Slip 14");
    assert.strictEqual(
      foundBerth?.arrivalInstructions,
      rawDockInput.arrivalInstructions,
      "Owner berths listing must include arrivalInstructions"
    );
    assert.strictEqual(foundBerth?.isActive, true);
    console.log("  ✓ Sub-phase 20.2: Owner berth inventory (?mine=true) fetch verified");

    // 5. Update berth flow (Sub-phase 20.4)
    const updateInput = {
      pricePerDay: 150,
      minDepthFt: 9,
      arrivalInstructions: "Updated gate code: #8932. Hail on VHF 16 then shift to 68.",
      isActive: false, // test deactivation toggle
    };
    const validatedUpdate = updateDockSchema.parse(updateInput);

    // Non-owner should fail with 403 Forbidden
    try {
      await updateDock(createdDock.id, validatedUpdate, otherHostId);
      assert.fail("Non-owner should not be able to update dock");
    } catch (err: unknown) {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 403);
    }

    const updatedDock = await updateDock(createdDock.id, validatedUpdate, hostId);
    assert.strictEqual(updatedDock.pricePerDay, 150);
    assert.strictEqual(updatedDock.minDepthFt, 9);
    assert.strictEqual(updatedDock.isActive, false);
    assert.strictEqual(
      updatedDock.arrivalInstructions,
      "Updated gate code: #8932. Hail on VHF 16 then shift to 68."
    );
    console.log("  ✓ Sub-phase 20.4 & 20.5: Berth edit flow and status toggle verified");

    // Reactivate dock for booking test
    await updateDock(createdDock.id, { isActive: true }, hostId);

    // 6. Test delete protection with active reservation (Sub-phase 20.5)
    // Create test vessel for boater
    const testVessel = await Vessel.create({
      userId: boaterUser._id,
      name: "S/V Serenity",
      type: "Sailboat",
      lengthFt: 45,
      beamFt: 14,
      draftFt: 6,
      registration: "FL-PHASE20-TEST",
    });

    const activeBooking = await Booking.create({
      boaterId: boaterUser._id,
      ownerId: hostUser._id,
      dockId: new mongoose.Types.ObjectId(createdDock.id),
      vesselId: testVessel._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 2), // 2 days
      status: BOOKING_STATUSES.ACCEPTED,
    });

    // Attempt deletion while active reservation exists -> must return 409 Conflict
    try {
      await deleteDock(createdDock.id, hostId);
      assert.fail("Deleting a dock with an active booking must throw 409 conflict");
    } catch (err: unknown) {
      assert.ok(err instanceof AppError, "Error must be an AppError instance");
      assert.strictEqual(
        err.statusCode,
        409,
        `Expected HTTP 409 conflict, got ${err.statusCode}`
      );
      assert.match(
        err.message,
        /Cannot delete.*active.*reservation/i,
        "Error message should mention active reservations"
      );
    }
    console.log("  ✓ Sub-phase 20.5: Attempted deletion with active booking correctly returned 409 Conflict");

    // Non-owner delete attempt should throw 403
    try {
      await deleteDock(createdDock.id, otherHostId);
      assert.fail("Non-owner delete should throw 403 forbidden");
    } catch (err: unknown) {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 403);
    }

    // 7. Clean up active booking and verify deletion succeeds
    await Booking.findByIdAndDelete(activeBooking._id);
    await Vessel.findByIdAndDelete(testVessel._id);

    const deleteResult = await deleteDock(createdDock.id, hostId);
    assert.strictEqual(deleteResult.success, true);

    const verifyGone = await Dock.findById(createdDock.id);
    assert.strictEqual(verifyGone, null, "Deleted dock must no longer exist in database");
    console.log("  ✓ Sub-phase 20.5: Clean deletion verified after active booking removed");

    console.log("🎉 All Phase 20 Owner Berths Verification tests PASSED!");
  } finally {
    // Cleanup test users and documents
    await Dock.deleteMany({ ownerId: hostUser._id });
    await Booking.deleteMany({ ownerId: hostUser._id });
    await Vessel.deleteMany({ userId: boaterUser._id });
    await User.deleteMany({
      _id: { $in: [hostUser._id, otherHostUser._id, boaterUser._id] },
    });
  }

  process.exit(0);
}

runPhase20Tests().catch((err) => {
  console.error("Phase 20 test failed with error:", err);
  process.exit(1);
});
