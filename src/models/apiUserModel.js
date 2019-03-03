const bcrypt = require('bcryptjs');

module.exports = (sequelize, Sequelize) => {
    const ApiUserSchema = sequelize.define('ApiUser', {
        name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        token: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM,
            values: ['y', 'n'],
            defaultValue: 'y'
        }
    }, {
            hooks: {
                beforeCreate: (data) => {
                    data.token = bcrypt.genSaltSync(8).replace(/[^a-zA-z0-9$]/g, '').slice(-10) + new Date().getTime().toString().slice(-10);
                }
            }
        });
    return ApiUserSchema;
}
