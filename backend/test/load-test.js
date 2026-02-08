const autocannon = require('autocannon');

const baseUrl = process.env.API_URL || 'http://localhost:8001';

// Test configurations
const tests = [
  {
    name: 'Health Check Endpoint',
    url: `${baseUrl}/health`,
    method: 'GET',
    connections: 100,
    duration: 30,
  },
  {
    name: 'Login Endpoint',
    url: `${baseUrl}/usuario/login`,
    method: 'POST',
    connections: 50,
    duration: 30,
    body: JSON.stringify({
      rut: '12345678-9',
      password: 'testpassword',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  },
];

// Run tests sequentially
async function runTests() {
  console.log('🚀 Starting load tests...\n');
  console.log(`Base URL: ${baseUrl}\n`);
  console.log('='.repeat(80));

  for (const test of tests) {
    console.log(`\n📊 Running test: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    console.log(`   Method: ${test.method}`);
    console.log(`   Connections: ${test.connections}`);
    console.log(`   Duration: ${test.duration}s\n`);

    try {
      const result = await runTest(test);
      displayResults(test.name, result);
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
    }

    console.log('='.repeat(80));
  }

  console.log('\n✅ All load tests completed!\n');
}

// Run individual test
function runTest(config) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url: config.url,
        method: config.method,
        connections: config.connections,
        duration: config.duration,
        pipelining: 1,
        body: config.body,
        headers: config.headers || {},
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      },
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

// Display results
function displayResults(testName, result) {
  console.log(`\n📈 Results for: ${testName}`);
  console.log('─'.repeat(80));

  // Request statistics
  console.log('\n📦 Requests:');
  console.log(`   Total:        ${result.requests.total.toLocaleString()}`);
  console.log(`   Average/sec:  ${result.requests.average.toFixed(2)}`);
  console.log(`   Min:          ${result.requests.min}`);
  console.log(`   Max:          ${result.requests.max}`);

  // Throughput statistics
  console.log('\n🚀 Throughput:');
  console.log(`   Average:      ${(result.throughput.mean / 1024 / 1024).toFixed(2)} MB/sec`);
  console.log(`   Total:        ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);

  // Latency statistics
  console.log('\n⏱️  Latency:');
  console.log(`   Average:      ${result.latency.mean.toFixed(2)} ms`);
  console.log(`   Median:       ${result.latency.p50.toFixed(2)} ms`);
  console.log(`   p95:          ${result.latency.p95.toFixed(2)} ms`);
  console.log(`   p99:          ${result.latency.p99.toFixed(2)} ms`);
  console.log(`   Max:          ${result.latency.max.toFixed(2)} ms`);

  // Error statistics
  console.log('\n❌ Errors:');
  console.log(`   Total:        ${result.errors}`);
  console.log(`   Timeouts:     ${result.timeouts}`);
  console.log(`   Non-2xx:      ${result.non2xx || 0}`);

  // Performance verdict
  console.log('\n🎯 Performance Verdict:');
  const avgLatency = result.latency.mean;
  const throughput = result.requests.average;
  const errorRate = (result.errors / result.requests.total) * 100;

  let verdict = '';
  let symbol = '';

  if (avgLatency < 50 && throughput > 1000 && errorRate === 0) {
    verdict = 'Excellent! 🚀';
    symbol = '✅';
  } else if (avgLatency < 100 && throughput > 500 && errorRate < 1) {
    verdict = 'Good 👍';
    symbol = '✅';
  } else if (avgLatency < 200 && throughput > 200 && errorRate < 5) {
    verdict = 'Acceptable ⚠️';
    symbol = '⚠️';
  } else {
    verdict = 'Needs Improvement ❌';
    symbol = '❌';
  }

  console.log(`   ${symbol} ${verdict}`);
  console.log(`   - Latency: ${avgLatency.toFixed(2)}ms (target: <100ms)`);
  console.log(`   - Throughput: ${throughput.toFixed(2)} req/s (target: >1000 req/s)`);
  console.log(`   - Error Rate: ${errorRate.toFixed(2)}% (target: 0%)`);
}

// Run all tests
runTests().catch((error) => {
  console.error('❌ Load test suite failed:', error);
  process.exit(1);
});
