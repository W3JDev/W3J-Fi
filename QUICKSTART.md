# W3JDev United - Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Installation

### Option 1: Local Development (Recommended for Testing)

```bash
# Clone the repository
git clone https://github.com/W3JDev/W3J-Fi.git
cd W3J-Fi/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser 🎉

### Option 2: Docker (Easiest)

```bash
# Clone and start
git clone https://github.com/W3JDev/W3J-Fi.git
cd W3J-Fi
docker-compose up -d
```

Open http://localhost:5173 in your browser 🎉

### Option 3: Production Build

```bash
# Build for production
cd frontend
npm install
npm run build

# Serve the dist folder with any static server
npx serve dist
```

## 📚 First Steps

### 1. Try the 3D Lottery

1. Click **"3D Lottery"** on the home page
2. Click **"+ Add Prize"** and create a prize (e.g., "Grand Prize", 1 winner)
3. Click **"+ Add Participant"** or **"📁 Import Excel"**
4. Click **"🎰 Start Draw"** and watch the magic! ✨

### 2. Try the Name Picker

1. Click **"Name Picker"** on the home page
2. Type some names (press Enter after each)
3. Click **"🎯 Draw Name"**
4. Enjoy the slot machine animation! 🎰

### 3. Try Live Polls

1. Click **"Live Polls"** on the home page
2. Click **"+ New Poll"**
3. Enter a question and 2-5 options
4. Click **"Create Poll"**
5. Click **"View"** to see the poll
6. Vote and watch results update! 📊

## 🎨 Features

### 3D Lottery
- ✨ Beautiful 3D sphere animation
- 📊 Excel import/export
- 🏆 Multiple prize tiers
- 🎊 Confetti celebrations
- 🔊 Sound effects

### Name Picker
- 🎰 Slot machine animation
- 📝 Quick name input
- 📋 History tracking
- 🔊 Sound effects
- 📱 Mobile-friendly

### Live Polls
- 🗳️ Real-time voting
- 📺 OBS overlay support
- 📱 QR code display
- 📊 Live results
- ⏱️ Duration control

## 🎯 Common Tasks

### Import Excel for Lottery

1. Download template: Click **"📝 Download Template"**
2. Fill in the template with participant data
3. Import: Click **"📁 Import Excel"**
4. Done! Start drawing 🎉

**Excel Format:**
| Name | Department | Photo URL |
|------|------------|-----------|
| John Doe | Engineering | (optional) |

### Bulk Import Names for Picker

1. Click **"Bulk Import"**
2. Paste names (comma or line-separated):
   ```
   Alice
   Bob
   Charlie
   David
   ```
3. Click **"Import"**
4. Ready to draw! 🎲

### Create a Poll

1. Click **"+ New Poll"**
2. Fill in:
   - Title: "What should we eat?"
   - Option 1: "Pizza"
   - Option 2: "Burgers"
   - Option 3: "Tacos" (optional)
3. Set duration (e.g., 60 seconds)
4. Click **"Create Poll"**
5. Share the poll code! 📢

## ⚙️ Settings

Click the **⚙️** icon to access:
- 🔊 Sound toggle (on/off)
- 🎨 Theme selection (W3JDev, Light, Dark, Dracula)
- 🖥️ Fullscreen mode (Name Picker)

## 🆘 Troubleshooting

### Sound Not Working?
👉 Click anywhere on the page first (browser autoplay policy)

### 3D Sphere Not Rendering?
👉 Update your browser or try Chrome/Firefox

### Excel Import Failed?
👉 Check file format matches the template

### Poll Not Showing?
👉 Make sure poll is not saved as draft

## 📖 Learn More

- **Full User Guide:** [USER_GUIDE.md](USER_GUIDE.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Security Info:** [SECURITY.md](SECURITY.md)
- **Technical Spec:** [README.md](README.md)

## 🤝 Need Help?

- 💬 GitHub Issues: Report bugs
- 📚 Documentation: Check guides above
- 💡 Examples: See sample data in app

## 🎉 You're Ready!

Start using W3JDev United for your events, streams, and activities!

**Tips:**
- 🎯 Use Name Picker for quick selections
- 🎰 Use 3D Lottery for formal events
- 📊 Use Live Polls for audience engagement

---

Built with ❤️ by W3JDev
