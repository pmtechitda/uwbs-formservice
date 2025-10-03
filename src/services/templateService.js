import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function renderTemplate(templateName, data) {
  const filePath = path.join(__dirname, "../views/emails", `${templateName}.ejs`);
  return new Promise((resolve, reject) => {
    ejs.renderFile(filePath, data, (err, str) => {
      if (err) reject(err);
      else resolve(str);
    });
  });
}
