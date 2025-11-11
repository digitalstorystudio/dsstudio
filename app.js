const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qr_tickets', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  qrData: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Redeemed', 'Cancelled'], default: 'Active', index: true },
  createdAt: { type: Date, default: Date.now },
  redeemedAt: { type: Date, default: null },
  redeemedBy: { type: String, default: null },
  meta: {
    eventId: String,
    notes: String,
  }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'validator'], default: 'admin' }
});

const Ticket = mongoose.model('Ticket', ticketSchema);
const User = mongoose.model('User', userSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Utility functions
const generateTicketId = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

const generateSignedPayload = (ticketId) => {
  const payload = Buffer.from(JSON.stringify({ 
    ticketId, 
    iat: Date.now() 
  })).toString('base64');
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback_secret')
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
};

const verifySignedPayload = (signedPayload) => {
  const [payload, signature] = signedPayload.split('.');
  const expectedSignature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback_secret')
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }
  
  return JSON.parse(Buffer.from(payload, 'base64').toString());
};

const generateQR = async (ticketId) => {
  const signedPayload = generateSignedPayload(ticketId);
  const qrBuffer = await qrcode.toBuffer(signedPayload, { 
    width: 300,
    margin: 2 
  });
  return qrBuffer.toString('base64');
};

const sendTicketEmail = async (email, ticketId, qrData) => {
  const qrBuffer = Buffer.from(qrData, 'base64');
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'tickets@example.com',
    to: email,
    subject: 'Your Event Ticket',
    html: `
      <h2>Your Event Ticket</h2>
      <p>Ticket ID: <strong>${ticketId}</strong></p>
      <p>Please show the QR code below at the event entrance:</p>
      <img src="cid:qrcode" alt="QR Code" style="display: block; margin: 20px auto;"/>
      <p>Keep this email safe and bring it to the event.</p>
    `,
    attachments: [{
      filename: 'ticket-qr.png',
      content: qrBuffer,
      cid: 'qrcode'
    }]
  };

  await transporter.sendMail(mailOptions);
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Ticket management routes
app.post('/api/v1/tickets', authenticateToken, async (req, res) => {
  try {
    const { email, eventId = '', quantity = 1 } = req.body;
    const tickets = [];

    for (let i = 0; i < quantity; i++) {
      let ticketId;
      let isUnique = false;
      
      while (!isUnique) {
        ticketId = generateTicketId();
        const existing = await Ticket.findOne({ ticketId });
        if (!existing) isUnique = true;
      }

      const qrData = await generateQR(ticketId);

      const ticket = new Ticket({
        ticketId,
        email,
        qrData,
        meta: { eventId }
      });

      await ticket.save();
      
      try {
        await sendTicketEmail(email, ticketId, qrData);
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }

      tickets.push(ticket);
    }

    res.status(201).json({ 
      message: 'Tickets created successfully',
      tickets: tickets.map(t => ({
        ticketId: t.ticketId,
        email: t.email,
        status: t.status,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Ticket creation failed', error: error.message });
  }
});

app.get('/api/v1/tickets', authenticateToken, async (req, res) => {
  try {
    const { status, email, limit = 50, page = 1 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (email) filter.email = new RegExp(email, 'i');

    const skip = (page - 1) * limit;
    
    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-qrData');

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

app.get('/api/v1/tickets/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
});

app.delete('/api/v1/tickets/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOneAndDelete({ ticketId });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete ticket', error: error.message });
  }
});

app.put('/api/v1/tickets/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, meta } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (meta) updateData.meta = meta;

    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      updateData,
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ticket', error: error.message });
  }
});

// Redemption route
app.post('/api/v1/redeem', async (req, res) => {
  try {
    const { ticketId, qrPayload } = req.body;
    let finalTicketId = ticketId;

    if (qrPayload && !ticketId) {
      try {
        const decoded = verifySignedPayload(qrPayload);
        finalTicketId = decoded.ticketId;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid QR code signature' });
      }
    }

    if (!finalTicketId) {
      return res.status(400).json({ message: 'Ticket ID or QR payload required' });
    }

    const now = new Date();
    const updated = await Ticket.findOneAndUpdate(
      { ticketId: finalTicketId, status: 'Active' },
      { 
        $set: { 
          status: 'Redeemed', 
          redeemedAt: now,
          redeemedBy: req.user ? req.user.username : 'scanner'
        }
      },
      { new: true }
    );

    if (!updated) {
      const ticket = await Ticket.findOne({ ticketId: finalTicketId });
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      return res.status(409).json({ 
        message: 'Ticket already redeemed', 
        redeemedAt: ticket.redeemedAt,
        redeemedBy: ticket.redeemedBy
      });
    }

    res.json({ 
      message: 'Ticket redeemed successfully', 
      ticket: {
        ticketId: updated.ticketId,
        email: updated.email,
        redeemedAt: updated.redeemedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Redemption failed', error: error.message });
  }
});

// Resend email route
app.post('/api/v1/send-email/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await sendTicketEmail(ticket.email, ticket.ticketId, ticket.qrData);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  User.findOne({ username: 'admin' }).then(user => {
    if (!user) {
      bcrypt.hash('admin123', 10).then(hashedPassword => {
        const defaultUser = new User({
          username: 'admin',
          password: hashedPassword,
          role: 'admin'
        });
        defaultUser.save().then(() => {
          console.log('Default admin user created: admin/admin123');
        });
      });
    }
  });
});

module.exports = app;