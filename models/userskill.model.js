const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VerificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String },
    verifiedAt: { type: Date, required: true }
});

const UserSkillSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    evidence: { type: String },
    verified: { type: Boolean, default: false },
    verifications: [VerificationSchema],
    completedTasks: { type: [Boolean], default: [] }
});

// Campo "virtual" para obtener el número de verificaciones desde el front end
UserSkillSchema.virtual('approvals').get(function() {
    return this.verifications.length;
});

module.exports = mongoose.model('UserSkill', UserSkillSchema);