import assert from "assert";
import {
  serializeUser,
  serializePublicDock,
  serializeOwnerDock,
  serializePublicDocks,
  serializeBooking,
} from "../src/lib/serializers";
import {
  canUnlockArrivalInstructions,
  getArrivalUnlockDecision,
  formatBookingWithArrivalPolicy,
} from "../src/services/arrival.service";
import { BOOKING_STATUSES } from "../src/lib/constants";

console.log("⚓ Running Phase 10 Serializer & Privacy Policy Verification...");

// 1. User serialization: passwordHash must NEVER leak
const rawUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Captain Alex",
  email: "captain.alex@gmail.com",
  passwordHash: "$2a$10$e8w.verySecretHashThatMustNeverLeak",
  role: "boater",
  createdAt: new Date(),
};
const safeUser = serializeUser(rawUser);
assert.strictEqual((safeUser as unknown as Record<string, unknown>).passwordHash, undefined, "passwordHash must be stripped");
assert.strictEqual(safeUser.name, "Captain Alex");
console.log("  ✓ Sub-phase 10.1: User passwordHash stripped successfully");

// 2. Dock serialization: arrivalInstructions must NEVER leak in public serializers
const rawDock = {
  _id: "507f191e810c19729de860ea",
  ownerId: "507f1f77bcf86cd799439012",
  title: "Harbor Point Deepwater Slip",
  location: "Fort Lauderdale, FL",
  waterway: "Stranahan River",
  dockType: "Private Dock",
  photos: ["/images/slip1.jpg"],
  maxLengthFt: 60,
  maxBeamFt: 18,
  minDepthFt: 8,
  pricePerDay: 125,
  amenities: ["Power 50A", "Fresh Water"],
  availabilityNotes: "Available all week",
  arrivalInstructions: "Gate code #4492, slip 4B on north pier. VHF Ch 68.",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const publicDock = serializePublicDock(rawDock);
assert.strictEqual(
  (publicDock as unknown as Record<string, unknown>).arrivalInstructions,
  undefined,
  "Public dock serializer must strip arrivalInstructions"
);
assert.strictEqual(publicDock.title, "Harbor Point Deepwater Slip");

const publicDocks = serializePublicDocks([rawDock]);
assert.strictEqual(
  (publicDocks[0] as unknown as Record<string, unknown>).arrivalInstructions,
  undefined,
  "Array public docks serializer must strip arrivalInstructions"
);

// Owner dock serializer preserves arrivalInstructions for the owner
const ownerDock = serializeOwnerDock(rawDock);
assert.strictEqual(
  ownerDock.arrivalInstructions,
  "Gate code #4492, slip 4B on north pier. VHF Ch 68.",
  "Owner dock serializer must include arrivalInstructions"
);
console.log("  ✓ Sub-phase 10.2: Public dock arrivalInstructions stripped; owner view preserved");

// 3. Arrival Service Decision Helper tests (Sub-phase 10.3)
const boaterId = "user_boater_123";
const ownerId = "user_owner_456";
const strangerId = "user_stranger_999";

const pendingBooking = {
  _id: "book_001",
  boaterId,
  ownerId,
  dockId: rawDock._id,
  vesselId: "vessel_001",
  status: BOOKING_STATUSES.PENDING,
  specialRequests: "Arriving around 5pm",
};

const acceptedBooking = {
  ...pendingBooking,
  _id: "book_002",
  status: BOOKING_STATUSES.ACCEPTED,
};

const rejectedBooking = {
  ...pendingBooking,
  _id: "book_003",
  status: BOOKING_STATUSES.REJECTED,
};

const completedBooking = {
  ...pendingBooking,
  _id: "book_004",
  status: BOOKING_STATUSES.COMPLETED,
};

// Check 1: Pending is locked for everyone
assert.strictEqual(canUnlockArrivalInstructions(pendingBooking, boaterId), false, "Pending booking must be locked for boater");
assert.strictEqual(canUnlockArrivalInstructions(pendingBooking, ownerId), false, "Pending booking must be locked for owner");

// Check 2: Rejected is locked for everyone
assert.strictEqual(canUnlockArrivalInstructions(rejectedBooking, boaterId), false, "Rejected booking must be locked");

// Check 3: Accepted is unlocked for boater and owner, locked for third-party stranger
assert.strictEqual(canUnlockArrivalInstructions(acceptedBooking, boaterId), true, "Accepted booking must be unlocked for boater");
assert.strictEqual(canUnlockArrivalInstructions(acceptedBooking, ownerId), true, "Accepted booking must be unlocked for owner");
assert.strictEqual(canUnlockArrivalInstructions(acceptedBooking, strangerId), false, "Accepted booking must be locked for third party");

// Check 4: Completed is unlocked for participants
assert.strictEqual(canUnlockArrivalInstructions(completedBooking, boaterId), true, "Completed booking must be unlocked for boater");

// Check 5: Decision helper reasons
const pendingDecision = getArrivalUnlockDecision(pendingBooking, rawDock, boaterId);
assert.strictEqual(pendingDecision.isUnlocked, false);
assert.strictEqual(pendingDecision.instructions, null);

const acceptedDecision = getArrivalUnlockDecision(acceptedBooking, rawDock, boaterId);
assert.strictEqual(acceptedDecision.isUnlocked, true);
assert.strictEqual(acceptedDecision.instructions, rawDock.arrivalInstructions);

const strangerDecision = getArrivalUnlockDecision(acceptedBooking, rawDock, strangerId);
assert.strictEqual(strangerDecision.isUnlocked, false);
assert.strictEqual(strangerDecision.instructions, null);

// Check 6: formatBookingWithArrivalPolicy
const formattedPending = formatBookingWithArrivalPolicy(pendingBooking, rawDock, boaterId);
assert.strictEqual(formattedPending.arrivalInstructions, null, "Formatted pending booking must have null instructions");

const formattedAccepted = formatBookingWithArrivalPolicy(acceptedBooking, rawDock, boaterId);
assert.strictEqual(formattedAccepted.arrivalInstructions, rawDock.arrivalInstructions, "Formatted accepted booking must have instructions");

const formattedStranger = formatBookingWithArrivalPolicy(acceptedBooking, rawDock, strangerId);
assert.strictEqual(formattedStranger.arrivalInstructions, null, "Formatted stranger request must have null instructions");

console.log("  ✓ Sub-phase 10.3: Arrival unlock policy verified across all lifecycle states");
console.log("🎉 All Phase 10 verification assertions PASSED!");
