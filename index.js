import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import NodeCache from "node-cache";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import cors from "cors";

dayjs.extend(relativeTime);
dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 30 });

function stripDiscordMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/_(.*?)_/g, "$1")
        .replace(/~~(.*?)~~/g, "$1")
        .trim();
}

function parseDiscordMessage(message) {
    if (message.type !== 0) return null;

    const content = message.content.trim();
    if (!content) return null;

    const cleaned = stripDiscordMarkdown(content);

    const match = cleaned.match(/^\[(.+?)\]\s+(.*)/);
    if (!match || match.length != 3) return null;

    const type = match[1].trim();
    const title = match[2].split("\n")[0].trim();
    const date = dayjs(message.timestamp).fromNow();
    const link = `https://discord.com/channels/${process.env.DISCORD_GUILD_ID}/${message.channel_id}/${message.id}`;

    return { type, title, date, link };
}

app.get("/launcher/news", async (req, res) => {
    try {
        const cachedNews = cache.get("news");
        if (cachedNews) {
            return res.json(cachedNews);
        }

        const { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, DISCORD_FETCH_LIMIT } = process.env;

        const response = await axios.get(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages?limit=${DISCORD_FETCH_LIMIT}`, {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`
            }
        });

        const news = response.data.map((msg) => parseDiscordMessage(msg)).filter(Boolean);

        cache.set("news", news);

        res.json(news);
    } catch (error) {
        console.error("Error fetching Discord news:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
