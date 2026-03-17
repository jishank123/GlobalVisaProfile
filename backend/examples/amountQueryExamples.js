/**
 * Examples of how to handle queries with encrypted amounts
 * Since amounts are now encrypted, database-level queries won't work
 * Here are practical solutions for common scenarios
 */

const Payment = require('../models/Payment');
const Project = require('../models/Project');

// ❌ THESE WON'T WORK (amounts are encrypted)
async function brokenQueries() {
  // These will return incorrect results because amounts are encrypted
  const highValuePayments = await Payment.find({ amount: { $gte: 1000 } }); // ❌ Won't work
  const totalRevenue = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]); // ❌ Won't work
  const sortedByAmount = await Payment.find().sort({ amount: -1 }); // ❌ Won't work
}

// ✅ THESE WILL WORK (application-level filtering)
async function workingQueries() {
  
  // 1. Filter high-value payments (fetch all, filter in application)
  async function getHighValuePayments(minAmount = 1000) {
    const allPayments = await Payment.find({});
    return allPayments.filter(payment => payment.amount >= minAmount);
  }

  // 2. Calculate total revenue (fetch all, sum in application)
  async function getTotalRevenue() {
    const allPayments = await Payment.find({ status: 'completed' });
    return allPayments.reduce((total, payment) => total + payment.amount, 0);
  }

  // 3. Sort payments by amount (fetch all, sort in application)
  async function getPaymentsSortedByAmount() {
    const allPayments = await Payment.find({});
    return allPayments.sort((a, b) => b.amount - a.amount);
  }

  // 4. Get payments in amount range
  async function getPaymentsInRange(minAmount, maxAmount) {
    const allPayments = await Payment.find({});
    return allPayments.filter(payment => 
      payment.amount >= minAmount && payment.amount <= maxAmount
    );
  }

  // 5. Group payments by amount ranges
  async function groupPaymentsByAmountRange() {
    const allPayments = await Payment.find({});
    
    const ranges = {
      small: [],    // < 500
      medium: [],   // 500-2000
      large: []     // > 2000
    };

    allPayments.forEach(payment => {
      if (payment.amount < 500) {
        ranges.small.push(payment);
      } else if (payment.amount <= 2000) {
        ranges.medium.push(payment);
      } else {
        ranges.large.push(payment);
      }
    });

    return ranges;
  }

  return {
    getHighValuePayments,
    getTotalRevenue,
    getPaymentsSortedByAmount,
    getPaymentsInRange,
    groupPaymentsByAmountRange
  };
}

// ✅ OPTIMIZED APPROACHES (for better performance)
async function optimizedQueries() {
  
  // 1. Use pagination to limit data fetching
  async function getHighValuePaymentsPaginated(minAmount = 1000, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const payments = await Payment.find({}).skip(skip).limit(limit * 2); // Fetch extra to account for filtering
    
    const filtered = payments.filter(payment => payment.amount >= minAmount);
    return filtered.slice(0, limit);
  }

  // 2. Cache frequently accessed calculations
  let revenueCache = null;
  let cacheExpiry = null;
  
  async function getCachedTotalRevenue() {
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    if (revenueCache && cacheExpiry && now < cacheExpiry) {
      return revenueCache;
    }
    
    const allPayments = await Payment.find({ status: 'completed' });
    revenueCache = allPayments.reduce((total, payment) => total + payment.amount, 0);
    cacheExpiry = now + CACHE_DURATION;
    
    return revenueCache;
  }

  // 3. Use non-encrypted fields for initial filtering
  async function getRecentHighValuePayments(minAmount = 1000, days = 30) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    // First filter by date (not encrypted), then by amount (encrypted)
    const recentPayments = await Payment.find({
      createdAt: { $gte: dateThreshold }
    });
    
    return recentPayments.filter(payment => payment.amount >= minAmount);
  }

  return {
    getHighValuePaymentsPaginated,
    getCachedTotalRevenue,
    getRecentHighValuePayments
  };
}

// ✅ DASHBOARD ANALYTICS (practical examples)
async function dashboardAnalytics() {
  
  // Revenue analytics
  async function getRevenueAnalytics() {
    const allPayments = await Payment.find({ status: 'completed' });
    
    const analytics = {
      totalRevenue: 0,
      averagePayment: 0,
      paymentCount: allPayments.length,
      highValueCount: 0,
      revenueByMonth: {}
    };

    allPayments.forEach(payment => {
      analytics.totalRevenue += payment.amount;
      
      if (payment.amount >= 1000) {
        analytics.highValueCount++;
      }
      
      const month = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM
      analytics.revenueByMonth[month] = (analytics.revenueByMonth[month] || 0) + payment.amount;
    });

    analytics.averagePayment = analytics.totalRevenue / analytics.paymentCount;
    
    return analytics;
  }

  // Project value analytics
  async function getProjectValueAnalytics() {
    const allProjects = await Project.find({});
    
    const analytics = {
      totalValue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      averageProjectValue: 0,
      projectCount: allProjects.length
    };

    allProjects.forEach(project => {
      analytics.totalValue += project.amount;
      analytics.totalPaid += project.paid_amount || 0;
      analytics.totalOutstanding += (project.amount - (project.paid_amount || 0));
    });

    analytics.averageProjectValue = analytics.totalValue / analytics.projectCount;
    
    return analytics;
  }

  return {
    getRevenueAnalytics,
    getProjectValueAnalytics
  };
}

module.exports = {
  workingQueries,
  optimizedQueries,
  dashboardAnalytics
};

/**
 * USAGE EXAMPLES:
 * 
 * const { workingQueries } = require('./amountQueryExamples');
 * const queries = await workingQueries();
 * 
 * // Get high value payments
 * const highValuePayments = await queries.getHighValuePayments(1500);
 * 
 * // Get total revenue
 * const totalRevenue = await queries.getTotalRevenue();
 * 
 * // Get payments sorted by amount
 * const sortedPayments = await queries.getPaymentsSortedByAmount();
 */