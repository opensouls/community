import figlet, { Fonts } from "figlet";
import getAssetPath from "./assets";

export async function renderText(message: string, format: { font?: string }) {
  if (!format.font) {
    return message;
  }

  return new Promise((resolve, reject) => {
    figlet.defaults({ fontPath: getAssetPath("/fonts") });
    figlet.text(message, { font: format.font as Fonts }, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
