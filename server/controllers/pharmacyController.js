const db = require("../config/db");

// Get all medicines
const getMedicines = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM medicines ORDER BY created_at DESC;"
    );
    res.status(200).json({ medicines: result.rows });
  } catch (error) {
    console.error("[Pharmacy Fetch Error]:", error);
    res.status(500).json({ error: "Failed to fetch pharmacy inventory" });
  }
};

// Add new medicine
const addMedicine = async (req, res) => {
  const { name, category, stock_quantity, unit_price, expiry_date } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO medicines (name, category, stock_quantity, unit_price, expiry_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [name, category, stock_quantity, unit_price, expiry_date]
    );
    res.status(201).json({ medicine: result.rows[0] });
  } catch (error) {
    console.error("[Pharmacy Add Error]:", error);
    res.status(500).json({ error: "Failed to add medicine" });
  }
};

// Update medicine stock/price
const updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, category, stock_quantity, unit_price, expiry_date } = req.body;
  try {
    const result = await db.query(
      `UPDATE medicines 
       SET name = $1, category = $2, stock_quantity = $3, unit_price = $4, expiry_date = $5
       WHERE id = $6 RETURNING *;`,
      [name, category, stock_quantity, unit_price, expiry_date, id]
    );
    res.status(200).json({ medicine: result.rows[0] });
  } catch (error) {
    console.error("[Pharmacy Update Error]:", error);
    res.status(500).json({ error: "Failed to update medicine" });
  }
};

// Delete medicine
const deleteMedicine = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM medicines WHERE id = $1;", [id]);
    res.status(200).json({ message: "Medicine removed successfully" });
  } catch (error) {
    console.error("[Pharmacy Delete Error]:", error);
    res.status(500).json({ error: "Failed to delete medicine" });
  }
};

module.exports = {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
};