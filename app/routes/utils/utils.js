import fs from "fs";
import csv from "csv-parser";
import path from "path";
export const readDealerCsv = async (pincode) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(process.cwd(), "public", "assets", "dealer.csv");
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (data) => {
        if (data.pincode === pincode) {
          results.push(data);
        }
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};
