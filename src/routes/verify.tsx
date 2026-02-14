import { createSignal, Show } from "solid-js";
import { action, useAction } from "@solidjs/router";
import { getUser } from "~/api/server";
import { createStorage, getStorages, deleteStorage } from "~/api/storage/server";
import { createBox, getBoxes, deleteBox } from "~/api/box/server";
import { notEmpty } from "~/lib/utils"; // Assuming utils exists or create helper

const verifyPersistence = action(async () => {
    "use server";
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    try {
        const user = await getUser();
        log(`User authenticated: ${user.id}`);

        // 1. Create Storage
        const storageName = `Test Storage ${Date.now()}`;
        const storageFormData = new FormData();
        storageFormData.append("name", storageName);

        try {
            await createStorage(storageFormData);
        } catch (e: any) {
            if (e instanceof Response || (e.response && e.response.headers)) {
                log("createStorage threw redirect (expected)");
            } else {
                log(`createStorage error: ${e.message}`);
                throw e;
            }
        }

        // Verify Storage
        const storages = await getStorages();
        const storage = storages.find(s => s.name === storageName);
        if (!storage) throw new Error("Storage not found after creation");
        log(`Storage created: ${storage.id}`);

        // 2. Create Box
        const boxName = `Test Box ${Date.now()}`;
        const boxFormData = new FormData();
        boxFormData.append("name", boxName);
        boxFormData.append("storageId", storage.id);

        try {
            await createBox(boxFormData);
        } catch (e: any) {
            if (e instanceof Response || (e.response && e.response.headers)) {
                log("createBox threw redirect (expected)");
            } else {
                throw e;
            }
        }

        // Verify Box
        const boxes = await getBoxes();
        const box = boxes.find(b => b.name === boxName);
        if (!box) throw new Error("Box not found after creation");
        log(`Box created: ${box.id}, StorageId: ${box.storageId}`);
        if (box.storageId !== storage.id) throw new Error("Box storageId mismatch");

        // 3. Clean up Box
        const deleteBoxDetails = new FormData();
        deleteBoxDetails.append("id", box.id);
        try {
            await deleteBox(deleteBoxDetails);
        } catch (e) { }
        log("Box deleted");

        // 4. Clean up Storage
        const deleteStorageDetails = new FormData();
        deleteStorageDetails.append("id", storage.id);
        try {
            await deleteStorage(deleteStorageDetails);
        } catch (e) { }
        log("Storage deleted");

        log("VERIFICATION SUCCESSFUL");
        return logs;

    } catch (e: any) {
        if (e instanceof Response && e.headers.get("Location") === "/login") {
            log("VERIFICATION FAILED: User not logged in. Please log in first.");
            return logs;
        }
        const msg = e?.message || JSON.stringify(e) || "Unknown Error";
        log(`VERIFICATION FAILED: ${msg}`);
        console.error("Verification Error:", e); // Add server-side logging
        return logs;
    }
}, "verifyPersistence");

export default function Verify() {
    const run = useAction(verifyPersistence);
    const [logs, setLogs] = createSignal<string[]>([]);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Verification</h1>
            <button
                id="run-verify"
                onClick={async () => {
                    setLogs(["Running..."]);
                    const result = await run();
                    setLogs(result || ["No logs"]);
                }}
                style={{ padding: "10px", "background-color": "blue", color: "white" }}
            >
                Run Verification
            </button>

            <pre id="verify-logs" style={{ "background-color": "#f0f0f0", padding: "10px", margin: "10px 0" }}>
                {logs().join("\n")}
            </pre>
        </div>
    );
}
