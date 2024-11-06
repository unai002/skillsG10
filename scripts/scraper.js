const puppeteer = require('puppeteer');
const fs = require('fs');

const url = 'https://tinkererway.dev/web_skill_trees/electronics_skill_tree';

async function extraer() {
    try {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, {waitUntil: 'networkidle0'});

        const data = await page.evaluate(() => {

            const container = document.querySelector('.svg-container')
            const skillElements = container.querySelectorAll('.svg-wrapper');
            const skills = [];

            skillElements.forEach(skill => {
                const id = skill.getAttribute('data-id');
                console.log(id);
                const tspans = skill.querySelectorAll('tspan')
                const text = Array.from(tspans).map(tspan => tspan.innerHTML.trim()).join('\n')
                const iconPath = skill.querySelector('image').getAttribute('href');
                const iconName = iconPath.split('/').pop();

                skills.push({
                    id: parseInt(id),
                    text: text,
                    icon: iconName
                });
            });

            return skills

        });

        fs.writeFileSync('skills.json', JSON.stringify(data, null, 2));
        console.log('Data saved to skills.json');

        await browser.close();

        return data;

    } catch (error) {
        console.log("An error ocurred: ", error);
    }
}

extraer();