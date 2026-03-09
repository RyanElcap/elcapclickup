export default async function handler(req, res) {
    const TEAM_ID = "20400171";
    const TOKEN = process.env.CLICKUP_TOKEN;
  
    if (!TOKEN) {
      return res.status(500).json({ error: "Missing token" });
    }
  
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  
    const url = `https://api.clickup.com/api/v2/team/${TEAM_ID}/time_entries?start_date=${start}&end_date=${end}`;
  
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
  
    const data = await response.json();
    let totalMs = 0;
    (data.data || []).forEach(entry => totalMs += entry.duration || 0);
  
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ totalMs });
  }