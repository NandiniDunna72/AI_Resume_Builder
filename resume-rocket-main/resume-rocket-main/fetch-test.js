const apiKey = "AIzaSyAAXwtYGrgG3o_G_N_sMyATYdl9Kv-ck8A";
async function x() {
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
  console.log(r.status);
  const data = await r.json();
  console.log(data.models.map(m => m.name).join(", "));
}
x();
