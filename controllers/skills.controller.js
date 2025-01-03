const fs = require('fs');
const path = require('path');
const Skill = require('../models/skill.model');
const UserSkill = require('../models/userskill.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const multer = require('multer');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/electronics/icons/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({storage: storage}).single('icon');

exports.addSkill = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(err.message);
        } else if (err) {
            return res.status(500).send('Internal server error');
        }

        const {skillTreeName} = req.params;
        const {text, description, tasks, resources, score} = req.body;
        const icon = req.file ? req.file.filename : '';

        console.log('Received parameters:', {skillTreeName, text, description, tasks, resources, score, icon});

        if (!text || !description || !score) {
            return res.status(400).send('The fields "text", "description", and "score" are required');
        }

        try {
            const lastSkill = await Skill.findOne().sort({id: -1});
            const nextId = lastSkill ? lastSkill.id + 1 : 1;

            const newSkill = new Skill({
                id: nextId,
                text: text,
                description: description,
                tasks: tasks ? tasks.split('\n') : [],
                resources: resources ? resources.split('\n') : [],
                score: parseInt(score, 10),
                icon: icon,
                set: skillTreeName
            });

            await newSkill.save();

            console.log('New skill added:', newSkill);
            res.redirect(`/skills/${skillTreeName}`);
        } catch (error) {
            console.error('Error adding new skill:', error);
            res.status(500).send('Internal server error');
        }
    });
};

exports.deleteSkill = async (req, res) => {
    const {skillTreeName, skillID} = req.params;

    try {
        const result = await Skill.deleteOne({id: skillID});

        if (result.deletedCount === 0) {
            return res.status(404).send('Skill not found');
        }

        console.log(`Skill with ID ${skillID} deleted`);
        res.redirect(`/skills/${skillTreeName}`);
    } catch (error) {
        console.error('Error deleting skill from the database:', error);
        res.status(500).send('Internal server error');
    }
};

exports.viewSkillTree = (req, res) => {
    res.render('main', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin
    });
};

exports.viewSkill = (req, res) => {
    res.render('skillspecifics', {
        skillTreeName: req.params.skillTreeName,
        skillID: req.params.skillID,
        username: req.session.username,
        admin: req.session.admin
    });
};

exports.editSkill = async (req, res) => {
    const {skillTreeName, skillID} = req.params;

    try {
        const skill = await Skill.findOne({id: skillID});

        if (!skill) {
            return res.status(404).send('Skill not found');
        }

        const skillData = {
            skillText: skill.text,
            description: skill.description,
            tasks: skill.tasks.join('\n'),
            resources: skill.resources.join('\n'),
            skillScore: skill.score,
            skillID: skill.id
        };

        res.render('editskill', {
            skillTreeName: skillTreeName,
            username: req.session.username,
            admin: req.session.admin,
            skill: skillData
        });

    } catch (error) {
        console.error('Error fetching skill from the database:', error);
        res.status(500).send('Internal server error');
    }
};

exports.updateSkill = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(err.message);
        } else if (err) {
            return res.status(500).send('Internal server error');
        }

        const {skillTreeName, skillID} = req.params;
        let {skillText, description, tasks, resources, skillScore} = req.body;
        const icon = req.file ? req.file.filename : '';

        skillText = skillText.replace(/\\n/g, '\n');

        try {
            const skill = await Skill.findOne({id: skillID});

            if (!skill) {
                return res.status(404).send('Skill not found');
            }

            skill.text = skillText;
            skill.description = description;
            skill.tasks = tasks ? tasks.split('\n') : [];
            skill.resources = resources ? resources.split('\n') : [];
            skill.score = parseInt(skillScore, 10);
            if (icon) {
                skill.icon = icon;
            }

            await skill.save();

            console.log('Skill updated:', skill);
            res.redirect(`/skills/${skillTreeName}`);
        } catch (error) {
            console.error('Error updating skill:', error);
            res.status(500).send('Internal server error');
        }
    });
};

exports.addSkillForm = (req, res) => {
    res.render('createskill', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin,
    });
};

exports.redirectToSkillTree = (req, res) => {
    res.redirect('/skills/electronics');
};

