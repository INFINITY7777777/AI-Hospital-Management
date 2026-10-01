const pool = require("../config/db");

// ==========================================================
// GET ALL SYSTEM PROMPTS
// ==========================================================
const getAllPrompts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (prompt_key) 
          id, prompt_key, title, description, template, variables, is_active, version, updated_at 
       FROM system_prompts 
       ORDER BY prompt_key ASC, version DESC`
    );
    return res.status(200).json({ success: true, prompts: result.rows });
  } catch (err) {
    console.error("Error fetching prompts:", err);
    return res.status(500).json({ error: "Failed to fetch system prompts." });
  }
};

// ==========================================================
// UPDATE OR CREATE PROMPT VERSION
// ==========================================================
const updatePrompt = async (req, res) => {
  // Supports both camelCase and snake_case params
  const promptKey = req.params.promptKey || req.params.key;
  const { title, description, template, variables, isActive } = req.body;

  try {
    // 1. Fetch current max version
    const currentRes = await pool.query(
      "SELECT version FROM system_prompts WHERE prompt_key = $1 ORDER BY version DESC LIMIT 1",
      [promptKey]
    );

    const nextVersion =
      currentRes.rows.length > 0 ? currentRes.rows[0].version + 1 : 1;

    // 2. Insert new record version (or update existing single record)
    const query = `
      INSERT INTO system_prompts (prompt_key, title, description, template, variables, is_active, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (prompt_key) 
      DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          template = EXCLUDED.template,
          variables = EXCLUDED.variables,
          is_active = EXCLUDED.is_active,
          version = system_prompts.version + 1,
          updated_at = NOW()
      RETURNING *;
    `;

    const formattedVariables = Array.isArray(variables)
      ? JSON.stringify(variables)
      : JSON.stringify([]);

    const result = await pool.query(query, [
      promptKey,
      title,
      description,
      template,
      formattedVariables,
      isActive ?? true,
      nextVersion,
    ]);

    return res.status(200).json({ success: true, prompt: result.rows[0] });
  } catch (err) {
    console.error("Error updating prompt:", err);
    return res.status(500).json({ error: "Failed to update prompt template." });
  }
};

// ==========================================================
// UTILITY: FORMAT PROMPT TEMPLATE WITH VARIABLES
// ==========================================================
const getFormattedPrompt = async (promptKey, variableMap = {}, fallbackTemplate = "") => {
  try {
    const res = await pool.query(
      "SELECT template FROM system_prompts WHERE prompt_key = $1 AND is_active = true ORDER BY version DESC LIMIT 1",
      [promptKey]
    );

    let rawTemplate = res.rows.length > 0 ? res.rows[0].template : fallbackTemplate;

    Object.keys(variableMap).forEach((key) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      rawTemplate = rawTemplate.replace(regex, variableMap[key] || "");
    });

    return rawTemplate;
  } catch (err) {
    console.error(`Fallback triggered for prompt key [${promptKey}]:`, err.message);

    let rawTemplate = fallbackTemplate;
    Object.keys(variableMap).forEach((key) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      rawTemplate = rawTemplate.replace(regex, variableMap[key] || "");
    });
    return rawTemplate;
  }
};

// Exporting both naming conventions to eliminate import crashes
module.exports = {
  getAllPrompts,
  getPrompts: getAllPrompts, // Alias for routes expecting getPrompts
  updatePrompt,
  getFormattedPrompt,
};