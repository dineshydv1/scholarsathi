module.exports = (sequelize, Sequelize) => {
    const UserScholarshipHistory = sequelize.define('UserScholarshipHistory', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        source: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Source is required' },
            }
        },
        year:{
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Year is required' },
            }
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        }
    });

    return UserScholarshipHistory;
}
