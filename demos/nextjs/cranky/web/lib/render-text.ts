import figlet, { Fonts } from "figlet";

export async function renderText(message: string, format: { font: string }) {
  return new Promise((resolve, reject) => {
    figlet.defaults({ fontPath: "/fonts" });
    figlet.text(message, { font: format.font as Fonts }, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
