const User = require('../models/User');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');

/**
 * Get analytics data for admin dashboard
 * GET /api/admin/analytics
 * Role required: admin or superadmin
 */
const getAnalytics = async (req, res) => {
  try {
    // 1. User signups per day (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const userSignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing dates with 0
    const dateMap = new Map();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }
    userSignups.forEach(item => {
      dateMap.set(item._id, item.count);
    });

    const userGrowthData = Array.from(dateMap.entries()).map(([date, users]) => ({
      date: date.slice(5), // "MM-DD"
      users
    }));

    // 2. Swipe counts per day (last 7 days)
    const swipes = await Swipe.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          swipes: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const swipeMap = new Map();
    swipes.forEach(item => swipeMap.set(item._id, item.swipes));
    const swipeData = Array.from(dateMap.keys()).map(dateStr => ({
      date: dateStr.slice(5),
      swipes: swipeMap.get(dateStr) || 0
    }));

    // 3. Match counts per day
    const matches = await Match.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          matches: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const matchMap = new Map();
    matches.forEach(item => matchMap.set(item._id, item.matches));
    const matchData = Array.from(dateMap.keys()).map(dateStr => ({
      date: dateStr.slice(5),
      matches: matchMap.get(dateStr) || 0
    }));

    // 4. Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const roles = roleDistribution.map(r => ({
      name: r._id === 'superadmin' ? 'SuperAdmin' : r._id.charAt(0).toUpperCase() + r._id.slice(1),
      value: r.count,
      color: r._id === 'superadmin' ? '#ec4899' : r._id === 'admin' ? '#6366f1' : '#10b981'
    }));

    // 5. Total swipes, matches, messages (for bar chart)
    const totalSwipes = await Swipe.countDocuments();
    const totalMatches = await Match.countDocuments();
    const Message = require('../models/Message');
    const totalMessages = await Message.countDocuments();

    const matchSuccessData = [
      { name: 'Swipes', value: totalSwipes },
      { name: 'Matches', value: totalMatches },
      { name: 'Messages', value: totalMessages }
    ];

    res.json({
      success: true,
      data: {
        userGrowth: userGrowthData,
        swipeActivity: swipeData,
        matchActivity: matchData,
        matchSuccess: matchSuccessData,
        roleDistribution: roles
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAnalytics };