import mongoose, { Schema, Document, Model } from "mongoose";
import { BOOKING_STATUSES, BookingStatus } from "@/lib/constants";

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  boaterId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  dockId: mongoose.Types.ObjectId;
  vesselId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  specialRequests: string;
  delayEta?: Date;
  delayNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    boaterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Boater ID is required"],
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Dock owner ID is required"],
      index: true,
    },
    dockId: {
      type: Schema.Types.ObjectId,
      ref: "Dock",
      required: [true, "Dock ID is required"],
      index: true,
    },
    vesselId: {
      type: Schema.Types.ObjectId,
      ref: "Vessel",
      required: [true, "Vessel ID is required"],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (this: IBooking, val: Date) {
          return !this.startDate || val >= this.startDate;
        },
        message: "End date must be greater than or equal to start date",
      },
    },
    status: {
      type: String,
      enum: {
        values: [
          BOOKING_STATUSES.PENDING,
          BOOKING_STATUSES.ACCEPTED,
          BOOKING_STATUSES.REJECTED,
          BOOKING_STATUSES.COMPLETED,
        ],
        message: "{VALUE} is not a valid booking status",
      },
      default: BOOKING_STATUSES.PENDING,
      index: true,
    },
    specialRequests: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
    },
    delayEta: {
      type: Date,
      default: null,
    },
    delayNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Delay note cannot exceed 300 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid dashboard queries
BookingSchema.index({ boaterId: 1, status: 1 });
BookingSchema.index({ ownerId: 1, status: 1 });
BookingSchema.index({ dockId: 1, startDate: 1, endDate: 1 });

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
