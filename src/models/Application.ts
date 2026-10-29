import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  Types,
} from "mongoose";

const AttachmentSchema = new Schema(
  {
    slot: {
      type: String,
      enum: ["checklist", "license", "lifesupport", "resume"],
      required: true,
    },
    originalName: { type: String, required: true },
    /** Public HTTPS S3 object URL — the only storage location saved in MongoDB */
    url: { type: String, required: true },
    contentType: { type: String, default: "" },
    size: { type: Number, default: 0 },
  },
  { _id: true },
);

const ApplicationSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["new", "reviewing", "contacted", "placed", "archived"],
      default: "new",
      index: true,
    },
    client: { type: String, default: "" },
    formVersion: { type: String, default: "1.0" },
    pageUrl: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now, index: true },

    fullName: { type: String, required: true, index: true },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    phone: { type: String, default: "" },
    phoneAlt: { type: String, default: "" },
    email: { type: String, required: true, index: true },
    emailAlt: { type: String, default: "" },
    dob: { type: String, default: "" },
    ssnLast4: { type: String, default: "" },

    workAuth: { type: String, default: "" },
    vehicle: { type: String, default: "" },
    backgroundOk: { type: String, default: "" },
    fluShot: { type: String, default: "" },
    startAsap: { type: String, default: "" },
    startDate: { type: String, default: "" },
    daysOff: { type: String, default: "" },
    daysOffDetails: { type: String, default: "" },
    otherOffers: { type: String, default: "" },
    otherOffersDetails: { type: String, default: "" },
    interviewAvailability: { type: String, default: "" },

    profession: { type: String, default: "", index: true },
    specialty: { type: String, default: "" },
    licenseStates: { type: String, default: "" },
    educationLevel: { type: String, default: "" },
    educationField: { type: String, default: "" },
    educationSchool: { type: String, default: "" },
    educationYear: { type: String, default: "" },
    eduDocs: { type: String, default: "" },
    emr: { type: [String], default: [] },
    emrOther: { type: String, default: "" },
    priorClient: { type: String, default: "" },
    priorClientDetails: { type: String, default: "" },

    checklistSpecialty: { type: String, default: "" },
    checklistLabel: { type: String, default: "" },
    checklistMethod: { type: String, default: "" },

    ref1Client: { type: String, default: "" },
    ref1Name: { type: String, default: "" },
    ref1Title: { type: String, default: "" },
    ref1Contact: { type: String, default: "" },
    ref2Client: { type: String, default: "" },
    ref2Name: { type: String, default: "" },
    ref2Title: { type: String, default: "" },
    ref2Contact: { type: String, default: "" },

    consent: { type: String, default: "" },
    signature: { type: String, default: "" },
    signatureDate: { type: String, default: "" },

    notes: { type: String, default: "" },
    attachments: { type: [AttachmentSchema], default: [] },
  },
  { timestamps: true },
);

ApplicationSchema.index({ fullName: "text", email: "text", reference: "text", profession: "text" });

export type ApplicationAttachment = InferSchemaType<typeof AttachmentSchema> & {
  _id: Types.ObjectId;
};

export type ApplicationDocument = InferSchemaType<typeof ApplicationSchema> & {
  _id: Types.ObjectId;
};

// Recreate on HMR so schema changes (like S3 fields) are picked up in dev.
if (mongoose.models.Application) {
  mongoose.deleteModel("Application");
}

export const Application = model(
  "Application",
  ApplicationSchema,
  "applications",
);
