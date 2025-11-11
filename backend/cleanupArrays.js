const mongoose = require('mongoose');
const Game = require('./models/game.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Fields that should be arrays
const arrayFields = [
    'genres', 
    'categories', 
    'tags', 
    'developers', 
    'publishers',
    'supported_languages', 
    'full_audio_languages',
    'screenshots',
    'movies',
    'packages'
];

// Function to convert string-array to real array
const parseStringArray = (value) => {
    if (!value) return [];
    
    // If it's already an array, return it
    if (Array.isArray(value)) {
        return value;
    }
    
    // If it's a string that looks like an array
    if (typeof value === 'string' && value.trim().startsWith('[') && value.trim().endsWith(']')) {
        try {
            // Try JSON parsing (convert single quotes to double)
            const parsed = JSON.parse(value.replace(/'/g, '"'));
            return Array.isArray(parsed) ? parsed : [value];
        } catch (e) {
            // Manual parsing as fallback
            const content = value.trim().slice(1, -1); // Remove [ and ]
            if (!content) return [];
            
            const items = [];
            let current = '';
            let inQuote = false;
            let quoteChar = null;
            
            for (let i = 0; i < content.length; i++) {
                const char = content[i];
                
                if ((char === '"' || char === "'") && !inQuote) {
                    inQuote = true;
                    quoteChar = char;
                } else if (char === quoteChar && inQuote) {
                    inQuote = false;
                    quoteChar = null;
                } else if (char === ',' && !inQuote) {
                    const trimmed = current.trim();
                    if (trimmed) items.push(trimmed);
                    current = '';
                    continue;
                } else if (!inQuote || (inQuote && char !== quoteChar)) {
                    current += char;
                }
            }
            
            const trimmed = current.trim();
            if (trimmed) items.push(trimmed);
            
            return items;
        }
    }
    
    // If it's a regular string, return it as a single-item array
    return [value];
};

// Main migration function
async function cleanupArrayFields() {
    try {
        console.log('🔄 Starting data cleanup...');
        
        // Get all games
        const games = await Game.find({});
        console.log(`📊 Found ${games.length} games to process`);
        
        let updatedCount = 0;
        
        for (const game of games) {
            let needsUpdate = false;
            const updates = {};
            
            // Check each array field
            for (const field of arrayFields) {
                const value = game[field];
                
                // If it's a string that looks like an array, parse it
                if (typeof value === 'string' && value.trim().startsWith('[')) {
                    const parsed = parseStringArray(value);
                    updates[field] = parsed;
                    needsUpdate = true;
                    console.log(`  ✓ Converting ${field} for game: ${game.name}`);
                }
            }
            
            // Update the game if needed
            if (needsUpdate) {
                await Game.findByIdAndUpdate(game._id, updates);
                updatedCount++;
            }
        }
        
        console.log(`\n✅ Cleanup complete!`);
        console.log(`   Updated ${updatedCount} games`);
        console.log(`   ${games.length - updatedCount} games were already clean`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        mongoose.connection.close();
    }
}

// Run the migration
cleanupArrayFields();
