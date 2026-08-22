import { initAppwrite, getSettings } from "../config/appwrite.js";

const jsonResponse = (status, data) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

// Get all files of the logged in user
export const filesGet = async () => {
    const { account, databases } = initAppwrite() || {};
    const { databaseId, filesCollectionId } = getSettings();
    if (!account || !databases) return jsonResponse(401, { error: "Not authenticated" });

    try {
        const user = await account.get();
        const res = await databases.listDocuments(databaseId, filesCollectionId, [
            window.Appwrite.Query.equal('ownerId', user.$id)
        ]);
        const files = res.documents.map(d => ({
            id: d.$id,
            ownerId: d.ownerId,
            fileName: d.fileName,
            mimeType: d.mimeType,
            sizeBytes: d.sizeBytes,
            uploadedAt: d.uploadedAt
        }));
        return jsonResponse(200, { files });
    } catch (error) {
        if (error.code === 401) return jsonResponse(401, { error: "Not authenticated" });
        return jsonResponse(error.code || 500, { error: error.message });
    }
};

// Get a single file by id of the logged in user
export const filesGetById = async (fileId) => {
    const { account, databases } = initAppwrite() || {};
    const { databaseId, filesCollectionId } = getSettings();
    if (!databases) return jsonResponse(401, { error: "Not authenticated" });

    try {
        const user = await account.get();
        const doc = await databases.getDocument(databaseId, filesCollectionId, fileId);

        if (doc.ownerId !== user.$id) return jsonResponse(403, { error: "You do not have access to this file" });

        return jsonResponse(200, {
            file: {
                id: doc.$id,
                ownerId: doc.ownerId,
                fileName: doc.fileName,
                mimeType: doc.mimeType,
                sizeBytes: doc.sizeBytes,
                uploadedAt: doc.uploadedAt
            }
        });
    } catch (error) {
        if (error.code === 401 || error.code === 403 || error.message?.includes("missing scope"))
            return jsonResponse(403, { error: "You do not have access to this file." });
        if (error.code === 404)
            return jsonResponse(404, { error: "File not found." });

        return jsonResponse(error.code || 500, { error: error.message });
    }
};

// Download a single file by id of the logged in user
export const filesDownloadById = async (fileId) => {
    const { account, databases } = initAppwrite() || {};
    const { databaseId, filesCollectionId } = getSettings();
    if (!databases) return new Response("Not authenticated", { status: 401 });

    try {
        const user = await account.get();
        const doc = await databases.getDocument(databaseId, filesCollectionId, fileId);

        if (doc.ownerId !== user.$id) return new Response("Forbidden", { status: 403 });

        const fakeContent = `This is a mock stand-in for "${doc.fileName}" (${doc.mimeType}, ${doc.sizeBytes} bytes).\nServed from Appwrite backend.`;
        
        return new Response(fakeContent, { status: 200, headers: { "Content-Type": "text/plain" } });
    } catch (error) {
        if (error.code === 404) return new Response("File not found", { status: 404 });

        return new Response(error.message, { status: error.code || 500 });
    }
};