const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');

router.get('/', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    res.redirect('/skills/electronics');
});

router.get('/:skillTreeName', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    res.render('main', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin
    });
});

router.get('/:skillTreeName/view/:skillID', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    res.render('skillspecifics', {
        skillTreeName: req.params.skillTreeName,
        skillID: req.params.skillID,
        username: req.session.username,
        admin: req.session.admin
    });
});

router.get('/:skillTreeName/edit/:skillID', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    if (!req.session.admin) {
        res.redirect('/skills/' + req.params.skillTreeName);
    }

    // Obtener los datos de la skill desde la base de datos o cualquier fuente de datos
    const skillData = {
        skillText: 'test pa ver si funciona',
        description: 'Discover the convenience of breadboards for prototyping circuits without soldering, allowing for easy experimentation.',
        tasks: 'Task 1\nTask 2\nTask 55',
        resources: 'Resource 1\nResource 2\nResource 3',
        skillScore: 1000,
        skillID: req.params.skillID
    };

    res.render('editskill', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin,
        skill: skillData
    });

});

// Middleware para verificar si el usuario es administrador
function isAdmin(req, res, next) {
    if (req.session && req.session.admin) {
        next(); // Si es administrador, continuar
    } else {
        res.status(403).send('Acceso denegado: Se requiere rol de administrador');
    }
}

router.get('/:skillTreeName/add', isAdmin, (req, res) => {
    res.render('createskill', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin, });
});

// Ruta POST para añadir una nueva habilidad
router.post('/:skillTreeName/add', isAdmin, (req, res) => {
    const { skillTreeName } = req.params;
    const { text, icon } = req.body;

    // Validación: Asegúrate de que el campo text esté presente
    if (!text) {
        return res.status(400).send('El campo "text" es obligatorio');
    }

    // Ruta al archivo JSON
    const filePath = path.join(__dirname, '..', 'public', 'electronics', 'skills.json');

    // Leer el archivo JSON
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err);
            return res.status(500).send('Error interno del servidor');
        }

        try {
            // Parsear el contenido del archivo JSON
            const skills = JSON.parse(data);

            // Calcular el próximo ID
            const maxId = skills.reduce((max, skill) => Math.max(max, skill.id), 0);
            const newId = maxId + 1;

            // Crear el nuevo skill
            const newSkill = {
                id: newId,
                text: text, // Preserva saltos de línea en el texto
                icon: icon || `icon${newId}.svg` // Asigna un icono por defecto si no se proporciona
            };

            // Agregar el nuevo skill al array
            skills.push(newSkill);

            // Escribir de nuevo el archivo JSON
            fs.writeFile(filePath, JSON.stringify(skills, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).send('Error interno del servidor');
                }

                console.log('Nuevo skill agregado:', newSkill);
                res.redirect(`/skills/${skillTreeName}`);
            });

        } catch (error) {
            console.error('Error al procesar los datos del archivo JSON:', error);
            res.status(500).send('Error interno del servidor');
        }
    });
});

module.exports = router;