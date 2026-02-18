// User authentication handler
const bcrypt = require('bcryptjs');
const { getUsersCollection } = require('./db');

async function registerUser(email, password, fullName) {
  try {
    const users = await getUsersCollection();

    // Check if user already exists
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered. Please try logging in.'
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await users.insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: fullName || '',
      createdAt: new Date(),
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      role: 'user'
    });

    return {
      success: true,
      userId: result.insertedId,
      message: 'Registration successful! You can now log in.'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed'
    };
  }
}

async function loginUser(email, password) {
  try {
    const users = await getUsersCollection();

    // Find user
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return {
        success: false,
        error: 'Email not found. Please register first.'
      };
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return {
        success: false,
        error: 'Incorrect password'
      };
    }

    // Return user data (without password)
    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zip: user.zip
      },
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Login failed'
    };
  }
}

module.exports = {
  registerUser,
  loginUser
};
