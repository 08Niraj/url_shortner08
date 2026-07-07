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
    // Tip: If you only want users to see their OWN urls, change this to:
    // const urls = await Url.find({ user: req.user.id });
    const urls = await Url.find({user:req.user.id});

    if (urls.length === 0) {
      return res.status(200).json({ message: "No URLs are present" });
    }

    return res.status(200).json({ message: "URLs fetched successfully", urls });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteShortUrl(req, res) {
  try {
    const { originalUrl } = req.body;

    // FIXED: Used findOne() instead of find()
    const urlRecord = await Url.findOne({ originalUrl });

    if (!urlRecord) {
      // FIXED: Corrected status code and message
      return res.status(404).json({ message: "URL not found" });
    }

    await Url.findOneAndDelete({ originalUrl });

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