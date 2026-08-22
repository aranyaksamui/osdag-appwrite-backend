import { Client, Users, Databases, Permission, Role, ID } from "node-appwrite";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);
const databases = new Databases(client);

const DB_ID = process.env.APPWRITE_DATABASE_ID || "osdag_db";
const TABLE_ID = process.env.APPWRITE_TABLE_ID || "files";

const seed = async () => {
    console.log("Starting Appwrite Cloud seeding...");
    const rawData = fs.readFileSync("./seed-data.json", "utf-8");
    const { users: seedUsers } = JSON.parse(rawData);

    for (const u of seedUsers) {
        // Create or ensure user exists in appwrite auth
        try {
            await users.create(u.id, u.email, null, u.password, u.profile.fullName);
            console.log(`Created user: ${u.email} (${u.id})`);
        } catch (err) {
            if (err.code === 409) {
                console.log(`ℹUser ${u.email} already exists, updating profile...`);
            } else {
                console.error(`Error creating user ${u.email}:`, err.message);
            }
        }

        // Save profile in user preferences
        try {
            await users.updatePrefs(u.id, u.profile);
        } catch (err) {
            console.warn(`Could not set prefs for ${u.id}:`, err.message);
        }

        // Seed files with row level security
        for (const f of u.files) {
            try {
                // Assign read and delete permissions only to this specific user
                const permissions = [
                    Permission.read(Role.user(u.id)),
                    Permission.update(Role.user(u.id)),
                    Permission.delete(Role.user(u.id))
                ];

                await databases.createDocument(
                    DB_ID,
                    TABLE_ID,
                    f.id,
                    {
                        fileName: f.fileName,
                        mimeType: f.mimeType,
                        sizeBytes: f.sizeBytes,
                        uploadedAt: f.uploadedAt,
                        ownerId: u.id
                    },
                    permissions
                );
                console.log(`Created file doc: ${f.fileName} (${f.id})`);
            } catch (error) {
                if (error.code === 409) {
                    console.log(`File doc ${f.id} already exists.`);
                } else {
                    console.error(`Error creating file ${f.id}:`, error.message);
                }
            }
        }
    }

    console.log("Appwrite Cloud seeding complete.");
}

seed().catch(console.error);