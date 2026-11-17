import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDock extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  location: string;
  waterway: string;
  dockType: string;
  photos: string[];
  maxLengthFt: number;
  maxBeamFt: number;
  minDepthFt: number;
  pricePerDay: number;
  amenities: string[];
  availabilityNotes: string;
  arrivalInstructions: string; // PRIVATE: never expose publicly on explore or public detail
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DockSchema = new Schema<IDock>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Dock owner ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Dock listing title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    location: {
      type: String,
      required: [true, "Location (city, region) is required"],
      trim: true,
    },
    waterway: {
      type: String,
      required: [true, "Body of water or waterway is required"],
      trim: true,
    },
    dockType: {
      type: String,
      required: [true, "Dock type is required"],
      trim: true,
    },
    photos: {
      type: [String],
      default: ["/images/hero-marina.jpeg"],
    },
    maxLengthFt: {
      type: Number,
      required: [true, "Maximum vessel length allowed is required"],
      min: [1, "Max length must be at least 1 foot"],
    },
    maxBeamFt: {
      type: Number,
      required: [true, "Maximum vessel beam allowed is required"],
      min: [1, "Max beam must be at least 1 foot"],
    },
    minDepthFt: {
      type: Number,
      required: [true, "Minimum water depth (low tide) is required"],
      min: [0.1, "Min depth must be greater than 0"],
    },
    pricePerDay: {
      type: Number,
      required: [true, "Daily berthing rate is required"],
      min: [0, "Daily rate cannot be negative"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    availabilityNotes: {
      type: String,
      default: "Available for temporary and overnight reservations.",
      trim: true,
    },
    arrivalInstructions: {
      type: String,
      default: "",
      trim: true,
      // Private host access details: unlocked to boater ONLY after acceptance
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast explore searches and multi-parameter filtering
DockSchema.index({ location: 1, maxLengthFt: 1, minDepthFt: 1, pricePerDay: 1 });
DockSchema.index({ ownerId: 1, isActive: 1 });

export const Dock: Model<IDock> =
  mongoose.models.Dock || mongoose.model<IDock>("Dock", DockSchema);

export default Dock;
