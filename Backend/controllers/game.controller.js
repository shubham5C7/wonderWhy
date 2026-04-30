// Import PostgreSQL connection pool
const { pool } = require("../config/db");

// Controller to fetch game history
const getHistory = async (req, res) => {
  try {
       // Extract optional roomId from query params
    const { roomId } = req.query; 

   // If roomId is provided fetch all last five games that room or fetch last 5 all games
   const result = roomId ? await pool.query(
    "SELECT * FROM games WHERE room_id = $1 ORDER BY created_at DESC LIMIT 5",
    [roomId]  // parameterized query (prevents SQL injection)
   )
   : await pool.query("SELECT * FROM games ORDER BY created_at DESC LIMIT 5");

      // Send fetched rows as JSON response
    res.json(result.rows);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHistory };