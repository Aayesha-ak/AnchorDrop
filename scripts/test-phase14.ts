import assert from "assert";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Vessel } from "../src/models/Vessel";
import { Booking } from "../src/models/Booking";
import { BOOKING_STATUSES } from "../src/lib/constants";
import {
  createVessel,
  getVesselsByUserId,
  getVesselById,
  updateVessel,
  deleteVessel,
  ForbiddenError,
  ConflictError,
  NotFoundError,
} from "../src/services/vessel.service";

async function runPhase14Tests() {
  console.log("⚓ Running Phase 14 Vessel Backend & Service Verification...");

  await connectDB();

  const boaterId = new mongoose.Types.ObjectId().toString();
  const otherBoaterId = new mongoose.Types.ObjectId().toString();
  const ownerId = new mongoose.Types.ObjectId().toString();
  const dockId = new mongoose.Types.ObjectId().toString();

  // Clean up any test vessels with test registration
  await Vessel.deleteMany({ registration: { $in: ["TEST-REG-001", "TEST-REG-002"] } });

  // 1. Sub-phase 14.1 / 14.2: Create Vessel
  const vesselData = {
    name: "Anchor Runner 38",
    type: "Cruiser",
    lengthFt: 38,
    beamFt: 12.5,
    draftFt: 3.5,
    registration: "TEST-REG-001",
  };

  const createdVessel = await createVessel(vesselData, boaterId);
  assert.ok(createdVessel._id, "Vessel ID must be assigned");
  assert.strictEqual(createdVessel.name, "Anchor Runner 38");
  assert.strictEqual(createdVessel.type, "Cruiser");
  assert.strictEqual(createdVessel.lengthFt, 38);
  assert.strictEqual(createdVessel.beamFt, 12.5);
  assert.strictEqual(createdVessel.draftFt, 3.5);
  assert.strictEqual(createdVessel.registration, "TEST-REG-001");
  assert.strictEqual(createdVessel.userId.toString(), boaterId);
  console.log("  ✓ Sub-phase 14.1 & 14.2: Vessel creation verified");

  // 2. Sub-phase 14.1: List Vessels by User ID
  const boaterVessels = await getVesselsByUserId(boaterId);
  assert.ok(boaterVessels.length >= 1, "Must return at least 1 vessel for boater");
  const found = boaterVessels.find((v) => v._id.toString() === createdVessel._id.toString());
  assert.ok(found, "Created vessel must appear in boater's fleet");

  const otherBoaterVessels = await getVesselsByUserId(otherBoaterId);
  assert.strictEqual(
    otherBoaterVessels.filter((v) => v._id.toString() === createdVessel._id.toString()).length,
    0,
    "Other boater must not see this vessel in their fleet"
  );
  console.log("  ✓ Sub-phase 14.1: getVesselsByUserId verified");

  // 3. Sub-phase 14.1 / 14.3: Get Vessel by ID & Ownership check
  const fetchedVessel = await getVesselById(createdVessel._id.toString(), boaterId);
  assert.strictEqual(fetchedVessel.name, "Anchor Runner 38");

  // Non-owner should receive ForbiddenError
  try {
    await getVesselById(createdVessel._id.toString(), otherBoaterId);
    assert.fail("Non-owner getVesselById should throw ForbiddenError");
  } catch (err: unknown) {
    assert.ok(
      err instanceof ForbiddenError || (err as { statusCode?: number }).statusCode === 403,
      "Expected 403 / ForbiddenError for non-owner access"
    );
  }
  console.log("  ✓ Sub-phase 14.1 & 14.3: getVesselById and ownership rejection verified");

  // 4. Sub-phase 14.3: Update Vessel & Ownership check
  // Non-owner update attempt
  try {
    await updateVessel(createdVessel._id.toString(), { name: "Hijacked Boat" }, otherBoaterId);
    assert.fail("Non-owner updateVessel should throw ForbiddenError");
  } catch (err: unknown) {
    assert.ok(
      err instanceof ForbiddenError || (err as { statusCode?: number }).statusCode === 403,
      "Expected 403 / ForbiddenError for non-owner update"
    );
  }

  // Owner update
  const updatedVessel = await updateVessel(
    createdVessel._id.toString(),
    { name: "Anchor Runner 40 Super", lengthFt: 40.5, draftFt: 3.8 },
    boaterId
  );
  assert.strictEqual(updatedVessel.name, "Anchor Runner 40 Super");
  assert.strictEqual(updatedVessel.lengthFt, 40.5);
  assert.strictEqual(updatedVessel.draftFt, 3.8);
  assert.strictEqual(updatedVessel.beamFt, 12.5, "Unmodified fields should retain previous value");
  console.log("  ✓ Sub-phase 14.3: updateVessel with ownership enforcement verified");

  // 5. Sub-phase 14.3: Delete Vessel & Ownership check
  try {
    await deleteVessel(createdVessel._id.toString(), otherBoaterId);
    assert.fail("Non-owner deleteVessel should throw ForbiddenError");
  } catch (err: unknown) {
    assert.ok(
      err instanceof ForbiddenError || (err as { statusCode?: number }).statusCode === 403,
      "Expected 403 / ForbiddenError for non-owner delete"
    );
  }
  console.log("  ✓ Sub-phase 14.3: deleteVessel ownership rejection verified");

  // 6. Sub-phase 14.3: Active / Pending Booking Block Policy
  const mockBooking = await Booking.create({
    boaterId: new mongoose.Types.ObjectId(boaterId),
    ownerId: new mongoose.Types.ObjectId(ownerId),
    dockId: new mongoose.Types.ObjectId(dockId),
    vesselId: createdVessel._id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    status: BOOKING_STATUSES.PENDING,
  });

  try {
    await deleteVessel(createdVessel._id.toString(), boaterId);
    assert.fail("deleteVessel with pending booking should throw ConflictError");
  } catch (err: unknown) {
    assert.ok(
      err instanceof ConflictError || (err as { statusCode?: number }).statusCode === 409,
      "Expected 409 / ConflictError when vessel has pending booking"
    );
    assert.match(
      (err as Error).message,
      /Cannot delete vessel with active or pending bookings/,
      "Error message must specify active or pending booking conflict"
    );
  }

  // Check with ACCEPTED status
  mockBooking.status = BOOKING_STATUSES.ACCEPTED;
  await mockBooking.save();

  try {
    await deleteVessel(createdVessel._id.toString(), boaterId);
    assert.fail("deleteVessel with accepted booking should throw ConflictError");
  } catch (err: unknown) {
    assert.ok(
      err instanceof ConflictError || (err as { statusCode?: number }).statusCode === 409,
      "Expected 409 / ConflictError when vessel has accepted booking"
    );
  }
  console.log("  ✓ Sub-phase 14.3: Active/pending booking block on delete verified");

  // Clean up booking
  await Booking.findByIdAndDelete(mockBooking._id);

  // 7. Sub-phase 14.3: Successful Delete
  const deleteResult = await deleteVessel(createdVessel._id.toString(), boaterId);
  assert.strictEqual(deleteResult.success, true);
  assert.strictEqual(deleteResult.message, "Vessel removed");

  const checkDeleted = await Vessel.findById(createdVessel._id);
  assert.strictEqual(checkDeleted, null, "Vessel must be removed from DB");
  console.log("  ✓ Sub-phase 14.3: Vessel deletion verified");

  // 8. NotFound checks
  const ghostId = new mongoose.Types.ObjectId().toString();
  try {
    await getVesselById(ghostId, boaterId);
    assert.fail("getVesselById on non-existent vessel should throw NotFoundError");
  } catch (err: unknown) {
    assert.ok(
      err instanceof NotFoundError || (err as { statusCode?: number }).statusCode === 404,
      "Expected 404 / NotFoundError for non-existent vessel"
    );
  }
  console.log("  ✓ NotFoundError on missing vessel verified");

  console.log("🎉 All Phase 14 Vessel Backend & Service verification assertions PASSED!");
  process.exit(0);
}

runPhase14Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
