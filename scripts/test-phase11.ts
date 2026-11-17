import assert from "assert";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Dock } from "../src/models/Dock";
import { Booking } from "../src/models/Booking";
import { BOOKING_STATUSES } from "../src/lib/constants";
import {
  createDock,
  getDockById,
  listDocks,
  updateDock,
  deleteDock,
} from "../src/services/dock.service";

async function runPhase11Tests() {
  console.log("⚓ Running Phase 11 Dock Backend (Supply) Verification...");

  await connectDB();

  const ownerId = new mongoose.Types.ObjectId().toString();
  const otherOwnerId = new mongoose.Types.ObjectId().toString();
  const boaterId = new mongoose.Types.ObjectId().toString();

  // Clean up any test docks
  await Dock.deleteMany({ location: "Test Harbor Marina, FL" });

  // 1. Sub-phase 11.4: Owner create dock
  const newDockInput = {
    title: "Deepwater Slip 12",
    location: "Test Harbor Marina, FL",
    waterway: "Intracoastal Waterway",
    dockType: "Marina Berth",
    photos: ["/images/test-slip.jpg"],
    maxLengthFt: 55,
    maxBeamFt: 16,
    minDepthFt: 7,
    pricePerDay: 95,
    amenities: ["Power 30A", "Water", "WiFi"],
    availabilityNotes: "Available all month",
    arrivalInstructions: "Slip #12. Gate code: *9921#. VHF Channel 16/68.",
    isActive: true,
  };

  const createdDock = await createDock(newDockInput, ownerId);
  assert.ok(createdDock.id, "Dock ID must be assigned");
  assert.strictEqual(createdDock.title, "Deepwater Slip 12");
  assert.strictEqual(createdDock.arrivalInstructions, newDockInput.arrivalInstructions, "Owner must see arrival instructions upon creation");
  console.log("  ✓ Sub-phase 11.4: Owner dock creation verified");

  // 2. Sub-phase 11.3 & 11.7: Public vs Owner Detail
  const publicDetail = await getDockById(createdDock.id, boaterId);
  assert.strictEqual((publicDetail as unknown as Record<string, unknown>).arrivalInstructions, undefined, "Public detail must strip arrival instructions");
  assert.strictEqual(publicDetail.maxLengthFt, 55);

  const ownerDetail = await getDockById(createdDock.id, ownerId);
  assert.strictEqual((ownerDetail as unknown as Record<string, unknown>).arrivalInstructions, newDockInput.arrivalInstructions, "Owner detail must include arrival instructions");
  console.log("  ✓ Sub-phase 11.3 & 11.7: Public strip & owner access verified");

  // 3. Sub-phase 11.2: Public list & multi-parameter filtering
  const allDocks = await listDocks({ location: "Test Harbor" });
  assert.ok(allDocks.length >= 1, "Must find at least the created test dock");
  assert.strictEqual((allDocks[0] as unknown as Record<string, unknown>).arrivalInstructions, undefined, "List must strip arrival instructions");

  // Filter: Length constraint (dock maxLength >= 50ft passes; >= 60ft fails)
  const lengthMatch = await listDocks({ location: "Test Harbor", maxLength: 50 });
  assert.ok(lengthMatch.length >= 1, "50ft vessel should fit 55ft dock");

  const lengthTooBig = await listDocks({ location: "Test Harbor", maxLength: 65 });
  assert.strictEqual(lengthTooBig.length, 0, "65ft vessel should not fit 55ft dock");

  // Filter: Depth constraint (dock minDepth >= 6ft passes; >= 10ft fails)
  const depthMatch = await listDocks({ location: "Test Harbor", minDepth: 6 });
  assert.ok(depthMatch.length >= 1, "6ft draft should clear 7ft depth");

  const depthTooShallow = await listDocks({ location: "Test Harbor", minDepth: 10 });
  assert.strictEqual(depthTooShallow.length, 0, "10ft draft should not clear 7ft depth");

  // Filter: Price constraint
  const priceUnder = await listDocks({ location: "Test Harbor", maxPrice: 100 });
  assert.ok(priceUnder.length >= 1, "$95 dock should be under $100");

  const priceOver = await listDocks({ location: "Test Harbor", maxPrice: 50 });
  assert.strictEqual(priceOver.length, 0, "$95 dock should exceed $50 limit");
  console.log("  ✓ Sub-phase 11.2: Public filter parameters (location, length, depth, price) verified");

  // 4. Sub-phase 11.5: Owner update
  // Check ownership enforcement
  try {
    await updateDock(createdDock.id, { pricePerDay: 120 }, otherOwnerId);
    assert.fail("Non-owner update should throw 403");
  } catch (err: unknown) {
    assert.strictEqual((err as { statusCode?: number }).statusCode, 403);
  }

  const updatedDock = await updateDock(createdDock.id, { pricePerDay: 110, arrivalInstructions: "Updated gate code 1234" }, ownerId);
  assert.strictEqual(updatedDock.pricePerDay, 110);
  assert.strictEqual(updatedDock.arrivalInstructions, "Updated gate code 1234");
  console.log("  ✓ Sub-phase 11.5: Owner update & ownership check verified");

  // 5. Sub-phase 11.6: Owner delete & active reservation protection
  // Test active booking block policy
  const mockBooking = await Booking.create({
    boaterId: new mongoose.Types.ObjectId(boaterId),
    ownerId: new mongoose.Types.ObjectId(ownerId),
    dockId: new mongoose.Types.ObjectId(createdDock.id),
    vesselId: new mongoose.Types.ObjectId(),
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    status: BOOKING_STATUSES.ACCEPTED,
  });

  try {
    await deleteDock(createdDock.id, ownerId);
    assert.fail("Deleting dock with active reservation should throw 409");
  } catch (err: unknown) {
    assert.strictEqual((err as { statusCode?: number }).statusCode, 409);
  }

  // Remove the active booking and try delete again
  await Booking.findByIdAndDelete(mockBooking._id);
  const deleteResult = await deleteDock(createdDock.id, ownerId);
  assert.strictEqual(deleteResult.success, true);

  const checkDeleted = await Dock.findById(createdDock.id);
  assert.strictEqual(checkDeleted, null, "Dock should be removed from database");
  console.log("  ✓ Sub-phase 11.6: Owner delete & reservation protection verified");

  console.log("🎉 All Phase 11 Dock Backend verification assertions PASSED!");
  process.exit(0);
}

runPhase11Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
