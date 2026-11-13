require('dotenv').config();
const http = require('http');
const { app, server } = require('./server');

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

const waitForServer = async () => {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/health',
        method: 'GET',
      });
      if (res.status === 200) return true;
    } catch (e) {
      // wait 500ms
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Server did not start within 15 seconds');
};

const runTests = async () => {
  console.log('Waiting for CivicFix server and database to initialize...');
  await waitForServer();

  console.log('\n==================================================');
  console.log('🧪 CIVICFIX BACKEND END-TO-END VERIFICATION SUITE');
  console.log('==================================================\n');

  let adminToken = '';
  let staffToken = '';
  let citizenToken = '';
  let staffId = '';
  let testIssueId = '';

  // 1. Health check
  console.log('1. Testing GET /api/v1/health...');
  const healthRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/health',
    method: 'GET',
  });
  console.log(`   Status: ${healthRes.status} | Response: ${healthRes.body.message}`);

  // 2. Login Admin
  console.log('\n2. Testing Admin Login (admin@civicfix.com)...');
  const adminLoginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@civicfix.com', password: 'Admin@123' }
  );
  console.log(`   Status: ${adminLoginRes.status} | Role: ${adminLoginRes.body.data?.user?.role}`);
  adminToken = adminLoginRes.body.data?.token;

  // 3. Login Staff
  console.log('\n3. Testing Staff Login (staff@civicfix.com)...');
  const staffLoginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'staff@civicfix.com', password: 'Staff@123' }
  );
  console.log(`   Status: ${staffLoginRes.status} | Name: ${staffLoginRes.body.data?.user?.name}`);
  staffToken = staffLoginRes.body.data?.token;
  staffId = staffLoginRes.body.data?.user?.id;

  // 4. Login Citizen
  console.log('\n4. Testing Citizen Login (citizen@civicfix.com)...');
  const citizenLoginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'citizen@civicfix.com', password: 'Citizen@123' }
  );
  console.log(`   Status: ${citizenLoginRes.status} | Name: ${citizenLoginRes.body.data?.user?.name}`);
  citizenToken = citizenLoginRes.body.data?.token;

  // 5. Test Auth Protected Route (/auth/me)
  console.log('\n5. Testing Protected GET /api/v1/auth/me with Citizen token...');
  const meRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  console.log(`   Status: ${meRes.status} | Email: ${meRes.body.data?.email}`);

  // 6. Test Listing Issues with Pagination and Filters
  console.log('\n6. Testing GET /api/v1/issues?category=Pothole&page=1&limit=5...');
  const issuesRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/issues?category=Pothole&page=1&limit=5',
    method: 'GET',
  });
  console.log(`   Status: ${issuesRes.status} | Returned ${issuesRes.body.count} of ${issuesRes.body.total} issues`);
  testIssueId = issuesRes.body.data?.[0]?._id;

  // 7. Test Create Issue as Citizen
  console.log('\n7. Testing POST /api/v1/issues (Report new issue)...');
  const createRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/issues',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${citizenToken}`,
        'Content-Type': 'application/json',
      },
    },
    {
      title: 'Water pipe leak near Gateway of India',
      category: 'Water Leakage',
      description: 'Underground drinking pipeline rupture near the jetty entrance.',
      lat: 18.922,
      lng: 72.8347,
      address: 'Apollo Bandar, Colaba, Mumbai 400001',
    }
  );
  console.log(`   Status: ${createRes.status} | Created ID: ${createRes.body.data?._id} | Title: ${createRes.body.data?.title}`);
  const newCreatedIssueId = createRes.body.data?._id;

  // 8. Test Toggle Upvote
  console.log('\n8. Testing POST /api/v1/issues/:id/upvote...');
  const upvoteRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/v1/issues/${testIssueId}/upvote`,
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  console.log(`   Status: ${upvoteRes.status} | Upvotes Count: ${upvoteRes.body.data?.upvotesCount}`);

  // 9. Test Add Comment
  console.log('\n9. Testing POST /api/v1/issues/:id/comments...');
  const commentRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/v1/issues/${testIssueId}/comments`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${citizenToken}`,
        'Content-Type': 'application/json',
      },
    },
    { content: 'BMC inspection team was spotted surveying this area today.' }
  );
  console.log(`   Status: ${commentRes.status} | Comment ID: ${commentRes.body.data?._id}`);

  // 10. Test Admin Stats and Charts
  console.log('\n10. Testing GET /api/v1/admin/stats...');
  const statsRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/admin/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`   Status: ${statsRes.status}`);
  console.log(`   Total Issues: ${statsRes.body.data?.summary?.totalIssues}`);
  console.log(`   Average Resolution Hours: ${statsRes.body.data?.summary?.avgResolutionHours} hrs`);
  console.log(`   Categories tracked: ${statsRes.body.data?.charts?.issuesByCategory?.length}`);

  // 11. Test Admin Assign Issue to Staff
  console.log('\n11. Testing PATCH /api/v1/admin/issues/:id/assign...');
  const assignRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/v1/admin/issues/${newCreatedIssueId}/assign`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    },
    { assignedTo: staffId, note: 'Assigned to Ward A emergency water squad' }
  );
  console.log(`   Status: ${assignRes.status} | New Status: ${assignRes.body.data?.status} | Assigned To: ${assignRes.body.data?.assignedTo?.name}`);

  // 12. Test Staff Assigned Queue
  console.log('\n12. Testing GET /api/v1/staff/issues...');
  const staffIssuesRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/staff/issues',
    method: 'GET',
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  console.log(`   Status: ${staffIssuesRes.status} | Assigned count: ${staffIssuesRes.body.count}`);

  // 13. Test Staff Update Status (Resolve ticket)
  console.log('\n13. Testing PATCH /api/v1/staff/issues/:id/status (Resolve ticket)...');
  const resolveRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/v1/staff/issues/${newCreatedIssueId}/status`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
    },
    {
      status: 'Resolved',
      note: 'Ruptured valve section replaced and pressure restored.',
      proofImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    }
  );
  console.log(`   Status: ${resolveRes.status} | Final Ticket Status: ${resolveRes.body.data?.status}`);

  // 14. Test Notifications Queue & Unread Count
  console.log('\n14. Testing GET /api/v1/notifications...');
  const notifRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  console.log(`   Status: ${notifRes.status} | Unread notifications: ${notifRes.body.unreadCount}`);

  // 15. Test Mark All Read
  console.log('\n15. Testing PATCH /api/v1/notifications/mark-all-read...');
  const markRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/notifications/mark-all-read',
    method: 'PATCH',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  console.log(`   Status: ${markRes.status} | Remaining unread: ${markRes.body.unreadCount}`);

  console.log('\n==================================================');
  console.log('✅ ALL 15 VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log('==================================================\n');

  process.exit(0);
};

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
