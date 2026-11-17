import { connectDB } from "@/lib/db";
import { User, Vessel, Dock, Booking } from "@/models";
import { hashPassword } from "@/lib/password";
import { USER_ROLES, BOOKING_STATUSES } from "@/lib/constants";

export interface SeedResult {
  users: {
    captainAlex: InstanceType<typeof User>;
    marinaOwner: InstanceType<typeof User>;
    sarahJenkins: InstanceType<typeof User>;
  };
  vessels: {
    seaBreeze: InstanceType<typeof Vessel>;
    islandRunner: InstanceType<typeof Vessel>;
  };
  docks: {
    deepwaterBasin: InstanceType<typeof Dock>;
    sunsetPier: InstanceType<typeof Dock>;
    northBasin: InstanceType<typeof Dock>;
    sarahsCanal: InstanceType<typeof Dock>;
  };
  bookings: {
    pendingBooking: InstanceType<typeof Booking>;
    acceptedBooking: InstanceType<typeof Booking>;
    completedBooking: InstanceType<typeof Booking>;
  };
}

const TEST_EMAILS = [
  "boater@anchordrop.com",
  "owner@anchordrop.com",
  "sarah@anchordrop.com",
];

const SEED_DOCK_TITLES = [
  "Marina Del Sol - Deepwater Basin 4B",
  "Marina Del Sol - Sunset Transient Pier",
  "Marina Del Sol - North Basin Slip",
  "Sarah's Private Canal Slip",
];

const SEED_VESSEL_REGISTRATIONS = ["FL-8821-AV", "FL-3304-IR"];

/**
 * Clean up existing seed records for idempotency
 */
