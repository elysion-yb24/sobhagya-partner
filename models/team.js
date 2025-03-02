const mongoose = require('mongoose');
// const appVariables = require('../config/appRunVariables');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email:{type:String,require:true},
    googleId:{type:String,required:true},
    role: { type: String, enum: ['admin', 'regionalManager', 'support', ''], default: 'admin' },
    permissions: {
        type: Object,
        required: true,
        default: {
            "createUser": false,
            "updateUser": false,
            "readUser": false,
            "readCalls": false,
            "listenCalls": false,
            "readTransactions": false,
            "updatePaymentDetails":false
        }
    },
    createdOn: { type: Date, default: Date.now },
}, { timestamps: true });



export default mongoose.models.Team || mongoose.model("Team",  teamSchema);