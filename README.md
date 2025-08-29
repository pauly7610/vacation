# Wanderlist - Discover Your Next Adventure 🌍

A beautiful travel discovery app that helps you find amazing destinations and book your trips.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd wanderlist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your API keys (see API Setup below).

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔑 API Keys Setup

### Required APIs

#### 1. Google Maps API (ESSENTIAL)
- **Purpose**: Maps, location services, geocoding
- **Get it**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Cost**: Free tier (28,000+ map loads/month)
- **Setup**:
  1. Create a Google Cloud project
  2. Enable these APIs in Google Cloud Console:
     - **Maps JavaScript API** (Required)
     - **Maps Embed API** (Required)
     - **Places API** (Optional - for enhanced search)
     - **Geocoding API** (Optional - for address lookup)
     - **Maps Static API** (Optional - for terrain/hybrid views)
  3. Create credentials (API key)
  4. Add to Netlify environment variables as `GOOGLE_MAPS_API_KEY`

**Note**: Currently only 'roadmap' and 'satellite' map types work. To enable 'hybrid' and 'terrain' views, enable the **Maps Static API** in your Google Cloud Console.

#### 2. Amadeus API (RECOMMENDED)
- **Purpose**: Real-time flight prices, hotel availability
- **Get it**: [Amadeus for Developers](https://developers.amadeus.com/)
- **Cost**: Free tier (2,000 API calls/month)
- **Setup**:
  1. Create developer account
  2. Create new app
  3. Get Client ID and Client Secret
  4. Add to Netlify environment variables as:
     - `REACT_APP_AMADEUS_CLIENT_ID`
     - `REACT_APP_AMADEUS_CLIENT_SECRET`


## 🌐 Deployment (Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Add environment variables in Netlify (IMPORTANT!)**
   - Go to Site settings > Environment variables
   - Add these environment variables:
     - `GOOGLE_MAPS_API_KEY` = your_google_maps_api_key
     - `REACT_APP_AMADEUS_CLIENT_ID` = your_amadeus_client_id  
     - `REACT_APP_AMADEUS_CLIENT_SECRET` = your_amadeus_secret
   - Redeploy the site

## 📁 Local Development Environment Variables

For local development, create `.env.local` file in your project root:

```env
# Essential for maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Optional for booking features
REACT_APP_AMADEUS_CLIENT_ID=your_amadeus_client_id_here
REACT_APP_AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here
```

**Note**: Never commit `.env.local` to git - it's already in `.gitignore`

## 🔐 **IMPORTANT: API Key Security**

### **✅ DO (Secure):**
- Put API keys in Netlify environment variables
- Use server-side functions for sensitive keys
- Keep `.env.local` for local development only
- Never commit API keys to git

### **❌ DON'T (Insecure):**
- Put API keys directly in your code
- Commit `.env` files to git
- Share API keys in public repositories
- Use production keys in development

## 🎯 Features

### Core Features
- **Destination Discovery**: Explore 500+ curated destinations
- **Smart Filtering**: Filter by continent, budget, climate, activities
- **Wishlist Management**: Save and organize favorite destinations
- **Cross-Device Sync**: Sync your preferences across devices
- **Social Sharing**: Share discoveries on social media

### Booking Integration
- **Flight Search**: Real-time prices from multiple providers
- **Hotel Booking**: Compare rates across booking platforms
- **Activity Booking**: Tours and experiences with instant confirmation
- **Package Deals**: Complete vacation packages

### Technical Features
- **Responsive Design**: Works perfectly on all devices
- **Progressive Web App**: Install on mobile devices
- **Offline Support**: Basic functionality works offline
- **Performance Optimized**: Fast loading and smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Netlify
- **APIs**: Google Maps, Amadeus, Viator
- **State Management**: React Hooks + Local Storage

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔒 Privacy & Security

- **No personal data stored**: All data stays on your device
- **Encrypted sync**: Cross-device sync uses client-side encryption
- **Secure payments**: Industry-standard SSL encryption
- **API key protection**: Server-side API key management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

Having issues? Check these common solutions:

### Maps not loading?
- Verify your Google Maps API key is correct
- Check that Maps JavaScript API is enabled
- Ensure API key has proper restrictions

### Booking search not working?
- Verify Amadeus API credentials
- Check API quota limits
- Ensure environment variables are set correctly

### App not loading?
- Clear browser cache
- Check browser console for errors
- Verify all dependencies are installed

## 🎉 What's Next?

- [ ] User accounts and profiles
- [ ] Trip planning and itineraries
- [ ] Price alerts and notifications
- [ ] Group travel planning
- [ ] Travel blog integration

---

Made with ❤️ for travelers who love to explore the world 🌍