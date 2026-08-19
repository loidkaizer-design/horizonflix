# HorizonFlix Stream

# HorizonFlix Streaming App - Development Plan




## 📋 Project Overview

Build a premium streaming platform (HorizonFlix) with ticket-based access, TMDB integration, and dual movie endpoints with fallback support.




---




## 🎯 Core Architecture




### 1. **Authentication & Access Control**

- **Ticket Validation System**

  - Validation endpoint: `https://tixy-ecru.vercel.app/api/ticket/{ticket}`

  - Ticket stored in localStorage after validation

  - Redirect to ticket validation page if not authenticated

  - Persistent session across pages




### 2. **API Integration**

- **Primary**: TMDB API with provided keys

  - Movie search & browsing

  - Cast information

  - Movie metadata (genres, ratings, release dates, posters)

  

- **Fallback**: 111movies.net endpoints

  - Movie playback: `/movie/{id}`

  - TV episodes: `/tv/{id}/{season}/{episode}`

  - IMDB ID (with `tt` prefix) or TMDB ID support




- **Backup**: FreeKey JS (if TMDB fails)




### 3. **Data Flow**

```

User → Ticket Validation → Home Page → Browse/Search

     ↓

     Movie Details (Overview) → Watch Page (111movies endpoint)

     ↓

     Cast Details → Actor's Filmography

```




---




## 🏗️ Component Structure




### **Pages**




| Page | Route | Function |

|------|-------|----------|

| Ticket Validation | `/` | Verify access ticket |

| Home | `/home` | Browse categories & trending |

| Movie Overview | `/movie/:id` | Details, cast, posters, synopsis |

| Watch | `/watch/:id` | Video player + top 10 sidebar |

| Cast Profile | `/cast/:castName` | Actor's filmography |




### **Key Components**

- `TicketValidator` - Validates & stores ticket

- `MovieCard` - Reusable movie display

- `VideoPlayer` - Embedded 111movies iframe/player

- `Sidebar` - Top 10 recommendations

- `CastGrid` - Actor/actress list

- `Navigation` - Header with logo & menu

- `SearchBar` - Global search functionality




---




## 🎨 UI/UX Design




### **Design System** (HorizonFlix Style)

- **Logo**: HorizonFlix branding

- **Color Scheme**: Dark theme (Netflix-like)

  - Primary: Deep dark blue/black

  - Accent: Gold/orange (streaming highlight)

  - Text: White/light gray

- **Typography**: Modern, bold for titles

- **Branding**: Fantomistic badge/attribution




### **Pages Breakdown**




#### 1. **Ticket Validation Page**

```

┌─────────────────────────────┐

│      HorizonFlix Logo       │

│   Powered by Fantomistic    │

├─────────────────────────────┤

│  Enter Your Access Ticket   │

│  ┌───────────────────────┐  │

│  │ [Text Input Box]      │  │

│  └───────────────────────┘  │

│  [Validate Button]          │

│  Loading state + error msgs │

└─────────────────────────────┘

```




#### 2. **Home Page**

```

┌──────────────────────────────────────┐

│ [Logo] Home | Search | Profile       │

├──────────────────────────────────────┤

│ Trending Now (Carousel)              │

│ [Movie] [Movie] [Movie]              │

├──────────────────────────────────────┤

│ Action Movies                        │

│ [Card] [Card] [Card] [Card]          │

├──────────────────────────────────────┤

│ Comedy Movies                        │

│ [Card] [Card] [Card] [Card]          │

└──────────────────────────────────────┘

```




#### 3. **Movie Overview Page**

```

┌─────────────────────────────────┐

│ [Back] [Logo]                   │

├─────────────────────────────────┤

│ [Poster]  Movie Title           │

│           Rating ⭐ | Year      │

│           Genre | Duration      │

│           Synopsis text...      │

│           [Watch Now] Button    │

├─────────────────────────────────┤

│ Cast                            │

│ [Actor] [Actor] [Actor]         │

├─────────────────────────────────┤

│ More Posters Gallery            │

│ [Image] [Image] [Image]         │

└─────────────────────────────────┘

```




#### 4. **Watch Page** (Like YouTube)

