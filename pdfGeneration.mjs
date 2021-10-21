import puppeteer from "puppeteer";
import mustache from "mustache";
import fs from "fs";

export async function generatePdf(template, view) {
  const html = mustache.render(template, view);
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: "networkidle0",
  });
  const data = await page.pdf({
    format: `letter`,
    printBackground: true,
  });
  await page.close();
  await browser.close();
  return Buffer.from(Object.values(data));
}

export function generatePdfBase64(...args) {
  return generatePdf(...args).then((pdfBuffer) => pdfBuffer.toString("base64"));
}

export const testWriteFile = () => {
  const template = `Hello {{name}}`;
  const view = { name: `World` };
  generatePdf(template, view).then((pdfBuffer) => {
    fs.writeFileSync(`output.pdf`, pdfBuffer);
    console.log(`Sucessfully generated the pdf`);
  });
};

export const testBase64 = () => {
  const template = `
    Sample PDF Generation: <br />
    <pre>{{data}}</pre>
  `;
  const view = { data: `Data inputed by view` };
  return generatePdfBase64(template, view);
};

export const testeBase64WriteFile = () => testBase64().then(data => fs.writeFileSync('output.pdf.b64', data));

// testWriteFile();
// testeBase64WriteFile()

