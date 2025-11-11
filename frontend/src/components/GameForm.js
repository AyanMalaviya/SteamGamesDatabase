import React, { useState, useEffect } from 'react';

const GameForm = ({ game, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        appid: '',
        name: '',
        release_date: '',
        required_age: 0,
        price: 0,
        dlc_count: 0,
        detailed_description: '',
        about_the_game: '',
        short_description: '',
        reviews: '',
        header_image: '',
        website: '',
        support_url: '',
        support_email: '',
        windows: false,
        mac: false,
        linux: false,
        metacritic_score: 0,
        metacritic_url: '',
        achievements: 0,
        recommendations: 0,
        notes: '',
        supported_languages: [],
        full_audio_languages: [],
        packages: [],
        developers: [],
        publishers: [],
        categories: [],
        genres: [],
        screenshots: [],
        movies: [],
        user_score: 0,
        score_rank: '',
        positive: 0,
        negative: 0,
        estimated_owners: '',
        average_playtime_forever: 0,
        average_playtime_2weeks: 0,
        median_playtime_forever: 0,
        median_playtime_2weeks: 0,
        discount: 0,
        peak_ccu: 0,
        tags: [],
        pct_pos_total: 0,
        num_reviews_total: 0,
        pct_pos_recent: 0,
        num_reviews_recent: 0
    });

    useEffect(() => {
        if (game) {
            // When editing, populate the form with existing game data
            setFormData({
                ...game,
                release_date: game.release_date ? new Date(game.release_date).toISOString().split('T')[0] : ''
            });
        }
    }, [game]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const handleArrayChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value ? value.split(',').map(item => item.trim()) : []
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-purple-600">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-6">
                    {game ? 'Edit Game' : 'Add New Game'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <section className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-300 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="appid" type="number" value={formData.appid} onChange={handleChange} placeholder="App ID *" required className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Game Name *" required className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="release_date" type="date" value={formData.release_date} onChange={handleChange} className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="required_age" type="number" value={formData.required_age} onChange={handleChange} placeholder="Required Age" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="discount" type="number" value={formData.discount} onChange={handleChange} placeholder="Discount %" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </section>

                    {/* Descriptions */}
                    <section className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-300 mb-4">Descriptions</h3>
                        <textarea name="short_description" value={formData.short_description} onChange={handleChange} placeholder="Short Description" rows="2" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                        <textarea name="about_the_game" value={formData.about_the_game} onChange={handleChange} placeholder="About the Game" rows="3" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 mt-4"/>
                        <textarea name="detailed_description" value={formData.detailed_description} onChange={handleChange} placeholder="Detailed Description" rows="4" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 mt-4"/>
                    </section>

                    {/* Platform Support */}
                    <section className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-300 mb-4">Platform Support</h3>
                        <div className="flex gap-6 text-white">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" name="windows" checked={formData.windows} onChange={handleChange} className="form-checkbox h-5 w-5 text-purple-500"/>
                                <span>Windows</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" name="mac" checked={formData.mac} onChange={handleChange} className="form-checkbox h-5 w-5 text-purple-500"/>
                                <span>Mac</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" name="linux" checked={formData.linux} onChange={handleChange} className="form-checkbox h-5 w-5 text-purple-500"/>
                                <span>Linux</span>
                            </label>
                        </div>
                    </section>

                    {/* Categories & Tags (Arrays) */}
                    <section className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-300 mb-4">Categories & Classification</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <input name="developers" value={(formData.developers || []).join(', ')} onChange={handleArrayChange} placeholder="Developers (comma-separated)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="publishers" value={(formData.publishers || []).join(', ')} onChange={handleArrayChange} placeholder="Publishers (comma-separated)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="genres" value={(formData.genres || []).join(', ')} onChange={handleArrayChange} placeholder="Genres (comma-separated)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="categories" value={(formData.categories || []).join(', ')} onChange={handleArrayChange} placeholder="Categories (comma-separated)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="tags" value={(formData.tags || []).join(', ')} onChange={handleArrayChange} placeholder="Tags (comma-separated)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </section>

                    {/* Scores & Reviews */}
                    <section className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-300 mb-4">Scores & Reviews</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <input name="metacritic_score" type="number" value={formData.metacritic_score} onChange={handleChange} placeholder="Metacritic Score" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="user_score" type="number" value={formData.user_score} onChange={handleChange} placeholder="User Score" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="positive" type="number" value={formData.positive} onChange={handleChange} placeholder="Positive Reviews" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="negative" type="number" value={formData.negative} onChange={handleChange} placeholder="Negative Reviews" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="recommendations" type="number" value={formData.recommendations} onChange={handleChange} placeholder="Recommendations" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="num_reviews_total" type="number" value={formData.num_reviews_total} onChange={handleChange} placeholder="Total Reviews" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </section>

                    {/* Statistics */}
                    <section className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-300 mb-4">Game Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <input name="estimated_owners" value={formData.estimated_owners} onChange={handleChange} placeholder="Est. Owners" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="peak_ccu" type="number" value={formData.peak_ccu} onChange={handleChange} placeholder="Peak CCU" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="achievements" type="number" value={formData.achievements} onChange={handleChange} placeholder="Achievements" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="dlc_count" type="number" value={formData.dlc_count} onChange={handleChange} placeholder="DLC Count" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="average_playtime_forever" type="number" value={formData.average_playtime_forever} onChange={handleChange} placeholder="Avg. Playtime (Forever)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="median_playtime_forever" type="number" value={formData.median_playtime_forever} onChange={handleChange} placeholder="Median Playtime (Forever)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </section>

                    {/* URLs & Media */}
                    <section className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-300 mb-4">URLs & Media</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <input name="header_image" value={formData.header_image} onChange={handleChange} placeholder="Header Image URL" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="website" value={formData.website} onChange={handleChange} placeholder="Website URL" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="support_url" value={formData.support_url} onChange={handleChange} placeholder="Support URL" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="support_email" type="email" value={formData.support_email} onChange={handleChange} placeholder="Support Email" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </section>

                    {/* Languages */}
                    <section className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-300 mb-4">Language Support</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <input name="supported_languages" value={(formData.supported_languages || []).join(', ')} onChange={handleArrayChange} placeholder="Supported Languages (comma-separated)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                            <input name="full_audio_languages" value={(formData.full_audio_languages || []).join(', ')} onChange={handleArrayChange} placeholder="Full Audio Languages (comma-separated)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                        <button type="button" onClick={onCancel} className="py-3 px-6 bg-gray-600 rounded-lg hover:bg-gray-500 font-semibold">Cancel</button>
                        <button type="submit" className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:scale-105 transform transition-transform duration-200 font-semibold">
                            {game ? 'Update Game' : 'Create Game'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GameForm;