```

┌──────────────────────────────────────┐

│ [Logo] [Search]                      │

├─────────────────┬────────────────────┤

│                 │ Top 10 Sidebar     │

│                 │ ┌──────────────┐   │

│  Main Video     │ │ 1. [Movie]   │   │

│  Player         │ │    Rating    │   │

│  (111movies)    │ │ 2. [Movie]   │   │

│                 │ │    Rating    │   │

│                 │ │ 3. [Movie]   │   │

│                 │ │    Rating    │   │

│                 │ │   ... (10)   │   │

│                 │ └──────────────┘   │

├─────────────────┼────────────────────┤

│ Title           │ Similar Movies     │

│ Rating | Desc   │ [Card] [Card]      │

│ Cast info       │                    │

└─────────────────┴────────────────────┘

```




#### 5. **Cast Profile Page**

```

┌──────────────────────────────┐

│ [Back] [Logo]                │

├──────────────────────────────┤

│ [Profile Image] Name         │

│ Biography text...            │

│ Known For: X movies          │

├──────────────────────────────┤

│ Filmography                  │

│ [Movie] [Movie] [Movie]      │

│ [Movie] [Movie] [Movie]      │

└──────────────────────────────┘

```




---




## 🔧 Technical Stack




### **Frontend**

- **Framework**: React 18+ (Hooks)

- **Routing**: React Router v6

- **State Management**: Context API + useState/useReducer

- **Styling**: Tailwind CSS

- **HTTP Client**: Fetch API (or Axios)




### **Features to Implement**

1. ✅ Ticket validation & persistent auth

2. ✅ TMDB API integration (search, details, cast)

3. ✅ 111movies endpoint embedding

4. ✅ Responsive grid layouts

5. ✅ Search functionality

6. ✅ Category filtering

7. ✅ Error handling & fallbacks

8. ✅ Loading states

9. ✅ Movie/Cast linking

10. ✅ Fantomistic attribution




---




## 📡 API Integration Flow




### **On App Load**

```

1. Check localStorage for ticket

2. If no ticket → Show validation page

3. If ticket exists → Validate via API

4. If valid → Load home page with TMDB data

5. If invalid → Show validation page again

```




### **When Fetching Movies**

```

1. Try TMDB API (primary)

   ├─ Get: trending, search, details, cast

   └─ Success → Display

2. If TMDB fails → Use FreeKey JS (backup)

3. For playback → 111movies endpoint

   ├─ Convert TMDB ID to IMDB ID if needed

   └─ Embed player

```




---




## ⚙️ Configuration




### **Keys Provided**

```javascript

TMDB_KEY = "e55425032d3d0f371fc776f302e7c09b"

IMDB_KEY = "ad04b643"  // Backup for ID conversion

```




### **API Endpoints**

- TMDB: `https://api.themoviedb.org/3/`

- Movie Player: `https://111movies.net/movie/{id}`

- TV Player: `https://111movies.net/tv/{id}/{season}/{episode}`

- Ticket API: `https://tixy-ecru.vercel.app/api/ticket/{ticket}`




---




## 📱 Responsive Design

- **Mobile**: Full-width stacked layout

- **Tablet**: 2-3 column grids

- **Desktop**: 4-5 column grids + sidebar




---




## 🚀 Implementation Phases




### **Phase 1: Foundation**

- [ ] Setup React app + routing

- [ ] Build ticket validation system

- [ ] Create layout/navigation




### **Phase 2: Data Integration**

- [ ] TMDB API integration

- [ ] Movie search & browsing

- [ ] Cast data fetching




### **Phase 3: Core Pages**

- [ ] Home page with categories

- [ ] Movie overview page

- [ ] Watch page with player




### **Phase 4: Polish**

- [ ] Cast profile page

- [ ] Error handling & fallbacks

- [ ] Responsive design

- [ ] Performance optimization




---




## ⚠️ Error Handling Strategy

- TMDB fails → Use FreeKey JS

- 111movies endpoint fails → Show error + retry

- Invalid ticket → Redirect to validation

- Network error → Show cached data or fallback




---




**Ready to proceed with implementation?** I'll create the full React application with all components, styling, and API integration.Add the actual logo and add style the site with the logo and Alot of Smooth animations, lots of transitions and etc.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://horizonflix.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aaf8abb7-e0a6-4cb0-9e81-b026d6792342).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
