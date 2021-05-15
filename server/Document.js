const mongoose = require('mongoose');

const DocumentSchema = mongoose.Schema({
    id: String,
    data: String
}, {
    useTimestamps: true
});

module.exports = mongoose.model("Document", DocumentSchema);