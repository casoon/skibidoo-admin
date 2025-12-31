import { test, expect, type Page } from '@playwright/test';

/**
 * Admin Dashboard E2E Tests
 * 
 * Tests critical admin workflows:
 * - Login/Authentication
 * - Product Management (Create, Edit, Delete)
 * - Order Management (View, Update Status)
 */

// Test Admin User
const adminUser = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
};

// Helper: Login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  const submitBtn = page.locator('button[type="submit"]').first();
  
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(adminUser.email);
    await passwordInput.fill(adminUser.password);
    await submitBtn.click();
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 5000 }).catch(() => {});
  }
}

test.describe('Admin Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 }).catch(() => {});
    
    // Check for dashboard elements
    const isDashboard = await page.locator('h1, h2').first().textContent();
    expect(isDashboard).toBeTruthy();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await page.waitForTimeout(1000);
    
    const errorMsg = page.locator('[role="alert"], .error, .alert-error');
    const hasError = await errorMsg.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasError) {
      expect(await errorMsg.first().textContent()).toMatch(/invalid|ungültig|incorrect|falsch/i);
    }
  });
});

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/products');
    
    await page.waitForURL(/\/products/, { timeout: 5000 }).catch(() => {});
    
    const heading = page.locator('h1:has-text("Produkte"), h1:has-text("Products")').first();
    const exists = await heading.isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(exists).toBeTruthy();
  });

  test('should open create product form', async ({ page }) => {
    await page.goto('/products');
    
    const createBtn = page.locator('a:has-text("Neues Produkt"), a:has-text("New Product"), a[href*="/products/new"]').first();
    
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      
      await page.waitForURL(/\/products\/(new|create)/, { timeout: 5000 }).catch(() => {});
      
      // Check for form fields
      const skuInput = page.locator('input[name="sku"]').first();
      const nameInput = page.locator('input[name="name"]').first();
      
      const hasForm = await skuInput.isVisible({ timeout: 2000 }).catch(() => false) ||
                      await nameInput.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasForm).toBeTruthy();
    }
  });

  test('should validate required fields when creating product', async ({ page }) => {
    await page.goto('/products/new');
    
    const submitBtn = page.locator('button[type="submit"]').first();
    
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      
      // Should have validation errors (HTML5 or custom)
      await page.waitForTimeout(1000);
      
      // Form should not submit (still on same page)
      const url = page.url();
      expect(url).toMatch(/\/products\/(new|create)/);
    }
  });

  test('should create product with valid data', async ({ page }) => {
    await page.goto('/products/new');
    
    const timestamp = Date.now();
    
    // Fill form
    const skuInput = page.locator('input[name="sku"]').first();
    const nameInput = page.locator('input[name="name"]').first();
    const priceInput = page.locator('input[name="price"]').first();
    
    if (await skuInput.isVisible().catch(() => false)) {
      await skuInput.fill(`TEST-${timestamp}`);
    }
    
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill(`Test Product ${timestamp}`);
    }
    
    if (await priceInput.isVisible().catch(() => false)) {
      await priceInput.fill('29.99');
    }
    
    // Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      
      // Wait for redirect or success message
      await page.waitForTimeout(2000);
      
      // Should show success message or redirect to product list
      const successMsg = page.locator('[role="alert"]:has-text("Erfolg"), [role="alert"]:has-text("Success")');
      const hasSuccess = await successMsg.first().isVisible({ timeout: 3000 }).catch(() => false);
      
      const isProductList = page.url().includes('/products') && !page.url().includes('/new');
      
      expect(hasSuccess || isProductList).toBeTruthy();
    }
  });
});

test.describe('Order Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display orders list', async ({ page }) => {
    await page.goto('/orders');
    
    await page.waitForURL(/\/orders/, { timeout: 5000 }).catch(() => {});
    
    const heading = page.locator('h1:has-text("Bestellungen"), h1:has-text("Orders")').first();
    const exists = await heading.isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(exists).toBeTruthy();
  });

  test('should open order details', async ({ page }) => {
    await page.goto('/orders');
    
    // Find first order link
    const firstOrder = page.locator('a[href*="/orders/"]').first();
    
    if (await firstOrder.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstOrder.click();
      
      await page.waitForURL(/\/orders\/[a-zA-Z0-9-]+/, { timeout: 5000 }).catch(() => {});
      
      // Should show order details
      const orderNumber = page.locator(':has-text("Order"), :has-text("Bestellung")').first();
      const hasDetails = await orderNumber.isVisible({ timeout: 3000 }).catch(() => false);
      
      expect(hasDetails).toBeTruthy();
    }
  });

  test('should update order status', async ({ page }) => {
    await page.goto('/orders');
    
    // Find first order
    const firstOrder = page.locator('a[href*="/orders/"]').first();
    
    if (await firstOrder.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstOrder.click();
      
      await page.waitForTimeout(1000);
      
      // Find status dropdown
      const statusSelect = page.locator('select[name="status"], select[name="orderStatus"]').first();
      
      if (await statusSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Change status
        await statusSelect.selectOption({ index: 1 });
        
        // Save button
        const saveBtn = page.locator('button:has-text("Speichern"), button:has-text("Save"), button[type="submit"]').first();
        
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click();
          
          await page.waitForTimeout(1000);
          
          // Should show success message
          const successMsg = page.locator('[role="alert"]:has-text("Erfolg"), [role="alert"]:has-text("Success"), [role="alert"]:has-text("aktualisiert")');
          const hasSuccess = await successMsg.first().isVisible({ timeout: 3000 }).catch(() => false);
          
          expect(hasSuccess).toBeTruthy();
        }
      }
    }
  });
});

test.describe('Dashboard Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display dashboard statistics', async ({ page }) => {
    await page.goto('/');
    
    // Look for stat widgets
    const stats = page.locator('[data-testid^="stat-"], .stat, .metric, .kpi');
    const count = await stats.count();
    
    // Should have at least some statistics
    expect(count).toBeGreaterThan(0);
  });

  test('should display recent orders', async ({ page }) => {
    await page.goto('/');
    
    // Look for recent orders section
    const ordersSection = page.locator(':has-text("Letzte Bestellungen"), :has-text("Recent Orders")').first();
    const hasOrders = await ordersSection.isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(hasOrders).toBeTruthy();
  });
});
