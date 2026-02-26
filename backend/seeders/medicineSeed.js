import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import Medicine from "../models/Medicine.js";

const medicines = [
  {
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    composition: "Paracetamol 500mg",
    manufacturer: "Cipla",
    price: 30,
    packSize: "Strip of 10 tablets",
    category: "Pain Relief",
    prescriptionRequired: false,
    description: "Used to treat pain and fever.",
    sideEffects: ["Nausea", "Liver damage (overdose)"],
    uses: ["Fever", "Headache", "Body pain", "Toothache"],
  },
  {
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    composition: "Amoxicillin Trihydrate 500mg",
    manufacturer: "GSK",
    price: 85,
    packSize: "Strip of 10 capsules",
    category: "Antibiotics",
    prescriptionRequired: true,
    description: "Broad-spectrum antibiotic for bacterial infections.",
    sideEffects: ["Diarrhea", "Nausea", "Rash"],
    uses: ["Bacterial infections", "Ear infections", "UTI"],
  },
  {
    name: "Cetirizine 10mg",
    genericName: "Cetirizine Hydrochloride",
    composition: "Cetirizine Dihydrochloride 10mg",
    manufacturer: "Dr. Reddy's",
    price: 25,
    packSize: "Strip of 10 tablets",
    category: "Antihistamine",
    prescriptionRequired: false,
    description: "Used for allergies and hay fever.",
    sideEffects: ["Drowsiness", "Dry mouth"],
    uses: ["Allergies", "Hay fever", "Hives", "Itching"],
  },
  {
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    composition: "Omeprazole 20mg",
    manufacturer: "Sun Pharma",
    price: 65,
    packSize: "Strip of 15 capsules",
    category: "Antacid",
    prescriptionRequired: false,
    description: "Proton pump inhibitor for acid reflux and ulcers.",
    sideEffects: ["Headache", "Nausea", "Stomach pain"],
    uses: ["Acid reflux", "GERD", "Stomach ulcers"],
  },
  {
    name: "Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    composition: "Metformin HCl 500mg",
    manufacturer: "USV",
    price: 40,
    packSize: "Strip of 10 tablets",
    category: "Antidiabetic",
    prescriptionRequired: true,
    description: "First-line medication for type 2 diabetes.",
    sideEffects: ["Nausea", "Diarrhea", "Metallic taste"],
    uses: ["Type 2 Diabetes", "PCOS", "Insulin resistance"],
  },
  {
    name: "Azithromycin 500mg",
    genericName: "Azithromycin",
    composition: "Azithromycin Dihydrate 500mg",
    manufacturer: "Alkem",
    price: 95,
    packSize: "Strip of 3 tablets",
    category: "Antibiotics",
    prescriptionRequired: true,
    description: "Macrolide antibiotic for bacterial infections.",
    sideEffects: ["Stomach pain", "Diarrhea", "Nausea"],
    uses: ["Respiratory infections", "Skin infections", "Ear infections"],
  },
  {
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    composition: "Ibuprofen 400mg",
    manufacturer: "Abbott",
    price: 35,
    packSize: "Strip of 10 tablets",
    category: "Pain Relief",
    prescriptionRequired: false,
    description: "NSAID for pain, inflammation, and fever.",
    sideEffects: ["Stomach upset", "Heartburn", "Dizziness"],
    uses: ["Pain", "Inflammation", "Arthritis", "Fever"],
  },
  {
    name: "Amlodipine 5mg",
    genericName: "Amlodipine Besylate",
    composition: "Amlodipine Besylate 5mg",
    manufacturer: "Torrent",
    price: 50,
    packSize: "Strip of 14 tablets",
    category: "Antihypertensive",
    prescriptionRequired: true,
    description: "Calcium channel blocker for high blood pressure.",
    sideEffects: ["Swelling", "Dizziness", "Flushing"],
    uses: ["Hypertension", "Angina", "Coronary artery disease"],
  },
  {
    name: "Pantoprazole 40mg",
    genericName: "Pantoprazole",
    composition: "Pantoprazole Sodium Sesquihydrate 40mg",
    manufacturer: "Mankind",
    price: 75,
    packSize: "Strip of 15 tablets",
    category: "Antacid",
    prescriptionRequired: false,
    description: "PPI used for acid reflux and gastric ulcers.",
    sideEffects: ["Headache", "Diarrhea", "Flatulence"],
    uses: ["GERD", "Peptic ulcer", "Zollinger-Ellison syndrome"],
  },
  {
    name: "Vitamin D3 60000 IU",
    genericName: "Cholecalciferol",
    composition: "Cholecalciferol 60000 IU",
    manufacturer: "Cadila",
    price: 120,
    packSize: "Strip of 4 sachets",
    category: "Supplements",
    prescriptionRequired: false,
    description: "Vitamin D supplement for deficiency.",
    sideEffects: ["Nausea", "Constipation (high doses)"],
    uses: ["Vitamin D deficiency", "Bone health", "Immunity"],
  },
];

const seedMedicines = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Medicine.deleteMany({});
    console.log("🗑️  Cleared existing medicines");

    await Medicine.insertMany(medicines);
    console.log("🌱 Medicines seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
};

seedMedicines();