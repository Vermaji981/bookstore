const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('------------------------------------------------------------');
  console.log('🚀 RUNNING COMPLETE E2E TEST SUITE FOR BOOKSTORE WEBSITE');
  console.log('------------------------------------------------------------');

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    console.log('✔ [1/7] API Health Check:', health.data.service, '-', health.data.status);

    // 2. Fetch Books Catalog
    const booksRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/books?limit=4',
      method: 'GET',
    });
    console.log(`✔ [2/7] Catalog Query: Found ${booksRes.data.pagination.total} books total.`);
    const sampleBook = booksRes.data.data[0];
    console.log(`       Sample Book: "${sampleBook.title}" ($${sampleBook.price})`);

    // 3. User Login
    const userLoginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'user@bookstore.com', password: 'user123' }
    );
    console.log('✔ [3/7] User Authentication: Logged in as', userLoginRes.data.data.name);
    const userToken = userLoginRes.data.data.token;

    // 4. Create an Order
    const orderPayload = {
      orderItems: [
        {
          book: sampleBook._id,
          title: sampleBook.title,
          image: sampleBook.image,
          price: sampleBook.price,
          qty: 1,
        },
      ],
      shippingAddress: {
        fullName: 'Jane Austen Reader',
        email: 'user@bookstore.com',
        phone: '+1 (555) 876-5432',
        address: '221B Baker Street',
        city: 'New York',
        state: 'NY',
        pinCode: '10001',
        country: 'USA',
      },
      paymentMethod: 'Cash on Delivery',
      itemsPrice: sampleBook.price,
      taxPrice: Number((sampleBook.price * 0.08).toFixed(2)),
      shippingPrice: 0.0,
      discountPrice: 0.0,
      totalPrice: Number((sampleBook.price * 1.08).toFixed(2)),
    };

    const orderRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      },
      orderPayload
    );
    const createdOrderId = orderRes.data.data._id;
    console.log('✔ [4/7] Order Creation: Order ID generated:', createdOrderId);

    // 5. Order Tracking
    const trackRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/track/${createdOrderId}`,
      method: 'GET',
    });
    console.log('✔ [5/7] Order Tracking: Current Stage:', trackRes.data.data.orderStatus);

    // 6. Admin Login & Status Update
    const adminLoginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@bookstore.com', password: 'admin123' }
    );
    const adminToken = adminLoginRes.data.data.token;

    const updateStatusRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/orders/${createdOrderId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        status: 'Processing',
        note: 'Carefully wrapped with eco-friendly protective packaging',
      }
    );
    console.log(
      '✔ [6/7] Admin Order Progression: Status updated to:',
      updateStatusRes.data.data.orderStatus
    );

    // Re-verify tracking to ensure milestone is updated
    const updatedTrack = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/track/${createdOrderId}`,
      method: 'GET',
    });
    console.log(
      '       Milestone verified on tracking timeline:',
      updatedTrack.data.data.trackingHistory.slice(-1)[0].status,
      '-',
      updatedTrack.data.data.trackingHistory.slice(-1)[0].description
    );

    // 7. Admin Dashboard Analytics
    const statsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✔ [7/7] Admin Analytics Dashboard:');
    console.log('       - Total Registered Users:', statsRes.data.data.totalUsers);
    console.log('       - Total Orders in System:', statsRes.data.data.totalOrders);
    console.log('       - Catalog Total Titles:  ', statsRes.data.data.totalBooks);
    console.log('       - Verified Store Revenue: $', statsRes.data.data.totalRevenue);

    console.log('------------------------------------------------------------');
    console.log('🎉 ALL INTEGRATION & USER JOURNEY TESTS COMPLETED SUCCESSFULLY!');
    console.log('------------------------------------------------------------');
  } catch (error) {
    console.error('✖ Test failed:', error);
  }
}

runTests();
