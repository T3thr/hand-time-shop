import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  image: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

const LikedProductSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  addedAt: { type: Date, default: Date.now },
});

const PurchaseHistorySchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  purchasedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["pending", "completed", "cancelled"], 
    default: "pending" 
  },
});

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema({
  lineId: { type: String, unique: true, sparse: true }, // For LINE Login
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true }, // Optional for admin
  password: { type: String, select: false }, // For admin only
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },
  avatar: { type: String }, // URL from LINE or custom
  cart: [CartItemSchema],
  likedProducts: [LikedProductSchema],
  purchaseHistory: [PurchaseHistorySchema],
  addresses: [AddressSchema],
  isVerified: { type: Boolean, default: false }, // For admin or future email verification
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password for admin users
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to compare password for admin login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;