import fs from "fs";

const getBankNameByBin = (bin: number): string | undefined => {
  let bins = fs.readFileSync(__dirname + "/bins.txt", "utf-8").split("\n");
  const binsMap = new Map<number, string>();
  bins.forEach((el) => {
    const data = el.split(":");
    binsMap.set(+data[0], data[1].replace("\r", ""));
  });
  return binsMap.has(bin) ? binsMap.get(bin) : "doesn't exist";
};

export { getBankNameByBin };
