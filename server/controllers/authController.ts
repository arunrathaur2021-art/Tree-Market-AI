import { Response } from 'express';
import crypto from 'crypto';
import { User, hashPassword } from '../db.js';
import { AuthenticatedRequest, createToken } from '../middleware/auth.js';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role, contactNumber, state, district, pincode } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required registration parameters" });
    }

    if (role !== 'buyer' && role !== 'seller' && role !== 'admin') {
      return res.status(400).json({ error: "Role must be 'buyer', 'seller', or 'admin'" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role,
      contactNumber: contactNumber?.trim() || "",
      state: state?.trim() || "",
      district: district?.trim() || "",
      pincode: pincode?.trim() || ""
    });

    const token = createToken(newUser.id, newUser.role);
    const { passwordHash, ...safeUser } = newUser;

    res.status(201).json({ token, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to register user" });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken(user.id, user.role);
    const { passwordHash, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to login user" });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized session" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch user session" });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized session" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const {
      name,
      contactNumber,
      fullAddress,
      houseNo,
      street,
      landmark,
      village,
      taluka,
      district,
      state,
      pincode,
      country,
      lat,
      lng
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(user.id, {
      ...(name && { name: name.trim() }),
      ...(contactNumber !== undefined && { contactNumber: contactNumber.trim() }),
      ...(fullAddress !== undefined && { fullAddress }),
      ...(houseNo !== undefined && { houseNo }),
      ...(street !== undefined && { street }),
      ...(landmark !== undefined && { landmark }),
      ...(village !== undefined && { village }),
      ...(taluka !== undefined && { taluka }),
      ...(district !== undefined && { district }),
      ...(state !== undefined && { state }),
      ...(pincode !== undefined && { pincode }),
      ...(country !== undefined && { country }),
      ...(lat !== undefined && { lat }),
      ...(lng !== undefined && { lng })
    });

    if (!updatedUser) {
      return res.status(400).json({ error: "Failed to update profile" });
    }

    const { passwordHash, ...safeUser } = updatedUser;
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update user profile" });
  }
};

export const googleLogin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, name, role, googleId } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Google authentication payload is missing parameters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Auto-register google user
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(googleId || crypto.randomUUID()),
        role: role || 'buyer',
        contactNumber: "",
        state: "",
        district: "",
        pincode: ""
      });
    }

    const token = createToken(user.id, user.role);
    const { passwordHash, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: "Google Login failed" });
  }
};