exports.updateUserTasks = async (req, res) => {
    const {skillTreeName} = req.params;
    const {skillId, username, taskStates} = req.body;

    console.log('Received parameters:', {skillTreeName, skillId, username, taskStates});

    try {
        const user = await User.findOne({username: username});

        if (!user) {
            return res.status(404).send('User not found');
        }

        const skillIdNumber = parseInt(skillId, 10);
        const skill = await Skill.findOne({id: skillIdNumber});

        if (!skill) {
            return res.status(404).send('Skill not found');
        }

        const taskStatesArray = Array.isArray(taskStates) ? taskStates : [];
        console.log('tasks ', taskStatesArray);

        let userSkill = await UserSkill.findOne({skill: skill._id, user: user._id});

        if (!userSkill) {
            userSkill = new UserSkill({skill: skill._id, user: user._id, completedTasks: taskStatesArray});
        } else {
            userSkill.completedTasks = taskStatesArray;
        }
        await userSkill.save();
        res.json({message: 'User tasks updated successfully'});
    } catch (error) {
        console.error('Error updating user tasks:', error.message, error.stack);
        res.status(500).send('Internal server error');
    }
};

exports.getUserTasks = async (req, res) => {
    const {skillId, username} = req.query;

    try {
        console.log('Received parameters:', {skillId, username});

        const user = await User.findOne({username: username});
        if (!user) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        const skillIdNumber = parseInt(skillId, 10);
        console.log('Converted skillId to number:', skillIdNumber);

        const skill = await Skill.findOne({id: skillIdNumber});
        if (!skill) {
            console.log('Skill not found');
            return res.status(404).send('Skill not found');
        }

        const userSkill = await UserSkill.findOne({skill: skill._id, user: user._id});

        if (!userSkill) {
            console.log('UserSkill not found, returning empty taskStates');
            return res.json({taskStates: []});
        }

        res.json({taskStates: userSkill.completedTasks});
    } catch (error) {
        console.error('Error fetching user tasks:', error.message, error.stack);
        res.status(500).send('Internal server error');
    }
};

