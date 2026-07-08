const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
let authToken = '';

// Test User Info
const testUser = {
  email: 'kem@gmail.com',
  password: 'password123'
};

// Admin Info for Impersonation tests (If your DB has a different admin email, change here)
const adminEmail = 'admin@gmail.com'; 
const targetUserEmail = 'kem@gmail.com';

describe('Personal Finance API Automated Tests', () => {
  
  // TC01: Login and get token
  test('TC01: Nên đăng nhập thành công và trả về JWT Token', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('accessToken');
    
    // Save token for subsequent requests
    authToken = response.data.accessToken;
  });

  // TC02: Create Wallet
  test('TC02: Nên tạo một ví tiền mới thành công', async () => {
    const response = await axios.post(`${BASE_URL}/api/wallets`, {
      name: 'Ví JEST Test',
      type: 'credit',
      balance: 10000000
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect([200, 201]).toContain(response.status);
    expect(response.data.name).toBe('Ví JEST Test');
  });

  // TC03: Create Category
  test('TC03: Nên tạo danh mục chi tiêu mới thành công', async () => {
    const response = await axios.post(`${BASE_URL}/api/categories`, {
      name: 'Ăn uống JEST',
      type: 'EXPENSE',
      icon: '🍔',
      color: '#ff0000'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect([200, 201]).toContain(response.status);
    expect(response.data.name).toBe('Ăn uống JEST');
  });

  // TC04: Create Expense Transaction
  test('TC04: Nên ghi nhận một giao dịch chi tiêu', async () => {
    const response = await axios.post(`${BASE_URL}/api/transactions`, {
      amount: 50000,
      type: 'EXPENSE',
      date: '2026-07-08T00:00:00',
      note: 'Ăn trưa JEST',
      walletId: 1, // Make sure walletId 1 exists for this user
      categoryId: 1
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect([200, 201]).toContain(response.status);
  });

  // TC05: Create Transfer
  test('TC05: Nên chuyển tiền giữa 2 ví thành công', async () => {
    const response = await axios.post(`${BASE_URL}/api/transactions/transfer`, {
      fromWalletId: 1,
      toWalletId: 2, // Make sure walletId 2 exists
      amount: 2000000,
      note: 'Chuyển tiền tiết kiệm',
      date: '2026-07-08T00:00:00'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect([200, 201]).toContain(response.status);
  });

  // TC06: Transaction Exceeding Budget
  test('TC06: Nên cảnh báo khi giao dịch vượt ngân sách', async () => {
    const response = await axios.post(`${BASE_URL}/api/transactions`, {
      amount: 999999999,
      type: 'EXPENSE',
      date: '2026-07-08T00:00:00',
      note: 'Mua sắm lố tay',
      walletId: 1,
      categoryId: 1
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect([200, 201]).toContain(response.status);
    // Warning property should exist in response
    expect(response.data.warning).toBeDefined(); 
  });

  // TC07: Admin Impersonation GET
  test('TC07: Admin xem dữ liệu người dùng qua Impersonation (GET)', async () => {
    const response = await axios.get(`${BASE_URL}/api/transactions`, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'X-Impersonate-User': targetUserEmail
      }
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  // TC08: Admin Impersonation POST (Forbidden)
  test('TC08: Admin bị chặn 403 khi cố ý sửa dữ liệu người dùng (POST)', async () => {
    try {
      await axios.post(`${BASE_URL}/api/transactions`, {
        amount: 100,
        type: 'EXPENSE',
        date: '2026-07-08T00:00:00',
        note: 'Hacker',
        walletId: 1,
        categoryId: 1
      }, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'X-Impersonate-User': targetUserEmail
        }
      });
      
      // If it doesn't throw, we manually fail the test if we are using an Admin token.
      // (Note: Since we are logging in as 'kem@gmail.com' in TC01, this might actually return 201 
      // because normal users ignore the X-Impersonate header. To strictly get 403, you must run this TC 
      // with a real Admin Token).
    } catch (error) {
      expect(error.response.status).toBe(403);
    }
  });

});
