# UMN RPG Adventure Life

A React-based RPG adventure game where players manage their character's daily life, explore locations, and perform various activities to maintain their stats and progress through the game.

## 👥 Group Members

- Dhannya Sassirika (173640)
- Marchel Raikonnen (114880)
- Matthew Christian (111296)
- Milano Bonaventura Pandey (112683)

**Course**: IF 352

**Institution**: Universitas Multimedia Nusantara (UMN)

## 🎮 Game Features

### Character System

- **6 Character Classes**: Hero, Princess, Mage, Captain, Warrior, Barbarian
- **Customizable Avatar**: Choose from different character sprites with directional animations
- **Player Naming**: Personalize your character with a custom name

### Location-Based Gameplay

Explore 5 different locations on the outdoor map:

- **🏠 Home**: Rest, eat, bathe, and relax
- **🏰 The Dungeon**: Fight monsters and loot treasures
- **⛏️ The Mine**: Clean tools, mine ores, and sell resources
- **🍜 The Ramen Shop**: Eat ramen, chat with owner, and work part-time
- **🏥 The Hospital**: Get checkups, rest, and donate blood

### Activity System

Each location offers unique activities that affect your character's stats:

- **Home Activities**: Use Bath, Sleep, Eat Meal, Relax
- **Mine Activities**: Clean Tools, Mine Ores, Sell Ores, Rest
- **Dungeon Activities**: Fight Monsters, Loot Items, Explore
- **Ramen Activities**: Eat Ramen, Chat With Owner, Part-Time Work
- **Hospital Activities**: Checkup, Donate Blood, Rest

### Activity List

Each location has an Activity List that displays and highlights areas
where each activity can be done at that location.

### Status Management

Monitor and maintain 5 core stats:

- 🍜 **Meal** (0-100): Hunger level
- 😴 **Sleep** (0-100): Energy level
- 🧼 **Hygiene** (0-100): Cleanliness level
- 😊 **Happiness** (0-100): Mood level
- 💰 **Money**: Currency for purchases and activities

### Inventory System

- Collect items from random drops on the map
- Use items to restore stats (coconut, herb, bandage, apple, bread, water, medicine)
- Special items like bandages and ores have unique uses

### Time & Progression

- **Real-time Clock**: Game time advances every second
- **Day/Night Cycle**: Different greetings based on time of day
- **Activity Tracking**: Count completed activities for scoring
- **Life Score**: Final score based on stats, activities, items, and visited areas

### Save System

- **Firebase Integration**: Automatic progress saving
- **Cross-device Sync**: Resume gameplay on any device
- **Persistent Data**: Character, position, stats, and inventory saved

## 🎯 How to Play

1. **Start Game**: Choose your character avatar and enter your name
2. **Navigate**: Use arrow keys or on-screen controls to move around
3. **Explore Locations**: Walk into location markers to enter buildings
4. **Perform Activities**: Position your character over highlighted areas to activate activities
5. **Manage Stats**: Keep all stats above 0 to avoid game over
6. **Collect Items**: Pick up random drops on the outdoor map
7. **Progress**: Complete activities and explore to increase your life score

## 📱 Controls

- **Movement**: Arrow keys or on-screen directional buttons
- **Activities**: Position character over highlighted areas
- **Inventory**: Click inventory button to manage items
- **Activities List**: View available activities in each location

## 🏆 Scoring System

Final life score is calculated based on:

- **Stat Balance** (400 max): Average of all stats
- **Activities Performed**: 10 points per activity
- **Items Collected**: 2 points per item
- **Items Used**: 5 points per item
- **Areas Visited**: 20 points per area (5 max)
