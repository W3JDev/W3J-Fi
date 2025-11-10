# W3JDev United - User Guide

Welcome to W3JDev United! This guide will help you get started with all three modules: 3D Lottery, Name Picker, and Live Polls.

## Table of Contents
1. [Getting Started](#getting-started)
2. [3D Lottery Module](#3d-lottery-module)
3. [Name Picker Module](#name-picker-module)
4. [Live Polls Module](#live-polls-module)
5. [Tips & Tricks](#tips--tricks)
6. [FAQ](#faq)

---

## Getting Started

### Accessing the Application
1. Open your web browser
2. Navigate to the application URL (e.g., `http://localhost:5173` for local development)
3. You'll see the home page with three module options

### Choosing a Module
- **3D Lottery:** Best for formal events with multiple prize tiers and large participant lists
- **Name Picker:** Quick and simple random selection for classrooms or small groups
- **Live Polls:** Real-time audience engagement for streamers and presenters

---

## 3D Lottery Module

### Overview
The 3D Lottery module provides a professional lottery experience with a stunning 3D sphere animation, Excel integration, and comprehensive prize management.

### Quick Start

1. **Click "Launch Lottery"** from the home page

2. **Add Prizes:**
   - Click "+ Add Prize" button
   - Enter prize name (e.g., "Grand Prize")
   - Set number of winners
   - Optionally add description and image URL
   - Click "Add"

3. **Add Participants:**
   
   **Option A - Manual Entry:**
   - Click "+ Add Participant"
   - Enter name and optional department
   - Click "Add"
   
   **Option B - Excel Import:**
   - Click "📁 Import Excel"
   - Select your Excel file (.xlsx or .xls)
   - File should have columns: Name, Department, Photo URL
   - Click "Download Template" for a sample format

4. **Start Drawing:**
   - Click "🎰 Start Draw"
   - Watch the 3D sphere animation
   - Winner will be announced with confetti!

### Excel Format

Your Excel file should have these columns:
- **Name** (required): Participant's full name
- **Department** (optional): Department or group
- **Photo URL** (optional): Link to avatar image

Example:
| Name | Department | Photo URL |
|------|------------|-----------|
| John Doe | Engineering | https://example.com/john.jpg |
| Jane Smith | Marketing | https://example.com/jane.jpg |

### Features

#### Prize Management
- **Multiple Prizes:** Add unlimited prize tiers
- **Winner Count:** Set how many winners per prize
- **Prize Images:** Show prize photos during announcement
- **Prize Order:** Prizes are drawn in sequence

#### Drawing Process
- **3D Animation:** Names rotate on a 3D sphere
- **Sound Effects:** Spinning drum and victory sounds
- **Confetti:** Celebration animation for winners
- **Winner History:** Track all winners automatically

#### Export Options
- **Export Participants:** Download full participant list
- **Export Winners:** Download list of all winners with prizes
- **Template:** Download blank template for imports

### Best Practices

1. **Before the Event:**
   - Import your participant list early
   - Set up all prizes in advance
   - Test the drawing once with sample data
   - Enable fullscreen mode for better viewing

2. **During the Event:**
   - Connect laptop to projector
   - Enable sound for better experience
   - Draw prizes from highest to lowest tier
   - Take screenshots of each winner

3. **After the Event:**
   - Export winner list immediately
   - Keep backup in local storage
   - Clear data before next event

---

## Name Picker Module

### Overview
A simple, quick random name selector with slot machine animation. Perfect for classrooms, team meetings, and casual selections.

### Quick Start

1. **Click "Launch Picker"** from the home page

2. **Add Names:**
   - Type a name in the input field
   - Press Enter or click "Add"
   - Repeat for all names

3. **Or Import Bulk:**
   - Click "Bulk Import"
   - Enter names separated by commas or new lines
   - Click "Import"

4. **Draw Winner:**
   - Click "🎯 Draw Name"
   - Watch the slot machine animation
   - Winner displayed with sound effect!

### Features

#### Name Management
- **Quick Add:** Type and press Enter
- **Bulk Import:** Paste multiple names at once
- **Easy Remove:** Delete individual names
- **Clear All:** Start fresh anytime

#### Drawing Options
- **Remove Winner:** Automatically remove drawn names from list
- **Keep Winner:** Keep names in pool for multiple draws
- **History:** View all previous draws
- **Sound Toggle:** Enable/disable sound effects

#### History Tracking
- Automatically records every draw
- Shows timestamp of each selection
- Displays number of names in pool
- Clear history anytime

### Use Cases

- **Classroom:** Select student for presentation
- **Team Meeting:** Choose person for task
- **Raffle:** Pick door prize winner
- **Games:** Random player selection

### Best Practices

1. **For Classroom Use:**
   - Import student roster at start of semester
   - Enable "Remove Winner" to avoid repeats
   - Use fullscreen mode during selection

2. **For Events:**
   - Disable "Remove Winner" if same person can win multiple times
   - Keep sound enabled for excitement
   - Review history to ensure fairness

---

## Live Polls Module

### Overview
Create real-time polls for audience engagement. Perfect for streamers, presenters, and live events. Includes OBS overlay support.

### Quick Start

1. **Click "Launch Polls"** from the home page

2. **Create a Poll:**
   - Click "+ New Poll"
   - Enter poll title (e.g., "What game should we play?")
   - Add 2-5 options
   - Set duration (30s to 1 hour)
   - Click "Create Poll"

3. **Share Poll:**
   - Copy the poll code or URL
   - Share with audience
   - Voters visit the URL to cast votes

4. **View Results:**
   - Click "View" on the poll card
   - Watch votes come in real-time
   - See results with charts

### Poll Creation

#### Required Fields
- **Title:** Question to ask audience
- **Option 1 & 2:** Minimum 2 choices required

#### Optional Fields
- **Options 3-5:** Add up to 5 total choices
- **Duration:** How long poll stays open
- **Save as Draft:** Create without publishing

#### Duration Presets
- 30 seconds: Quick decisions
- 60 seconds: Standard polls
- 2 minutes: Detailed questions
- 5 minutes: Complex topics
- Custom: Enter your own time

### Voting Process

1. **Access Poll:**
   - Go to poll URL or enter code
   - Poll details displayed

2. **Cast Vote:**
   - Select your choice
   - Click "Submit Vote"
   - See results immediately

3. **View Results:**
   - See live vote counts
   - View percentages
   - Winner highlighted

### OBS Integration

#### Setup
1. In OBS, add "Browser Source"
2. URL: `http://your-domain/obs`
3. Width: 1920, Height: 1080
4. The overlay will show active polls automatically

#### QR Code Display
1. Add another "Browser Source"
2. URL: `http://your-domain/obs/qr`
3. Shows QR code for easy mobile voting

### Features

#### Local Demo Mode
- Polls stored in browser
- No backend required
- Perfect for testing
- Data persists in localStorage

#### Production Mode (Future)
- Real-time updates via SSE
- Server-side vote storage
- Anti-cheat mechanisms
- Rate limiting

### Best Practices

1. **For Streamers:**
   - Create polls during breaks
   - Use 60-90 second duration
   - Display results on stream
   - Announce winner verbally

2. **For Presentations:**
   - Create polls before event
   - Save as draft until needed
   - Share QR code for easy voting
   - Show results on big screen

3. **For Events:**
   - Test poll before live
   - Have backup plan for tech issues
   - Keep polls simple and clear
   - Announce results promptly

---

## Tips & Tricks

### General

1. **Sound Effects:**
   - Click anywhere first to enable sounds (browser policy)
   - Use headphones to test volume
   - Disable if in quiet environment

2. **Fullscreen Mode:**
   - Press F11 for full browser fullscreen
   - Click fullscreen button in Name Picker
   - Great for projection

3. **Theme Switching:**
   - Click settings icon (⚙️)
   - Choose from 4 themes:
     - W3JDev (default custom theme)
     - Light (bright mode)
     - Dark (dark mode)
     - Dracula (purple theme)

### Data Management

1. **Local Storage:**
   - Data saved automatically
   - Persists between sessions
   - Clear browser data to reset

2. **Export Regularly:**
   - Export winner lists after events
   - Keep backups of important data
   - Use exported files for records

3. **Import Best Practices:**
   - Use template format for Excel
   - Check file before importing
   - Test with small sample first

### Performance

1. **3D Lottery:**
   - Close other browser tabs
   - Use modern browser (Chrome/Firefox)
   - Update graphics drivers if slow

2. **Name Picker:**
   - Works great with 100+ names
   - Smooth on most devices
   - Mobile-friendly

3. **Live Polls:**
   - Share direct links for speed
   - Monitor vote counts
   - Refresh if numbers freeze

---

## FAQ

### 3D Lottery

**Q: Can I edit a participant after adding?**
A: Currently, you need to remove and re-add. Editing is planned for future updates.

**Q: What's the maximum number of participants?**
A: No hard limit, but performance is best with under 500 participants on the sphere at once.

**Q: Can I have multiple people win the same prize?**
A: Yes! Set the "Number of Winners" when creating the prize.

**Q: Excel import failed. Why?**
A: Check that your file matches the template format. Required column: Name. Optional: Department, Photo URL.

### Name Picker

**Q: Can I use this offline?**
A: Yes! All data is stored locally in your browser.

**Q: Names are repeating. Why?**
A: Disable "Remove winner from list" option if you want names to stay in the pool.

**Q: Can I save my name list?**
A: Yes, data persists in browser. For permanent backup, write down or screenshot.

### Live Polls

**Q: Do I need a backend server?**
A: No for local demos. Yes for production with real-time multi-device voting.

**Q: Can I edit a poll after creating?**
A: Currently no. You'll need to create a new poll.

**Q: How do I prevent cheating?**
A: In demo mode, one vote per browser. Production mode adds IP tracking and rate limiting.

**Q: Poll expired but I need more time?**
A: Create a new poll with the same question and extended duration.

### General

**Q: Is my data secure?**
A: Data is stored locally in your browser. No data is sent to external servers in local mode.

**Q: Can I use this commercially?**
A: Yes! The application is MIT licensed.

**Q: Mobile support?**
A: Yes! All modules work on mobile, though 3D Lottery is best on desktop.

**Q: Can I customize the theme?**
A: Yes! Modify the Tailwind configuration in the source code.

---

## Getting Help

- **Documentation:** Check README.md for technical details
- **Issues:** Report bugs on GitHub Issues
- **Questions:** Contact through GitHub Discussions

---

## Credits

W3JDev United is inspired by:
- [log-lottery](https://github.com/LOG1997/log-lottery) - 3D lottery concept
- [random-name-picker](https://github.com/icelam/random-name-picker) - Slot machine animation
- [OpenStreamPoll](https://github.com/yoanbernabeu/OpenStreamPoll) - Poll functionality

Built with ❤️ by W3JDev
