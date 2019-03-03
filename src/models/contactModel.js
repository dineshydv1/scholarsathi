module.exports = (sequelize, Sequelize) => {
    const ContactSchema = sequelize.define('Contact', {
        first_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        last_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        mobile: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        subject: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
    });
    return ContactSchema;
}
