const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid municipal credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Return safe user profile
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      ward: user.ward,
      city: user.city || 'Alandi',
      district: user.district || 'Pune',
      state: user.state || 'Maharashtra',
      municipality: user.municipality || 'Alandi Municipal Council'
    };

    res.json({
      success: true,
      message: `Welcome back, ${user.name}`,
      user: safeUser,
      token: `fma-token-${user._id}-${Date.now()}`
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStaffAccounts = async (req, res) => {
  try {
    const users = await User.find({}, '-password').lean();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  getStaffAccounts
};

