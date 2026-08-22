import { initAppwrite } from "../config/appwrite.js";

const jsonResponse = (status, data) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

// Register a user
export const userRegister = async (body) => {
    const { account } = initAppwrite() || {};

    if (!account) return jsonResponse(500, { error: "Appwrite not configured." });

    const { email, password } = body;
    if (!email || !password) return jsonResponse(400, { error: "Email and password are required." });

    try {
        const user = await account.create(window.Appwrite.ID.unique(), email, password, email.split('@')[0]);
        return jsonResponse(201, { id: user.$id, email: user.email });
    } catch (error) {
        if (error.code === 409) return jsonResponse(409, { error: "An account with that email already exists." });
        return jsonResponse(error.code || 400, { error: error.message });
    }
};

// Login a user
export const userLogin = async (body) => {
    const { account } = initAppwrite() || {};
    if (!account) return jsonResponse(500, { error: "Appwrite not configured." });

    const { email, password } = body;
    const GENERIC_ERROR = { error: "Invalid email or password." };

    try {
        if (account.createEmailPasswordSession) await account.createEmailPasswordSession(email, password);
        else await account.createEmailSession(email, password);

        const user = await account.get();
        return jsonResponse(200, { user: { id: user.$id, email: user.email } });
    } catch (error) {
        return jsonResponse(401, GENERIC_ERROR);
    }
};

// Logout a user
export const userMe = async () => {
    const { account } = initAppwrite() || {};
    if (!account) return jsonResponse(401, { error: "Not authenticated" });

    try {
        const user = await account.get();
        const prefs = await account.getPrefs();
        const profile = (prefs && prefs.fullName) ? prefs : {
            fullName: user.name || "",
            displayName: user.name || user.email.split("@")[0],
            bio: prefs?.bio || "",
            createdAt: user.$createdAt,
            role: "user"
        };
        return jsonResponse(200, { id: user.$id, email: user.email, profile });
    } catch (error) {
        return jsonResponse(401, { error: "Not authenticated" });
    }
};

// Provide user profile data
export const userLogout = async () => {
    const { account } = initAppwrite() || {};
    if (account) {
        try {
            await account.deleteSession("current");
        } catch (error) { }
    }
    return jsonResponse(200, { message: "Logged out" });
};