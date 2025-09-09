// MongoDB Shell Script to Make User Admin
// Run this in MongoDB shell or MongoDB Compass

// Method 1: Make user admin by email
// Replace 'user@example.com' with the actual email
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      role: "admin",
      "features.canAccessAdmin": true
    }
  }
);

// Method 2: Make user admin by username
// Replace 'username' with the actual username
db.users.updateOne(
  { username: "username" },
  { 
    $set: { 
      role: "admin",
      "features.canAccessAdmin": true
    }
  }
);

// Method 3: Make user admin by ObjectId
// Replace 'USER_ID_HERE' with the actual MongoDB ObjectId
db.users.updateOne(
  { _id: ObjectId("USER_ID_HERE") },
  { 
    $set: { 
      role: "admin",
      "features.canAccessAdmin": true
    }
  }
);

// Method 4: List all users to find the one you want
db.users.find({}, { username: 1, email: 1, role: 1, subscription: 1, createdAt: 1 }).sort({ createdAt: -1 });

// Method 5: Find a specific user by email
db.users.findOne({ email: "user@example.com" });

// Method 6: Find a specific user by username
db.users.findOne({ username: "username" });

// Method 7: Remove admin role (make user regular user)
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      role: "user",
      "features.canAccessAdmin": false
    }
  }
);

// Method 8: List all admin users
db.users.find({ role: "admin" }, { username: 1, email: 1, role: 1, createdAt: 1 });

// Method 9: Count total users and admin users
print("Total users:", db.users.countDocuments());
print("Admin users:", db.users.countDocuments({ role: "admin" }));
print("Regular users:", db.users.countDocuments({ role: "user" }));
