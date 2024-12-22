const fs = require('fs');
const path = require('path');

exports.addSkill = (req, res) => {
    const { skillTreeName } = req.params;
    const { text, description, tasks, resources, score, icon } = req.body;

    // Log the received parameters
    console.log('Received parameters:', { skillTreeName, text, description, tasks, resources, score, icon });

    // Validación: Asegúrate de que los campos obligatorios estén presentes
    if (!text || !description || !score) {
        return res.status(400).send('Los campos "text", "description" y "score" son obligatorios');
    }

    // Ruta al archivo JSON
    const filePath = path.join(__dirname, '..', 'public', skillTreeName, 'skills.json');

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
                text: text,
                description: description,
                tasks: tasks ? tasks.split('\n') : [],
                resources: resources ? resources.split('\n') : [],
                score: parseInt(score, 10),
                icon: icon || `icon${newId}.svg`
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
};

exports.deleteSkill = (req, res) => {
    const { skillTreeName, skillID } = req.params;

    // Ruta al archivo JSON
    const filePath = path.join(__dirname, '..', 'public', skillTreeName, 'skills.json');

    // Leer el archivo JSON
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err);
            return res.status(500).send('Error interno del servidor');
        }

        try {
            // Parsear el contenido del archivo JSON
            let skills = JSON.parse(data);

            // Filtrar el skill a eliminar
            const skillIndex = skills.findIndex(skill => skill.id === parseInt(skillID, 10));
            if (skillIndex === -1) {
                return res.status(404).send('Skill no encontrado');
            }

            // Eliminar el skill del array
            skills.splice(skillIndex, 1);

            // Escribir de nuevo el archivo JSON
            fs.writeFile(filePath, JSON.stringify(skills, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).send('Error interno del servidor');
                }

                console.log(`Skill con ID ${skillID} eliminado`);
                res.redirect(`/skills/${skillTreeName}`);
            });

        } catch (error) {
            console.error('Error al procesar los datos del archivo JSON:', error);
            res.status(500).send('Error interno del servidor');
        }
    });
};