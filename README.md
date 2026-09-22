# 🌿 TRENDSPROUT — Next-Gen AI Fashion Marketplace & Design Studio

An intelligent multi-vendor fashion e-commerce ecosystem and generative studio designed for modern shoppers and independent apparel designers. Powered by deep learning Computer Vision, Generative Diffusion AI models, and real-time intelligent stylist assistants.

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,ts,nodejs,express,mongodb,python,fastapi,pytorch,git,github,vscode" alt="Tech Stack" />
</p>

---

## 🌟 Key Features

- 🎨 **Generative Text-to-Design Studio**: Transform natural language descriptions into 8K photorealistic fashion concepts using the **Flux Diffusion Model** via Pollinations AI. Suggests garment categories, estimated pricing, and enables 1-click tailored custom orders.
- 🤖 **AI Fashion Stylist Chatbot**: An interactive e-commerce assistant that analyzes occasion, dress codes, and tropical Sri Lankan fashion aesthetics to provide personalized styling advice with direct in-stock catalog recommendations.
- 👗 **AI Smart Outfit Generator**: Intelligently curates coordinated 2–3 piece capsule wardrobe looks (tops, trousers, blazers, footwear, accessories) based on occasion (*Weekend Brunch, Rooftop Dinner, Work Meeting, Date Night*), style vibe, and budget.
- 📷 **Visual Search with 'Drop & Crop'**: Upload or drag-and-drop any real-world street style photo. An interactive draggable Region of Interest (ROI) box isolates specific garments (*Tops, Bottoms, Dresses, Accessories*) and matches them against the catalog using OpenCV HSV hue & texture extraction.
- 🪄 **AI Background Remover (U²-Net)**: Vendor product studio featuring deep learning background segmentation powered by **rembg** (U²-Net ONNX) to instantly isolate garments onto transparent backgrounds for e-commerce listings.
- ✍️ **Vendor AI SEO Copywriter**: Automatically writes conversion-optimized product descriptions, bullet points, and SEO search tags based on material, fit, tone, and silhouette.
- 🏷️ **Vendor AI Dynamic Pricing Advisor**: Analyzes unit production costs and target margins to calculate suggested retail prices, promotional discounts, profit-per-unit, and competitor price ranges.
- 🛍️ **Full-Stack Marketplace Architecture**: Customer dashboard, vendor store customizer, interactive cart, coupon redemption engine, order tracking, and mock payment gateway.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite 6](https://vite.dev/) (TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism Theme
- **Animations & Charts**: [Motion (Framer Motion)](https://motion.dev/), [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)

### Backend API
- **Runtime & Framework**: [Node.js](https://nodejs.org/) (ES Modules) + [Express.js](https://expressjs.com/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) + [Bcrypt.js](https://www.npmjs.com/package/bcryptjs)
- **Middleware**: CORS, Dotenv

### Python AI & Computer Vision Microservice
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/)
- **Background Removal**: [rembg](https://github.com/danielgatis/rembg) (U²-Net deep learning segmentation) + [ONNX Runtime](https://onnxruntime.ai/)
- **Computer Vision**: [OpenCV](https://opencv.org/) (`opencv-python-headless`), [Pillow (PIL)](https://python-pillow.org/), [NumPy](https://numpy.org/)
- **Generative Diffusion**: [Pollinations AI](https://pollinations.ai/) (Flux Generative Model)

---

## 💻 How to Run the Project on Localhost

Follow these step-by-step instructions to get the complete TRENDSPROUT ecosystem running locally on your computer.

### 📋 Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- **Git**

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/gimhaninupa/TRENDSPROUT.git
cd TRENDSPROUT
```

---

### 2️⃣ Python AI Microservice Setup (FastAPI & Computer Vision)
Open a terminal session to start the Computer Vision & Background Removal microservice:

```bash
# Move into the python-ai-service folder
cd python-ai-service

# Create a virtual environment (optional but recommended)
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell/CMD):
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python AI & Computer Vision dependencies
pip install -r requirements.txt

# Start the FastAPI microservice
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

> 💡 **Note**: On the first background removal request, the microservice will automatically download the lightweight `u2netp.onnx` deep learning model.
> 
> The Python AI Microservice will run at **`http://127.0.0.1:8000`** (Health check: `http://127.0.0.1:8000/health`).

---

### 3️⃣ Backend Setup (Node.js / Express API)
Open a second terminal session to start the main backend server:

```bash
# Move into the backend folder
cd backend

# Install Node modules
npm install

# (Optional) Seed the database with sample catalog products & vendors
npm run seed

# Start the backend server in development mode
npm run dev
```

> 💡 **Note**: The Node.js API server will run at **`http://localhost:5000`** (Health check: `http://localhost:5000/api/health`).

---

### 4️⃣ Frontend Setup (React App)
Open a third terminal session to start the Vite development server:

```bash
# Move into the frontend folder
cd frontend

# Install frontend dependencies
npm install

# Start the local development server
npm run dev
```

> 💡 **Note**: The frontend application will start up at **`http://localhost:5173`**. Open this address in your web browser to explore TRENDSPROUT!

---

## 📁 Project Directory Structure

```plaintext
TRENDSPROUT/
├── backend/                  # Node.js Express REST API
│   ├── middleware/           # Auth JWT & validation middleware
│   ├── models/               # Mongoose schemas (Product, User, Cart, Order, etc.)
│   ├── routes/               # API endpoints (ai.js, cv.js, products.js, auth.js, etc.)
│   ├── package.json
│   └── server.js             # Main backend server entry point
│
├── frontend/                 # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── app/              # App routing & providers
│   │   ├── components/       # Shared UI components & design system
│   │   ├── context/          # AuthContext & CartContext state
│   │   ├── pages/
│   │   │   ├── ai/           # AIChatbot, AIOutfit, TextToDesign screens
│   │   │   ├── customer/     # Dashboard, Cart, Checkout, Orders, Tracking
│   │   │   ├── shop/         # Browse & Drop-and-Crop Visual Search
│   │   │   └── vendor/       # Vendor Dashboard, Add Product, AI Copy & Pricing
│   │   └── services/         # API client service layer
│   └── package.json
│
├── python-ai-service/        # Standalone Computer Vision & ML Microservice
│   ├── main.py               # FastAPI endpoints for U²-Net BG Removal & CV Search
│   ├── requirements.txt      # Python dependencies (fastapi, rembg, opencv, pillow)
│   └── Dockerfile            # Container definition for cloud deployment
│
├── DEPLOYMENT_GUIDE.md       # 100% Free Cloud Hosting Guide (Vercel + Render + Hugging Face)
└── README.md                 # Project documentation
```

---

## 🌐 Production Cloud Deployment

The entire system is configured for **100% Free Tier Cloud Deployment**:
- **Frontend**: [Vercel](https://vercel.com/) (React Vite SPA)
- **Backend**: [Render](https://render.com/) (Node.js Web Service)
- **Database**: [MongoDB Atlas](https://cloud.mongodb.com/) (Free M0 Sandbox)
- **AI Microservice**: [Hugging Face Spaces](https://huggingface.co/) (Free Docker 16 GB RAM)

*For step-by-step production hosting instructions, see the [DEPLOYMENT_GUIDE.md](file:///d:/Gimhan/Projects/TRENDSPROUT/DEPLOYMENT_GUIDE.md).*
