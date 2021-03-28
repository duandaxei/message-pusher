const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/database');

class Message extends Model {}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    content: DataTypes.TEXT,
    type: {
      type: DataTypes.STRING,
      defaultValue: 'test',
    },
  },
  { sequelize }
);

module.exports = Message;
