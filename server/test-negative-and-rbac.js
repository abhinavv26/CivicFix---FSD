require('dotenv').config();
const http = require('http');

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runNegativeAndRBACTests = async () => {
  console.log('\n===============================================================');
  console.log('🔒 CIVICFIX COMPREHENSIVE SECURITY, RBAC & VALIDATION TEST SUITE');
  console.log('===============================================================\n');

  let results = [];
  const record = (testName, expectedStatus, actualStatus, pass, details = '') => {
    results.push({ testName, expectedStatus, actualStatus, pass, details });
    const mark = pass ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | [${actualStatus}] ${testName} ${details ? `(${details})` : ''}`);
  };

  // Helper logins
  const adminLogin = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@civicfix.com', password: 'Admin@123' }
  );
  const adminToken = adminLogin.body.data?.token;

  const staffLogin = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'staff@civicfix.com', password: 'Staff@123' }
  );
  const staffToken = staffLogin.body.data?.token;
  const staffId = staffLogin.body.data?.user?.id;

  const citizenLogin = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'citizen@civicfix.com', password: 'Citizen@123' }
  );
  const citizenToken = citizenLogin.body.data?.token;
  const citizenId = citizenLogin.body.data?.user?.id;

  // 1. Auth: Invalid Password
  const badPassRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'citizen@civicfix.com', password: 'WrongPassword999' }
  );
  record('Auth: Login with incorrect password returns 401', 401, badPassRes.status, badPassRes.status === 401, badPassRes.body.message);

  // 2. Auth: Nonexistent User
  const noUserRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'ghost@civicfix.com', password: 'Password@123' }
  );
  record('Auth: Login with nonexistent email returns 401', 401, noUserRes.status, noUserRes.status === 401, noUserRes.body.message);

  // 3. Auth: Missing Bearer Token
  const noTokenRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/me', method: 'GET' }
  );
  record('Auth: Protected route with no token returns 401', 401, noTokenRes.status, noTokenRes.status === 401, noTokenRes.body.message);

  // 4. Auth: Tampered JWT Token
  const badTokenRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/me', method: 'GET', headers: { Authorization: 'Bearer thisIsAnInvalidBogusToken' } }
  );
  record('Auth: Protected route with invalid JWT token returns 401', 401, badTokenRes.status, badTokenRes.status === 401, badTokenRes.body.message);

  // 5. Validation: Register with invalid email
  const badEmailRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'John Doe', email: 'notanemail', password: 'Password@123', role: 'citizen' }
  );
  record('Validation: Register with malformed email returns 400', 400, badEmailRes.status, badEmailRes.status === 400, badEmailRes.body.message);

  // 6. Validation: Register with short password
  const shortPassRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'John Doe', email: 'john@example.com', password: '123', role: 'citizen' }
  );
  record('Validation: Register with <6 character password returns 400', 400, shortPassRes.status, shortPassRes.status === 400, shortPassRes.body.message);

  // 7. Security: Prevent Admin Self-Registration
  const adminRegRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Hacker', email: 'hacker@example.com', password: 'Password@123', role: 'admin' }
  );
  record('Security: Public registration with admin role is blocked (403)', 403, adminRegRes.status, adminRegRes.status === 403, adminRegRes.body.message);

  // 8. Validation: Prevent Duplicate Email Registration
  const dupEmailRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Aarav Mehta', email: 'citizen@civicfix.com', password: 'Password@123', role: 'citizen' }
  );
  record('Validation: Duplicate email registration returns 409 Conflict', 409, dupEmailRes.status, dupEmailRes.status === 409, dupEmailRes.body.message);

  // 9. Validation: Issue creation missing coordinates and invalid category
  const invalidIssueRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/issues', method: 'POST', headers: { Authorization: `Bearer ${citizenToken}`, 'Content-Type': 'application/json' } },
    { title: 'Bad', category: 'AlienInvasion', description: 'Tiny' }
  );
  record('Validation: Issue creation with invalid category & missing coords returns 400', 400, invalidIssueRes.status, invalidIssueRes.status === 400, invalidIssueRes.body.message);

  // 10. RBAC: Citizen accessing Admin Stats
  const citizenAdminStats = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/admin/stats', method: 'GET', headers: { Authorization: `Bearer ${citizenToken}` } }
  );
  record('RBAC: Citizen accessing /api/v1/admin/stats returns 403 Forbidden', 403, citizenAdminStats.status, citizenAdminStats.status === 403, citizenAdminStats.body.message);

  // 11. RBAC: Staff accessing Admin Users
  const staffAdminUsers = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/admin/users', method: 'GET', headers: { Authorization: `Bearer ${staffToken}` } }
  );
  record('RBAC: Staff accessing /api/v1/admin/users returns 403 Forbidden', 403, staffAdminUsers.status, staffAdminUsers.status === 403, staffAdminUsers.body.message);

  // 12. RBAC: Citizen trying to update staff status
  const citizenUpdateStatus = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/staff/issues/dummyid/status', method: 'PATCH', headers: { Authorization: `Bearer ${citizenToken}`, 'Content-Type': 'application/json' } },
    { status: 'Resolved' }
  );
  record('RBAC: Citizen trying to use staff status update returns 403 Forbidden', 403, citizenUpdateStatus.status, citizenUpdateStatus.status === 403, citizenUpdateStatus.body.message);

  // 13. Create a disposable issue for delete lifecycle testing
  const createDisposableIssue = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/issues', method: 'POST', headers: { Authorization: `Bearer ${citizenToken}`, 'Content-Type': 'application/json' } },
    { title: 'Disposable Trash Issue', category: 'Garbage', description: 'Disposable garbage report for delete testing.', lat: 19.05, lng: 72.83, address: 'Test Lane, Bandra' }
  );
  const disposableIssueId = createDisposableIssue.body.data?._id;

  // 14. Citizen successfully deleting their own issue while still in 'Reported' status
  const deleteReportedRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: `/api/v1/issues/${disposableIssueId}`, method: 'DELETE', headers: { Authorization: `Bearer ${citizenToken}` } }
  );
  record('CRUD & Policy: Citizen can delete their own Reported issue (returns 200)', 200, deleteReportedRes.status, deleteReportedRes.status === 200, deleteReportedRes.body.message);

  // 15. Create another issue and advance to 'In Progress' to test policy: citizen CANNOT delete In Progress issue
  const createIssue2 = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/issues', method: 'POST', headers: { Authorization: `Bearer ${citizenToken}`, 'Content-Type': 'application/json' } },
    { title: 'Permanent Pothole for Deletion Check', category: 'Pothole', description: 'Pothole report that will be assigned and advanced.', lat: 19.05, lng: 72.83, address: 'Test Lane 2' }
  );
  const issue2Id = createIssue2.body.data?._id;

  // Admin assigns it
  await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: `/api/v1/admin/issues/${issue2Id}/assign`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { assignedTo: staffId, note: 'Assign for testing' }
  );

  // Staff updates to 'In Progress'
  await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: `/api/v1/staff/issues/${issue2Id}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${staffToken}`, 'Content-Type': 'application/json' } },
    { status: 'In Progress', note: 'Work started' }
  );

  // Now citizen tries to delete the In-Progress issue -> should return 400
  const citizenDeleteInProgress = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: `/api/v1/issues/${issue2Id}`, method: 'DELETE', headers: { Authorization: `Bearer ${citizenToken}` } }
  );
  record('Policy: Citizen cannot delete an issue that is already In Progress (returns 400)', 400, citizenDeleteInProgress.status, citizenDeleteInProgress.status === 400, citizenDeleteInProgress.body.message);

  // 16. Admin can delete any issue
  const adminDeleteRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: `/api/v1/issues/${issue2Id}`, method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }
  );
  record('CRUD & RBAC: Admin can delete any issue (returns 200)', 200, adminDeleteRes.status, adminDeleteRes.status === 200, adminDeleteRes.body.message);

  // 17. Account Deactivation Lifecycle
  // Admin deactivates citizen
  const deactivateRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: `/api/v1/admin/users/${citizenId}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { isActive: false }
  );
  record('Admin User Mgmt: Deactivate citizen account returns 200', 200, deactivateRes.status, deactivateRes.status === 200, deactivateRes.body.message);

  // Citizen tries to login now -> should return 403
  const deactLoginRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'citizen@civicfix.com', password: 'Citizen@123' }
  );
  record('Security: Deactivated user login returns 403 Forbidden', 403, deactLoginRes.status, deactLoginRes.status === 403, deactLoginRes.body.message);

  // Citizen existing token on protected route -> should return 403
  const deactTokenRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/me', method: 'GET', headers: { Authorization: `Bearer ${citizenToken}` } }
  );
  record('Security: Deactivated user existing token returns 403 Forbidden', 403, deactTokenRes.status, deactTokenRes.status === 403, deactTokenRes.body.message);

  // Re-activate citizen
  const reactivateRes = await makeRequest(
    { hostname: '127.0.0.1', port: 5000, path: `/api/v1/admin/users/${citizenId}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { isActive: true }
  );
  record('Admin User Mgmt: Re-activate citizen account returns 200', 200, reactivateRes.status, reactivateRes.status === 200, reactivateRes.body.message);

  console.log('\n===============================================================');
  const allPassed = results.every((r) => r.pass);
  if (allPassed) {
    console.log(`🎉 ALL ${results.length} EXTENDED SECURITY & VALIDATION TESTS PASSED!`);
  } else {
    console.log(`❌ Some tests failed: ${results.filter((r) => !r.pass).length} failures`);
  }
  console.log('===============================================================\n');

  process.exit(allPassed ? 0 : 1);
};

runNegativeAndRBACTests().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});
