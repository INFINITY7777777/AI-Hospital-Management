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
      [name, category, stock_quantity, unit_price, expiry_date || null]
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
      [name, category, stock_quantity, unit_price, expiry_date || null, id]
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

// Deduct medicine stock for Clinical Notes prescription
const deductStock = async (req, res) => {
  const { medicine_id, quantity } = req.body;
  try {
    const checkStock = await db.query(
      "SELECT stock_quantity FROM medicines WHERE id = $1;",
      [medicine_id]
    );

    if (checkStock.rows.length === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const currentStock = checkStock.rows[0].stock_quantity;
    if (currentStock < quantity) {
      return res.status(400).json({ error: `Insufficient stock! Current stock: ${currentStock}` });
    }

    const result = await db.query(
      `UPDATE medicines 
       SET stock_quantity = stock_quantity - $1 
       WHERE id = $2 RETURNING *;`,
      [quantity, medicine_id]
    );

    res.status(200).json({ 
      message: "Stock deducted successfully", 
      medicine: result.rows[0] 
    });
  } catch (error) {
    console.error("[Pharmacy Deduct Error]:", error);
    res.status(500).json({ error: "Failed to deduct medicine stock" });
  }
};

module.exports = {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  deductStock,
};