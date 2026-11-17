import assert from "assert";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Dock } from "../src/models/Dock";
import { Vessel } from "../src/models/Vessel";
import { Booking } from "../src/models/Booking";
import { createBooking } from "../src/services/booking.service";
import { USER_ROLES, BOOKING_STATUSES } from "../src/lib/constants";

async function runPhase16Tests() {
  console.log("⚓ Running Phase 16 Booking Create Loop Verification...");

  await connectDB();

  // Test emails
  const boaterEmail = `phase16.boater.${Date.now()}@anchordrop.test`;
  const ownerEmail = `phase16.owner.${Date.now()}@anchordrop.test`;

  // 1. Setup test users
  const boater = await User.create({
    name: "Captain Test Boater",
    email: boaterEmail,
    passwordHash: "dummy-hash-test",
    role: USER_ROLES.BOATER,
  });

  const owner = await User.create({
    name: "Host Marina Owner",
    email: ownerEmail,
    passwordHash: "dummy-hash-test",
    role: USER_ROLES.DOCK_OWNER,
  });

  // 2. Setup test dock
  const dock = await Dock.create({
    ownerId: owner._id,
    title: "Phase 16 Verification Deepwater Slip",
    location: "Fort Lauderdale, FL",
    waterway: "New River",
    dockType: "Marina Slip",
    photos: ["/images/test-dock.jpg"],
    maxLengthFt: 50,
    maxBeamFt: 16,
    minDepthFt: 8,
    pricePerDay: 120,
    amenities: ["Power 50A", "Fresh Water"],
    availabilityNotes: "Available for transient boaters",
    arrivalInstructions: "Gate code *4492#. VHF Ch 68.",
    isActive: true,
  });

  // 3. Setup test vessels
  // Fitting vessel: 42' LOA, 13' beam, 5.5' draft <= (50', 16', 8')
  const fittingVessel = await Vessel.create({
    userId: boater._id,
    name: "S/V Odyssey",
    type: "Cruiser",
    lengthFt: 42,
    beamFt: 13,
    draftFt: 5.5,
    registration: "FL-TEST-FIT-42",
  });

  // Oversized LOA: 58' > 50'
  const oversizeLengthVessel = await Vessel.create({
    userId: boater._id,
    name: "M/Y Titan Length Exceeded",
    type: "Motor Yacht",
    lengthFt: 58,
    beamFt: 15,
    draftFt: 6,
    registration: "FL-TEST-OVER-LEN",
  });

  // Oversized Beam: 19' > 16'
  const oversizeBeamVessel = await Vessel.create({
    userId: boater._id,
    name: "Wide Catamaran Exceeded",
    type: "Catamaran",
    lengthFt: 44,
    beamFt: 19,
    draftFt: 4,
    registration: "FL-TEST-OVER-BEAM",
  });

  // Oversized Draft: 9.5' > 8'
  const deepDraftVessel = await Vessel.create({
    userId: boater._id,
    name: "Deep Draft Keel Exceeded",
    type: "Keelboat",
    lengthFt: 40,
    beamFt: 12,
    draftFt: 9.5,
    registration: "FL-TEST-OVER-DRAFT",
  });

  try {
    // -------------------------------------------------------------------------
    // Test 1: Successful booking creation (Sub-phases 16.1 & 16.4)
    // -------------------------------------------------------------------------
    const startDate = new Date(Date.now() + 86400000); // tomorrow
    const endDate = new Date(Date.now() + 86400000 * 4); // +4 days

    const createdBooking = await createBooking(
      {
        dockId: dock._id.toString(),
        vesselId: fittingVessel._id.toString(),
        startDate,
        endDate,
        specialRequests: "Requesting 50A shore power cord assistance upon arrival",
      },
      boater._id.toString()
    );

    assert.ok(createdBooking._id, "Booking must have an _id");
    assert.strictEqual(
      createdBooking.status,
      BOOKING_STATUSES.PENDING,
      "New booking status must be 'pending'"
    );
    assert.strictEqual(
      createdBooking.boaterId.toString(),
      boater._id.toString(),
      "Boater ID must match requestor"
    );
    assert.strictEqual(
      createdBooking.ownerId.toString(),
      owner._id.toString(),
      "Owner ID must match dock owner"
    );
    assert.strictEqual(
      createdBooking.specialRequests,
      "Requesting 50A shore power cord assistance upon arrival",
      "Special requests must be persisted"
    );
    assert.ok(createdBooking.dockId, "Dock reference must be present/populated");
    assert.ok(createdBooking.vesselId, "Vessel reference must be present/populated");
    console.log(
      "  ✓ Sub-phase 16.1 & 16.4: Booking created with status 'pending' and special requests persisted"
    );

    // -------------------------------------------------------------------------
    // Test 2: Dimensional check rejections (Sub-phases 16.2 & 16.8)
    // -------------------------------------------------------------------------
    // 2a. Length rejection
    try {
      await createBooking(
        {
          dockId: dock._id.toString(),
          vesselId: oversizeLengthVessel._id.toString(),
          startDate,
          endDate,
        },
        boater._id.toString()
      );
      assert.fail("Should reject vessel exceeding dock maxLengthFt");
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message;
      assert.strictEqual(
        msg,
        "Vessel dimensions exceed dock parameters",
        "Must throw exact dimensional error"
      );
    }

    // 2b. Beam rejection
    try {
      await createBooking(
        {
          dockId: dock._id.toString(),
          vesselId: oversizeBeamVessel._id.toString(),
          startDate,
          endDate,
        },
        boater._id.toString()
      );
      assert.fail("Should reject vessel exceeding dock maxBeamFt");
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message;
      assert.strictEqual(
        msg,
        "Vessel dimensions exceed dock parameters",
        "Must throw exact dimensional error"
      );
    }

    // 2c. Draft rejection
    try {
      await createBooking(
        {
          dockId: dock._id.toString(),
          vesselId: deepDraftVessel._id.toString(),
          startDate,
          endDate,
        },
        boater._id.toString()
      );
      assert.fail("Should reject vessel exceeding dock minDepthFt");
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message;
      assert.strictEqual(
        msg,
        "Vessel dimensions exceed dock parameters",
        "Must throw exact dimensional error"
      );
    }
    console.log(
      "  ✓ Sub-phase 16.2 & 16.8: Incompatible vessel creations rejected (length, beam, draft limits enforced)"
    );

    // -------------------------------------------------------------------------
    // Test 3: Non-boater rejection
    // -------------------------------------------------------------------------
    try {
      await createBooking(
        {
          dockId: dock._id.toString(),
          vesselId: fittingVessel._id.toString(),
          startDate,
          endDate,
        },
        owner._id.toString() // owner user role is "dock_owner", not "boater"
      );
      assert.fail("Should reject non-boater attempt to create booking");
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      assert.strictEqual(statusCode, 403, "Non-boater request must yield 403 Forbidden");
    }
    console.log("  ✓ Role Guard: Non-boaters rejected from booking berths");

    // -------------------------------------------------------------------------
    // Test 4: Self-booking prevention
    // -------------------------------------------------------------------------
    // Even if host tries to book their own dock
    const hostDock = await Dock.create({
      ownerId: boater._id, // dock owned by the boater
      title: "Boater's Own Berth",
      location: "Miami, FL",
      waterway: "Biscayne Bay",
      dockType: "Slip",
      photos: [],
      maxLengthFt: 60,
      maxBeamFt: 20,
      minDepthFt: 10,
      pricePerDay: 50,
      isActive: true,
    });

    try {
      await createBooking(
        {
          dockId: hostDock._id.toString(),
          vesselId: fittingVessel._id.toString(),
          startDate,
          endDate,
        },
        boater._id.toString()
      );
      assert.fail("Host should not be able to book own dock");
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message;
      assert.strictEqual(
        msg,
        "Hosts cannot book their own berths",
        "Must reject self-booking with specific message"
      );
    } finally {
      await Dock.findByIdAndDelete(hostDock._id);
    }
    console.log("  ✓ Policy Guard: Hosts prevented from self-booking berths");

    // -------------------------------------------------------------------------
    // Test 5: Date range validation (endDate < startDate)
    // -------------------------------------------------------------------------
    try {
      await createBooking(
        {
          dockId: dock._id.toString(),
          vesselId: fittingVessel._id.toString(),
          startDate: new Date("2026-12-10"),
          endDate: new Date("2026-12-05"), // before start date
        },
        boater._id.toString()
      );
      assert.fail("Should reject endDate < startDate");
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message;
      assert.strictEqual(
        msg,
        "End date must be greater than or equal to start date"
      );
    }
    console.log("  ✓ Validation Guard: Invalid date ranges rejected");

    // -------------------------------------------------------------------------
    // Test 6: Vessel ownership verification
    // -------------------------------------------------------------------------
    const strangerVessel = await Vessel.create({
      userId: owner._id, // owned by owner, not boater
      name: "Stranger Vessel",
      type: "Trawler",
      lengthFt: 35,
      beamFt: 12,
      draftFt: 4,
      registration: "FL-STRANGER-1",
    });

    try {
      await createBooking(
        {
          dockId: dock._id.toString(),
          vesselId: strangerVessel._id.toString(),
          startDate,
          endDate,
        },
        boater._id.toString()
      );
      assert.fail("Boater should not be allowed to book with another user's vessel");
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      assert.strictEqual(statusCode, 403);
    } finally {
      await Vessel.findByIdAndDelete(strangerVessel._id);
    }
    console.log("  ✓ Ownership Guard: Unowned vessel requests rejected with 403");

    console.log("🎉 All Phase 16 Booking Create Loop verification assertions PASSED!");
  } finally {
    // Cleanup created test records
    await Booking.deleteMany({ boaterId: boater._id });
    await Vessel.deleteMany({ userId: boater._id });
    await Dock.findByIdAndDelete(dock._id);
    await User.findByIdAndDelete(boater._id);
    await User.findByIdAndDelete(owner._id);
  }

  process.exit(0);
}

runPhase16Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