exports.submitEvidence = async (req, res) => {
    const {skillTreeName} = req.params;
    const {skillId, evidence, username} = req.body;

    console.log('Received parameters:', {skillTreeName, skillId, evidence, username});

    if (!skillId || !evidence || !username) {
        console.log('Missing required parameters');
        return res.status(400).json({error: 'Skill ID, evidence, and username are required'});
    }

    try {
        const user = await User.findOne({username: username});
        console.log('User found:', user);

        if (!user) {
            console.log('User not found');
            return res.status(404).json({error: 'User not found'});
        }

        const skillIdNumber = parseInt(skillId, 10);
        const skill = await Skill.findOne({id: skillIdNumber});

        if (!skill) {
            return res.status(404).send('Skill not found');
        }

        let userSkill = await UserSkill.findOne({user: user._id, skill: skill._id});
        console.log('UserSkill found:', userSkill);

        if (!userSkill) {
            console.log('UserSkill not found');
            return res.status(404).json({error: 'UserSkill not found'});
        }

        userSkill.evidence = evidence;
        console.log('Updated UserSkill evidence:', userSkill.evidence);

        await userSkill.save();
        console.log('UserSkill saved:', userSkill);

        res.status(200).json({message: 'Evidence submitted successfully', userSkill});
    } catch (error) {
        console.error('Error submitting evidence:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.getEvidence = async (req, res) => {
    const {skillId, username} = req.query;

    console.log('Received parameters:', {skillId, username});

    try {
        const user = await User.findOne({username: username});
        if (!user) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        const skillIdNumber = parseInt(skillId, 10);
        console.log('Converted skillId to number:', skillIdNumber);

        const skill = await Skill.findOne({id: skillIdNumber});
        if (!skill) {
            console.log('Skill not found');
            return res.status(404).send('Skill not found');
        }

        const userSkill = await UserSkill.findOne({user: user._id, skill: skill._id});
        if (!userSkill) {
            console.log('UserSkill not found');
            return res.status(404).send('UserSkill not found');
        }

        res.json({evidence: userSkill.evidence});
    } catch (error) {
        console.error('Error fetching user evidence:', error.message, error.stack);
        res.status(500).send('Internal server error');
    }
};

exports.getAllEvidences = async (req, res) => {
    const {skillId} = req.query;

    console.log('Received skillId:', skillId);

    try {
        const skillIdNumber = parseInt(skillId, 10);
        console.log('Converted skillId to number:', skillIdNumber);

        const skill = await Skill.findOne({id: skillIdNumber});
        if (!skill) {
            console.log('Skill not found');
            return res.status(404).send('Skill not found');
        }

        console.log('Skill found:', skill);

        const userSkills = await UserSkill.find({skill: skill._id}).populate('user');
        console.log('UserSkills found:', userSkills);

        const evidences = userSkills.map(userSkill => ({
            username: userSkill.user.username,
            evidence: userSkill.evidence,
            approved: userSkill.verified,
            approvals: userSkill.approvals,
            verifications: userSkill.verifications
        }));

        console.log('Evidences extracted:', evidences);

        res.json({evidences});
    } catch (error) {
        console.error('Error fetching evidences:', error.message, error.stack);
        res.status(500).send('Internal server error');
    }
};

exports.verifyEvidence = async (req, res) => {
    const {skillTreeName, skillID} = req.params;
    const {username, evidenceUsername, approved, isAdmin} = req.body;

    console.log('Received parameters:', {skillTreeName, skillID, username, evidenceUsername, approved, isAdmin});

    if (!skillID || !username || !evidenceUsername || approved === undefined) {
        console.log('Missing required parameters');
        return res.status(400).json({error: 'Skill ID, username, and approval status are required'});
    }

    try {
        const approvingUser = await User.findOne({username: username});
        if (!approvingUser) {
            console.log('User not found');
            return res.status(404).json({error: 'User not found'});
        }

        const evidenceUser = await User.findOne({username: evidenceUsername});
        if (!evidenceUser) {
            console.log('User not found');
            return res.status(404).json({error: 'User not found'});
        }

        const skillIdNumber = parseInt(skillID, 10);

        const skill = await Skill.findOne({id: skillIdNumber});
        if (!skill) {
            console.log('Skill not found');
            return res.status(404).json({error: 'Skill not found'});
        }

        const userSkill = await UserSkill.findOne({user: evidenceUser._id, skill: skill._id});
        if (!userSkill) {
            console.log('UserSkill not found');
            return res.status(404).json({error: 'UserSkill not found'});
        }

        const userSkillApproving = await UserSkill.findOne({user: approvingUser._id, skill: skill._id});
        if (userSkillApproving && !userSkillApproving.verified && !isAdmin) {
            return res.status(500).json({error: 'No has logrado la competencia, no puedes verificarla.'});
        }

        if (approved) {
            if (isAdmin) {
                userSkill.verified = approved;
                userSkill.verifications.push({user: approvingUser._id, username: approvingUser.username, verifiedAt: new Date()});
                evidenceUser.score += skill.score;
            } else {
                userSkill.verifications.push({user: approvingUser._id, username: approvingUser.username, verifiedAt: new Date()});
                if (userSkill.approvals === 3) {
                    userSkill.verified = true;
                    evidenceUser.score += skill.score;
                }
            }

            await userSkill.save();
            await evidenceUser.save();

            console.log('UserSkill verified status updated:', userSkill);
            res.status(200).json({message: 'Evidence verified successfully', userSkill});
        } else {
            if (isAdmin) {
                userSkill.evidence = null;
            }
            await userSkill.save();

            console.log('UserSkill verified status updated:', userSkill);
            res.status(200).json({message: 'Evidence rejected successfully', userSkill});
        }
    } catch (error) {
        console.error('Error verifying evidence:', error.message, error.stack);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.info = async (req, res) => {
    const {skillTreeName} = req.params;
    try {
        const skills = await Skill.find({set: skillTreeName}).sort({id: 1});
        res.json(skills);
    } catch (error) {
        console.error('Error querying the database:', error);
        res.status(500).send('Internal server error');
    }
};