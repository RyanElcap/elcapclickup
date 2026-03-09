export default async function handler(req, res) {
    const TEAM_ID = "20400171";
    const TOKEN = process.env.CLICKUP_TOKEN;
  
    if (!TOKEN) {
      return res.status(500).json({ error: "Missing token" });
    }
  
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  
    // ←←← THIS IS THE IMPORTANT LINE ←←←
    // assignee=0 = ALL team members (works if your token belongs to a Workspace Owner/Admin)
    const url = `https://api.clickup.com/api/v2/team/${TEAM_ID}/time_entries?start_date=${start}&end_date=${end}&assignee=0&include_task_ids=true`;
  
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
  
      if (!response.ok) {
        const errText = await response.text();
        console.error("ClickUp API error:", response.status, errText);
        return res.status(response.status).json({ error: `ClickUp returned ${response.status}` });
      }
  
      const data = await response.json();
      console.log("✅ Full ClickUp response received →", JSON.stringify(data).slice(0, 500) + "...");
  
      let totalMs = 0;
      const entries = data.data || [];
      
      entries.forEach(entry => {
        totalMs += Number(entry.duration) || 0;
      });
  
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({ 
        totalMs,
        totalHours: (totalMs / 3600000).toFixed(2),
        entryCount: entries.length,
        message: entries.length === 0 ? "No time entries found (check assignee or dates)" : `${entries.length} time entries found`
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: error.message });
    }
  }