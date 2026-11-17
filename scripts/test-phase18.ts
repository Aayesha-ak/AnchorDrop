import assert from "assert";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Booking } from "../src/models/Booking";
import { Dock } from "../src/models/Dock";
import { BOOKING_STATUSES } from "../src/lib/constants";
import {
  canUnlockArrivalInstructions,
  getArrivalUnlockDecision,
  formatBookingWithArrivalPolicy,
} from "../src/services/arrival.service";
import { serializePublicDock } from "../src/lib/serializers";

async function runPhase18Tests() {
  console.log("⚓ Running Phase 18 Arrival Instructions Unlock Verification...");

  await connectDB();

  const boaterId = new mongoose.Types.ObjectId().toString();
  const otherBoaterId = new mongoose.Types.ObjectId().toString();
  const ownerId = new mongoose.Types.ObjectId().toString();
  const vesselId = new mongoose.Types.ObjectId().toString();

  // Test dock with sensitive arrival instructions
  const arrivalText =
    "Gate Code #9842. Slip 14 on Pier C. VHF Ch 68. Shore power 50A breaker on pedestal.";

  // Clean up any old test data
  await Dock.deleteMany({ title: "Phase 18 Test Slip" });

  const testDock = await Dock.create({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    title: "Phase 18 Test Slip",
    location: "Fort Lauderdale, FL",
    waterway: "New River",
    dockType: "Private Dock",
    photos: ["/images/test-dock.jpg"],
    maxLengthFt: 55,
    maxBeamFt: 18,
    minDepthFt: 8,
    pricePerDay: 140,
    amenities: ["Power 50A", "Fresh Water"],
    availabilityNotes: "Available",
    arrivalInstructions: arrivalText,
    isActive: true,
  });

  // Create real test booking documents in MongoDB
  const pendingBookingDoc = await Booking.create({
    boaterId: new mongoose.Types.ObjectId(boaterId),
    ownerId: new mongoose.Types.ObjectId(ownerId),
    dockId: testDock._id,
    vesselId: new mongoose.Types.ObjectId(vesselId),
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000 * 3),
    status: BOOKING_STATUSES.PENDING,
    specialRequests: "Requesting early check-in around 14:00.",
  });

  const acceptedBookingDoc = await Booking.create({
    boaterId: new mongoose.Types.ObjectId(boaterId),
    ownerId: new mongoose.Types.ObjectId(ownerId),
    dockId: testDock._id,
    vesselId: new mongoose.Types.ObjectId(vesselId),
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000 * 3),
    status: BOOKING_STATUSES.ACCEPTED,
    specialRequests: "Arriving by 16:00.",
  });

  const rejectedBookingDoc = await Booking.create({
    boaterId: new mongoose.Types.ObjectId(boaterId),
    ownerId: new mongoose.Types.ObjectId(ownerId),
    dockId: testDock._id,
    vesselId: new mongoose.Types.ObjectId(vesselId),
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000 * 3),
    status: BOOKING_STATUSES.REJECTED,
  });

  const completedBookingDoc = await Booking.create({
    boaterId: new mongoose.Types.ObjectId(boaterId),
    ownerId: new mongoose.Types.ObjectId(ownerId),
    dockId: testDock._id,
    vesselId: new mongoose.Types.ObjectId(vesselId),
    startDate: new Date(Date.now() - 86400000 * 5),
    endDate: new Date(Date.now() - 86400000 * 2),
    status: BOOKING_STATUSES.COMPLETED,
  });

  try {
    // -------------------------------------------------------------------------
    // 1. Sub-phase 18.1 & 18.2: Pending booking is LOCKED for boater
    // -------------------------------------------------------------------------
    const pendingUnlockedForBoater = canUnlockArrivalInstructions(
      pendingBookingDoc,
      boaterId
    );
    assert.strictEqual(
      pendingUnlockedForBoater,
      false,
      "Pending booking must return false for boater"
    );

    const pendingDecision = getArrivalUnlockDecision(
      pendingBookingDoc,
      testDock,
      boaterId
    );
    assert.strictEqual(
      pendingDecision.isUnlocked,
      false,
      "Pending decision must be locked"
    );
    assert.strictEqual(
      pendingDecision.instructions,
      null,
      "Pending decision instructions must be null"
    );
    console.log(
      "  ✓ Sub-phase 18.2: canUnlockArrivalInstructions(bookingWithPending, boaterId) returns false"
    );

    // -------------------------------------------------------------------------
    // 2. Sub-phase 18.1 & 18.3: Accepted booking is UNLOCKED for boater
    // -------------------------------------------------------------------------
    const acceptedUnlockedForBoater = canUnlockArrivalInstructions(
      acceptedBookingDoc,
      boaterId
    );
    assert.strictEqual(
      acceptedUnlockedForBoater,
      true,
      "Accepted booking must return true for assigned boater"
    );

    const acceptedDecision = getArrivalUnlockDecision(
      acceptedBookingDoc,
      testDock,
      boaterId
    );
    assert.strictEqual(
      acceptedDecision.isUnlocked,
      true,
      "Accepted decision must be unlocked"
    );
    assert.strictEqual(
      acceptedDecision.instructions,
      arrivalText,
      "Accepted decision must include arrival instructions"
    );
    console.log(
      "  ✓ Sub-phase 18.3: canUnlockArrivalInstructions(bookingWithAccepted, boaterId) returns true"
    );

    // -------------------------------------------------------------------------
    // 3. Sub-phase 18.6: Other boater CANNOT unlock someone else's booking
    // -------------------------------------------------------------------------
    const acceptedUnlockedForOtherBoater = canUnlockArrivalInstructions(
      acceptedBookingDoc,
      otherBoaterId
    );
    assert.strictEqual(
      acceptedUnlockedForOtherBoater,
      false,
      "User A cannot unlock User B's accepted booking"
    );

    const otherBoaterDecision = getArrivalUnlockDecision(
      acceptedBookingDoc,
      testDock,
      otherBoaterId
    );
    assert.strictEqual(
      otherBoaterDecision.isUnlocked,
      false,
      "Other boater decision must be locked"
    );
    assert.strictEqual(
      otherBoaterDecision.instructions,
      null,
      "Other boater instructions must be null"
    );
    console.log(
      "  ✓ Sub-phase 18.6: canUnlockArrivalInstructions(bookingWithAccepted, otherBoaterId) returns false"
    );

    // -------------------------------------------------------------------------
    // 4. Host/Owner can always view instructions on their dock/booking
    // -------------------------------------------------------------------------
    const acceptedUnlockedForOwner = canUnlockArrivalInstructions(
      acceptedBookingDoc,
      ownerId
    );
    assert.strictEqual(
      acceptedUnlockedForOwner,
      true,
      "Dock host must be allowed to unlock arrival instructions"
    );

    const ownerDecision = getArrivalUnlockDecision(
      acceptedBookingDoc,
      testDock,
      ownerId
    );
    assert.strictEqual(
      ownerDecision.isUnlocked,
      true,
      "Owner decision must be unlocked"
    );
    assert.strictEqual(
      ownerDecision.instructions,
      arrivalText,
      "Owner must see instructions"
    );
    console.log(
      "  ✓ Dock Host Authorization: canUnlockArrivalInstructions(bookingWithAccepted, ownerId) returns true"
    );

    // -------------------------------------------------------------------------
    // 5. Lifecycle states: Rejected is locked; Completed is unlocked
    // -------------------------------------------------------------------------
    const rejectedUnlocked = canUnlockArrivalInstructions(
      rejectedBookingDoc,
      boaterId
    );
    assert.strictEqual(
      rejectedUnlocked,
      false,
      "Rejected booking must return false"
    );

    const completedUnlocked = canUnlockArrivalInstructions(
      completedBookingDoc,
      boaterId
    );
    assert.strictEqual(
      completedUnlocked,
      true,
      "Completed booking must return true"
    );
    console.log(
      "  ✓ Lifecycle states: Rejected is locked; Completed is unlocked"
    );

    // -------------------------------------------------------------------------
    // 6. Sub-phase 18.5: Public dock serializers NEVER leak arrival instructions
    // -------------------------------------------------------------------------
    const serializedPublicDock = serializePublicDock(testDock);
    assert.strictEqual(
      (serializedPublicDock as unknown as Record<string, unknown>)
        .arrivalInstructions,
      undefined,
      "Public dock serialization must strip arrivalInstructions"
    );
    console.log(
      "  ✓ Sub-phase 18.5: Public dock endpoints/serializers strip arrival instructions"
    );

    // -------------------------------------------------------------------------
    // 7. Format booking with arrival policy security checks
    // -------------------------------------------------------------------------
    const formattedPending = formatBookingWithArrivalPolicy(
      pendingBookingDoc,
      testDock,
      boaterId
    );
    assert.strictEqual(
      formattedPending.arrivalInstructions,
      null,
      "Pending booking policy must set instructions to null"
    );

    const formattedAccepted = formatBookingWithArrivalPolicy(
      acceptedBookingDoc,
      testDock,
      boaterId
    );
    assert.strictEqual(
      formattedAccepted.arrivalInstructions,
      arrivalText,
      "Accepted booking policy must include instructions for boater"
    );

    const formattedStranger = formatBookingWithArrivalPolicy(
      acceptedBookingDoc,
      testDock,
      otherBoaterId
    );
    assert.strictEqual(
      formattedStranger.arrivalInstructions,
      null,
      "Stranger booking policy must set instructions to null"
    );
    console.log(
      "  ✓ Format booking policy: correctly exposes or strips instructions per user"
    );

    console.log(
      "🎉 All Phase 18 Arrival Instructions Unlock assertions PASSED!"
    );
  } finally {
    // Teardown test documents
    await Booking.deleteMany({ dockId: testDock._id });
    await Dock.findByIdAndDelete(testDock._id);
  }

  process.exit(0);
}

runPhase18Tests().catch((err) => {
  console.error("❌ Phase 18 Test failed:", err);
  process.exit(1);
});
