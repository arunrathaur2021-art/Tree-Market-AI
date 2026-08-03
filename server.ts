import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { estimateTreeDetails } from "./server/gemini.js";
import { requireAuth } from "./server/middleware/auth.js";

// Import Modular Routers
import authRoutes from "./server/routes/authRoutes.js";
import treeRoutes from "./server/routes/treeRoutes.js";
import orderRoutes from "./server/routes/orderRoutes.js";
import paymentRoutes from "./server/routes/paymentRoutes.js";
import messageRoutes from "./server/routes/messageRoutes.js";
import adminRoutes from "./server/routes/adminRoutes.js";
import alertRoutes from "./server/routes/alertRoutes.js";
import mandiRoutes from "./server/routes/mandiRoutes.js";
import businessRoutes from "./server/routes/businessRoutes.js";
import favoriteRoutes from "./server/routes/favoriteRoutes.js";
import reviewRoutes from "./server/routes/reviewRoutes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enlarge size limits for base64 image uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Ensure server/uploads folder exists
  const uploadsDir = path.join(process.cwd(), 'server/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static uploads if any (complying with /uploads folder structure requested)
  app.use('/uploads', express.static(uploadsDir));

  // --- Mount API Endpoints ---
  app.use('/api/auth', authRoutes);
  app.use('/api/trees', treeRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/mandi', mandiRoutes);
  app.use('/api/businesses', businessRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/reviews', reviewRoutes);

  // 4. Client-side & Server-side validated Base64 Image Upload API
  app.post("/api/upload", requireAuth, async (req: any, res: any) => {
    try {
      const { base64Data } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing image base64 data" });
      }

      // Extract details from base64 string
      // base64 format: data:image/jpeg;base64,....
      const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 image data format" });
      }

      const mimeType = matches[1];
      const dataBuffer = Buffer.from(matches[2], 'base64');

      // Validate size (< 5 MB)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (dataBuffer.length > maxSizeBytes) {
        return res.status(400).json({ error: "Image size exceeds the maximum allowed limit of 5 MB." });
      }

      // Validate type
      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedMimes.includes(mimeType.toLowerCase())) {
        return res.status(400).json({ error: "Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed." });
      }

      // Generate a unique filename
      const fileExt = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
      const uniqueFilename = `tree_${Date.now()}_${Math.floor(Math.random() * 100000)}.${fileExt}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Write file locally
      await fs.promises.writeFile(filePath, dataBuffer);

      // Return the static file URL
      const fileUrl = `/uploads/${uniqueFilename}`;
      res.json({ url: fileUrl });
    } catch (err: any) {
      console.error("Upload handler error:", err);
      res.status(500).json({ error: err.message || "Upload failed." });
    }
  });

  // 5. AI Powered Price & Care Estimate API (Gemini Integration)
  app.post("/api/ai/estimate", requireAuth, async (req: any, res) => {
    try {
      const {
        name,
        category,
        species,
        age,
        height,
        diameter,
        quantity,
        location,
        state,
        district,
        trunkCircumference,
        healthCondition,
        growthRate,
        trunkStraightness,
        woodDensity,
        moistureLevel,
        timberGrade,
        landType,
        soilType,
        rainfallZone
      } = req.body;

      if (!name || (!category && !species)) {
        return res.status(400).json({ error: "Name and Species/Category are required for AI analysis." });
      }

      const analysis = await estimateTreeDetails({
        name,
        category: category || species || "Teak",
        species: species || category || "Teak",
        age: Number(age) || 5,
        height: Number(height) || 10,
        diameter: Number(diameter) || 3,
        quantity: Number(quantity) || 1,
        location: location || "India",
        state: state || "Karnataka",
        district: district || "",
        trunkCircumference: trunkCircumference ? Number(trunkCircumference) : undefined,
        healthCondition,
        growthRate,
        trunkStraightness,
        woodDensity,
        moistureLevel,
        timberGrade,
        landType,
        soilType,
        rainfallZone
      });

      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Gemini estimation failed." });
    }
  });

  // Catch-all 404 handler for unhandled API endpoints
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
  });

  // Serve frontend files using Vite middleware in development, and static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TreeMarket AI Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
});
export {};
