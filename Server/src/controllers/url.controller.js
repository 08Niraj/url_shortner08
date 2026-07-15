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
    // 1. Start with a baseline query that ALWAYS restricts data to the logged-in user
    const query = {
      user: req.user.id
    };

    // 2. Extract searching, filtering, and pagination parameters from the URL query
    const { search, isActive } = req.query; // <--- This extracts '?search=xyz&status=active'


    console.log(req.query)
    // 3. THE SEARCH IMPLEMENTATION
    // If the user provided a search term, modify the database query object
   if (search) {
  // 1. Cleanly escape special characters (safely)
  const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  
  // 2. Use MongoDB's native $regex and $options operators instead of passing a RegExp class instance
  query.$or = [
    { originalUrl: { $regex: safeSearch, $options: "i" } },
    { shortUrl: { $regex: safeSearch, $options: "i" } }
  ];
}


console.log(req.query.isActive)
    // 4. THE FILTERING IMPLEMENTATION
    // If the user provided a status filter, append it to the query object
   if (isActive !== undefined) {
  if (isActive === "active" || isActive === "true") {
    query.isActive = true;
  } else if (isActive === "inactive" || isActive === "false") {
    query.isActive = false;
  }
}

    // 5. Pagination setup (same as your original code)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 6. Execute the query
    // Notice we pass our custom 'query' object directly into .find() and .countDocuments()
    const [urls, totalUrls] = await Promise.all([
      Url.find(query) // <--- Uses the dynamically built query
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Url.countDocuments(query) // <--- Matches the count to the search/filter criteria
    ]);

    console.log(urls)

    // 7. Handle empty state gracefully
    if (urls.length === 0) {
      return res.status(200).json({ 
        message: "No matching URLs found", 
        urls: [],
        totalPages: 0,
        currentPage: page,
        totalItems: 0
      });
    }

    // 8. Return successful payload
    return res.status(200).json({ 
      message: "URLs fetched successfully", 
      urls,
      currentPage: page,
      totalPages: Math.ceil(totalUrls / limit),
      totalItems: totalUrls
    });

  } catch (error) {
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

