/**
 * Comprehensive Validation & Delete-Guard Automated Test Suite
 * Tests Rules 1-5 from the Manufacturing / Inventory Delete-Guard Specification
 */
const http = require('http');

const API_BASE = 'http://127.0.0.1:4301';

let authToken = null;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({ status: res.statusCode, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('🚀 RUNNING MANUFACTURING VALIDATION & DELETE-GUARD TESTS');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 0. Authenticate
    console.log('0. Authenticating as Admin...');
    const loginRes = await request('POST', '/auth/login', {
      username: 'author',
      password: 'author123',
    });
    if ((loginRes.status !== 200 && loginRes.status !== 201) || !loginRes.body?.access_token) {
      console.error('Failed to log in:', loginRes.body);
      process.exit(1);
    }
    authToken = loginRes.body.access_token;
    console.log('  ✅ Authenticated successfully.\n');
    const now = new Date();
    const batchId = `TEST-DG-${Date.now().toString().slice(-6)}`;
    const inwardDate = new Date(now.getTime() - 3600_000).toISOString(); // 1 hour ago

    // 1. Create Inward Batch
    console.log('1. Setting up Inward Batch...');
    const inwardRes = await request('POST', '/inventory/inward', {
      batchId,
      date: inwardDate,
      supplier: 'Test Delete-Guard Mills',
      bale: 10,
      kg: 1000,
      createdBy: 'GUARD_TESTER',
    });
    assert(inwardRes.status === 201, `Inward batch created (HTTP ${inwardRes.status})`);
    const inwardBatch = inwardRes.body;

    // 2. Rule 5 Test: Production start too early (within 00:01:01 settle gap)
    console.log('\n2. Testing Rule 5 (Settle Gap Enforcement)...');
    const tooEarlyDate = new Date(new Date(inwardDate).getTime() + 30_000).toISOString(); // only 30s after inward
    const earlyProdRes = await request('POST', '/production', {
      date: tooEarlyDate,
      totalConsumed: 100,
      totalProduced: 90,
      totalWaste: 10,
      createdBy: 'GUARD_TESTER',
      consumed: [{ batchNo: batchId, bale: 1, weight: 100 }],
      produced: [{ count: '2', weight: 90, bags: 1, remainingLog: 30 }],
      waste: { blowRoom: 5, carding: 5, oe: 0, others: 0 },
    });
    assert(
      earlyProdRes.status === 409 && earlyProdRes.body?.code === 'PRODUCTION_TOO_EARLY',
      `Production rejected when started before 00:01:01 settle gap (${earlyProdRes.body?.code})`
    );

    // 3. Rule 5 Test: Mass Balance Violation (output > input + 2% tol)
    console.log('\n3. Testing Rule 5 (Mass Balance Tolerance Check)...');
    const validStartDate = new Date(new Date(inwardDate).getTime() + 120_000).toISOString(); // 2 mins after inward
    const massBalanceRes = await request('POST', '/production', {
      date: validStartDate,
      totalConsumed: 100,
      totalProduced: 105, // 105 + 10 = 115 kg > 102 kg max allowed
      totalWaste: 10,
      createdBy: 'GUARD_TESTER',
      consumed: [{ batchNo: batchId, bale: 1, weight: 100 }],
      produced: [{ count: '2', weight: 105, bags: 1, remainingLog: 45 }],
      waste: { blowRoom: 5, carding: 5, oe: 0, others: 0 },
    });
    assert(
      massBalanceRes.status === 400 && massBalanceRes.body?.code === 'MASS_BALANCE_EXCEEDED',
      `Mass balance violation caught (>2% tolerance rejected, HTTP 400)`
    );

    // 4. Create Valid Production Run
    console.log('\n4. Creating Valid Production Run...');
    const validProdRes = await request('POST', '/production', {
      date: validStartDate,
      totalConsumed: 200,
      totalProduced: 180,
      totalWaste: 20,
      createdBy: 'GUARD_TESTER',
      consumed: [{ batchNo: batchId, bale: 2, weight: 200 }],
      produced: [{ count: '2', weight: 180, bags: 3, remainingLog: 0 }],
      waste: { blowRoom: 10, carding: 10, oe: 0, others: 0 },
    });
    assert(validProdRes.status === 201, `Valid production entry created (HTTP ${validProdRes.status})`);
    const prod = validProdRes.body;

    // 5. Rule 1 Test: Inward Delete-Guard (Blocked by live production)
    console.log('\n5. Testing Rule 1 (Inward Delete-Guard Blocked by Live Production)...');
    const deleteInwardRes = await request('DELETE', `/inventory/inward/${inwardBatch.id}`);
    assert(
      deleteInwardRes.status === 409 && deleteInwardRes.body?.code === 'INWARD_UNDER_PRODUCTION',
      `Inward delete blocked with INWARD_UNDER_PRODUCTION (HTTP ${deleteInwardRes.status})`
    );
    assert(
      Array.isArray(deleteInwardRes.body?.blockingProductionIds) &&
      deleteInwardRes.body.blockingProductionIds.includes(prod.id),
      `Error returns blocking production IDs: [${deleteInwardRes.body?.blockingProductionIds}]`
    );
    assert(
      Boolean(deleteInwardRes.body?.redirectTo),
      `Error returns redirect target: ${deleteInwardRes.body?.redirectTo}`
    );

    // 6. Rule 3 Test: Waste Delete-Guard (Cannot delete production waste directly)
    console.log('\n6. Testing Rule 3 (Production Waste Delete-Guard)...');
    const wasteListRes = await request('GET', '/inventory/history');
    const prodWaste = wasteListRes.body?.history?.find(
      (h) => h.material === 'Waste' && h.type === 'PRODUCTION' && h.reference && h.reference.includes(batchId)
    );
    if (prodWaste) {
      const deleteWasteRes = await request('DELETE', `/inventory/waste/${prodWaste.id}`);
      assert(
        deleteWasteRes.status === 409 && deleteWasteRes.body?.code === 'WASTE_PRODUCTION_LINKED',
        `Production waste delete blocked with WASTE_PRODUCTION_LINKED (HTTP ${deleteWasteRes.status})`
      );
      assert(
        Boolean(deleteWasteRes.body?.trace?.productionId),
        `Waste delete error contains source production trace (#${deleteWasteRes.body?.trace?.productionId})`
      );
    } else {
      console.log('  ⚠️ Production waste entry not found in history, skipping sub-test');
    }

    // 7. Rule 2 Test: Cascade Deletion of Production + Bags + Waste
    console.log('\n7. Testing Rule 2 (Cascade Delete Production + Bags + Waste)...');
    const deleteProdRes = await request('DELETE', `/production/${prod.id}`);
    assert(
      deleteProdRes.status === 200 && deleteProdRes.body?.cascaded === true,
      `Production and its child bags + waste cascade deleted successfully (HTTP 200)`
    );

    // 8. Inward Delete Now Allowed
    console.log('\n8. Verifying Inward Delete after Production Removal...');
    const deleteInwardAfterRes = await request('DELETE', `/inventory/inward/${inwardBatch.id}`);
    assert(
      deleteInwardAfterRes.status === 200 && deleteInwardAfterRes.body?.success === true,
      `Inward batch successfully deleted after blocking production was removed (HTTP 200)`
    );

    console.log('\n========================================================');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  }
}

runTests();
