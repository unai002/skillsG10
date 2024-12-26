const puppeteer = require('puppeteer');
const path = require("path");
const {promises: fs} = require("fs");
const baseurl = "https://raw.githubusercontent.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/master/rangos/png/";

const indiceTablaInicio = 6;
const indiceTablaFin = 11;

const saveDirectory = path.resolve(__dirname, '..', 'public', 'badges');
(async () => {
    try {
        await fs.mkdir(saveDirectory, { recursive: true });
    } catch (error) {
        console.error(`Error al crear directorio: ${error.message}`);
    }
})();

async function extractTablesInRange(startIndex, endIndex) {
    const url = 'https://github.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/wiki#listado-de-rangos';

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle0' });

        let bitpointCount = 0;
        let allTablesData = [];

        const { tablesData, updatedBitpointCount } = await page.evaluate(
            (startIndex, endIndex, bitpointCount) => {
                const tables = document.querySelectorAll('table');
                const selectedTables = Array.from(tables).slice(startIndex, endIndex + 1);

                const tablesData = selectedTables.map((table) => {
                    const rows = Array.from(table.querySelectorAll('tr'));
                    rows.shift();
                    const tableData = rows.map((row) => {
                        const cells = Array.from(row.querySelectorAll('td, th'));
                        const rowData = {
                            "name": cells[2].innerText.trim(),
                            "bitpoints-min": bitpointCount.toString(),
                            "bitpoints-max": (bitpointCount + 9).toString(),
                            "image_url": cells[1].querySelector('img').getAttribute('src').split('/').pop()
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

        await fs.writeFile(path.resolve(__dirname, '..', 'public', 'badges', 'badges.json'),
            JSON.stringify(allTablesData, null, 2));
        console.log('Se han guardado los datos en public/badges/badges.json');

        await downloadAllBadges(allTablesData);

    } catch (error) {
        console.error('Error al extraer los valores de la tabla:', error);
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
        const badgeUrl = `${baseurl}${badge.image_url.replace('.png', '-min.png')}`;
        const fileName = badge.image_url.replace('.png', '-min.png');
        await downloadBadge(page, badgeUrl, fileName);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Se han descargado todos los badges.");

    await browser.close();
}

extractTablesInRange(indiceTablaInicio, indiceTablaFin);