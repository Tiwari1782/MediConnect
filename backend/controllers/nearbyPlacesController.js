import axios from "axios";

// ─── SEARCH NEARBY HEALTHCARE FACILITIES ─────────────────────────
export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lon, type = "hospital", radius = 5000 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    // Map type to Overpass API amenity tags
    const amenityMap = {
      hospital: "hospital",
      pharmacy: "pharmacy",
      dispensary: "clinic",
      clinic: "clinic",
      doctors: "doctors",
      dentist: "dentist",
    };

    const amenity = amenityMap[type] || "hospital";

    // Overpass API query
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="${amenity}"](around:${radius},${lat},${lon});
        way["amenity"="${amenity}"](around:${radius},${lat},${lon});
        relation["amenity"="${amenity}"](around:${radius},${lat},${lon});
      );
      out center body;
    `;

    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      `data=${encodeURIComponent(overpassQuery)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const places = response.data.elements.map((element) => ({
      id: element.id,
      name: element.tags?.name || "Unknown",
      type: element.tags?.amenity || type,
      lat: element.lat || element.center?.lat,
      lon: element.lon || element.center?.lon,
      address: {
        street: element.tags?.["addr:street"] || "",
        city: element.tags?.["addr:city"] || "",
        state: element.tags?.["addr:state"] || "",
        postcode: element.tags?.["addr:postcode"] || "",
      },
      phone: element.tags?.phone || element.tags?.["contact:phone"] || "",
      website: element.tags?.website || element.tags?.["contact:website"] || "",
      openingHours: element.tags?.opening_hours || "",
      emergency: element.tags?.emergency || "",
      wheelchair: element.tags?.wheelchair || "",
    }));

    res.status(200).json({
      success: true,
      count: places.length,
      searchParams: { lat, lon, type, radius },
      places,
    });
  } catch (error) {
    next(error);
  }
};