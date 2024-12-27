const fs = require('fs');
const path = require('path');
const Skill = require('../models/skill.model');
const multer = require('multer');

// Configura Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/electronics/icons/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage }).single('icon');

exports.addSkill = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(err.message);
        } else if (err) {
            return res.status(500).send('Internal server error');
        }

        const { skillTreeName } = req.params;
        const { text, description, tasks, resources, score } = req.body;
        const icon = req.file ? req.file.filename : '';

        // Log the received parameters
        console.log('Received parameters:', { skillTreeName, text, description, tasks, resources, score, icon });

        // Validation: Ensure required fields are present
        if (!text || !description || !score) {
            return res.status(400).send('The fields "text", "description", and "score" are required');
        }

        try {
            // Fetch the last skill to determine the next id
            const lastSkill = await Skill.findOne().sort({ id: -1 });
            const nextId = lastSkill ? lastSkill.id + 1 : 1;

            // Create a new skill document
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

            // Save the new skill to the database
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
    const { skillTreeName, skillID } = req.params;

    try {
        // Delete the skill from the database using the skillID
        const result = await Skill.deleteOne({ id: skillID });

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
    const { skillTreeName, skillID } = req.params;

    try {
        // Fetch the skill from the database using the skillID
        const skill = await Skill.findOne({ id: skillID });

        if (!skill) {
            return res.status(404).send('Skill not found');
        }

        // Prepare the skill data for the view
        const skillData = {
            skillText: skill.text,
            description: skill.description,
            tasks: skill.tasks.join('\n'),
            resources: skill.resources.join('\n'),
            skillScore: skill.score,
            skillID: skill.id
        };

        // Render the edit skill view with the retrieved skill data
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

        const { skillTreeName, skillID } = req.params;
        let { skillText, description, tasks, resources, skillScore } = req.body;
        const icon = req.file ? req.file.filename : '';

        // Replace \\n with \n in skillText
        skillText = skillText.replace(/\\n/g, '\n');

        try {
            // Fetch the skill from the database using the skillID
            const skill = await Skill.findOne({ id: skillID });

            if (!skill) {
                return res.status(404).send('Skill not found');
            }

            // Update the skill with the new data
            skill.text = skillText;
            skill.description = description;
            skill.tasks = tasks ? tasks.split('\n') : [];
            skill.resources = resources ? resources.split('\n') : [];
            skill.score = parseInt(skillScore, 10);
            if (icon) {
                skill.icon = icon;
            }

            // Save the updated skill to the database
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

exports.info = async (req, res) => {
    const { skillTreeName } = req.params;
    try {
        const skills = await Skill.find({ set: skillTreeName }).sort({ id: 1 });
        res.json(skills);
    } catch (error) {
        console.error('Error querying the database:', error);
        res.status(500).send('Internal server error');
    }
};