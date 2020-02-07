const Sequelize = require('sequelize');

const Message = {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    from:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    to:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    msg:{
        type:Sequelize.STRING,
    },
    isread:{
        type:Sequelize.INTEGER
    },
    time:{
        type:Sequelize.DATE
    }
};

module.exports = Message;
