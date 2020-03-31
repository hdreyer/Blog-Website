'use strict';
module.exports = (sequelize, DataTypes) => {
  const posts = sequelize.define('posts', {
    PostId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    PostTitle: DataTypes.STRING,
    PostBody: DataTypes.STRING,
    UserId: {
      type: DataTypes.INTEGER,
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
  posts.associate = function(models) {
    models.posts.belongsTo(models.users,
      {
          foreignKey: 'UserId'
      });    
  };
  return posts;
};