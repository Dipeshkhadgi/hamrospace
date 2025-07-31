import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value);
        },
        message: "Email must be a valid Gmail address (e.g., user@gmail.com).",
      },
    },
    mobile_No: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && value.toString().length === 10;
        },
        message: "Phone number must be a 10-digit numeric value.",
      },
    },

    dob: {
      type: Date,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    password: {
      type: String,
      required: [true, "Please Enter a password"],
      minlength: [8, "password must be 8 characters long"],
      select: false,
    },

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },


    isActive: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: Number,
    otp_expiry: Date,
    resetPasswordOtp: Number,
    resetPasswordOtpExpiry: Date,
  },
  { timestamps: true }
);

//hashed Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // 1h minutes
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // 7 days
  });
};

//Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save({ validateBeforeSave: false });
};


//resetPasswordToken
// Generate and set reset password OTP
userSchema.methods.findResetPasswordOTP = function () {
  const resetOTP = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);

  this.resetPasswordOtp = resetOTP;
  this.resetPasswordOtpExpiry = expiry;

  return resetOTP;
};

const User = mongoose.model("User", userSchema);
export default User;
