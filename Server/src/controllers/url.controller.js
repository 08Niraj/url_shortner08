import Url from "../models/url.schema.js";
import User from "../models/user.schema.js";
import { nanoid } from 'nanoid';

export async function createShortUrl(req, res) {
  try {
    const { originalUrl } = req.body;

    // Optional: Consider using a regex or URL constructor for more robust validation
    if (!originalUrl.includes("https")) {
      return res.status(400).json({ message: "Site is not secure. HTTPS is required." });
    }

    const shortUrl = await Url.create({
      user: req.user.id,
      originalUrl: originalUrl,
      shortCode: nanoid(6),
      clicks: 0,
      isActive: true
    });

    // FIXED: Passed as a single object to res.json()
    return res.status(201).json({ message: "Short URL is created", shortUrl });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllShortUrl(req, res) {
  try {
    // 1. Pagination setup (default to page 1, 10 items per page)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Fetch scoped data with pagination and sorting
    const urls = await Url.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 3. Get total count for the frontend to render page numbers
    const totalUrls = await Url.countDocuments({ user: req.user.id });

    // 4. Handle empty state gracefully
    if (urls.length === 0) {
      return res.status(200).json({ 
        message: "No URLs are present", 
        urls: [],
        totalPages: 0,
        currentPage: page
      });
    }

    // 5. Return successful payload
    return res.status(200).json({ 
      message: "URLs fetched successfully", 
      urls,
      currentPage: page,
      totalPages: Math.ceil(totalUrls / limit),
      totalItems: totalUrls
    });

  } catch (error) {
    // Tip: Use console.error for errors so they are flagged properly in server logs
    console.error("Error fetching URLs:", error); 
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteShortUrl(req, res) {
  try {
  
    const urlRecord = await Url.findOne({
    _id:req.params.id,
    user:req.user.id
})

    if (!urlRecord) {
      // FIXED: Corrected status code and message
      return res.status(404).json({ message: "URL not found" });
    }

   await urlRecord.deleteOne();

    return res.status(200).json({ message: "Deleted the URL successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function redirectToLongUrl(req, res) {
  try {
    const { shortCode } = req.params;


    const urlRecord = await Url.findOne({ shortCode });
   
   

    if (!urlRecord) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    if (!urlRecord.isActive) {
      return res.status(410).json({ message: "This short URL is no longer active" });
    }

    urlRecord.clicks += 1;
    await urlRecord.save();

    return res.redirect(urlRecord.originalUrl);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

