let client = null;
let account = null;
let databases = null;
let storage = null;

// Appwrite web instances based on input fields
export const getSettings = () => {
    const settings = {
        endpoint: document.getElementById("awEndpoint")?.value || "https://cloud.appwrite.io/v1",
        projectId: document.getElementById("awProjectId")?.value || "",
        databaseId: document.getElementById("awDatabaseId")?.value || "osdag_db",
        filesCollectionId: document.getElementById("awFilesCollectionId")?.value || "files",
        bucketId: document.getElementById("awBucketId")?.value || "user_files",
    };

    return settings;
}

export const initAppwrite = () => {
    const { endpoint, projectId } = getSettings();

    if (!projectId || projectId == "PROJECT_ID") return null;

    if (!client && window.Appwrite) {
        client = new window.Appwrite.Client();
        client.setEndpoint(endpoint).setProject(projectId);
        account = new window.Appwrite.Account(client);
        databases = new window.Appwrite.Databases(client);
        storage = new window.Appwrite.Storage(client);
    }

    return { client, account, databases, storage };
}