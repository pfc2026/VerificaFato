const Log = require('../models/Log');
const Search = require('../models/Search');
const User = require('../models/User');
const Verification = require('../models/Verification');

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getStartOfDay() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function mapAggregate(items, fallbackKey = 'sem valor') {
  return items.map((item) => ({
    label: item._id || fallbackKey,
    total: item.total,
  }));
}

async function summary(req, res, next) {
  try {
    const today = getStartOfDay();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalSearches,
      totalVerifications,
      searchesToday,
      logsToday,
      searchByMode,
      topVerdicts,
      activityByDay,
      recentUsers,
      recentSearches,
      recentLogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ ativo: true }),
      User.countDocuments({ tipo: 'admin' }),
      Search.countDocuments(),
      Verification.countDocuments(),
      Search.countDocuments({ createdAt: { $gte: today } }),
      Log.countDocuments({ createdAt: { $gte: today } }),
      Search.aggregate([
        { $group: { _id: '$modo', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Search.aggregate([
        { $match: { veredito: { $nin: ['', null] } } },
        { $group: { _id: '$veredito', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
      Search.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.find().select('-senha').sort({ createdAt: -1 }).limit(5),
      Search.find()
        .populate('usuario', 'nome email tipo')
        .sort({ createdAt: -1 })
        .limit(5),
      Log.find().sort({ createdAt: -1 }).limit(8),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        cards: {
          totalUsers,
          activeUsers,
          inactiveUsers: Math.max(0, totalUsers - activeUsers),
          adminUsers,
          totalSearches,
          totalVerifications,
          searchesToday,
          logsToday,
        },
        charts: {
          searchByMode: mapAggregate(searchByMode),
          topVerdicts: mapAggregate(topVerdicts, 'sem veredito'),
          activityByDay: activityByDay.map((item) => ({ date: item._id, total: item.total })),
        },
        recent: {
          users: recentUsers,
          searches: recentSearches,
          logs: recentLogs,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listSearches(req, res, next) {
  try {
    const { page = 1, limit = 10, q, modo, veredito } = req.query;
    const filter = {};

    if (modo) filter.modo = modo;
    if (veredito) filter.veredito = { $regex: escapeRegExp(veredito), $options: 'i' };

    if (q) {
      const safeQuery = escapeRegExp(q);
      filter.$or = [
        { texto: { $regex: safeQuery, $options: 'i' } },
        { url: { $regex: safeQuery, $options: 'i' } },
        { cidade: { $regex: safeQuery, $options: 'i' } },
        { categoria: { $regex: safeQuery, $options: 'i' } },
        { veredito: { $regex: safeQuery, $options: 'i' } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [items, totalItems] = await Promise.all([
      Search.find(filter)
        .populate('usuario', 'nome email tipo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Search.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limitNumber)),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, listSearches };
