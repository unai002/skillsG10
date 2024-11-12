const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const url = 'https://tinkererway.dev/web_skill_trees/electronics_skill_tree';

// Indicamos el directorio donde guardar los iconos y lo creamos si no existe
const saveDirectory = path.resolve(__dirname, '..', 'public', 'electronics', 'icons');
(async () => {
    try {
        await fs.mkdir(saveDirectory, { recursive: true });
    } catch (error) {
        console.error(`Error al crear directorio: ${error.message}`);
    }
})();

async function getIconUrls() {
    try {
        // Scraping de la página para obtener las URLs de los iconos (href de los elementos <image>)
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, {waitUntil: 'networkidle0'});

        const data = await page.evaluate(() => {
            const container = document.querySelector('.svg-container');
            const skillElements = container.querySelectorAll('.svg-wrapper');
            const hrefs = [];

            // Los href vienen en forma de URL relativa, hay que cambiarlas a absolutas para poder descargar luego
            const baseUrl = 'https://tinkererway.dev/';
            skillElements.forEach(skill => {
                const relativePath = skill.querySelector('image').getAttribute('href');
                // Aquí creamos la URL absoluta y la pasamos a String para que luego Puppeteer la pueda usar
                const absolutePath = new URL(relativePath, baseUrl).toString();
                hrefs.push(absolutePath);
            });
            return hrefs;

        });

        await browser.close();
        return data;

    } catch (error) {
        console.log("Ha ocurrido un error: ", error);
    }
}

async function downloadIcon(page, url, index) {
    try {
        const response = await page.goto(url);
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        // Convertimos la respuesta a un objeto Buffer porque es una imagen (información binaria)
        const iconData = await response.buffer();
        const filePath = path.join(saveDirectory, `icon${index + 1}.svg`);

        // El objeto Buffer podemos guardarlo en un archivo
        await fs.writeFile(filePath, iconData);
        console.log(`Icono ${index + 1} descargado con éxito: ${filePath}`);

    } catch (error) {
        console.error(`Error descargando el icono ${index + 1} desde ${url}: ${error.message}`);
    }
}

async function downloadAllIcons() {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const iconUrls = await getIconUrls();

    for (let i = 0; i < iconUrls.length; i++) {
        await downloadIcon(page, iconUrls[i], i);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Se han descargado todos los iconos.");

    await browser.close();
}

downloadAllIcons();

