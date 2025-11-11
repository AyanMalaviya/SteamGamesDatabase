const router = require('express').Router();
const Game = require('../models/game.model');

// GET /api/games - Get all games with advanced filtering and sorting
// GET /api/games - Get all games with advanced filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { 
        sortBy = 'name', 
        order = 'asc', 
        page = 1, 
        limit = 20,
        searchField = 'name',
        searchTerm = '',
        showOnlyFavorites = 'false'
    } = req.query;

    // Build filter object
    let filter = {};
    
    // Filter by favorites if requested
    if (showOnlyFavorites === 'true') {
        filter.isFavorite = true;
    }
    
    // List of fields that are arrays
    const arrayFields = ['genres', 'categories', 'tags', 'developers', 'publishers', 
                         'supported_languages', 'full_audio_languages'];
    
    // Column-specific search (SIMPLIFIED after data cleanup)
    if (searchTerm && searchField) {
      if (arrayFields.includes(searchField)) {
        // For array fields: search within array elements
        filter[searchField] = { $elemMatch: { $regex: searchTerm, $options: 'i' } };
      } else {
        // For string/number fields: direct regex search
        filter[searchField] = { $regex: searchTerm, $options: 'i' };
      }
    }

    // Build sort object
    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };
    
    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch data and total count
    const games = await Game.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total_results = await Game.countDocuments(filter);

    res.json({
        page: parseInt(page),
        limit: parseInt(limit),
        total_results,
        total_pages: Math.ceil(total_results / limit),
        data: games
    });

  } catch (err) {
    console.error('Error in GET /api/games:', err);
    res.status(500).json({ message: err.message });
  }
});



// DELETE /api/games/:id - Delete a game by its MongoDB _id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Add logging to see what's happening
        console.log('Delete request received for ID:', id);
        
        const deletedGame = await Game.findByIdAndDelete(id);
        
        if (!deletedGame) {
            console.log('Game not found with ID:', id);
            return res.status(404).json({ message: "Game not found" });
        }
        
        console.log('Game deleted successfully:', deletedGame.name);
        res.json({ message: "Game deleted successfully", deletedGame });
    } catch (err) {
        console.error('Error deleting game:', err);
        res.status(400).json({ message: err.message });
    }
});


router.patch('/:id/favorite', async (req, res) => {
    try {
        const { id } = req.params;
        const game = await Game.findById(id);
        
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        
        // Toggle the isFavorite field
        game.isFavorite = !game.isFavorite;
        await game.save();
        
        res.json(game);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
