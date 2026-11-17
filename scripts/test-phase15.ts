import assert from "assert";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { connectDB } from "../src/lib/db";
import { Vessel } from "../src/models/Vessel";
import { Dock } from "../src/models/Dock";
import {
  checkCompatibility,
  checkVesselDockCompatibility,
  NotFoundError,
  COMPATIBILITY_DISCLAIMER,
} from "../src/services/compatibility.service";
import { POST } from "../src/app/api/bookings/check-compatibility/route";

async function runPhase15Tests() {
  console.log("⚓ Running Phase 15 Compatibility Engine Verification...\n");

  // =========================================================================
  // Test Suite 1: Pure Calculation Engine (Sub-phases 15.1 - 15.3, 15.8)
  // =========================================================================
  console.log("📦 Suite 1: Pure Compatibility Calculation Engine");

  // Standard Dock: 50 LOA, 15 Beam, 6 Min Depth
  const standardDock = {
    maxLengthFt: 50,
    maxBeamFt: 15,
    minDepthFt: 6,
  };

  // 1.1 Known Pass Case: 42 LOA, 13 Beam, 4 Draft vs 50/15/6
  const passVessel = {
    lengthFt: 42,
    beamFt: 13,
    draftFt: 4,
  };
  const passResult = checkCompatibility({
    vessel: passVessel,
    dock: standardDock,
  });

  assert.strictEqual(
    passResult.compatible,
    true,
    "Pass Case: Vessel (42/13/4) must be compatible with Dock (50/15/6)"
  );
  assert.strictEqual(passResult.constraints.length.passes, true);
  assert.strictEqual(passResult.constraints.length.vesselValue, 42);
  assert.strictEqual(passResult.constraints.length.dockLimit, 50);
  assert.strictEqual(passResult.constraints.length.diff, 8); // 50 - 42 = +8 clearance

  assert.strictEqual(passResult.constraints.beam.passes, true);
  assert.strictEqual(passResult.constraints.beam.vesselValue, 13);
  assert.strictEqual(passResult.constraints.beam.dockLimit, 15);
  assert.strictEqual(passResult.constraints.beam.diff, 2); // 15 - 13 = +2 clearance

  assert.strictEqual(passResult.constraints.draft.passes, true);
  assert.strictEqual(passResult.constraints.draft.vesselValue, 4);
  assert.strictEqual(passResult.constraints.draft.dockLimit, 6);
  assert.strictEqual(passResult.constraints.draft.diff, 2); // 6 - 4 = +2 clearance

  assert.strictEqual(
    passResult.disclaimer,
    COMPATIBILITY_DISCLAIMER,
    "Disclaimer copy must match safety standard"
  );
  console.log("  ✓ Sub-phase 15.8: Known Pass Case (42/13/4 vs 50/15/6) -> Compatible (Clearance: +8ft / +2ft / +2ft)");

  // 1.2 Known Fail Case 1: LOA too long (55 LOA, 13 Beam, 4 Draft)
  const failLoaVessel = {
    lengthFt: 55,
    beamFt: 13,
    draftFt: 4,
  };
  const failLoaResult = checkCompatibility({
    vessel: failLoaVessel,
    dock: standardDock,
  });

  assert.strictEqual(
    failLoaResult.compatible,
    false,
    "Fail Case 1: Vessel LOA 55 must fail Dock max length 50"
  );
  assert.strictEqual(failLoaResult.constraints.length.passes, false);
  assert.strictEqual(failLoaResult.constraints.length.diff, -5); // 50 - 55 = -5 overflow
  assert.strictEqual(failLoaResult.constraints.beam.passes, true);
  assert.strictEqual(failLoaResult.constraints.draft.passes, true);
  console.log("  ✓ Sub-phase 15.8: Fail Case 1 (LOA 55ft > 50ft) -> Incompatible (Diff: -5ft)");

  // 1.3 Known Fail Case 2: Beam too wide (42 LOA, 16 Beam, 4 Draft)
  const failBeamVessel = {
    lengthFt: 42,
    beamFt: 16,
    draftFt: 4,
  };
  const failBeamResult = checkCompatibility({
    vessel: failBeamVessel,
    dock: standardDock,
  });

  assert.strictEqual(
    failBeamResult.compatible,
    false,
    "Fail Case 2: Vessel Beam 16 must fail Dock max beam 15"
  );
  assert.strictEqual(failBeamResult.constraints.length.passes, true);
  assert.strictEqual(failBeamResult.constraints.beam.passes, false);
  assert.strictEqual(failBeamResult.constraints.beam.diff, -1); // 15 - 16 = -1 overflow
  assert.strictEqual(failBeamResult.constraints.draft.passes, true);
  console.log("  ✓ Sub-phase 15.8: Fail Case 2 (Beam 16ft > 15ft) -> Incompatible (Diff: -1ft)");

  // 1.4 Known Fail Case 3: Draft too deep (42 LOA, 13 Beam, 7 Draft)
  const failDraftVessel = {
    lengthFt: 42,
    beamFt: 13,
    draftFt: 7,
  };
  const failDraftResult = checkCompatibility({
    vessel: failDraftVessel,
    dock: standardDock,
  });

  assert.strictEqual(
    failDraftResult.compatible,
    false,
    "Fail Case 3: Vessel Draft 7 must fail Dock min depth 6"
  );
  assert.strictEqual(failDraftResult.constraints.length.passes, true);
  assert.strictEqual(failDraftResult.constraints.beam.passes, true);
  assert.strictEqual(failDraftResult.constraints.draft.passes, false);
  assert.strictEqual(failDraftResult.constraints.draft.diff, -1); // 6 - 7 = -1 overflow
  console.log("  ✓ Sub-phase 15.8: Fail Case 3 (Draft 7ft > 6ft depth) -> Incompatible (Diff: -1ft)");

  // 1.5 Edge Boundary Case: Exact equal dimensions (50 LOA, 15 Beam, 6 Draft)
  const exactBoundaryVessel = {
    lengthFt: 50,
    beamFt: 15,
    draftFt: 6,
  };
  const boundaryResult = checkCompatibility({
    vessel: exactBoundaryVessel,
    dock: standardDock,
  });
  assert.strictEqual(boundaryResult.compatible, true, "Boundary: Equal dimensions must pass (<=)");
  assert.strictEqual(boundaryResult.constraints.length.diff, 0);
  assert.strictEqual(boundaryResult.constraints.beam.diff, 0);
  assert.strictEqual(boundaryResult.constraints.draft.diff, 0);
  console.log("  ✓ Boundary Case: Exact equality (50/15/6 vs 50/15/6) -> Compatible (Diff: 0ft)");

  // =========================================================================
  // Test Suite 2: Database Helper Service (checkVesselDockCompatibility)
  // =========================================================================
  console.log("\n📦 Suite 2: Database Helper Service (checkVesselDockCompatibility)");

  await connectDB();

  const testOwnerId = new mongoose.Types.ObjectId();
  const testBoaterId = new mongoose.Types.ObjectId();

  // Create temporary test records
  const dbVessel = await Vessel.create({
    userId: testBoaterId,
    name: "Phase15 Sea Ray 420",
    type: "Express Cruiser",
    lengthFt: 42,
    beamFt: 13,
    draftFt: 4,
    registration: "FL-PHASE15-PASS",
  });

  const dbDock = await Dock.create({
    ownerId: testOwnerId,
    title: "Phase15 Deepwater Slip",
    location: "Sarasota, FL",
    waterway: "Sarasota Bay",
    dockType: "Marina Berth",
    photos: ["/images/test.jpg"],
    maxLengthFt: 50,
    maxBeamFt: 15,
    minDepthFt: 6,
    pricePerDay: 120,
    amenities: ["Power 50A", "Water"],
    availabilityNotes: "Available for testing",
    arrivalInstructions: "Private instructions",
    isActive: true,
  });

  try {
    // 2.1 DB Record Match
    const dbCompatResult = await checkVesselDockCompatibility(
      dbVessel._id.toString(),
      dbDock._id.toString()
    );

    assert.strictEqual(dbCompatResult.compatible, true);
    assert.strictEqual(dbCompatResult.constraints.length.passes, true);
    assert.strictEqual(dbCompatResult.constraints.length.diff, 8);
    assert.strictEqual(dbCompatResult.constraints.beam.passes, true);
    assert.strictEqual(dbCompatResult.constraints.draft.passes, true);
    console.log("  ✓ Sub-phase 15.1: checkVesselDockCompatibility with valid MongoDB records passed");

    // 2.2 Missing Vessel -> NotFoundError
    const nonExistentVesselId = new mongoose.Types.ObjectId().toString();
    try {
      await checkVesselDockCompatibility(nonExistentVesselId, dbDock._id.toString());
      assert.fail("Should throw NotFoundError when vessel not found");
    } catch (err) {
      assert.ok(err instanceof NotFoundError, "Must throw NotFoundError for missing vessel");
      assert.strictEqual((err as NotFoundError).statusCode, 404);
    }
    console.log("  ✓ Sub-phase 15.1: Missing vessel throws NotFoundError (404)");

    // 2.3 Missing Dock -> NotFoundError
    const nonExistentDockId = new mongoose.Types.ObjectId().toString();
    try {
      await checkVesselDockCompatibility(dbVessel._id.toString(), nonExistentDockId);
      assert.fail("Should throw NotFoundError when dock not found");
    } catch (err) {
      assert.ok(err instanceof NotFoundError, "Must throw NotFoundError for missing dock");
      assert.strictEqual((err as NotFoundError).statusCode, 404);
    }
    console.log("  ✓ Sub-phase 15.1: Missing dock throws NotFoundError (404)");

    // =========================================================================
    // Test Suite 3: API Endpoint (POST /api/bookings/check-compatibility)
    // =========================================================================
    console.log("\n📦 Suite 3: API Route Handler (POST /api/bookings/check-compatibility)");

    // 3.1 Direct Dimensions API Check
    const dimReq = new NextRequest("http://localhost:3000/api/bookings/check-compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vessel: { lengthFt: 42, beamFt: 13, draftFt: 4 },
        dock: { maxLengthFt: 50, maxBeamFt: 15, minDepthFt: 6 },
      }),
    });

    const dimRes = await POST(dimReq);
    assert.strictEqual(dimRes.status, 200, "API dimensions request must return 200");
    const dimJson = await dimRes.json();
    assert.strictEqual(dimJson.status, "ok");
    assert.strictEqual(dimJson.result.compatible, true);
    assert.strictEqual(dimJson.result.constraints.length.diff, 8);
    console.log("  ✓ Sub-phase 15.4: POST /api/bookings/check-compatibility with direct dimensions returned 200 { status: 'ok', result }");

    // 3.2 ID-based API Check
    const idReq = new NextRequest("http://localhost:3000/api/bookings/check-compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vesselId: dbVessel._id.toString(),
        dockId: dbDock._id.toString(),
      }),
    });

    const idRes = await POST(idReq);
    assert.strictEqual(idRes.status, 200, "API ID-based request must return 200");
    const idJson = await idRes.json();
    assert.strictEqual(idJson.status, "ok");
    assert.strictEqual(idJson.result.compatible, true);
    console.log("  ✓ Sub-phase 15.4: POST /api/bookings/check-compatibility with { vesselId, dockId } returned 200");

    // 3.3 Invalid Payload Validation Error (Negative dimension)
    const invalidReq = new NextRequest("http://localhost:3000/api/bookings/check-compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vessel: { lengthFt: -10, beamFt: 13, draftFt: 4 },
        dock: { maxLengthFt: 50, maxBeamFt: 15, minDepthFt: 6 },
      }),
    });

    const invalidRes = await POST(invalidReq);
    assert.strictEqual(invalidRes.status, 400, "Negative length must fail with 400");
    console.log("  ✓ Sub-phase 15.4: Zod validation rejects negative dimensions with 400");

    // 3.4 Missing Payload
    const emptyReq = new NextRequest("http://localhost:3000/api/bookings/check-compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const emptyRes = await POST(emptyReq);
    assert.strictEqual(emptyRes.status, 400, "Empty payload must return 400");
    console.log("  ✓ Sub-phase 15.4: Empty payload rejected with 400");

  } finally {
    // Clean up test documents
    await Vessel.findByIdAndDelete(dbVessel._id);
    await Dock.findByIdAndDelete(dbDock._id);
  }

  console.log("\n🎯 All Phase 15 Compatibility Engine tests PASSED successfully!");
}

runPhase15Tests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Phase 15 verification failed:", err);
    process.exit(1);
  });
