async function post(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Preview
document.getElementById("previewForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    ruleCode: f.ruleCode.value,
    client: { id: f.clientId.value, name: f.clientName.value, email: f.clientEmail.value },
    variables: { amount: f.amount.value }
  };
  try {
    const data = await post("/notifications/preview", payload);
    document.getElementById("previewOut").textContent = JSON.stringify(data, null, 2);
  } catch (err) { document.getElementById("previewOut").textContent = err.message; }
});

// Send
document.getElementById("sendForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    ruleCode: f.ruleCode.value,
    client: { id: f.clientId.value, name: f.clientName.value, email: f.clientEmail.value },
    variables: { amount: f.amount.value }
  };
  try {
    const data = await post("/notifications/send", payload);
    document.getElementById("sendOut").textContent = JSON.stringify(data, null, 2);
  } catch (err) { document.getElementById("sendOut").textContent = err.message; }
});

// Buscar log
document.getElementById("logForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = e.target.logId.value;
  try {
    const data = await get(`/notifications/${id}`);
    document.getElementById("logOut").textContent = JSON.stringify(data, null, 2);
  } catch (err) { document.getElementById("logOut").textContent = err.message; }
});
