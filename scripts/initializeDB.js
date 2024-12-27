const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const Badge = require('../models/badge.model'); // Ensure the path is correct
const Skill = require('../models/skill.model'); // Ensure the path is correct
const User = require('../models/user.model'); // Adjust the path as necessary

async function initializeBadges() {
    const filePath = path.join(__dirname, '../public/badges/badges.json');
    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading JSON file', err);
            return;
        }

        const badges = JSON.parse(data);

        // Sort badges by bitpoints_min
        badges.sort((a, b) => a['bitpoints-min'] - b['bitpoints-min']);

        for (const badgeData of badges) {
            const mappedBadgeData = {
                name: badgeData.name,
                bitpoints_min: badgeData['bitpoints-min'],
                bitpoints_max: badgeData['bitpoints-max'],
                image_url: badgeData['image_url']
            };

            try {
                const existingBadge = await Badge.findOne({ name: mappedBadgeData.name });
                if (!existingBadge) {
                    const badge = new Badge(mappedBadgeData);
                    await badge.save();
                    console.log(`Badge ${badge.name} saved successfully`);
                } else {
                    console.log(`Badge ${mappedBadgeData.name} already exists`);
                }
            } catch (error) {
                console.error(`Error processing badge ${mappedBadgeData.name}`, error);
            }
        }
    });
}

async function initializeSkills() {
    const filePath = path.join(__dirname, '../public/electronics/skillscomplete.json');
    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading JSON file', err);
            return;
        }

        const skills = JSON.parse(data);

        for (const skillData of skills) {
            const mappedSkillData = {
                id: skillData.id,
                text: skillData.text,
                icon: skillData.icon,
                set: skillData.set,
                tasks: skillData.tasks,
                resources: skillData.resources,
                description: skillData.description,
                score: skillData.score
            };

            try {
                const existingSkill = await Skill.findOne({ id: mappedSkillData.id });
                if (!existingSkill) {
                    const skill = new Skill(mappedSkillData);
                    await skill.save();
                    console.log(`Skill ${skill.id} saved successfully`);
                } else {
                    console.log(`Skill ${mappedSkillData.id} already exists`);
                }
            } catch (error) {
                console.error(`Error processing skill ${mappedSkillData.text}`, error);
            }
        }
    });
}

async function initializeUsers() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('1234', 10);

        // Check if admin user exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const adminUser = new User({
                username: 'admin',
                password: hashedPassword,
                admin: true
            });
            await adminUser.save();
            console.log('Admin user initialized successfully');
        } else {
            console.log('Admin user already exists');
        }

        // Check if regular user exists
        const existingUser = await User.findOne({ username: 'user' });
        if (!existingUser) {
            const regularUser = new User({
                username: 'user',
                password: hashedPassword,
                admin: false
            });
            await regularUser.save();
            console.log('Regular user initialized successfully');
        } else {
            console.log('Regular user already exists');
        }
    } catch (error) {
        console.error('Error initializing users:', error);
    }
}

async function initializeDB() {
    await initializeBadges();
    await initializeSkills();
    await initializeUsers();
}

module.exports = initializeDB;