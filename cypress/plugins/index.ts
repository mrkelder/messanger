import mongoose from "mongoose";

import User from "src/models/User";

module.exports = (on, config) => {
  on("task", {
    async "db:deleteUser"(userName: string) {
      await mongoose.connect(config.env.mongodb);
      await User.deleteByName(userName);
      await mongoose.disconnect();
      return null;
    }
  });
};
