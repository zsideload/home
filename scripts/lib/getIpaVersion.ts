import * as fs from "node:fs";
import JSZip from "jszip";
import plist from "plist";

const zip = new JSZip();

export const getIpaVersion = async (ipaFile: ArrayBuffer) => {
  const zipFile = await zip.loadAsync(ipaFile);
  const plistFileRegex = /Payload\/.*\.app\/Info\.plist/;
  const plistFile = await zipFile.file(plistFileRegex)[0].async("string");
  const plistParsed = plist.parse(plistFile) as plist.PlistObject;
  const version = plistParsed.CFBundleShortVersionString;
  return version;
};

export const getIpaVersionFilePath = async (filePath: string) => {
  const file = fs.readFileSync(filePath);
  const arrayBuffer = file.buffer.slice(
    file.byteOffset,
    file.byteOffset + file.byteLength,
  );
  return await getIpaVersion(arrayBuffer);
};
