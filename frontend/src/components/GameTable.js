import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GameForm from './GameForm';

// --- Constants ---
const LOCKED_COLUMN = 'name';
const ALL_COLUMNS = {
    name: 'Name',
    platforms: 'Platforms',
    price: 'Price',
    release_date: 'Release Date',
    required_age: 'Required Age',
    dlc_count: 'DLCs',
    metacritic_score: 'Metacritic',
    user_score: 'User Score',
    positive: 'Positive Reviews',
    negative: 'Negative Reviews',
    achievements: 'Achievements',
    recommendations: 'Recommendations',
    estimated_owners: 'Est. Owners',
    average_playtime_forever: 'Avg. Playtime',
    peak_ccu: 'Peak CCU',
    developers: 'Developers',
    publishers: 'Publishers',
    genres: 'Genres',
    categories: 'Categories',
    tags: 'Tags',
    supported_languages: 'Languages',
    actions: 'Actions'
};
const TOGGLEABLE_COLUMNS = Object.keys(ALL_COLUMNS).filter(key => key !== LOCKED_COLUMN);

// Searchable columns (excluding actions and platforms which are computed)
const SEARCHABLE_COLUMNS = Object.keys(ALL_COLUMNS).filter(key => 
    key !== 'actions' && key !== 'platforms'
);

