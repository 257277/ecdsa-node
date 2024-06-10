import * as fs from "node:fs/promises"

export async function recordTranscation(obj) {
    try {
        let data;
        try {
            data = await fs.readFile("./data/transinfo.txt", "utf8");
        }
        catch (err) {
            if (err.code != "ENOENT") {
                throw new Error("Error in reading file");
            }
        }
        let info = { info: [] };
        if (data) {
            try {
                info = JSON.parse(data);
            }
            catch (parseErr) {
                throw new Error("Error in parsing file data");
            }
        }
        info.info.push(obj);
        try {
            fs.writeFile("./data/transinfo.txt", JSON.stringify(info, null, 2));
        }
        catch (err) {
            throw new Error("Error in writing file");
        }
        return;
    }
    catch (err) {
        return err;
    }
}