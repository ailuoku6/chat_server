const Sequelize = require('sequelize');

const User = {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    username:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    },
    nickname:{
        type:Sequelize.STRING
    }
};

module.exports = User;