// --- Delete Confirmation Modal Component ---
const DeleteConfirmModal = ({ game, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md border-2 border-red-600">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl">⚠️</span>
                    <h2 className="text-2xl font-bold text-red-500">Delete Game?</h2>
                </div>
                <p className="text-gray-300 mb-6">
                    Are you sure you want to permanently delete <span className="font-bold text-white">"{game.name}"</span>?
                    <br/><br/>
                    <span className="text-red-400 font-semibold">This action cannot be undone.</span>
                </p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="py-2 px-6 bg-gray-600 rounded-lg hover:bg-gray-500 font-semibold">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="py-2 px-6 bg-red-600 rounded-lg hover:bg-red-700 font-semibold shadow-lg">
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const GameTable = () => {
    // --- State Management ---
    const [games, setGames] = useState([]);
    const [pagination, setPagination] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [gameToDelete, setGameToDelete] = useState(null);
    
    // Search state
    const [searchField, setSearchField] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');

    // --- Data Fetching (wrapped in useCallback) ---
    const fetchGames = useCallback(async () => {
        try {
            const params = { 
                sortBy: sortConfig.key, 
                order: sortConfig.direction, 
                page: currentPage,
                searchField,
                searchTerm,
                showOnlyFavorites: showOnlyFavorites.toString()
            };
            const { data } = await axios.get('http://localhost:5000/api/games', { params });
            setGames(data.data);
            setPagination({ totalPages: data.total_pages, totalResults: data.total_results });
        } catch (error) { 
            console.error("Error fetching games:", error); 
        }
    }, [sortConfig, currentPage, searchField, searchTerm, showOnlyFavorites]);

    useEffect(() => {
        const debounceFetch = setTimeout(fetchGames, 300); // 300ms debounce for real-time feel
        return () => clearTimeout(debounceFetch);
    }, [fetchGames]);
    
    // --- Event & CRUD Handlers ---
    const handleSort = (key) => setSortConfig(prev => ({ key, direction: (prev.key === key && prev.direction === 'asc') ? 'desc' : 'asc' }));
    
    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleSearchFieldChange = (e) => {
        setSearchField(e.target.value);
        setSearchTerm(''); // Clear search term when changing field
        setCurrentPage(1);
    };

    const toggleColumn = (col) => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    
    const handleSave = async (gameData) => {
        try {
            const url = editingGame ? `http://localhost:5000/api/games/${editingGame._id}` : 'http://localhost:5000/api/games';
            await axios[editingGame ? 'put' : 'post'](url, gameData);
            setIsFormOpen(false);
            setEditingGame(null);
            fetchGames();
        } catch (error) { console.error("Error saving game:", error); }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/games/${gameToDelete._id}`);
            setGameToDelete(null);
            fetchGames();
        } catch (error) { 
            console.error("Error deleting game:", error);
            alert("Failed to delete game. Please try again.");
        }
    };

    const toggleFavorite = async (gameId) => {
        try {
            await axios.patch(`http://localhost:5000/api/games/${gameId}/favorite`);
            fetchGames();
        } catch (error) { console.error("Error toggling favorite:", error); }
    };

    const openForm = (game = null) => {
        setEditingGame(game);
        setIsFormOpen(true);
    };

    // --- Cell Rendering ---
    const renderCell = (game, columnKey) => {
        const value = game[columnKey];
        
        // Universal array formatter - handles any stringified array format
        const formatValue = (val) => {
            if (!val && val !== 0) return 'N/A';
            
            // If it's already a proper array
            if (Array.isArray(val)) {
                return val.filter(item => item != null).join(', ') || 'N/A';
            }
            
            // If it's a string that looks like an array
            if (typeof val === 'string' && val.trim().startsWith('[') && val.trim().endsWith(']')) {
                try {
                    // Try JSON parse first (convert single quotes to double)
                    const jsonString = val.replace(/'/g, '"');
                    const parsed = JSON.parse(jsonString);
                    if (Array.isArray(parsed)) {
                        return parsed.filter(item => item != null).join(', ') || 'N/A';
                    }
                } catch (e) {
                    // Fallback: manual string parsing
                    const content = val.trim().slice(1, -1); // Remove brackets
                    if (!content) return 'N/A';
                    
                    const items = [];
                    let current = '';
                    let inQuote = false;
                    let quoteChar = null;
                    
                    for (let i = 0; i < content.length; i++) {
                        const char = content[i];
                        const nextChar = content[i + 1];
                        
                        // Handle quote start/end
                        if ((char === '"' || char === "'") && (i === 0 || content[i-1] !== '\\')) {
                            if (!inQuote) {
                                inQuote = true;
                                quoteChar = char;
                            } else if (char === quoteChar) {
                                inQuote = false;
                                quoteChar = null;
                            }
                            continue;
                        }
                        
                        // Handle comma separator
                        if (char === ',' && !inQuote) {
                            const trimmed = current.trim();
                            if (trimmed) items.push(trimmed);
                            current = '';
                            // Skip space after comma
                            if (nextChar === ' ') i++;
                            continue;
                        }
                        
                        current += char;
                    }
                    
                    // Add last item
                    const trimmed = current.trim();
                    if (trimmed) items.push(trimmed);
                    
                    return items.length > 0 ? items.join(', ') : val.slice(1, -1);
                }
            }
            
            // Return as string for everything else
            return String(val);
        };
        
        // Special rendering for specific columns
        switch(columnKey) {
            case 'name':
                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => toggleFavorite(game._id)} 
                            className="text-2xl hover:scale-125 transform transition-transform duration-200"
                            title={game.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            {game.isFavorite ? '⭐' : '☆'}
                        </button>
                        <span className="font-semibold">{formatValue(value)}</span>
                    </div>
                );
                
            case 'platforms':
                const platforms = [
                    game.windows && 'Windows',
                    game.mac && 'Mac',
                    game.linux && 'Linux'
                ].filter(Boolean);
                return platforms.length > 0 ? platforms.join(' | ') : 'N/A';
                
            case 'release_date':
                return value ? new Date(value).toLocaleDateString() : 'N/A';
                
            case 'price':
                return value !== null && value !== undefined ? `$${value}` : 'N/A';
                
            case 'windows':
            case 'mac':
            case 'linux':
                return value ? '✓' : '✗';
                
            case 'actions':
                return (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => openForm(game)} 
                            className="py-1 px-3 bg-indigo-600 rounded hover:bg-indigo-700 font-semibold text-sm"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => setGameToDelete(game)} 
                            className="py-1 px-3 bg-red-600 rounded hover:bg-red-700 font-semibold text-sm shadow-lg hover:shadow-red-500/50 transition-all"
                        >
                            Delete
                        </button>
                    </div>
                );
                
            // For ALL other fields, use the universal formatter
            default:
                return formatValue(value);
        }
    };

    
    const orderedVisibleColumns = TOGGLEABLE_COLUMNS.filter(key => visibleColumns.includes(key));

    // --- JSX ---
    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                    Steam Games Database
                </h1>
                <button onClick={() => openForm()} className="py-2 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200 font-bold">
                    Add New Game
                </button>
            </div>
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg">Select Columns to Display:</h3>
                    
                    {/* Favorites Filter Checkbox */}
                    <label className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-600 rounded-lg cursor-pointer hover:scale-105 transition-transform">
                        <input 
                            type="checkbox" 
                            checked={showOnlyFavorites} 
                            onChange={(e) => {
                                setShowOnlyFavorites(e.target.checked);
                                setCurrentPage(1); // Reset to first page
                            }}
                            className="form-checkbox h-6 w-6 text-yellow-500 bg-gray-700 border-yellow-600 rounded focus:ring-yellow-500"
                        />
                        <span className="font-bold text-yellow-400 flex items-center gap-2">
                            ⭐ Show Only Favorites
                        </span>
                    </label>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-6 gap-y-3">
                    {TOGGLEABLE_COLUMNS.map(key => (
                        <label key={key} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={visibleColumns.includes(key)} onChange={() => toggleColumn(key)} className="form-checkbox h-5 w-5 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-offset-gray-800"/>
                            <span>{ALL_COLUMNS[key]}</span>
                        </label>
                    ))}
                </div>
                
                {/* Optional: Show status message when filtering */}
                {showOnlyFavorites && (
                    <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600 rounded text-yellow-300 text-sm">
                        🔍 Filtering to show only favorite games ({pagination.totalResults || 0} found)
                    </div>
                )}
            </div>


            {/* Modals */}
            {isFormOpen && <GameForm game={editingGame} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
            {gameToDelete && <DeleteConfirmModal game={gameToDelete} onConfirm={confirmDelete} onCancel={() => setGameToDelete(null)} />}

            {/* Enhanced Search Section */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-700">
                <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    🔍 Smart Search
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2 text-gray-300">Search in column:</label>
                        <select 
                            value={searchField} 
                            onChange={handleSearchFieldChange}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {SEARCHABLE_COLUMNS.map(col => (
                                <option key={col} value={col}>{ALL_COLUMNS[col]}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-[2]">
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            Search term: <span className="text-indigo-400">(showing results starting with "{searchTerm}")</span>
                        </label>
                        <input 
                            type="text"
                            value={searchTerm} 
                            onChange={handleSearchTermChange}
                            placeholder={`Type to search ${ALL_COLUMNS[searchField]}...`}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                {searchTerm && (
                    <div className="mt-3 text-sm text-gray-400">
                        Found <span className="font-bold text-indigo-400">{pagination.totalResults || 0}</span> results
                    </div>
                )}
            </div>

            <div className="overflow-x-auto bg-gray-800/50 rounded-lg border border-gray-700">
                <table className="min-w-full table-fixed">
                    <thead className="bg-gradient-to-r from-gray-900 to-indigo-900">
                        <tr>
                            <th onClick={() => handleSort(LOCKED_COLUMN)} className="w-1/4 p-4 text-left text-sm font-bold text-white uppercase tracking-wider cursor-pointer">
                                {ALL_COLUMNS[LOCKED_COLUMN]}
                                <span className="ml-2">{sortConfig.key === LOCKED_COLUMN ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                            </th>
                            {orderedVisibleColumns.map(key => (
                                <th key={key} onClick={() => handleSort(key)} className="p-4 text-left text-sm font-bold text-white uppercase tracking-wider cursor-pointer">
                                    {ALL_COLUMNS[key]}
                                    <span className="ml-2">{sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {games.length === 0 ? (
                            <tr><td colSpan={orderedVisibleColumns.length + 1} className="text-center p-8 text-gray-400">
                                {visibleColumns.length === 0 ? "Select columns to see data." : searchTerm ? "No matching results found." : "No games to display."}
                            </td></tr>
                        ) : games.map(game => (
                            <tr key={game._id} className="hover:bg-gray-700/50 transition-colors duration-200">
                                <td className="p-4 whitespace-nowrap overflow-hidden text-ellipsis text-white">{renderCell(game, LOCKED_COLUMN)}</td>
                                {orderedVisibleColumns.map(key => (
                                    <td key={key} className="p-4 whitespace-nowrap overflow-hidden text-ellipsis">{renderCell(game, key)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-6 flex justify-center items-center gap-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="py-2 px-4 bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <span className="font-semibold">Page {currentPage} of {pagination.totalPages || 1}</span>
                <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="py-2 px-4 bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
        </div>
    );
};

export default GameTable;
