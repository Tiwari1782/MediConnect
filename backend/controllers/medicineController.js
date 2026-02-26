import Medicine from "../models/Medicine.js";

// ─── SEARCH MEDICINES ────────────────────────────────────────────
export const searchMedicines = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      prescriptionRequired,
      page = 1,
      limit = 20,
      sortBy = "name",
      order = "asc",
    } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (prescriptionRequired !== undefined) {
      filter.prescriptionRequired = prescriptionRequired === "true";
    }

    const sortOptions = {};
    if (search) {
      sortOptions.score = { $meta: "textScore" };
    }
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    let query = Medicine.find(filter);
    if (search) {
      query = query.select({ score: { $meta: "textScore" } });
    }

    const medicines = await query
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Medicine.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: medicines.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      medicines,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET MEDICINE BY ID ──────────────────────────────────────────
export const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found.",
      });
    }

    res.status(200).json({
      success: true,
      medicine,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADD MEDICINE (Admin/Doctor can add) ─────────────────────────
export const addMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);

    res.status(201).json({
      success: true,
      message: "Medicine added successfully.",
      medicine,
    });
  } catch (error) {
    next(error);
  }
};