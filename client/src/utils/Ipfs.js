import { create } from "ipfs-http-client";

// connect local ipfs node
const local = create({ url: "http://127.0.0.1:5001/api/v0" });


export async function Upload({ file }) {
    if (!file) {
        alert("No file provided");
        throw new Error("No file provided for IPFS upload");
    }
    try {
        const added = await local.add(file, { pin: true });
        console.log("Upload successful! CID: " + added.path);
        return added.path;
    } catch (err) {
        console.error("IPFS upload error:", err);
        throw err;
    }
}