// Verify the Groq key and forced tool calling work with the real parse prompt shape.
import { config } from "dotenv"
config()

const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages: [
      { role: "system", content: "Extract data model changes from diffs." },
      {
        role: "user",
        content:
          "--- models/analytics/order_details.sql (modified) ---\n@@ -6,7 +6,6 @@\n     c.cust_last_name,\n-    c.cust_email,\n     c.phone_number,",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "report_change_intents",
          description: "Report structured data model changes",
          parameters: {
            type: "object",
            properties: {
              intents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    entity: { type: "string" },
                    column: { type: "string" },
                    changeType: {
                      type: "string",
                      enum: ["COLUMN_DROPPED", "COLUMN_RENAMED", "COLUMN_ADDED", "TYPE_CHANGED", "LOGIC_CHANGED", "ENTITY_DROPPED"],
                    },
                    detail: { type: "string" },
                  },
                  required: ["entity", "changeType", "detail"],
                },
              },
            },
            required: ["intents"],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "report_change_intents" } },
  }),
})
console.log("status:", res.status)
const json = await res.json()
console.log(json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? JSON.stringify(json).slice(0, 400))