async function cleanSeedData() {
  const existingUsers = await User.find({ email: { $in: TEST_EMAILS } }).select("_id");
  const userIds = existingUsers.map((u) => u._id);

  if (userIds.length > 0) {
    await Booking.deleteMany({
      $or: [{ boaterId: { $in: userIds } }, { ownerId: { $in: userIds } }],
    });
    await Vessel.deleteMany({ userId: { $in: userIds } });
    await Dock.deleteMany({ ownerId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
  }

  // Also clean up by unique dock titles / vessel registrations to ensure no orphaned leftovers
  await Dock.deleteMany({ title: { $in: SEED_DOCK_TITLES } });
  await Vessel.deleteMany({ registration: { $in: SEED_VESSEL_REGISTRATIONS } });
  await User.deleteMany({ email: { $in: TEST_EMAILS } });
}

/**
 * Main database seed function
 */
export async function seedDatabase(): Promise<SeedResult> {
  console.log("⚓ Connecting to MongoDB for seeding...");
  await connectDB();

  console.log("🧹 Resetting existing test accounts and seed records (idempotent reset)...");
  await cleanSeedData();

  console.log("🔐 Hashing default password with bcrypt...");
  const commonPasswordHash = await hashPassword("password123");

  // ---------------------------------------------------------------------------
  // 1. Seed Captain Alex (Boater) & Vessels
  // ---------------------------------------------------------------------------
  console.log("👤 Creating Seed 1: Captain Alex Vance (Boater)...");
  const captainAlex = await User.create({
    name: "Captain Alex Vance",
    email: "boater@anchordrop.com",
    passwordHash: commonPasswordHash,
    role: USER_ROLES.BOATER,
  });

  const seaBreeze = await Vessel.create({
    userId: captainAlex._id,
    name: "Sea Breeze II",
    type: "Motor Yacht",
    lengthFt: 42,
    beamFt: 13,
    draftFt: 4,
    registration: "FL-8821-AV",
  });

  const islandRunner = await Vessel.create({
    userId: captainAlex._id,
    name: "Island Runner",
    type: "Center Console",
    lengthFt: 28,
    beamFt: 9,
    draftFt: 2.5,
    registration: "FL-3304-IR",
  });

  // ---------------------------------------------------------------------------
  // 2. Seed Marina Del Sol (Dock Host) & 3 Berths
  // ---------------------------------------------------------------------------
  console.log("🏢 Creating Seed 2: Marina Del Sol Harbor (Dock Owner)...");
  const marinaOwner = await User.create({
    name: "Marina Del Sol Harbor",
    email: "owner@anchordrop.com",
    passwordHash: commonPasswordHash,
    role: USER_ROLES.DOCK_OWNER,
  });

  const deepwaterBasin = await Dock.create({
    ownerId: marinaOwner._id,
    title: "Marina Del Sol - Deepwater Basin 4B",
    location: "Fort Lauderdale, FL",
    waterway: "Stranahan River",
    dockType: "Marina Slip",
    photos: ["/images/hero-marina.jpeg"],
    maxLengthFt: 60,
    maxBeamFt: 18,
    minDepthFt: 8,
    pricePerDay: 140,
    amenities: [
      "Power 50A",
      "Power 30A",
      "Fresh Water",
      "Dock Box",
      "Restrooms",
      "Security Gate",
      "Fuel Dock",
      "Wi-Fi",
    ],
    availabilityNotes:
      "Deepwater basin slip with direct ocean access via Port Everglades inlet. No bridge restrictions.",
    arrivalInstructions: "Gate code: #4492. Assigned Slip: 4B. Monitor VHF Ch 68.",
    isActive: true,
  });

  const sunsetPier = await Dock.create({
    ownerId: marinaOwner._id,
    title: "Marina Del Sol - Sunset Transient Pier",
    location: "Fort Lauderdale, FL",
    waterway: "Intracoastal Waterway",
    dockType: "Transient Pier",
    photos: ["/images/hero-marina.jpeg"],
    maxLengthFt: 45,
    maxBeamFt: 14,
    minDepthFt: 6,
    pricePerDay: 110,
    amenities: ["Power 30A", "Fresh Water", "Restrooms", "Wi-Fi"],
    availabilityNotes:
      "Convenient transient pier along the Intracoastal Waterway. Quick docking for coastal cruisers.",
    arrivalInstructions: "South Pier Gate: *1280. Slip 12. VHF Ch 68.",
    isActive: true,
  });

  const northBasin = await Dock.create({
    ownerId: marinaOwner._id,
    title: "Marina Del Sol - North Basin Slip",
    location: "Fort Lauderdale, FL",
    waterway: "Middle River",
    dockType: "Residential Basin",
    photos: ["/images/hero-marina.jpeg"],
    maxLengthFt: 35,
    maxBeamFt: 12,
    minDepthFt: 5,
    pricePerDay: 85,
    amenities: ["Power 30A", "Fresh Water"],
    availabilityNotes:
      "Protected canal basin slip ideal for small to mid-size vessels. Calm wake-free waters.",
    arrivalInstructions: "Keypad combination: 9912. Slip 3. VHF Ch 16/68.",
    isActive: true,
  });

  // ---------------------------------------------------------------------------
  // 3. Seed Sarah Jenkins (Private Dock Host) & Canal Slip
  // ---------------------------------------------------------------------------
  console.log("🏡 Creating Seed 3: Sarah Jenkins (Private Dock Host)...");
  const sarahJenkins = await User.create({
    name: "Sarah Jenkins",
    email: "sarah@anchordrop.com",
    passwordHash: commonPasswordHash,
    role: USER_ROLES.DOCK_OWNER,
  });

  const sarahsCanal = await Dock.create({
    ownerId: sarahJenkins._id,
    title: "Sarah's Private Canal Slip",
    location: "Fort Lauderdale, FL",
    waterway: "New River Isles Canal",
    dockType: "Private Residential Slip",
    photos: ["/images/hero-marina.jpeg"],
    maxLengthFt: 50,
    maxBeamFt: 15,
    minDepthFt: 6,
    pricePerDay: 95,
    amenities: ["Fresh Water", "Quiet Canal", "Private Tie-Up"],
    availabilityNotes:
      "Private residence slip nestled in a peaceful New River canal. Gated property with 24/7 access.",
    arrivalInstructions:
      "Private residence gate code: 7731. Port-side tie-up on wooden pilings. Water hose on dock.",
    isActive: true,
  });

  // ---------------------------------------------------------------------------
  // 4. Seed Sample Bookings with Mixed Statuses
  // ---------------------------------------------------------------------------
  console.log("📅 Creating Seed 4: Sample Bookings with Mixed Statuses...");

  // Booking 1: status "pending" — Alex Vance requesting Sarah's Canal Slip for Sea Breeze II
  const pendingBooking = await Booking.create({
    boaterId: captainAlex._id,
    ownerId: sarahJenkins._id,
    dockId: sarahsCanal._id,
    vesselId: seaBreeze._id,
    startDate: new Date(Date.now() + 3 * 86400000), // 3 days ahead
    endDate: new Date(Date.now() + 6 * 86400000), // 6 days ahead
    status: BOOKING_STATUSES.PENDING,
    specialRequests:
      "Cruising south along the ICW, looking for a quiet overnight stay. Requesting late check-in around 18:00.",
  });

  // Booking 2: status "accepted" — Alex Vance booked Marina Del Sol Deepwater Basin 4B for Sea Breeze II
  const acceptedBooking = await Booking.create({
    boaterId: captainAlex._id,
    ownerId: marinaOwner._id,
    dockId: deepwaterBasin._id,
    vesselId: seaBreeze._id,
    startDate: new Date(Date.now() + 1 * 86400000), // Tomorrow
    endDate: new Date(Date.now() + 4 * 86400000), // 4 days ahead
    status: BOOKING_STATUSES.ACCEPTED,
    specialRequests:
      "Need 50A shore power adapter upon docking. Will hail VHF 68 upon entering Stranahan River.",
  });

  // Booking 3: status "completed" — Alex Vance previous stay at Marina Del Sol Sunset Transient Pier for Island Runner
  const completedBooking = await Booking.create({
    boaterId: captainAlex._id,
    ownerId: marinaOwner._id,
    dockId: sunsetPier._id,
    vesselId: islandRunner._id,
    startDate: new Date(Date.now() - 7 * 86400000), // 7 days ago
    endDate: new Date(Date.now() - 4 * 86400000), // 4 days ago
    status: BOOKING_STATUSES.COMPLETED,
    specialRequests:
      "Weekend offshore fishing tournament transient stay. Required early morning departure.",
  });

  // ---------------------------------------------------------------------------
  // Summary output
  // ---------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log("⚓ AnchorDrop Seed Data Summary");
  console.log("=======================================================");
  console.log("👤 Seeded Users (Password: password123):");
  console.log(`   1. ${captainAlex.name} (${captainAlex.role}) -> ${captainAlex.email}`);
  console.log(`   2. ${marinaOwner.name} (${marinaOwner.role}) -> ${marinaOwner.email}`);
  console.log(`   3. ${sarahJenkins.name} (${sarahJenkins.role}) -> ${sarahJenkins.email}`);
  console.log("\n🚤 Seeded Vessels for Captain Alex:");
  console.log(`   1. ${seaBreeze.name} (${seaBreeze.type}, ${seaBreeze.lengthFt}ft x ${seaBreeze.beamFt}ft x ${seaBreeze.draftFt}ft, Reg: ${seaBreeze.registration})`);
  console.log(`   2. ${islandRunner.name} (${islandRunner.type}, ${islandRunner.lengthFt}ft x ${islandRunner.beamFt}ft x ${islandRunner.draftFt}ft, Reg: ${islandRunner.registration})`);
  console.log("\n⚓ Seeded Docks:");
  console.log(`   1. ${deepwaterBasin.title} (${deepwaterBasin.maxLengthFt}ft x ${deepwaterBasin.maxBeamFt}ft, ${deepwaterBasin.minDepthFt}ft depth, $${deepwaterBasin.pricePerDay}/day) [Host: Marina Del Sol]`);
  console.log(`   2. ${sunsetPier.title} (${sunsetPier.maxLengthFt}ft x ${sunsetPier.maxBeamFt}ft, ${sunsetPier.minDepthFt}ft depth, $${sunsetPier.pricePerDay}/day) [Host: Marina Del Sol]`);
  console.log(`   3. ${northBasin.title} (${northBasin.maxLengthFt}ft x ${northBasin.maxBeamFt}ft, ${northBasin.minDepthFt}ft depth, $${northBasin.pricePerDay}/day) [Host: Marina Del Sol]`);
  console.log(`   4. ${sarahsCanal.title} (${sarahsCanal.maxLengthFt}ft x ${sarahsCanal.maxBeamFt}ft, ${sarahsCanal.minDepthFt}ft depth, $${sarahsCanal.pricePerDay}/day) [Host: Sarah Jenkins]`);
  console.log("\n📅 Seeded Bookings:");
  console.log(`   1. [PENDING]   Alex Vance -> "${sarahsCanal.title}" (${seaBreeze.name})`);
  console.log(`   2. [ACCEPTED]  Alex Vance -> "${deepwaterBasin.title}" (${seaBreeze.name})`);
  console.log(`      * Private Arrival Instructions Unlocked to Alex: "${deepwaterBasin.arrivalInstructions}"`);
  console.log(`   3. [COMPLETED] Alex Vance -> "${sunsetPier.title}" (${islandRunner.name})`);
  console.log("=======================================================\n");

  return {
    users: {
      captainAlex,
      marinaOwner,
      sarahJenkins,
    },
    vessels: {
      seaBreeze,
      islandRunner,
    },
    docks: {
      deepwaterBasin,
      sunsetPier,
      northBasin,
      sarahsCanal,
    },
    bookings: {
      pendingBooking,
      acceptedBooking,
      completedBooking,
    },
  };
}

// Standalone execution support
const isDirectRun = Boolean(
  process.argv[1] &&
    (process.argv[1].endsWith("seed.ts") ||
      process.argv[1].endsWith("seed") ||
      process.argv[1].includes("seed.ts"))
);

if (isDirectRun) {
  seedDatabase()
    .then(() => {
      console.log("⚓ Seed script executed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed script failed:", err);
      process.exit(1);
    });
}
