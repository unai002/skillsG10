const puppeteer = require('puppeteer');
const path = require("path");
const {promises: fs} = require("fs");
const baseurl = "https://raw.githubusercontent.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/master/rangos/png/";

const indiceTablaInicio = 6;
const indiceTablaFin = 11;

// Indicamos el directorio donde guardar los iconos y lo creamos si no existe
const saveDirectory = path.resolve(__dirname, '..', 'badges');
(async () => {
    try {
        await fs.mkdir(saveDirectory, { recursive: true });
    } catch (error) {
        console.error(`Error al crear directorio: ${error.message}`);
    }
})();

async function extractTablesInRange(startIndex, endIndex) {
    const url = 'https://github.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/wiki#listado-de-rangos'; // Replace with the target URL

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle0' });

        let bitpointCount = 0;
        let allTablesData = [];

        const { tablesData, updatedBitpointCount } = await page.evaluate((startIndex, endIndex, bitpointCount) => {
            const tables = document.querySelectorAll('table');

            // De todas las tablas, seleccionamos las que están en el rango que queremos
            const selectedTables = Array.from(tables).slice(startIndex, endIndex + 1);

            const tablesData = selectedTables.map((table) => {

                // Seleccionamos las filas de la tabla
                const rows = Array.from(table.querySelectorAll('tr'));
                rows.shift(); // Quitamos la cabecera de la tabla (primera fila)
                const tableData = rows.map((row) => {
                    const cells = Array.from(row.querySelectorAll('td, th'));
                    const rowData = {
                        "rango": cells[2].innerText.trim(),
                        "bitpoints-min": bitpointCount.toString(),
                        "bitpoints-max": (bitpointCount + 9).toString(),
                        "png": cells[1].querySelector('img').getAttribute('src').split('/').pop()
                    };
                    bitpointCount += 10;
                    return rowData;
                });
                return tableData;
            });

            return { tablesData: tablesData.flat(), updatedBitpointCount: bitpointCount };
        }, startIndex, endIndex, bitpointCount);

        allTablesData = allTablesData.concat(tablesData);
        bitpointCount = updatedBitpointCount;

        console.log(JSON.stringify(allTablesData, null, 2));

        await browser.close();

        await fs.writeFile('badges.json', JSON.stringify(allTablesData, null, 2));
        console.log('Se han guardado los datos en badges.json');

        await downloadAllBadges(allTablesData);

    } catch (error) {
        console.error('Error extracting tables data:', error);
    }
}

async function downloadBadge(page, url, fileName) {
    try {
        const response = await page.goto(url);
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const badgeData = await response.buffer();
        const filePath = path.join(saveDirectory, fileName);

        await fs.writeFile(filePath, badgeData);
        console.log(`Badge descargado con éxito: ${filePath}`);

    } catch (error) {
        console.error(`Error descargando el badge desde ${url}: ${error.message}`);
    }
}

async function downloadAllBadges(badgesData) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (const badge of badgesData) {
        const badgeUrl = `${baseurl}${badge.png.replace('.png', '-min.png')}`;
        const fileName = badge.png.replace('.png', '-min.png');
        await downloadBadge(page, badgeUrl, fileName);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Se han descargado todos los badges.");

    await browser.close();
}

extractTablesInRange(indiceTablaInicio, indiceTablaFin);