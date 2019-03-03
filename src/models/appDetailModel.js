module.exports = (sequelize, Sequelize) => {
    const AppDetailSchema = sequelize.define('AppDetail', {
        email: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        mobile: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        facebook: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        twitter: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        linkedin: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        location: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        footer_text: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        tnc: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        welcome_email: {
            type: Sequelize.TEXT,
            allowNull: true,
        }
    }, {
            timestamps: false
        });
    return AppDetailSchema;
}
