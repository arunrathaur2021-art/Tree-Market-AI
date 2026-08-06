# TreeMarket AI India

TreeMarket AI India is an AI-powered digital marketplace connecting farmers, buyers, timber industries, transporters, and businesses across India.

**Designed, Developed and Maintained by Arun Rathaur.**
© 2026 TreeMarket AI India. All Rights Reserved.

---

## 🌾 Core Features & Capabilities

### 🌲 Multi-Role Portal System
- **Buyers (Farmers/Retailers)**: Perform multi-tiered searches filtered by Indian State, District, price indices, categories, and direct timber felling parameters.
- **Sellers (Nursery/Forest Owners)**: Publish stock using comprehensive local/botanical taxonomies, manage pricing, and receive digital APMC purchasing orders.
- **Platform Admins**: Oversee transaction volumes, purge bad listings, audit user compliance, and track gross marketplace trade volumes.

### 🧠 Gemini Arborist AI Care Integration
- **Interactive Arborist AI**: Chat directly with our localized expert to clarify soil type preferences, local water cycles, wood density ratings, and legal transit constraints.
- **Arborist AI Listing Optimization**: Instantly calibrates seller listings with professionally written sales copy and demand estimates matching standard APMC benchmarks.

### 💳 Direct Payments & Order Execution
- **Indian Financial Integrations**: Checkout sheets supporting UPI, Google Pay, PhonePe, Paytm, and Razorpay.
- **GST & Logistics Calculator**: Computes regional state taxes (SGST/CGST) and flat-rate forestry transit fees dynamically.
- **P2P Negotiation Chats**: Peer-to-peer real-time communication modules to negotiate pricing, harvest terms, and transport logistics.

---

## 🛠 Technology Stack

### Frontend
- **React 19** & **Vite**
- **TypeScript**
- **Tailwind CSS** (Spruce Green theme)
- **Lucide Icons**
- **Motion** (Smooth user animations)

### Backend
- **Node.js** & **Express**
- **Simulated MongoDB / Mongoose Engine** for high-performance memory storage.
- **Google GenAI SDK** (`@google/genai` v2.4.0)

---

## ⚙️ Project Structure & Development

To run the application locally, follow these steps:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure your environment**:
   Make a copy of `.env.example` as `.env` and fill in your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```
   This will bundle the frontend assets and compile the server code with `esbuild` to a singular CommonJS file (`dist/server.cjs`) for lightweight runtime execution.
