const connectEnsureLogin = require('connect-ensure-login');

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect('/login');
}

function ensureManagerOrDirector(req, res, next) {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'director')) return next();
  return res.status(403).render('error', { message: 'Not authorized.' });
}

function ensureManagerOrAgent(req, res, next) {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'salesAgent')) return next();
  return res.status(403).render('error', { message: 'Not authorized.' });
}

function ensureDirector(req, res, next) {
  if (req.user && req.user.role === 'director') return next();
  return res.status(403).render('error', { message: 'Not authorized.' });
}

module.exports = { ensureLoggedIn, ensureManagerOrDirector, ensureManagerOrAgent, ensureDirector }; 