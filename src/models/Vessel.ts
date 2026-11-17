import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVessel extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  lengthFt: number;
  beamFt: number;
  draftFt: number;
  registration: string;
  createdAt: Date;
  updatedAt: Date;
}

const VesselSchema = new Schema<IVessel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vessel owner ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Vessel name is required"],
      trim: true,
      maxlength: [100, "Vessel name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Vessel type is required"],
      trim: true,
    },
    lengthFt: {
      type: Number,
      required: [true, "Length Overall (LOA) in feet is required"],
      min: [1, "Length must be at least 1 foot"],
    },
    beamFt: {
      type: Number,
      required: [true, "Beam width in feet is required"],
      min: [1, "Beam must be at least 1 foot"],
    },
    draftFt: {
      type: Number,
      required: [true, "Draft depth in feet is required"],
      min: [0.1, "Draft must be greater than 0"],
    },
    registration: {
      type: String,
      required: [true, "Vessel registration or documentation number is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query
VesselSchema.index({ userId: 1, createdAt: -1 });

export const Vessel: Model<IVessel> =
  mongoose.models.Vessel || mongoose.model<IVessel>("Vessel", VesselSchema);

export default Vessel;
