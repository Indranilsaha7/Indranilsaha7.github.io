/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Use v2 onCall function
const { setGlobalOptions } = require("firebase-functions/v2");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// IMPORTANT: Storing credentials directly in code is a security risk.
// For production, use Firebase environment configuration by running these commands:
// firebase functions:config:set gmail.email="sahaindranil1984@gmail.com"
// firebase functions:config:set gmail.password="wldjsiwidkfrsxnd"
//
// Then, access them securely:
// const functions = require("firebase-functions");
// const gmailEmail = functions.config().gmail.email;
// const gmailPassword = functions.config().gmail.password;

const nodemailer = require("nodemailer");

// minInstances: 1 keeps the server instance alive 24/7 so the connection never drops
setGlobalOptions({ maxInstances: 10 });

// --- Nodemailer Configuration ---
// IMPORTANT: Use environment variables via a .env file instead of hardcoded credentials
const gmailEmail = process.env.GMAIL_EMAIL;
const gmailPassword = process.env.GMAIL_PASSWORD;

// Create a reusable transporter object. This is created only once per
// container instance, not on every function invocation.
const transporter = nodemailer.createTransport({
    service: "gmail",
    pool: true, // Enables connection pooling so it signs in once and stays connected
    maxConnections: 1, // Limits active connections per instance to avoid Gmail spam blocks
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

/**
 * Generates a modern, responsive HTML email template.
 * @param {string} code The 6-digit verification code.
 * @return {string} The HTML content of the email.
 */
const createEmailTemplate = (code) => {
    const gradientImageUrl = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop";
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" background="${gradientImageUrl}" style="background-image: url('${gradientImageUrl}'); background-size: cover; background-position: center; min-height: 100vh;">
            <tr>
                <td align="center" style="padding: 60px 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: rgba(30, 41, 59, 0.85); border-radius: 24px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">
                        <h1 style="font-size: 2.5rem; font-weight: 600; background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 30px 0;">Baroda Shop1</h1>
                        <div style="font-size: 1.1rem; line-height: 1.6; color: #e2e8f0; text-align: left;">
                            <p>Hello,</p>
                            <p>Thank you for signing up! Please use the verification code below to complete your registration.</p>
                            <div style="background: rgba(15, 23, 42, 0.8); border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                                <p style="margin:0 0 10px 0; color: #94a3b8;">Your verification code is:</p>
                                <h2 style="font-size: 3rem; font-weight: 600; letter-spacing: 10px; color: #c084fc; margin: 0;">${code}</h2>
                            </div>
                            <p>If you did not request this code, you can safely ignore this email.</p>
                        </div>
                        <div style="margin-top: 30px; font-size: 0.9rem; color: #94a3b8;">
                            <p>&copy; ${new Date().getFullYear()} Baroda Shop1. All rights reserved.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
};

/**
 * Generates a welcome HTML email template using a gradient image background.
 * @param {string} fullname The user's full name.
 * @return {string} The HTML content of the email.
 */
const createWelcomeEmailTemplate = (fullname) => {
    // An Unsplash gradient image URL is used here for the background.
    const gradientImageUrl = "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=800&auto=format&fit=crop";
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
        <!-- Using table background for maximum email client compatibility (Outlook/Gmail) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" background="${gradientImageUrl}" style="background-image: url('${gradientImageUrl}'); background-size: cover; background-position: center; min-height: 100vh;">
            <tr>
                <td align="center" style="padding: 60px 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: rgba(30, 41, 59, 0.85); border-radius: 24px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">
                        <div style="margin-bottom: 20px;">
                            <h1 style="font-size: 2.2rem; font-weight: 600; color: #ffffff; margin: 0;">Welcome to Baroda Shop1!</h1>
                        </div>
                        <div style="font-size: 1.1rem; line-height: 1.6; color: #e2e8f0; text-align: left;">
                            <p>Hello ${fullname || 'there'},</p>
                            <p>We are thrilled to have you on board. Your account has been successfully created, and you're now ready to explore the best products at amazing prices!</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://barodashop1.firebaseapp.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: bold;">Start Shopping</a>
                            </div>
                        </div>
                        <div style="margin-top: 30px; font-size: 0.9rem; color: #94a3b8;">
                            <p>&copy; ${new Date().getFullYear()} Baroda Shop1. All rights reserved.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
};

/**
 * Generates a login HTML email template using a gradient image background.
 * @param {string} code The 6-digit verification code.
 * @return {string} The HTML content of the email.
 */
const createLoginEmailTemplate = (code) => {
    const gradientImageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop";
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" background="${gradientImageUrl}" style="background-image: url('${gradientImageUrl}'); background-size: cover; background-position: center; min-height: 100vh;">
            <tr>
                <td align="center" style="padding: 60px 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: rgba(30, 41, 59, 0.85); border-radius: 24px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">
                        <h1 style="font-size: 2.2rem; font-weight: 600; color: #ffffff; margin: 0 0 30px 0;">Secure Login Request</h1>
                        <div style="font-size: 1.1rem; line-height: 1.6; color: #e2e8f0; text-align: left;">
                            <p>Hello,</p>
                            <p>We received a request to log in to your Baroda Shop1 account. Please use the verification code below to securely access your account.</p>
                            <div style="background: rgba(15, 23, 42, 0.8); border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                                <p style="margin:0 0 10px 0; color: #94a3b8;">Your login code is:</p>
                                <h2 style="font-size: 3rem; font-weight: 600; letter-spacing: 10px; color: #10b981; margin: 0;">${code}</h2>
                            </div>
                            <p>If you did not attempt to log in, please secure your account immediately or ignore this email.</p>
                        </div>
                        <div style="margin-top: 30px; font-size: 0.9rem; color: #94a3b8;">
                            <p>&copy; ${new Date().getFullYear()} Baroda Shop1. All rights reserved.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
};

// --- Cloud Function to Send Verification Email ---
exports.sendVerificationCode = onCall(async (request) => {
    const { email, code } = request.data;

    if (!gmailEmail || !gmailPassword) {
        logger.error("Server misconfiguration: GMAIL_EMAIL or GMAIL_PASSWORD is not set in the environment.");
        throw new HttpsError("failed-precondition", "Email service is not configured on the server. Please check environment variables.");
    }

    if (!email || !code) {
        logger.error("Email or code missing from request.", { data: request.data });
        throw new HttpsError("invalid-argument", "The function must be called with 'email' and 'code'.");
    }

    const mailOptions = {
        from: `"Baroda Shop1" <${gmailEmail}>`,
        to: email,
        subject: "Your Baroda Shop1 Verification Code",
        html: createEmailTemplate(code),
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Verification email sent to ${email}`);
        return { success: true, message: `Verification code sent to ${email}` };
    } catch (error) {
        logger.error(`Failed to send email to ${email}`, { error });
        // Throwing 'unknown' instead of 'internal' allows the error message to be visible on the client side 
        // instead of being masked as a generic internal error by Firebase.
        throw new HttpsError("unknown", "Failed to send the verification email. Please check server logs.", error.message);
    }
});

// --- Cloud Function to Send Login Code ---
exports.sendLoginCode = onCall(async (request) => {
    const { email, code } = request.data;

    if (!gmailEmail || !gmailPassword) {
        throw new HttpsError("failed-precondition", "Email service is not configured on the server. Please check environment variables.");
    }

    if (!email || !code) {
        throw new HttpsError("invalid-argument", "The function must be called with 'email' and 'code'.");
    }

    const mailOptions = {
        from: `"Baroda Shop1" <${gmailEmail}>`,
        to: email,
        subject: "Your Baroda Shop1 Login Code",
        html: createLoginEmailTemplate(code),
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Login email sent to ${email}`);
        return { success: true, message: `Login code sent to ${email}` };
    } catch (error) {
        logger.error(`Failed to send login email to ${email}`, { error });
        throw new HttpsError("unknown", "Failed to send the login email. Please check server logs.", error.message);
    }
});

// --- Cloud Function to Send Welcome Email ---
exports.sendWelcomeEmail = onCall(async (request) => {
    const { email, fullname } = request.data;

    if (!gmailEmail || !gmailPassword) {
        throw new HttpsError("failed-precondition", "Email service is not configured on the server. Please check environment variables.");
    }

    if (!email) {
        throw new HttpsError("invalid-argument", "The function must be called with an 'email'.");
    }

    const mailOptions = {
        from: `"Baroda Shop1" <${gmailEmail}>`,
        to: email,
        subject: "Welcome to Baroda Shop1! 🎉",
        html: createWelcomeEmailTemplate(fullname),
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Welcome email sent to ${email}`);
        return { success: true, message: `Welcome email sent to ${email}` };
    } catch (error) {
        logger.error(`Failed to send welcome email to ${email}`, { error });
        throw new HttpsError("unknown", "Failed to send the welcome email.", error.message);
    }
});

const GITHUB_DATA_FILE = 'data.json'; // The file to store the metadata

// Helper function to update the data.json file on GitHub
async function updateGithubDataJson(githubPat, githubRepo, operation, newEntry = null, filenameToRemove = null) {
    const dataApiUrl = `https://api.github.com/repos/${githubRepo}/contents/${GITHUB_DATA_FILE}`;
    
    let fileSha = null;
    let dataList = [];
    
    // 1. Get current data.json
    const getRes = await fetch(dataApiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${githubPat}`,
            'User-Agent': 'Baroda-Shop-Cloud-Function'
        }
    });

    if (getRes.ok) {
        const fileData = await getRes.json();
        fileSha = fileData.sha;
        const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        try {
            dataList = JSON.parse(decodedContent);
        } catch (e) {
            logger.warn("Could not parse data.json, starting fresh.");
        }
    }

    // 2. Modify list
    if (operation === 'add' && newEntry) {
        dataList.push(newEntry);
    } else if (operation === 'remove' && filenameToRemove) {
        dataList = dataList.filter(item => item.filename !== filenameToRemove);
    }

    // 3. Put back data.json
    const updatedContent = Buffer.from(JSON.stringify(dataList, null, 2)).toString('base64');
    const putBody = { message: `Update ${GITHUB_DATA_FILE} (${operation})`, content: updatedContent };
    if (fileSha) putBody.sha = fileSha;

    await fetch(dataApiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${githubPat}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Baroda-Shop-Cloud-Function'
        },
        body: JSON.stringify(putBody)
    });
}

// --- Cloud Function to Upload Image to GitHub ---
exports.uploadImageToGithub = onCall(async (request) => {
    const { base64Data, filename, shopId, sizeBytes } = request.data;

    // Using environment variables for GitHub credentials
    const githubPat = process.env.GITHUB_PAT;
    const githubRepo = process.env.GITHUB_REPO;

    if (!githubPat || !githubRepo) {
        logger.error("Server misconfiguration: GITHUB_PAT or GITHUB_REPO is not set in the environment.");
        throw new HttpsError("failed-precondition", "GitHub credentials are not configured on the server.");
    }

    if (!base64Data || !filename) {
        throw new HttpsError("invalid-argument", "The function must be called with 'base64Data' and 'filename'.");
    }

    try {
        const githubApiUrl = `https://api.github.com/repos/${githubRepo}/contents/${filename}`;
        
        const response = await fetch(githubApiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubPat}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Baroda-Shop-Cloud-Function'
            },
            body: JSON.stringify({
                message: `Upload compressed product image ${filename}`,
                content: base64Data
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`GitHub API Error: ${response.status} - ${errorText}`);
            throw new Error(`GitHub API returned status ${response.status}`);
        }

        const result = await response.json();
        
        // Log metadata in data.json
        try {
            await updateGithubDataJson(githubPat, githubRepo, 'add', {
                shopId: shopId || 'unknown',
                filename: filename,
                url: result.content.download_url,
                size: sizeBytes || 0,
                timestamp: new Date().toISOString()
            });
        } catch (dataErr) {
            logger.error("Failed to update data.json", { dataErr });
        }

        logger.info(`Successfully uploaded image ${filename} to GitHub.`);
        return { downloadUrl: result.content.download_url };
    } catch (error) {
        logger.error("Failed to upload image to GitHub", { error });
        throw new HttpsError("internal", "Failed to upload image to GitHub.", error.message);
    }
});

// --- Cloud Function to Delete Image from GitHub ---
exports.deleteImageFromGithub = onCall(async (request) => {
    const { filename } = request.data;

    const githubPat = process.env.GITHUB_PAT;
    const githubRepo = process.env.GITHUB_REPO;

    if (!githubPat || !githubRepo) {
        logger.error("Server misconfiguration: GITHUB_PAT or GITHUB_REPO is not set in the environment.");
        throw new HttpsError("failed-precondition", "GitHub credentials are not configured on the server.");
    }

    if (!filename) {
        throw new HttpsError("invalid-argument", "The function must be called with 'filename'.");
    }

    try {
        const githubApiUrl = `https://api.github.com/repos/${githubRepo}/contents/${filename}`;
        
        const getResponse = await fetch(githubApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${githubPat}`,
                'User-Agent': 'Baroda-Shop-Cloud-Function'
            }
        });

        if (!getResponse.ok) {
            if (getResponse.status === 404) {
                return { success: true, message: "File not found, possibly already deleted." };
            }
            throw new Error(`GitHub API Error on GET: ${getResponse.statusText}`);
        }

        const fileData = await getResponse.json();
        
        const deleteResponse = await fetch(githubApiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${githubPat}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Baroda-Shop-Cloud-Function'
            },
            body: JSON.stringify({
                message: `Delete product image ${filename}`,
                sha: fileData.sha
            })
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            throw new Error(`GitHub API Error on DELETE: ${deleteResponse.status} - ${errorText}`);
        }
        
        // Remove metadata from data.json
        try {
            await updateGithubDataJson(githubPat, githubRepo, 'remove', null, filename);
        } catch (dataErr) {
            logger.error("Failed to update data.json on delete", { dataErr });
        }

        logger.info(`Successfully deleted image ${filename} from GitHub.`);
        return { success: true };
    } catch (error) {
        logger.error("Failed to delete image from GitHub", { error });
        throw new HttpsError("internal", "Failed to delete image from GitHub.", error.message);
    }
});

// --- Cloud Function to Get Saved Image Data ---
exports.getGithubImagesData = onCall(async (request) => {
    const githubPat = process.env.GITHUB_PAT;
    const githubRepo = process.env.GITHUB_REPO;

    if (!githubPat || !githubRepo) {
        throw new HttpsError("failed-precondition", "GitHub credentials are not configured.");
    }

    try {
        const dataApiUrl = `https://api.github.com/repos/${githubRepo}/contents/${GITHUB_DATA_FILE}`;
        const getRes = await fetch(dataApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${githubPat}`,
                'User-Agent': 'Baroda-Shop-Cloud-Function'
            }
        });

        if (getRes.ok) {
            const fileData = await getRes.json();
            const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
            return JSON.parse(decodedContent);
        } else if (getRes.status === 404) {
            return [];
        } else {
            throw new Error(`GitHub API returned status ${getRes.status}`);
        }
    } catch (error) {
        logger.error("Failed to fetch data.json", { error });
        throw new HttpsError("internal", "Failed to fetch image data.", error.message);
    }
});
