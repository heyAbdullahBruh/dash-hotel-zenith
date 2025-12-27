
const HEALTH_ENDPOINTS = [
  { name: "API Server", url: "http://localhost:5000/api/health" },
  { name: "Database", url: "http://localhost:5000/api/health/db" },
  { name: "Frontend", url: "http://localhost:3000" },
];

async function checkHealth() {
  console.log("🚀 Starting health checks...\n");

  const results = await Promise.all(
    HEALTH_ENDPOINTS.map(async (endpoint) => {
      try {
        const start = Date.now();
        const response = await fetch(endpoint.url);
        const end = Date.now();

        return {
          name: endpoint.name,
          status: response.ok ? "✅ Healthy" : "❌ Unhealthy",
          responseTime: `${end - start}ms`,
          statusCode: response.status,
        };
      } catch (error) {
        return {
          name: endpoint.name,
          status: "❌ Error",
          responseTime: "N/A",
          error: error.message,
        };
      }
    })
  );

  console.table(results);

  const unhealthy = results.filter((r) => r.status.includes("❌"));
  if (unhealthy.length > 0) {
    console.log("\n⚠️  Unhealthy services detected!");
    process.exit(1);
  } else {
    console.log("\n✅ All services are healthy!");
    process.exit(0);
  }
}

checkHealth();
