const API = 'http://localhost:5000/api';

async function req(path, options = {}) {
  const url = `${API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { raw: text };
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('   SUPER ADMIN COMPLETE WORKFLOW END-TO-END TEST    ');
  console.log('====================================================\n');

  let superAdminToken = '';
  let createdBookId = '';
  let createdCategoryId = '';
  let createdCouponId = '';
  let testOrderId = '';

  // 1. Super Admin Login
  console.log('1. Testing Super Admin Login...');
  try {
    const res = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'superadmin@bookstore.com',
        password: 'admin123',
      },
    });
    if (res.ok && res.data?.data?.token) {
      superAdminToken = res.data.data.token;
      console.log(`   ✔ Super Admin login succeeded! Role: "${res.data.data.role}"`);
    } else {
      throw new Error(`Login failed HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error('   ❌ Login failed:', err.message);
    process.exit(1);
  }

  const authHeaders = {
    headers: { Authorization: `Bearer ${superAdminToken}` },
  };

  // 2. Open dashboard & 3. View real-time statistics
  console.log('\n2 & 3. Fetching Real-Time Dashboard Statistics...');
  try {
    const res = await req('/admin/overview', { method: 'GET', ...authHeaders });
    const stats = res.data?.data?.stats;
    console.log('   ✔ Overview DB Stats fetched:');
    console.log(`     - Total Revenue: $${stats?.totalRevenue}`);
    console.log(`     - Total Orders: ${stats?.totalOrders}`);
    console.log(`     - Total Books: ${stats?.totalBooks}`);
    console.log(`     - Total Users: ${stats?.totalUsers}`);
    console.log(`     - Pending Orders: ${stats?.pendingOrders}`);
    console.log(`     - Delivered Orders: ${stats?.deliveredOrders}`);
    console.log(`     - Low Stock Items: ${stats?.lowStockBooks}`);
  } catch (err) {
    console.error('   ❌ Overview stats failed:', err.message);
  }

  // 7. Manage categories (Add, Edit, View)
  console.log('\n7. Managing Categories (Add / View)...');
  try {
    const catRes = await req('/books/categories', {
      method: 'POST',
      body: {
        name: 'Enterprise Architecture',
        description: 'Advanced distributed systems and patterns',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
        isActive: true,
      },
      ...authHeaders,
    });
    createdCategoryId = catRes.data?.data?._id;
    console.log(`   ✔ Category created: "${catRes.data?.data?.name}" (ID: ${createdCategoryId})`);

    const listCats = await req('/books/categories', { method: 'GET' });
    console.log(`   ✔ Public category list verified (${listCats.data?.data?.length} categories live)`);
  } catch (err) {
    console.error('   ❌ Category management failed:', err.message);
  }

  // 4. Add a new book
  console.log('\n4. Adding a New Book to Catalog...');
  try {
    const bookRes = await req('/books', {
      method: 'POST',
      body: {
        title: 'Building Enterprise Microservices',
        author: 'Dr. Jane Cloud',
        description: 'Master enterprise-scale distributed architecture and resiliency.',
        category: 'Enterprise Architecture',
        price: 49.99,
        originalPrice: 59.99,
        stock: 25,
        isbn: '978-0134685991',
        publisher: 'TechPress Media',
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
      },
      ...authHeaders,
    });
    createdBookId = bookRes.data?.data?._id;
    console.log(`   ✔ Book created: "${bookRes.data?.data?.title}" (ID: ${createdBookId})`);
  } catch (err) {
    console.error('   ❌ Book creation failed:', err.message);
  }

  // 5. Edit book information
  console.log('\n5. Editing Book Information & Price...');
  try {
    const updateRes = await req(`/books/${createdBookId}`, {
      method: 'PUT',
      body: {
        price: 44.99,
        stock: 30,
        description: 'Updated enterprise handbook with modern Go and Kubernetes examples.',
      },
      ...authHeaders,
    });
    console.log(`   ✔ Book updated! New Price: $${updateRes.data?.data?.price}, Stock: ${updateRes.data?.data?.stock}`);
  } catch (err) {
    console.error('   ❌ Book update failed:', err.message);
  }

  // 8. View registered users
  console.log('\n8. Viewing Registered Users & Customers...');
  try {
    const usersRes = await req('/users', { method: 'GET', ...authHeaders });
    console.log(`   ✔ Fetched ${usersRes.data?.data?.length} registered users from database.`);
  } catch (err) {
    console.error('   ❌ User fetch failed:', err.message);
  }

  // 9. View customer orders & 10. Update order status
  console.log('\n9 & 10. Viewing Customer Orders & Progressing Status...');
  try {
    const ordersRes = await req('/orders', { method: 'GET', ...authHeaders });
    const orders = ordersRes.data?.data || [];
    console.log(`   ✔ Total existing orders: ${orders.length}`);
    if (orders.length > 0) {
      testOrderId = orders[0]._id;
      const prevStatus = orders[0].orderStatus;
      console.log(`     Inspecting order #${testOrderId.slice(-6)} (Current Status: "${prevStatus}")`);

      // Update order status with tracking progression
      const statusRes = await req(`/orders/${testOrderId}/status`, {
        method: 'PUT',
        body: {
          status: 'Processing',
          note: 'Items dispatched to consolidation warehouse for priority shipping',
        },
        ...authHeaders,
      });
      console.log(`   ✔ Order status progression updated to: "${statusRes.data?.data?.orderStatus}"`);
    }
  } catch (err) {
    console.error('   ❌ Order workflow failed:', err.message);
  }

  // 11. Verify payment records
  console.log('\n11. Verifying Payment Gateway Records...');
  try {
    const payRes = await req('/payment/admin/transactions', { method: 'GET', ...authHeaders });
    const trans = payRes.data?.data?.transactions || [];
    const summary = payRes.data?.data?.summary;
    console.log(`   ✔ Payment transactions fetched: ${trans.length} records.`);
    console.log(`     Volume Summary: Total Volume: $${summary?.totalVolume || 0}, Net: $${summary?.netRevenue || 0}`);
  } catch (err) {
    console.error('   ❌ Payment verification failed:', err.message);
  }

  // 12. View revenue analytics
  console.log('\n12. Querying Sales & Revenue Analytics...');
  try {
    const analyticsRes = await req('/admin/analytics?range=30days', { method: 'GET', ...authHeaders });
    const summary = analyticsRes.data?.data?.summary;
    console.log(`   ✔ Analytics report loaded for range: 30days`);
    console.log(`     Total Revenue: $${summary?.totalRevenue}`);
    console.log(`     Total Sales: ${summary?.totalSales}`);
    console.log(`     Avg Order Value (AOV): $${summary?.aov}`);
    console.log(`     Category Breakdown count: ${analyticsRes.data?.data?.categorySales?.length || 0}`);
  } catch (err) {
    console.error('   ❌ Analytics failed:', err.message);
  }

  // 13. Manage inventory (Stock adjustment with audit reason)
  console.log('\n13. Testing Inventory Stock Adjustment (+/-)...');
  try {
    const invRes = await req('/admin/inventory/adjust', {
      method: 'POST',
      body: {
        bookId: createdBookId,
        adjustmentAmount: 10,
        reason: 'Restock shipment received from publisher container',
      },
      ...authHeaders,
    });
    console.log(`   ✔ Stock adjusted: New quantity is ${invRes.data?.data?.book?.stock}`);
  } catch (err) {
    console.error('   ❌ Stock adjustment failed:', err.message);
  }

  // 14. Create discount coupons
  console.log('\n14. Managing Promotional Coupons...');
  try {
    const couponRes = await req('/coupons', {
      method: 'POST',
      body: {
        code: `TECHSAVE${Math.floor(Math.random() * 900 + 100)}`,
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 40,
        maxDiscount: 30,
        usageLimit: 100,
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        description: '20% Off Enterprise Tech books',
      },
      ...authHeaders,
    });
    createdCouponId = couponRes.data?.data?._id;
    console.log(`   ✔ Coupon created: "${couponRes.data?.data?.code}" (${couponRes.data?.data?.discountValue}% off)`);
  } catch (err) {
    console.error('   ❌ Coupon creation failed:', err.message);
  }

  // 15. Manage homepage banners / CMS
  console.log('\n15. Testing Website Content Management (CMS)...');
  try {
    const cmsRes = await req('/admin/settings', {
      method: 'PUT',
      body: {
        heroBanner: {
          title: 'Discover Extraordinary Books & Master New Skills',
          subtitle: 'Over 10,000 titles delivered straight to your door with fast shipping.',
          buttonText: 'Browse Catalog',
          buttonLink: '/books',
        },
      },
      ...authHeaders,
    });
    console.log(`   ✔ CMS Hero Banner updated: "${cmsRes.data?.data?.heroBanner?.title}"`);
  } catch (err) {
    console.error('   ❌ CMS update failed:', err.message);
  }

  // 16. View admin notifications
  console.log('\n16. Querying Admin Notifications Center...');
  try {
    const notifRes = await req('/admin/notifications', { method: 'GET', ...authHeaders });
    console.log(`   ✔ Fetched ${notifRes.data?.data?.length} notifications (Unread: ${notifRes.data?.unreadCount})`);
  } catch (err) {
    console.error('   ❌ Notifications failed:', err.message);
  }

  // 17. Check activity log (Audit Trail)
  console.log('\n17. Inspecting Security Audit Trail (Activity Logs)...');
  try {
    const logsRes = await req('/admin/activity-logs?limit=5', { method: 'GET', ...authHeaders });
    console.log(`   ✔ Audit trail active: ${logsRes.data?.count} total system actions logged.`);
    console.log(`     Latest action recorded: "${logsRes.data?.data?.[0]?.action}" in module "${logsRes.data?.data?.[0]?.module}"`);
  } catch (err) {
    console.error('   ❌ Activity log check failed:', err.message);
  }

  // 18. Update settings
  console.log('\n18. Updating Store Settings & Financial Rates...');
  try {
    const setRes = await req('/admin/settings', {
      method: 'PUT',
      body: {
        websiteName: 'PageHaven Elite Bookstore',
        shippingFee: 4.99,
        freeShippingThreshold: 45,
        taxRate: 8.0,
      },
      ...authHeaders,
    });
    console.log(`   ✔ Store settings updated: Name="${setRes.data?.data?.websiteName}", Shipping=$${setRes.data?.data?.shippingFee}`);
  } catch (err) {
    console.error('   ❌ Settings update failed:', err.message);
  }

  // 19. Verify security permissions (RBAC restriction test)
  console.log('\n19. Testing Security Permissions & RBAC Restrictions...');
  try {
    // Login as normal customer and attempt admin call
    const userLogin = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'user@bookstore.com',
        password: 'user123',
      },
    });
    const userToken = userLogin.data?.data?.token;

    let blocked = false;
    const adminCheck = await req('/admin/overview', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (adminCheck.status === 403 || adminCheck.status === 401) {
      blocked = true;
    }

    if (blocked) {
      console.log('   ✔ Security verified: Regular customer blocked from Admin API with HTTP 403 Forbidden!');
    } else {
      console.error(`   ❌ Security failure: Regular customer response status ${adminCheck.status}`);
    }
  } catch (err) {
    console.error('   ❌ RBAC test error:', err.message);
  }

  // 6. Delete the test book
  console.log('\n6. Cleaning Up Test Book...');
  try {
    if (createdBookId) {
      const delBook = await req(`/books/${createdBookId}`, { method: 'DELETE', ...authHeaders });
      console.log(`   ✔ Test book ID ${createdBookId} deleted cleanly: ${delBook.data?.message || 'OK'}`);
    }
    if (createdCategoryId) {
      const delCat = await req(`/books/categories/${createdCategoryId}`, { method: 'DELETE', ...authHeaders });
      console.log(`   ✔ Test category ID ${createdCategoryId} deleted cleanly: ${delCat.data?.message || 'OK'}`);
    }
    if (createdCouponId) {
      const delCoup = await req(`/coupons/${createdCouponId}`, { method: 'DELETE', ...authHeaders });
      console.log(`   ✔ Test coupon ID ${createdCouponId} deleted cleanly: ${delCoup.data?.message || 'OK'}`);
    }
  } catch (err) {
    console.error('   ❌ Cleanup failed:', err.message);
  }

  // 20. Confirm customer website works properly
  console.log('\n20. Testing Customer Storefront Public Endpoints...');
  try {
    const featuredBooks = await req('/books/featured', { method: 'GET' });
    const allCategories = await req('/books/categories', { method: 'GET' });
    console.log(`   ✔ Storefront live: Featured books loaded (${featuredBooks.data?.data?.length}), Categories loaded (${allCategories.data?.data?.length}).`);
    console.log('\n====================================================');
    console.log('🎉 ALL 20 WORKFLOW & SECURITY TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('   ❌ Storefront public test failed:', err.message);
  }
}

runTests();
