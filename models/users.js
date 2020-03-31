'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define(
    'users',
    {
      UserId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      FirstName: DataTypes.STRING,
      LastName: DataTypes.STRING,
      Email: {
        type: DataTypes.STRING,
        unique: true
      },
      Username: {
        type: DataTypes.STRING,
        unique: true
      },
      Password: DataTypes.STRING,
      Admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      Deleted:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdAt: { 
       type: DataTypes.DATE,
       allowNull: false
       },
      updatedAt: { 
        type: DataTypes.DATE,
        allowNull: false
        },
  }, {});
  users.associate = function(models) {
    models.users.hasMany(models.posts, 
      {   
          foreignKey: 'UserId'
      });
  };
  return users;
};