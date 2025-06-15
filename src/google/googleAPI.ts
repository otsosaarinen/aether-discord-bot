import fs from "fs/promises";
import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { fileURLToPath } from "url";
import { sheets_v4 } from "googleapis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
	try {
		const content = await fs.readFile(TOKEN_PATH, "utf-8");
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials) as OAuth2Client;
	} catch {
		return null;
	}
}

async function saveCredentials(client: OAuth2Client): Promise<void> {
	const content = await fs.readFile(CREDENTIALS_PATH, "utf-8");
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: "authorized_user",
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(TOKEN_PATH, payload);
}

export async function authorize(): Promise<OAuth2Client> {
	let client = await loadSavedCredentialsIfExist();
	if (client) return client;

	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});

	if (client.credentials) {
		await saveCredentials(client);
	}

	return client;
}

export async function connectSheet(
	auth: OAuth2Client,
	sheet_id: string,
): Promise<sheets_v4.Schema$ValueRange> {
	const sheets = google.sheets({ version: "v4", auth });

	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: sheet_id,
		range: "A1:A1",
	});

	return res.data;
}

export async function fetchMatches(
	auth: OAuth2Client,
	sheet_id: string,
	range: string,
): Promise<sheets_v4.Schema$ValueRange> {
	const sheets = google.sheets({ version: "v4", auth });

	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: sheet_id,
		range: range,
	});

	return res.data;
}

export async function reschedule(
	auth: OAuth2Client,
	sheet_id: string,
	range: string,
	rowData: (string | null)[],
): Promise<sheets_v4.Schema$UpdateValuesResponse> {
	const sheets = google.sheets({ version: "v4", auth });

	const values = [rowData];

	const res = await sheets.spreadsheets.values.update({
		spreadsheetId: sheet_id,
		range: range,
		valueInputOption: "RAW",
		requestBody: { values },
	});

	return res.data;
}
