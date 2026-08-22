let client = null;
let account = null;
let databases = null;
let storage = null;

// Appwrite web instances based on input fields
export const getSettings = () => {
    const settings = {
        endpoint: document.getElementById("awEndpoint")?.value || "https://sgp.cloud.appwrite.io/v1",
        projectId: document.getElementById("awProjectId")?.value || "",
        databaseId: document.getElementById("awDatabaseId")?.value || "osdag_db",
        filesCollectionId: document.getElementById("awFilesCollectionId")?.value || "files",
        bucketId: document.getElementById("awBucketId")?.value || "user_files",
    };

    return settings;
}

export function initAppwrite() {
    const { endpoint, projectId } = getSettings();
    const sdk = window.Appwrite;

    if (!sdk) {
        console.error("Appwrite SDK not found! Check that the CDN script tag is present in index.html.");
        return null;
    }

    if (!projectId || projectId === 'YOUR_PROJECT_ID') {
        console.error("Project ID is missing or placeholder! Please type your real Project ID in the input box.");
        return null;
    }

    client = new sdk.Client();
    client.setEndpoint(endpoint).setProject(projectId);
    account = new sdk.Account(client);
    databases = new sdk.Databases(client);
    storage = new sdk.Storage(client);

    return { client, account, databases, storage };
}